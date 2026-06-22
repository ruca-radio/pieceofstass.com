/**
 * send.ts — Transactional email dispatcher
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps Resend API. Falls back to console.log in dev (no RESEND_API_KEY).
 * Retry-once on 5xx. Logs success/failure to KV under `email_log:{order_id}:{type}`.
 *
 * Public API:
 *   sendOrderConfirmation(order, opts?)
 *   sendShippingNotification(order)
 *   sendDeliveryConfirmation(order)
 *   sendRefundConfirmation(order, opts?)
 *   sendCancellation(order, opts?)
 *   sendOrderIssue(order, opts)
 *   sendTransactional(params) — low-level, direct Resend call
 */

import type { Order } from '../orders-server';
import type { KVLike } from '../orders-server';
import { orderConfirmationEmail, type OrderConfirmationOptions } from './order-confirmation';
import { shippingNotificationEmail } from './shipping-notification';
import { deliveryConfirmationEmail } from './delivery-confirmation';
import { refundConfirmationEmail, type RefundOptions } from './refund-confirmation';
import { cancellationEmail, type CancellationOptions } from './cancellation';
import { orderIssueEmail, type OrderIssueOptions } from './order-issue';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EmailType =
  | 'order_confirmation'
  | 'shipping_notification'
  | 'delivery_confirmation'
  | 'refund_confirmation'
  | 'cancellation'
  | 'order_issue';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailEnv {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
}

export interface EmailResult {
  ok: boolean;
  messageId?: string;
  error?: string;
  dev?: boolean;
}

// ── Resend API ─────────────────────────────────────────────────────────────────

const RESEND_API = 'https://api.resend.com/emails';

async function callResend(
  apiKey: string,
  from: string,
  replyTo: string,
  params: SendEmailParams,
  attempt = 1
): Promise<EmailResult> {
  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        reply_to: replyTo,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      // Retry once on 5xx
      if (res.status >= 500 && attempt === 1) {
        console.warn(`[email] Resend 5xx (attempt ${attempt}), retrying…`, res.status);
        await new Promise((r) => setTimeout(r, 500));
        return callResend(apiKey, from, replyTo, params, 2);
      }
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, messageId: data.id };
  } catch (err) {
    if (attempt === 1) {
      await new Promise((r) => setTimeout(r, 500));
      return callResend(apiKey, from, replyTo, params, 2);
    }
    return { ok: false, error: (err as Error).message };
  }
}

// ── Idempotency check ─────────────────────────────────────────────────────────

async function checkAlreadySent(
  kv: KVLike | null,
  orderId: string,
  type: EmailType
): Promise<boolean> {
  if (!kv) return false;
  try {
    const raw = await kv.get(`email_log:${orderId}:${type}`);
    if (!raw) return false;
    const entry = JSON.parse(raw) as { ok?: boolean };
    return entry.ok === true;
  } catch {
    return false;
  }
}

async function logEmail(
  kv: KVLike | null,
  orderId: string,
  type: EmailType,
  result: EmailResult
): Promise<void> {
  if (!kv) return;
  try {
    await kv.put(
      `email_log:${orderId}:${type}`,
      JSON.stringify({ ...result, sent_at: new Date().toISOString() })
    );
  } catch {
    // Non-fatal — log failure doesn't block the email
  }
}

// ── Core dispatcher ───────────────────────────────────────────────────────────

export async function sendTransactional(
  params: SendEmailParams,
  env: EmailEnv,
  kv: KVLike | null,
  orderId: string,
  type: EmailType
): Promise<EmailResult> {
  const apiKey =
    env.RESEND_API_KEY ??
    (typeof import.meta.env !== 'undefined' ? import.meta.env.RESEND_API_KEY : undefined) ??
    '';
  const from =
    env.EMAIL_FROM ??
    (typeof import.meta.env !== 'undefined' ? import.meta.env.EMAIL_FROM : undefined) ??
    'hello@pieceofstass.com';
  const replyTo =
    env.EMAIL_REPLY_TO ??
    (typeof import.meta.env !== 'undefined' ? import.meta.env.EMAIL_REPLY_TO : undefined) ??
    'help@pieceofstass.com';

  // Dev fallback — no API key
  if (!apiKey || apiKey === 'dev') {
    console.log(`\n[email:DEV] ${type} → ${params.to}`);
    console.log(`[email:DEV] Subject: ${params.subject}`);
    console.log(`[email:DEV] (HTML email body not logged; set RESEND_API_KEY to send for real)\n`);
    const devResult: EmailResult = { ok: true, dev: true };
    await logEmail(kv, orderId, type, devResult);
    return devResult;
  }

  const result = await callResend(apiKey, from, replyTo, params);
  if (result.ok) {
    console.log(`[email] Sent ${type} to ${params.to} — messageId: ${result.messageId}`);
  } else {
    console.error(`[email] Failed ${type} to ${params.to} — ${result.error}`);
  }
  await logEmail(kv, orderId, type, result);
  return result;
}

