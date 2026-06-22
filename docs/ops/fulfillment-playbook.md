# Fulfillment Playbook — Piece of Stass

> **Who this is for:** Anna (and whoever she delegates ops to).
> **Purpose:** Step-by-step guide for every order status transition, what triggers what, and how to handle stuck orders.

---

## Order Status Machine

```
pending → payment_captured → sent_to_supplier → shipped → out_for_delivery → delivered → completed
                                      ↓               ↓
                                  cancelled        refunded
                            (+ partially_refunded)
```

| Status | What it means | Email sent? |
|--------|--------------|-------------|
| `pending` | Stripe checkout started, payment not yet confirmed | No |
| `payment_captured` | Stripe webhook confirmed — money is in | **Yes** — Order Confirmation |
| `sent_to_supplier` | You've forwarded to supplier (CSV or email) | No |
| `shipped` | Supplier gave you a tracking number | **Yes** — Shipping Notification |
| `out_for_delivery` | Optional — for carriers that support it | No |
| `delivered` | Package confirmed delivered | **Yes** — Delivery Confirmation |
| `completed` | Post-delivery admin close-out | No |
| `refunded` | Full refund processed | **Yes** — Refund Confirmation |
| `cancelled` | Order cancelled before or after fulfillment | **Yes** — Cancellation |

---

## Step 1: New order arrives (automatic)

**Trigger:** Customer completes Stripe checkout.

**What happens automatically:**
1. Stripe fires `checkout.session.completed` webhook
2. `/api/webhooks/stripe` creates a full order record in KV
3. `updateOrderStatusWithEmail` is called with `payment_captured`
4. Customer receives the **order confirmation email** within seconds

**You don't need to do anything for this step.** Just check the admin dashboard to confirm the order is there.

**Where to check:** Admin → Orders → look for status `payment_captured`

---

## Step 2: Forward to supplier

1. Go to **Admin → Orders → [Order ID]**
2. Click **"Copy Supplier Order"** or **"Download CSV"**
3. Send to the relevant supplier (WhatsApp, email, or supplier portal)
4. Once sent, click **"Mark as Sent to Supplier"**
   - This calls `PATCH /api/admin/orders/{id}` with `{ status: "sent_to_supplier" }`
   - No customer email is sent
   - Estimated delivery still shows 15–20 business days from order date

**Which supplier gets the order?**
- Check `item.category` (footwear → Chen Yico; watches → DSW/similar; bags → etc.)
- See `/docs/sourcing/supplier-landscape.md` for current supplier contacts
- The **Download CSV** button formats the correct fields for each supplier

---

## Step 3: Mark as shipped (triggers tracking email)

**When:** Supplier sends you a tracking number (usually WhatsApp or email).

1. Go to **Admin → Orders → [Order ID]**
2. Click **"Mark as Shipped"**
3. Enter:
   - **Tracking number** (required)
   - **Carrier** (optional — auto-detected from tracking number prefix if left blank)
4. Submit

**What happens:**
- Order status → `shipped`
- Carrier is auto-resolved from tracking number prefix (UPS 1Z, USPS 9, FedEx 12-15 digits, DHL 10 digits)
- Customer receives **shipping notification email** with deep-link to carrier
- Tracking number appears on customer's order page at `/account/orders/{id}`

**Carrier prefixes quick reference:**
| Carrier | Format |
|---------|--------|
| UPS | `1Z` + 16 chars (e.g. `1Z9999999999999999`) |
| USPS | Starts with `9`, 20-22 digits; or `XX123456789US` |
| FedEx | 12–15 pure digits |
| DHL | 10 pure digits |
| YunExpress | `YT` + 16+ digits |
| Unknown/China | Falls back to 17track.net |

---

## Step 4: Mark as delivered (optional but recommended)

Some carriers update delivery status automatically; others don't.

