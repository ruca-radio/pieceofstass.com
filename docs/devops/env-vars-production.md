# Production Environment Variable Inventory
> Piece of Stass — pieceofstass.com  
> Last updated: June 2026  
> Scope: Astro / Cloudflare Workers frontend only  
> (Medusa backend env vars live in Railway — see `commerce/medusa/.env.template`)

---

## Naming Conventions

| Prefix | Meaning | How to set |
|--------|---------|------------|
| `PUBLIC_` | Exposed to the browser via `import.meta.env.PUBLIC_*` | `[vars]` in `wrangler.toml` OR GitHub Secrets (injected at deploy time) |
| _(no prefix)_ | Server-side only — Worker runtime, never sent to browser | `wrangler secret put` OR GitHub Secrets injected via `wrangler-action` |

**Rule:** Any var that ends up in client JS bundles MUST have a `PUBLIC_` prefix. Any secret key must NOT have it.

---

## 1. Cloudflare Workers Infrastructure

| Variable | Scope | Type | Where to Set | Notes |
|----------|-------|------|-------------|-------|
| `PUBLIC_SITE_URL` | Worker + Browser | Public | `wrangler.toml [vars]` | `https://pieceofstass.com` — used in sitemap, OG tags |
| `CLOUDFLARE_ACCOUNT_ID` | CI/CD only | Secret | GitHub Secret | Used by `wrangler deploy` in Actions; NOT injected into Worker |
| `CLOUDFLARE_API_TOKEN` | CI/CD only | Secret | GitHub Secret | Workers:Edit + Account:Read permissions; NOT injected into Worker |

---

## 2. Stripe

| Variable | Scope | Type | Where to Set | Value format | Notes |
|----------|-------|------|-------------|-------------|-------|
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser | Public | `wrangler.toml [env.production][vars]` | `pk_live_...` | Initializes Stripe.js; safe to expose. Use `pk_test_...` in preview env. |
| `STRIPE_WEBHOOK_SECRET` | Worker only | Secret | `wrangler secret put STRIPE_WEBHOOK_SECRET` | `whsec_...` | Validates `Stripe-Signature` header on `/api/webhooks/stripe` |
| `CHECKOUT_URL` | Worker only | Secret | `wrangler secret put CHECKOUT_URL` | `https://api.pieceofstass.com` | Medusa checkout redirect base; set in wrangler.toml as placeholder |

> **Stripe LIVE vs TEST:**
> - `pk_live_` / `sk_live_` for production environment
> - `pk_test_` / `sk_test_` for preview environment (set different secrets per environment)
> - NEVER mix live and test keys

**Wrangler secret commands:**
```bash
wrangler secret put STRIPE_WEBHOOK_SECRET --env production
wrangler secret put CHECKOUT_URL --env production
# For preview:
wrangler secret put STRIPE_WEBHOOK_SECRET --env preview
wrangler secret put CHECKOUT_URL --env preview
```

---

## 3. Medusa Backend

| Variable | Scope | Type | Where to Set | Notes |
|----------|-------|------|-------------|-------|
| `MEDUSA_BACKEND_URL` | Worker only | Secret | `wrangler secret put` | `https://api.pieceofstass.com` — Medusa Railway URL |
| `MEDUSA_PUBLISHABLE_KEY` | Worker + Browser | Public* | `wrangler secret put` | Medusa Storefront API key — technically public (read-only) but treat as secret to avoid API abuse |

> *`MEDUSA_PUBLISHABLE_KEY` is technically safe to expose (it only allows read-only storefront operations and cart creation) but we inject it server-side anyway to avoid it being hardcoded in client bundles.

**Wrangler secret commands:**
```bash
wrangler secret put MEDUSA_BACKEND_URL --env production
wrangler secret put MEDUSA_PUBLISHABLE_KEY --env production
```

---

## 4. Meta (Facebook) Conversions API

| Variable | Scope | Type | Where to Set | Notes |
|----------|-------|------|-------------|-------|
| `META_PIXEL_ID` | Worker only | Secret | `wrangler secret put` | 16-digit numeric ID from Meta Events Manager |
| `META_CAPI_ACCESS_TOKEN` | Worker only | Secret | `wrangler secret put` | Long-lived system user access token; rotate every 90 days |
| `META_TEST_EVENT_CODE` | Worker only | Secret | `wrangler secret put` (preview env only) | `TEST12345` — OMIT in production (sends real events) |

