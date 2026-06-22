/**
 * order-confirmation.ts — Email template for order confirmation
 * Placeholder: actual sending is handled by Klaviyo via Medusa webhooks.
 * This module is for any direct send fallback or dev preview.
 */

import type { Order } from '../users-server';

export function orderConfirmationEmail(order: Order): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Order confirmed — #${order.id.slice(0, 8).toUpperCase()}`;
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #3A3A3E; font-size:14px; color:#FAFAF7;">
        ${item.title}
        ${
          item.options
            ? `<span style="color:#6B6B6E; font-size:12px;"> — ${Object.values(item.options).join(', ')}</span>`
            : ''
        }
      </td>
      <td style="padding:12px 0; border-bottom:1px solid #3A3A3E; font-size:14px; color:#6B6B6E; text-align:right;">
        ×${item.quantity}
      </td>
      <td style="padding:12px 0; border-bottom:1px solid #3A3A3E; font-size:14px; color:#FAFAF7; text-align:right;">
        $${((item.price * item.quantity) / 100).toFixed(2)}
      </td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="background:#0A0A0B; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#FAFAF7; margin:0; padding:0;">
  <div style="max-width:560px; margin:0 auto; padding:40px 20px;">

    <!-- Logo -->
    <div style="margin-bottom:40px;">
      <span style="display:inline-block; width:36px; height:36px; border-radius:8px; background:#C6FF3A; vertical-align:middle; margin-right:10px;"></span>
      <span style="font-size:20px; font-weight:700; letter-spacing:-0.02em; vertical-align:middle;">STASS</span>
    </div>

    <!-- Hero -->
    <div style="background:#1C1C1F; border-radius:16px; padding:40px 36px; margin-bottom:24px;">
      <p style="font-size:12px; font-weight:600; color:#C6FF3A; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px;">Order Confirmed</p>
      <h1 style="font-size:24px; font-weight:700; letter-spacing:-0.02em; margin-bottom:12px;">
        Thanks, ${order.shipping_address?.first_name ?? 'friend'}! 🎉
      </h1>
      <p style="font-size:16px; color:#6B6B6E; line-height:1.6; margin-bottom:0;">
        Your order <strong style="color:#FAFAF7">#${order.id.slice(0, 8).toUpperCase()}</strong> is confirmed.
        We'll send you a shipping update when your item ships (typically 10–20 days for international delivery).
      </p>
    </div>

    <!-- Items -->
    <div style="background:#1C1C1F; border-radius:16px; padding:32px 36px; margin-bottom:24px;">
      <h2 style="font-size:16px; font-weight:600; margin-bottom:20px;">Your items</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:16px 0 4px; font-size:13px; color:#6B6B6E;">Subtotal</td>
            <td style="padding:16px 0 4px; font-size:13px; color:#6B6B6E; text-align:right;">$${(order.subtotal / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:4px 0; font-size:13px; color:#6B6B6E;">Shipping</td>
            <td style="padding:4px 0; font-size:13px; color:#6B6B6E; text-align:right;">${order.shipping === 0 ? 'Free' : `$${(order.shipping / 100).toFixed(2)}`}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:4px 0 12px; font-size:13px; color:#6B6B6E;">Tax</td>
            <td style="padding:4px 0 12px; font-size:13px; color:#6B6B6E; text-align:right;">$${(order.tax / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:12px 0 0; font-size:16px; font-weight:700; color:#FAFAF7; border-top:1px solid #3A3A3E;">Total</td>
            <td style="padding:12px 0 0; font-size:16px; font-weight:700; color:#C6FF3A; text-align:right; border-top:1px solid #3A3A3E;">$${(order.total / 100).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Track order CTA -->
    <div style="text-align:center; margin-bottom:32px;">
      <a href="https://pieceofstass.com/track-order" style="display:inline-block; background:#C6FF3A; color:#0A0A0B; font-size:15px; font-weight:700; text-decoration:none; padding:14px 32px; border-radius:999px; letter-spacing:-0.01em;">
        Track my order
      </a>
    </div>

    <!-- Footer -->
    <p style="font-size:12px; color:#6B6B6E; text-align:center; line-height:1.7;">
      &copy; ${new Date().getFullYear()} Piece of Stass. All rights reserved.<br>
      Questions? <a href="mailto:hello@pieceofstass.com" style="color:#6B6B6E;">hello@pieceofstass.com</a><br>
      <a href="https://pieceofstass.com/privacy" style="color:#6B6B6E;">Privacy Policy</a>
    </p>
  </div>
</body>
</html>`;

  const text = `Order confirmed — #${order.id.slice(0, 8).toUpperCase()}

Thanks for your order! We'll send you a shipping update when it ships (10–20 days international delivery).

${order.items.map((i) => `- ${i.title} ×${i.quantity} — $${((i.price * i.quantity) / 100).toFixed(2)}`).join('\n')}

Total: $${(order.total / 100).toFixed(2)}

Track your order: https://pieceofstass.com/track-order

— Piece of Stass`;

  return { subject, html, text };
}
