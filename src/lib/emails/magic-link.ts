/**
 * magic-link.ts — Email template for magic-link sign-in
 * Brand-aligned: warm, on-voice, mobile-friendly HTML.
 */

export function magicLinkEmail(
  email: string,
  verifyUrl: string
): { subject: string; html: string; text: string } {
  const subject = 'Your sign-in link for Piece of Stass';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0A0A0B;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FAFAF7;
    }
    .wrapper {
      max-width: 560px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 40px;
      text-decoration: none;
    }
    .logo-mark {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #C6FF3A;
      display: inline-block;
    }
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #FAFAF7;
      letter-spacing: -0.02em;
    }
    .card {
      background: #1C1C1F;
      border-radius: 16px;
      padding: 40px 36px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #FAFAF7;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    .sub {
      font-size: 16px;
      color: #6B6B6E;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-block;
      background: #C6FF3A;
      color: #0A0A0B;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 999px;
      letter-spacing: -0.01em;
    }
    .divider {
      width: 100%;
      height: 1px;
      background: #3A3A3E;
      margin: 32px 0;
    }
    .link-fallback {
      font-size: 13px;
      color: #6B6B6E;
      line-height: 1.6;
      word-break: break-all;
    }
    .link-fallback a {
      color: #C6FF3A;
    }
    .expiry-note {
      font-size: 13px;
      color: #6B6B6E;
      margin-top: 20px;
    }
    .footer {
      font-size: 12px;
      color: #6B6B6E;
      text-align: center;
      line-height: 1.7;
    }
    .footer a {
      color: #6B6B6E;
      text-decoration: underline;
    }
    @media (max-width: 480px) {
      .card { padding: 28px 20px; }
      h1 { font-size: 20px; }
      .btn { display: block; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Logo -->
    <div class="logo" style="text-align:center;padding:8px 0 24px;">
      <a href="https://pieceofstass.com" style="text-decoration:none;display:inline-block;">
        <img
          src="https://pieceofstass.com/brand/logo-nav.png"
          width="178"
          height="48"
          alt="Piece of Stass"
          style="display:inline-block;border:0;outline:none;height:48px;width:auto;max-width:200px;"
        />
      </a>
    </div>

    <!-- Card -->
    <div class="card">
      <h1>Your sign-in link</h1>
      <p class="sub">
        Click the button below to sign in to your Piece of Stass account.
        No password needed — just one click.
      </p>
      <a href="${verifyUrl}" class="btn">Sign in to my account</a>

      <div class="divider"></div>

      <p class="link-fallback">
        Button not working? Copy and paste this URL into your browser:<br>
        <a href="${verifyUrl}">${verifyUrl}</a>
      </p>

      <p class="expiry-note">
        This link expires in <strong style="color:#FAFAF7">15 minutes</strong>
        and can only be used once.
      </p>
    </div>

    <!-- Footer -->
    <p class="footer">
      You're receiving this because someone requested a sign-in link for
      <strong style="color:#FAFAF7">${email}</strong>.
      If that wasn't you, you can safely ignore this email.<br><br>
      &copy; ${new Date().getFullYear()} Piece of Stass. All rights reserved.<br>
      <a href="https://pieceofstass.com/privacy">Privacy Policy</a>
    </p>
  </div>
</body>
</html>`;

  const text = `Your sign-in link for Piece of Stass

Click the link below to sign in (expires in 15 minutes):
${verifyUrl}

If you didn't request this, you can safely ignore this email.

— Piece of Stass
https://pieceofstass.com`;

  return { subject, html, text };
}
