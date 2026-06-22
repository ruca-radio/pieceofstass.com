# Social Card Smoke Tests

Date: 2026-06-22  
Build: clean (npm run build — 0 errors)

---

## 1. OG Image Endpoints

### GET /api/og/home.png

```
HTTP 200 image/png — 55,395 bytes — 1200×630 RGBA PNG
Cache-Control: public, max-age=31536000, immutable
ETag present
```

### GET /api/og/about.png

```
HTTP 200 image/png — 54,082 bytes — 1200×630 RGBA PNG
Cache-Control: public, max-age=31536000, immutable
```

### GET /api/og/product/white-cement-high-top-court-sneaker.png

```
HTTP 200 image/png — 27,734 bytes — 1200×630 RGBA PNG
Cache-Control: public, max-age=31536000, immutable
ETag present
```
Note: Product images sourced from external CDN (yupoo); when reachable, the product image fills the left half. When CDN is unavailable (sandbox), renders text-only template.

### GET /api/og/shop/footwear.png

```
HTTP 200 image/png — 26,007 bytes — 1200×630 RGBA PNG
Cache-Control: public, max-age=31536000, immutable
```

### GET /api/og/blog/style-guide.png

```
HTTP 200 image/png — dark espresso background template
Cache-Control: public, max-age=31536000, immutable
```

---

## 2. Home Page Meta Tag Verification

Grep output from `GET /`:

### Open Graph — Present ✅
- `og:type` = `website`
- `og:title` = `Piece of Stass | Raid The Stash | Aesthetic Fashion & Accessories`
- `og:description` = (200 chars or less ✅)
- `og:image` = `https://pieceofstass.com/api/og/home.png`
- `og:image:width` = `1200`
- `og:image:height` = `630`
- `og:image:type` = `image/png`
- `og:image:alt` = `Raid the stash. — Piece of Stass, aesthetic fashion & accessories`
- `og:url` = `https://pieceofstass.com/`
- `og:site_name` = `Piece of Stass`
- `og:locale` = `en_US`
- `og:see_also` × 5 (instagram, tiktok, snapchat, pinterest, facebook) ✅

### Twitter/X — Present ✅
- `twitter:card` = `summary_large_image`
- `twitter:site` = `@pieceofstass`
- `twitter:creator` = `@pieceofstass`
- `twitter:title` = (matches og:title)
- `twitter:description` = (matches og:description)
- `twitter:image` = `https://pieceofstass.com/api/og/home.png`
- `twitter:image:alt` = (alt text present ✅)

### Pinterest — Present ✅
- `pinterest-rich-pin` = `true`

### Favicon / PWA — Present ✅
- `/favicon.svg` (SVG, any size)
- `/favicon.ico` (ICO, 32×32)
- `/apple-touch-icon.png` (180×180)
- `/icon-192.png` (192×192)
- `/icon-512.png` (512×512)
- `/safari-pinned-tab.svg` (monochrome)
- `/site.webmanifest` (name, short_name, theme_color, icons)
- `/browserconfig.xml` (Windows tiles)

### Organization JSON-LD — Present ✅
- `sameAs` array includes all 5 social profiles

---

## 3. Social Card Audit

Full audit: see `/docs/seo/social-card-audit.md`

**Summary:**
- 88 HTML pages audited
- 2,592 checks total
- **2,592 PASSED / 0 FAILED**
- All product pages pass product:price:amount, product:price:currency, product:availability, product:condition, product:brand
- All pages have pinterest-rich-pin, twitter:creator, og:image:width/height/type/alt

---

## 4. Platform Coverage

| Platform | Signal Used | Status |
|----------|------------|--------|
| X (Twitter) | twitter:card=summary_large_image | ✅ |
| Facebook | og:image 1200×630, og:type | ✅ |
| Facebook Shop | product:price:amount, product:availability | ✅ |
| Pinterest Rich Pins | og:type=product, og:image, pinterest-rich-pin | ✅ |
| LinkedIn | og:title ≤70, og:description ≤200 | ✅ |
| iMessage/WhatsApp | og:image 1200×630 | ✅ |
| TikTok | og:image, og:title | ✅ |
| Discord | og:title, og:description, og:image | ✅ |
| Slack | og:title, og:description, og:image | ✅ |

---

## 5. Share Buttons

- `ShareButtons.tsx` island placed on:
  - PDP (below gallery, above related products)
  - About Anna page (share section at bottom)
  - Blog post pages
- Buttons: Copy link, iMessage/SMS, WhatsApp, X, Pinterest, Facebook, Email
- Web Share API fallback on mobile (navigator.share)
- Analytics event fired on each share via `trackEvent`
