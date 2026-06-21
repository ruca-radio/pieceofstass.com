# Catalog Strategy — Piece of Stass

## Positioning
Piece of Stass should publish this assortment as **unbranded / inspired-by** fashion, fragrance, watch, kids, and tech accessories. The source catalogs are internal supplier references only; customer-facing copy must describe silhouette, material impression, color, function, and vibe without naming or implying a protected brand.

## IP scrub workflow
1. Import supplier album title, image URL, album URL, source, category, and rough size/color clues into the internal catalog sheet.
2. Run the title and notes through the banned-term regex rules in `scrub-rules.md`.
3. Rewrite titles as generic descriptors: product type + silhouette + color/material detail, e.g. `Chunky white dad runner sneaker` or `Quilted flap crossbody bag`.
4. Rewrite descriptions from scratch in Piece of Stass voice: concise, trend-aware, and focused on styling use cases.
5. Do not publish supplier notes, source titles, factory claims, model names, SKU codes from copied brands, or image alt text that contains trademarks.
6. Keep `supplier_url` and `supplier_id` internal; do not expose them in storefront APIs, SEO fields, sitemap entries, or structured data.

## Naming conventions
- Formula: `{material/color/detail} + {silhouette} + {product type}`.
- Prefer terms such as `court sneaker`, `runner sneaker`, `flap crossbody`, `dress-sport watch`, `floral maxi dress`, `wireless earbuds`.
- Avoid lookalike claims: no `dupe`, `replica`, `1:1`, `inspired by [brand]`, `same as`, `factory`, `mirror`, or model references.
- Handles should be lowercase hyphenated slugs derived only from cleaned titles.
- SKUs use `POS-{category}-{item}-{variant}` and never supplier codes containing brand references.

## Pricing strategy
Use a 2.5x-4x markup on landed cost, with higher markups on lower-ticket, high-perceived-value items and lower markups on bulky or support-heavy items.

| Tier | Category examples | Suggested markup | Seed MSRP approach |
| --- | --- | ---: | --- |
| Value add-ons | Fragrance, tech accessories, kids sandals | 3.0x-4.0x | $58-$129, with bundles encouraged |
| Core fashion | Men, women, footwear | 2.8x-3.5x | $88-$189 depending on silhouette and size complexity |
| Premium accessories | Bags, watches | 2.5x-3.2x | $179-$279 with higher compare-at anchoring |

`compare_at_price` should usually sit 35%-55% above active price. Avoid fake luxury anchoring; use believable boutique-style crossed-out prices.

## Category taxonomy
Top-level categories are: Footwear, Watches, Bags, Men, Women, Kids, Fragrance, and Tech. Keep the first Medusa import flat; add subcategories later only when a category has at least 30 live SKUs.

## Variant model
- Footwear: `Color` + EU sizes, usually 36-46/47.
- Kids: `Color` + EU kids sizes, usually 22-37.
- Apparel: `Color` + S/M/L/XL, with extended size variants added only when supplier confirms.
- Bags and watches: `Color` + `One size`.
- Fragrance: `Scent` + bottle size, initially 50 ml and 100 ml.
- Tech: `Color` + `Standard`; add storage/device compatibility only after supplier confirmation.

## Dropship workflow
1. Customer orders from Piece of Stass storefront.
2. Ops checks fraud risk and verifies selected variant in Medusa admin.
3. Ops sends internal `supplier_url`, cleaned customer variant, quantity, and ship-to details to the supplier contact channel.
4. Supplier confirms stock, QC photos if available, packing method, and dispatch timing.
5. Ops enters tracking into Medusa and flags delayed orders if no scan appears within 72 hours of dispatch.
6. If supplier requests substitution, customer must approve a clean customer-facing descriptor and image before fulfillment.

## Supplier reliability notes
- Footwear source `chenyico` (https://chenyico.x.yupoo.com/albums?tab=gallery): page returned many album records and image URLs, but also shows encrypted/password text; treat availability as high catalog depth but verify size/color before each order.
- Watches source `117034687` (https://117034687.x.yupoo.com/albums?tab=gallery): album records are visible, but visible titles heavily repeat a protected mark; use only internal references and require QC images before sale.
- Bags source `3293950449` (https://3293950449.x.yupoo.com/albums?tab=gallery): rich album records and image URLs were visible; many source categories are trademark-labeled, so all customer copy must be rewritten.
- Men source `miao2017` (https://miao2017.x.yupoo.com/albums?tab=gallery): broad apparel category structure and many album records are visible; supplier titles often include abbreviations that map to protected brands, so do not reuse titles.
- Women source `ypd2023` (https://ypd2023.x.yupoo.com/albums?tab=gallery): strong live album sampling for sets and dresses; supplier notes mention delayed fulfillment, so communicate conservative processing times internally.
- Kids source `775180006` (https://775180006.x.yupoo.com/albums?tab=gallery): many visible kid shoe albums with sizes in titles; still scrub all brand/model words before publishing.
- Fragrance source `jmshop88` (https://jmshop88.x.yupoo.com/categories/4594940): category and image URLs are visible but album titles are mostly numeric; SKUs here are synthesized by scent family and must be verified before launch.
- Tech source `xtd8288` (https://xtd8288.x.yupoo.com/categories/654824): category and image URLs are visible, but source categories contain protected electronics marks; keep product names generic and verify compatibility claims.

## Data notes
The seed catalog uses real Yupoo album/image URLs when the page exposed them. Fragrance and some tech titles were synthesized from category norms because source album titles were not descriptive, while supplier URLs remain attached for internal review.
