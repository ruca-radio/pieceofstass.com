# Checkout Flow — Piece of Stass

> **Audience:** Frontend (Astro/Workers) agent, DevOps agent  
> **Last updated:** June 2026

This document traces a complete checkout from cart creation to supplier notification. Every step maps to a specific system boundary.

---

## High-Level Flow

```
Customer → Astro storefront → /api/checkout (Worker) → Medusa → Stripe Checkout → Webhook → Order finalized → Klaviyo + Supplier
```

---

## Step-by-Step

### Step 1 — Add to Cart

**Trigger:** Customer clicks "Add to Cart" on a product page.

**Frontend (Astro component):**
```http
POST https://api.pieceofstass.com/store/carts
Content-Type: application/json

{
  "region_id": "reg_us_01",
  "currency_code": "usd"
}
```
Response contains `cart.id` (e.g., `cart_01ABC`). Store in a session cookie: `pos_cart_id`.

Then add the line item:
```http
POST https://api.pieceofstass.com/store/carts/{cart_id}/line-items
Content-Type: application/json
x-publishable-api-key: pk_...

{
  "variant_id": "variant_01XYZ",
  "quantity": 1
}
```

**State stored:** `pos_cart_id` in a secure HTTP-only cookie (30-day expiry).

---

### Step 2 — Cart Review

Customer views cart at `/cart`. The storefront fetches the current cart:
```http
GET https://api.pieceofstass.com/store/carts/{cart_id}
x-publishable-api-key: pk_...
```

Totals (subtotal, taxes, shipping estimate) are displayed. No order is created yet.

---

### Step 3 — Initiate Checkout

**Trigger:** Customer clicks "Proceed to Checkout."

**Worker route:** `POST /api/checkout` (Cloudflare Worker)

The Worker:
1. Reads `pos_cart_id` from the request cookie.
2. Calls Medusa to add a shipping address and select a shipping method if not already set.
3. Calls Medusa to create a Payment Collection:
```http
POST https://api.pieceofstass.com/store/payment-collections
x-publishable-api-key: pk_...

{
  "cart_id": "cart_01ABC"
}
```
4. Initializes a Stripe payment session:
```http
POST https://api.pieceofstass.com/store/payment-collections/{id}/payment-sessions
x-publishable-api-key: pk_...

{
  "provider_id": "pp_stripe_stripe"
}
```
5. The Stripe provider creates a **Stripe Checkout Session** server-side and returns `checkout_url`.
6. Worker responds with `{ checkout_url }`.

**Frontend:** Redirects the browser to `checkout_url` (Stripe hosted checkout page).

---

### Step 4 — Stripe Hosted Checkout

Customer is on Stripe's hosted checkout page (stripe.com/pay/...). Stripe:
- Collects card details (PCI compliant — card data never touches pieceofstass.com servers)
- Runs **Stripe Radar** fraud check
- Applies **Stripe Tax** (calculates applicable US/EU/UK/CA tax based on shipping address)
- Charges the card

On success, Stripe redirects the customer to:
```
https://pieceofstass.com/order/success?session_id=cs_live_xxx
```

On cancellation, Stripe redirects to:
```
https://pieceofstass.com/cart?checkout=cancelled
```

---

### Step 5 — Stripe Webhook → Worker

**Trigger:** Stripe sends a signed `POST` to the Cloudflare Worker webhook endpoint.

**Endpoint:** `POST /api/webhooks/stripe`

**Event:** `checkout.session.completed`

**Worker logic:**
```typescript
// 1. Read raw body (required for signature verification)
const rawBody = await request.text()
const sig = request.headers.get("Stripe-Signature")

// 2. Verify signature — REJECT if invalid
const event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)

// 3. Only process checkout.session.completed
if (event.type !== "checkout.session.completed") {
  return new Response("ignored", { status: 200 })
}

// 4. Forward verified event to Medusa payment webhook handler
const medusaResponse = await fetch(
  `${MEDUSA_BACKEND_URL}/hooks/payment/stripe`,
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: rawBody,  // Forward raw body, not re-serialized
  }
)
```

