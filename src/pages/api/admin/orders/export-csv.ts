/**
 * GET /api/admin/orders/export-csv
 * Export all filtered orders as CSV.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { listOrders, getOrdersKVFromEnv } from '../../../../lib/orders-server';
import type { OrderStatus, OrderFilters } from '../../../../lib/orders-server';

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return new Response('Unauthorized', { status: 401 });
  }

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  const url = new URL(context.request.url);
  const filters: OrderFilters = {
    status: (url.searchParams.get('status') || 'all') as OrderStatus | 'all',
    search: url.searchParams.get('q') || undefined,
    date_from: url.searchParams.get('from') || undefined,
    date_to: url.searchParams.get('to') || undefined,
    limit: 1000, // max export
    offset: 0,
  };

  const { orders } = await listOrders(kv, filters);

  const rows: string[] = [
    'order_id,date,customer_name,customer_email,items,subtotal,shipping,tax,total,currency,status,tracking,carrier,ship_to_name,ship_to_address,ship_to_city,ship_to_state,ship_to_zip,ship_to_country',
  ];

  for (const o of orders) {
    const addr = o.shipping_address;
    const row = [
      o.id,
      new Date(o.created_at).toISOString(),
      o.customer_name ?? '',
      o.customer_email,
      String(o.items.length),
      String(o.subtotal),
      String(o.shipping),
      String(o.tax),
      String(o.total),
      o.currency,
      o.status,
      o.tracking_number ?? '',
      o.shipping_carrier ?? '',
      addr?.name ?? '',
      addr?.line1 ?? '',
      addr?.city ?? '',
      addr?.state ?? '',
      addr?.postal_code ?? '',
      addr?.country ?? '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    rows.push(row);
  }

  const csv = rows.join('\n');
  const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
