# Email Templates — Piece of Stass Transactional Layer

> All templates live in `/src/lib/emails/`. Sent via Resend.
> Voice: warm, cheeky, confident — Anna at Piece of Stass. Never sycophantic.

---

## 1. Order Confirmation

**File:** `src/lib/emails/order-confirmation.ts`
**Function:** `orderConfirmationEmail(order, opts?)`
**Trigger:** `payment_captured` status transition
**Subject:** `Your order's confirmed — #ORDERNUM`

### Copy preview

> **Subject:** Your order's confirmed — #TESTABCD
> **Preview:** Your stash is on its way — est. delivery Jun 15 – Jul 1, 2026

**Hero:**
> Thanks, Jane — your stash is incoming.
>
> Order **#TESTABCD** is confirmed and we're getting it ready. You'll hear from us when it's on the move.
>
> **Estimated delivery:** Jun 15 – Jul 1, 2026 (15–20 business days for international shipping.)

**CTA:** "Track this order" → `/account/orders/{id}`

**Contains:**
- Line items with product images (64×64px)
- Subtotal / Shipping (Free) / Tax / Total
- Shipping address
- "Download receipt (PDF)" button (signed token link, 30-day expiry)
- Need help? section with `help@pieceofstass.com`

**Plain text fallback:** Yes — includes all order details, tracking URL, receipt URL.

---

## 2. Shipping Notification

**File:** `src/lib/emails/shipping-notification.ts`
**Function:** `shippingNotificationEmail(order)`
**Trigger:** `shipped` status transition
**Subject:** `Your stash is on the move 📦 — #ORDERNUM`

### Copy preview

> **Subject:** Your stash is on the move 📦 — #TESTABCD
> **Preview:** UPS has your order. Est. arrival Jun 25 – Jul 5, 2026.

**Hero:**
> It's packed, it's posted, it's yours.
>
> Your order **#TESTABCD** just left the warehouse. UPS has it from here.

**Tracking block:**
```
Carrier:    UPS
Tracking #: 1Z9999999999999999
Est. arrival: Jun 25 – Jul 5, 2026
```

**Primary CTA:** "Track with UPS" → carrier deep-link URL

**Secondary link:** "View order details on Piece of Stass →"

**What happens next section:**
1. Tracking activates — usually 24–48 hrs
2. Customs — no action needed
3. Delivery — est. range

---

## 3. Delivery Confirmation

**File:** `src/lib/emails/delivery-confirmation.ts`
**Function:** `deliveryConfirmationEmail(order)`
**Trigger:** `delivered` status transition
**Subject:** `Delivered! How's the stash, Jane? 👀`

### Copy preview

> **Subject:** Delivered! How's the stash, Jane? 👀
> **Preview:** Order #TESTABCD is in your hands. How does it look?

**Hero:**
> The look has landed.
>
> Your order **#TESTABCD** has been delivered. We hope it lives up to the scroll — and then some.

**Review request:**
> Got a fit moment? We want to see it.
> A quick review helps other people find the looks worth having.

**CTA:** "Leave a review" → `mailto:help@pieceofstass.com?subject=Review...`

**Refer-a-friend banner:** Rose-to-Clay gradient, "Your group chat needs this stash too."

**Reorder / Keep shopping section:**
> New drops land daily.

---

## 4. Refund Confirmation

**File:** `src/lib/emails/refund-confirmation.ts`
**Function:** `refundConfirmationEmail(order, opts?)`
**Trigger:** `refunded` status transition
**Subject:** `Refund confirmed — #ORDERNUM` or `Partial refund processed — #ORDERNUM`

### Copy preview

> **Hero:** Your refund is on the way.
>
> We've processed a full refund of **$161.00** for order **#TESTABCD**.

**Timeline box:**
```
Refund amount: $161.00
Timeline: 3–7 business days
```

**What to expect:** Bank refund timing explanation.

---

## 5. Cancellation

**File:** `src/lib/emails/cancellation.ts`
**Function:** `cancellationEmail(order, opts?)`
**Trigger:** `cancelled` status transition
**Subject:** `Order cancelled — #ORDERNUM`

### Copy preview

> **Hero:** Your order has been cancelled.
>
> Order **#TESTABCD** has been cancelled. [Reason if provided]

**If refund issued:**
> Refund incoming: $161.00 will be returned to your original payment method within 3–7 business days.

**CTA:** "Back to the stash" → `/shop`

---

## 6. Order Issue / Update (Admin-triggered)

**File:** `src/lib/emails/order-issue.ts`
**Function:** `orderIssueEmail(order, opts)`
**Trigger:** Manual — admin sends from order detail page
**Subject:** Custom or `Update on your order #ORDERNUM`

**Issue types:**
| Type | Label |
|------|-------|
| `delay` | Shipping Update |
| `customs_hold` | Customs Hold |
| `lost` | Missing Shipment |
| `damaged` | Damaged Item |
| `supplier_issue` | Fulfillment Update |
| `other` | Order Update |

### Example — delay notice

> **Subject:** Update on your order #TESTABCD
>
> Hi Jane, here's an update on order **#TESTABCD**:
>
> Your order is experiencing a slight delay due to high demand at our warehouse. We expect it to ship within the next 3–5 business days.
>
> **New estimated delivery:** July 10 – July 20, 2026

---

## Brand tokens used in all templates

```
Background:   #F6F0E8 (cream)
Text:         #2A211C (espresso)
Primary CTA:  #A14C58 (rose) — cream text on rose button
Secondary:    #6F7B5F (sage) — for section accents, links
Line/border:  #E6DCCF
Muted text:   #726558
Card bg:      #FBF7F1 (surface)
Success:      #3F6A44
```

---

## Developer notes

### Adding a new email template

1. Create `/src/lib/emails/your-template.ts`
2. Export a function `yourTemplateEmail(order, opts?)` → `{ subject, html, text }`
3. Use `emailShell()`, `card()`, `ctaButton()` etc. from `./base.ts`
4. Add a corresponding `sendYourTemplate()` function to `send.ts`
5. Wire it into `updateOrderStatusWithEmail()` in `orders-server.ts` if it's status-triggered

### Testing templates locally

```bash
# Start dev server
npm run dev

# Generate a receipt token
node -e "
import('jose').then(({ SignJWT }) => {
  const secret = new TextEncoder().encode('dev-secret-change-in-production');
  new SignJWT({ order_id: 'order_test_001', type: 'receipt' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(Date.now() / 1000))
    .setExpirationTime('24h')
    .sign(secret)
    .then(console.log);
});
"

# Fetch invoice PDF
curl -o /tmp/test.pdf "http://localhost:4321/api/orders/order_test_001/invoice.pdf?token=TOKEN"

# Test track-order API
curl -s -X POST http://localhost:4321/api/track-order \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:4321' \
  -d '{"order_id":"order_test_001","email":"test@example.com"}'
```

### Email preview via console (dev mode)

When `RESEND_API_KEY` is not set, all emails log to the terminal:
```
[email:DEV] order_confirmation → test@example.com
[email:DEV] Subject: Your order's confirmed — #TEST0001
```

To see full HTML, temporarily add a `console.log(html)` in `sendTransactional()` in `send.ts`.

---

*Last updated: June 2026*
