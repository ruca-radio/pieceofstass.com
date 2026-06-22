/**
 * GET /api/auth/verify?token=...
 * Verifies JWT magic-link token, upserts user, sets session cookie, redirects.
 */

import type { APIRoute } from 'astro';
import {
  verifyJWT,
  createSessionToken,
  makeSessionCookie,
  type MagicLinkPayload,
} from '../../../lib/auth';
import { upsertUser } from '../../../lib/users-server';

export const prerender = false;

export const GET: APIRoute = async ({ request, redirect, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime?.env as
    | Record<string, unknown>
    | undefined;

  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return redirect('/account/sign-in?error=missing_token');
  }

  const authSecret = (env?.AUTH_SECRET as string | undefined) ?? import.meta.env.AUTH_SECRET;

  const payload = await verifyJWT<MagicLinkPayload>(token, authSecret);

  if (!payload || payload.type !== 'magic_link') {
    return redirect('/account/sign-in?error=invalid_token');
  }

  // Check expiry (jose already checks exp, but be explicit)
  if (!payload.email) {
    return redirect('/account/sign-in?error=invalid_token');
  }

  // Upsert user — creates if new, returns existing if returning
  const user = await upsertUser(payload.email, {}, env);

  // Create session token
  const sessionToken = await createSessionToken(user.id, user.email, authSecret);

  const isProduction =
    (env?.PUBLIC_SITE_URL as string | undefined)?.startsWith('https://') ??
    import.meta.env.PROD ??
    false;

  const cookieHeader = makeSessionCookie(sessionToken, isProduction as boolean);

  // Redirect to account dashboard
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/account',
      'Set-Cookie': cookieHeader,
    },
  });
};
