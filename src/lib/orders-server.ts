/**
 * orders-server.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side order data layer.
 *
 * KV ARCHITECTURE DECISION:
 * Orders are stored in ORDERS_KV (separate from CART_KV) under key `order:{id}`.
 * This keeps order data isolated from transient cart data.
 * - CART_KV: ephemeral cart sessions (30-day TTL)
 * - ORDERS_KV: permanent order records (no TTL — orders never expire)
 *
 * Order schema mirrors what a Stripe webhook handler would write.
 * An order index is maintained under key `order_index` (JSON array of ids)
 * so we can list orders without KV prefix scanning (CF KV list has limits).
 *
 * Local dev: in-memory fallback identical to cart-server.ts pattern.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { APIContext } from 'astro';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'payment_captured'
  | 'sent_to_supplier'
  | 'shipped'
  | 'delivered'
  | 'refunded'
  | 'cancelled';

export interface OrderItem {
  product_id: string;
  variant_sku: string;
  title: string;
  image: string;
  color?: string;
  size?: string;
  qty: number;
  unit_price: number; // dollars
  supplier_sku?: string;
  category?: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string; // order_{uuid}
  customer_email: string;
  customer_name?: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  items: OrderItem[];
  subtotal: number; // dollars
  shipping: number; // dollars
  tax: number; // dollars
  total: number; // dollars
  currency: string;
  status: OrderStatus;
  supplier_status?: string;
  tracking_number?: string;
  shipping_carrier?: string;
  shipping_address?: ShippingAddress;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderFilters {
  status?: OrderStatus | 'all';
  search?: string; // matches email or order id
  date_from?: string; // ISO date
  date_to?: string; // ISO date
  limit?: number;
  offset?: number;
}

export interface KPISummary {
  today_count: number;
  today_revenue: number;
  week_count: number;
  week_revenue: number;
  month_count: number;
  month_revenue: number;
  top_product_title: string | null;
  top_product_count: number;
  abandoned_carts_count: number; // approximation from CART_KV
}

// ── KV Interface ──────────────────────────────────────────────────────────────

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number }): Promise<{ keys: { name: string }[] }>;
}

// ── In-memory dev fallback ────────────────────────────────────────────────────

// Use globalThis to persist across Vite HMR module reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __posDevMemory: Map<string, string> | undefined;
}
if (!globalThis.__posDevMemory) {
  globalThis.__posDevMemory = new Map<string, string>();
}
const _devMemory = globalThis.__posDevMemory;

// Seed some test orders for development
const _seedOrders: Order[] = [
  {
    id: 'order_test_001',
    customer_email: 'test@example.com',
    customer_name: 'Jane Smith',
    stripe_session_id: 'cs_test_abc123',
    items: [
      {
        product_id: 'pos-footwear-001-white-cement-high-top-court-sneaker',
        variant_sku: 'POS-FOO-001-01',
        title: 'White cement high-top court sneaker',
        image: 'https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg',
        color: 'White/Grey',
        size: 'EU 38',
        qty: 1,
        unit_price: 149,
        category: 'footwear',
        supplier_sku: 'CHEN-52AC704F-WG38',
      },
    ],
    subtotal: 149,
    shipping: 0,
    tax: 12,
    total: 161,
    currency: 'usd',
    status: 'payment_captured',
    shipping_address: {
      name: 'Jane Smith',
      line1: '123 Main St',
      city: 'Brooklyn',
      state: 'NY',
      postal_code: '11201',
      country: 'US',
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_test_002',
    customer_email: 'anna@example.com',
    customer_name: 'Anna T.',
    stripe_session_id: 'cs_test_def456',
    items: [
      {
        product_id: 'pos-women-003',
        variant_sku: 'POS-WOM-003-02',
        title: 'Floral wrap midi dress',
        image: 'https://photo.yupoo.com/ypd2023/abc/medium.jpeg',
        color: 'Rose',
        size: 'M',
        qty: 2,
        unit_price: 89,
        category: 'women',
        supplier_sku: 'YPD-ABC-R-M',
      },
    ],
    subtotal: 178,
    shipping: 0,
    tax: 14,
    total: 192,
    currency: 'usd',
    status: 'shipped',
    tracking_number: '1Z9999999999999999',
    shipping_carrier: 'UPS',
    shipping_address: {
      name: 'Anna T.',
      line1: '456 Park Ave',
      city: 'Manhattan',
      state: 'NY',
      postal_code: '10022',
      country: 'US',
    },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Seed dev memory with test orders
function ensureDevSeeded() {
  if (!_devMemory.has('order_index')) {
    const ids = _seedOrders.map((o) => o.id);
    _devMemory.set('order_index', JSON.stringify(ids));
    for (const order of _seedOrders) {
      _devMemory.set(`order:${order.id}`, JSON.stringify(order));
    }
  }
}

const devKV: KVLike = {
  async get(key) {
    ensureDevSeeded();
    return _devMemory.get(key) ?? null;
  },
  async put(key, value) {
    ensureDevSeeded();
    _devMemory.set(key, value);
  },
  async delete(key) {
    _devMemory.delete(key);
  },
  async list(options) {
    ensureDevSeeded();
    const prefix = options?.prefix ?? '';
    const keys = [..._devMemory.keys()]
      .filter((k) => k.startsWith(prefix))
      .map((name) => ({ name }));
    return { keys };
  },
};

// ── KV resolver ───────────────────────────────────────────────────────────────

function getOrdersKV(context: APIContext): KVLike {
  const env = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = (env?.ORDERS_KV ?? env?.CART_KV) as KVLike | undefined;
  if (kv && typeof kv.get === 'function') return kv;
  return devKV;
}

// For use outside APIContext (page frontmatter)
export function getOrdersKVFromEnv(env: Record<string, unknown> | undefined): KVLike {
  const kv = (env?.ORDERS_KV ?? env?.CART_KV) as KVLike | undefined;
  if (kv && typeof kv.get === 'function') return kv;
  ensureDevSeeded();
  return devKV;
}

// ── Index management ──────────────────────────────────────────────────────────

async function getOrderIndex(kv: KVLike): Promise<string[]> {
  const raw = await kv.get('order_index');
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function addToOrderIndex(kv: KVLike, orderId: string): Promise<void> {
  const ids = await getOrderIndex(kv);
  if (!ids.includes(orderId)) {
    ids.unshift(orderId); // newest first
    await kv.put('order_index', JSON.stringify(ids));
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * saveOrder — write an order to KV and add to index.
 * Called by Stripe webhook handler when a payment succeeds.
 */
