/**
 * base.ts — Shared HTML email shell and helpers
 * ─────────────────────────────────────────────────────────────────────────────
 * Brand tokens (v2 Atelier):
 *   Cream:    #F6F0E8  (canvas background)
 *   Espresso: #2A211C  (primary text)
 *   Rose:     #A14C58  (accent, CTAs)
 *   Sage:     #6F7B5F  (secondary)
 *   Line:     #E6DCCF  (borders)
 *   Muted:    #726558  (secondary text)
 *   Surface:  #FBF7F1  (card bg)
 *   Success:  #3F6A44
 *   Error:    #B23A33
 *
 * Mobile-first, 600px max, all inline styles for email client compatibility.
 */

// ── Brand tokens (inline email constants) ─────────────────────────────────────

export const BRAND = {
  cream: '#F6F0E8',
  espresso: '#2A211C',
  rose: '#A14C58',
  roseBright: '#B25E6B',
  sage: '#6F7B5F',
  clay: '#C4673D',
  line: '#E6DCCF',
  muted: '#726558',
  surface: '#FBF7F1',
  surfaceSunken: '#F0E7DA',
  success: '#3F6A44',
  error: '#B23A33',
} as const;

// ── Shell ─────────────────────────────────────────────────────────────────────

export function emailShell(
  title: string,
  bodyContent: string,
  previewText?: string
): string {
  const preview = previewText
    ? `<div style="display:none;font-size:1px;color:${BRAND.cream};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(previewText)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
${preview}
  <!-- Outer wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.cream};">
    <tr>
      <td align="center" style="padding:32px 16px 48px;">
        <!-- Inner container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
          <!-- Logo header -->
          ${logoRow()}
          <!-- Body content -->
          <tr>
            <td>
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          ${footerRow()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Logo row ──────────────────────────────────────────────────────────────────

function logoRow(): string {
  // Inline-safe email logo: hosted PNG with text alt so Gmail/Outlook fallback gracefully.
  return `<tr>
    <td style="padding:0 0 28px 0;text-align:left;">
      <a href="https://pieceofstass.com" style="text-decoration:none;display:inline-block;">
        <img
          src="https://pieceofstass.com/brand/logo-nav.png"
          width="178"
          height="48"
          alt="Piece of Stass"
          style="display:inline-block;border:0;outline:none;height:48px;width:auto;max-width:200px;"
        />
      </a>
    </td>
  </tr>`;
}

// ── Footer row ────────────────────────────────────────────────────────────────

function footerRow(): string {
  return `<tr>
    <td style="padding:32px 0 0 0;border-top:1px solid ${BRAND.line};">
      <p style="font-size:12px;color:${BRAND.muted};text-align:center;line-height:1.7;margin:0;">
        &copy; ${new Date().getFullYear()} Piece of Stass. All rights reserved.<br>
        Questions? <a href="mailto:help@pieceofstass.com" style="color:${BRAND.muted};text-decoration:underline;">help@pieceofstass.com</a><br>
        <a href="https://pieceofstass.com/privacy" style="color:${BRAND.muted};text-decoration:underline;">Privacy Policy</a>
        &nbsp;&bull;&nbsp;
        <a href="https://pieceofstass.com/shipping" style="color:${BRAND.muted};text-decoration:underline;">Shipping Policy</a>
        &nbsp;&bull;&nbsp;
        <a href="https://pieceofstass.com/returns" style="color:${BRAND.muted};text-decoration:underline;">Returns</a>
      </p>
    </td>
  </tr>`;
}

// ── UI primitives ─────────────────────────────────────────────────────────────

/** Primary CTA button — rose bg, cream text */
export function ctaButton(label: string, href: string): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td style="border-radius:999px;background-color:${BRAND.rose};">
        <a href="${href}" style="display:inline-block;font-size:15px;font-weight:700;color:${BRAND.cream};text-decoration:none;padding:14px 32px;border-radius:999px;letter-spacing:-0.01em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${label}</a>
      </td>
    </tr>
  </table>`;
}

/** Secondary (outlined) CTA — rose border + text */
export function secondaryButton(label: string, href: string): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td style="border-radius:999px;border:2px solid ${BRAND.rose};">
        <a href="${href}" style="display:inline-block;font-size:15px;font-weight:700;color:${BRAND.rose};text-decoration:none;padding:12px 30px;border-radius:999px;letter-spacing:-0.01em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${label}</a>
      </td>
    </tr>
  </table>`;
}

/** Card wrapper */
export function card(content: string): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.surface};border-radius:16px;margin-bottom:16px;">
    <tr><td style="padding:28px 28px;">
      ${content}
    </td></tr>
  </table>`;
}

/** Divider line */
export const divider = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:1px;background-color:${BRAND.line};margin:0;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

/** Label — small uppercase */
export function label(text: string, color: string = BRAND.rose): string {
  return `<p style="font-size:11px;font-weight:700;color:${color};letter-spacing:0.08em;text-transform:uppercase;margin:0 0 6px 0;">${text}</p>`;
}

/** Heading h1 */
export function h1(text: string): string {
  return `<h1 style="font-size:26px;font-weight:700;color:${BRAND.espresso};letter-spacing:-0.02em;margin:0 0 12px 0;line-height:1.15;">${text}</h1>`;
}

/** Body paragraph */
export function p(text: string, style = ''): string {
  return `<p style="font-size:15px;color:${BRAND.muted};line-height:1.65;margin:0 0 16px 0;${style}">${text}</p>`;
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}
