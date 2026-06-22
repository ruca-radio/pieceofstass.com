/**
 * POST /api/cart/clear — remove all items from the cart
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { clearCart } from '../../../lib/cart-server';

export const POST: APIRoute = async (context) => {
  try {
    const cart = await clearCart(context);
    return new Response(JSON.stringify(cart), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[POST /api/cart/clear]', err);
    return new Response(JSON.stringify({ error: 'Failed to clear cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
