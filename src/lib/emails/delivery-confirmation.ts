/**
 * delivery-confirmation.ts — "Delivered!"
 * ─────────────────────────────────────────────────────────────────────────────
 * Sent when status transitions to 'delivered'.
 * Includes: delivery confirmation, review CTA, reorder CTA, refer-a-friend.
 */

import type { Order } from '../orders-server';
import {
  emailShell,
  ctaButton,
  secondaryButton,
  card,
  label,
  h1,
  p,
  BRAND,
} from './base';

export function deliveryConfirmationEmail(
  order: Order
): { subject: string; html: string; text: string } {
  const firstName = order.customer_name?.split(' ')[0] ?? 'there';
  const orderNum = order.id.slice(-8).toUpperCase();
  const baseUrl = 'https://pieceofstass.com';
  const orderUrl = `${baseUrl}/account/orders/${order.id}`;
  const shopUrl = `${baseUrl}/shop`;
  const reviewSubject = encodeURIComponent(`Review for order #${orderNum}`);
  const reviewUrl = `mailto:help@pieceofstass.com?subject=${reviewSubject}&body=My%20review%3A%20`;

  const subject = `Delivered! How's the stash, ${firstName}? 👀`;

  const bodyHtml = `
    <!-- Hero card -->
    ${card(`
      ${label('Delivered')}
      ${h1(`The look has landed.`)}
      ${p(`Your order <strong style="color:${BRAND.espresso};font-family:monospace;">#${orderNum}</strong> has been delivered. We hope it lives up to the scroll — and then some.`)}
      <div style="margin-bottom:20px;">
        ${ctaButton('View my order', orderUrl)}
      </div>
    `)}

    <!-- Review request -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.surface};border-radius:16px;margin-bottom:16px;">
      <tr><td style="padding:24px 28px;">
        ${label('Share the love', BRAND.rose)}
        <p style="font-size:15px;font-weight:600;color:${BRAND.espresso};margin:0 0 8px 0;">Got a fit moment? We want to see it.</p>
        ${p(`A quick review helps other people find the looks worth having. 30 seconds, total — and it means the world.`)}
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">
              ${secondaryButton('Leave a review', reviewUrl)}
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Refer a friend -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#B25E6B 0%,#C4673D 100%);border-radius:16px;margin-bottom:16px;">
      <tr><td style="padding:24px 28px;">
        <p style="font-size:11px;font-weight:700;color:rgba(246,240,232,0.7);letter-spacing:0.08em;text-transform:uppercase;margin:0 0 6px 0;">Refer a friend</p>
        <p style="font-size:18px;font-weight:700;color:${BRAND.cream};margin:0 0 8px 0;letter-spacing:-0.01em;">Your group chat needs this stash too.</p>
        <p style="font-size:14px;color:rgba(246,240,232,0.8);margin:0 0 16px 0;line-height:1.5;">Share your referral link — they get a welcome discount, you get a thank-you credit.</p>
        <a href="${baseUrl}/account" style="display:inline-block;font-size:14px;font-weight:700;color:${BRAND.rose};background:${BRAND.cream};text-decoration:none;padding:11px 24px;border-radius:999px;letter-spacing:-0.01em;">Get my referral link</a>
      </td></tr>
    </table>

    <!-- Reorder / Keep shopping -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.surface};border-radius:16px;margin-bottom:16px;">
      <tr><td style="padding:24px 28px;">
        ${label('Ready for the next one?', BRAND.sage)}
        <p style="font-size:15px;font-weight:600;color:${BRAND.espresso};margin:0 0 8px 0;">New drops land daily.</p>
        ${p(`Once you raid the stash, it's hard to stop. New picks added every day — your next find is already in there.`)}
        ${ctaButton('Raid the stash', shopUrl)}
      </td></tr>
    </table>

    <!-- Support -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background:rgba(111,123,95,0.08);border-radius:10px;border:1px solid rgba(111,123,95,0.2);padding:14px 18px;">
          <p style="font-size:13px;color:${BRAND.muted};margin:0;line-height:1.6;">
            Something not right? Email <a href="mailto:help@pieceofstass.com?subject=Order%20${orderNum}" style="color:${BRAND.sage};font-weight:600;text-decoration:none;">help@pieceofstass.com</a> — returns are easy within 14 days.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = emailShell(subject, bodyHtml, `Order #${orderNum} is in your hands. How does it look?`);

  const text = `Delivered! — Order #${orderNum}

Hi ${firstName},

Your order has been delivered! We hope it looks even better in real life than it did on the screen.

View your order: ${orderUrl}

LEAVE A REVIEW
A quick review helps other people find the looks worth having. Just reply to this email — 30 seconds, max.

REFER A FRIEND
Your group chat deserves this stash too. Get your referral link at: ${baseUrl}/account

KEEP SHOPPING
New drops hit the stash daily: ${shopUrl}

Something not right? Email help@pieceofstass.com with order #${orderNum} — returns are easy within 14 days.

— Anna at Piece of Stass`;

  return { subject, html, text };
}