**Wrangler secret commands:**
```bash
wrangler secret put META_PIXEL_ID --env production
wrangler secret put META_CAPI_ACCESS_TOKEN --env production
# Preview only:
wrangler secret put META_PIXEL_ID --env preview
wrangler secret put META_CAPI_ACCESS_TOKEN --env preview
wrangler secret put META_TEST_EVENT_CODE --env preview
```

---

## 5. TikTok Events API

| Variable | Scope | Type | Where to Set | Notes |
|----------|-------|------|-------------|-------|
| `TIKTOK_PIXEL_ID` | Worker only | Secret | `wrangler secret put` | Format `Cxxxxxxxxxxxxxxx` from TikTok Ads Manager |
| `TIKTOK_ACCESS_TOKEN` | Worker only | Secret | `wrangler secret put` | TikTok Events API access token; rotate every 90 days |
| `TIKTOK_TEST_EVENT_CODE` | Worker only | Secret | `wrangler secret put` (preview only) | Test event code from TikTok pixel manager; OMIT in production |

**Wrangler secret commands:**
```bash
wrangler secret put TIKTOK_PIXEL_ID --env production
wrangler secret put TIKTOK_ACCESS_TOKEN --env production
# Preview only:
wrangler secret put TIKTOK_PIXEL_ID --env preview
wrangler secret put TIKTOK_ACCESS_TOKEN --env preview
wrangler secret put TIKTOK_TEST_EVENT_CODE --env preview
```

---

## 6. Klaviyo

| Variable | Scope | Type | Where to Set | Notes |
|----------|-------|------|-------------|-------|
| `KLAVIYO_API_KEY` | Worker only | Secret | `wrangler secret put` | Private API key (starts with `pk_`); server-side only |
| `KLAVIYO_LIST_ID` | Worker only | Secret | `wrangler secret put` | Newsletter/email signup list ID from Klaviyo → Audience → Lists |

**Wrangler secret commands:**
```bash
wrangler secret put KLAVIYO_API_KEY --env production
wrangler secret put KLAVIYO_LIST_ID --env production
```

---

## 7. Google Analytics 4

| Variable | Scope | Type | Where to Set | Notes |
|----------|-------|------|-------------|-------|
| `PUBLIC_GA4_MEASUREMENT_ID` | Browser | Public | `wrangler.toml [env.production][vars]` | Format `G-XXXXXXXXXX`; used in `<head>` gtag snippet |

This is injected into the Astro layout's `<head>` for the client-side GA4 snippet. It is safe to expose publicly — GA4 measurement IDs are not secrets.

---

## 8. Cloudflare Web Analytics

| Variable | Scope | Type | Where to Set | Notes |
|----------|-------|------|-------------|-------|
| `PUBLIC_CF_WEB_ANALYTICS_TOKEN` | Browser | Public | `wrangler.toml [env.production][vars]` | Beacon token from CF Dashboard → Analytics & Logs → Web Analytics → your site |

Not a secret — it's embedded in the HTML beacon script tag.

---

## 9. Resend (Transactional Email)

| Variable | Scope | Type | Where to Set | Notes |
|----------|-------|------|-------------|-------|
| `RESEND_API_KEY` | Worker only | Secret | `wrangler secret put` | Format `re_...`; used for server-side email sending (order confirmations, password resets) |

**Wrangler secret command:**
```bash
wrangler secret put RESEND_API_KEY --env production
```

---

## 10. Sentry (Error Monitoring — Optional)

| Variable | Scope | Type | Where to Set | Notes |
|----------|-------|------|-------------|-------|
| `SENTRY_DSN` | Worker + Browser | Public* | `wrangler secret put` OR `[vars]` | Format `https://xxx@oXXX.ingest.sentry.io/xxx` |

