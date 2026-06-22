/**
 * refund-confirmation.ts — Refund processed
 * ─────────────────────────────────────────────────────────────────────────────
 * Sent when status transitions to 'refunded' (full or partial).
 */

import type { Order } from '../orders-server';
import {
  emailShell,
  card,
  label,
  h1,
  p,
  formatCurrency,
  BRAND,
} from './base';

export interface RefundOptions {
  /** Amount refunded in dollars. Defaults to order.total if omitted. */
  refundAmount?: number;
  reason?: string;
}

export function refundConfirmationEmail(
  order: Order,
  opts: RefundOptions = {}
): { subject: string; html: string; text: string } {
  const firstName = order.customer_name?.split(' ')[0] ?? 'there';
  const orderNum = order.id.slice(-8).toUpperCase();
  const refundAmount = opts.refundAmount ?? order.total;
  const isPartial = opts.refundAmount !== undefined && opts.refundAmount < order.total;

  const subject = isPartial
    ? `Partial refund processed — #${orderNum}`
    : `Refund confirmed — #${orderNum}`;

  const bodyHtml = `
    ${card(`
      ${label(isPartial ? 'Partial Refund' : 'Refund Confirmed', BRAND.success)}
      ${h1(`Your refund is on the way.`)}
      ${p(`We've processed ${isPartial ? 'a partial' : 'a full'} refund of <strong style="color:${BRAND.espresso};">${formatCurrency(refundAmount)}</strong> for order <strong style="color:${BRAND.espresso};font-family:monospace;">#${orderNum}</strong>.`)}
      ${opts.reason ? `<div style="background:${BRAND.surfaceSunken};border-radius:10px;padding:12px 16px;margin-bottom:16px;">
        <p style="font-size:13px;color:${BRAND.muted};margin:0;"><strong style="color:${BRAND.espresso};">Reason:</strong> ${opts.reason}</p>
      </div>` : ''}
      <div style="background:${BRAND.surfaceSunken};border-radius:10px;padding:14px 16px;margin-bottom:0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <p style="font-size:11px;font-weight:700;color:${BRAND.muted};letter-spacing:0.06em;text-transform:uppercase;margin:0 0 4px 0;">Refund amount</p>
              <p style="font-size:20px;font-weight:700;color:${BRAND.success};margin:0;">${formatCurrency(refundAmount)}</p>
            </td>
            <td style="text-align:right;">
              <p style="font-size:11px;font-weight:700;color:${BRAND.muted};letter-spacing:0.06em;text-transform:uppercase;margin:0 0 4px 0;">Timeline</p>
              <p style="font-size:14px;font-weight:600;color:${BRAND.espresso};margin:0;">3–7 business days</p>
            </td>
          </tr>
        </table>
      </div>
    `)}

    <!-- Timeline info -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.surface};border-radius:16px;margin-bottom:16px;">
      <tr><td style="padding:20px 24px;">
        ${label('What to expect', BRAND.sage)}
        <p style="font-size:14px;color:${BRAND.muted};margin:0;line-height:1.7;">
          The refund will appear on your original payment method within <strong style="color:${BRAND.espresso};">3–7 business days</strong>, depending on your bank. Processing times vary — if you don't see it after 7 days, check with your bank before reaching out to us.
        </p>
      </td></tr>
    </table>

    <!-- Support -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background:rgba(111,123,95,0.08);border-radius:10px;border:1px solid rgba(111,123,95,0.2);padding:14px 18px;">
          <p style="font-size:13px;color:${BRAND.muted};margin:0;line-height:1.6;">
            Questions about your refund? Email <a href="mailto:help@pieceofstass.com?subject=Refund%20${orderNum}" style="color:${BRAND.sage};font-weight:600;text-decoration:none;">help@pieceofstass.com</a> with your order number.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = emailShell(subject, bodyHtml, `${formatCurrency(refundAmount)} refund is on its way to your bank.`);

  const text = `${subject}

Hi ${firstName},

We've processed ${isPartial ? 'a partial' : 'a full'} refund of ${formatCurrency(refundAmount)} for order #${orderNum}.
${opts.reason ? `Reason: ${opts.reason}\n` : ''}
The refund will appear on your original payment method within 3–7 business days. Processing times vary by bank — if you don't see it after 7 days, check with your bank before reaching out.

Questions? Email help@pieceofstass.com with order #${orderNum}.

— Anna at Piece of Stass`;

  return { subject, html, text };
}
