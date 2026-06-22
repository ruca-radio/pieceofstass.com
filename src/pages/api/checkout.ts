/**
 * POST /api/checkout
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates a Stripe Checkout Session from the current server cart.
 *
 * - Reads cart from KV (via cookie) — never trusts client-supplied prices.
 * - Re-validates every product/variant against products.json.
 * - Returns { url } for client redirect.
 * - If STRIPE_SECRET_KEY is not set, returns 400 with a clear message.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { getCart } from '../../lib/cart-server';
import { allProducts } from '../../lib/products';

// ── Env helper ────────────────────────────────────────────────────────────────

function getEnv(context: Parameters<APIRoute>[0]): Record<string, string | undefined> {
  // CF Workers runtime exposes env via locals.runtime.env
  const runtime = (context.locals as Record<string, unknown>)?.runtime as
    | { env?: Record<string, string | undefined> }
    | undefined;
  if (runtime?.env) return runtime.env;
  // Astro dev / Node: fall back to import.meta.env
  return import.meta.env as Record<string, string | undefined>;
}

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const stripeKey = env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return new Response(
      JSON.stringify({
        error:
          'Stripe is not configured. Add STRIPE_SECRET_KEY to .dev.vars (dev) or wrangler secrets (production).',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // ── Load cart from server ──────────────────────────────────────────────────
  const cart = await getCart(context);

  if (!cart.items.length) {
    return new Response(JSON.stringify({ error: 'Your cart is empty' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Re-validate prices server-side ────────────────────────────────────────
  // We NEVER use price_snapshot for Stripe; we re-read from products.json.
  interface LineItem {
    price_data: {
      currency: string;
      product_data: { name: string; images: string[] };
      unit_amount: number;
    };
    quantity: number;
  }

  const lineItems: LineItem[] = [];

  for (const item of cart.items) {
    const product = allProducts.find((p) => p.id === item.product_id);
    if (!product) {
      return new Response(
        JSON.stringify({ error: `Product no longer available: ${item.product_id}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const variant = product.variants.find((v) => v.sku === item.variant_id);
    if (!variant) {
      return new Response(
        JSON.stringify({ error: `Variant no longer available: ${item.variant_id}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use the variant's canonical price in cents
    // variant.prices[0].amount is stored as cents
    const unitAmountCents =
      variant.prices.find((p) => p.currency_code === 'usd')?.amount ??
      product.price * 100;

    const variantLabel = Object.entries(variant.options)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: variantLabel ? `${product.title} (${variantLabel})` : product.title,
          images: product.images[0] ? [product.images[0]] : [],
        },
        unit_amount: unitAmountCents,
      },
      quantity: item.qty,
    });
  }

  // ── Determine site URL ─────────────────────────────────────────────────────
  const siteUrl =
    env.PUBLIC_SITE_URL ??
    `${context.request.url.split('/api/')[0]}`;

  // ── Create Stripe Checkout Session ────────────────────────────────────────
  try {
    // Dynamic import so it doesn't blow up during build if stripe isn't installed yet
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, {
      // CF Workers needs the fetch adapter
      // httpClient: Stripe.createFetchHttpClient(), // uncomment for CF Workers prod
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?cart=open`,
      shipping_address_collection: {
        allowed_countries: [
          'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'FI',
          'BE', 'CH', 'AT', 'IE', 'NZ', 'SG', 'JP',
        ],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Standard international shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 10 },
              maximum: { unit: 'business_day', value: 20 },
            },
          },
        },
      ],
      payment_method_types: ['card'],
      metadata: {
        cart_id: cart.id,
      },
    });

    if (!session.url) {
      throw new Error('Stripe did not return a session URL');
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[POST /api/checkout] Stripe error:', err);
    const msg = err instanceof Error ? err.message : 'Checkout session creation failed';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
