/**
 * POST /api/admin/orders/:id/notes
 * Save admin scratchpad notes on an order.
 * Appends a timeline event with note excerpt.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../../lib/admin-auth';
import { appendAdminNote, getOrdersKVFromEnv } from '../../../../../lib/orders-server';

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

  const { id } = context.params;
  if (!id) return json({ error: 'Missing order id' }, 400);

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  let body: { notes: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (typeof body.notes !== 'string') {
    return json({ error: 'notes field required' }, 400);
  }

  const updated = await appendAdminNote(kv, id, body.notes);
  if (!updated) return json({ error: 'Order not found' }, 404);

  return json({ ok: true, admin_notes: updated.admin_notes });
}
