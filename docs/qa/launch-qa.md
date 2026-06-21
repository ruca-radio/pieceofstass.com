# Piece of Stass — Launch QA Report

> Last updated: 2026-06-21  
> Build status: ✅ `npm run build` — no errors (warnings on prerender headers are expected SSR behaviour)

---

## 1. Build Status

| Check | Result |
|---|---|
| `npm run build` | ✅ Complete — no errors |
| TypeScript | ✅ No type errors |
| Warnings | ⚠️ `Astro.request.headers` on prerendered routes — expected for `output: "server"` with Cloudflare adapter; headers available at runtime |

---

## 2. Lighthouse Expectations per Page Type

All targets assume Cloudflare Workers edge delivery. Measure from a wired desktop connection and a mid-range Android on 4G (Moto G4 preset in DevTools).

| Metric | Target | Notes |
|---|---|---|
| **LCP** | < 1.5 s | Homepage hero image must be `fetchpriority="high"` + preloaded. PDP first product image same. |
| **INP** | < 100 ms | All React islands are `client:load` / `client:visible` — no long tasks on interaction. Test Add-to-Cart, variant select, cart drawer open/close. |
| **CLS** | < 0.05 | Font self-hosted via `@fontsource` — no FOUT layout shift. Images must have explicit `width`/`height` or `aspect-ratio`. |
| **FCP** | < 0.8 s | Critical CSS inlined via Astro's default extraction. |
| **TBT** | < 200 ms | No heavy JS on main thread. Analytics scripts are async/deferred. |
| **Performance score** | ≥ 90 | All pages |
| **Accessibility score** | ≥ 95 | All pages |
| **Best Practices** | ≥ 95 | |
| **SEO score** | 100 | Every page |

### Per-page type LCP targets

| Page Type | LCP Budget | Key Element |
|---|---|---|
| Homepage | 1.2 s | Hero image (above fold) |
| PLP (category) | 1.5 s | First product card image |
| PDP | 1.3 s | Primary product image |
| Cart / Checkout | 1.0 s | No LCP image — text dominant |
| Legal pages | 0.8 s | Text only |
| 404 | 0.8 s | Text only |
| Search | 1.0 s | Results render below fold |

---

## 3. Manual Test Checklist

### 3.1 Pages to test (all must render without JS errors in console)

#### PLPs (8 categories)
- [ ] `/shop` — All Products
- [ ] `/shop/women`
- [ ] `/shop/men`
- [ ] `/shop/kids`
- [ ] `/shop/footwear`
- [ ] `/shop/bags`
- [ ] `/shop/watches`
- [ ] `/shop/fragrance`
- [ ] `/shop/tech`

#### PDPs (5 representative)
- [ ] `/shop/women/[any-womens-handle]`
- [ ] `/shop/men/[any-mens-handle]`
- [ ] `/shop/footwear/[any-footwear-handle]`
- [ ] `/shop/fragrance/[any-fragrance-handle]`
- [ ] `/shop/tech/[any-tech-handle]`

#### Core flows
- [ ] `/cart` — empty state and with items
- [ ] `/checkout` — redirect to Shopify/payment provider fires correctly
- [ ] `/checkout/success` — renders without error (may need mock order params)
- [ ] `/search?q=tee` — returns results
- [ ] `/search?q=zzznoresults` — empty state renders gracefully
- [ ] `/404` (navigate to `/nonexistent-page`)

#### Legal pages (all 6)
- [ ] `/terms`
- [ ] `/privacy`
- [ ] `/shipping`
- [ ] `/returns`
- [ ] `/cookies`
- [ ] `/acceptable-use`

#### Other
- [ ] `/about-anna`
- [ ] `/blog`
- [ ] `/track-order`

### 3.2 Device matrix

| Device | Viewport | Test method |
|---|---|---|
| Mobile (primary) | 375 × 812 (iPhone SE) | Chrome DevTools device emulation |
| Mobile (large) | 430 × 932 (iPhone 15 Pro Max) | DevTools |
| Tablet | 768 × 1024 (iPad) | DevTools |
| Desktop (standard) | 1280 × 800 | Physical / DevTools |
| Desktop (large) | 1920 × 1080 | Physical |

### 3.3 Functional checklist

