/**
 * shipping-notification.ts — "Your stash is on the move"
 * ─────────────────────────────────────────────────────────────────────────────
 * Sent when status transitions to 'shipped'.
 * Includes carrier name, tracking number, deep-link tracking URL, ETA.
 */

import type { Order } from '../orders-server';
import { resolveCarrier } from '../tracking';
import {
  emailShell,
  ctaButton,
  card,
  label,
  h1,
  p,
  addBusinessDays,
  BRAND,
} from './base';

export function shippingNotificationEmail(
  order: Order
): { subject: string; html: string; text: string } {
  const firstName = order.customer_name?.split(' ')[0] ?? 'there';
  const orderNum = order.id.slice(-8).toUpperCase();
  const baseUrl = 'https://pieceofstass.com';
  const trackPageUrl = `${baseUrl}/account/orders/${order.id}`;

  const tracking = order.tracking_number ?? '';
  const carrierInfo = tracking ? resolveCarrier(tracking) : null;
  const carrierName = order.shipping_carrier ?? carrierInfo?.name ?? 'your carrier';
  const trackUrl = carrierInfo?.url ?? `https://t.17track.net/en#nums=${encodeURIComponent(tracking)}`;

  // ETA — shipped orders are typically 7-15 days out
  const now = new Date();
  const etaMin = addBusinessDays(now, 7);
  const etaMax = addBusinessDays(now, 15);
  const etaStr = `${etaMin.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${etaMax.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const subject = `Your stash is on the move 📦 — #${orderNum}`;

  const bodyHtml = `
    <!-- Hero card -->
    ${card(`
      ${label('Shipped!')}
      ${h1(`It's packed, it's posted, it's yours.`)}
      ${p(`Your order <strong style="color:${BRAND.espresso};font-family:monospace;">#${orderNum}</strong> just left the warehouse. ${carrierName} has it from here.`)}
      <div style="background:${BRAND.surfaceSunken};border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <p style="font-size:11px;font-weight:700;color:${BRAND.muted};letter-spacing:0.06em;text-transform:uppercase;margin:0 0 4px 0;">Carrier</p>
              <p style="font-size:15px;font-weight:600;color:${BRAND.espresso};margin:0;">${carrierName}</p>
            </td>
            ${tracking ? `<td style="text-align:right;">
              <p style="font-size:11px;font-weight:700;color:${BRAND.muted};letter-spacing:0.06em;text-transform:uppercase;margin:0 0 4px 0;">Tracking #</p>
              <p style="font-size:13px;font-weight:600;color:${BRAND.espresso};margin:0;font-family:monospace;">${tracking}</p>
            </td>` : ''}
          </tr>
        </table>
        <div style="height:12px;"></div>
        <p style="font-size:12px;color:${BRAND.muted};margin:0;">
          <strong style="color:${BRAND.espresso};">Estimated arrival:</strong> ${etaStr}<br>
          <span style="font-size:11px;">Tracking may take 24–48 hours to activate after shipment.</span>
        </p>
      </div>
      ${tracking ? ctaButton(`Track with ${carrierName}`, trackUrl) : ''}
    `)}

    <!-- Secondary: account tracking link -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
      <tr>
        <td style="text-align:center;padding:16px 0;">
          <a href="${trackPageUrl}" style="font-size:13px;color:${BRAND.sage};font-weight:600;text-decoration:none;">View order details on Piece of Stass →</a>
        </td>
      </tr>
    </table>

    <!-- What to expect -->
    ${card(`
      ${label('What happens next', BRAND.sage)}
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${BRAND.muted};line-height:1.6;">
            <strong style="color:${BRAND.espresso};">1. Tracking activates</strong> — usually within 24–48 hours.<br>
            <strong style="color:${BRAND.espresso};">2. Customs</strong> — international orders may pass through customs (no action needed from you).<br>
            <strong style="color:${BRAND.espresso};">3. Delivery</strong> — ${etaStr}. If you're not home, check your building's mailroom or a local delivery point.
          </td>
        </tr>
      </table>
    `)}

    <!-- Support -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background:rgba(111,123,95,0.08);border-radius:10px;border:1px solid rgba(111,123,95,0.2);padding:14px 18px;">
          <p style="font-size:13px;color:${BRAND.muted};margin:0;line-height:1.6;">
            Issue with your shipment? Email <a href="mailto:help@pieceofstass.com?subject=Order%20${orderNum}%20shipping%20issue" style="color:${BRAND.sage};font-weight:600;text-decoration:none;">help@pieceofstass.com</a> with your order number and we'll chase it down.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = emailShell(subject, bodyHtml, `${carrierName} has your order. Est. arrival ${etaStr}.`);

  const text = `Your stash is on the move — #${orderNum}

Hi ${firstName},

Your order just shipped! ${carrierName} has it from here.

Carrier:    ${carrierName}
${tracking ? `Tracking #: ${tracking}\nTrack:      ${trackUrl}\n` : ''}
Estimated arrival: ${etaStr}

View your order: ${trackPageUrl}

Tracking can take 24–48 hours to activate. Questions? Email help@pieceofstass.com with #${orderNum}.

— Anna at Piece of Stass`;

  return { subject, html, text };
}
