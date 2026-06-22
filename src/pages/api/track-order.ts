/**
 * POST /api/track-order
 * ─────────────────────────────────────────────────────────────────────────────
 * Guest-accessible order tracking. No auth required.
 * Body: { order_id: string, email: string }
 *
 * Returns the order's public tracking info if email matches.
 * Never exposes internal fields (supplier_sku, notes, cost data, etc).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { getOrdersKVFromEnv, getOrder } from '../../lib/orders-server';
import { resolveCarrier } from '../../lib/tracking';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Public fields safe to expose to unauthenticated guest
function publicOrderView(order: {
  id: string;
  status: string;
  tracking_number?: string;
  shipping_carrier?: string;
  shipping_address?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: Array<{
    title: string;
    image: string;
    color?: string;
    size?: string;
    qty: number;
    unit_price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
}) {
  const carrierInfo = order.tracking_number ? resolveCarrier(order.tracking_number) : null;

  return {
    id: order.id,
    order_number: order.id.slice(-8).toUpperCase(),
    status: order.status,
    status_label: STATUS_LABELS[order.status] ?? order.status,
    tracking_number: order.tracking_number ?? null,
    carrier: carrierInfo?.name ?? order.shipping_carrier ?? null,
    tracking_url: carrierInfo?.url ?? null,
    shipping_address: order.shipping_address ?? null,
    items: order.items.map((i) => ({
      title: i.title,
      image: i.image,
      color: i.color ?? null,
      size: i.size ?? null,
      qty: i.qty,
      unit_price: i.unit_price,
      line_total: i.unit_price * i.qty,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}

const STATUS_LABELS: Record<string, string> = {
  pending:          'Pending',
  payment_captured: 'Paid — preparing your order',
  sent_to_supplier: 'Processing — being packed',
  shipped:          'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered:        'Delivered',
  completed:        'Complete',
  cancelled:        'Cancelled',
  refunded:         'Refunded',
};

export const POST: APIRoute = async (context) => {
  let body: { order_id?: unknown; email?: unknown };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const orderId = typeof body.order_id === 'string' ? body.order_id.trim() : null;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null;

  if (!orderId || !email) {
    return json({ error: 'order_id and email are required' }, 400);
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email format' }, 400);
  }

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  const order = await getOrder(kv, orderId);

  // Use timing-safe constant response to prevent order-id enumeration
  if (!order || order.customer_email.toLowerCase() !== email) {
    // Deliberate 400ms delay to slow brute-force attempts
    await new Promise((r) => setTimeout(r, 400));
    return json({ error: 'No order found for that order ID and email combination.' }, 404);
  }

  return json({ ok: true, order: publicOrderView(order) });
};
