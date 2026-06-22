/**
 * GET /api/admin/orders/:id/supplier-email
 * Returns the pre-formatted supplier order email as JSON.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../../lib/admin-auth';
import { getOrder, generateSupplierEmailText, getOrdersKVFromEnv } from '../../../../../lib/orders-server';
import { getSupplierForCategory } from '../../../../../lib/supplier-routing';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

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

  const category = order.items[0]?.category ?? '';
  const supplier = getSupplierForCategory(category);

  const subject = `Order ${order.id} — New Shipment Request`;
  const body_text = generateSupplierEmailText(order);

  return json({
    ok: true,
    subject,
    body_text,
    supplier: supplier ? {
      name: supplier.supplier_name,
      platform: supplier.platform,
      ship_from: supplier.ship_from,
      est_days_min: supplier.est_days_min,
      est_days_max: supplier.est_days_max,
    } : null,
  });
}
