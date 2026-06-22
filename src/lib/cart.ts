/**
 * cart.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Client-side cart hook + API helpers.
 *
 * - Wraps fetch calls to /api/cart/* endpoints
 * - Syncs nanostores `cartItems` with server truth
 * - Exposes `useCart()` React hook for components
 * - Provides standalone functions for use outside React components
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useState } from 'react';
import { cartItems, cartOpen, cartSubtotal, cartCount } from './store';
import type { CartItem } from './types';
import type { ServerCart } from './cart-server';

// ── Server → client shape mapper ─────────────────────────────────────────────

function serverToClientItems(cart: ServerCart): CartItem[] {
  return cart.items.map((si) => ({
    productId: si.product_id,
    variantSku: si.variant_id,
    title: si.title_snapshot,
    image: si.image_snapshot,
    price: si.price_snapshot,
    quantity: si.qty,
    // options are not stored server-side (not needed for cart display);
    // we pass an empty record and individual components show variant from title
    options: {} as Record<string, string>,
  }));
}

// ── Low-level fetch helpers ───────────────────────────────────────────────────

async function apiFetch<T>(
  url: string,
  init?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json() as { error?: string };
        if (j.error) msg = j.error;
      } catch {
        // ignore
      }
      return { data: null, error: msg };
    }
    const data = await res.json() as T;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message ?? 'Network error' };
  }
}

// ── Public API functions ──────────────────────────────────────────────────────

/**
 * fetchCart — load cart from server and sync nanostores.
 */
export async function fetchCart(): Promise<ServerCart | null> {
  const { data } = await apiFetch<ServerCart>('/api/cart');
  if (data) cartItems.set(serverToClientItems(data));
  return data;
}

export interface AddItemPayload {
  product_id: string;
  variant_id: string;
  qty: number;
}

/**
 * apiAddItem — POST /api/cart/items and sync store.
 */
export async function apiAddItem(
  payload: AddItemPayload
): Promise<{ cart: ServerCart | null; error: string | null }> {
  const { data, error } = await apiFetch<ServerCart>('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (data) cartItems.set(serverToClientItems(data));
  return { cart: data, error };
}

/**
 * apiUpdateItem — PATCH /api/cart/items/:id and sync store.
 */
export async function apiUpdateItem(
  variantId: string,
  qty: number
): Promise<{ cart: ServerCart | null; error: string | null }> {
  const { data, error } = await apiFetch<ServerCart>(
    `/api/cart/items/${encodeURIComponent(variantId)}`,
    { method: 'PATCH', body: JSON.stringify({ qty }) }
  );
  if (data) cartItems.set(serverToClientItems(data));
  return { cart: data, error };
}

/**
 * apiRemoveItem — DELETE /api/cart/items/:id and sync store.
 */
export async function apiRemoveItem(
  variantId: string
): Promise<{ cart: ServerCart | null; error: string | null }> {
  const { data, error } = await apiFetch<ServerCart>(
    `/api/cart/items/${encodeURIComponent(variantId)}`,
    { method: 'DELETE' }
  );
  if (data) cartItems.set(serverToClientItems(data));
  return { cart: data, error };
}

/**
 * apiClearCart — POST /api/cart/clear and sync store.
 */
export async function apiClearCart(): Promise<{ cart: ServerCart | null; error: string | null }> {
  const { data, error } = await apiFetch<ServerCart>('/api/cart/clear', {
    method: 'POST',
  });
  if (data) cartItems.set(serverToClientItems(data));
  return { cart: data, error };
}

/**
 * initiateCheckout — POST /api/checkout, returns Stripe URL.
 */
export async function initiateCheckout(): Promise<{
  url: string | null;
  error: string | null;
}> {
  const { data, error } = await apiFetch<{ url: string }>('/api/checkout', {
    method: 'POST',
  });
  return { url: data?.url ?? null, error };
}

// ── React hook ────────────────────────────────────────────────────────────────

export function useCart() {
  const items = useStore(cartItems);
  const isOpen = useStore(cartOpen);
  const subtotal = useStore(cartSubtotal);
  const count = useStore(cartCount);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with server on mount
  useEffect(() => {
    fetchCart().catch(() => {/* silent — store already has optimistic state */});
  }, []);

  const addItem = useCallback(
    async (payload: AddItemPayload) => {
      setLoading(true);
      setError(null);
      const { error: err } = await apiAddItem(payload);
      if (err) setError(err);
      setLoading(false);
      cartOpen.set(true);
    },
    []
  );

  const updateItem = useCallback(async (variantId: string, qty: number) => {
    setLoading(true);
    const { error: err } = await apiUpdateItem(variantId, qty);
    if (err) setError(err);
    setLoading(false);
  }, []);

  const removeItem = useCallback(async (variantId: string) => {
    setLoading(true);
    const { error: err } = await apiRemoveItem(variantId);
    if (err) setError(err);
    setLoading(false);
  }, []);

  const checkout = useCallback(async () => {
    setCheckoutLoading(true);
    setError(null);
    const { url, error: err } = await initiateCheckout();
    if (err) {
      setError(err);
      setCheckoutLoading(false);
      return;
    }
    if (url) window.location.href = url;
    setCheckoutLoading(false);
  }, []);

  return {
    items,
    isOpen,
    subtotal,
    count,
    loading,
    checkoutLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    checkout,
    openCart: () => cartOpen.set(true),
    closeCart: () => cartOpen.set(false),
  };
}
