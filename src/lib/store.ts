import { atom, computed } from 'nanostores';
import type { CartItem } from './types';

// Cart state
export const cartItems = atom<CartItem[]>([]);
export const cartOpen = atom<boolean>(false);
export const searchOpen = atom<boolean>(false);
export const mobileMenuOpen = atom<boolean>(false);

// Cart computed values
export const cartCount = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const cartSubtotal = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

// Cart actions
export function addToCart(item: CartItem) {
  const current = cartItems.get();
  const existing = current.find(
    (i) => i.variantSku === item.variantSku
  );
  if (existing) {
    cartItems.set(
      current.map((i) =>
        i.variantSku === item.variantSku
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      )
    );
  } else {
    cartItems.set([...current, item]);
  }
  cartOpen.set(true);
}

export function updateCartItem(sku: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(sku);
    return;
  }
  cartItems.set(
    cartItems.get().map((i) =>
      i.variantSku === sku ? { ...i, quantity } : i
    )
  );
}

export function removeFromCart(sku: string) {
  cartItems.set(cartItems.get().filter((i) => i.variantSku !== sku));
}

export function clearCart() {
  cartItems.set([]);
}
