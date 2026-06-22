/**
 * supplier-routing.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Category → supplier mapping for fulfillment routing.
 *
 * Based on:
 *  - /docs/sourcing/recommended-stack.md  (logistics/recommended approach)
 *  - /commerce/medusa/src/modules/dropship/models/supplier-mapping.ts (Yupoo sources)
 *
 * This module is the single source of truth for the admin UI supplier routing.
 * The Medusa dropship module (supplier-mapping.ts) defines the Yupoo catalog
 * sources; this module layers on logistics metadata for the fulfillment workflow.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE DECISION:
 * The Yupoo-sourced product catalog (supplier-mapping.ts) identifies 8 Yupoo
 * accounts by category. For the fulfillment flow, supplier emails are injected
 * from env vars at runtime (SUPPLIER_EMAIL_<ID>). This file exports static
 * non-secret metadata; emails come from env in the admin routes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface SupplierRoute {
  supplier_id: string;
  supplier_name: string;
  /** Placeholder — actual email injected from env var SUPPLIER_EMAIL_<id.toUpperCase()> */
  supplier_email_env_key: string;
  /** Primary sourcing platform */
  platform: string;
  /** Country/region orders ship from */
  ship_from: string;
  est_days_min: number;
  est_days_max: number;
  /** Currency invoices are denominated in */
  invoice_currency: string;
  notes: string;
}

/**
 * CATEGORY_SUPPLIER_MAP
 *
 * Keys match product.category values in data/products.json.
 * The 8 Yupoo accounts are the primary sources; recommended-stack.md platforms
 * (Trendsi, Spocket, CJ, Printful, Blanka) are noted as logistics layer alternatives.
 *
 * Recommended-stack logistics overlay:
 *  - footwear   → Chenyico (Yupoo), CJDropshipping US warehouse backup
 *  - watches    → 117034687 (Yupoo), CJDropshipping US warehouse backup
 *  - bags       → 3293950449 (Yupoo), Spocket backup
 *  - men        → miao2017 (Yupoo), Spocket primary for US fulfillment
 *  - women      → ypd2023 (Yupoo), Trendsi primary for US fulfillment
 *  - kids       → 775180006 (Yupoo), Spocket backup
 *  - fragrance  → jmshop88 (Yupoo), Blanka/private-label path
 *  - tech       → xtd8288 (Yupoo), CJDropshipping US warehouse backup
 */
export const CATEGORY_SUPPLIER_MAP: Record<string, SupplierRoute> = {
  footwear: {
    supplier_id: 'chenyico',
    supplier_name: 'Chenyico Footwear',
    supplier_email_env_key: 'SUPPLIER_EMAIL_CHENYICO',
    platform: 'Yupoo (chenyico.x.yupoo.com)',
    ship_from: 'CN',
    est_days_min: 7,
    est_days_max: 14,
    invoice_currency: 'CNY',
    notes:
      'High catalog depth. Verify size/color availability before confirming order. Backup: CJDropshipping US warehouse (2–5 days).',
  },
  watches: {
    supplier_id: '117034687',
    supplier_name: 'Watches Supplier 117034687',
    supplier_email_env_key: 'SUPPLIER_EMAIL_117034687',
    platform: 'Yupoo (117034687.x.yupoo.com)',
    ship_from: 'CN',
    est_days_min: 10,
    est_days_max: 18,
    invoice_currency: 'CNY',
    notes:
      'Request QC images before fulfillment. Use internal SKUs only. Backup: CJDropshipping US warehouse (2–5 days, filter US warehouse SKUs only).',
  },
  bags: {
    supplier_id: '3293950449',
    supplier_name: 'Bags Supplier 3293950449',
    supplier_email_env_key: 'SUPPLIER_EMAIL_3293950449',
    platform: 'Yupoo (3293950449.x.yupoo.com)',
    ship_from: 'CN',
    est_days_min: 8,
    est_days_max: 16,
    invoice_currency: 'CNY',
    notes:
      'Rich album catalog. All customer copy must be rewritten. Backup: Spocket US/EU suppliers (2–5 days).',
  },
  men: {
    supplier_id: 'miao2017',
    supplier_name: 'Miao Men Apparel',
    supplier_email_env_key: 'SUPPLIER_EMAIL_MIAO2017',
    platform: 'Yupoo (miao2017.x.yupoo.com)',
    ship_from: 'CN',
    est_days_min: 7,
    est_days_max: 14,
    invoice_currency: 'CNY',
    notes:
      'Broad apparel catalog. Do not reuse supplier titles. Backup: Spocket (US/EU, 2–5 days, $39.99/mo Professional plan).',
  },
  women: {
    supplier_id: 'ypd2023',
    supplier_name: 'YPD Women Fashion',
    supplier_email_env_key: 'SUPPLIER_EMAIL_YPD2023',
    platform: 'Yupoo (ypd2023.x.yupoo.com)',
    ship_from: 'CN',
    est_days_min: 10,
    est_days_max: 20,
    invoice_currency: 'CNY',
    notes:
      'Strong catalog for sets and dresses. Known for delayed fulfillment — use conservative processing times. Backup: Trendsi US warehouse (City of Industry CA, 2–5 days, free).',
  },
  kids: {
    supplier_id: '775180006',
    supplier_name: 'Kids Footwear 775180006',
    supplier_email_env_key: 'SUPPLIER_EMAIL_775180006',
    platform: 'Yupoo (775180006.x.yupoo.com)',
    ship_from: 'CN',
    est_days_min: 7,
    est_days_max: 14,
    invoice_currency: 'CNY',
    notes:
      'Size info in album titles. Scrub all brand/model names before publishing. Backup: Spocket (US/EU, 2–5 days).',
  },
  fragrance: {
    supplier_id: 'jmshop88',
    supplier_name: 'JM Fragrance Shop',
    supplier_email_env_key: 'SUPPLIER_EMAIL_JMSHOP88',
    platform: 'Yupoo (jmshop88.x.yupoo.com)',
    ship_from: 'CN',
    est_days_min: 7,
    est_days_max: 12,
    invoice_currency: 'CNY',
    notes:
      'Album titles mostly numeric; SKUs synthesized by scent family. Verify stock before launch. Long-term path: Blanka private-label (US, branded packaging).',
  },
  tech: {
    supplier_id: 'xtd8288',
    supplier_name: 'XTD Tech Accessories',
    supplier_email_env_key: 'SUPPLIER_EMAIL_XTD8288',
    platform: 'Yupoo (xtd8288.x.yupoo.com)',
    ship_from: 'CN',
    est_days_min: 7,
    est_days_max: 14,
    invoice_currency: 'CNY',
    notes:
      'Source categories contain electronics brand names — keep published names generic. Backup: CJDropshipping US warehouse (filter US-warehouse SKUs, 2–5 days).',
  },
};

/**
 * getSupplierForCategory — look up a supplier route by product category.
 * Returns undefined if category has no mapping.
 */
export function getSupplierForCategory(category: string): SupplierRoute | undefined {
  return CATEGORY_SUPPLIER_MAP[category];
}

/**
 * getSupplierEmail — resolve supplier email from env vars at runtime.
 * Called in server-side API routes that have access to the CF Worker env.
 */
export function getSupplierEmail(
  route: SupplierRoute,
  env: Record<string, string>
): string {
  return env[route.supplier_email_env_key] ?? `[Set ${route.supplier_email_env_key} in wrangler secrets]`;
}

/**
 * getAllSuppliers — return all supplier routes as an array.
 */
export function getAllSuppliers(): SupplierRoute[] {
  return Object.values(CATEGORY_SUPPLIER_MAP);
}
