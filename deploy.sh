#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Piece of Stass — Cloudflare Workers deploy script
#  Walks you through:
#    1. tooling check (node, npm, wrangler, gh)
#    2. wrangler login
#    3. KV namespaces (CART_KV, USERS_KV, ORDERS_KV, ADMIN_KV) – created if missing
#    4. R2 bucket (pieceofstass-images) – created if missing
#    5. .dev.vars and wrangler secrets — prompts for every value, skips if already set
#    6. build + (optional) image rehost to R2
#    7. deploy to production (or --preview)
#
#  Usage:
#    ./deploy.sh             # full interactive deploy
#    ./deploy.sh --preview   # deploy to preview env only
#    ./deploy.sh --secrets   # rotate/update secrets only, no deploy
#    ./deploy.sh --setup     # provision KV/R2 + secrets, no deploy
#    ./deploy.sh --no-build  # skip npm install + build
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── colors ────────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  C_BOLD=$'\033[1m'; C_DIM=$'\033[2m'; C_RED=$'\033[31m'; C_GRN=$'\033[32m'
  C_YEL=$'\033[33m'; C_BLU=$'\033[34m'; C_CYN=$'\033[36m'; C_RST=$'\033[0m'
else
  C_BOLD=""; C_DIM=""; C_RED=""; C_GRN=""; C_YEL=""; C_BLU=""; C_CYN=""; C_RST=""
fi

say()   { echo "${C_BOLD}${C_CYN}▶${C_RST} ${C_BOLD}$*${C_RST}"; }
ok()    { echo "  ${C_GRN}✓${C_RST} $*"; }
warn()  { echo "  ${C_YEL}!${C_RST} $*"; }
err()   { echo "  ${C_RED}✘${C_RST} $*" >&2; }
hdr()   { echo; echo "${C_BOLD}${C_BLU}══════ $* ══════${C_RST}"; }

# ── parse flags ───────────────────────────────────────────────────────────────
MODE="deploy"     # deploy | preview | secrets | setup
DO_BUILD=1
DO_REHOST=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preview)   MODE="preview"; shift ;;
    --secrets)   MODE="secrets"; shift ;;
    --setup)     MODE="setup"; shift ;;
    --no-build)  DO_BUILD=0; shift ;;
    --rehost-images) DO_REHOST=1; shift ;;
    -h|--help)
      sed -n '2,21p' "$0"; exit 0 ;;
    *) err "Unknown flag: $1"; exit 1 ;;
  esac
done

cd "$(dirname "$0")"
PROJECT_DIR="$PWD"
say "Working in: ${PROJECT_DIR}"

# ── 1. tooling check ──────────────────────────────────────────────────────────
hdr "Tooling check"
need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "$1 not found — please install it first ($2)"; exit 1
  fi
  ok "$1 — $(command -v "$1")"
}
need node    "https://nodejs.org/  (v20+ recommended)"
need npm     "ships with node"
need npx     "ships with npm"
NODE_VER=$(node -v)
ok "node ${NODE_VER}"

if ! command -v wrangler >/dev/null 2>&1; then
  warn "wrangler not on PATH — will use 'npx wrangler' (slower)"
  WRANGLER="npx wrangler"
else
  WRANGLER="wrangler"
  ok "wrangler — $(wrangler --version | head -1)"
fi

# ── 2. wrangler login ─────────────────────────────────────────────────────────
hdr "Cloudflare authentication"
if $WRANGLER whoami 2>/dev/null | grep -q "You are logged in"; then
  ok "Already logged into Cloudflare: $($WRANGLER whoami 2>/dev/null | grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' | head -1 || echo 'authenticated')"
else
  warn "Not logged in. Opening browser for OAuth..."
  $WRANGLER login
fi

# Pull account ID for later
CF_ACCOUNT_ID=$($WRANGLER whoami 2>/dev/null | grep -oE '[a-f0-9]{32}' | head -1 || true)
if [[ -n "$CF_ACCOUNT_ID" ]]; then
  ok "Cloudflare account: ${CF_ACCOUNT_ID}"
fi

