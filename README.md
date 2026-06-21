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
