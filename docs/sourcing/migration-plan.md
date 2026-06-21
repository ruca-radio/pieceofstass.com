# 90-Day Yupoo Migration Plan — Piece of Stass
*From Replica Exposure to a Clean, Legitimate Supplier Stack*
*Sourcing & Supply Chain Analysis | June 2026*

---

## Why This Migration Is Urgent

| Risk Factor | Current Yupoo State | Severity |
|-------------|--------------------|---------:|
| Trademark / replica exposure | High — most Yupoo catalogs list branded/inspired items | 🔴 Critical |
| Payment friction | Western Union / WeChat Pay; no buyer protection | 🔴 Critical |
| Stripe account risk | Stripe terminates accounts selling counterfeit goods | 🔴 Critical |
| Meta/TikTok ad ban | Ad platforms scan product listings for TM violations | 🔴 Critical |
| Shipping speed | 15–30 days from China → high return/chargeback rate | 🟠 High |
| No API/automation | Manual order forwarding → operational bottleneck | 🟠 High |
| US Customs risk | Counterfeit goods are seized under 19 U.S.C. §1526 | 🔴 Critical |

**Bottom line:** Running Yupoo SKUs through Stripe + Meta/TikTok is an existential risk. One platform flag or customs seizure can shut down the store and expose Anna personally to trademark infringement liability.

---

## Yupoo SKU Risk Scoring

| Yupoo Catalog | Category | Trademark Risk | Replacement Priority | Recommended Replacement |
|---------------|----------|:--------------:|:-------------------:|------------------------|
| chenyico | Footwear | 🔴 CRITICAL — likely Nike/Adidas/New Balance-adjacent styles | Week 1 | CJDropshipping (unbranded sneakers, US wh.) + Spocket fashion footwear |
| 117034687 | Watches | 🔴 CRITICAL — Rolex/AP/Cartier-adjacent | Week 1 | CJDropshipping (unbranded fashion watches, US wh.) |
| 3293950449 | Bags | 🔴 CRITICAL — LV/Gucci/Prada-adjacent | Week 1 | Spocket (fashion bags, no TM) + CJDropshipping |
| miao2017 | Men's Fashion | 🟠 HIGH — Off-White/Supreme/Stone Island-adjacent | Week 2 | Spocket men's catalog |
| ypd2023 | Women's Fashion | 🟠 HIGH — various fast-fashion brand replicas | Week 1 | Trendsi (US warehouse, 2–5 days) |
| 775180006 | Kids' | 🟡 MEDIUM — kids' brands (Nike Kids, Gap Kids) | Week 3 | Spocket kids' + CJDropshipping |
| jmshop88 | Fragrance | 🔴 CRITICAL — almost certainly branded fragrance bottles/names | Week 1 | Blanka private-label beauty (transition); private-label fragrance manufacturer |
| xtd8288 | Electronics/Tech | 🟠 HIGH — Apple/Samsung-branded accessories | Week 2 | CJDropshipping (unbranded tech accessories, US wh.) |

**Legend:** 🔴 CRITICAL = immediate removal risk (Stripe termination, customs seizure, TM lawsuit) | 🟠 HIGH = remove within 30 days | 🟡 MEDIUM = plan replacement within 60 days

---

## 90-Day Migration Timeline

### PHASE 1 — Foundation Setup (Days 1–14)

**Goal:** Get legitimate suppliers live; remove highest-risk Yupoo SKUs from active listings.

#### Week 1 (Days 1–7)

**Day 1–2: Accounts & Legal**
- [ ] Register business entity (LLC) if not done — creates legal separation
- [ ] Open dedicated Stripe account for pieceofstass.com (if using personal, migrate to business)
- [ ] Sign up: Trendsi (free), CJDropshipping (free), Blanka Growth ($39/mo), Printful (free)
- [ ] Sign up: Spocket Professional ($39.99/mo)
- [ ] Remove ALL 🔴 CRITICAL Yupoo listings from active storefront immediately (bags, watches, fragrance, footwear)

**Day 3–5: Catalog Building**
- [ ] Trendsi → import 75–100 women's fashion SKUs (dresses, tops, denim, accessories) → set retail at 2.5–3x Trendsi wholesale
- [ ] CJDropshipping → filter US warehouse only → import 20–30 unbranded fashion watches + 20–30 unbranded sneakers/footwear → tag clearly "fashion watch," "unbranded sneaker"
- [ ] Printful → create 5 Piece of Stass branded SKUs: logo tee, logo hoodie, canvas tote, phone case, water bottle

