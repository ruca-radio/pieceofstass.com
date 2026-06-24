/**
 * GET /api/admin/analytics/summary
 * Returns analytics data for charts.
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
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  const { orders: allOrders } = await listOrders(kv, { status: 'all', limit: 1000 });
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Revenue by day (last 30 days)
  const revenueByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    revenueByDay[key] = 0;
  }

  const countable = allOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
  for (const o of countable) {
    const ts = new Date(o.created_at).getTime();
    if (ts >= thirtyDaysAgo) {
      const key = new Date(ts).toISOString().slice(0, 10);
      if (key in revenueByDay) revenueByDay[key] += o.total;
    }
  }

  // Orders by status
  const statusCounts: Record<string, number> = {};
  for (const o of allOrders) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }

  // Top 10 products by revenue (last 30 days)
  const productMap: Record<string, { title: string; revenue: number; qty: number }> = {};
  for (const o of countable) {
    if (new Date(o.created_at).getTime() < thirtyDaysAgo) continue;
    for (const item of o.items) {
      if (!productMap[item.product_id]) {
        productMap[item.product_id] = { title: item.title, revenue: 0, qty: 0 };
      }
      productMap[item.product_id].revenue += item.unit_price * item.qty;
      productMap[item.product_id].qty += item.qty;
    }
  }
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return json({
    revenue_by_day: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
    orders_by_status: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    top_products: topProducts,
    generated_at: new Date().toISOString(),
  });
}
