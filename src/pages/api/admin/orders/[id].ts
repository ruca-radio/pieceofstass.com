/**
 * PATCH /api/admin/orders/:id
 * Update order status and optional metadata (tracking, carrier, notes).
 *
 * Body: { status, tracking_number?, shipping_carrier?, supplier_status?, notes? }
 *
 * Requires valid pos_admin cookie.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { getOrder, updateOrderStatus, getOrdersKVFromEnv } from '../../../../lib/orders-server';
import type { OrderStatus } from '../../../../lib/orders-server';

export const prerender = false;

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'payment_captured',
  'sent_to_supplier',
  'shipped',
  'delivered',
  'refunded',
  'cancelled',
];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PATCH(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { id } = context.params;
  if (!id) return json({ error: 'Missing order id' }, 400);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  let body: {
    status?: string;
    tracking_number?: string;
    shipping_carrier?: string;
    supplier_status?: string;
    notes?: string;
  };

  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.status || !VALID_STATUSES.includes(body.status as OrderStatus)) {
    return json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, 400);
  }

  // Enforce status transitions
  const existing = await getOrder(kv, id);
  if (!existing) return json({ error: 'Order not found' }, 404);

  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['payment_captured'],
    payment_captured: ['sent_to_supplier', 'cancelled'],
    sent_to_supplier: ['shipped', 'cancelled'],
    shipped: ['delivered', 'refunded'],
    delivered: ['refunded'],
    refunded: [],
    cancelled: [],
  };

  const allowed = allowedTransitions[existing.status] ?? [];
  if (!allowed.includes(body.status as OrderStatus)) {
    return json({
      error: `Cannot transition from '${existing.status}' to '${body.status}'. Allowed: ${allowed.join(', ') || 'none'}`,
    }, 409);
  }

  // Validate tracking number for shipped status
  if (body.status === 'shipped' && !body.tracking_number) {
    return json({ error: 'tracking_number is required when marking as shipped' }, 400);
  }

  const updated = await updateOrderStatus(kv, id, body.status as OrderStatus, {
    tracking_number: body.tracking_number,
    shipping_carrier: body.shipping_carrier,
    supplier_status: body.supplier_status,
    notes: body.notes,
  });

  if (!updated) return json({ error: 'Failed to update order' }, 500);

  return json({ ok: true, order: updated });
}

// GET is also useful for the admin UI to refresh order data
export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { id } = context.params;
  if (!id) return json({ error: 'Missing order id' }, 400);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);
  const order = await getOrder(kv, id);

  if (!order) return json({ error: 'Order not found' }, 404);
  return json(order);
}
