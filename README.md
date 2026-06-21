# Piece of Stass — pieceofstass.com

> Raid the stash. The look for less, dropped daily.

Production storefront built on **Astro 5 + React islands + Cloudflare Workers**.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Astro 5 (`output: 'server'`) |
| Adapter | `@astrojs/cloudflare` (Workers mode) |
| UI islands | React 18 (`client:load` / `client:visible`) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Fonts | Space Grotesk · Inter · Space Mono (self-hosted via `@fontsource`) |
| Cart state | `nanostores` |
| Language | TypeScript strict |
| Deploy | Cloudflare Workers via `wrangler` |

---

## Project structure

```
src/
  pages/
    index.astro            — Homepage
    shop/
      index.astro          — All products PLP
      [category]/
        index.astro        — Category PLP (8 categories)
        [handle].astro     — PDP
    search.astro
    cart.astro
    checkout.astro
    checkout/success.astro
    about-anna.astro
    blog/
      index.astro          — Blog index (ready, no posts yet)
      [slug].astro         — Blog post (ready for CMS)
    track-order.astro
    terms.astro / privacy.astro / shipping.astro / returns.astro / cookies.astro / acceptable-use.astro
    api/
      cart.ts              — Cart API stub (Workers)
      search.ts            — Product search
      klaviyo-subscribe.ts — Email capture stub
      meta-capi.ts         — Meta Conversions API proxy stub
    rss.xml.ts             — Product RSS/Atom feed
  components/
    SEO.astro              — SEO meta, JSON-LD
    Header.astro           — Sticky nav
    Footer.astro           — Newsletter + links
    AnnouncementBar.astro  — Marquee banner
    islands/               — React islands
      CartButton.tsx
      SearchButton.tsx
      MobileMenu.tsx
      CartDrawer.tsx        — Slide-out cart
      CartPage.tsx
      SearchOverlay.tsx     — Predictive search
      SearchResults.tsx
      ProductCard.tsx       — Card with quick-add
      ProductGallery.tsx    — PDP image gallery
      AddToCart.tsx         — Variant picker + ATC
      StickyATC.tsx         — Mobile sticky CTA
      PLPFilters.tsx        — Filters/sort/load-more
      EmailSignup.tsx       — Klaviyo capture form
      TrackOrder.tsx        — Order tracking
      CheckoutPage.tsx      — Single-page checkout
      ToastContainer.tsx    — Global toast system
  layouts/
    BaseLayout.astro
    LegalLayout.astro
  lib/
    types.ts               — TypeScript interfaces
    store.ts               — nanostores cart
    products.ts            — Data helpers
    marked-stub.ts         — Markdown → HTML
  styles/
    global.css             — Tailwind v4 + design tokens
  content/legal/           — Legal markdown content
data/
  products.json            — 80 products
  categories.json          — 8 categories
docs/                      — Brand, UX, and legal source docs
```

---

## Setup

```bash
# Install dependencies
npm install

# Start dev server (port 4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Environment variables

Create a `.dev.vars` file (Cloudflare Workers local dev) or set in the Cloudflare dashboard:

```
CHECKOUT_URL=               # Stripe Checkout session URL (leave empty for stub mode)
META_PIXEL_ID=              # Meta Pixel ID for server-side CAPI
META_CAPI_ACCESS_TOKEN=     # Meta CAPI token
KLAVIYO_API_KEY=            # Klaviyo private API key
KLAVIYO_LIST_ID=            # Klaviyo list ID for newsletter signups
```

---

## Deploy to Cloudflare Workers

```bash
# One-time auth
wrangler login

# Build + deploy
npm run deploy
```

The `wrangler.toml` is configured with:
- `name = "pieceofstass"`
- `compatibility_date = "2024-12-30"`
- `nodejs_compat` flag enabled

---

## Image CDN

Product images currently reference Yupoo URLs directly (`product.images[0]`). The DevOps agent will:
1. Download images to Cloudflare R2
2. Update `data/products.json` image URLs to `https://cdn.pieceofstass.com/...`

---

## TODOs (for DevOps / backend agents)

- [ ] Set `CHECKOUT_URL` to Stripe Checkout endpoint
- [ ] Integrate Klaviyo API in `/api/klaviyo-subscribe.ts`
- [ ] Set `META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN`
- [ ] Swap Yupoo image URLs → Cloudflare R2 CDN
- [ ] Wire up server-side cart session (Medusa / Shopify / custom)
- [ ] Add real review data (product rating + review count)
- [ ] Add real UGC/Instagram feed to homepage
- [ ] Connect blog CMS (Contentful, Sanity, or Astro Content Collections)
- [ ] Set `EFFECTIVE_DATE` placeholders in legal pages
- [ ] Replace `[SUPPORT EMAIL]` in legal pages with real email
- [ ] Generate proper OG image (`/og-default.png`)

---

## Design tokens

Sourced from `docs/brand/design-tokens.json`:

| Token | Value |
|---|---|
| Stass Lime (primary) | `#C6FF3A` |
| Stass Ink (canvas) | `#0A0A0B` |
| Stash Paper (light) | `#FAFAF7` |
| Hype Violet (secondary) | `#7B5CFF` |
| Sass Pink (accent) | `#FF4D8D` |

---

## Voice & tone

Brand: **Piece of Stass** — *cheeky, curated, bold, accessible, now.*

