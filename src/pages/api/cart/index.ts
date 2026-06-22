/**
 * GET /api/cart  — return current cart (creates empty cart if no cookie)
 *
 * export const prerender = false ensures this runs as SSR on CF Workers.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { getCart } from '../../../lib/cart-server';

export const GET: APIRoute = async (context) => {
  try {
    const cart = await getCart(context);
    return new Response(JSON.stringify(cart), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[GET /api/cart]', err);
    return new Response(JSON.stringify({ error: 'Failed to load cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
