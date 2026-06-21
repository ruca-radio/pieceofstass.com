/**
 * Seed Script — Piece of Stass
 *
 * Loads /home/user/workspace/pieceofstass.com/data/products.json and
 * data/categories.json into Medusa via the admin SDK.
 *
 * Run via:
 *   npm run seed
 * Which executes:
 *   medusa exec ./src/scripts/seed.ts
 *
 * Idempotent: uses upsert semantics on handle/slug. Safe to re-run.
 *
 * Security: supplier_id and supplier_url are stored in product metadata but
 * are NOT returned by the Storefront API (field selection excludes metadata
 * by default unless explicitly requested).
 */

import * as fs from "fs"
import * as path from "path"
import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

// ─── File paths ───────────────────────────────────────────────────────────────
const DATA_DIR = path.resolve(__dirname, "../../../../..", "data")
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json")
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json")

// ─── Types matching products.json + categories.json ──────────────────────────

interface ProductVariant {
  title: string
  sku: string
  options: Record<string, string>
  inventory_quantity: number
  manage_inventory: boolean
  prices: Array<{ currency_code: string; amount: number }>
}

interface SeedProduct {
  id: string
  title: string
  handle: string
  description: string
  category: string
  tags: string[]
  price: number
  currency_code: string
  compare_at_price: number
  images: string[]
  variants: ProductVariant[]
  // Internal fields — stored in metadata, never returned to storefront
  supplier_id?: string
  supplier_url?: string
}

interface SeedCategory {
  slug: string
  title: string
  hero_copy: string
  seo_title: string
  seo_description: string
  sort_order: number
  parent: string | null
}

// ─── Supplier ID derivation ───────────────────────────────────────────────────
// If the source data doesn't directly encode supplier_id on each product,
// derive it from category using the known mapping.
const CATEGORY_TO_SUPPLIER_ID: Record<string, string> = {
  footwear: "chenyico",
  watches: "117034687",
  bags: "3293950449",
  men: "miao2017",
  women: "ypd2023",
  kids: "775180006",
  fragrance: "jmshop88",
  tech: "xtd8288",
}

// ─── Main seed function ───────────────────────────────────────────────────────

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("=== Piece of Stass Seed Script ===")
  logger.info(`Reading data from: ${DATA_DIR}`)

  // ── Load JSON files ──────────────────────────────────────────────────────
  if (!fs.existsSync(PRODUCTS_FILE)) {
    throw new Error(`products.json not found at: ${PRODUCTS_FILE}`)
  }
  if (!fs.existsSync(CATEGORIES_FILE)) {
    throw new Error(`categories.json not found at: ${CATEGORIES_FILE}`)
  }

  const { products: seedProducts }: { products: SeedProduct[] } = JSON.parse(
    fs.readFileSync(PRODUCTS_FILE, "utf-8")
  )
  const { categories: seedCategories }: { categories: SeedCategory[] } = JSON.parse(
    fs.readFileSync(CATEGORIES_FILE, "utf-8")
  )

  logger.info(`Loaded ${seedProducts.length} products, ${seedCategories.length} categories`)

  // ── Resolve modules ──────────────────────────────────────────────────────
  const productModule = container.resolve(Modules.PRODUCT)
  const regionModule = container.resolve(Modules.REGION)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Seed US region
  // ─────────────────────────────────────────────────────────────────────────
  logger.info("Seeding US region...")

  let usRegion: any
  try {
    const existing = await regionModule.listRegions({ name: ["United States"] })
    if (existing.length > 0) {
      usRegion = existing[0]
      logger.info(`US region already exists: ${usRegion.id}`)
    } else {
      usRegion = await regionModule.createRegions({
        name: "United States",
        currency_code: "usd",
        countries: ["us"],
      })
      logger.info(`Created US region: ${usRegion.id}`)
    }
  } catch (err: any) {
    logger.warn(`Region seed warning: ${err?.message}`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Seed product categories
  // ─────────────────────────────────────────────────────────────────────────
  logger.info("Seeding product categories...")

  const categoryHandleToId: Record<string, string> = {}

  for (const cat of seedCategories) {
    try {
      const existing = await productModule.listProductCategories({
        handle: [cat.slug],
      })

      if (existing.length > 0) {
        categoryHandleToId[cat.slug] = existing[0].id
        logger.info(`  Category already exists: ${cat.slug} → ${existing[0].id}`)
        continue
      }

      const created = await productModule.createProductCategories({
        name: cat.title,
        handle: cat.slug,
        description: cat.hero_copy,
        rank: cat.sort_order,
        is_active: true,
        is_internal: false,
        metadata: {
          seo_title: cat.seo_title,
          seo_description: cat.seo_description,
        },
      })

      categoryHandleToId[cat.slug] = created.id
      logger.info(`  Created category: ${cat.slug} → ${created.id}`)
    } catch (err: any) {
      logger.warn(`  Failed to seed category ${cat.slug}: ${err?.message}`)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Seed products
  // ─────────────────────────────────────────────────────────────────────────
  logger.info("Seeding products...")

  let created = 0
  let skipped = 0
  let failed = 0

  for (const product of seedProducts) {
    try {
      // Check for existing product by handle
      const existing = await productModule.listProducts({
        handle: [product.handle],
      })

      if (existing.length > 0) {
        skipped++
        continue
      }

      // Derive supplier_id from category if not already on the record
      const supplierId =
        (product as any).supplier_id ??
        CATEGORY_TO_SUPPLIER_ID[product.category] ??
        null

      // Build options from first variant
      const optionKeys = product.variants.length > 0
        ? Object.keys(product.variants[0].options)
        : []

      const options = optionKeys.map((key) => ({ title: key }))

      // Build variants
      const variants = product.variants.map((v) => ({
        title: v.title,
        sku: v.sku,
        manage_inventory: v.manage_inventory,
        options: optionKeys.reduce<Record<string, string>>((acc, key) => {
          acc[key] = v.options[key] ?? ""
          return acc
        }, {}),
        prices: v.prices,
      }))

      // Build images array
      const images = product.images.map((url) => ({ url }))

      // Category link
      const categoryId = categoryHandleToId[product.category]

      await productModule.createProducts({
        title: product.title,
        handle: product.handle,
        description: product.description,
        status: "published",
        images,
        options,
        variants,
        categories: categoryId ? [{ id: categoryId }] : [],
        tags: product.tags
          .filter((t) => t !== "source-sampled") // never expose internal tag
          .map((t) => ({ value: t })),
        metadata: {
          // Internal only — not returned by Storefront API
          supplier_id: supplierId,
          // supplier_url intentionally omitted from public seed; add via admin
          compare_at_price: product.compare_at_price,
        },
      })

      created++

      if (created % 10 === 0) {
        logger.info(`  Seeded ${created} products so far...`)
      }
    } catch (err: any) {
      failed++
      logger.warn(`  Failed to seed product ${product.handle}: ${err?.message}`)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────
  logger.info("=== Seed Complete ===")
  logger.info(`Categories seeded: ${Object.keys(categoryHandleToId).length}`)
  logger.info(`Products created: ${created}`)
  logger.info(`Products skipped (already exist): ${skipped}`)
  logger.info(`Products failed: ${failed}`)

  if (failed > 0) {
    logger.warn("Some products failed to seed. Check logs above for details.")
  }
}
