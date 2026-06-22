/**
 * GET /api/admin/abandoned-carts
 * List carts with items from last 30 days that haven't converted to orders.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../lib/admin-auth';
import { getOrdersKVFromEnv, listOrders } from '../../../lib/orders-server';

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

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  // Get order index for deduplication
  const { orders: allOrders } = await listOrders(kv, { status: 'all', limit: 1000 });
  const paidEmails = new Set(
    allOrders
      .filter(o => ['payment_captured', 'sent_to_supplier', 'shipped', 'delivered'].includes(o.status))
      .map(o => o.customer_email)
  );

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  let carts: Array<{
    id: string;
    customer_email?: string;
    items: number;
    created_at?: string;
    total?: number;
  }> = [];

  try {
    const result = await kv.list({ prefix: 'cart:', limit: 200 });
    const cartDatas = await Promise.all(
      result.keys.slice(0, 100).map(async (k) => {
        const raw = await kv.get(k.name);
        if (!raw) return null;
        try {
          const cart = JSON.parse(raw);
          const createdAt = cart.created_at ? new Date(cart.created_at).getTime() : 0;
          if (cart.items?.length > 0 && createdAt > thirtyDaysAgo) {
            const email = cart.customer_email;
            // Skip if they've completed an order
            if (email && paidEmails.has(email)) return null;
            const total = cart.items.reduce((sum: number, item: Record<string, number>) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);
            return {
              id: cart.id ?? k.name.replace('cart:', ''),
              customer_email: email,
              items: cart.items.length,
              created_at: cart.created_at,
              total,
            };
          }
          return null;
        } catch { return null; }
      })
    );

    carts = cartDatas
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => {
        const at = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bt - at;
      });
  } catch (e) {
    return json({ carts: [], error: String(e) });
  }

  return json({ carts, total: carts.length });
}

export async function POST(context: APIContext): Promise<Response> {
  // Send recovery email for a cart
  if (!(await isAdminRequest(context))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body: { cart_id: string; email: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, string>
    | undefined;
  const resendKey = runtimeEnv?.RESEND_API_KEY;
  const baseUrl = runtimeEnv?.SITE_URL ?? 'https://pieceofstass.com';
  const cartUrl = `${baseUrl}/cart?restore=${encodeURIComponent(body.cart_id)}`;

  if (resendKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: runtimeEnv?.EMAIL_FROM ?? 'hello@pieceofstass.com',
          to: [body.email],
          subject: 'You left something behind ✨',
          html: `<p>Hey! You left some items in your cart. Come back and grab them:</p><p><a href="${cartUrl}">Return to cart</a></p>`,
          text: `You left items in your cart at Piece of Stass. Return here: ${cartUrl}`,
        }),
      });
    } catch (e) {
      return json({ error: `Email failed: ${e}` }, 502);
    }
  } else {
    console.log(`[dev] Recovery email for ${body.email}: ${cartUrl}`);
  }

  return json({ ok: true, dev_link: !resendKey ? cartUrl : undefined });
}
