/**
 * POST /api/cart/reorder
 * ─────────────────────────────────────────────────────────────────────────────
 * Copies all items from a previous order into the current cart.
 *
 * Auth: requires pos_session cookie (logged-in user must own the order).
 * Body: { order_id: string }
 *
 * Re-validates product/variant existence at current prices (server-side).
 * Skips items whose product/variant no longer exist (they may have been
 * removed from the catalog). Returns a summary of added vs skipped items.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { getOrdersKVFromEnv, getOrder } from '../../../lib/orders-server';
import { addItem } from '../../../lib/cart-server';
import { allProducts } from '../../../lib/products';
import { getSessionFromRequest } from '../../../lib/auth';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async (context) => {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const envVars = (runtimeEnv ?? {}) as Record<string, string | undefined>;
  const authSecret = envVars.AUTH_SECRET ?? import.meta.env.AUTH_SECRET;

  const session = await getSessionFromRequest(context.request, authSecret);
  if (!session) {
    return json({ error: 'You must be signed in to reorder.' }, 401);
  }

  // ── Parse body ────────────────────────────────────────────────────────────────
  let body: { order_id?: unknown };
  try {
    // Handle both JSON body and form submission
    const contentType = context.request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      body = await context.request.json();
    } else {
      // form submission (from the account page)
      const fd = await context.request.formData();
      body = { order_id: fd.get('order_id') };
    }
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const orderId = typeof body.order_id === 'string' ? body.order_id.trim() : null;
  if (!orderId) {
    return json({ error: 'order_id is required' }, 400);
  }

  // ── Fetch and authorize order ─────────────────────────────────────────────────
  const kv = getOrdersKVFromEnv(runtimeEnv);
  const order = await getOrder(kv, orderId);

  if (!order) {
    return json({ error: 'Order not found.' }, 404);
  }

  if (order.customer_email.toLowerCase() !== session.email.toLowerCase()) {
    return json({ error: 'You do not have permission to reorder this order.' }, 403);
  }

  if (!order.items || order.items.length === 0) {
    return json({ error: 'This order has no items to reorder.' }, 400);
  }

  // ── Add items to cart ─────────────────────────────────────────────────────────
  const added: string[] = [];
  const skipped: Array<{ title: string; reason: string }> = [];

  for (const item of order.items) {
    // Re-validate product and variant against current catalog
    const product = allProducts.find((p) => p.id === item.product_id);
    if (!product) {
      skipped.push({ title: item.title, reason: 'Product no longer available' });
      continue;
    }

    const variant = product.variants.find((v) => v.sku === item.variant_sku);
    if (!variant) {
      skipped.push({ title: item.title, reason: 'Variant no longer available' });
      continue;
    }

    // Use current price (not historical)
    const currentPrice = product.price;

    try {
      await addItem(context, {
        product_id: item.product_id,
        variant_id: item.variant_sku,
        qty: item.qty,
        price_snapshot: currentPrice,
        title_snapshot: `${product.title}${variant.title ? ` — ${variant.title}` : ''}`,
        image_snapshot: product.images[0] ?? item.image ?? '',
      });
      added.push(item.title);
    } catch (err) {
      console.error('[reorder] Failed to add item:', item.title, err);
      skipped.push({ title: item.title, reason: 'Could not be added to cart' });
    }
  }

  // ── Respond ───────────────────────────────────────────────────────────────────
  // If submitted from a form (not AJAX), redirect to cart
  const acceptHeader = context.request.headers.get('accept') ?? '';
  const contentType = context.request.headers.get('content-type') ?? '';
  const isFormSubmit = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');

  if (isFormSubmit && !acceptHeader.includes('application/json')) {
    return context.redirect('/cart', 303);
  }

  return json({
    ok: true,
    added_count: added.length,
    skipped_count: skipped.length,
    added,
    skipped,
    redirect_url: '/cart',
  });
};