**Day 6–7: Tech Setup**
- [ ] Connect Trendsi to Shopify (native app install)
- [ ] Install medusa-plugin-printful (or set up Shopify-Printful integration as bridge)
- [ ] Connect CJDropshipping to Shopify (CJ Shopify app)
- [ ] Test end-to-end order flow: place test order → confirm routing → confirm fulfillment → confirm tracking

**Phase 1 KPIs:**
- 100+ legitimate SKUs live
- 0 🔴 CRITICAL Yupoo SKUs active
- Test orders completed for all 3 new suppliers
- Meta/TikTok pixel re-enabled with compliant product listings

---

#### Week 2 (Days 8–14)

**Day 8–10: Men's / Kids' / Accessories**
- [ ] Spocket → import men's fashion (30–50 SKUs), kids' fashion (15–20 SKUs), bags/accessories (20–30 SKUs)
- [ ] Remove 🟠 HIGH-risk Yupoo men's and women's listings (miao2017, ypd2023)
- [ ] CJDropshipping → import unbranded tech accessories (phone cases, AirPod cases, cables, portable chargers) — US warehouse only

**Day 11–14: Fragrance Transition**
- [ ] Remove ALL jmshop88 fragrance listings immediately
- [ ] Launch Blanka private-label beauty (3 SKUs: lip gloss, mascara, face serum) as fragrance-adjacent bridge
- [ ] Start researching private-label fragrance manufacturer (see private-label-opportunity.md) — request samples from Wicked Good Perfume ($18 MOQ) and Project Fragrance (250-unit MOQ)
- [ ] On Faire: browse and order samples from 2–3 indie fragrance brands for stocked inventory test

**Phase 1 Deliverables:**
- ✅ All 🔴 CRITICAL Yupoo SKUs removed
- ✅ 150+ legitimate SKUs live across Women's/Men's/Kids'/Accessories/POD/Beauty
- ✅ Trendsi + Spocket + CJDropshipping + Printful + Blanka all integrated and tested
- ✅ Stripe account clean (no counterfeit product exposure)
- ✅ Meta/TikTok ad campaigns re-enabled with compliant listings

---

### PHASE 2 — Top-Seller Migration (Days 15–42)

**Goal:** Identify Yupoo's top-selling SKU archetypes; find direct legitimate equivalents; build revenue parity.

#### Week 3–4 (Days 15–28)

**Top-Seller Identification:**
- [ ] Pull last 90 days of Yupoo-sourced order data
- [ ] Identify top 20 SKUs by revenue and top 20 by units sold
- [ ] Categorize each: what was the customer actually buying? (e.g., "oversized logo hoodie" → replicate with Printful; "crossbody micro-bag" → Spocket equivalent)

**Equivalent-Matching Process:**
| Yupoo Category | Customer Intent | Legitimate Equivalent | Sourcing Path |
|---------------|-----------------|----------------------|---------------|
| Luxury-adjacent bag | Status accessory, trendy | Unbranded fashion micro-bag, quilted chain bag | Spocket or CJDropshipping |
| "Designer" sneaker | Trendy, streetwear | Unbranded fashion sneaker, platform shoe | CJDropshipping (US wh.) |
| Luxury watch | Minimal timepiece aesthetic | Generic fashion minimalist watch | CJDropshipping (US wh.) |
| "Designer" fragrance | Luxury scent ritual | Piece of Stass house fragrance (private label) | Private-label manufacturer |
| Branded streetwear | Status/logo dressing | Piece of Stass logo pieces (POD) | Printful |
| Fast fashion women's | Trend-driven, affordable | Trendsi equivalent styles | Trendsi |

**Content Strategy (concurrent):**
- [ ] Reframe product positioning: "Piece of Stass aesthetic" not "inspired by [brand]"
- [ ] Replace all product descriptions that reference any brand name
- [ ] Create new UGC/influencer content showcasing legitimate products

#### Week 5–6 (Days 29–42)

- [ ] Migrate remaining 🟠 HIGH Yupoo SKUs (kids' fashion, remaining men's)
- [ ] Launch private-label fragrance samples on store (Blanka or indie fragrance via Faire)
- [ ] A/B test Trendsi vs Tasha Apparel for women's top categories — compare sell-through rate and margin
- [ ] Set up CJDropshipping US-warehouse-only filter as permanent rule for all new product adds

**Phase 2 KPIs:**
- 0 remaining 🟠 HIGH Yupoo SKUs active
- 250+ total legitimate SKUs live
- Private-label fragrance proto-launch (minimum 1 SKU)
- Revenue run-rate ≥ 80% of prior Yupoo-era baseline (legitimate replacement products)