# ── 3. KV namespaces ──────────────────────────────────────────────────────────
provision_kv() {
  local name="$1"
  hdr "KV: ${name}"
  if grep -q "binding = \"${name}\"" wrangler.toml 2>/dev/null \
     && grep -A2 "binding = \"${name}\"" wrangler.toml | grep -q "id = \"[a-f0-9]\{32\}\""; then
    ok "${name} already has an id in wrangler.toml — skipping"
    return 0
  fi
  warn "${name} not bound — creating..."
  local prod_out prev_out prod_id prev_id
  prod_out=$($WRANGLER kv namespace create "$name" 2>&1 || true)
  prev_out=$($WRANGLER kv namespace create "$name" --preview 2>&1 || true)
  prod_id=$(echo "$prod_out" | grep -oE 'id = "[a-f0-9]{32}"' | head -1 | sed 's/id = "//; s/"//')
  prev_id=$(echo "$prev_out" | grep -oE 'preview_id = "[a-f0-9]{32}"' | head -1 | sed 's/preview_id = "//; s/"//')
  if [[ -z "$prod_id" ]]; then
    err "Could not parse ${name} id. Output was: $prod_out"
    err "If the namespace already exists, paste its id into wrangler.toml manually."
    return 1
  fi
  ok "${name} id=${prod_id} preview_id=${prev_id:-<none>}"
  # Try sed-replacing placeholders in wrangler.toml
  case "$name" in
    CART_KV)   sed -i.bak "s/REPLACE_WITH_KV_NAMESPACE_ID/${prod_id}/g; s/REPLACE_WITH_PREVIEW_KV_ID/${prev_id}/g" wrangler.toml ;;
  esac
  warn "If ${name} doesn't yet appear in wrangler.toml, paste this block under [env.production]:"
  echo "  [[env.production.kv_namespaces]]"
  echo "  binding = \"${name}\""
  echo "  id      = \"${prod_id}\""
  [[ -n "$prev_id" ]] && echo "  preview_id = \"${prev_id}\""
}

if [[ "$MODE" == "setup" || "$MODE" == "deploy" || "$MODE" == "preview" ]]; then
  provision_kv CART_KV
  provision_kv USERS_KV
  provision_kv ORDERS_KV
  provision_kv ADMIN_KV
fi

# ── 4. R2 bucket ──────────────────────────────────────────────────────────────
if [[ "$MODE" != "secrets" ]]; then
  hdr "R2 bucket: pieceofstass-images"
  if $WRANGLER r2 bucket list 2>/dev/null | grep -q "pieceofstass-images"; then
    ok "Bucket exists"
  else
    warn "Bucket not found — creating..."
    $WRANGLER r2 bucket create pieceofstass-images || warn "Bucket create returned non-zero; continuing"
  fi
fi

# ── 5. secrets ────────────────────────────────────────────────────────────────
# Prompts for each secret. Values default to whatever's in .dev.vars / already set
# in production. Empty input = skip / keep existing.

read_secret() {
  # $1=var, $2=prompt, $3=is_password(0|1), $4=optional|required
  local var="$1" prompt="$2" hide="${3:-0}" req="${4:-optional}"
  local default="" cur=""
  if [[ -f .dev.vars ]]; then
    default=$(grep -E "^${var}=" .dev.vars 2>/dev/null | head -1 | cut -d= -f2- || true)
  fi
  local shown_default=""
  if [[ -n "$default" ]]; then
    if [[ "$hide" == "1" ]]; then
      shown_default=" ${C_DIM}[current: ${default:0:6}…${default: -4}]${C_RST}"
    else
      shown_default=" ${C_DIM}[current: ${default}]${C_RST}"
    fi
  fi
  local input
  if [[ "$hide" == "1" ]]; then
    read -r -s -p "$(echo -e "  ${C_BOLD}${prompt}${C_RST}${shown_default}: ")" input
    echo
  else
    read -r -p "$(echo -e "  ${C_BOLD}${prompt}${C_RST}${shown_default}: ")" input
  fi
  if [[ -z "$input" ]]; then
    if [[ "$req" == "required" && -z "$default" ]]; then
      err "$var is required."
      read_secret "$var" "$prompt" "$hide" "$req"
      return $?
    fi
    if [[ -z "$default" ]]; then
      SECRET_VALUES["$var"]=""
      return 0
    fi
    SECRET_VALUES["$var"]="$default"
  else
    SECRET_VALUES["$var"]="$input"
  fi
}

