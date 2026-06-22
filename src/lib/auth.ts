/**
 * auth.ts — Passwordless magic-link authentication
 * JWT signing/verification (HS256), session management, Resend email sending.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { magicLinkEmail } from './emails/magic-link';

// ─── Constants ───────────────────────────────────────────────────────────────
const MAGIC_LINK_EXPIRY_SECONDS = 15 * 60;          // 15 minutes
const SESSION_EXPIRY_SECONDS = 30 * 24 * 60 * 60;   // 30 days
const SESSION_COOKIE_NAME = 'pos_session';
const RESEND_API = 'https://api.resend.com/emails';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MagicLinkPayload extends JWTPayload {
  email: string;
  type: 'magic_link';
}

export interface SessionPayload extends JWTPayload {
  user_id: string;
  email: string;
  type: 'session';
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Key helpers ─────────────────────────────────────────────────────────────
function getSecret(authSecret?: string): Uint8Array {
  const secret = authSecret ?? import.meta.env.AUTH_SECRET ?? 'dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

// ─── JWT: Sign ────────────────────────────────────────────────────────────────
export async function signJWT(
  payload: Record<string, unknown>,
  expiresInSeconds: number,
  authSecret?: string
): Promise<string> {
  const secret = getSecret(authSecret);
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(secret);
}

// ─── JWT: Verify ─────────────────────────────────────────────────────────────
export async function verifyJWT<T extends JWTPayload>(
  token: string,
  authSecret?: string
): Promise<T | null> {
  try {
    const secret = getSecret(authSecret);
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return payload as T;
  } catch {
    return null;
  }
}

// ─── Magic link ───────────────────────────────────────────────────────────────
export async function sendMagicLink(
  email: string,
  baseUrl: string,
  authSecret?: string,
  resendKey?: string,
  emailFrom?: string
): Promise<{ ok: boolean; devLink?: string }> {
  const token = await signJWT(
    { email, type: 'magic_link' } satisfies Omit<MagicLinkPayload, keyof JWTPayload>,
    MAGIC_LINK_EXPIRY_SECONDS,
    authSecret
  );

  const verifyUrl = `${baseUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const apiKey = resendKey ?? import.meta.env.RESEND_API_KEY ?? '';
  const from = emailFrom ?? import.meta.env.EMAIL_FROM ?? 'hello@pieceofstass.com';

  // Dev mode fallback: log to console
  if (!apiKey || apiKey === 'dev') {
    console.log('\n[AUTH] Magic link (dev mode — no RESEND_API_KEY set):');
    console.log(`[AUTH] MAGIC_LINK_URL: ${verifyUrl}\n`);
    return { ok: true, devLink: verifyUrl };
  }

  const { subject, html, text } = magicLinkEmail(email, verifyUrl);

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[AUTH] Resend error:', res.status, body);
    return { ok: false };
  }

  return { ok: true };
}

// ─── Session cookie helpers ────────────────────────────────────────────────
export function makeSessionCookie(
  token: string,
  isProduction: boolean
): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${SESSION_EXPIRY_SECONDS}`,
  ];
  if (isProduction) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(isProduction: boolean): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];
  if (isProduction) parts.push('Secure');
  return parts.join('; ');
}

export async function createSessionToken(
  userId: string,
  email: string,
  authSecret?: string
): Promise<string> {
  return signJWT(
    { user_id: userId, email, type: 'session' } satisfies Omit<SessionPayload, keyof JWTPayload>,
    SESSION_EXPIRY_SECONDS,
    authSecret
  );
}

// ─── Session extraction (for middleware/pages) ────────────────────────────
export async function getSessionFromRequest(
  request: Request,
  authSecret?: string
): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookie = parseCookies(cookieHeader)[SESSION_COOKIE_NAME];
  if (!cookie) return null;

  const payload = await verifyJWT<SessionPayload>(cookie, authSecret);
  if (!payload || payload.type !== 'session') return null;
  return payload;
}

// ─── Cookie parser ────────────────────────────────────────────────────────
export function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .filter((p) => p.length === 2)
      .map(([k, v]) => [k.trim(), decodeURIComponent(v.trim())])
  );
}

export { SESSION_COOKIE_NAME, SESSION_EXPIRY_SECONDS, MAGIC_LINK_EXPIRY_SECONDS };
