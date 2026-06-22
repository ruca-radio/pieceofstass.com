/**
 * GET /api/admin/orders
 * List orders with filters — used by global search and CSV export.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { listOrders, getOrdersKVFromEnv } from '../../../../lib/orders-server';
import type { OrderStatus, OrderFilters } from '../../../../lib/orders-server';

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

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  const url = new URL(context.request.url);
  const filters: OrderFilters = {
    status: (url.searchParams.get('status') || 'all') as OrderStatus | 'all',
    search: url.searchParams.get('q') || url.searchParams.get('email') || undefined,
    date_from: url.searchParams.get('from') || undefined,
    date_to: url.searchParams.get('to') || undefined,
    limit: parseInt(url.searchParams.get('limit') ?? '50', 10),
    offset: parseInt(url.searchParams.get('offset') ?? '0', 10),
  };

  const { orders, total } = await listOrders(kv, filters);

  return json({ orders, total });
}
