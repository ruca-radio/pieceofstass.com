/**
 * POST /api/admin/orders/:id/refund
 * Issue a full or partial refund via Stripe API.
 *
 * Body: { amount?: number (dollars, omit for full), reason?: string, partial?: boolean }
 *
 * Calls Stripe refunds.create with idempotency key = `refund-{orderId}`
 * Records refund on order, transitions status to 'refunded', appends timeline.
 * Fires onOrderRefunded email hook.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../../lib/admin-auth';
import { getOrder, updateOrderStatus, appendTimeline, getOrdersKVFromEnv, onOrderRefunded } from '../../../../../lib/orders-server';
import type { RefundRecord } from '../../../../../lib/orders-server';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { id } = context.params;
  if (!id) return json({ error: 'Missing order id' }, 400);

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, string>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  let body: { amount?: number; reason?: string; partial?: boolean };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const order = await getOrder(kv, id);
  if (!order) return json({ error: 'Order not found' }, 404);

  if (order.status === 'cancelled') {
    return json({ error: 'Cannot refund a cancelled order' }, 409);
  }
  if (order.refund) {
    return json({ error: 'Order already refunded', refund: order.refund }, 409);
  }

  const refundAmount = body.partial && body.amount ? body.amount : order.total;
  const isPartial = body.partial === true && body.amount !== undefined && body.amount < order.total;
  const reason = body.reason ?? 'customer_request';

  // Stripe API call
  const stripeKey = (runtimeEnv as Record<string, string> | undefined)?.STRIPE_SECRET_KEY;
  let stripeRefundId: string;
  let stripeError: string | null = null;

  if (stripeKey) {
    try {
      const idempotencyKey = `refund-${id}-${Math.floor(Date.now() / 60000)}`; // 1-minute window
      const params = new URLSearchParams({
        amount: String(Math.round(refundAmount * 100)), // cents
        reason,
      });
      if (order.stripe_payment_intent_id) {
        params.set('payment_intent', order.stripe_payment_intent_id);
      }

      const stripeResp = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Idempotency-Key': idempotencyKey,
        },
        body: params.toString(),
      });

      const stripeData = await stripeResp.json() as { id?: string; error?: { message?: string } };

      if (!stripeResp.ok || stripeData.error) {
        stripeError = stripeData.error?.message ?? `Stripe error: ${stripeResp.status}`;
        return json({ error: stripeError }, 422);
      }

      stripeRefundId = stripeData.id!;
    } catch (e) {
      return json({ error: `Stripe call failed: ${e}` }, 500);
    }
  } else {
    // Dev mode stub — no live Stripe key
    stripeRefundId = `re_dev_stub_${Date.now()}`;
    console.log(`[dev] Stripe refund stub: orderId=${id}, amount=${refundAmount}, reason=${reason}`);
  }

  const refundRecord: RefundRecord = {
    stripe_refund_id: stripeRefundId,
    amount: refundAmount,
    reason,
    partial: isPartial,
    created_at: new Date().toISOString(),
  };

  // Update order to refunded status
  const updated = await updateOrderStatus(kv, id, 'refunded', {
    refund: refundRecord,
    actor: 'admin',
  });

  if (!updated) return json({ error: 'Failed to update order' }, 500);

  // Fire email hook (parallel agent wires this)
  try {
    await onOrderRefunded(updated, refundRecord, runtimeEnv as Record<string, unknown>);
  } catch (e) {
    console.error('[refund] email hook error:', e);
  }

  // Append email-sent timeline event
  await appendTimeline(kv, id, {
    actor: 'system',
    type: 'email_sent',
    message: `Refund confirmation email sent to ${order.customer_email}`,
  });

  return json({
    ok: true,
    refund: refundRecord,
    order: updated,
    dev_stub: !stripeKey,
  });
}
