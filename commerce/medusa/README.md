# Piece of Stass — Medusa.js v2 Commerce Backend

Medusa v2 API server powering pieceofstass.com. Handles products, categories, cart, orders, Stripe payment, dropship routing to 8 Yupoo suppliers, and event emission to Klaviyo / Meta CAPI / TikTok.

---

## Quick Start (Local)

**Prerequisites:** Node ≥ 20, Docker (for local Postgres + Redis) or external Neon + Upstash credentials.

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp .env.template .env
# → Edit .env with your Neon DATABASE_URL and Upstash REDIS_URL

# 3. Run database migrations
npm run db:migrate

# 4. Seed products and categories from the catalog
npm run seed

# 5. Start development server (hot-reload)
npm run dev
# API available at http://localhost:9000
# Admin panel at http://localhost:9000/app
```

---

## Project Structure

```
medusa/
├── medusa-config.ts          # All module, plugin, and server configuration
├── package.json
├── .env.template             # Required environment variables (copy → .env)
├── tsconfig.json
├── src/
│   ├── api/                  # Custom route extensions (if needed beyond core)
│   ├── modules/
│   │   └── dropship/         # Custom module: supplier mapping + notification
│   │       ├── index.ts
│   │       ├── service.ts
│   │       └── models/
│   │           └── supplier-mapping.ts
│   ├── workflows/
│   │   └── order-to-supplier.ts   # Workflow: order.placed → supplier email
│   ├── subscribers/
│   │   └── order-placed.ts        # Event subscriber that triggers the workflow
│   └── scripts/
│       └── seed.ts           # Seeds products.json + categories.json into Medusa
```

---

## Key Modules

### Dropship Module (`src/modules/dropship/`)
Maps a product's `metadata.supplier_id` to the corresponding Yupoo supplier contact. On `order.placed`, it:
1. Groups order items by `supplier_id`.
2. Generates a per-supplier CSV with: order ID, customer ship-to (name, address), items (SKU, title, variant, qty), and internal `supplier_url`.
3. Sends the CSV via SMTP to the configured `SUPPLIER_EMAIL_*` address.

The 8 supplier IDs are:
| Supplier ID | Category | Yupoo handle |
|---|---|---|
| `chenyico` | Footwear | chenyico.x.yupoo.com |
| `117034687` | Watches | 117034687.x.yupoo.com |
| `3293950449` | Bags | 3293950449.x.yupoo.com |
| `miao2017` | Men | miao2017.x.yupoo.com |
| `ypd2023` | Women | ypd2023.x.yupoo.com |
| `775180006` | Kids | 775180006.x.yupoo.com |
| `jmshop88` | Fragrance | jmshop88.x.yupoo.com |
| `xtd8288` | Tech | xtd8288.x.yupoo.com |

### Stripe Payment Provider
Configured via `@medusajs/payment-stripe`. Uses Stripe Checkout Session (hosted). Stripe Tax is enabled at the Stripe account level — no additional Medusa configuration required.

### Seed Script (`src/scripts/seed.ts`)
Reads `/home/user/workspace/pieceofstass.com/data/products.json` and `data/categories.json`, then uses Medusa's admin SDK to upsert all categories and products with variants into the database. Safe to run multiple times (idempotent by handle).

---

## Deployment (Railway)

1. Connect GitHub repo to Railway.
2. Set root directory to `apps/medusa` (or `commerce/medusa`).
3. Add all env vars from `.env.template` to Railway Variables.
4. Railway auto-detects Node → runs `npm run build && npm start`.
5. Attach a Neon Postgres database (Railway add-on or external).
6. Attach an Upstash Redis via Railway plugin or external URL.

Refer to the [Medusa Railway deployment guide](https://docs.medusajs.com/deployments/server/railway).

---

## Regions

| Region | Currency | Notes |
|---|---|---|
| US (default) | USD | Created in seed script |
| EU | EUR | Optional — add after launch |
| UK | GBP | Optional — add after launch |
| CA | CAD | Optional — add after launch |

Run `npm run seed` to create the US region, shipping zones, and payment/fulfillment providers.

---

## Security Notes

- Supplier contact emails and Yupoo `supplier_url` values are stored in product `metadata` but **excluded** from Storefront API responses via field-selection.
- The admin panel is not publicly routable in production — access via Railway tunnel.
- Stripe webhook events are verified with HMAC signature before processing.
