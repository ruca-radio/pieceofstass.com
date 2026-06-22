/**
 * PATCH /api/cart/items/:id  — update qty for a cart item
 * DELETE /api/cart/items/:id — remove a cart item
 *
 * :id is the variant_id (URL-encoded).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { updateItem, removeItem } from '../../../../lib/cart-server';

export const PATCH: APIRoute = async (context) => {
  const variantId = context.params.id;
  if (!variantId) {
    return new Response(JSON.stringify({ error: 'Missing item id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body || typeof body !== 'object') {
    return new Response(JSON.stringify({ error: 'Body must be a JSON object' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const qty = Number((body as Record<string, unknown>).qty);
  if (!Number.isInteger(qty) || qty < 0 || qty > 99) {
    return new Response(JSON.stringify({ error: 'qty must be an integer between 0 and 99' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const cart = await updateItem(context, decodeURIComponent(variantId), qty);
    return new Response(JSON.stringify(cart), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[PATCH /api/cart/items/:id]', err);
    return new Response(JSON.stringify({ error: 'Failed to update item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async (context) => {
  const variantId = context.params.id;
  if (!variantId) {
    return new Response(JSON.stringify({ error: 'Missing item id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const cart = await removeItem(context, decodeURIComponent(variantId));
    return new Response(JSON.stringify(cart), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[DELETE /api/cart/items/:id]', err);
    return new Response(JSON.stringify({ error: 'Failed to remove item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
