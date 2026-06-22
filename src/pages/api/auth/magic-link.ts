/**
 * POST /api/auth/magic-link
 * Accepts { email }, rate-limits to 3/hour per IP, sends magic link.
 */

import type { APIRoute } from 'astro';
import { sendMagicLink } from '../../../lib/auth';
import { checkRateLimit } from '../../../lib/users-server';

export const prerender = false;

function isValidEmail(email: unknown): email is string {
  return (
    typeof email === 'string' &&
    email.length <= 320 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime?.env as
    | Record<string, unknown>
    | undefined;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { email } = body;
  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'A valid email address is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rate limit by IP
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for') ??
    'unknown';

  const { allowed, remaining } = await checkRateLimit(ip, env);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait an hour before trying again.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '3600',
        },
      }
    );
  }

  const baseUrl =
    (env?.PUBLIC_SITE_URL as string | undefined) ??
    import.meta.env.PUBLIC_SITE_URL ??
    'http://localhost:4321';

  const authSecret = (env?.AUTH_SECRET as string | undefined) ?? import.meta.env.AUTH_SECRET;
  const resendKey = (env?.RESEND_API_KEY as string | undefined) ?? import.meta.env.RESEND_API_KEY;
  const emailFrom = (env?.EMAIL_FROM as string | undefined) ?? import.meta.env.EMAIL_FROM;

  const result = await sendMagicLink(email, baseUrl, authSecret, resendKey, emailFrom);

  if (!result.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to send email. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const responseData: Record<string, unknown> = {
    ok: true,
    message: 'Magic link sent! Check your inbox.',
    remaining,
  };

  // In dev, return the link in the response body so tests can grab it
  if (result.devLink) {
    responseData.dev_link = result.devLink;
  }

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
