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
 *
 * NOTE: A parallel agent is wiring transactional email triggers from this file.
 * Email hook functions (sendOrderEmail, sendShipmentEmail etc.) are exported
 * stubs that the email agent fills in — do NOT remove them.
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

export interface TimelineEvent {
  id: string;
  ts: string;         // ISO
  actor: string;      // 'admin' | 'system' | 'customer'
  type: 'status_change' | 'note' | 'email_sent' | 'refund' | 'supplier' | 'info';
  message: string;
  meta?: Record<string, unknown>;
}

export interface RefundRecord {
  stripe_refund_id: string;
  amount: number;       // dollars
  reason: string;
  partial: boolean;
  created_at: string;
}

export interface Order {
  id: string; // order_{uuid}
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
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
  supplier_confirmed_at?: string;
  tracking_number?: string;
  shipping_carrier?: string;
  shipping_address?: ShippingAddress;
  notes?: string;         // legacy field — use admin_notes
  admin_notes?: string;   // free text scratchpad
  timeline?: TimelineEvent[];
  refund?: RefundRecord;
  created_at: string;
  updated_at: string;
}

export interface OrderFilters {
  status?: OrderStatus | 'all';
  search?: string; // matches email or order id
  date_from?: string; // ISO date
  date_to?: string; // ISO date
  supplier?: string;  // supplier_id filter
  total_min?: number;
  total_max?: number;
  limit?: number;
  offset?: number;
  sort?: 'created_at_desc' | 'created_at_asc' | 'total_desc' | 'total_asc';
}

