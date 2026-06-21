import type { Product, Category } from './types';
import productsData from '../../data/products.json';
import categoriesData from '../../data/categories.json';

export const allProducts: Product[] = productsData.products as Product[];
export const allCategories: Category[] = categoriesData.categories as Category[];

export function getProductsByCategory(category: string): Product[] {
  return allProducts.filter((p) => p.category === category);
}

export function getProductByHandle(handle: string): Product | undefined {
  return allProducts.find((p) => p.handle === handle);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return allCategories.find((c) => c.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 6): Product[] {
  return allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function getTrendingProducts(limit = 8): Product[] {
  // Pick first product from each category for variety, then fill
  const seen = new Set<string>();
  const trending: Product[] = [];
  for (const p of allProducts) {
    if (!seen.has(p.category)) {
      seen.add(p.category);
      trending.push(p);
    }
    if (trending.length >= limit) break;
  }
  return trending;
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return allProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function formatPriceDollars(dollars: number): string {
  return `$${dollars.toFixed(0)}`;
}

export function getDiscountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
