/**
 * POST /api/admin/customers/:email/note
 * Add a note to a customer profile (stored in KV under user:{hash}.admin_notes).
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../../lib/admin-auth';
import { getUserByEmail, upsertUser } from '../../../../../lib/users-server';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const emailParam = context.params.email;
  if (!emailParam) return json({ error: 'Missing email' }, 400);
  const email = decodeURIComponent(emailParam);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;

  let body: { note: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!body.note || typeof body.note !== 'string') {
    return json({ error: 'note field required' }, 400);
  }

  // Upsert user with admin_notes field
  const user = await upsertUser(email, { admin_notes: body.note } as Parameters<typeof upsertUser>[1], runtimeEnv);

  return json({ ok: true, admin_notes: (user as Record<string, unknown>).admin_notes });
}