export interface KPISummary {
  today_count: number;
  today_revenue: number;
  week_count: number;
  week_revenue: number;
  month_count: number;
  month_revenue: number;
  aov_30d: number;
  top_products_30d: Array<{ product_id: string; title: string; revenue: number; qty: number }>;
  pending_fulfillment_count: number;   // status=payment_captured
  stuck_orders: Order[];               // payment_captured > 2 days
  overdue_shipments: Order[];          // shipped > 30 days, not delivered
  top_product_title: string | null;
  top_product_count: number;
  abandoned_carts_count: number;
  refund_rate_30d: number;             // 0–1
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
    customer_email: 'jane@example.com',
    customer_name: 'Jane Smith',
    customer_phone: '+1-555-0100',
    stripe_session_id: 'cs_test_abc123',
    stripe_payment_intent_id: 'pi_test_abc123',
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
    timeline: [
      {
        id: 'evt_001',
        ts: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured via Stripe',
      },
    ],
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
    timeline: [
      {
        id: 'evt_002a',
        ts: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured via Stripe',
      },
      {
        id: 'evt_002b',
        ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Marked as Sent to Supplier',
      },
      {
        id: 'evt_002c',
        ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Shipped — tracking 1Z9999999999999999 (UPS)',
        meta: { tracking_number: '1Z9999999999999999', carrier: 'UPS' },
      },
      {
        id: 'evt_002d',
        ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'email_sent',
        message: 'Shipping notification email sent to anna@example.com',
      },
    ],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_test_003',
    customer_email: 'mike@example.com',
    customer_name: 'Mike Chen',
    stripe_session_id: 'cs_test_ghi789',
    items: [
      {
        product_id: 'pos-bags-001',
        variant_sku: 'POS-BAG-001-01',
        title: 'Structured mini crossbody bag',
        image: 'https://photo.yupoo.com/3293950449/abc/medium.jpeg',
        color: 'Black',
        size: 'One Size',
        qty: 1,
        unit_price: 119,
        category: 'bags',
        supplier_sku: 'BAG-001-BLK',
      },
    ],
    subtotal: 119,
    shipping: 0,
    tax: 10,
    total: 129,
    currency: 'usd',
    status: 'sent_to_supplier',
    supplier_status: 'Confirmed',
    supplier_confirmed_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    shipping_address: {
      name: 'Mike Chen',
      line1: '789 Market St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'US',
    },
    timeline: [
      {
        id: 'evt_003a',
        ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured',
      },
      {
        id: 'evt_003b',
        ts: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'supplier',
        message: 'Sent to supplier — Bags Supplier 3293950449',
      },
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_test_004',
    customer_email: 'sarah@example.com',
    customer_name: 'Sarah Johnson',
    stripe_session_id: 'cs_test_jkl012',
    items: [
      {
        product_id: 'pos-men-005',
        variant_sku: 'POS-MEN-005-02',
        title: 'Premium cotton slim-fit polo',
        image: 'https://photo.yupoo.com/miao2017/abc/medium.jpeg',
        color: 'Navy',
        size: 'L',
        qty: 1,
        unit_price: 75,
        category: 'men',
        supplier_sku: 'MIAO-POLO-NVY-L',
      },
    ],
    subtotal: 75,
    shipping: 0,
    tax: 6,
    total: 81,
    currency: 'usd',
    status: 'delivered',
    tracking_number: 'USPS123456789',
    shipping_carrier: 'USPS',
    shipping_address: {
      name: 'Sarah Johnson',
      line1: '321 Oak Lane',
      city: 'Chicago',
      state: 'IL',
      postal_code: '60601',
      country: 'US',
    },
    timeline: [
      {
        id: 'evt_004a',
        ts: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured',
      },
      {
        id: 'evt_004b',
        ts: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Sent to supplier',
      },
      {
        id: 'evt_004c',
        ts: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Shipped — tracking USPS123456789 (USPS)',
      },
      {
        id: 'evt_004d',
        ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Marked as Delivered',
      },
    ],
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_test_005',
    customer_email: 'james@example.com',
    customer_name: 'James Wu',
    stripe_session_id: 'cs_test_mno345',
    items: [
      {
        product_id: 'pos-watches-002',
        variant_sku: 'POS-WAT-002-01',
        title: 'Minimalist field watch',
        image: 'https://photo.yupoo.com/117034687/abc/medium.jpeg',
        color: 'Silver/Black',
        size: '40mm',
        qty: 1,
        unit_price: 210,
        category: 'watches',
        supplier_sku: 'WAT-002-SB-40',
      },
    ],
    subtotal: 210,
    shipping: 0,
    tax: 17,
    total: 227,
    currency: 'usd',
    status: 'refunded',
    shipping_address: {
      name: 'James Wu',
      line1: '654 Pine St',
      city: 'Seattle',
      state: 'WA',
      postal_code: '98101',
      country: 'US',
    },
    refund: {
      stripe_refund_id: 're_test_xyz',
      amount: 227,
      reason: 'customer_request',
      partial: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    timeline: [
      {
        id: 'evt_005a',
        ts: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured',
      },
      {
        id: 'evt_005b',
        ts: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'refund',
        message: 'Full refund issued — $227.00 (customer_request). Stripe refund: re_test_xyz',
      },
      {
        id: 'evt_005c',
        ts: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'email_sent',
        message: 'Refund confirmation email sent to james@example.com',
      },
    ],
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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

  // Fetch all orders
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

  if (filters.total_min !== undefined) {
    filtered = filtered.filter((o) => o.total >= filters.total_min!);
  }

  if (filters.total_max !== undefined) {
    filtered = filtered.filter((o) => o.total <= filters.total_max!);
  }

  if (filters.supplier) {
    filtered = filtered.filter((o) =>
      o.items.some((i) => i.category === filters.supplier)
    );
  }

  // Sort
  const sort = filters.sort ?? 'created_at_desc';
  filtered.sort((a, b) => {
    switch (sort) {
      case 'created_at_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'total_desc': return b.total - a.total;
      case 'total_asc': return a.total - b.total;
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const total = filtered.length;
  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 50;
  const paged = filtered.slice(offset, offset + limit);

  return { orders: paged, total };
}

/**
 * updateOrderStatus — change an order's status and optionally add tracking info.
 * Always appends a timeline event. Email hooks fire here for the email agent.
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
    actor?: string;
    refund?: RefundRecord;
    supplier_confirmed_at?: string;
  }
): Promise<Order | null> {
  const order = await getOrder(kv, orderId);
  if (!order) return null;

  const prevStatus = order.status;
  order.status = status;
  order.updated_at = new Date().toISOString();

  if (meta?.tracking_number) order.tracking_number = meta.tracking_number;
  if (meta?.shipping_carrier) order.shipping_carrier = meta.shipping_carrier;
  if (meta?.supplier_status) order.supplier_status = meta.supplier_status;
  if (meta?.notes) order.notes = meta.notes;
  if (meta?.refund) order.refund = meta.refund;
  if (meta?.supplier_confirmed_at) order.supplier_confirmed_at = meta.supplier_confirmed_at;

  // Build timeline event message
  let message = `Status changed: ${prevStatus} → ${status}`;
  if (status === 'shipped' && meta?.tracking_number) {
    message = `Shipped — tracking ${meta.tracking_number}${meta.shipping_carrier ? ` (${meta.shipping_carrier})` : ''}`;
  } else if (status === 'sent_to_supplier') {
    message = 'Marked as Sent to Supplier';
  } else if (status === 'delivered') {
    message = 'Marked as Delivered';
  } else if (status === 'refunded' && meta?.refund) {
    const r = meta.refund;
    message = `${r.partial ? 'Partial' : 'Full'} refund issued — $${r.amount.toFixed(2)} (${r.reason}). Stripe refund: ${r.stripe_refund_id}`;
  } else if (status === 'cancelled') {
    message = 'Order cancelled';
  }

  await appendTimeline(kv, orderId, {
    actor: meta?.actor ?? 'admin',
    type: status === 'refunded' ? 'refund' : status === 'sent_to_supplier' ? 'supplier' : 'status_change',
    message,
    meta: meta?.tracking_number ? { tracking_number: meta.tracking_number, carrier: meta.shipping_carrier } : undefined,
  }, order);

  // Re-fetch to get updated timeline
  const updated = await getOrder(kv, orderId);
  return updated;
}

/**
 * appendTimeline — add an event to the order's timeline array.
 * Pass order if already loaded to avoid a double-fetch.
 */
export async function appendTimeline(
  kv: KVLike,
  orderId: string,
  event: Omit<TimelineEvent, 'id' | 'ts'>,
  existingOrder?: Order
): Promise<void> {
  const order = existingOrder ?? await getOrder(kv, orderId);
  if (!order) return;

  const evt: TimelineEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ts: new Date().toISOString(),
    ...event,
  };

  order.timeline = [...(order.timeline ?? []), evt];
  order.updated_at = new Date().toISOString();
  await kv.put(`order:${orderId}`, JSON.stringify(order));
}

/**
 * appendAdminNote — save admin scratchpad note + timeline event.
 */
export async function appendAdminNote(
  kv: KVLike,
  orderId: string,
  note: string
): Promise<Order | null> {
  const order = await getOrder(kv, orderId);
  if (!order) return null;

  order.admin_notes = note;
  order.updated_at = new Date().toISOString();

  const evt: TimelineEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ts: new Date().toISOString(),
    actor: 'admin',
    type: 'note',
    message: `Admin note: ${note.slice(0, 100)}${note.length > 100 ? '…' : ''}`,
  };

  order.timeline = [...(order.timeline ?? []), evt];
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
  const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Exclude cancelled/refunded from revenue
  const countable = all.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded');

  const todayOrders = countable.filter((o) => new Date(o.created_at).getTime() >= todayMs);
  const weekOrders = countable.filter((o) => new Date(o.created_at).getTime() >= weekMs);
  const monthOrders = countable.filter((o) => new Date(o.created_at).getTime() >= monthMs);

  const sum = (orders: Order[]) => orders.reduce((acc, o) => acc + o.total, 0);

  // AOV 30d
  const aov_30d = monthOrders.length > 0 ? sum(monthOrders) / monthOrders.length : 0;

  // Top 5 products by revenue (last 30 days)
  const productMap: Record<string, { product_id: string; title: string; revenue: number; qty: number }> = {};
  for (const order of monthOrders) {
    for (const item of order.items) {
      if (!productMap[item.product_id]) {
        productMap[item.product_id] = { product_id: item.product_id, title: item.title, revenue: 0, qty: 0 };
      }
      productMap[item.product_id].revenue += item.unit_price * item.qty;
      productMap[item.product_id].qty += item.qty;
    }
  }
  const top_products_30d = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top product (legacy compat)
  const topProduct = top_products_30d[0] ?? null;

  // Pending fulfillment (payment_captured)
  const pendingFulfillment = all.filter((o) => o.status === 'payment_captured');

  // Stuck orders: payment_captured > 2 days
  const stuckOrders = all.filter(
    (o) => o.status === 'payment_captured' && new Date(o.created_at).getTime() < twoDaysAgo
  );

  // Overdue shipments: shipped > 30 days, not delivered
  const overdueShipments = all.filter(
    (o) =>
      o.status === 'shipped' &&
      new Date(o.updated_at).getTime() < thirtyDaysAgo
  );

  // Refund rate 30d
  const month30all = all.filter((o) => new Date(o.created_at).getTime() >= monthMs);
  const refunded30d = month30all.filter((o) => o.status === 'refunded').length;
  const refund_rate_30d = month30all.length > 0 ? refunded30d / month30all.length : 0;

  // Abandoned carts approximation
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
    aov_30d,
    top_products_30d,
    pending_fulfillment_count: pendingFulfillment.length,
    stuck_orders: stuckOrders,
    overdue_shipments: overdueShipments,
    top_product_title: topProduct?.title ?? null,
    top_product_count: topProduct?.qty ?? 0,
    abandoned_carts_count: abandonedCount,
    refund_rate_30d,
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

// ── Email hooks (stubs for email agent to fill in) ────────────────────────────
// The parallel email agent wires these. Do NOT remove. Called from API routes.

export async function onOrderShipped(
  order: Order,
  env?: Record<string, unknown>
): Promise<void> {
  // Email agent fills this in — sends shipping notification to customer
  // and posts Klaviyo "shipment_notification" event
  console.log(`[email-hook] onOrderShipped: ${order.id} → ${order.customer_email}`);
  if (env?.RESEND_API_KEY) {
    // Placeholder — email agent wires actual Resend/Klaviyo call here
  }
}

export async function onOrderRefunded(
  order: Order,
  refund: RefundRecord,
  env?: Record<string, unknown>
): Promise<void> {
  console.log(`[email-hook] onOrderRefunded: ${order.id} $${refund.amount}`);
  if (env?.RESEND_API_KEY) {
    // Email agent wires refund confirmation email here
  }
}

export async function onOrderCancelled(
  order: Order,
  env?: Record<string, unknown>
): Promise<void> {
  console.log(`[email-hook] onOrderCancelled: ${order.id}`);
  if (env?.RESEND_API_KEY) {
    // Email agent wires cancellation email here
  }
}

export async function onSentToSupplier(
  order: Order,
  env?: Record<string, unknown>
): Promise<void> {
  console.log(`[email-hook] onSentToSupplier: ${order.id}`);
  // Optionally email supplier — supplier email comes from env var
}

// Export devKV for use in contexts outside APIContext (e.g. page frontmatter)
export { devKV };
export type { KVLike };

// ─────────────────────────────────────────────────────────────────────────────
// Email-aware status transition
// ─────────────────────────────────────────────────────────────────────────────

import type { EmailEnv } from './emails/send';

/**
 * updateOrderStatusWithEmail
 * Same as updateOrderStatus but fires the appropriate transactional email
 * for each status transition. Idempotent — email dispatcher checks email_log.
 *
 * Status → email map:
 *   payment_captured → sendOrderConfirmation
 *   shipped          → sendShippingNotification (requires meta.tracking_number)
 *   delivered        → sendDeliveryConfirmation
 *   refunded         → sendRefundConfirmation
 *   cancelled        → sendCancellation
 */
export async function updateOrderStatusWithEmail(
  kv: KVLike,
  orderId: string,
  status: OrderStatus,
  emailEnv: EmailEnv,
  meta?: {
    tracking_number?: string;
    shipping_carrier?: string;
    supplier_status?: string;
    notes?: string;
    refund_amount?: number;
    cancellation_reason?: string;
    receipt_token?: string;
  }
): Promise<Order | null> {
  const updated = await updateOrderStatus(kv, orderId, status, {
    tracking_number: meta?.tracking_number,
    shipping_carrier: meta?.shipping_carrier,
    supplier_status: meta?.supplier_status,
    notes: meta?.notes,
  });

  if (!updated) return null;

  // Lazy import to avoid circular deps and keep the email dispatcher out of
  // non-email paths (e.g. KPI queries).
  const {
    sendOrderConfirmation,
    sendShippingNotification,
    sendDeliveryConfirmation,
    sendRefundConfirmation,
    sendCancellation,
  } = await import('./emails/send');

  try {
    switch (status) {
      case 'payment_captured':
        await sendOrderConfirmation(updated, emailEnv, kv, {
          receiptToken: meta?.receipt_token,
        });
        break;

      case 'shipped':
        await sendShippingNotification(updated, emailEnv, kv);
        break;

      case 'delivered':
        await sendDeliveryConfirmation(updated, emailEnv, kv);
        break;

      case 'refunded':
        await sendRefundConfirmation(updated, emailEnv, kv, {
          refundAmount: meta?.refund_amount,
        });
        break;

      case 'cancelled':
        await sendCancellation(updated, emailEnv, kv, {
          reason: meta?.cancellation_reason,
          refundAmount: meta?.refund_amount,
        });
        break;

      default:
        // sent_to_supplier, pending — no email
        break;
    }
  } catch (err) {
    // Email failure is non-fatal — order status is already saved
    console.error(`[orders] Email send failed for ${orderId} (${status}):`, err);
  }

  return updated;
}