**Security note:** The Worker MUST verify the Stripe signature before forwarding. Never trust event data from the redirect URL query params.

---

### Step 6 — Medusa Processes Payment

Medusa's Stripe payment provider:
1. Matches the `session_id` to the pending cart/payment collection.
2. Confirms payment capture in Stripe.
3. Creates the **Order** record in Postgres (via Neon).
4. Sets `order.payment_status = "captured"`.
5. Sets `order.fulfillment_status = "not_fulfilled"`.
6. Emits the `order.placed` event to the internal event bus.

---

### Step 7 — Order Subscriber Triggers Workflow

The `order-placed` subscriber (`src/subscribers/order-placed.ts`) catches the `order.placed` event and runs the `order-to-supplier` workflow, which executes these steps in parallel:

#### 7a — Supplier Notifications

The Dropship module:
1. Groups order line items by `product.metadata.supplier_id`.
2. For each unique supplier, generates a CSV:
   - Customer ship-to details
   - SKU, product title, variant, quantity
   - Internal Yupoo `supplier_url` (for supplier's reference only)
3. Sends email + CSV attachment via SMTP to the configured supplier email.

#### 7b — Klaviyo "Order Placed" Event

Fires a server-side Klaviyo Track event with:
- `event: "Order Placed"`
- Customer email, order ID, item list, order total
- Triggers the "Order Confirmed" email flow in Klaviyo (~30 seconds after placement)

#### 7c — Meta CAPI Purchase Event

Fires a `Purchase` event to Meta's Conversions API with:
- Hashed customer email (SHA-256)
- Order value, currency
- Item SKUs and quantities
- `order_id` for deduplication against browser pixel

#### 7d — TikTok `PlaceAnOrder` Event

Same data as Meta CAPI, sent to TikTok Events API v1.3.

---

### Step 8 — Customer Success Page

Customer lands on `/order/success?session_id=cs_live_xxx`.

The Astro page:
1. Calls `/api/order-lookup?session_id=cs_live_xxx` (Worker).
2. Worker calls Medusa to retrieve order by Stripe session metadata.
3. Renders order confirmation: order number, items, estimated delivery.

Meanwhile, Klaviyo sends the "Order Confirmed" email within ~30 seconds.

---

### Step 9 — Fulfillment (Manual, Post-Launch)

1. Supplier responds to the notification email with tracking number.
2. Ops team enters tracking in Medusa Admin (`/app`).
3. Medusa emits `order.shipment_created` event.
4. Subscriber fires Klaviyo "Order Shipped" event → customer receives shipping email with tracking link.

---

## Error Handling

| Failure Point | Handling |
|---|---|
| Stripe Radar rejects payment | Customer sees Stripe decline message. Cart preserved. No order created in Medusa. |
| Stripe webhook signature invalid | Worker returns `400`. Event dropped. Stripe retries up to 3 days. |
| Medusa webhook handler fails | Stripe retries the webhook (exponential backoff, 3 days). Worker logs error to Cloudflare logpush. |
| Supplier email send fails | Error logged. Order record intact. Ops team alerted via error log. Manual retry via Medusa admin. |
| Klaviyo event fails | Logged and silently swallowed. Order is not rolled back. |
| Meta/TikTok attribution fails | Logged and silently swallowed. Order is not rolled back. |

---

## Cart Cookie Lifecycle

| Event | Cookie action |
|---|---|
| First product added | Set `pos_cart_id`; `HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` |
| Order placed successfully | Clear `pos_cart_id` |
| Cart expired in Medusa (30-day TTL) | Clear `pos_cart_id` on next cart fetch (404 response) |
| Customer returns to `/cart` | Fetch cart; if 404, clear cookie and create new cart |
