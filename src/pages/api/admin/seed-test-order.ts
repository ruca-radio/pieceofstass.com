/**
 * POST /api/admin/seed-test-order
 * DEV ONLY: Seeds a test order into KV for smoke testing.
 * This endpoint is automatically disabled in production (returns 404).
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../lib/admin-auth';
import { saveOrder, getOrdersKVFromEnv } from '../../../lib/orders-server';
import type { Order } from '../../../lib/orders-server';

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  // Only available in non-production
  const isProduction =
    (context.locals as Record<string, unknown>)?.runtime?.env?.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'production';

  if (isProduction) {
    return new Response('Not found', { status: 404 });
  }

  if (!(await isAdminRequest(context))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  const testOrder: Order = {
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveOrder(kv, testOrder);

  return new Response(JSON.stringify({ ok: true, order_id: testOrder.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