| Test | Expected | ✓/✗ |
|---|---|---|
| Cookie banner appears for EU/UK/CA (use VPN or CF-IPCountry test header) | Banner visible, 3 categories shown | |
| "Reject all" — marketing pixels blocked | `fbq`, `ttq` NOT called in console | |
| "Accept all" — pixels fire | `fbq`, `ttq` tracked | |
| GPC header (`navigator.globalPrivacyControl = true`) | Banner skipped, consent = necessary only | |
| Consent cookie persists across reload | Banner does not re-appear | |
| Add to cart from PDP | Toast fires, cart count increments, drawer opens | |
| Add to cart from PLP quick-add | Same as above | |
| Variant selector — out of stock variant | Disabled, strikethrough, cannot click | |
| Cart drawer — increase/decrease qty | Updates subtotal | |
| Cart drawer — remove item | Item removed, empty state if last | |
| Free shipping progress bar | Fills as subtotal increases toward $50 | |
| Search overlay — type query | Predictive results appear < 300ms debounce | |
| Search overlay — ESC key | Closes overlay | |
| Mobile menu — open/close | Opens, closes, traps focus | |
| Checkout redirect | Navigates to Shopify checkout (or stub redirect) | |
| Email signup form | Calls `/api/klaviyo-subscribe`, shows success state | |
| RSS feed | `/rss.xml` returns valid XML | |
| Sitemap | `/sitemap-index.xml` returns valid XML | |
| Robots.txt | `/robots.txt` — allows all, points to sitemap | |
| 404 page | Returns HTTP 404, custom design renders | |

---

## 4. Accessibility (WCAG 2.1 AA)

### 4.1 Focus order

- [ ] Tab from first focusable element (skip nav → header logo → nav links → search → cart) follows logical DOM order
- [ ] No focus traps outside of modal/drawer contexts
- [ ] Cart drawer traps focus while open (`aria-modal="true"`, focus returns to trigger on close)
- [ ] Mobile menu traps focus while open (same pattern)
- [ ] Search overlay traps focus while open

### 4.2 Alt text

- [ ] All product images: `alt="[Product title]"` (not empty, not "image")
- [ ] Decorative images: `alt=""`
- [ ] Logo SVG: `aria-label="Piece of Stass"` or equivalent
- [ ] Social icons in footer: descriptive `aria-label` (e.g. "Piece of Stass on Instagram")

### 4.3 Colour contrast

All colour combinations verified against WCAG 2.1 AA (4.5:1 normal text, 3:1 large text / UI components):

