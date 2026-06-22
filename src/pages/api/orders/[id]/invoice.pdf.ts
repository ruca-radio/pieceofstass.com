/**
 * GET /api/orders/:id/invoice.pdf
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a brand-aligned invoice PDF for the order.
 *
 * AUTH: accepts two modes
 *   1. Logged-in user (pos_session cookie) — must own the order
 *   2. Signed token (?token=<JWT>) — order_id + type:'receipt', 30-day expiry
 *      This token is embedded in the order confirmation email.
 *
 * Returns: application/pdf, Content-Disposition: attachment
 *
 * PDF built with pdf-lib (pure JS, Cloudflare Workers compatible).
 * Uses embedded standard fonts (Helvetica, Helvetica-Bold) to avoid
 * font-loading issues on Workers.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getOrdersKVFromEnv, getOrder } from '../../../../lib/orders-server';
import { getSessionFromRequest } from '../../../../lib/auth';
import { verifyJWT } from '../../../../lib/auth';

// ── Brand colours (as pdf-lib 0-1 floats) ────────────────────────────────────

const CREAM   = rgb(246/255, 240/255, 232/255);
const ESPRESSO = rgb(42/255,  33/255,  28/255);
const ROSE    = rgb(161/255, 76/255,  88/255);
const MUTED   = rgb(114/255, 101/255, 88/255);
const LINE    = rgb(230/255, 220/255, 207/255);
const SUCCESS = rgb(63/255, 106/255,  68/255);

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

// ── PDF builder ───────────────────────────────────────────────────────────────

async function buildInvoicePDF(order: {
  id: string;
  customer_email: string;
  customer_name?: string;
  items: Array<{
    title: string;
    color?: string;
    size?: string;
    qty: number;
    unit_price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_address?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const { width, height } = page.getSize();
  const margin = 48;
  const contentWidth = width - margin * 2;

  let y = height - margin;

  // ── Background ─────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height, color: CREAM });

  // ── Header bar ─────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 72, width, height: 72, color: ESPRESSO });

  // Logo text
  page.drawText('Piece of Stass', {
    x: margin,
    y: height - 42,
    size: 18,
    font: bold,
    color: CREAM,
  });

  // "INVOICE" label top right
  page.drawText('INVOICE', {
    x: width - margin - 70,
    y: height - 32,
    size: 11,
    font: bold,
    color: ROSE,
    
  });
  page.drawText('pieceofstass.com', {
    x: width - margin - 110,
    y: height - 50,
    size: 9,
    font: regular,
    color: rgb(200/255, 190/255, 180/255),
  });

  y = height - 72 - 32;

  // ── Order meta ──────────────────────────────────────────────────────────────
  const orderNum = order.id.slice(-8).toUpperCase();

  // Left column: order info
  page.drawText('Order number', { x: margin, y, size: 8, font: regular, color: MUTED });
  page.drawText(`#${orderNum}`, { x: margin, y: y - 14, size: 13, font: mono, color: ESPRESSO });

  // Right column: date
  page.drawText('Date', { x: width - margin - 120, y, size: 8, font: regular, color: MUTED });
  page.drawText(fmtDate(order.created_at), { x: width - margin - 120, y: y - 14, size: 10, font: regular, color: ESPRESSO });

  y -= 48;

  // ── Divider ─────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: LINE });
  y -= 20;

  // ── Bill To ──────────────────────────────────────────────────────────────────
  page.drawText('BILL TO', { x: margin, y, size: 8, font: bold, color: MUTED });
  y -= 16;

  const addr = order.shipping_address;
  const billName = addr?.name ?? order.customer_name ?? order.customer_email;
  page.drawText(billName, { x: margin, y, size: 11, font: bold, color: ESPRESSO });
  y -= 14;
  page.drawText(order.customer_email, { x: margin, y, size: 10, font: regular, color: MUTED });
  y -= 14;

  if (addr) {
    page.drawText(addr.line1, { x: margin, y, size: 10, font: regular, color: MUTED });
    y -= 14;
    if (addr.line2) {
      page.drawText(addr.line2, { x: margin, y, size: 10, font: regular, color: MUTED });
      y -= 14;
    }
    page.drawText(`${addr.city}, ${addr.state} ${addr.postal_code}`, { x: margin, y, size: 10, font: regular, color: MUTED });
    y -= 14;
    page.drawText(addr.country, { x: margin, y, size: 10, font: regular, color: MUTED });
    y -= 14;
  }

  y -= 16;

  // ── Table header ─────────────────────────────────────────────────────────────
  page.drawRectangle({ x: margin, y: y - 4, width: contentWidth, height: 24, color: ESPRESSO });

  const col = {
    item: margin + 8,
    qty: margin + contentWidth * 0.65,
    price: margin + contentWidth * 0.77,
    total: margin + contentWidth * 0.89,
  };

  page.drawText('ITEM', { x: col.item, y: y + 5, size: 8, font: bold, color: CREAM });
  page.drawText('QTY', { x: col.qty, y: y + 5, size: 8, font: bold, color: CREAM });
  page.drawText('UNIT', { x: col.price, y: y + 5, size: 8, font: bold, color: CREAM });
  page.drawText('TOTAL', { x: col.total, y: y + 5, size: 8, font: bold, color: CREAM });

  y -= 24;

  // ── Line items ────────────────────────────────────────────────────────────────
  let rowAlt = false;
  for (const item of order.items) {
    const rowH = 28;

    if (rowAlt) {
      page.drawRectangle({ x: margin, y: y - rowH + 14, width: contentWidth, height: rowH, color: rgb(248/255, 244/255, 238/255) });
    }

    const variantLabel = [item.color, item.size].filter(Boolean).join(' · ');
    const titleText = truncate(item.title, 46);

    page.drawText(titleText, { x: col.item, y: y + 2, size: 10, font: regular, color: ESPRESSO });
    if (variantLabel) {
      page.drawText(variantLabel, { x: col.item, y: y - 10, size: 8, font: regular, color: MUTED });
    }

    page.drawText(String(item.qty), { x: col.qty + 6, y: y + 2, size: 10, font: regular, color: ESPRESSO });
    page.drawText(fmtMoney(item.unit_price), { x: col.price, y: y + 2, size: 10, font: mono, color: ESPRESSO });
    page.drawText(fmtMoney(item.unit_price * item.qty), { x: col.total, y: y + 2, size: 10, font: mono, color: ESPRESSO });

    y -= rowH;
    rowAlt = !rowAlt;
  }

  y -= 8;

  // ── Totals ────────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: LINE });
  y -= 14;

  const totalsX = width - margin - 170;
  const amtX = width - margin - 10;

  // Helper to draw a totals row
  const drawTotalRow = (label: string, amount: string, isBold = false, isRose = false) => {
    page.drawText(label, {
      x: totalsX,
      y,
      size: 10,
      font: isBold ? bold : regular,
      color: isBold ? ESPRESSO : MUTED,
    });
    page.drawText(amount, {
      x: amtX - mono.widthOfTextAtSize(amount, 10),
      y,
      size: 10,
      font: mono,
      color: isRose ? ROSE : (isBold ? ESPRESSO : MUTED),
    });
    y -= 16;
  };

  drawTotalRow('Subtotal', fmtMoney(order.subtotal));
  drawTotalRow('Shipping', order.shipping === 0 ? 'Free' : fmtMoney(order.shipping));
  drawTotalRow('Tax', fmtMoney(order.tax));

  y -= 4;
  page.drawLine({ start: { x: totalsX, y }, end: { x: width - margin, y }, thickness: 0.5, color: LINE });
  y -= 14;

  drawTotalRow('Total', fmtMoney(order.total), true, true);

  // ── Footer ────────────────────────────────────────────────────────────────────
  const footerY = 36;
  page.drawLine({ start: { x: margin, y: footerY + 20 }, end: { x: width - margin, y: footerY + 20 }, thickness: 0.5, color: LINE });

  page.drawText('Thank you for raiding the stash.', {
    x: margin,
    y: footerY + 8,
    size: 8,
    font: bold,
    color: ESPRESSO,
  });

  page.drawText('Returns within 14 days · help@pieceofstass.com · pieceofstass.com/returns', {
    x: margin,
    y: footerY - 4,
    size: 7,
    font: regular,
    color: MUTED,
  });

  page.drawText(`Invoice generated ${new Date().toLocaleDateString('en-US')}`, {
    x: width - margin - 140,
    y: footerY - 4,
    size: 7,
    font: regular,
    color: MUTED,
  });

  return doc.save();
}

// ── Route handler ─────────────────────────────────────────────────────────────

export const GET: APIRoute = async (context) => {
  const { id } = context.params;
  if (!id) {
    return new Response('Missing order id', { status: 400 });
  }

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const envVars = (runtimeEnv ?? {}) as Record<string, string | undefined>;
  const authSecret = envVars.AUTH_SECRET ?? import.meta.env.AUTH_SECRET;

  const kv = getOrdersKVFromEnv(runtimeEnv);
  const order = await getOrder(kv, id);

  if (!order) {
    return new Response('Order not found', { status: 404 });
  }

  // ── Auth check ─────────────────────────────────────────────────────────────
  let authorized = false;

  // Mode 1: signed token in query string
  const token = new URL(context.request.url).searchParams.get('token');
  if (token) {
    const payload = await verifyJWT<{ order_id: string; type: string }>(token, authSecret);
    if (payload && payload.order_id === id && payload.type === 'receipt') {
      authorized = true;
    }
  }

  // Mode 2: session cookie
  if (!authorized) {
    const session = await getSessionFromRequest(context.request, authSecret);
    if (session && session.email === order.customer_email) {
      authorized = true;
    }
  }

  if (!authorized) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ── Build PDF ──────────────────────────────────────────────────────────────
  try {
    const pdfBytes = await buildInvoicePDF(order);
    const orderNum = order.id.slice(-8).toUpperCase();

    return new Response(pdfBytes.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pos-invoice-${orderNum}.pdf"`,
        'Content-Length': String(pdfBytes.byteLength),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('[invoice.pdf] PDF generation error:', err);
    return new Response('PDF generation failed', { status: 500 });
  }
};
