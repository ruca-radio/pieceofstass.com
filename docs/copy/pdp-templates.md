# PDP Copy Templates — Piece of Stass

> Reusable templates for ~80 products. Fill `{tokens}` per SKU. Every field must pass `scrub-rules.md`: zero brand names, model names, or replica/dupe/inspired-by language. Describe by silhouette, material, color, vibe. Sentence case, contractions, numerals, one exclamation max.

---

## 1. Title pattern

**Format:** `{Vibe/Aesthetic adjective} {Silhouette/Material} {Product type}`

**Rules:**
- 3–6 words. No brand, no model name, no "dupe/inspired-by."
- Lead with the aesthetic hook the customer is searching ("clean girl," "quiet luxury," "Y2K," "old money," "mob wife," "blokecore").
- Keep it screenshot-clean.

**Examples by category:**
- Footwear: `Chunky Platform Loafer` · `Y2K Mesh Runner Sneaker` · `Clean-Girl Strappy Sandal`
- Watches: `Quiet-Luxury Bracelet Watch` · `Iced-Out Tennis Watch` · `Old-Money Dress Watch`
- Bags: `Buttery Structured Tote` · `Quilted Flap Crossbody` · `Mob-Wife Shoulder Bag`
- Men: `Relaxed Boxy Knit Polo` · `Blokecore Striped Jersey` · `Quiet Streetwear Cargo`
- Women: `Ribbed Lounge Set` · `Editorial Slip Dress` · `Clean-Girl Tank`
- Kids: `Easy Velcro Court Sneaker` · `Soft Slide Sandal`
- Fragrance: `Warm Vanilla Signature Scent` · `Fresh Citrus Day Fragrance`
- Tech: `Fast-Charge USB-C Kit` · `Noise-Quiet Wireless Earbuds`

---

## 2. Description structure (Hook → Details → Styling tip → Fit/Care)

> 60–110 words total. Scannable on a 375px screen. Pull `{tokens}` from product data.

**Template:**

> **[Hook — 1–2 sentences, the verdict]**
> {The hook line: why this is THE one. e.g. "This is the tote that ends the tote search."}
>
> **[Details — silhouette, material, finish, feel]**
> {Silhouette} in {material/finish}, with {standout detail}. {Color story}. Buttery, structured, the kind of {product type} that looks twice the price.
>
> **[Styling tip — make the look feel inevitable]**
> Style it with {pairing 1} for {vibe}, or {pairing 2} when you want to dress it down. Built to screenshot either way.
>
> **[Fit / Care — practical, honest]**
> Fit: {true to size / size up / runs small}. Care: {wipe clean / hand wash cold / store in dust bag}.

**Filled example (Bags — Buttery Structured Tote):**
> This is the tote that ends the tote search. One bag, every outfit, zero overthinking.
>
> Structured silhouette in a buttery faux-leather finish, with a magnetic close and a roomy lined interior. Comes in black, camel, and chocolate — the three that go with everything.
>
> Style it over a tailored set for quiet-luxury energy, or thrown on with denim when you're running the day. Built to screenshot either way.
>
> Fit: holds a 13" laptop with room to spare. Care: wipe clean with a soft cloth, store in the dust bag.

---

## 3. Bullet templates (quick-scan specs, benefit-led)

> 3–5 bullets. Lead with the benefit, not the spec. No brand language.

**Template:**
- `{Material/finish} that {benefit}` — e.g. "Buttery faux-leather finish that looks twice the price"
- `{Silhouette detail} for {benefit}` — e.g. "Structured base that holds its shape all day"
- `{Versatility line}` — e.g. "Goes with literally everything in your closet"
- `{Practical detail}` — e.g. "Fits a 13" laptop, your everyday carry, and then some"
- `{Aesthetic payoff}` — e.g. "Quiet-luxury energy, real-life price"

---

## 4. Add-to-bag button states

| State | Button label |
|---|---|
| Default | Add to bag — ${price} |
| Adding (loading) | Adding… |
| Added (success) | Added to bag ✓ |
| Sold out | Sold out — back soon |
| Low stock (still buyable) | Add to bag — only {n} left |
| Needs selection | Pick your size first |

**Low-stock inline note (above button, only when literally true):** Almost gone — {n} left in this color.

---

## 5. Variant picker labels

- **Color picker:** `Color: {selectedColor}`
- **Size picker:** `Size: {selectedSize}` · link beside it: `Size guide`
- **Size unavailable (in-stock elsewhere):** `{size} — sold out` (greyed, struck through)
- **Notify option on sold-out variant:** `Email me when it's back`
- **Quantity:** `Qty`
- **Helper under size:** Between sizes? Size up for a relaxed fit.

---

## 6. Shipping notice (FTC-compliant 10–20 day disclosure, made desirable)

> Must clearly disclose delivery window. We make the wait feel worth it without hiding it.

**PDP inline (under ATC, short):**
> 📦 Free standard shipping on orders $50+. Ships from our global stash — allow 10–20 days. Good taste travels.

**Expanded ("Learn more" / accordion):**
> **Shipping, honestly.** Our finds ship from international warehouses, which is exactly how we keep the price this low. Standard delivery runs 10–20 business days, and we'll email tracking the moment your order's on the way. Want it sooner? Priority shipping (7–12 business days) is available at checkout. The look for less is worth the short wait — promise.

**Plain-text legal fallback (no emoji):** Standard shipping: estimated 10–20 business days. Orders over $50 ship free. Tracking emailed once your order ships.

---

## 7. Trust badges (4)

1. **Free shipping $50+** — Spend a little more, ship for free.
2. **Easy 30-day returns** — Changed your mind? No drama, no restocking fee.
3. **Pay in 4** — Split it with Klarna or Afterpay. Your card stays calm.
4. **Secure checkout** — Encrypted, protected, boringly safe.

---

## 8. Related-products header

**Primary:** You might also stash
**Alternates (rotate / A-B):**
- Completes the look
- Pairs perfectly with this
- More from the edit

**Cross-sell sub-line (optional):** Because one great find deserves another.

---

## 9. Review section microcopy

- **Header:** What the stash says
- **Empty (no reviews yet):** No reviews yet — be the first to call it. Your honest take helps the next shopper.
- **Write-review CTA:** Leave a review
- **Verified tag:** Verified raid
- **Rating summary:** {avg} out of 5 · {count} reviews
