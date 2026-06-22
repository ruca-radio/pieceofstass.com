/**
 * order-issue.ts — Generic admin-triggered customer communication
 * ─────────────────────────────────────────────────────────────────────────────
 * Used for delay notices, supplier issues, customs holds, etc.
 * Anna triggers this manually from the admin panel.
 */

import type { Order } from '../orders-server';
import {
  emailShell,
  card,
  label,
  h1,
  p,
  BRAND,
} from './base';

export interface OrderIssueOptions {
  /** Issue type — used for subject line and label */
  issueType?: 'delay' | 'customs_hold' | 'lost' | 'damaged' | 'supplier_issue' | 'other';
  /** Custom subject override */
  subject?: string;
  /** Main message body — can include HTML */
  message: string;
  /** Expected resolution / new ETA (optional) */
  newEta?: string;
  /** Whether a refund/reshipment is being processed */
  resolution?: string;
}

const ISSUE_LABELS: Record<string, string> = {
  delay: 'Shipping Update',
  customs_hold: 'Customs Hold',
  lost: 'Missing Shipment',
  damaged: 'Damaged Item',
  supplier_issue: 'Fulfillment Update',
  other: 'Order Update',
};

export function orderIssueEmail(
  order: Order,
  opts: OrderIssueOptions
): { subject: string; html: string; text: string } {
  const firstName = order.customer_name?.split(' ')[0] ?? 'there';
  const orderNum = order.id.slice(-8).toUpperCase();
  const issueLabel = ISSUE_LABELS[opts.issueType ?? 'other'] ?? 'Order Update';

  const subject =
    opts.subject ?? `Update on your order #${orderNum}`;

  const bodyHtml = `
    ${card(`
      ${label(issueLabel, BRAND.clay)}
      ${h1(`An update on your order.`)}
      ${p(`Hi ${firstName}, we have an update about order <strong style="color:${BRAND.espresso};font-family:monospace;">#${orderNum}</strong>.`)}
      <div style="background:${BRAND.surfaceSunken};border-radius:10px;padding:16px 18px;margin-bottom:${opts.newEta || opts.resolution ? '16px' : '0'};">
        <p style="font-size:15px;color:${BRAND.espresso};margin:0;line-height:1.7;">${opts.message}</p>
      </div>
      ${opts.newEta ? `<div style="background:rgba(196,103,61,0.08);border-radius:10px;padding:12px 16px;margin-bottom:${opts.resolution ? '16px' : '0'};">
        <p style="font-size:13px;color:${BRAND.muted};margin:0;"><strong style="color:${BRAND.espresso};">New estimated delivery:</strong> ${opts.newEta}</p>
      </div>` : ''}
      ${opts.resolution ? `<div style="background:rgba(63,106,68,0.08);border-radius:10px;padding:12px 16px;">
        <p style="font-size:13px;color:${BRAND.muted};margin:0;"><strong style="color:${BRAND.success};">Resolution:</strong> ${opts.resolution}</p>
      </div>` : ''}
    `)}

    <!-- Apology and support -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.surface};border-radius:16px;margin-bottom:16px;">
      <tr><td style="padding:20px 24px;">
        <p style="font-size:14px;color:${BRAND.muted};margin:0;line-height:1.7;">
          We're sorry for any inconvenience and are doing everything we can to get this resolved quickly. You'll hear from us the moment there's more news.
        </p>
      </td></tr>
    </table>

    <!-- Support -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background:rgba(111,123,95,0.08);border-radius:10px;border:1px solid rgba(111,123,95,0.2);padding:14px 18px;">
          <p style="font-size:13px;color:${BRAND.muted};margin:0;line-height:1.6;">
            Questions? Reply to this email or write to <a href="mailto:help@pieceofstass.com?subject=Order%20${orderNum}" style="color:${BRAND.sage};font-weight:600;text-decoration:none;">help@pieceofstass.com</a> — we'll get back to you fast.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = emailShell(subject, bodyHtml, `Update on your order #${orderNum}.`);

  const text = `${subject}

Hi ${firstName},

Here's an update on order #${orderNum}:

${opts.message}
${opts.newEta ? `\nNew estimated delivery: ${opts.newEta}` : ''}
${opts.resolution ? `\nResolution: ${opts.resolution}` : ''}

We're sorry for any inconvenience. You'll hear from us as soon as there's more news.

Questions? Reply to this email or write to help@pieceofstass.com with order #${orderNum}.

— Anna at Piece of Stass`;

  return { subject, html, text };
}