When you know an order is delivered (customer confirms, carrier site shows delivered):
1. Admin → Orders → [Order ID] → **"Mark as Delivered"**
2. Customer receives **delivery confirmation email** with review request and reorder CTA

---

## Handling edge cases

### Customer says order hasn't arrived (30+ days)

1. Check tracking on the carrier site
2. If tracking shows delivered → reply that it was delivered (ask customer to check mailroom/neighbours)
3. If tracking shows stuck/lost:
   - Use **Order Issue email** from admin: Admin → Orders → [Order ID] → "Send Update to Customer"
   - Issue type: `lost` or `delay`
   - If stuck > 45 days → initiate refund or reshipment with supplier

### Customer wants to cancel before shipping

1. Check if already `sent_to_supplier` — if yes, contact supplier to cancel
2. Admin → Orders → [Order ID] → **"Cancel Order"**
3. If payment was captured, process Stripe refund in Stripe dashboard
4. Mark the cancellation with `refund_amount` so the email reflects the refund

### Partial refund (wrong item, damaged, etc.)

1. Process partial refund in Stripe dashboard
2. Admin → Orders → [Order ID] → **"Mark as Refunded"** with the partial amount
3. Email automatically says "partial refund of $X"

---

## Invoice PDFs

Every order has a downloadable invoice at:
```
/api/orders/{order_id}/invoice.pdf
```

Two ways to access:
1. **Logged-in customer:** Goes to `/account/orders/{id}` and clicks "Download receipt (PDF)"
2. **Email link:** The order confirmation email contains a signed link (30-day expiry, no login needed)

The PDF includes: order number, date, line items, totals, shipping address, support info.

---

## Guest order tracking

Customers without accounts (or who lost the link) can track at:
```
https://pieceofstass.com/track-order
```

They enter their order ID (from the confirmation email) + email. The lookup is email-gated to prevent enumeration.

---

## Sending a custom update to a customer

For delays, customs holds, or other one-off communication:
1. Admin → Orders → [Order ID] → **"Send Order Update"**
2. Choose issue type: `delay`, `customs_hold`, `lost`, `damaged`, `supplier_issue`, or `other`
3. Write the message in Anna's voice (warm, direct, no jargon)
4. Set a new ETA if applicable
5. The email goes out immediately

---

## Escalation flow for stuck orders

```
Day 0:  Order placed → confirmation email sent
Day 3-7: Forward to supplier → mark sent_to_supplier
Day 7-15: Supplier dispatches → tracking number received → mark shipped
Day 21:  If no tracking number yet → message supplier
Day 30:  If tracking not moving → file claim with carrier
Day 40:  If still unresolved → offer customer full refund or reshipment
Day 45+: Close order as refunded if customer agrees
```

**Supplier contact cadence:**
- First follow-up: 7 days after `sent_to_supplier` with no tracking
- Second follow-up: 14 days (escalate to senior contact if any)
- Escalate to refund: 21 days with no dispatch

---

## KV audit trail

Every email sent is logged in KV under:
```
email_log:{order_id}:{type}
```

Types: `order_confirmation`, `shipping_notification`, `delivery_confirmation`, `refund_confirmation`, `cancellation`, `order_issue`

Log entry format: `{ ok: true, messageId: "...", sent_at: "ISO string" }`

This prevents double-sends. If an email already sent and you want to force re-send, delete the KV key manually (Cloudflare dashboard or wrangler).

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Transactional email sending (order all email types) |
| `EMAIL_FROM` | From address (default: `hello@pieceofstass.com`) |
| `EMAIL_REPLY_TO` | Reply-to (default: `help@pieceofstass.com`) |
| `AUTH_SECRET` | JWT signing for session + receipt tokens |
| `STRIPE_SECRET_KEY` | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |

**If RESEND_API_KEY is missing or `dev`:** All emails log to the server console instead of sending. Useful for local development.

---

*Last updated: June 2026 · Questions? help@pieceofstass.com*
