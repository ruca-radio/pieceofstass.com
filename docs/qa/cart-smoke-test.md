# Cart API Smoke Test Results

**Date:** 2026-06-22  
**Environment:** `astro dev` (port 4321) with in-memory KV fallback  
**Tested against:** `pos-footwear-001-white-cement-high-top-court-sneaker` (variant `POS-FOO-001-03`, EU 40)

---

## 1. GET /api/cart — Empty cart on first visit

**Request:**
```
curl -s -c cookies.txt http://localhost:4321/api/cart
```

**Status:** `200 OK`

**Response:**
```json
{
  "id": "c40564bc-f476-46ef-9c31-923d9f4ee314",
  "items": [],
  "created_at": "2026-06-22T08:13:01.699Z",
  "updated_at": "2026-06-22T08:13:01.699Z"
}
```

✅ Creates empty cart, assigns UUID, sets `cart_id` cookie.

---

## 2. POST /api/cart/items — Add item

**Request:**
```
curl -s -c cookies.txt -b cookies.txt \
  -X POST http://localhost:4321/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"product_id":"pos-footwear-001-white-cement-high-top-court-sneaker","variant_id":"POS-FOO-001-03","qty":2}'
```

**Status:** `200 OK`

**Response:**
```json
{
  "id": "c40564bc-f476-46ef-9c31-923d9f4ee314",
  "items": [
    {
      "product_id": "pos-footwear-001-white-cement-high-top-court-sneaker",
      "variant_id": "POS-FOO-001-03",
      "qty": 2,
      "price_snapshot": 82.99,
      "title_snapshot": "White cement high-top court sneaker — White/Grey / EU 40",
      "image_snapshot": "https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg"
    }
  ],
  "created_at": "2026-06-22T08:13:01.699Z",
  "updated_at": "2026-06-22T08:13:01.918Z"
}
```

✅ Item added. Price read from `products.json` server-side ($82.99). Title and image snapshotted.

---

## 3. GET /api/cart — Cart persists across requests

**Request:**
```
curl -s -c cookies.txt -b cookies.txt http://localhost:4321/api/cart
```

**Status:** `200 OK`

**Response:** Same as Test 2 (item still in cart).

✅ Cart persists via in-memory KV keyed by `cart_id` cookie.

---

## 4. PATCH /api/cart/items/:id — Update quantity

**Request:**
```
curl -s -c cookies.txt -b cookies.txt \
  -X PATCH http://localhost:4321/api/cart/items/POS-FOO-001-03 \
  -H "Content-Type: application/json" \
  -d '{"qty":3}'
```

**Status:** `200 OK`

**Response:**
```json
{
  "id": "c40564bc-f476-46ef-9c31-923d9f4ee314",
  "items": [
    {
      "product_id": "pos-footwear-001-white-cement-high-top-court-sneaker",
      "variant_id": "POS-FOO-001-03",
      "qty": 3,
      "price_snapshot": 82.99,
      "title_snapshot": "White cement high-top court sneaker — White/Grey / EU 40",
      "image_snapshot": "https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg"
    }
  ],
  "created_at": "2026-06-22T08:13:01.699Z",
  "updated_at": "2026-06-22T08:13:02.016Z"
}
```

✅ Quantity updated from 2 → 3.

---

## 5. DELETE /api/cart/items/:id — Remove item

**Request:**
```
curl -s -c cookies.txt -b cookies.txt \
  -X DELETE http://localhost:4321/api/cart/items/POS-FOO-001-03
```

**Status:** `200 OK`

**Response:**
```json
{
  "id": "c40564bc-f476-46ef-9c31-923d9f4ee314",
  "items": [],
  "created_at": "2026-06-22T08:13:01.699Z",
  "updated_at": "2026-06-22T08:13:02.049Z"
}
```

✅ Item removed. Cart is now empty.

---

## 6. POST /api/checkout — Returns 400 when Stripe key not configured

**Request:**
```
curl -s -c cookies.txt -b cookies.txt \
  -X POST http://localhost:4321/api/checkout
```

**Status:** `400 Bad Request`

**Response:**
```json
{
  "error": "Stripe is not configured. Add STRIPE_SECRET_KEY to .dev.vars (dev) or wrangler secrets (production)."
}
```

✅ Graceful degradation — no crash, clear error message. To enable Stripe: copy `.dev.vars.example` to `.dev.vars` and set `STRIPE_SECRET_KEY`.

---

## 7. POST /api/cart/clear — Clear all items

**Request:**
```
curl -s -c cookies.txt -b cookies.txt \
  -X POST http://localhost:4321/api/cart/clear
```

**Status:** `200 OK`

**Response:**
```json
{
  "id": "c40564bc-f476-46ef-9c31-923d9f4ee314",
  "items": [],
  "created_at": "2026-06-22T08:13:01.699Z",
  "updated_at": "2026-06-22T08:13:02.289Z"
}
```

✅ Cart cleared.

---

## 8. Validation — Product not found (404)

**Request:**
```
curl -s -X POST http://localhost:4321/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"product_id":"not-a-real-product","variant_id":"SKU-FAKE","qty":1}'
```

**Status:** `404 Not Found`

**Response:**
```json
{
  "error": "Product not found: not-a-real-product"
}
```

✅ Server validates product existence against `products.json`.

---

## 9. Validation — Missing required field (400)

**Request:**
```
curl -s -X POST http://localhost:4321/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"product_id":"pos-footwear-001-white-cement-high-top-court-sneaker"}'
```

**Status:** `400 Bad Request`

**Response:**
```json
{
  "error": "variant_id is required"
}
```

✅ Runtime input validation catches missing fields without crashing.

---

## Summary

| Endpoint | Method | Status | Result |
|---|---|---|---|
| `/api/cart` | GET | 200 | ✅ |
| `/api/cart/items` | POST | 200 | ✅ |
| `/api/cart` | GET | 200 | ✅ (persists) |
| `/api/cart/items/:id` | PATCH | 200 | ✅ |
| `/api/cart/items/:id` | DELETE | 200 | ✅ |
| `/api/checkout` | POST | 400 | ✅ (no Stripe key) |
| `/api/cart/clear` | POST | 200 | ✅ |
| `/api/cart/items` | POST | 404 | ✅ (bad product) |
| `/api/cart/items` | POST | 400 | ✅ (validation) |

**Build:** `npm run build` — 0 errors, 0 TypeScript errors.

---

## Notes

- In-memory KV fallback active in dev. In production, bind `CART_KV` in `wrangler.toml` (already configured with placeholder IDs).
- Stripe requires `STRIPE_SECRET_KEY` in `.dev.vars` (copy from `.dev.vars.example`).
- Webhook signature verification is skipped in dev unless `STRIPE_WEBHOOK_SECRET` is also set.
