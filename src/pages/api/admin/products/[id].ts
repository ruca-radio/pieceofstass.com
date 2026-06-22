/**
 * PATCH /api/admin/products/:id
 * Update a product override in KV.
 *
 * Body: { price?, compare_at_price?, description?, status?, _reset? }
 *
 * If _reset is true, deletes the override entirely (restores catalog defaults).
 * Requires valid pos_admin cookie.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { getProduct, updateProductOverride } from '../../../../lib/products-server';
import { getOrdersKVFromEnv } from '../../../../lib/orders-server';
import type { ProductStatus } from '../../../../lib/products-server';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PATCH(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { id } = context.params;
  if (!id) return json({ error: 'Missing product id' }, 400);

  const base = getProduct(id);
  if (!base) return json({ error: 'Product not found' }, 404);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  let body: {
    price?: number | null;
    compare_at_price?: number | null;
    description?: string | null;
    status?: string;
    _reset?: boolean;
  };

  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // Handle reset request
  if (body._reset) {
    await kv.delete(`product_override:${id}`);
    return json({ ok: true, product: { ...base, status: 'active' } });
  }

  // Validate
  if (body.price !== undefined && body.price !== null && (isNaN(body.price) || body.price < 0)) {
    return json({ error: 'Invalid price' }, 400);
  }
  if (body.compare_at_price !== undefined && body.compare_at_price !== null &&
      (isNaN(body.compare_at_price) || body.compare_at_price < 0)) {
    return json({ error: 'Invalid compare_at_price' }, 400);
  }
  if (body.status && !['active', 'draft'].includes(body.status)) {
    return json({ error: 'status must be "active" or "draft"' }, 400);
  }

  // Build patch (only include defined, non-null fields)
  const patch: Record<string, unknown> = {};
  if (body.price !== undefined && body.price !== null) patch.price = body.price;
  if (body.compare_at_price !== undefined && body.compare_at_price !== null) {
    patch.compare_at_price = body.compare_at_price;
  }
  if (body.description !== undefined && body.description !== null) {
    patch.description = body.description;
  }
  if (body.status) patch.status = body.status as ProductStatus;

  const updated = await updateProductOverride(kv, id, patch);
  if (!updated) return json({ error: 'Failed to update product' }, 500);

  return json({ ok: true, product: updated });
}

export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { id } = context.params;
  if (!id) return json({ error: 'Missing product id' }, 400);

  const base = getProduct(id);
  if (!base) return json({ error: 'Product not found' }, 404);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);
  const overrideRaw = await kv.get(`product_override:${id}`);
  const override = overrideRaw ? JSON.parse(overrideRaw) : {};

  return json({
    ...base,
    price: override.price ?? base.price,
    compare_at_price: override.compare_at_price ?? base.compare_at_price,
    description: override.description ?? base.description,
    status: override.status ?? 'active',
    _override: override,
  });
}
