# Security Posture — Piece of Stass

**Last updated:** 2026-06-22

This document summarises the security architecture for `pieceofstass.com`, a Cloudflare Workers + Astro SSR application.

---

## Authentication Model

### Customer Authentication (magic-link)
- **Mechanism:** Passwordless magic-link via Resend. JWT signed with HS256 (jose library).
- **Token lifetime:** Magic links expire in 15 minutes. Sessions expire in 30 days (rolling).
- **Session cookie:** `pos_session` — `HttpOnly`, `SameSite=Lax`, `Secure` (production only), `Path=/`.
- **Secret:** `AUTH_SECRET` env var. Required in production — the app throws at startup if missing. Dev falls back to an insecure placeholder with a console warning.
- **Rate limit:** 3 magic-link requests per IP per hour (via Cloudflare KV).

### Admin Authentication (password)
- **Mechanism:** PBKDF2-SHA256 (310,000 iterations) password hash stored as `ADMIN_PASSWORD_HASH` env var.
- **Session cookie:** `pos_admin` — `HttpOnly`, `SameSite=Strict`, `Secure=true` (always), `Path=/`, 12-hour expiry.
- **Rate limit:** 5 failed attempts per IP, 10-minute lockout (in-memory; rotates on Worker restart).
- **JWT signing key:** derived from `ADMIN_PASSWORD_HASH` itself — password rotation automatically invalidates all sessions.
- **Remediation note:** Default hash in `.dev.vars` is for password `admin123`. **Change this before launch.**

---

## Cookies

| Cookie | HttpOnly | SameSite | Secure | Expiry |
|--------|----------|----------|--------|--------|
| `pos_session` | ✅ | Lax | Production only | 30 days |
| `pos_admin` | ✅ | **Strict** | Always | 12 hours |
| `pos_cart` | ❌ | Lax | Production only | 30 days |

`pos_cart` is intentionally not `HttpOnly` — the cart ID is a non-sensitive random UUID read by client-side JavaScript.

---

## HTTP Security Headers

Applied on every response via:
- **SSR responses:** `src/middleware.ts`
- **Prerendered pages:** `public/_headers` (Cloudflare Workers `_headers` file)

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self), interest-cohort=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-DNS-Prefetch-Control` | `on` |
| `Content-Security-Policy` | See [csp.md](./csp.md) |

---

## Content Security Policy

See [docs/security/csp.md](./csp.md) for the full policy and rationale.

**Key points:**
- `'unsafe-inline'` is allowed for scripts (Astro hydration) and styles (Tailwind). Upgrade to nonces with Astro 6.
- Stripe, GTM, Meta pixel, TikTok, Klaviyo, and Cloudflare Insights are explicitly whitelisted.
- CSP violations are reported to `POST /api/csp-report` and logged to Cloudflare Worker logs.

---

## CSRF Protection

All state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) to `/api/*` are validated against the `Origin` or `Referer` header in `src/middleware.ts`.

- Webhook endpoints (`/api/webhooks/*`) are exempt — they use cryptographic payload signatures instead.
- Returns `403` with JSON error if origin is not `pieceofstass.com` or `localhost`.

---

## Webhook Security

### Stripe (`/api/webhooks/stripe`)
- Verifies the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET` using `stripe.webhooks.constructEvent()`.
- In production: rejects all requests without a valid signature (returns 400).
- In development: skips verification with a console warning.

### TikTok / Meta
- No inbound webhooks currently. All events are outbound (server-to-server via `/api/tiktok-events` and `/api/meta-capi`).

---

## Input Validation

All `/api/*` endpoints that accept a body:
1. Parse JSON with `try/catch` — return 400 on parse failure.
2. Validate types and lengths manually.
3. Reject unknown fields implicitly (only extract named fields).
4. Return descriptive 400 messages.

Key validated endpoints:
- `POST /api/cart/items` — validates `product_id`, `variant_id`, `qty` (1–99)
- `PATCH /api/cart/items/:id` — validates `qty` (0–99)
- `POST /api/auth/magic-link` — validates email format, max 320 chars
- `PATCH /api/account/profile` — sanitises all fields, max lengths enforced
- `POST /api/account/addresses` — all required fields validated
- `POST /api/meta-capi`, `POST /api/tiktok-events` — event_name allowlist, event_time range check, user_data string length cap

---

## Dependency Policy

- Dependencies are audited via `npm audit` on every CI run.
- Remaining known vulnerabilities (as of 2026-06-22):
  - `astro` < 6.x: several XSS CVEs only patched in Astro 6. Upgrading requires `@astrojs/cloudflare` v13 (major). **Planned for the next release cycle.**
  - `esbuild` / `wrangler`: only affects the dev server. Not exploitable in production Workers.
  - `@astrojs/cloudflare` (SSRF): low severity. Fix requires Astro 6 as above.
- npm `overrides` are used to force `ws` and `undici` to patched versions.

---

## Secret Handling

- Secrets are stored as Cloudflare Workers secrets (`wrangler secret put ...`), never in code.
- `.dev.vars` holds local dev placeholders. It is **gitignored** (was un-tracked in commit `security: patch deps...`).
- `.dev.vars.example` contains only placeholder values — no real keys.
- See [docs/security/secret-scan.md](./secret-scan.md) for the full secret scan report.

---

## Incident Response

For a potential secret exposure:
1. Rotate the exposed secret immediately (Stripe dashboard / wrangler secret put).
2. Check Cloudflare Access logs and Stripe radar for unusual activity.
3. File an internal incident in Notion under `/Security/Incidents`.
4. If Stripe keys were exposed: file a report at https://stripe.com/docs/security.

For a production outage linked to a security issue:
1. Use `wrangler deployments list` to identify the last clean deployment.
2. Roll back with `wrangler rollback`.
3. Communicate via status page.
