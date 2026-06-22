/**
 * GET /api/admin/customers
 * List customers aggregated from orders.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { listOrders, getOrdersKVFromEnv } from '../../../../lib/orders-server';

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
  const q = url.searchParams.get('q') ?? '';
  const limit = parseInt(url.searchParams.get('limit') ?? '50', 10);

  const { orders: allOrders } = await listOrders(kv, { limit: 1000 });

  const customerMap = new Map<string, {
    email: string;
    name: string | undefined;
    orderCount: number;
    totalSpend: number;
    lastOrderDate: string;
  }>();

  for (const order of allOrders) {
    const existing = customerMap.get(order.customer_email);
    if (existing) {
      existing.orderCount++;
      existing.totalSpend += order.total;
      if (order.created_at > existing.lastOrderDate) {
        existing.lastOrderDate = order.created_at;
      }
    } else {
      customerMap.set(order.customer_email, {
        email: order.customer_email,
        name: order.customer_name,
        orderCount: 1,
        totalSpend: order.total,
        lastOrderDate: order.created_at,
      });
    }
  }

  let customers = [...customerMap.values()].sort(
    (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
  );

  if (q) {
    const lq = q.toLowerCase();
    customers = customers.filter(
      (c) =>
        c.email.toLowerCase().includes(lq) ||
        (c.name ?? '').toLowerCase().includes(lq)
    );
  }

  const total = customers.length;
  customers = customers.slice(0, limit);

  return json({ customers, total });
}
