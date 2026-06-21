# Environment Variables — Piece of Stass

> **Last updated:** June 2026  
> **Audience:** DevOps agent, frontend agent, backend agent

All secrets must be stored in Railway Variables (backend), Cloudflare Workers Secrets (`wrangler secret put`), and/or a secrets manager (e.g., Doppler, 1Password Secrets Automation). Never commit secrets to the repository.

---

## 1. Stripe

| Variable | Where needed | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | Medusa backend (Railway) | `sk_live_...` — server-side only. Used by Medusa's Stripe payment provider to create checkout sessions and capture payments. |
| `STRIPE_PUBLISHABLE_KEY` | Astro storefront (Cloudflare Workers) | `pk_live_...` — safe to expose in browser JS. Used to initialize Stripe.js on the frontend. |
| `STRIPE_WEBHOOK_SECRET` | Cloudflare Worker (webhook endpoint) | `whsec_...` — used to verify `Stripe-Signature` header on incoming webhook events. Set in Stripe Dashboard → Webhooks → your endpoint. |

**Stripe Dashboard setup:**
- Enable **Stripe Tax** on the account (no additional env var — activated per account).
- Enable **Stripe Radar** (default on all accounts).
- Register webhook endpoint: `https://pieceofstass.com/api/webhooks/stripe`
- Events to subscribe: `checkout.session.completed`, `payment_intent.payment_failed`

---

## 2. Medusa Backend

| Variable | Where needed | Description |
|---|---|---|
| `DATABASE_URL` | Railway | Full Neon Postgres connection string. Format: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `REDIS_URL` | Railway | Upstash Redis URL. Format: `rediss://default:token@endpoint.upstash.io:6380` |
| `JWT_SECRET` | Railway | Random string ≥ 32 characters. Used to sign admin JWTs. Rotate on breach. |
| `COOKIE_SECRET` | Railway | Random string ≥ 32 characters. Used to sign session cookies. |
| `MEDUSA_BACKEND_URL` | Railway + Cloudflare Workers | Public URL of the Medusa backend. Example: `https://api.pieceofstass.com` |
| `STORE_CORS` | Railway | Comma-separated allowed origins for Storefront API. Example: `https://pieceofstass.com,https://www.pieceofstass.com` |
| `ADMIN_CORS` | Railway | Allowed origin for admin panel. Example: `https://admin.pieceofstass.com` |
| `AUTH_CORS` | Railway | Combined CORS for auth endpoints. Include all storefront + admin origins. |
| `DISABLE_MEDUSA_ADMIN` | Railway | `false` in production (serve admin at `/app`). Set `true` if running admin separately. |
| `NODE_ENV` | Railway | `production` |

---

## 3. Medusa Publishable API Key

| Variable | Where needed | Description |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Cloudflare Workers (storefront) | Created in Medusa Admin → Settings → API Keys. This key scopes Storefront API requests to a specific sales channel. Safe to expose in browser requests (it is not a secret — it only allows read/cart operations). |

To create: Log into Medusa Admin → Settings → API Keys → Create API Key → type "Storefront" → copy the key.

---

## 4. Klaviyo

| Variable | Where needed | Description |
|---|---|---|
| `KLAVIYO_API_KEY` | Medusa backend (Railway) | Private API key from Klaviyo → Account → Settings → API Keys. Used for server-side event tracking. Do NOT expose to the browser. |
| `KLAVIYO_ORDER_PLACED_METRIC_ID` | Medusa backend | Klaviyo metric ID for the "Order Placed" event. Found in Klaviyo → Analytics → Metrics. If using `createEvent` API, the metric is auto-created by name — this ID is optional for now. |
| `KLAVIYO_ORDER_SHIPPED_METRIC_ID` | Medusa backend | Klaviyo metric ID for "Order Shipped" event. Same note as above. |
| `KLAVIYO_ABANDONED_CART_LIST_ID` | Cloudflare Workers (storefront) | Klaviyo list ID for abandoned cart sync, if using Klaviyo's JS SDK on the storefront. Optional. |

**Klaviyo flows to create:**
- "Order Placed" trigger → "Order Confirmed" email (fire immediately)
- "Order Shipped" trigger → "Your order is on its way" email
- "Abandoned Cart" trigger (60-minute delay) → "You left something behind" email

---

## 5. Meta CAPI (Conversions API)

| Variable | Where needed | Description |
|---|---|---|
| `META_PIXEL_ID` | Medusa backend (Railway) | Your Facebook/Meta Pixel ID. Found in Meta Events Manager. Example: `1234567890123456` |
| `META_CAPI_ACCESS_TOKEN` | Medusa backend (Railway) | Meta CAPI system user access token. Create at: Meta Events Manager → Settings → Conversions API → Generate Access Token. |

**Meta Events Manager setup:**
- Create a pixel at business.facebook.com → Events Manager.
- Enable server-side event deduplication by passing both browser `fbp` cookie value (from storefront JS) and the server-side event via CAPI with the same `event_id`.
- Events fired: `Purchase` (on `order.placed`), `AddToCart` (optional, from storefront JS).

**Privacy note:** All `user_data` fields (email, phone) must be SHA-256 hashed before sending. The `order-to-supplier` workflow includes a placeholder — implement hashing before go-live.

---

## 6. TikTok Events API

