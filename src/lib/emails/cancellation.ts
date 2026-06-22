/**
 * cancellation.ts — Order cancelled
 * ─────────────────────────────────────────────────────────────────────────────
 * Sent when status transitions to 'cancelled'.
 */

import type { Order } from '../orders-server';
import {
  emailShell,
  ctaButton,
  card,
  label,
  h1,
  p,
  formatCurrency,
  BRAND,
} from './base';

export interface CancellationOptions {
  reason?: string;
  /** If payment was captured before cancellation, note the refund */
  refundAmount?: number;
}

export function cancellationEmail(
  order: Order,
  opts: CancellationOptions = {}
): { subject: string; html: string; text: string } {
  const firstName = order.customer_name?.split(' ')[0] ?? 'there';
  const orderNum = order.id.slice(-8).toUpperCase();
  const shopUrl = 'https://pieceofstass.com/shop';

  const subject = `Order cancelled — #${orderNum}`;

  const bodyHtml = `
    ${card(`
      ${label('Order Cancelled', BRAND.muted)}
      ${h1(`Your order has been cancelled.`)}
      ${p(`Order <strong style="color:${BRAND.espresso};font-family:monospace;">#${orderNum}</strong> has been cancelled.${opts.reason ? ` <strong>Reason:</strong> ${opts.reason}` : ''}`)}
      ${opts.refundAmount
        ? `<div style="background:${BRAND.surfaceSunken};border-radius:10px;padding:14px 16px;margin-bottom:16px;">
            <p style="font-size:13px;color:${BRAND.muted};margin:0;line-height:1.6;">
              <strong style="color:${BRAND.success};">Refund incoming:</strong> ${formatCurrency(opts.refundAmount)} will be returned to your original payment method within 3–7 business days.
            </p>
          </div>`
        : ''
      }
      ${p(`The stash is always open. If you changed your mind or want to try a different item, we've got you.`)}
      ${ctaButton('Back to the stash', shopUrl)}
    `)}

    <!-- Support -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background:rgba(111,123,95,0.08);border-radius:10px;border:1px solid rgba(111,123,95,0.2);padding:14px 18px;">
          <p style="font-size:13px;color:${BRAND.muted};margin:0;line-height:1.6;">
            Didn't request this cancellation? Email <a href="mailto:help@pieceofstass.com?subject=Order%20${orderNum}%20cancellation" style="color:${BRAND.sage};font-weight:600;text-decoration:none;">help@pieceofstass.com</a> immediately and we'll look into it.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = emailShell(subject, bodyHtml, `Order #${orderNum} has been cancelled.`);

  const text = `Order cancelled — #${orderNum}

Hi ${firstName},

Your order #${orderNum} has been cancelled.${opts.reason ? ` Reason: ${opts.reason}` : ''}
${opts.refundAmount ? `\nRefund: ${formatCurrency(opts.refundAmount)} will be returned to your original payment method within 3–7 business days.\n` : ''}
The stash is always open: ${shopUrl}

Didn't request this? Email help@pieceofstass.com with order #${orderNum}.

— Anna at Piece of Stass`;

  return { subject, html, text };
}
