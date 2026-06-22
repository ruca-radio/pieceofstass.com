/**
 * order-confirmation.ts — Transactional email: order confirmed
 * ─────────────────────────────────────────────────────────────────────────────
 * Sent immediately when payment is captured (status: paid / payment_captured).
 * Includes: order summary, line items with images, totals, shipping address,
 * estimated delivery window (15-20 business days), receipt PDF link,
 * "Track this order" CTA, and support link.
 *
 * Voice: Anna's warm, cheeky, confident. "Raid the stash."
 * Spec: inline styles, 600px max, mobile-friendly, plain-text fallback.
 */

import type { Order } from '../orders-server';
import {
  emailShell,
  ctaButton,
  card,
  divider,
  label,
  h1,
  p,
  formatCurrency,
  formatDate,
  addBusinessDays,
  BRAND,
} from './base';

export interface OrderConfirmationOptions {
  /** Signed JWT token for the receipt PDF link (30-day expiry) */
  receiptToken?: string;
  baseUrl?: string;
}

export function orderConfirmationEmail(
  order: Order,
  opts: OrderConfirmationOptions = {}
): { subject: string; html: string; text: string } {
  const baseUrl = opts.baseUrl ?? 'https://pieceofstass.com';
  const firstName = order.customer_name?.split(' ')[0] ?? 'there';
  const orderId = order.id;
  const orderNum = orderId.slice(-8).toUpperCase();

  const now = new Date();
  const etaMin = addBusinessDays(now, 15);
  const etaMax = addBusinessDays(now, 20);
  const etaStr = `${etaMin.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${etaMax.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const trackUrl = `${baseUrl}/account/orders/${orderId}`;
  const receiptUrl = opts.receiptToken
    ? `${baseUrl}/api/orders/${orderId}/invoice.pdf?token=${encodeURIComponent(opts.receiptToken)}`
    : `${trackUrl}#receipt`;

  const subject = `Your order's confirmed — #${orderNum}`;

  // ── Line items ──────────────────────────────────────────────────────────────
  const itemsHtml = order.items.map((item) => {
    const lineTotal = formatCurrency(item.unit_price * item.qty);
    const variantLabel = [item.color, item.size].filter(Boolean).join(' · ');
    return `<tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BRAND.line};vertical-align:middle;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="width:64px;vertical-align:top;padding-right:12px;">
              ${item.image
                ? `<img src="${item.image}" alt="${item.title}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;background:${BRAND.line};">`
                : `<div style="width:64px;height:64px;background:${BRAND.line};border-radius:10px;"></div>`
              }
            </td>
            <td style="vertical-align:top;">
              <p style="font-size:14px;font-weight:600;color:${BRAND.espresso};margin:0 0 3px 0;line-height:1.3;">${item.title}</p>
              ${variantLabel ? `<p style="font-size:12px;color:${BRAND.muted};margin:0 0 3px 0;">${variantLabel}</p>` : ''}
              <p style="font-size:12px;color:${BRAND.muted};margin:0;">Qty: ${item.qty}</p>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;">
              <p style="font-size:14px;font-weight:600;color:${BRAND.espresso};margin:0;">${lineTotal}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join('');

  // ── Shipping address ────────────────────────────────────────────────────────
  const addr = order.shipping_address;
  const addrHtml = addr
    ? `<p style="font-size:14px;color:${BRAND.muted};line-height:1.8;margin:0;">
        <strong style="color:${BRAND.espresso};font-weight:600;">${addr.name}</strong><br>
        ${addr.line1}${addr.line2 ? `<br>${addr.line2}` : ''}<br>
        ${addr.city}, ${addr.state} ${addr.postal_code}<br>
        ${addr.country}
      </p>`
    : '';

  // ── Body HTML ───────────────────────────────────────────────────────────────
  const bodyHtml = `
    <!-- Hero card -->
    ${card(`
      ${label('Order Confirmed')}
      ${h1(`Thanks, ${firstName} — your stash is incoming.`)}
      ${p(`Order <strong style="color:${BRAND.espresso};font-family:monospace;">#${orderNum}</strong> is confirmed and we're getting it ready. You'll hear from us when it's on the move.`)}
      <div style="background:${BRAND.surfaceSunken};border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="font-size:13px;color:${BRAND.muted};margin:0;line-height:1.6;">
          <strong style="color:${BRAND.espresso};">Estimated delivery:</strong> ${etaStr}<br>
          <span style="font-size:12px;">15–20 business days for international shipping. We'll send tracking as soon as it ships.</span>
        </p>
      </div>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 8px auto;">
        <tr>
          <td style="padding-right:8px;">
            ${ctaButton('Track this order', trackUrl)}
          </td>
        </tr>
      </table>
    `)}

    <!-- Items -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.surface};border-radius:16px;margin-bottom:16px;">
      <tr><td style="padding:24px 28px 8px 28px;">
        <p style="font-size:14px;font-weight:700;color:${BRAND.espresso};margin:0 0 16px 0;letter-spacing:-0.01em;">Your items</p>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td style="padding:12px 0 4px 0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size:13px;color:${BRAND.muted};padding:2px 0;">Subtotal</td>
                    <td style="font-size:13px;color:${BRAND.muted};padding:2px 0;text-align:right;">${formatCurrency(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:${BRAND.muted};padding:2px 0;">Shipping</td>
                    <td style="font-size:13px;color:${BRAND.muted};padding:2px 0;text-align:right;">${order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:${BRAND.muted};padding:2px 0 10px 0;">Tax</td>
                    <td style="font-size:13px;color:${BRAND.muted};padding:2px 0 10px 0;text-align:right;">${formatCurrency(order.tax)}</td>
                  </tr>
                  <tr style="border-top:2px solid ${BRAND.line};">
                    <td style="font-size:16px;font-weight:700;color:${BRAND.espresso};padding:10px 0 0 0;">Total</td>
                    <td style="font-size:16px;font-weight:700;color:${BRAND.rose};padding:10px 0 0 0;text-align:right;">${formatCurrency(order.total)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </tfoot>
        </table>
      </td></tr>
    </table>

    <!-- Shipping address -->
    ${addr ? card(`
      ${label('Shipping to', BRAND.sage)}
      ${addrHtml}
    `) : ''}

    <!-- Receipt download -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
      <tr>
        <td style="background:${BRAND.surfaceSunken};border-radius:12px;padding:16px 20px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <p style="font-size:13px;font-weight:600;color:${BRAND.espresso};margin:0 0 2px 0;">Receipt / Invoice</p>
                <p style="font-size:12px;color:${BRAND.muted};margin:0;">Download a PDF copy for your records.</p>
              </td>
              <td style="text-align:right;white-space:nowrap;padding-left:12px;">
                <a href="${receiptUrl}" style="display:inline-block;font-size:13px;font-weight:600;color:${BRAND.rose};text-decoration:none;padding:8px 16px;border:1.5px solid ${BRAND.rose};border-radius:999px;">Download PDF</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Support -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background:rgba(111,123,95,0.08);border-radius:10px;border:1px solid rgba(111,123,95,0.2);padding:14px 18px;">
          <p style="font-size:13px;color:${BRAND.muted};margin:0;line-height:1.6;">
            Questions about your order? Reply to this email or reach us at <a href="mailto:help@pieceofstass.com" style="color:${BRAND.sage};font-weight:600;text-decoration:none;">help@pieceofstass.com</a> — include <strong style="color:${BRAND.espresso};font-family:monospace;">#${orderNum}</strong> and we'll sort you out.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = emailShell(subject, bodyHtml, `Your stash is on its way — est. delivery ${etaStr}`);

  // ── Plain text ──────────────────────────────────────────────────────────────
  const itemsText = order.items
    .map((i) => {
      const variant = [i.color, i.size].filter(Boolean).join(' / ');
      return `  • ${i.title}${variant ? ` (${variant})` : ''} × ${i.qty}  ${formatCurrency(i.unit_price * i.qty)}`;
    })
    .join('\n');

  const addrText = addr
    ? `\nSHIPPING TO:\n${addr.name}\n${addr.line1}${addr.line2 ? '\n' + addr.line2 : ''}\n${addr.city}, ${addr.state} ${addr.postal_code}\n${addr.country}\n`
    : '';

  const text = `Order confirmed — #${orderNum}

Hi ${firstName},

Thanks for your order! We're getting it ready to ship. You'll get another email as soon as it's on the move.

Estimated delivery: ${etaStr} (15–20 business days, international shipping).

YOUR ITEMS:
${itemsText}

Subtotal:  ${formatCurrency(order.subtotal)}
Shipping:  ${order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}
Tax:       ${formatCurrency(order.tax)}
Total:     ${formatCurrency(order.total)}
${addrText}
Track your order:  ${trackUrl}
Download receipt:  ${receiptUrl}

Need help? Email help@pieceofstass.com with order #${orderNum}.

— Anna at Piece of Stass
https://pieceofstass.com`;

  return { subject, html, text };
}
