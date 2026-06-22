/**
 * products-server.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side product data layer with KV override support.
 *
 * Architecture:
 *  - Canonical catalog: data/products.json (80 products, never mutated)
 *  - Admin edits stored in KV under `product_override:{id}` (ORDERS_KV or CART_KV)
 *  - Storefront reads merged view via listProductsForStorefront()
 *
 * ProductOverride fields (all optional — only set what admin changed):
 *   price, compare_at_price, description, status ('active' | 'draft')
 *
 * This allows hot-edits without a deploy cycle. The seed JSON is the fallback.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Product } from './types';
import productsData from '../../data/products.json';
import type { KVLike } from './orders-server';
import { getOrdersKVFromEnv } from './orders-server';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'draft';

export interface ProductOverride {
  price?: number;
  compare_at_price?: number;
  description?: string;
  status?: ProductStatus;
  updated_at?: string;
}

export interface ProductWithStatus extends Product {
  status: ProductStatus;
}

// ── Base catalog ──────────────────────────────────────────────────────────────

const BASE_PRODUCTS: Product[] = productsData.products as Product[];

// ── KV helpers ────────────────────────────────────────────────────────────────

async function getOverride(
  kv: KVLike,
  productId: string
): Promise<ProductOverride | null> {
  const raw = await kv.get(`product_override:${productId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProductOverride;
  } catch {
    return null;
  }
}

function mergeProduct(base: Product, override: ProductOverride | null): ProductWithStatus {
  return {
    ...base,
    price: override?.price ?? base.price,
    compare_at_price: override?.compare_at_price ?? base.compare_at_price,
    description: override?.description ?? base.description,
    status: override?.status ?? 'active',
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * listProducts — return all products from seed JSON (no KV, admin list view).
 * Use this for the admin products table where you want to show all regardless of status.
 */
export function listProducts(): Product[] {
  return [...BASE_PRODUCTS];
}

/**
 * getProduct — get a single product by id from seed JSON.
 */
export function getProduct(id: string): Product | undefined {
  return BASE_PRODUCTS.find((p) => p.id === id);
}

/**
 * updateProductOverride — save admin edits to KV.
 * Merges with any existing override (patch semantics).
 */
export async function updateProductOverride(
  kv: KVLike,
  productId: string,
  patch: ProductOverride
): Promise<ProductWithStatus | null> {
  const base = getProduct(productId);
  if (!base) return null;

  const existing = await getOverride(kv, productId);
  const merged: ProductOverride = {
    ...existing,
    ...patch,
    updated_at: new Date().toISOString(),
  };

  // Remove undefined fields
  Object.keys(merged).forEach((k) => {
    if (merged[k as keyof ProductOverride] === undefined) {
      delete merged[k as keyof ProductOverride];
    }
  });

  await kv.put(`product_override:${productId}`, JSON.stringify(merged));
  return mergeProduct(base, merged);
}

/**
 * listProductsForStorefront — merges seed JSON with KV overrides.
 * Filters out draft products. Used by all storefront product pages.
 * Pass env from APIContext/AstroGlobal locals.runtime.env
 */
export async function listProductsForStorefront(
  env?: Record<string, unknown>
): Promise<ProductWithStatus[]> {
  const kv = getOrdersKVFromEnv(env);
  const results = await Promise.all(
    BASE_PRODUCTS.map(async (p) => {
      const override = await getOverride(kv, p.id);
      return mergeProduct(p, override);
    })
  );
  // Only show active products on storefront
  return results.filter((p) => p.status === 'active');
}

/**
 * getProductForStorefront — single product with override applied.
 */
export async function getProductForStorefront(
  id: string,
  env?: Record<string, unknown>
): Promise<ProductWithStatus | null> {
  const base = getProduct(id);
  if (!base) return null;
  const kv = getOrdersKVFromEnv(env);
  const override = await getOverride(kv, id);
  const merged = mergeProduct(base, override);
  if (merged.status === 'draft') return null;
  return merged;
}

/**
 * listProductsWithOverrides — admin-only: all products with overrides (including drafts).
 */
export async function listProductsWithOverrides(
  kv: KVLike
): Promise<ProductWithStatus[]> {
  return Promise.all(
    BASE_PRODUCTS.map(async (p) => {
      const override = await getOverride(kv, p.id);
      return mergeProduct(p, override);
    })
  );
}