> *DSN is technically public (it's embedded in browser bundles) but inject server-side for the Worker-side Sentry client.

---

## 11. Complete `wrangler secret put` Script

Run this script once before first production deploy. Replace placeholder values with real ones.

```bash
#!/bin/bash
# Run from project root: bash docs/devops/set-secrets.sh
# Requires: CLOUDFLARE_API_TOKEN env var set, wrangler installed

ENV=production

echo "Setting Piece of Stass production secrets..."

# Stripe
wrangler secret put STRIPE_WEBHOOK_SECRET --env $ENV
wrangler secret put CHECKOUT_URL --env $ENV

# Medusa
wrangler secret put MEDUSA_BACKEND_URL --env $ENV
wrangler secret put MEDUSA_PUBLISHABLE_KEY --env $ENV

# Meta CAPI
wrangler secret put META_PIXEL_ID --env $ENV
wrangler secret put META_CAPI_ACCESS_TOKEN --env $ENV

# TikTok
wrangler secret put TIKTOK_PIXEL_ID --env $ENV
wrangler secret put TIKTOK_ACCESS_TOKEN --env $ENV

# Klaviyo
wrangler secret put KLAVIYO_API_KEY --env $ENV
wrangler secret put KLAVIYO_LIST_ID --env $ENV

# Resend
wrangler secret put RESEND_API_KEY --env $ENV

# Sentry (optional)
# wrangler secret put SENTRY_DSN --env $ENV

echo "Done. Verify with: wrangler secret list --env $ENV"
```

---

## 12. Summary Matrix

| Variable | PUBLIC? | Production | Preview | CI/CD Secret | `wrangler secret put` |
|----------|---------|-----------|---------|-------------|----------------------|
| `PUBLIC_SITE_URL` | ✅ | wrangler.toml [vars] | wrangler.toml [vars] | — | — |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | wrangler.toml [env.prod][vars] | wrangler.toml [env.prev][vars] | — | — |
| `PUBLIC_GA4_MEASUREMENT_ID` | ✅ | wrangler.toml [env.prod][vars] | wrangler.toml [env.prev][vars] | — | — |
| `PUBLIC_CF_WEB_ANALYTICS_TOKEN` | ✅ | wrangler.toml [env.prod][vars] | wrangler.toml [env.prev][vars] | — | — |
| `CLOUDFLARE_API_TOKEN` | ❌ | — | — | ✅ GitHub Secret | — |
| `CLOUDFLARE_ACCOUNT_ID` | ❌ | — | — | ✅ GitHub Secret | — |
| `STRIPE_WEBHOOK_SECRET` | ❌ | ✅ | ✅ | ✅ GitHub (inject) | ✅ |
| `CHECKOUT_URL` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `MEDUSA_BACKEND_URL` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `MEDUSA_PUBLISHABLE_KEY` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `META_PIXEL_ID` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `META_CAPI_ACCESS_TOKEN` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `META_TEST_EVENT_CODE` | ❌ | — | ✅ preview only | ✅ | ✅ preview only |
| `TIKTOK_PIXEL_ID` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `TIKTOK_ACCESS_TOKEN` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `TIKTOK_TEST_EVENT_CODE` | ❌ | — | ✅ preview only | ✅ | ✅ preview only |
| `KLAVIYO_API_KEY` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `KLAVIYO_LIST_ID` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `RESEND_API_KEY` | ❌ | ✅ | — | ✅ | ✅ |
| `SENTRY_DSN` | ❌ | ✅ | optional | ✅ | ✅ |

---

## 13. Security Notes

1. **No secrets in `wrangler.toml`.** The `[vars]` section is committed to git — only public, non-sensitive values go there.
2. **`wrangler secret put` encrypts at rest** in Cloudflare's secret store and injects into the Worker runtime as environment variables. They are never visible in plaintext after being set.
3. **Rotate `META_CAPI_ACCESS_TOKEN` and `TIKTOK_ACCESS_TOKEN` every 90 days.** Calendar reminder recommended.
4. **Stripe LIVE keys** — never use `sk_live_` or `pk_live_` in the `preview` environment. Always use test keys for PRs.
5. **`.env` is gitignored** — if you use a local `.env` for `astro dev`, confirm it is in `.gitignore` (see `docs/devops/runbook.md`).
