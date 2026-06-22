/**
 * POST /api/account/addresses — create address
 * PATCH /api/account/addresses/:id — update address  (handled in [id].ts)
 * DELETE /api/account/addresses/:id — delete address (handled in [id].ts)
 */

import type { APIRoute } from 'astro';
import { addAddress } from '../../../lib/users-server';

export const prerender = false;

function required(val: unknown, field: string): string {
  if (typeof val !== 'string' || !val.trim()) throw new Error(`${field} is required`);
  return val.trim().slice(0, 200);
}

function optional(val: unknown, maxLen = 200): string | undefined {
  if (typeof val !== 'string') return undefined;
  const t = val.trim().slice(0, maxLen);
  return t || undefined;
}

export const POST: APIRoute = async ({ request, locals }) => {
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

  try {
    const address = await addAddress(
      user.id,
      {
        label: optional(body.label, 50),
        first_name: required(body.first_name, 'first_name'),
        last_name: required(body.last_name, 'last_name'),
        address_1: required(body.address_1, 'address_1'),
        address_2: optional(body.address_2),
        city: required(body.city, 'city'),
        state: required(body.state, 'state'),
        postal_code: required(body.postal_code, 'postal_code'),
        country: required(body.country, 'country').toUpperCase().slice(0, 2),
        phone: optional(body.phone, 20),
        is_default: body.is_default === true,
      },
      env
    );

    return new Response(JSON.stringify({ address }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
