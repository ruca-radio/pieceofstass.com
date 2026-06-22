/**
 * PATCH /api/account/addresses/:id — update
 * DELETE /api/account/addresses/:id — delete
 */

import type { APIRoute } from 'astro';
import { updateAddress, deleteAddress } from '../../../../lib/users-server';

export const prerender = false;

function optional(val: unknown, maxLen = 200): string | undefined {
  if (typeof val !== 'string') return undefined;
  const t = val.trim().slice(0, maxLen);
  return t || undefined;
}

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const addressId = params.id;
  if (!addressId) {
    return new Response(JSON.stringify({ error: 'Address ID required' }), {
      status: 400,
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

  const updates: Parameters<typeof updateAddress>[2] = {};

  const fields: Array<keyof typeof updates> = [
    'label', 'first_name', 'last_name', 'address_1', 'address_2',
    'city', 'state', 'postal_code', 'country', 'phone',
  ] as const;

  for (const field of fields) {
    const val = optional(body[field]);
    if (val !== undefined) (updates as Record<string, unknown>)[field] = val;
  }

  if (typeof body.is_default === 'boolean') updates.is_default = body.is_default;

  const updated = await updateAddress(user.id, addressId, updates, env);
  if (!updated) {
    return new Response(JSON.stringify({ error: 'Address not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ address: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const addressId = params.id;
  if (!addressId) {
    return new Response(JSON.stringify({ error: 'Address ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = (locals as Record<string, unknown>).runtime?.env as
    | Record<string, unknown>
    | undefined;

  const deleted = await deleteAddress(user.id, addressId, env);
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Address not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