// ── Named dispatchers ─────────────────────────────────────────────────────────

export async function sendOrderConfirmation(
  order: Order,
  env: EmailEnv,
  kv: KVLike | null,
  opts?: OrderConfirmationOptions
): Promise<EmailResult> {
  const alreadySent = await checkAlreadySent(kv, order.id, 'order_confirmation');
  if (alreadySent) {
    console.log(`[email] order_confirmation already sent for ${order.id}, skipping.`);
    return { ok: true };
  }

  const { subject, html, text } = orderConfirmationEmail(order, opts);
  return sendTransactional(
    { to: order.customer_email, subject, html, text },
    env,
    kv,
    order.id,
    'order_confirmation'
  );
}

export async function sendShippingNotification(
  order: Order,
  env: EmailEnv,
  kv: KVLike | null
): Promise<EmailResult> {
  const alreadySent = await checkAlreadySent(kv, order.id, 'shipping_notification');
  if (alreadySent) {
    console.log(`[email] shipping_notification already sent for ${order.id}, skipping.`);
    return { ok: true };
  }

  const { subject, html, text } = shippingNotificationEmail(order);
  return sendTransactional(
    { to: order.customer_email, subject, html, text },
    env,
    kv,
    order.id,
    'shipping_notification'
  );
}

export async function sendDeliveryConfirmation(
  order: Order,
  env: EmailEnv,
  kv: KVLike | null
): Promise<EmailResult> {
  const alreadySent = await checkAlreadySent(kv, order.id, 'delivery_confirmation');
  if (alreadySent) {
    console.log(`[email] delivery_confirmation already sent for ${order.id}, skipping.`);
    return { ok: true };
  }

  const { subject, html, text } = deliveryConfirmationEmail(order);
  return sendTransactional(
    { to: order.customer_email, subject, html, text },
    env,
    kv,
    order.id,
    'delivery_confirmation'
  );
}

export async function sendRefundConfirmation(
  order: Order,
  env: EmailEnv,
  kv: KVLike | null,
  opts?: RefundOptions
): Promise<EmailResult> {
  const alreadySent = await checkAlreadySent(kv, order.id, 'refund_confirmation');
  if (alreadySent) {
    console.log(`[email] refund_confirmation already sent for ${order.id}, skipping.`);
    return { ok: true };
  }

  const { subject, html, text } = refundConfirmationEmail(order, opts);
  return sendTransactional(
    { to: order.customer_email, subject, html, text },
    env,
    kv,
    order.id,
    'refund_confirmation'
  );
}

export async function sendCancellation(
  order: Order,
  env: EmailEnv,
  kv: KVLike | null,
  opts?: CancellationOptions
): Promise<EmailResult> {
  const alreadySent = await checkAlreadySent(kv, order.id, 'cancellation');
  if (alreadySent) {
    console.log(`[email] cancellation already sent for ${order.id}, skipping.`);
    return { ok: true };
  }

  const { subject, html, text } = cancellationEmail(order, opts);
  return sendTransactional(
    { to: order.customer_email, subject, html, text },
    env,
    kv,
    order.id,
    'cancellation'
  );
}

export async function sendOrderIssue(
  order: Order,
  env: EmailEnv,
  kv: KVLike | null,
  opts: OrderIssueOptions
): Promise<EmailResult> {
  // order_issue is not idempotency-checked — admin may send multiple updates
  const { subject, html, text } = orderIssueEmail(order, opts);
  return sendTransactional(
    { to: order.customer_email, subject, html, text },
    env,
    kv,
    order.id,
    'order_issue'
  );
}
