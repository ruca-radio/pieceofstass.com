/**
 * SupplierMapping — static configuration for the 8 Yupoo dropship sources.
 *
 * This is NOT exposed via Storefront API. It is internal to the Dropship module
 * and used only by the order-to-supplier workflow.
 *
 * supplier_id values must match the `metadata.supplier_id` field on each
 * Medusa product, which is set during the seed script import.
 */
export interface SupplierConfig {
  id: string
  name: string          // Internal label only
  category: string      // Top-level category this supplier covers
  yupooHandle: string   // Yupoo username (internal, never sent to storefront)
  yupooBaseUrl: string  // Internal reference URL
  contactEmail: string  // Injected from env — see DropshipService constructor
  currency: string      // Supplier invoice currency (CNY assumed, orders in USD)
  avgLeadDays: number   // Typical dispatch lead time in calendar days
  notes: string         // Internal ops notes
}

export const SUPPLIER_IDS = [
  "chenyico",
  "117034687",
  "3293950449",
  "miao2017",
  "ypd2023",
  "775180006",
  "jmshop88",
  "xtd8288",
] as const

export type SupplierId = typeof SUPPLIER_IDS[number]

/**
 * Static supplier metadata (all non-secret fields).
 * Secret fields (contactEmail) are injected by DropshipService from env vars.
 */
export const SUPPLIER_STATIC_CONFIG: Record<
  SupplierId,
  Omit<SupplierConfig, "contactEmail">
> = {
  chenyico: {
    id: "chenyico",
    name: "Chenyico Footwear",
    category: "footwear",
    yupooHandle: "chenyico",
    yupooBaseUrl: "https://chenyico.x.yupoo.com",
    currency: "CNY",
    avgLeadDays: 5,
    notes:
      "High catalog depth. Verify size/color availability before confirming each order. Page requires login for some albums.",
  },
  "117034687": {
    id: "117034687",
    name: "Watches Supplier 117034687",
    category: "watches",
    yupooHandle: "117034687",
    yupooBaseUrl: "https://117034687.x.yupoo.com",
    currency: "CNY",
    avgLeadDays: 7,
    notes:
      "Request QC images before fulfillment. Source album titles contain protected marks — use internal SKUs only.",
  },
  "3293950449": {
    id: "3293950449",
    name: "Bags Supplier 3293950449",
    category: "bags",
    yupooHandle: "3293950449",
    yupooBaseUrl: "https://3293950449.x.yupoo.com",
    currency: "CNY",
    avgLeadDays: 6,
    notes:
      "Rich album catalog. All customer copy must be rewritten — source categories use trademark labels.",
  },
  miao2017: {
    id: "miao2017",
    name: "Miao Men Apparel",
    category: "men",
    yupooHandle: "miao2017",
    yupooBaseUrl: "https://miao2017.x.yupoo.com",
    currency: "CNY",
    avgLeadDays: 7,
    notes:
      "Broad apparel category structure. Supplier titles contain brand abbreviations — do not reuse.",
  },
  ypd2023: {
    id: "ypd2023",
    name: "YPD Women Fashion",
    category: "women",
    yupooHandle: "ypd2023",
    yupooBaseUrl: "https://ypd2023.x.yupoo.com",
    currency: "CNY",
    avgLeadDays: 10,
    notes:
      "Strong catalog for sets and dresses. Known for delayed fulfillment — communicate conservative processing times to customers.",
  },
  "775180006": {
    id: "775180006",
    name: "Kids Footwear 775180006",
    category: "kids",
    yupooHandle: "775180006",
    yupooBaseUrl: "https://775180006.x.yupoo.com",
    currency: "CNY",
    avgLeadDays: 6,
    notes:
      "Size information in album titles. Scrub all brand/model words before publishing.",
  },
  jmshop88: {
    id: "jmshop88",
    name: "JM Fragrance Shop",
    category: "fragrance",
    yupooHandle: "jmshop88",
    yupooBaseUrl: "https://jmshop88.x.yupoo.com",
    currency: "CNY",
    avgLeadDays: 5,
    notes:
      "Album titles mostly numeric. SKUs are synthesized by scent family. Verify stock before launch.",
  },
  xtd8288: {
    id: "xtd8288",
    name: "XTD Tech Accessories",
    category: "tech",
    yupooHandle: "xtd8288",
    yupooBaseUrl: "https://xtd8288.x.yupoo.com",
    currency: "CNY",
    avgLeadDays: 5,
    notes:
      "Source categories contain electronics brand names. Keep product names generic. Verify compatibility claims.",
  },
}
