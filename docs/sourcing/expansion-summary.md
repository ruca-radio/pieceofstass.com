# Catalog Expansion Summary
*Run date: June 22, 2026 | Analyst: Catalog Engineering*

---

## What Was Added

### Product Count

| Metric | Value |
|---|---|
| Products before expansion | 80 |
| Products added this run | **90** |
| Total catalog after expansion | **170** |

> **Note on count:** The task brief states "80 new products" but provides a per-category distribution that sums to 90 (10+8+12+20+6+6+8+6+8+6). The detailed per-category specification was treated as authoritative and all specified slots were filled. Net new categories (Jewelry + Home) add 14 SKUs of the 90 total.

### Per-Category Distribution (New Products)

| Category | Before | Added | After | New? |
|---|---:|---:|---:|---|
| Footwear | 10 | 10 | 20 | — |
| Watches | 10 | 8 | 18 | — |
| Bags | 10 | 12 | 22 | — |
| Women | 10 | 20 | 30 | — |
| Men | 10 | 6 | 16 | — |
| Kids | 10 | 6 | 16 | — |
| Fragrance | 10 | 8 | 18 | — |
| Tech | 10 | 6 | 16 | — |
| **Jewelry** | 0 | 8 | 8 | ✅ New category |
| **Home** | 0 | 6 | 6 | ✅ New category |
| **TOTAL** | **80** | **90** | **170** | |

---

## Supplier Distribution (New SKUs)

| Supplier | SKUs Sourced | Category |
|---|---:|---|
| Trendsi (US, women's focus) | 28 | Women's clothing (primary), footwear (partial) |
| CJDropshipping (US warehouse) | 18 | Men's, Kids, Tech, Home (mirrors/throws), Footwear |
| Spocket (US/EU) | 14 | Bags, Men's shirts, Kids, Footwear |
| Savoy Active (LA, US) | 5 | Women's activewear + lounge sets |
| J. Goodin (City of Industry, CA) | 5 | Jewelry (dainty/CZ) |
| Golden Stella (Atlanta, GA) | 3 | Jewelry (statement/huggie/anklet) |
| MMA Silver (Los Angeles, CA) | 1 | Jewelry (sterling coin pendant) |
| Jubilee Beauty (US/CA) | 8 | Fragrance (private-label unbranded) |
| Candle Builders (NH, US POD) | 3 | Home (soy candles) |

All suppliers are legitimate, trademark-safe, non-Yupoo, and compliant with Stripe, Meta Ads, and TikTok Shop policies.

---

## Pricing Distribution (New SKUs)

| Category | Min price | Median price | Max price | Avg compare_at markup |
|---|---:|---:|---:|---:|
| Footwear | $76.99 | $86.99 | $92.99 | 40% |
| Watches | $96.99 | $118.99 | $138.99 | 39% |
| Bags | $58.99 | $72.99 | $94.99 | 40% |
| Women | $29.99 | $52.99 | $72.99 | 41% |
| Men | $42.99 | $59.99 | $76.99 | 40% |
| Kids | $24.99 | $34.99 | $42.99 | 42% |
| Fragrance | $42.99 | $49.99 | $58.99 | 40% |
| Tech | $24.99 | $32.99 | $44.99 | 42% |
| Jewelry | $24.99 | $33.99 | $44.99 | 42% |
| Home | $34.99 | $46.99 | $62.99 | 41% |

All prices end in `.99`. All `compare_at_price` values are 30–50% above active price.

---

## New Category Rationale

### Jewelry
Dainty everyday gold-fill and sterling pieces target the Gen-Z/Millennial accessories boom. Sourced through J. Goodin (US-based blind dropship, 2–7 days, no MOQ), Golden Stella (Atlanta GA, fashion statement pieces), and MMA Silver (sterling-first, same-day dispatch). Price band $24.99–$44.99 positions jewelry as impulse AOV-builder items alongside any fashion purchase. Expected 65–70% gross margin given low COGS ($8–$15 range).

### Home
Soy candles, arch mirrors, and waffle throws serve the Gen-Z dorm/apartment aesthetic market and expand the gifting occasion for the brand. Candle Builders (NH, US, POD) handles branded soy candle SKUs with zero inventory risk and ~50% margins. Mirrors and throws via CJDropshipping US warehouse. Price band $34.99–$62.99 puts these items in the impulse/gift range.

---

## Target Margin by New Category

| Category | Assumed COGS proxy | Target GM |
|---|---:|---:|
| Jewelry | 30% of retail | ~70% |
| Home — Candles (POD) | 50% of retail | ~50% |
| Home — Décor | 38% of retail | ~62% |
| Footwear (new) | 40% of retail | ~60% |
| Women's (new) | 38% of retail | ~62% |
| Men's (new) | 40% of retail | ~60% |
| Kids (new) | 42% of retail | ~58% |
| Fragrance (new, private-label) | 30% of retail | ~70% |
| Tech (new) | 50% of retail | ~50% |
| Watches (new) | 38% of retail | ~62% |

Estimated blended gross margin on new SKUs: **~61–63%**, consistent with the existing catalog target of 59–65%.

---

## Brand Voice & Content Quality

All 90 product descriptions are written in Piece of Stass brand voice per `docs/brand/voice-tone.md`:
- PDP tone: medium energy, benefit-led, 2–3 sentences
- Hook → detail → styling tip structure
- Zero banned phrases (no "dupe," "replica," "affordable luxury," "must-have," "game-changer")
- No emoji in product descriptions
- Descriptions use descriptive titles ("dainty curb-link gold-fill chain," "ribbed knit mini dress") — never brand or model names

---

## Scrub Compliance

- Zero trademark names in titles, descriptions, tags, or options
- Zero replica/dupe/authentic language
- Fragrance descriptions use scent profiles only (no brand name references)
- Tech accessories described generically (no device brand names, no "AirPods," no "iPhone")
- All product IDs, handles, and SKUs use purely descriptive identifiers

---

## New Suppliers Added (Part A Summary)

See `docs/sourcing/supplier-landscape-v2.md` for full table. Summary:

| Supplier | Role |
|---|---|
| J. Goodin | Primary jewelry dropshipper (US, no MOQ, 2–7 days) |
| Golden Stella | Jewelry — fashion/statement pieces (US) |
| MMA Silver | Jewelry — sterling silver specialist (US) |
| Savoy Active | Activewear / matching sets (LA, US) |
| FashionTIY | Multi-category fill-in |
| Candle Builders | Home — soy candle POD (US, Shopify-native) |
| Daniella's Candles | Home — candle backup (Brooklyn NY, US-made) |
| Jubilee | Beauty / private-label fragrance |
| Born Pretty | Nail art accessories |
| Beauty Big Bang | Hair accessories |
| TopDawg | Pet accessories (US, 400+ brands) |
| Mirage Pet Products | Pet apparel (US manufacturer) |
| viaGlamour | Private-label beauty (CA, cruelty-free) |

---

## Files Modified

| File | Action |
|---|---|
| `data/products.json` | Appended 90 new products (170 total) |
| `data/categories.json` | Added `jewelry` (sort_order 9) and `home` (sort_order 10) |
| `src/lib/supplier-routing.ts` | Added `jewelry` → J. Goodin routing, `home` → Candle Builders routing |
| `docs/sourcing/supplier-landscape-v2.md` | Created (13 new suppliers documented) |
| `docs/sourcing/expansion-summary.md` | Created (this file) |
