/**
 * GET /api/admin/orders/:id/supplier-csv
 * Returns a CSV file ready to send to the supplier.
 * Columns: item, color, size, qty, supplier_sku, customer_name, address_line1, address_line2, city, state, postal_code, country
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../../lib/admin-auth';
import { getOrder, getOrdersKVFromEnv, generateSupplierCSV } from '../../../../../lib/orders-server';

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = context.params;
  if (!id) return new Response('Missing order id', { status: 400 });

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);
  const order = await getOrder(kv, id);

  if (!order) return new Response('Order not found', { status: 404 });

  const csv = generateSupplierCSV(order);
  const filename = `supplier-order-${id}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
