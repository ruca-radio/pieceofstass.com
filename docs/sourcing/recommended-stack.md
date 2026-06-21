# Recommended Supplier Stack — Piece of Stass
*Per-Category Tier-1 / Tier-2 Recommendations with Medusa.js Integration Paths*
*Sourcing & Supply Chain Analysis | June 2026*

---

## Summary Scorecard

| Category | Tier-1 (Primary) | Tier-2 (Backup) | Key Reason |
|----------|-----------------|-----------------|------------|
| Women's Fashion | **Trendsi** | Tasha Apparel | US warehouse, free, TikTok-native, 100k+ SKUs |
| Men's Fashion | **Spocket** | CJDropshipping (US wh.) | Best US-catalog for men's; API access |
| Kids' Fashion | **Spocket** | CJDropshipping | US/EU suppliers with kids' category |
| Watches | **CJDropshipping** (unbranded, US wh.) | WatchDropShip | US 2–5 days; must filter non-branded SKUs |
| Bags & Accessories | **Spocket** | CJDropshipping | Curated US/EU; no trademark exposure |
| Fragrance | **Blanka** + private-label path | Faire (indie fragrance brands) | Private-label = brand equity + legal safety |
| Tech Accessories | **CJDropshipping** (US wh.) | AppScenic | US warehouse; 2–5 day delivery; broad catalog |
| Piece of Stass Merch (POD) | **Printful** | Gelato | Medusa plugin available; best fulfillment network |

---

## Category-by-Category Justifications

---

### 1. Women's Fashion

