/**
 * POST /api/webhooks/stripe
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles Stripe webhook events.
 *
 * checkout.session.completed:
 *   - Verifies webhook signature (STRIPE_WEBHOOK_SECRET)
 *   - Marks order in KV: key `order:{session_id}` → order record
 *   - Clears the cart from KV
 *
 * In dev without a webhook secret, signature verification is skipped
 * and a warning is logged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const prerender = false;

import type { APIRoute } from 'astro';

// ── Env helper ────────────────────────────────────────────────────────────────

function getEnv(context: Parameters<APIRoute>[0]): Record<string, string | undefined> {
  const runtime = (context.locals as Record<string, unknown>)?.runtime as
    | { env?: Record<string, string | undefined> }
    | undefined;
  if (runtime?.env) return runtime.env;
  return import.meta.env as Record<string, string | undefined>;
}

// ── KV helper ─────────────────────────────────────────────────────────────────

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

const _devMemory = new Map<string, string>();
const devKV: KVLike = {
  async get(key) { return _devMemory.get(key) ?? null; },
  async put(key, value) { _devMemory.set(key, value); },
  async delete(key) { _devMemory.delete(key); },
};

function getKV(context: Parameters<APIRoute>[0]): KVLike {
  const env = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = env?.CART_KV as KVLike | undefined;
  if (kv && typeof kv.get === 'function') return kv;
  return devKV;
}

// ── Webhook handler ───────────────────────────────────────────────────────────

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const stripeKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

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
      // Verify webhook signature in production
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret) as typeof event;
    } else {
      // Dev / no secret — parse without verification (warn)
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
      metadata?: { cart_id?: string };
      amount_total?: number;
      customer_email?: string;
      payment_status?: string;
      payment_intent?: string;
    };

    const kv = getKV(context);

    // Write order record to KV
    const orderRecord = {
      session_id: session.id,
      cart_id: session.metadata?.cart_id ?? null,
      amount_total: session.amount_total,
      customer_email: session.customer_email,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      created_at: new Date().toISOString(),
    };

    // Keep order for 90 days
    await kv.put(`order:${session.id}`, JSON.stringify(orderRecord), {
      expirationTtl: 90 * 24 * 60 * 60,
    });

    // Clear the cart
    if (session.metadata?.cart_id) {
      await kv.delete(`cart:${session.metadata.cart_id}`);
    }

    console.log(`[stripe webhook] Order recorded: ${session.id}`);
  }

  // Always return 200 to Stripe — prevents retries for unhandled event types
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