Tagline: **Raid the stash.** — Primary CTA and hashtag (#RaidTheStash).

Copy must pass the test: would this sound like a confident friend with great taste, or a corporate catalog? See `docs/brand/voice-tone.md`.

---

## Analytics & Integrations

### Environment Variables

All variables must be set in Cloudflare Workers (Workers → Settings → Variables & Secrets) and in `.dev.vars` for local development (this file is gitignored).

#### `.dev.vars` template
```env
# Meta
META_PIXEL_ID=your_meta_pixel_id
META_CAPI_ACCESS_TOKEN=your_capi_system_user_token
META_TEST_EVENT_CODE=TEST12345        # Remove in production

# TikTok
TIKTOK_PIXEL_ID=your_tiktok_pixel_id
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
TIKTOK_TEST_EVENT_CODE=TEST12345     # Remove in production

# Google Analytics 4
GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Cloudflare Web Analytics
CF_WEB_ANALYTICS_TOKEN=your_cf_beacon_token

# Klaviyo
KLAVIYO_API_KEY=your_klaviyo_private_api_key
KLAVIYO_LIST_ID=your_klaviyo_list_id
KLAVIYO_SITE_ID=your_klaviyo_site_id   # Public site ID for onsite JS

# Store
CHECKOUT_URL=https://your-shopify-store.myshopify.com/cart
PUBLIC_SITE_URL=https://pieceofstass.com
```

#### Wrangler production (non-sensitive values go in `wrangler.toml` `[vars]`)
Secrets (tokens, API keys) are set via:
```bash
wrangler secret put META_CAPI_ACCESS_TOKEN
wrangler secret put TIKTOK_ACCESS_TOKEN
wrangler secret put KLAVIYO_API_KEY
```

---

### Analytics Architecture

```
Browser (client-side)                   Server (Cloudflare Worker)
─────────────────────────────────────   ───────────────────────────────────
src/lib/analytics.ts → trackEvent()
  │
  ├─ window.fbq (Meta Pixel)             POST /api/meta-capi
  │   └─ gated: consent.marketing           └─ Meta CAPI v18.0 (SHA-256 PII)
  │
  ├─ window.ttq (TikTok Pixel)           POST /api/tiktok-events
  │   └─ gated: consent.marketing           └─ TikTok Events API v1.3 (SHA-256)
  │
  └─ window.gtag (GA4)                   (GA4 is client-only)
      └─ gated: consent.analytics

Cookie consent: CookieBanner.tsx
  → reads CF-IPCountry (server-injected)
  → respects navigator.globalPrivacyControl (GPC)
  → stores in pos_consent cookie (1yr)
  → updates window.consent + GA4 consent mode v2
```

---

### How to Test Pixels

#### 1. Local development
```bash
# Create .dev.vars with all env vars above
wrangler pages dev ./dist --port 8788
# Visit http://localhost:8788
```

#### 2. Meta Pixel
- Install [Meta Pixel Helper](https://developers.facebook.com/docs/meta-pixel/support/pixel-helper/) Chrome extension
- Set `META_TEST_EVENT_CODE` in `.dev.vars`
- Navigate the site — Helper panel shows each event in real time
- In **Meta Events Manager → Test Events** tab, verify server-side events arrive

#### 3. TikTok Pixel
- Install [TikTok Pixel Helper](https://ads.tiktok.com/help/article/tiktok-pixel-helper) Chrome extension
- Set `TIKTOK_TEST_EVENT_CODE` in `.dev.vars`
- Navigate site — Helper shows `ViewContent`, `AddToCart`, `InitiateCheckout`
- In **TikTok Events Manager → Test Events**, verify server events

#### 4. GA4 Debug View
```
# Append to any URL:
http://localhost:8788/?gtag_debug=1

# Then in GA4:
Admin → Data Streams → [your stream] → Measure → DebugView
```
Verify: `page_view`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`

#### 5. Consent gating test
```javascript
// In DevTools console — simulate EU visitor banner:
document.cookie = 'pos_consent=; max-age=0; path=/'; // clear consent
location.reload();
// Banner should appear — test Reject All, verify no fbq/ttq calls
```

#### 6. Server-side endpoint manual test
```bash
curl -X POST http://localhost:8788/api/meta-capi \
  -H 'Content-Type: application/json' \
  -d '{
    "event_name": "ViewContent",
    "user_data": { "email": "test@example.com" },
    "custom_data": { "value": 29.99, "currency": "USD", "content_ids": ["sku-123"] }
  }'
# Expected: {"success":true} or {"success":true,"stubbed":true} if no env vars
```

---

### Calling `trackEvent` in components

```typescript
import { trackEvent } from '../../lib/analytics';

// ViewContent on PDP mount
useEffect(() => {
  trackEvent('ViewContent', {
    content_ids: [product.id],
    content_name: product.title,
    content_type: 'product',
    value: product.price,
    currency: 'USD',
  });
}, [product.id]);

// AddToCart
trackEvent('AddToCart', {
  content_ids: [variant.sku],
  content_name: product.title,
  value: product.price,
  currency: 'USD',
  contents: [{ id: variant.sku, quantity: qty, price: product.price }],
});

// Purchase (call from checkout/success page)
trackEvent('Purchase', {
  order_id: orderId,
  value: orderTotal,
  currency: 'USD',
  contents: lineItems.map((i) => ({ id: i.sku, quantity: i.qty, price: i.price })),
});
```

---

### QA Report

See [`docs/qa/launch-qa.md`](docs/qa/launch-qa.md) for:
- Lighthouse targets per page type
- Full manual test checklist (all PLPs, PDPs, cart, legal pages)
- Accessibility (WCAG 2.1 AA) checklist
- Cross-browser matrix
- SEO checklist (titles, sitemap, schema)
- Pixel firing test plan
