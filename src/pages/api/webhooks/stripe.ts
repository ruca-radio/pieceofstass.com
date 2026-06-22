/**
 * POST /api/webhooks/stripe
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles Stripe webhook events.
 *
 * checkout.session.completed:
 *   - Verifies webhook signature (STRIPE_WEBHOOK_SECRET)
 *   - Creates a full Order record in ORDERS_KV via saveOrder
 *   - Calls updateOrderStatusWithEmail('payment_captured') → fires order confirmation email
 *   - Clears the cart from KV
 *
 * In dev without a webhook secret, signature verification is skipped
 * and a warning is logged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { saveOrder, getOrdersKVFromEnv, updateOrderStatusWithEmail } from '../../../lib/orders-server';
import type { Order } from '../../../lib/orders-server';
import { signJWT } from '../../../lib/auth';

// ── Env helper ────────────────────────────────────────────────────────────────

function getEnv(context: Parameters<APIRoute>[0]): Record<string, string | undefined> {
  const runtime = (context.locals as Record<string, unknown>)?.runtime as
    | { env?: Record<string, string | undefined> }
    | undefined;
  if (runtime?.env) return runtime.env;
  return import.meta.env as Record<string, string | undefined>;
}

// ── KV helper (legacy raw KV for cart clearing) ───────────────────────────────

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

const _devCartMemory = new Map<string, string>();
const devCartKV: KVLike = {
  async get(key) { return _devCartMemory.get(key) ?? null; },
  async put(key, value) { _devCartMemory.set(key, value); },
  async delete(key) { _devCartMemory.delete(key); },
};

function getCartKV(context: Parameters<APIRoute>[0]): KVLike {
  const env = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = env?.CART_KV as KVLike | undefined;
  if (kv && typeof kv.get === 'function') return kv;
  return devCartKV;
}

// ── UUID ──────────────────────────────────────────────────────────────────────

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ── Webhook handler ───────────────────────────────────────────────────────────

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const stripeKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  const authSecret = env.AUTH_SECRET;

  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Read raw body for signature verification
  const rawBody = await context.request.text();
  const sig = context.request.headers.get('stripe-signature');

  let event: {
    type: string;
    data: { object: Record<string, unknown> };
  };

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey);

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret) as typeof event;
    } else {
      console.warn('[stripe webhook] No STRIPE_WEBHOOK_SECRET set — skipping signature verification');
      event = JSON.parse(rawBody) as typeof event;
    }
  } catch (err) {
    console.error('[stripe webhook] Signature verification failed:', err);
    return new Response(
      JSON.stringify({ error: `Webhook signature error: ${(err as Error).message}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ── Handle events ──────────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string;
      metadata?: {
        cart_id?: string;
        order_id?: string;
        customer_name?: string;
      };
      amount_total?: number;
      amount_subtotal?: number;
      customer_email?: string;
      payment_status?: string;
      payment_intent?: string;
      shipping_details?: {
        name?: string;
        address?: {
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
        };
      };
      total_details?: {
        amount_tax?: number;
        amount_shipping?: number;
      };
    };

    const ordersKV = getOrdersKVFromEnv(
      (context.locals as Record<string, unknown>)?.runtime?.env as Record<string, unknown> | undefined
    );
    const cartKV = getCartKV(context);

    // Build order ID — prefer metadata.order_id if already set
    const orderId = session.metadata?.order_id ?? `order_${uuid()}`;

    // Construct a full Order record from the Stripe session
    const shippingAddr = session.shipping_details?.address;
    const totalCents = session.amount_total ?? 0;
    const subtotalCents = session.amount_subtotal ?? totalCents;
    const taxCents = session.total_details?.amount_tax ?? 0;
    const shippingCents = session.total_details?.amount_shipping ?? 0;

    // Convert from cents to dollars (our order schema uses dollars)
    const order: Order = {
      id: orderId,
      customer_email: session.customer_email ?? '',
      customer_name: session.metadata?.customer_name ?? session.shipping_details?.name ?? '',
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string | undefined,
      items: [], // Populated from cart data if available — see below
      subtotal: subtotalCents / 100,
      shipping: shippingCents / 100,
      tax: taxCents / 100,
      total: totalCents / 100,
      currency: 'usd',
      status: 'pending',
      shipping_address: shippingAddr
        ? {
            name: session.shipping_details?.name ?? '',
            line1: shippingAddr.line1 ?? '',
            line2: shippingAddr.line2 ?? undefined,
            city: shippingAddr.city ?? '',
            state: shippingAddr.state ?? '',
            postal_code: shippingAddr.postal_code ?? '',
            country: shippingAddr.country ?? '',
          }
        : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Attempt to copy items from cart into the order record
    if (session.metadata?.cart_id) {
      try {
        const cartRaw = await cartKV.get(`cart:${session.metadata.cart_id}`);
        if (cartRaw) {
          const cart = JSON.parse(cartRaw) as {
            items?: Array<{
              product_id?: string;
              variant_id?: string;
              qty?: number;
              price_snapshot?: number;
              title_snapshot?: string;
              image_snapshot?: string;
            }>;
          };
          if (Array.isArray(cart.items)) {
            order.items = cart.items.map((ci) => ({
              product_id: ci.product_id ?? '',
              variant_sku: ci.variant_id ?? '',
              title: ci.title_snapshot ?? '',
              image: ci.image_snapshot ?? '',
              qty: ci.qty ?? 1,
              unit_price: ci.price_snapshot ?? 0,
            }));
          }
        }
      } catch (err) {
        console.warn('[stripe webhook] Could not restore cart items:', err);
      }
    }

    // Save the order to ORDERS_KV
    await saveOrder(ordersKV, order);
    console.log(`[stripe webhook] Order saved: ${orderId}`);

    // Sign a receipt token (30-day JWT) for the PDF download link
    let receiptToken: string | undefined;
    try {
      receiptToken = await signJWT(
        { order_id: orderId, type: 'receipt' },
        30 * 24 * 60 * 60, // 30 days
        authSecret
      );
    } catch {
      // Non-fatal — PDF link will fall back to auth-gated version
    }

    // Transition to payment_captured → sends order confirmation email
    const emailEnv = {
      RESEND_API_KEY: env.RESEND_API_KEY,
      EMAIL_FROM: env.EMAIL_FROM,
      EMAIL_REPLY_TO: env.EMAIL_REPLY_TO,
    };

    await updateOrderStatusWithEmail(ordersKV, orderId, 'payment_captured', emailEnv, {
      receipt_token: receiptToken,
    });

    // Clear the cart
    if (session.metadata?.cart_id) {
      await cartKV.delete(`cart:${session.metadata.cart_id}`);
    }

    console.log(`[stripe webhook] Order confirmed + email queued: ${orderId}`);
  }

  // Always return 200 to Stripe — prevents retries for unhandled event types
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
