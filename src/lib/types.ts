export interface ProductVariant {
  title: string;
  sku: string;
  options: Record<string, string>;
  inventory_quantity: number;
  manage_inventory: boolean;
  prices: { currency_code: string; amount: number }[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  currency_code: string;
  compare_at_price?: number;
  images: string[];
  variants: ProductVariant[];
}

export interface Category {
  slug: string;
  title: string;
  hero_copy: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  parent: string | null;
}

export interface CartItem {
  productId: string;
  variantSku: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  options: Record<string, string>;
}