**Tier-1: Trendsi** ([trendsi.com](https://www.trendsi.com/))

**Why:** Trendsi is purpose-built for exactly this use case — US-based DTC influencer storefronts selling Gen-Z women's fashion. The platform is:
- **Free** to use (no monthly fee; pay per order at wholesale price)
- Ships from a US warehouse in City of Industry, CA in **2–5 business days**
- Has **native Shopify + TikTok Shop integration** — the most direct path to social commerce monetization
- Carries 100,000+ curated trendy SKUs updated daily ("Trendsi Luxe" drops every business day)
- Offers **custom branded invoices**, private-label options, and 7-day free returns
- API + webhooks available on B2B/Pro plan for advanced integration

**Medusa.js Integration Path:**
Trendsi does not have an official Medusa plugin. Use the following approach:
1. Connect Trendsi to Shopify via native app (handles inventory sync, order routing, fulfillment)
2. If running Medusa as headless commerce backend with Shopify as fulfillment layer: use Medusa's [Shopify plugin](https://medusajs.com/integrations/) or Medusa's `@medusajs/fulfillment` module with a custom Trendsi webhook receiver
3. Trendsi provides order API and webhooks on Pro plan — implement a custom Medusa module at `/src/modules/trendsi/` that:
   - Polls Trendsi order status via REST
   - Maps Trendsi SKUs to Medusa product variants
   - Routes fulfillment events back to Medusa's order management

**Tier-2: Tasha Apparel** ([tashaapparel.com](https://www.tashaapparel.com/))

**Why:** Free dropship program, same-day LA dispatch (orders before 12pm PST), COGS $7.50–$16/piece. Lower catalog size (~thousands vs Trendsi's 100k+), but extremely fast fulfillment and great margin. Use as overflow/backup when Trendsi is out of stock on trending SKUs.

**Integration:** Manual order forwarding or Shopify webhook trigger. No public API; consider building a simple order-forwarding webhook in Medusa that posts order data to Tasha's portal.

---

### 2. Men's Fashion

**Tier-1: Spocket** ([spocket.co](https://www.spocket.co/))

**Why:** Spocket is the strongest curated US/EU supplier network for men's fashion outside of dedicated wholesale platforms. Key advantages:
- 80% of catalog is US/EU-sourced → 2–5 day delivery
- Men's fashion available (unlike Trendsi/Tasha which are women's-only)
- Vetted suppliers mean minimal trademark exposure
- Starts at $39.99/mo (Professional plan: 250 unique products sufficient for launch)
- Branded invoices on all plans

**Medusa.js Integration Path:**
Spocket has a Shopify app and a REST API. For Medusa:
1. Use Spocket's Shopify integration as the fulfillment layer, with Medusa sitting headless on top
2. Alternatively, use Spocket's product catalog API to sync products to Medusa's product catalog, then route orders via webhook to Spocket's order endpoint
3. No official Medusa plugin exists; build a custom Medusa module using Spocket's [developer API](https://app.spocket.co/developer) (available on Empire/Unicorn plans at $99–$299/mo)

**Tier-2: CJDropshipping (US Warehouse — Men's)** ([cjdropshipping.com](https://www.cjdropshipping.com/))

**Why:** CJ has US warehouse stock for men's basics and accessories. **Critical filter:** Only select SKUs marked "ships from US warehouse" to guarantee 2–5 day delivery. Avoid anything shipping from China warehouses for TikTok Shop orders (TikTok requires fast shipping guarantees). CJ has a published REST API, making Medusa integration more straightforward than most other suppliers.

**Medusa.js Integration Path (CJ):**
CJDropshipping provides a REST API with OAuth authentication. Build a Medusa custom module:
```
src/modules/cj-dropshipping/
  index.ts         # Module definition
  services/
    cj-api.ts      # CJ REST API client (products, orders)
  subscribers/
    order-placed.ts  # Subscribe to Medusa order events → push to CJ
    tracking-update.ts # CJ webhook → update Medusa fulfillment
```
Reference: [CJDropshipping API docs](https://cjdropshipping.com/doc/)

---

### 3. Kids' Fashion

**Tier-1: Spocket** ([spocket.co](https://www.spocket.co/))

**Why:** Spocket's US/EU supplier network includes children's apparel. Kids' fashion is a secondary category for Piece of Stass (mapping to Yupoo seller `775180006`); start with Spocket's curated catalog. Lower volume expected, so one integration handles both men's and kids'.

**Tier-2: CJDropshipping (US Warehouse — Kids')**

Kids' basics (t-shirts, seasonal sets, accessories) available in CJ's US warehouse. Same integration as men's above.

---

### 4. Watches (Unbranded Fashion Watches Only)

**Tier-1: CJDropshipping — US Warehouse, Fashion Watches** ([cjdropshipping.com](https://www.cjdropshipping.com/))

**Why:** CJ carries a large catalog of generic/house-brand fashion watches in their US warehouses. With US warehouse stock:
- 2–5 day US delivery via USPS/DHL
- No trademark exposure if SKUs are unbranded (generic dials, no logo mimicking Rolex/AP/etc.)
- Free platform; API available
- Typical COGS: $8–$25 for fashion watches from US warehouse

**Mandatory filtering rule:** In the CJ catalog, only select watches with no brand name on the dial that resembles a known luxury mark. Acceptable: generic brand names, house brands, custom label. Reject: any watches with logos or dial designs mimicking Rolex, AP, Cartier, Omega, etc.

**Tier-2: WatchDropShip** ([watchdropship.com](https://www.watchdropship.com/))

**Why:** 250+ authentic watch models, including legitimate mid-tier fashion watches. Shipping to US is €25.97 per unit; 5–10 business day delivery. Useful as a higher-quality tier. Note: WatchDropShip's catalog includes brand-name watches — if stocking genuine branded watches (not replicas), this is fully legal. However, confirm that genuine brands are included in their B2B reseller agreements.

---

### 5. Bags & Accessories

**Tier-1: Spocket** ([spocket.co](https://www.spocket.co/))

**Why:** Spocket's US/EU supplier catalog includes fashion bags, jewelry, and accessories. Curated for quality, fast shipping, no trademark exposure. For Gen-Z accessories (micro-bags, Y2K jewelry, belt bags), Spocket has strong coverage.

**Tier-2: CJDropshipping (US Warehouse)**

CJ's accessories catalog in US warehouses covers phone cases, jewelry, bags, and trendy accessories. Use CJ as the overflow/high-volume SKU catalog.

---

### 6. Fragrance

**Fragrance Strategy: Private-Label Over Dropship**

This is the highest-risk category from a trademark standpoint. The Yupoo seller `jmshop88` almost certainly carries branded or branded-adjacent fragrances. The only legally clean path is:

**Option A — Piece of Stass House Fragrance (Recommended)**
- Partner with a private-label fragrance manufacturer (no MOQ or low MOQ)
- Your brand name, custom label, generic fragrance formula (no reference to designer names)
- Sell as "Piece of Stass [Scent Name]" — never as "Chanel dupe" or "Baccarat Rouge inspired"

**Tier-1: Blanka** ([blankabrand.com](https://www.blankabrand.com/)) — beauty/cosmetics

- Zero MOQ private-label; Growth plan $39/mo
- 250+ pre-formulated products; custom logo on packaging
- US fulfillment 3–7 days
- Typical COGS: ~$10–$15/unit; retail $30–$45 → 50–65% gross margin
- **Note:** Blanka focuses on beauty/skincare/cosmetics. For fragrance specifically, extend with a perfume-specific private-label manufacturer (see Private Label Opportunity doc).

**Tier-2: Faire — Indie Fragrance Brands** ([faire.com](https://www.faire.com/))

Faire has curated indie fragrance brands (natural/clean/artisan). Buy wholesale (Net 60 available); resell under your store with full legitimacy. 15% Faire commission on reorders; 25% on first orders.

**Medusa.js Integration:**
- Blanka: Shopify-native app; for Medusa, use a custom integration module that pulls Blanka's product catalog and proxies orders via Blanka's Shopify webhook infrastructure
- Faire: No API; manual wholesale purchase; use Medusa's inventory management to track pre-purchased stock

---

### 7. Tech Accessories

**Tier-1: CJDropshipping — US Warehouse** ([cjdropshipping.com](https://www.cjdropshipping.com/))

**Why:** Tech accessories (phone cases, AirPod cases, cables, portable chargers, LED lighting) are CJ's strongest US-warehouse category. 2–5 day delivery; broad Gen-Z-relevant catalog; free platform with API.

**Filtering rule:** Avoid any listings that reference Apple, Samsung, or other brand logos/trademarks. Generic cases (no brand logos), USB-C cables, and trendy electronics accessories are safe.

**Tier-2: AppScenic** ([appscenic.com](https://appscenic.com/))

AppScenic's US/UK/EU supplier network covers tech accessories. Standard plan at $39/mo; instant price/stock sync; domestic US suppliers guarantee fast delivery.

---

### 8. Piece of Stass Branded Merch (Print-on-Demand)

**Tier-1: Printful** ([printful.com](https://www.printful.com/))

**Why:**
- **Medusa.js plugin available** (`medusa-plugin-printful` on GitHub — community-supported, installable via `yarn add medusa-plugin-printful`)
- Free plan; Growth plan $24.99/mo gives up to 33% off products
- US + global fulfillment centers → 2–5 day US delivery
- 508 products: apparel, accessories, bags, home goods
- Branded packaging, custom labels, branded inserts available
- Automatic order fulfillment via webhook integration

**Medusa.js Integration (Printful — Detailed):**
```bash
# Install plugin
yarn add medusa-plugin-printful

# In medusa-config.js
plugins: [
  {
    resolve: "medusa-plugin-printful",
    options: {
      printfulToken: process.env.PRINTFUL_API_TOKEN,
      storeId: process.env.PRINTFUL_STORE_ID,
    }
  }
]
```
Plugin syncs product details between Printful and Medusa, auto-updates products from Printful webhook events, and handles order fulfillment automatically. Reference: [medusa-plugin-printful GitHub](https://github.com/fsyntax/medusa-plugin-printful)

**Tier-2: Gelato** ([gelato.com](https://www.gelato.com/))

**Why:** Local production in 33 countries (best international shipping), no commission fees, free plan available. Gelato+ at $25/mo provides 25% off products. REST API available for custom Medusa integration.

**Medusa.js Integration (Gelato — Custom):**
Gelato has a REST API. Build a custom Medusa fulfillment provider:
```
src/modules/gelato/
  fulfillment-provider.ts   # Implements Medusa FulfillmentProvider interface
  services/
    gelato-api.ts           # Gelato REST client
  subscribers/
    order-created.ts        # → POST /api/v3/orders to Gelato
```

---

## Full Integration Architecture Diagram

```
Medusa.js (Backend)
├── Store API → Next.js Storefront (pieceofstass.com)
├── Admin API → Internal dashboard
│
├── Fulfillment Modules
│   ├── Printful Module (medusa-plugin-printful)
│   │     └── POD merch: tees, hoodies, accessories
│   ├── CJDropshipping Module (custom)
│   │     ├── US warehouse: watches (unbranded), tech accessories, men's/kids' basics
│   │     └── Filter: US warehouse only for TikTok Shop orders
│   ├── Trendsi Module (custom webhook)
│   │     └── Women's fashion: 100k+ SKUs → auto-fulfill via Trendsi API
│   └── Blanka Module (custom via Shopify bridge)
│         └── Private-label beauty/fragrance → US fulfillment 3–7 days
│
├── Inventory Sync
│   ├── Spocket (Shopify layer or direct API) → men's/kids'/bags/accessories
│   └── AppScenic (backup) → tech accessories
│
└── Payment
    ├── Stripe (safe with all above suppliers)
    └── Shop Pay / Afterpay (via Shopify if needed)
```

---

## Quick-Start Priority Order (Week 1)

1. Install **Trendsi** Shopify app → import 50–100 women's hero SKUs → push to TikTok Shop
2. Install **medusa-plugin-printful** → create 5–10 Piece of Stass branded SKUs
3. Sign up for **Spocket Professional** ($39.99/mo) → import men's/bags/accessories catalog
4. Register **CJDropshipping** → filter US warehouse only → import watches + tech accessories
5. Register **Blanka Growth** ($39/mo) → design 3 private-label beauty hero SKUs

---

## Sources

- [Trendsi Shopify integration & API docs](https://help.trendsi.com/) | [Trendsi TikTok Shop guide](https://help.trendsi.com/hc/en-us/articles/28313625082267)
- [Spocket pricing](https://www.spocket.co/pricing)
- [CJDropshipping API documentation](https://cjdropshipping.com/doc/)
- [Printful Medusa plugin (GitHub)](https://github.com/fsyntax/medusa-plugin-printful)
- [Medusa.js integrations overview](https://medusajs.com/integrations/)
- [Medusa.js plugin development docs](https://docs.medusajs.com/v1/development/plugins/overview)
- [Blanka brand site — zero MOQ details](https://blankabrand.com)
- [WatchDropShip product catalog](https://www.watchdropship.com)
- [Gelato subscription plans](https://www.gelato.com/subscription-plans)