| Variable | Where needed | Description |
|---|---|---|
| `TIKTOK_PIXEL_ID` | Medusa backend (Railway) | TikTok Pixel ID. Format: `Cxxxxxxxxxxxxxxx`. Found in TikTok Ads Manager → Assets → Events. |
| `TIKTOK_EVENTS_API_TOKEN` | Medusa backend (Railway) | TikTok Events API access token. Generate at: TikTok Ads Manager → Assets → Events → your pixel → Set up Web Events → Manage → Access Token. |

**Events fired:** `PlaceAnOrder` (on `order.placed`), `AddToCart` (optional, from browser pixel).

**Privacy note:** Same as Meta — hash `email` with SHA-256 before sending.

---

## 7. Cloudflare

| Variable | Where needed | Description |
|---|---|---|
| `CF_ACCOUNT_ID` | CI/CD (GitHub Actions) | Cloudflare account ID. Found in Cloudflare dashboard → right sidebar. Used by `wrangler deploy`. |
| `CF_API_TOKEN` | CI/CD (GitHub Actions) | Cloudflare API token with Workers:Edit permission. Created at: Cloudflare → My Profile → API Tokens. |
| `WORKERS_KV_NAMESPACE_ID` | Cloudflare Workers | KV namespace ID for cart session storage (if not using cookie-only approach). Created via `wrangler kv:namespace create pos_sessions`. |

---

## 8. SMTP / Supplier Notifications

| Variable | Where needed | Description |
|---|---|---|
| `SMTP_HOST` | Medusa backend (Railway) | SMTP server hostname. Default: `smtp.sendgrid.net` |
| `SMTP_PORT` | Medusa backend (Railway) | SMTP port. `587` for TLS, `465` for SSL. |
| `SMTP_USER` | Medusa backend (Railway) | SMTP username. For SendGrid: `apikey` (literal string). |
| `SMTP_PASS` | Medusa backend (Railway) | SMTP password. For SendGrid: your API key value. |
| `SUPPLIER_NOTIFY_FROM` | Medusa backend (Railway) | From address for supplier notification emails. Example: `ops@pieceofstass.com` |
| `SUPPLIER_EMAIL_CHENYICO` | Medusa backend (Railway) | Contact email for footwear supplier. **Internal only.** |
| `SUPPLIER_EMAIL_117034687` | Medusa backend (Railway) | Contact email for watches supplier. **Internal only.** |
| `SUPPLIER_EMAIL_3293950449` | Medusa backend (Railway) | Contact email for bags supplier. **Internal only.** |
| `SUPPLIER_EMAIL_MIAO2017` | Medusa backend (Railway) | Contact email for men's apparel supplier. **Internal only.** |
| `SUPPLIER_EMAIL_YPD2023` | Medusa backend (Railway) | Contact email for women's apparel supplier. **Internal only.** |
| `SUPPLIER_EMAIL_775180006` | Medusa backend (Railway) | Contact email for kids supplier. **Internal only.** |
| `SUPPLIER_EMAIL_JMSHOP88` | Medusa backend (Railway) | Contact email for fragrance supplier. **Internal only.** |
| `SUPPLIER_EMAIL_XTD8288` | Medusa backend (Railway) | Contact email for tech accessories supplier. **Internal only.** |

---

## 9. SendGrid (Transactional Email to Customers)

| Variable | Where needed | Description |
|---|---|---|
| `SENDGRID_API_KEY` | Medusa backend (Railway) | SendGrid API key. Created at: SendGrid → Settings → API Keys. Permissions: Mail Send. |
| `SENDGRID_FROM_EMAIL` | Medusa backend (Railway) | Verified sender address. Example: `orders@pieceofstass.com`. Must be verified in SendGrid. |

---

## Summary Matrix

| Service | Backend (Railway) | Storefront (Cloudflare Workers) | CI/CD |
|---|---|---|---|
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | `STRIPE_PUBLISHABLE_KEY` | — |
| Medusa | `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `MEDUSA_BACKEND_URL`, `*_CORS`, `NODE_ENV` | `MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | — |
| Klaviyo | `KLAVIYO_API_KEY`, metric IDs | — | — |
| Meta CAPI | `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` | — | — |
| TikTok | `TIKTOK_PIXEL_ID`, `TIKTOK_EVENTS_API_TOKEN` | — | — |
| Cloudflare | — | — | `CF_ACCOUNT_ID`, `CF_API_TOKEN` |
| SMTP | `SMTP_*`, `SUPPLIER_EMAIL_*` | — | — |
| SendGrid | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` | — | — |

---

## Security Checklist

- [ ] All `SECRET_*` and `_KEY` values stored in Railway Variables (encrypted at rest), not in `railway.toml` or any committed file.
- [ ] Cloudflare secret vars set via `wrangler secret put`, not in `wrangler.toml`.
- [ ] `.env` is in `.gitignore` — only `.env.template` is committed.
- [ ] `SUPPLIER_EMAIL_*` variables never logged, never returned in any API response.
- [ ] `META_CAPI_ACCESS_TOKEN` and `TIKTOK_EVENTS_API_TOKEN` are rotated every 90 days.
- [ ] `JWT_SECRET` and `COOKIE_SECRET` are ≥ 32 random bytes (generate with `openssl rand -hex 32`).
- [ ] Stripe webhook secret is unique per endpoint (not reused across environments).
