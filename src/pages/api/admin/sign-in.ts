/**
 * POST /api/admin/sign-in
 * Accepts form-encoded or JSON body with `password` field.
 * Verifies against ADMIN_PASSWORD_HASH env var (PBKDF2).
 * On success: sets pos_admin JWT cookie, redirects to /admin.
 * On failure: redirects to /admin/sign-in?error=invalid.
 */
import type { APIContext } from 'astro';
import { verifyPassword, signAdminJWT, setAdminCookie } from '../../../lib/admin-auth';

export const prerender = false;

// Rate limiting: track failed attempts in-memory (simple, resets on Worker restart)
// For production, use ADMIN_KV to persist across requests.
const failedAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(context: APIContext): Promise<Response> {
  const env = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, string>
    | undefined;
  const passwordHash = env?.ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD_HASH;

  if (!passwordHash) {
    return new Response('Admin password not configured', { status: 503 });
  }

  // Get client IP for rate limiting
  const clientIp =
    context.request.headers.get('cf-connecting-ip') ??
    context.request.headers.get('x-forwarded-for') ??
    'unknown';

  // Check rate limit
  const now = Date.now();
  const rateEntry = failedAttempts.get(clientIp);
  if (rateEntry && rateEntry.count >= MAX_ATTEMPTS) {
    if (now < rateEntry.resetAt) {
      return new Response('Too many failed attempts. Try again in 10 minutes.', {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateEntry.resetAt - now) / 1000)) },
      });
    } else {
      failedAttempts.delete(clientIp);
    }
  }

  // Parse body (form or JSON)
  let password: string | null = null;
  const contentType = context.request.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const body = await context.request.json() as { password?: string };
      password = body.password ?? null;
    } else {
      // form-urlencoded (default HTML form POST)
      const body = await context.request.formData();
      password = body.get('password') as string | null;
    }
  } catch {
    password = null;
  }

  if (!password) {
    return new Response(null, { status: 302, headers: { Location: '/admin/sign-in?error=invalid' } });
  }

  // Verify password
  const isValid = await verifyPassword(password, passwordHash);

  if (!isValid) {
    // Increment failed attempts
    const entry = failedAttempts.get(clientIp);
    if (entry) {
      entry.count++;
      entry.resetAt = Date.now() + LOCKOUT_MS;
    } else {
      failedAttempts.set(clientIp, { count: 1, resetAt: Date.now() + LOCKOUT_MS });
    }

    // Return appropriate response based on Accept header
    if (contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(null, { status: 302, headers: { Location: '/admin/sign-in?error=invalid' } });
  }

  // Clear rate limit on success
  failedAttempts.delete(clientIp);

  // Create JWT and set cookie
  const token = await signAdminJWT(passwordHash);
  setAdminCookie(context, token);

  // Return appropriate response
  if (contentType.includes('application/json')) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, { status: 302, headers: { Location: '/admin' } });
}
