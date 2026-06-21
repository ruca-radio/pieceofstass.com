# API Contract — Astro Storefront ↔ Medusa

> **Version:** 1.0  
> **Base URL:** `https://api.pieceofstass.com`  
> **Auth header for storefront requests:** `x-publishable-api-key: {NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`  
> **Last updated:** June 2026

All requests use JSON. All prices are returned in **minor currency units** (cents). The storefront must divide by 100 before displaying.

Supplier URLs, supplier IDs, and any Yupoo metadata are **never** included in these API responses. They are stored server-side only.

---

## 1. `list_products`

Returns a paginated list of products, optionally filtered by category or tag.

**Request**
```http
GET /store/products
x-publishable-api-key: pk_...

Query params:
  category_id[]   string[]   Filter by Medusa category ID
  handle[]        string[]   Filter by product handle
  q               string     Full-text search query
  limit           number     Default: 20, max: 100
  offset          number     Default: 0
  order           string     e.g. "created_at", "-created_at"
  fields          string     Comma-separated field selector
```

**Example request**
```
GET /store/products?category_id[]=cat_footwear_01&limit=20&offset=0&fields=id,title,handle,thumbnail,variants.id,variants.calculated_price
```

**Example response** `200 OK`
```json
{
  "products": [
    {
      "id": "prod_01ABC",
      "title": "White cement high-top court sneaker",
      "handle": "white-cement-high-top-court-sneaker",
      "thumbnail": "https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg",
      "variants": [
        {
          "id": "variant_01XYZ",
          "title": "White/Grey / EU 40",
          "sku": "POS-FOO-001-03",
          "calculated_price": {
            "calculated_amount": 14900,
            "currency_code": "usd",
            "original_amount": 21600
          }
        }
      ]
    }
  ],
  "count": 1,
  "offset": 0,
  "limit": 20
}
```

---

## 2. `get_product`

Returns full product detail including all variants, images, and description.

**Request**
```http
GET /store/products/{handle_or_id}
x-publishable-api-key: pk_...
```

**Example request**
```
GET /store/products/white-cement-high-top-court-sneaker
```

**Example response** `200 OK`
```json
{
  "product": {
    "id": "prod_01ABC",
    "title": "White cement high-top court sneaker",
    "handle": "white-cement-high-top-court-sneaker",
    "description": "Structured retro court sneaker with paneled uppers, padded collar, and a bold speckled midsole.",
    "thumbnail": "https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg",
    "images": [
      { "url": "https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg" }
    ],
    "options": [
      {
        "id": "opt_color_01",
        "title": "Color",
        "values": [
          { "id": "optval_01", "value": "White/Grey" }
        ]
      },
      {
        "id": "opt_size_01",
        "title": "Size",
        "values": [
          { "id": "optval_02", "value": "EU 36" },
          { "id": "optval_03", "value": "EU 38" },
          { "id": "optval_04", "value": "EU 40" },
          { "id": "optval_05", "value": "EU 42" }
        ]
      }
    ],
    "variants": [
      {
        "id": "variant_01XYZ",
        "title": "White/Grey / EU 40",
        "sku": "POS-FOO-001-03",
        "options": [
          { "option_id": "opt_color_01", "value": "White/Grey" },
          { "option_id": "opt_size_01", "value": "EU 40" }
        ],
        "calculated_price": {
          "calculated_amount": 14900,
          "currency_code": "usd",
          "original_amount": 21600
        }
      }
    ],
    "categories": [
      { "id": "cat_footwear_01", "name": "Footwear", "handle": "footwear" }
    ],
    "tags": [
      { "value": "court" },
      { "value": "high-top" },
      { "value": "retro" }
    ]
  }
}
```

---

## 3. `search`

Full-text product search. Powered by Medusa's built-in search (backed by Postgres `tsvector` or MeiliSearch if added).

**Request**
```http
GET /store/products?q={query}&limit=20
x-publishable-api-key: pk_...
```

**Example request**
```
GET /store/products?q=sneaker&limit=10
```

**Example response** `200 OK`
```json
{
  "products": [
    {
      "id": "prod_01ABC",
      "title": "White cement high-top court sneaker",
      "handle": "white-cement-high-top-court-sneaker",
      "thumbnail": "https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg",
      "variants": [
        {
          "id": "variant_01XYZ",
          "calculated_price": {
            "calculated_amount": 14900,
            "currency_code": "usd"
          }
        }
      ]
    }
  ],
  "count": 12,
  "offset": 0,
  "limit": 10
}
```

---

## 4. `create_cart`

Creates an empty cart for a new shopping session.

**Request**
```http
POST /store/carts
Content-Type: application/json
x-publishable-api-key: pk_...

{
  "region_id": "reg_us_01",
  "currency_code": "usd"
}
```

**Example response** `200 OK`
```json
{
  "cart": {
    "id": "cart_01ABC",
    "region_id": "reg_us_01",
    "currency_code": "usd",
    "items": [],
    "total": 0,
    "subtotal": 0,
    "tax_total": 0,
    "shipping_total": 0
  }
}
```

The storefront stores `cart.id` in the `pos_cart_id` cookie.

---

## 5. `add_to_cart`

Adds a variant to the cart, or increments quantity if already present.

