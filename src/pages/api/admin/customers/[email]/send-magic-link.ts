/**
 * POST /api/admin/customers/:email/send-magic-link
 * Admin-initiated passwordless login link for a customer.
 * Generates a signed magic link token (24hr expiry) and sends via Resend.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../../lib/admin-auth';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function generateMagicToken(email: string, secret: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + 86400; // 24 hours
  const payload = { email, exp: expires, iat: Math.floor(Date.now() / 1000) };
  const enc = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signingInput = `${header}.${payloadB64}`;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${signingInput}.${sigB64}`;
}

export async function POST(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const emailParam = context.params.email;
  if (!emailParam) return json({ error: 'Missing email' }, 400);

  const email = decodeURIComponent(emailParam);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, string>
    | undefined;

  const secret = runtimeEnv?.JWT_SECRET ?? runtimeEnv?.ADMIN_PASSWORD_HASH ?? 'dev-secret';
  const baseUrl = runtimeEnv?.SITE_URL ?? 'https://pieceofstass.com';
  const resendKey = runtimeEnv?.RESEND_API_KEY;

  const token = await generateMagicToken(email, secret);
  const magicLink = `${baseUrl}/account/magic?token=${encodeURIComponent(token)}`;

  if (resendKey) {
    // Send via Resend
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: runtimeEnv?.EMAIL_FROM ?? 'hello@pieceofstass.com',
          to: [email],
          subject: 'Your login link for Piece of Stass',
          html: `<p>Hi,</p><p>An admin generated a login link for your account. Click below to sign in (valid 24 hours):</p><p><a href="${magicLink}">${magicLink}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
          text: `Login link for Piece of Stass:\n\n${magicLink}\n\nValid for 24 hours.`,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json() as { message?: string };
        return json({ error: `Email send failed: ${err.message ?? resp.status}` }, 502);
      }
    } catch (e) {
      return json({ error: `Email send failed: ${e}` }, 502);
    }
  } else {
    // Dev mode — log the link
    console.log(`[dev] Magic link for ${email}: ${magicLink}`);
  }

  return json({
    ok: true,
    email,
    dev_link: !resendKey ? magicLink : undefined,
    message: resendKey ? `Magic link sent to ${email}` : `[dev] Magic link generated (no Resend key). See console.`,
  });
}
