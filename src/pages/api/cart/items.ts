/**
 * POST /api/cart/items  — add an item to the cart
 *
 * Body: { product_id: string, variant_id: string, qty: number }
 *
 * Validates the product + variant exist in products.json.
 * Reads price server-side — never trusts client-supplied price.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { addItem } from '../../../lib/cart-server';
import { allProducts } from '../../../lib/products';

// ── Validation ────────────────────────────────────────────────────────────────

interface AddItemBody {
  product_id: string;
  variant_id: string;
  qty: number;
}

function validateAddBody(body: unknown): { valid: true; data: AddItemBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.product_id !== 'string' || !b.product_id.trim()) {
    return { valid: false, error: 'product_id is required' };
  }
  if (typeof b.variant_id !== 'string' || !b.variant_id.trim()) {
    return { valid: false, error: 'variant_id is required' };
  }
  const qty = Number(b.qty);
  if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
    return { valid: false, error: 'qty must be an integer between 1 and 99' };
  }

  return {
    valid: true,
    data: {
      product_id: b.product_id.trim(),
      variant_id: b.variant_id.trim(),
      qty,
    },
  };
}

export const POST: APIRoute = async (context) => {
  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = validateAddBody(body);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { product_id, variant_id, qty } = validation.data;

  // ── Lookup product server-side ──────────────────────────────────────────────
  const product = allProducts.find((p) => p.id === product_id);
  if (!product) {
    return new Response(JSON.stringify({ error: `Product not found: ${product_id}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const variant = product.variants.find((v) => v.sku === variant_id);
  if (!variant) {
    return new Response(JSON.stringify({ error: `Variant not found: ${variant_id}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Price is always read from the authoritative source — never client-supplied
  // product.price is in dollars (integer). variant.prices[0].amount is in cents.
  const priceSnapshot = product.price; // dollars

  try {
    const cart = await addItem(context, {
      product_id,
      variant_id,
      qty,
      price_snapshot: priceSnapshot,
      title_snapshot: `${product.title}${variant.title ? ` — ${variant.title}` : ''}`,
      image_snapshot: product.images[0] ?? '',
    });

    return new Response(JSON.stringify(cart), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[POST /api/cart/items]', err);
    return new Response(JSON.stringify({ error: 'Failed to add item to cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
