/**
 * PATCH /api/account/profile
 * Updates the authenticated user's profile fields.
 */

import type { APIRoute } from 'astro';
import { upsertUser } from '../../../lib/users-server';

export const prerender = false;

function sanitize(val: unknown, maxLen = 100): string | undefined {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim().slice(0, maxLen);
  return trimmed || undefined;
}

export const PATCH: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = (locals as Record<string, unknown>).runtime?.env as
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

  const updates: Parameters<typeof upsertUser>[1] = {};

  const firstName = sanitize(body.first_name);
  const lastName = sanitize(body.last_name);
  const phone = sanitize(body.phone, 20);

  if (firstName !== undefined) updates.first_name = firstName;
  if (lastName !== undefined) updates.last_name = lastName;
  if (phone !== undefined) updates.phone = phone;

  if (typeof body.marketing_opt_in === 'boolean') {
    updates.marketing_opt_in = body.marketing_opt_in;
  }

  const updated = await upsertUser(user.email, updates, env);

  return new Response(JSON.stringify({ user: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
