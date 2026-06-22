# Pricing Audit — Piece of Stass

Audit date: June 22, 2026

## Executive summary

All 80 SKUs were repriced into the approved category floor/sweet-spot/ceiling framework, with every product and variant price ending in `.99` and every `compare_at_price` set 30-50% above active price.
The estimated blended gross margin is **61.3%**, using category-level COGS proxies aligned to `docs/sourcing/cost-model.md` and the requested category target margins.
The catalog now reads as an accessible trend boutique rather than replica-luxury pricing: high-perceived-value watches and bags still anchor the assortment, while basics, kids, fragrance, and tech add-ons are priced for conversion and bundling.

## Inputs and assumptions

- Source catalog: `data/products.json`
- Cost model: [`docs/sourcing/cost-model.md`](../sourcing/cost-model.md)
- Catalog strategy: [`docs/catalog/catalog-strategy.md`](../catalog/catalog-strategy.md)
- Category bands: supplied in task brief; used as hard floor/ceiling constraints.
- Margin model: category target gross margins were used as the COGS proxy; these targets match the cost-model ranges for clean suppliers and preserve the requested 59-65% blended margin.

## Before/after price distribution by category

| Category | Count | Before min | Before median | Before max | After min | After median | After max |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Footwear | 10 | $149.00 | $159.00 | $179.00 | $76.99 | $87.99 | $96.99 |
| Watches | 10 | $249.00 | $259.00 | $279.00 | $96.99 | $123.99 | $148.99 |
| Bags | 10 | $189.00 | $199.00 | $219.00 | $58.99 | $74.99 | $96.99 |
| Women | 10 | $138.00 | $148.00 | $168.00 | $29.99 | $61.49 | $74.99 |
| Men | 10 | $98.00 | $108.00 | $128.00 | $38.99 | $55.99 | $82.99 |
| Kids | 10 | $72.00 | $82.00 | $102.00 | $24.99 | $32.49 | $42.99 |
| Fragrance | 10 | $68.00 | $78.00 | $98.00 | $39.99 | $47.99 | $58.99 |
| Tech | 10 | $119.00 | $129.00 | $149.00 | $24.99 | $43.99 | $68.99 |

## Estimated blended margin

| Category | Avg updated price | Assumed all-in COGS / unit | Target GM | Revenue weight | COGS basis |
| --- | ---: | ---: | ---: | ---: | --- |
| Bags | $75.59 | $26.46 | 65% | 14.2% | 35% of updated retail (CJ/Spocket/MTO bag range) |
| Footwear | $87.49 | $35.00 | 60% | 16.5% | 40% of updated retail (prompt target GM proxy) |
| Fragrance | $48.49 | $14.55 | 70% | 9.1% | 30% of updated retail (private-label fragrance range) |
| Kids | $32.99 | $13.86 | 58% | 6.2% | 42% of updated retail (Spocket/CJ kids range) |
| Men | $57.79 | $23.12 | 60% | 10.9% | 40% of updated retail (Spocket/CJ/FashionGo range) |
| Tech | $46.59 | $23.30 | 50% | 8.8% | 50% of updated retail (CJ/AppScenic/Spocket tech range) |
| Watches | $122.39 | $46.51 | 62% | 23.0% | 38% of updated retail (CJ fashion/watch mix target) |
| Women | $59.89 | $22.76 | 62% | 11.3% | 38% of updated retail (Trendsi/Tasha/Spocket range) |

**Estimated blended gross margin:** 61.3%

This is inside the `cost-model.md` blended target of 59-65% while leaving room for controlled promotional discounts.

## Spot-checks

| Product | Category | Old price | New price | New was price | Reasoning |
| --- | --- | ---: | ---: | ---: | --- |
| White cement high-top court sneaker | Footwear | $149.00 | $82.99 | $118.99 | Core retro high-top moved into the footwear sweet spot; high enough to protect margin without looking like premium sneaker resale. |
| Skeleton dial automatic watch | Watches | $259.00 | $148.99 | $200.99 | Most premium watch silhouette in the set, so it stays in the upper half while still below the watch ceiling. |
| Mini box crossbody bag | Bags | $189.00 | $58.99 | $86.99 | Small entry crossbody moved to the low end of the bag sweet spot to create an accessible add-on option. |
| Oversized travel tote bag | Bags | $199.00 | $96.99 | $130.99 | Larger travel utility earns the highest bag price, but remains below the $128 ceiling. |
| Lightweight zip jacket | Men | $128.00 | $82.99 | $115.99 | Outerwear has higher perceived value and likely higher landed cost, so it sits above core tees/knits. |
| Clean letter-print baby tee | Women | $148.00 | $29.99 | $42.99 | Basic fitted tee reset to an entry fashion price instead of an unrealistic dress-level price. |
| Rosette trim strappy dress | Women | $168.00 | $74.99 | $109.99 | Event-ready detail justifies upper-half women's pricing while remaining below $98. |
| Kids cork-footbed slide sandal | Kids | $72.00 | $24.99 | $35.99 | Simple slide sandal repriced as a low-risk entry kids item. |
| Spiced leather eau de parfum | Fragrance | $98.00 | $58.99 | $80.99 | Deeper unisex scent positioned as premium fragrance but under the $78 category ceiling. |
| Smartwatch silicone strap set | Tech | $129.00 | $24.99 | $36.99 | Accessory set reset to the tech floor because it is a low-complexity add-on, not a device. |

## Top-line revenue model

- Average item price after repricing: **$66.40**
- Assumed units per order: **1.45**; this assumes one core item plus occasional add-on/bundle attach.
- Assumed AOV: **$96.28**
- Estimated blended gross margin: **61.3%**
- Monthly stack cost from `cost-model.md`: **$142.98**
- Direct platform-cost break-even: **3 orders/month**, or about **150 sessions/month** at a **2.0%** conversion rate.
- Conservative cost-model break-even volume: **30 orders/month**, or about **1,500 sessions/month** at a **2.0%** conversion rate.

Use the conservative 30-order target for launch planning because it absorbs supplier subscriptions, operational variance, and early refund/exchange noise better than the pure subscription-cost calculation.

## Sale strategy recommendations

- Keep everyday active prices stable for at least 21-30 days after launch so the `compare_at_price` anchors feel believable.
- Use sitewide promos sparingly: 10-15% is safe for normal events; 20% should be reserved for short holiday windows or cart-recovery offers.
- Avoid 30%+ blanket discounts; they compress the blended margin below the positioning target and train customers to wait.
- Fragrance should rarely be discounted directly; use bundles instead, such as buy two scents and save 10%, or free shipping over an AOV threshold.
- Kids and tech accessories are best used as AOV builders: bundle add-ons at 10-15% off rather than marking down hero fashion items.
- For clearance, cap markdowns at 25% and apply only to slow movers after 45-60 days or when a supplier/colorway is being retired.
- Preserve premium signals on watches and structured bags: use gift-with-purchase or free shipping before cutting price.

## Validation

- JSON parse validation passed after write.
- All active prices and compare-at prices end in `.99`.
- Every `compare_at_price` is 30-50% above active price.
- Variant `prices[].amount` values were synchronized with product-level active prices.
