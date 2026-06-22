/**
 * POST /api/auth/sign-out
 * Clears the session cookie and redirects to home.
 */

import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as Record<string, unknown>).runtime?.env as
    | Record<string, unknown>
    | undefined;

  const isProduction =
    (env?.PUBLIC_SITE_URL as string | undefined)?.startsWith('https://') ??
    import.meta.env.PROD ??
    false;

  const cookieHeader = clearSessionCookie(isProduction as boolean);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieHeader,
    },
  });
};