---

### PHASE 3 — Full Yupoo Deprecation (Days 43–90)

**Goal:** Complete the transition; optimize margins; build defensible brand equity.

#### Week 7–9 (Days 43–63)

- [ ] Remove final 🟡 MEDIUM Yupoo SKUs (remaining kids' items)
- [ ] Scale Trendsi to 300+ active women's SKUs (auto-import daily Luxe drops)
- [ ] Build out CJDropshipping US-warehouse-only product feed via API integration
- [ ] Launch Piece of Stass private-label fragrance line (1–3 scents) — see private-label-opportunity.md
- [ ] Set up automated inventory sync: Trendsi → Medusa/Shopify (daily stock refresh)
- [ ] Negotiate Trendsi Pro plan for branded labels and custom packaging

#### Week 10–12 (Days 64–90)

- [ ] **Final Yupoo deprecation:** Delete all remaining Yupoo-sourced product listings
- [ ] Disconnect all Yupoo payment channels (Western Union, WeChat)
- [ ] Run post-migration margin analysis (compare to Yupoo-era blended margins)
- [ ] Implement automated reorder rules for any stocked inventory
- [ ] Apply for Stripe Business Verified status with clean product catalog
- [ ] Submit TikTok Shop affiliate application with compliant product catalog
- [ ] Launch Meta Advantage+ Shopping Campaigns with new compliant catalog feed

**Phase 3 KPIs:**
- ✅ 0 Yupoo SKUs anywhere in the store
- ✅ 400+ legitimate SKUs live (Women's, Men's, Kids', Watches, Bags, Tech, Fragrance, Merch)
- ✅ 3–5 business day average US delivery (vs. prior 15–30 days)
- ✅ Stripe, Meta, TikTok all operating without flags
- ✅ Private-label fragrance live and generating revenue
- ✅ Gross margin ≥ 45% blended (vs ~50–60% on Yupoo but with existential legal risk)

---

## Risk Management During Migration

### Transition Revenue Risk
**Risk:** Removing Yupoo SKUs before replacements are live → revenue gap  
**Mitigation:** Phase 1 loads 150+ legitimate SKUs before removing any Yupoo listings. Only remove a category AFTER its replacement is live and tested.

### Customer Communication
**Risk:** Customers who bought specific Yupoo items return/complain when style is no longer available  
**Mitigation:** Run a "New Season Drop" campaign to reframe the catalog refresh as a brand evolution, not a rollback.

### Existing Yupoo Orders In-Flight
**Risk:** Open Yupoo orders during the migration window  
**Mitigation:** Honor all orders already placed. Do NOT accept new Yupoo orders for 🔴 CRITICAL categories after Day 1.

### Supplier Reliability Verification
Before going live with each new supplier, complete a test order protocol:
1. Order 1 unit of 3 different SKUs (use a test shipping address)
2. Record actual shipping time vs. advertised
3. Photograph product on arrival (quality check)
4. Confirm tracking was provided
5. Only publish supplier's catalog to live storefront after passing test

---

## 90-Day Milestone Summary

```
Day 1:   Remove 🔴 CRITICAL Yupoo listings. Sign up for Trendsi, Spocket, CJ, Blanka, Printful.
Day 7:   150+ legitimate SKUs live. All new supplier integrations tested.
Day 14:  Men's/Kids'/Accessories live. All 🟠 HIGH Yupoo listings removed.
Day 28:  Top-seller equivalents identified and live. Fragrance transition begun.
Day 42:  250+ legitimate SKUs. Revenue parity with Yupoo baseline.
Day 63:  300+ SKUs. Private-label fragrance live. API integrations stable.
Day 90:  COMPLETE YUPOO DEPRECATION. 400+ SKUs. Stripe/Meta/TikTok clean.
```

---

## Sources

- [Trendsi TikTok Shop integration](https://help.trendsi.com/hc/en-us/articles/28313625082267)
- [CJDropshipping US warehouses guide](https://cjdropshipping.com/blogs/cj-news/Q4-Dropshipping-Guide-with-CJ-US-Warehouses)
- [Spocket pricing](https://www.spocket.co/pricing)
- [Blanka brand — zero MOQ](https://blankabrand.com)
- [Printful medusa plugin GitHub](https://github.com/fsyntax/medusa-plugin-printful)
- [19 U.S.C. §1526 — importation of counterfeit goods](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title19-section1526&num=0&edition=prelim)