declare -A SECRET_VALUES=()

collect_secrets() {
  hdr "Secrets & environment variables"
  echo "  ${C_DIM}Press Enter to keep the existing value shown in [brackets].${C_RST}"
  echo "  ${C_DIM}Secret values entered here are written to .dev.vars (for local) and${C_RST}"
  echo "  ${C_DIM}'wrangler secret put' (for production). Public vars go to wrangler.toml.${C_RST}"
  echo

  echo "${C_BOLD}Site identity${C_RST}"
  read_secret PUBLIC_SITE_URL    "Public site URL (https://pieceofstass.com)"            0 optional
  read_secret EMAIL_FROM         "Transactional from-address (hello@pieceofstass.com)"   0 optional
  read_secret EMAIL_REPLY_TO     "Reply-to address (help@pieceofstass.com)"              0 optional

  echo
  echo "${C_BOLD}Auth${C_RST}"
  read_secret AUTH_SECRET        "AUTH_SECRET (32+ chars, used to sign JWTs)"            1 required
  echo "  ${C_DIM}Admin password: enter the plaintext password — we will hash it now.${C_RST}"
  read -r -s -p "  ${C_BOLD}Admin password (plain — will be PBKDF2-hashed)${C_RST}: " ADMIN_PLAIN; echo
  if [[ -n "$ADMIN_PLAIN" ]]; then
    SECRET_VALUES[ADMIN_PASSWORD_HASH]=$(node scripts/seed-admin-password.mjs "$ADMIN_PLAIN" 2>/dev/null | grep -oE 'pbkdf2sha256:[0-9]+:[^[:space:]]+' | head -1)
    if [[ -n "${SECRET_VALUES[ADMIN_PASSWORD_HASH]}" ]]; then
      ok "Admin password hashed"
    else
      err "Hashing failed — keeping existing hash if any"
      unset 'SECRET_VALUES[ADMIN_PASSWORD_HASH]'
    fi
  fi

  echo
  echo "${C_BOLD}Payments — Stripe${C_RST}"
  read_secret STRIPE_SECRET_KEY      "STRIPE_SECRET_KEY (sk_live_… or sk_test_…)"        1 optional
  read_secret STRIPE_WEBHOOK_SECRET  "STRIPE_WEBHOOK_SECRET (whsec_…)"                   1 optional
  read_secret PUBLIC_STRIPE_KEY      "PUBLIC_STRIPE_KEY (pk_live_… or pk_test_…)"        0 optional

  echo
  echo "${C_BOLD}Email — Resend${C_RST}"
  read_secret RESEND_API_KEY     "RESEND_API_KEY (re_…)"                                 1 optional

  echo
  echo "${C_BOLD}Lifecycle — Klaviyo${C_RST}"
  read_secret KLAVIYO_API_KEY    "KLAVIYO_API_KEY (pk_…)"                                1 optional
  read_secret KLAVIYO_LIST_ID    "KLAVIYO_LIST_ID (newsletter list, e.g. XYZ123)"        0 optional
  read_secret KLAVIYO_SITE_ID    "KLAVIYO_SITE_ID (6-char public site id)"               0 optional

  echo
  echo "${C_BOLD}Ad pixels${C_RST}"
  read_secret META_PIXEL_ID          "META_PIXEL_ID (numeric)"                           0 optional
  read_secret META_CAPI_ACCESS_TOKEN "META_CAPI_ACCESS_TOKEN"                            1 optional
  read_secret TIKTOK_PIXEL_ID        "TIKTOK_PIXEL_ID"                                   0 optional
  read_secret TIKTOK_ACCESS_TOKEN    "TIKTOK_ACCESS_TOKEN"                               1 optional
  read_secret GA4_MEASUREMENT_ID     "GA4_MEASUREMENT_ID (G-XXXXXXX)"                    0 optional
  read_secret CF_WEB_ANALYTICS_TOKEN "CF_WEB_ANALYTICS_TOKEN"                            0 optional
}