export async function saveOrder(kv: KVLike, order: Order): Promise<void> {
  order.updated_at = new Date().toISOString();
  await kv.put(`order:${order.id}`, JSON.stringify(order));
  await addToOrderIndex(kv, order.id);
}

/**
 * getOrder — fetch a single order by id.
 */
export async function getOrder(
  kv: KVLike,
  orderId: string
): Promise<Order | null> {
  const raw = await kv.get(`order:${orderId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

/**
 * listOrders — fetch orders with optional filters.
 * Returns paginated array + total count.
 */
export async function listOrders(
  kv: KVLike,
  filters: OrderFilters = {}
): Promise<{ orders: Order[]; total: number }> {
  const ids = await getOrderIndex(kv);

  // Fetch all orders (could be optimized with KV list + pagination for large stores)
  const all = (
    await Promise.all(ids.map((id) => getOrder(kv, id)))
  ).filter((o): o is Order => o !== null);

  // Filter
  let filtered = all;

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((o) => o.status === filters.status);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        (o.customer_name ?? '').toLowerCase().includes(q)
    );
  }

  if (filters.date_from) {
    const from = new Date(filters.date_from).getTime();
    filtered = filtered.filter((o) => new Date(o.created_at).getTime() >= from);
  }

  if (filters.date_to) {
    const to = new Date(filters.date_to).getTime() + 86400000; // inclusive
    filtered = filtered.filter((o) => new Date(o.created_at).getTime() <= to);
  }

  const total = filtered.length;
  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 50;
  const paged = filtered.slice(offset, offset + limit);

  return { orders: paged, total };
}

/**
 * updateOrderStatus — change an order's status and optionally add tracking info.
 */
export async function updateOrderStatus(
  kv: KVLike,
  orderId: string,
  status: OrderStatus,
  meta?: {
    tracking_number?: string;
    shipping_carrier?: string;
    supplier_status?: string;
    notes?: string;
  }
): Promise<Order | null> {
  const order = await getOrder(kv, orderId);
  if (!order) return null;

  order.status = status;
  order.updated_at = new Date().toISOString();

  if (meta?.tracking_number) order.tracking_number = meta.tracking_number;
  if (meta?.shipping_carrier) order.shipping_carrier = meta.shipping_carrier;
  if (meta?.supplier_status) order.supplier_status = meta.supplier_status;
  if (meta?.notes) order.notes = meta.notes;

  await kv.put(`order:${orderId}`, JSON.stringify(order));
  return order;
}

/**
 * kpiSummary — compute dashboard KPIs.
 */
export async function kpiSummary(kv: KVLike): Promise<KPISummary> {
  const ids = await getOrderIndex(kv);
  const all = (
    await Promise.all(ids.map((id) => getOrder(kv, id)))
  ).filter((o): o is Order => o !== null);

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();
  const weekMs = now - 7 * 24 * 60 * 60 * 1000;
  const monthMs = now - 30 * 24 * 60 * 60 * 1000;

  // Exclude cancelled/refunded from revenue
  const countable = all.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded');

  const todayOrders = countable.filter((o) => new Date(o.created_at).getTime() >= todayMs);
  const weekOrders = countable.filter((o) => new Date(o.created_at).getTime() >= weekMs);
  const monthOrders = countable.filter((o) => new Date(o.created_at).getTime() >= monthMs);

  const sum = (orders: Order[]) => orders.reduce((acc, o) => acc + o.total, 0);

  // Top product by qty sold (last 30 days)
  const productCounts: Record<string, { title: string; count: number }> = {};
  for (const order of monthOrders) {
    for (const item of order.items) {
      if (!productCounts[item.product_id]) {
        productCounts[item.product_id] = { title: item.title, count: 0 };
      }
      productCounts[item.product_id].count += item.qty;
    }
  }

  let topProduct: { title: string; count: number } | null = null;
  for (const entry of Object.values(productCounts)) {
    if (!topProduct || entry.count > topProduct.count) topProduct = entry;
  }

  // Abandoned carts: carts in KV not in order index
  // This is an approximation — in production use CART_KV.list() if available
  let abandonedCount = 0;
  try {
    const cartList = await kv.list({ prefix: 'cart:' });
    abandonedCount = cartList.keys.length;
  } catch {
    abandonedCount = 0;
  }

  return {
    today_count: todayOrders.length,
    today_revenue: sum(todayOrders),
    week_count: weekOrders.length,
    week_revenue: sum(weekOrders),
    month_count: monthOrders.length,
    month_revenue: sum(monthOrders),
    top_product_title: topProduct?.title ?? null,
    top_product_count: topProduct?.count ?? 0,
    abandoned_carts_count: abandonedCount,
  };
}

/**
 * generateSupplierCSV — create CSV content for a single order.
 */
export function generateSupplierCSV(order: Order): string {
  const rows: string[] = [
    'item,color,size,qty,supplier_sku,customer_name,address_line1,address_line2,city,state,postal_code,country',
  ];

  const addr = order.shipping_address;
  for (const item of order.items) {
    const row = [
      item.title,
      item.color ?? '',
      item.size ?? '',
      String(item.qty),
      item.supplier_sku ?? '',
      addr?.name ?? order.customer_name ?? '',
      addr?.line1 ?? '',
      addr?.line2 ?? '',
      addr?.city ?? '',
      addr?.state ?? '',
      addr?.postal_code ?? '',
      addr?.country ?? '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',');
    rows.push(row);
  }

  return rows.join('\n');
}

/**
 * generateSupplierEmailText — formatted text for "Copy supplier order email" action.
 */
export function generateSupplierEmailText(order: Order): string {
  const addr = order.shipping_address;
  const itemLines = order.items
    .map(
      (i) =>
        `  - ${i.title}${i.color ? ` | ${i.color}` : ''}${i.size ? ` | ${i.size}` : ''} × ${i.qty}${i.supplier_sku ? ` (SKU: ${i.supplier_sku})` : ''}`
    )
    .join('\n');

  return `New order from Piece of Stass

Order ID: ${order.id}
Date: ${new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Items to ship:
${itemLines}

Ship to:
  ${addr?.name ?? order.customer_name ?? ''}
  ${addr?.line1 ?? ''}${addr?.line2 ? '\n  ' + addr.line2 : ''}
  ${addr?.city ?? ''}, ${addr?.state ?? ''} ${addr?.postal_code ?? ''}
  ${addr?.country ?? ''}

Please confirm receipt and expected dispatch date.

Thank you,
Piece of Stass Ops`;
}

// Export devKV for use in contexts outside APIContext (e.g. page frontmatter)
export { devKV };
export type { KVLike };
