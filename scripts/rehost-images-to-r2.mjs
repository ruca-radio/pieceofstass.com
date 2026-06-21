#!/usr/bin/env node
/**
 * rehost-images-to-r2.mjs
 * ─────────────────────────────────────────────────────────────
 * Piece of Stass — R2 Image Rehosting Script
 *
 * Reads /data/products.json, downloads each Yupoo image, uploads
 * it to the "pieceofstass-images" R2 bucket with deterministic
 * object keys, then writes /data/products.r2.json with all image
 * URLs replaced by https://cdn.pieceofstass.com/... CDN URLs.
 *
 * This script is IDEMPOTENT: it checks whether an object already
 * exists in R2 before uploading (via HEAD request), and skips it
 * if found. Safe to re-run after partial failures.
 *
 * PREREQUISITES — run these commands ONCE before executing this script:
 * ─────────────────────────────────────────────────────────────────────
 *
 *  # 1. Create the R2 bucket
 *  npx wrangler r2 bucket create pieceofstass-images
 *
 *  # 2. Create the KV namespace for cart sessions (referenced in wrangler.toml)
 *  npx wrangler kv:namespace create CART_KV
 *  # → note the returned id, paste into wrangler.toml [env.production].kv_namespaces
 *
 *  # 3. Enable custom domain cdn.pieceofstass.com on the bucket
 *  #    Cloudflare Dashboard → R2 → pieceofstass-images → Settings → Custom Domains
 *  #    → Connect Domain → cdn.pieceofstass.com
 *  #    (This automatically creates the CNAME in Cloudflare DNS.)
 *
 *  # 4. Authenticate wrangler (already done if CLOUDFLARE_API_TOKEN is set)
 *  #    export CLOUDFLARE_API_TOKEN=<your-token>
 *  #    npx wrangler whoami
 *
 * USAGE:
 *   node scripts/rehost-images-to-r2.mjs [--dry-run] [--concurrency 5]
 *
 *   --dry-run        Print what would be uploaded; do NOT write to R2 or disk.
 *   --concurrency N  Max parallel uploads (default: 4).
 *
 * OUTPUT:
 *   /data/products.r2.json  — clone of products.json with all image
 *                             URLs replaced by cdn.pieceofstass.com paths.
 *
 * ─────────────────────────────────────────────────────────────
 * NOTE: Do NOT run this script without valid CLOUDFLARE_API_TOKEN
 * and CLOUDFLARE_ACCOUNT_ID environment variables set. It will
 * throw an auth error immediately.
 * ─────────────────────────────────────────────────────────────
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Configuration ────────────────────────────────────────────
const R2_BUCKET_NAME = 'pieceofstass-images';
const CDN_BASE_URL   = 'https://cdn.pieceofstass.com';
const KEY_PREFIX     = 'products';
const IMAGE_EXT      = '.jpg';  // normalise all images to .jpg

// Cloudflare credentials — must be set as env vars before running
const CF_ACCOUNT_ID  = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN   = process.env.CLOUDFLARE_API_TOKEN;

// ─── CLI Flags ────────────────────────────────────────────────
const args        = process.argv.slice(2);
const DRY_RUN     = args.includes('--dry-run');
const concIdx     = args.indexOf('--concurrency');
const CONCURRENCY = concIdx !== -1 ? parseInt(args[concIdx + 1], 10) : 4;

// ─── Cloudflare R2 REST API helpers ───────────────────────────
// The R2 S3-compatible API requires AWS-style auth.
// We use the Cloudflare R2 HTTP API directly via fetch (no SDK needed).
//
// R2 API base: https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets/{bucket}/objects
// HEAD checks existence; PUT uploads.

const R2_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects`;

/**
 * Check whether an object exists in R2 without downloading it.
 * Returns true if the object exists (HTTP 200), false if not (HTTP 404).
 * Throws on unexpected errors.
 */