| Foreground | Background | Ratio | Pass |
|---|---|---|---|
| `--color-paper` (#F5F5F0) | `--color-ink` (#0A0A0B) | ~19:1 | ✅ AAA |
| `--color-lime` (#C8F135) | `--color-ink` (#0A0A0B) | ~12.4:1 | ✅ AAA |
| `--color-ink` (#0A0A0B) | `--color-lime` (#C8F135) | ~12.4:1 | ✅ AAA (ATC button) |
| `--color-muted` (#888888) | `--color-ink` (#0A0A0B) | ~5.7:1 | ✅ AA |
| `--color-paper` (#F5F5F0) | `--color-charcoal` (#1A1A1C) | ~18.4:1 | ✅ AAA |

> **Stass Lime on Ink** passes AAA — no contrast issues on primary CTA.

### 4.4 Keyboard navigation

- [ ] All interactive elements reachable via keyboard
- [ ] Variant buttons: `aria-pressed` state communicated
- [ ] Add to cart button: announces state change to screen readers (`aria-live` or focus management)
- [ ] Cart drawer close button: `aria-label="Close cart"`
- [ ] Search overlay: `role="dialog"`, `aria-label`
- [ ] Accordion/filters: `aria-expanded` correct

### 4.5 ARIA on cart drawer and modals

Cart drawer (`CartDrawer.tsx`):
```
role="dialog"
aria-modal="true"
aria-label="Your bag"
```

Search overlay (`SearchOverlay.tsx`):
- [ ] Verify `role="dialog"` or `role="search"` with `aria-label`
- [ ] Input has `aria-label` or `<label>` association
- [ ] Results list has `role="listbox"` or `aria-live="polite"`

Cookie banner (`CookieBanner.tsx`):
```
role="dialog"
aria-label="Cookie preferences"
aria-modal="false"
```
- [ ] Accept/Reject buttons have distinct, non-generic labels
- [ ] Checkbox inputs have `aria-label`

### 4.6 Screen reader testing

Test with:
- macOS VoiceOver + Safari
- NVDA + Firefox (Windows)
- Android TalkBack + Chrome

Key journeys to verify: Browse PLP → open PDP → select variant → add to cart → checkout.

---

## 5. Cross-browser Compatibility

| Browser | Version | Priority | Tests |
|---|---|---|---|
| Chrome | Latest stable | P0 | Full test suite |
| Safari iOS | iOS 16+ | P0 | Mobile layout, cart drawer slide, safe-area insets |
| Firefox | Latest stable | P1 | Layout, JS functionality |
| Edge | Latest stable | P1 | Same as Chrome (Chromium) |
| Safari macOS | Latest stable | P1 | Font rendering, backdrop-filter |
| Chrome Android | Latest stable | P1 | Touch targets ≥ 44×44px, StickyATC |

### Known risks
- `backdrop-filter: blur()` requires `-webkit-` prefix for Safari < 15 — verify cart drawer backdrop
- CSS `container queries` — not used, no risk
- `@layer` CSS (Tailwind v4) — supported in all target browsers
- `crypto.subtle` SHA-256 — available in all modern browsers and Cloudflare Workers

---

## 6. SEO Checklist

### 6.1 Unique titles and meta descriptions

Every page must have:
- [ ] `<title>` — unique, ≤ 60 chars, includes "Piece of Stass"
- [ ] `<meta name="description">` — unique, ≤ 155 chars, action-oriented
- [ ] `<link rel="canonical">` — self-referencing
- [ ] `<meta property="og:title">` and `og:description`
- [ ] `<meta property="og:image">` — 1200×630 px minimum
- [ ] `<meta property="og:url">`

Pages that must NOT be indexed:
- [ ] `/checkout` — `<meta name="robots" content="noindex,nofollow">`
- [ ] `/cart` — noindex
- [ ] `/checkout/success` — noindex
- [ ] `/api/*` — not HTML, no issue

### 6.2 Sitemap

- [ ] `/sitemap-index.xml` returns 200 with valid XML
- [ ] All indexable pages included (homepage, all PLPs, all PDPs, blog, legal, about, search)
- [ ] Cart, checkout, success pages excluded
- [ ] Validate at https://www.xml-sitemaps.com/validate-xml-sitemap.html

### 6.3 Robots.txt

Expected at `/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /checkout
Disallow: /cart
Disallow: /api/

Sitemap: https://pieceofstass.com/sitemap-index.xml
```

### 6.4 Schema.org validation

Validate JSON-LD at https://validator.schema.org/ for each page type:

| Page | Schema type | Required properties |
|---|---|---|
| Homepage | `WebSite`, `Organization` | `name`, `url`, `logo`, `sameAs` |
| PLP | `CollectionPage` | `name`, `description`, `url` |
| PDP | `Product` | `name`, `description`, `image`, `offers` (with `price`, `priceCurrency`, `availability`) |
| Blog post | `Article` | `headline`, `author`, `datePublished`, `image` |
| About | `Person` | `name`, `description` |

- [ ] All schemas validate with no critical errors
- [ ] `Product` schema includes `offers.availability` (use `https://schema.org/InStock` or `OutOfStock`)
- [ ] `offers.priceValidUntil` set or omitted (Google may warn if price is stale)

---

## 7. Pixel Firing Test Plan

### 7.1 Tools required

| Tool | Install |
|---|---|
| Meta Pixel Helper | Chrome extension — Facebook Pixel Helper |
| TikTok Pixel Helper | Chrome extension — TikTok Pixel Helper |
| GA4 Debug View | GA4 → Admin → DebugView. Enable with `?gtag_debug=1` URL param or Chrome extension |
| Network tab | DevTools → Network → filter `facebook.com`, `tiktok.com`, `google-analytics.com` |

### 7.2 Pre-test setup

1. Set test environment variables in `.dev.vars` (Wrangler local dev):
   ```
   META_PIXEL_ID=your_pixel_id
   META_CAPI_ACCESS_TOKEN=your_capi_token
   META_TEST_EVENT_CODE=TEST12345
   TIKTOK_PIXEL_ID=your_tiktok_pixel_id
   TIKTOK_ACCESS_TOKEN=your_tiktok_token
   TIKTOK_TEST_EVENT_CODE=TEST12345
   GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   CF_WEB_ANALYTICS_TOKEN=your_cf_token
   KLAVIYO_API_KEY=your_klaviyo_key
   KLAVIYO_LIST_ID=your_list_id
   KLAVIYO_SITE_ID=your_klaviyo_site_id
   ```
2. Run `wrangler pages dev ./dist` to get a local Workers environment.
3. Use an EU VPN or set `CF-IPCountry: GB` header in a proxy to trigger the cookie banner.
4. Accept all cookies before testing pixel fires.

### 7.3 Event test matrix

| User action | Meta Pixel (browser) | Meta CAPI (server) | TikTok Pixel (browser) | TikTok Events API (server) | GA4 (browser) |
|---|---|---|---|---|---|
| Page load (any page) | `PageView` | `PageView` | auto (pixel script) | — | `page_view` |
| View PDP | `ViewContent` | `ViewContent` | `ViewContent` | `ViewContent` | `view_item` |
| Add to cart | `AddToCart` | `AddToCart` | `AddToCart` | `AddToCart` | `add_to_cart` |
| Reach checkout | `InitiateCheckout` | `InitiateCheckout` | `InitiateCheckout` | `InitiateCheckout` | `begin_checkout` |
| Purchase complete | `Purchase` | `Purchase` | `CompletePayment` | `CompletePayment` | `purchase` |

### 7.4 Verification steps

#### Meta Pixel Helper
1. Open the site in Chrome with Meta Pixel Helper installed
2. Navigate to PDP — helper should show `ViewContent` with `content_ids` and `value`
3. Click Add to Cart — `AddToCart` fires with correct product data
4. Check server-side in Meta Events Manager → Test Events with `TEST_EVENT_CODE`

#### TikTok Pixel Helper
1. Install TikTok Pixel Helper
2. Same flow — verify `ViewContent`, `AddToCart`, `InitiateCheckout` in helper panel
3. Check deduplication: same `event_id` in browser pixel and Events API call

#### GA4 Debug View
1. Open site with `?gtag_debug=1` appended to URL
2. In GA4 → Admin → DebugView, select your device
3. Verify ecommerce events: `view_item` shows `items[0].item_id`
4. Check `begin_checkout` fires with correct `value` and `currency`
5. Verify `purchase` fires with `transaction_id`

#### Deduplication check
- Both browser pixel event and server CAPI event must share the same `event_id`
- In the Network tab, find the POST to `/api/meta-capi` — copy `event_id`
- In Meta Events Manager, verify only ONE event registered per user action

### 7.5 Consent gating test

| Scenario | Expected |
|---|---|
| No consent given (banner visible) | No `fbq`, `ttq`, `gtag` calls in console |
| "Reject all" clicked | Server-side CAPI/Events still fire; browser pixels do NOT |
| "Accept all" clicked | All pixels fire normally |
| Reload after accepting | No banner; pixels fire immediately on load |
| Reload after rejecting | No banner; browser pixels blocked |
| GPC signal active | Auto-reject; no browser pixel; server-side OK |

---

## 8. Analytics Integration Summary

| Integration | Implementation | Env var(s) |
|---|---|---|
| Meta CAPI | `/src/pages/api/meta-capi.ts` — SHA-256 hashed PII, v18.0 API, dedup ID | `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_TEST_EVENT_CODE` |
| Meta Pixel | `BaseLayout.astro` inline script, gated by `window.consent.marketing` | `META_PIXEL_ID` |
| TikTok Events API | `/src/pages/api/tiktok-events.ts` — v1.3 API, hashed email/phone | `TIKTOK_PIXEL_ID`, `TIKTOK_ACCESS_TOKEN`, `TIKTOK_TEST_EVENT_CODE` |
| TikTok Pixel | `BaseLayout.astro` inline script, gated by marketing consent | `TIKTOK_PIXEL_ID` |
| GA4 | `BaseLayout.astro` — consent mode v2, enhanced ecommerce | `GA4_MEASUREMENT_ID` |
| Cloudflare Analytics | `BaseLayout.astro` beacon script | `CF_WEB_ANALYTICS_TOKEN` |
| Klaviyo Subscribe | `/src/pages/api/klaviyo-subscribe.ts` — Profiles v3 + list add | `KLAVIYO_API_KEY`, `KLAVIYO_LIST_ID` |
| Klaviyo Onsite JS | `BaseLayout.astro` — lazy loaded on marketing consent | `KLAVIYO_SITE_ID` |
| Client tracker | `/src/lib/analytics.ts` — unified `trackEvent()` | — |
| Cookie Banner | `/src/components/islands/CookieBanner.tsx` — GDPR/CCPA/PIPEDA | — |

---

## 9. Open Items / Launch Blockers

| Priority | Item | Action |
|---|---|---|
| P0 | Set all env vars in Cloudflare dashboard (Workers → Settings → Variables) | Before deploy |
| P0 | Verify `CHECKOUT_URL` in `wrangler.toml` points to live Shopify checkout | Before deploy |
| P0 | Test Meta CAPI with `META_TEST_EVENT_CODE` — verify events appear in Events Manager | Before launch |
| P0 | Confirm Klaviyo `LIST_ID` matches the master email list | Before launch |
| P1 | Add `noindex` to `/cart`, `/checkout`, `/checkout/success` pages | SEO hygiene |
| P1 | Verify `robots.txt` exists in `/public/` and disallows checkout/cart/api | SEO hygiene |
| P1 | Lighthouse CI run against staging URL — fix any regressions | Pre-launch |
| P2 | Add `<script type="application/ld+json">` Product schema to PDPs | SEO enhancement |
| P2 | Set `META_TEST_EVENT_CODE=null` (remove) in production env | Post-testing cleanup |