**Request**
```http
POST /store/carts/{cart_id}/line-items
Content-Type: application/json
x-publishable-api-key: pk_...

{
  "variant_id": "variant_01XYZ",
  "quantity": 1
}
```

**Example response** `200 OK`
```json
{
  "cart": {
    "id": "cart_01ABC",
    "items": [
      {
        "id": "li_01DEF",
        "title": "White cement high-top court sneaker",
        "description": "White/Grey / EU 40",
        "variant_id": "variant_01XYZ",
        "quantity": 1,
        "unit_price": 14900,
        "subtotal": 14900,
        "thumbnail": "https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg"
      }
    ],
    "subtotal": 14900,
    "total": 14900,
    "item_count": 1
  }
}
```

---

## 6. `update_cart`

Updates line item quantity or removes an item (quantity: 0 removes).

**Request — update quantity**
```http
PUT /store/carts/{cart_id}/line-items/{line_item_id}
Content-Type: application/json
x-publishable-api-key: pk_...

{
  "quantity": 2
}
```

**Request — remove item**
```http
DELETE /store/carts/{cart_id}/line-items/{line_item_id}
x-publishable-api-key: pk_...
```

**Example response** `200 OK`
```json
{
  "cart": {
    "id": "cart_01ABC",
    "items": [
      {
        "id": "li_01DEF",
        "variant_id": "variant_01XYZ",
        "quantity": 2,
        "subtotal": 29800
      }
    ],
    "subtotal": 29800,
    "total": 29800
  }
}
```

---

## 7. `create_checkout_session`

Worker-side endpoint. Receives the cart ID, creates a Medusa Payment Collection + Stripe Checkout Session, and returns the Stripe-hosted checkout URL.

**Endpoint:** `POST /api/checkout` (Cloudflare Worker — NOT Medusa directly)

**Request**
```http
POST /api/checkout
Content-Type: application/json
Cookie: pos_cart_id=cart_01ABC

{
  "cart_id": "cart_01ABC",
  "shipping_address": {
    "first_name": "Jordan",
    "last_name": "Doe",
    "address_1": "123 Main St",
    "city": "New York",
    "province": "NY",
    "postal_code": "10001",
    "country_code": "us",
    "phone": "+12125550100"
  },
  "email": "jordan@example.com"
}
```

**Worker logic:**
1. Updates cart with shipping address and email via Medusa Storefront API.
2. Selects cheapest available shipping option for the destination country.
3. Creates Payment Collection in Medusa.
4. Initializes Stripe payment session.
5. Medusa Stripe provider creates a Stripe Checkout Session with `success_url` and `cancel_url`.
6. Returns `checkout_url`.

**Example response** `200 OK`
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_live_xxx"
}
```

**Error responses:**
```json
// 400 — Cart not found
{ "error": "cart_not_found", "message": "Cart cart_01ABC does not exist or has expired." }

// 400 — Cart empty
{ "error": "cart_empty", "message": "Cannot checkout an empty cart." }

// 422 — No shipping option available
{ "error": "no_shipping_option", "message": "No shipping method available for country: XX" }
```

---

## 8. `get_order`

Retrieves a completed order. Called from the success page after redirect from Stripe.

**Endpoint:** `GET /api/order-lookup` (Cloudflare Worker)

**Request**
```http
GET /api/order-lookup?session_id=cs_live_xxx
```

**Worker logic:**
1. Retrieves Stripe Checkout Session to get `metadata.cart_id`.
2. Looks up order in Medusa by `cart_id`.
3. Strips any internal metadata before returning to the browser.

**Example response** `200 OK`
```json
{
  "order": {
    "id": "order_01GHI",
    "display_id": 1001,
    "status": "pending",
    "payment_status": "captured",
    "fulfillment_status": "not_fulfilled",
    "email": "jordan@example.com",
    "currency_code": "usd",
    "total": 16090,
    "subtotal": 14900,
    "tax_total": 1190,
    "shipping_total": 0,
    "items": [
      {
        "id": "li_01DEF",
        "title": "White cement high-top court sneaker",
        "description": "White/Grey / EU 40",
        "quantity": 1,
        "unit_price": 14900,
        "thumbnail": "https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg"
      }
    ],
    "shipping_address": {
      "first_name": "Jordan",
      "last_name": "Doe",
      "address_1": "123 Main St",
      "city": "New York",
      "province": "NY",
      "postal_code": "10001",
      "country_code": "us"
    },
    "created_at": "2026-06-21T10:31:00.000Z"
  }
}
```

**Error responses:**
```json
// 404 — Session not found or order not created yet
{ "error": "order_not_found", "message": "Order for session cs_live_xxx not found. Payment may still be processing." }
```

---

## Field Selection (Performance)

To reduce payload size, always pass `fields` to list and get endpoints:
```
?fields=id,title,handle,thumbnail,variants.id,variants.calculated_price.calculated_amount,variants.calculated_price.currency_code
```

This prevents over-fetching. Medusa v2 supports granular field selection on all Storefront API endpoints.

---

## Rate Limits

Medusa itself has no built-in rate limiting — implement at the Cloudflare Worker layer using the Rate Limiting API:
- Storefront API: 100 requests/min per IP
- `/api/checkout`: 10 requests/min per IP
- `/api/webhooks/stripe`: unlimited (verified by signature)
