/**
 * GET|PATCH /api/admin/products/:id
 *
 * GET  — returns merged product (base + override)
 * PATCH — updates override fields (patch semantics)
 *
 * Body fields (all optional):
 *   price                  number
 *   compare_at_price       number | null
 *   description            string | null
 *   status                 'active' | 'draft'
 *   seo                    { title?: string|null, description?: string|null } | null
 *   images_alt             string[]      (per-image alt text array)
 *   variant_price_overrides  Record<sku, number> | null
 *   _reset                 boolean       (delete entire override)
 *
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

export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { id } = context.params;
  if (!id) return json({ error: 'Missing product id' }, 400);

  const base = getProduct(id);
  if (!base) return json({ error: 'Product not found' }, 404);

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
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
    seo: override.seo ?? {},
    images_alt: override.images_alt ?? [],
    variant_price_overrides: override.variant_price_overrides ?? {},
    _override: override,
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

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  let body: {
    price?: number | null;
    compare_at_price?: number | null;
    description?: string | null;
    status?: string;
    seo?: { title?: string | null; description?: string | null } | null;
    images_alt?: string[] | null;
    variant_price_overrides?: Record<string, number> | null;
    _reset?: boolean;
  };

  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // Handle reset
  if (body._reset) {
    await kv.delete(`product_override:${id}`);
    return json({ ok: true, product: { ...base, status: 'active' } });
  }

  // Validate
  if (body.price !== undefined && body.price !== null && (isNaN(body.price) || body.price < 0)) {
    return json({ error: 'Invalid price' }, 400);
  }
  if (
    body.compare_at_price !== undefined &&
    body.compare_at_price !== null &&
    (isNaN(body.compare_at_price) || body.compare_at_price < 0)
  ) {
    return json({ error: 'Invalid compare_at_price' }, 400);
  }
  if (body.status && !['active', 'draft'].includes(body.status)) {
    return json({ error: 'status must be "active" or "draft"' }, 400);
  }

  // Build patch — only include fields that were actually provided
  const patch: Record<string, unknown> = {};

  if (body.price !== undefined && body.price !== null) patch.price = body.price;
  if (body.compare_at_price !== undefined && body.compare_at_price !== null) {
    patch.compare_at_price = body.compare_at_price;
  }
  if (body.description !== undefined && body.description !== null) {
    patch.description = body.description;
  }
  if (body.status) patch.status = body.status as ProductStatus;

  // SEO override
  if (body.seo !== undefined) {
    if (body.seo === null) {
      patch.seo = null;
    } else {
      const seo: Record<string, string | null> = {};
      if (body.seo.title !== undefined) seo.title = body.seo.title || null;
      if (body.seo.description !== undefined) seo.description = body.seo.description || null;
      // Only store if at least one field is set
      const hasValues = Object.values(seo).some((v) => v !== null && v !== '');
      patch.seo = hasValues ? seo : null;
    }
  }

  // Image alt texts
  if (body.images_alt !== undefined) {
    if (body.images_alt === null) {
      patch.images_alt = null;
    } else if (Array.isArray(body.images_alt)) {
      // Trim, keep only non-empty entries (pad with empty strings to maintain index)
      patch.images_alt = body.images_alt.map((s) => (typeof s === 'string' ? s.trim() : ''));
    }
  }

  // Variant price overrides
  if (body.variant_price_overrides !== undefined) {
    if (body.variant_price_overrides === null) {
      patch.variant_price_overrides = null;
    } else if (typeof body.variant_price_overrides === 'object') {
      const cleaned: Record<string, number> = {};
      for (const [sku, price] of Object.entries(body.variant_price_overrides)) {
        if (typeof price === 'number' && !isNaN(price) && price >= 0) {
          cleaned[sku] = price;
        }
      }
      patch.variant_price_overrides = Object.keys(cleaned).length > 0 ? cleaned : null;
    }
  }

  // Use updateProductOverride for standard fields, but handle extended fields manually
  // since ProductOverride type doesn't know about seo/images_alt/variant_price_overrides yet
  const overrideRaw = await kv.get(`product_override:${id}`);
  const existing = overrideRaw ? JSON.parse(overrideRaw) : {};

  const merged = {
    ...existing,
    ...patch,
    updated_at: new Date().toISOString(),
  };

  // Clean undefined/null values from top-level (except explicit null overrides we want to keep)
  // seo, images_alt, variant_price_overrides — null means "cleared"
  Object.keys(merged).forEach((k) => {
    if (merged[k] === undefined) delete merged[k];
  });

  await kv.put(`product_override:${id}`, JSON.stringify(merged));

  return json({
    ok: true,
    product: {
      ...base,
      price: merged.price ?? base.price,
      compare_at_price: merged.compare_at_price ?? base.compare_at_price,
      description: merged.description ?? base.description,
      status: merged.status ?? 'active',
      seo: merged.seo ?? {},
      images_alt: merged.images_alt ?? [],
      variant_price_overrides: merged.variant_price_overrides ?? {},
    },
  });
}