write_dev_vars() {
  local file=".dev.vars"
  echo "# Generated by deploy.sh on $(date -u +%FT%TZ)" > "$file"
  echo "# Local-dev secrets. NEVER commit. .gitignore covers this." >> "$file"
  echo >> "$file"
  for k in "${!SECRET_VALUES[@]}"; do
    [[ -n "${SECRET_VALUES[$k]}" ]] && echo "${k}=${SECRET_VALUES[$k]}" >> "$file"
  done
  chmod 600 "$file"
  ok "Wrote .dev.vars ($(wc -l < "$file") lines, 0600)"
}

push_production_secrets() {
  hdr "Pushing secrets to Cloudflare Workers (production)"
  local pushed=0 skipped=0
  for k in "${!SECRET_VALUES[@]}"; do
    if [[ -z "${SECRET_VALUES[$k]}" ]]; then
      skipped=$((skipped+1)); continue
    fi
    # PUBLIC_* vars belong in wrangler.toml [vars], not as secrets
    if [[ "$k" == PUBLIC_* ]]; then
      skipped=$((skipped+1)); continue
    fi
    echo "    → ${k}"
    printf '%s' "${SECRET_VALUES[$k]}" | $WRANGLER secret put "$k" --env production >/dev/null
    pushed=$((pushed+1))
  done
  ok "Pushed ${pushed} secrets; skipped ${skipped} (empty / public)"
}

if [[ "$MODE" == "setup" || "$MODE" == "secrets" || "$MODE" == "deploy" || "$MODE" == "preview" ]]; then
  collect_secrets
  write_dev_vars
  if [[ "$MODE" != "setup" ]]; then
    read -r -p "  Push these to Cloudflare Workers production now? [y/N] " yn
    if [[ "$yn" =~ ^[Yy]$ ]]; then
      push_production_secrets
    else
      warn "Skipped pushing to production. Run with --secrets to push later."
    fi
  fi
fi

# ── 6. build ──────────────────────────────────────────────────────────────────
if [[ "$MODE" == "deploy" || "$MODE" == "preview" ]] && [[ "$DO_BUILD" == "1" ]]; then
  hdr "Install + build"
  npm install --no-audit --no-fund
  npm run build
  ok "Build OK"
fi

# ── 7. optional image rehost ──────────────────────────────────────────────────
if [[ "$DO_REHOST" == "1" ]]; then
  hdr "Rehosting catalog images to R2"
  if [[ -z "$CF_ACCOUNT_ID" ]]; then
    err "Need CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN env vars to run the rehost script."
    echo "  Export them and re-run: ./deploy.sh --rehost-images --no-build"
  else
    node scripts/rehost-images-to-r2.mjs || warn "Rehost script returned non-zero"
  fi
fi

# ── 8. deploy ─────────────────────────────────────────────────────────────────
if [[ "$MODE" == "deploy" ]]; then
  hdr "Deploy → production"
  $WRANGLER deploy --env production
  ok "Live at https://pieceofstass.com (DNS routes per wrangler.toml)"
elif [[ "$MODE" == "preview" ]]; then
  hdr "Deploy → preview"
  $WRANGLER deploy --env preview
  ok "Preview deployed"
fi

# ── 9. post-deploy hints ──────────────────────────────────────────────────────
hdr "Done"
cat <<EOF
  Next:
    • Verify https://pieceofstass.com loads
    • Visit /admin and sign in with the admin password you just set
    • Place a \$1 test order with a Stripe test card (4242 4242 4242 4242)
    • Check the order appears at /admin/orders and a confirmation email arrived
    • Add tracking via /admin/orders/[id] → confirms shipping email fires
    • Run social card preview:
        https://www.opengraph.xyz/?url=https://pieceofstass.com
        https://cards-dev.twitter.com/validator
        https://developers.facebook.com/tools/debug/

  Re-run anytime:
    ./deploy.sh              # full deploy
    ./deploy.sh --secrets    # rotate secrets only
    ./deploy.sh --preview    # push to preview env

EOF
