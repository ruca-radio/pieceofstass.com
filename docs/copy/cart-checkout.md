# Cart & Checkout Copy — Piece of Stass

> Cart drawer, checkout flow, confirmation page + email. Tone: cheeky on cart, calm-and-clear on checkout/legal (per tone matrix — CS/transactional = low cheeky, high clarity). No emoji in price displays or legal/shipping copy. FTC-compliant 10–20 day disclosure preserved.

---

## 1. Cart drawer

**Drawer header:** Your bag ({count})

### Empty state
- **Headline:** Your bag's feeling light
- **Body:** Nothing stashed yet. The good stuff doesn't add itself — go raid the stash.
- **Button:** Start shopping

### Cart with items
- **Free-shipping progress (under threshold):** You're ${remaining} away from free shipping.
- **Free-shipping progress (met):** Nice — you unlocked free shipping. 🎉
- **Line item meta:** Size: {size} · Color: {color}
- **Quantity stepper:** `[-] {qty} [+]`
- **Remove link:** Remove
- **Saved-for-later toggle:** Save for later
- **Subtotal label:** Subtotal
- **Shipping line:** Shipping calculated at checkout
- **Reassurance under subtotal:** Taxes and shipping sorted at the next step. No surprises.

### Upsell module
- **Header:** Pairs perfectly with
- **Add button:** Add
- **Added confirm:** Added ✓

### Cart CTAs
- **Primary:** Checkout
- **Express row label:** Or check out faster with
- **Continue shopping link:** Keep raiding

---

## 2. Promo code field

- **Field label:** Promo code
- **Placeholder:** Got a code?
- **Apply button:** Apply

**Apply states:**
| State | Message |
|---|---|
| Applying | Checking… |
| Success | Code applied — ${amount} off. Smart. |
| Invalid | Hmm, that code didn't work. Double-check it? |
| Expired | That code's expired — but the deals never stop. |
| Not eligible | This code doesn't apply to what's in your bag yet. |
| Remove applied code | Remove |

---

## 3. Shipping estimator

- **Heading:** Estimate shipping
- **Field placeholders:** Country · Zip / postal code
- **Button:** Estimate
- **Result line:** Standard (10–20 business days) — Free over $50, otherwise ${rate}
- **Result line (priority):** Priority (7–12 business days) — ${priorityRate}
- **No-result:** We can't estimate for that location yet. Try the full address at checkout.

---

## 4. Checkout step labels

- **Express checkout header:** Express checkout
- **Divider:** Or pay with card
- **Step 1 — Contact:** Contact
  - Email field placeholder: Email
  - Phone field placeholder: Phone (for delivery updates)
  - Opt-in checkbox: Email me the drops and offers. No spam, ever.
- **Step 2 — Shipping address:** Shipping address
  - First name · Last name · Address · Apartment, suite, etc. (optional) · City · State / Province · Zip / postal code · Country
- **Step 3 — Shipping method:** Shipping method
  - Standard (10–20 business days) — Free
  - Priority (7–12 business days) — $5.99
- **Step 4 — Payment:** Payment
  - Reassurance line: All transactions are encrypted and secure.
  - Card number · Expiration (MM/YY) · Security code (CVV) · Name on card
- **Billing toggle:** Use my shipping address for billing
- **Order summary (mobile accordion):** Order summary · Show / Hide
- **Place-order button:** Pay ${total}
- **Place-order sub-note:** By placing your order you agree to our Terms and Privacy Policy.

---

## 5. Order confirmation page (`/checkout/success`)

- **Headline:** Thank you, {firstName}! Your stash is locked in.
- **Sub:** Order #{orderNumber} is confirmed. A receipt's on its way to {email}.

### What's next (4 steps)
1. **Order confirmed** — We've got it. This part's done.
2. **Packed with care** — Your finds get picked and prepped within 1–2 days.
3. **On the move** — Ships from our global stash; allow 10–20 business days. Tracking lands in your inbox the moment it's en route.
4. **Doorstep glow-up** — It arrives, you open it, you get the compliments. That's the deal.

- **Shipping reassurance box:** Heads up: your items ship from our international warehouse, which is how we keep prices this low. Please allow 10–20 business days for delivery. We'll email tracking as soon as it ships.
- **Create-account prompt headline:** Save your info for the next raid
- **Create-account sub:** Set a password and checkout takes seconds next time.
- **Password field placeholder:** Create a password
- **Create-account button:** Create account
- **Continue link:** Keep shopping

---

## 6. Confirmation email

- **Subject:** Order #{orderNumber} confirmed — your stash is locked in 🔖
- **Preview text:** We've got your order. Here's everything you grabbed (and what happens next).

**Body:**

> Hi {firstName},
>
> Consider it stashed. Your order's confirmed and we're already on it.
>
> **Order #{orderNumber}**
> {Itemized list: product name · variant · qty · price}
>
> Subtotal: ${subtotal}
> Shipping: {Free / $rate}
> Discount: −${discount}
> **Total: ${total}**
>
> **Shipping to:**
> {Name}
> {Address}
>
> **What happens now:** We pack your finds within 1–2 days, then they ship from our global stash. Standard delivery runs 10–20 business days, and we'll email tracking the second your order's on the move. The look for less is worth the short wait — promise.
>
> Questions? Just reply to this email. A real human (with great taste) will get back to you fast.
>
> Now go get those compliments,
> Anna & the Piece of Stass team
>
> _Track your order · Returns & exchanges · Contact us_