async function r2Exists(key) {
  const url = `${R2_API_BASE}/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
  });
  if (res.status === 200) return true;
  if (res.status === 404) return false;
  throw new Error(`R2 HEAD ${key} → unexpected status ${res.status}`);
}

/**
 * Upload a Buffer to R2 with the given object key.
 * Content-Type is forced to image/jpeg for all images.
 */
async function r2Upload(key, buffer, contentType = 'image/jpeg') {
  const url = `${R2_API_BASE}/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      'Content-Type': contentType,
      'Content-Length': String(buffer.byteLength),
      // Cache-Control: immutable since keys are deterministic; content never changes.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    body: buffer,
    // Node 18+: fetch supports body as ArrayBuffer/Buffer
    duplex: 'half',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 PUT ${key} → ${res.status}: ${text}`);
  }
  return true;
}

/**
 * Download an image from a URL and return it as a Buffer.
 * Follows redirects (fetch does this by default).
 * Throws if HTTP status is not 2xx.
 */
async function downloadImage(url) {
  const res = await fetch(url, {
    headers: {
      // Yupoo returns some images only with a browser-like UA
      'User-Agent': 'Mozilla/5.0 (compatible; PieceOfStassBot/1.0)',
      Accept: 'image/webp,image/jpeg,image/*,*/*;q=0.8',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`Download ${url} → HTTP ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Build a deterministic R2 object key for a product image.
 *
 * Key format: products/{handle}/{index}.jpg
 * Examples:
 *   products/white-cement-high-top-court-sneaker/0.jpg
 *   products/white-cement-high-top-court-sneaker/1.jpg
 */
function buildR2Key(handle, index) {
  return `${KEY_PREFIX}/${handle}/${index}${IMAGE_EXT}`;
}

/**
 * Build the CDN URL from an R2 key.
 */
function buildCdnUrl(key) {
  return `${CDN_BASE_URL}/${key}`;
}

// ─── Concurrency limiter ──────────────────────────────────────
/**
 * Run async tasks with a max-concurrency limit.
 * @param {Array<() => Promise<any>>} tasks
 * @param {number} limit
 */
async function runWithConcurrency(tasks, limit) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = Promise.resolve().then(task).then((r) => {
      executing.delete(p);
      return r;
    });
    executing.add(p);
    results.push(p);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log(`\n┌─ Piece of Stass — R2 Image Rehosting Script`);
  console.log(`│  Bucket:      ${R2_BUCKET_NAME}`);
  console.log(`│  CDN base:    ${CDN_BASE_URL}`);
  console.log(`│  Concurrency: ${CONCURRENCY}`);
  console.log(`│  Dry run:     ${DRY_RUN}`);
  console.log(`└─────────────────────────────────────────────\n`);

  if (!DRY_RUN) {
    if (!CF_ACCOUNT_ID) throw new Error('CLOUDFLARE_ACCOUNT_ID env var is not set.');
    if (!CF_API_TOKEN)  throw new Error('CLOUDFLARE_API_TOKEN env var is not set.');
  }

  // Load products.json — supports both { products: [...] } wrapper and plain array
  const productsPath = join(ROOT, 'data', 'products.json');
  const raw = JSON.parse(await readFile(productsPath, 'utf-8'));
  const products = Array.isArray(raw) ? raw : (raw.products ?? []);

  if (products.length === 0) {
    console.warn('⚠  No products found in products.json. Nothing to do.');
    process.exit(0);
  }

  console.log(`Loaded ${products.length} product(s) from data/products.json\n`);

  // Build task list: one task per (product, imageIndex) pair
  const tasks = [];
  const r2Mappings = new Map(); // originalUrl → r2Key

  for (const product of products) {
    const handle = product.handle;
    const images = product.images ?? [];
    for (let i = 0; i < images.length; i++) {
      const originalUrl = images[i];
      const key = buildR2Key(handle, i);
      r2Mappings.set(originalUrl, key);

      tasks.push(async () => {
        const cdnUrl = buildCdnUrl(key);
        const tag = `[${handle}/${i}]`;

        if (DRY_RUN) {
          console.log(`  DRY  ${tag}  ${originalUrl}  →  ${cdnUrl}`);
          return { originalUrl, cdnUrl, status: 'dry-run' };
        }

        // Idempotency check: skip if already in R2
        let exists = false;
        try {
          exists = await r2Exists(key);
        } catch (err) {
          console.warn(`  WARN ${tag} exists-check failed (${err.message}); will re-upload.`);
        }

        if (exists) {
          console.log(`  SKIP ${tag}  already in R2 → ${cdnUrl}`);
          return { originalUrl, cdnUrl, status: 'skipped' };
        }

        // Download source image
        let buffer;
        try {
          buffer = await downloadImage(originalUrl);
        } catch (err) {
          console.error(`  FAIL ${tag}  download error: ${err.message}`);
          return { originalUrl, cdnUrl, status: 'error', error: err.message };
        }

        // Upload to R2
        try {
          await r2Upload(key, buffer);
          console.log(`  DONE ${tag}  ${(buffer.byteLength / 1024).toFixed(1)} KB  →  ${cdnUrl}`);
          return { originalUrl, cdnUrl, status: 'uploaded' };
        } catch (err) {
          console.error(`  FAIL ${tag}  upload error: ${err.message}`);
          return { originalUrl, cdnUrl, status: 'error', error: err.message };
        }
      });
    }
  }

  // Run all tasks with concurrency limit
  const results = await runWithConcurrency(tasks, CONCURRENCY);

  // Summary
  const uploaded = results.filter((r) => r.status === 'uploaded').length;
  const skipped  = results.filter((r) => r.status === 'skipped').length;
  const errors   = results.filter((r) => r.status === 'error');

  console.log(`\n┌─ Summary`);
  console.log(`│  Total images: ${tasks.length}`);
  console.log(`│  Uploaded:     ${uploaded}`);
  console.log(`│  Skipped:      ${skipped}`);
  console.log(`│  Errors:       ${errors.length}`);
  if (errors.length > 0) {
    console.log(`│`);
    console.log(`│  Failed images:`);
    for (const e of errors) {
      console.log(`│    ${e.originalUrl}  (${e.error})`);
    }
  }
  console.log(`└─────────────────────────────────────────────\n`);

  if (DRY_RUN) {
    console.log('Dry-run complete. No files written.\n');
    return;
  }

  if (errors.length === tasks.length) {
    console.error('All uploads failed. products.r2.json NOT written.');
    process.exit(1);
  }

  // Build URL replacement map from results
  const urlMap = new Map(results.map((r) => [r.originalUrl, r.cdnUrl]));

  // Deep-clone products and replace image URLs
  const productsR2 = JSON.parse(JSON.stringify(products)).map((product) => ({
    ...product,
    images: (product.images ?? []).map((url) => urlMap.get(url) ?? url),
  }));

  // Write products.r2.json
  const outputPath = join(ROOT, 'data', 'products.r2.json');
  const output = Array.isArray(raw)
    ? productsR2
    : { ...raw, products: productsR2 };

  await writeFile(outputPath, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`✓ Wrote data/products.r2.json (${tasks.length - errors.length} image(s) rehosted)\n`);

  if (errors.length > 0) {
    console.warn(`⚠  ${errors.length} image(s) failed and retain their original URLs in products.r2.json.`);
    console.warn('   Re-run this script to retry failed uploads.\n');
    process.exit(2); // partial success — non-zero exit so CI can flag it
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
