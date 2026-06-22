/**
 * social-card-audit.mjs
 *
 * Audits the built HTML files in dist/ for required social meta tags.
 * Outputs /docs/seo/social-card-audit.md with pass/fail per page type.
 *
 * Usage:
 *   node scripts/social-card-audit.mjs [--dist <path>]
 *
 * Checks:
 * - og:title, og:description, og:image, og:image:width, og:image:height,
 *   og:image:type, og:image:alt, og:url, og:type, og:site_name, og:locale
 * - twitter:card, twitter:site, twitter:creator, twitter:title,
 *   twitter:description, twitter:image, twitter:image:alt
 * - pinterest-rich-pin meta
 * - Product-specific (PDPs): product:price:amount, product:price:currency,
 *   product:availability, product:condition, product:brand
 * - canonical link
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ── Config ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const distIdx = args.indexOf('--dist');
const distDir = distIdx !== -1 ? resolve(args[distIdx + 1]) : resolve(projectRoot, 'dist');
const outPath = resolve(projectRoot, 'docs/seo/social-card-audit.md');

// ── Meta tag extractors ──────────────────────────────────────────────────────
function getMeta(html, property) {
  // property= (og/product/article)
  const m = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'));
  return m ? m[1] : null;
}

function getMetaName(html, name) {
  const m = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*name=["']${name}["']`, 'i'));
  return m ? m[1] : null;
}

function getCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  return m ? m[1] : null;
}

function hasTag(html, property) {
  return getMeta(html, property) !== null;
}

function hasNameTag(html, name) {
  return getMetaName(html, name) !== null;
}

// ── Page type detection ──────────────────────────────────────────────────────
function detectPageType(filePath) {
  const rel = relative(distDir, filePath).replace(/\\/g, '/');
  if (rel === 'index.html' || rel === '') return 'home';
  if (rel.startsWith('shop/') && rel.split('/').length === 4) return 'product'; // shop/cat/handle/index.html
  if (rel.startsWith('shop/') && rel.split('/').length === 3) return 'category'; // shop/cat/index.html
  if (rel.startsWith('shop/index.html') || rel === 'shop/index.html') return 'shop_all';
  if (rel.startsWith('about-anna')) return 'about';
  if (rel.startsWith('blog/') && rel.split('/').length >= 3) return 'blog_post';
  if (rel.startsWith('blog')) return 'blog_index';
  if (['privacy', 'terms', 'cookies', 'returns', 'shipping', 'acceptable-use'].some(p => rel.startsWith(p))) return 'legal';
  return 'other';
}

// ── Checks by page type ──────────────────────────────────────────────────────
const REQUIRED_OG_BASE = [
  'og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name', 'og:locale',
];
const REQUIRED_OG_IMAGE_ATTRS = [
  'og:image:width', 'og:image:height', 'og:image:type', 'og:image:alt',
];
const REQUIRED_TWITTER = [
  'twitter:card', 'twitter:site', 'twitter:creator', 'twitter:title',
  'twitter:description', 'twitter:image', 'twitter:image:alt',
];
const REQUIRED_PRODUCT = [
  'product:price:amount', 'product:price:currency', 'product:availability',
  'product:condition', 'product:brand',
];

function auditPage(html, pageType) {
  const results = [];

  const check = (label, pass, value = null) => {
    results.push({ label, pass, value });
  };

  // ── OG base ──
  for (const prop of REQUIRED_OG_BASE) {
    const val = getMeta(html, prop);
    check(prop, !!val, val?.slice(0, 80));
  }
  // ── OG image attributes ──
  for (const prop of REQUIRED_OG_IMAGE_ATTRS) {
    const val = getMeta(html, prop);
    check(prop, !!val, val);
  }

  // ── og:image dimensions ──
  const w = getMeta(html, 'og:image:width');
  const h = getMeta(html, 'og:image:height');
  if (w && h) {
    check('og:image dimensions 1200x630', w === '1200' && h === '630', `${w}x${h}`);
  }

  // ── Twitter ──
  for (const name of REQUIRED_TWITTER) {
    const val = getMetaName(html, name);
    check(name, !!val, val?.slice(0, 80));
  }

  // ── Pinterest ──
  const pinterest = getMetaName(html, 'pinterest-rich-pin');
  check('pinterest-rich-pin', !!pinterest, pinterest);

  // ── Canonical ──
  const canonical = getCanonical(html);
  check('canonical', !!canonical, canonical?.slice(0, 80));

  // ── Product-specific ──
  if (pageType === 'product') {
    for (const prop of REQUIRED_PRODUCT) {
      const val = getMeta(html, prop);
      check(prop, !!val, val);
    }
    const ogType = getMeta(html, 'og:type');
    check('og:type=product', ogType === 'product', ogType);
  }

  // ── Dynamic OG image URL ──
  const ogImage = getMeta(html, 'og:image');
  if (pageType === 'home') {
    check('og:image uses /api/og/home.png', !!ogImage?.includes('/api/og/'), ogImage);
  } else if (pageType === 'product') {
    check('og:image uses /api/og/product/', !!ogImage?.includes('/api/og/product/'), ogImage);
  } else if (pageType === 'category' || pageType === 'shop_all') {
    check('og:image uses /api/og/shop/', !!ogImage?.includes('/api/og/shop/'), ogImage);
  }

  // ── LinkedIn: title ≤ 70 chars ──
  const ogTitle = getMeta(html, 'og:title');
  if (ogTitle) {
    check('og:title ≤ 70 chars (LinkedIn)', ogTitle.length <= 70, `${ogTitle.length} chars`);
  }
  // ── LinkedIn: description ≤ 200 chars ──
  const ogDesc = getMeta(html, 'og:description');
  if (ogDesc) {
    check('og:description ≤ 200 chars (LinkedIn)', ogDesc.length <= 200, `${ogDesc.length} chars`);
  }

  return results;
}

// ── Recursive HTML file collector ────────────────────────────────────────────
function collectHtmlFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectHtmlFiles(full, out);
    } else if (entry.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log(`\n📋 Social Card Audit\n`);
console.log(`Dist dir: ${distDir}`);
console.log(`Output:   ${outPath}\n`);

if (!existsSync(distDir)) {
  console.error(`❌ dist/ directory not found at ${distDir}. Run 'npm run build' first.`);
  process.exit(1);
}

const files = collectHtmlFiles(distDir);
console.log(`Found ${files.length} HTML files\n`);

const pageResults = [];
let totalPass = 0;
let totalFail = 0;

for (const file of files) {
  const rel = relative(distDir, file).replace(/\\/g, '/');
  // Skip admin, account, checkout, api
  if (['admin/', 'account/', 'checkout', 'api/', 'cart'].some(skip => rel.startsWith(skip))) continue;

  const html = readFileSync(file, 'utf-8');
  const pageType = detectPageType(file);
  const checks = auditPage(html, pageType);

  const pass = checks.filter(c => c.pass).length;
  const fail = checks.filter(c => !c.pass).length;
  totalPass += pass;
  totalFail += fail;

  pageResults.push({ rel, pageType, pass, fail, checks });
  const icon = fail === 0 ? '✅' : fail <= 2 ? '⚠️ ' : '❌';
  console.log(`${icon} ${rel} [${pageType}] — ${pass}/${pass + fail} checks passed`);
  if (fail > 0) {
    checks.filter(c => !c.pass).forEach(c => console.log(`   ✗ ${c.label}`));
  }
}

// ── Generate markdown report ──────────────────────────────────────────────────
const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
const lines = [
  `# Social Card Audit`,
  ``,
  `Generated: ${now} UTC`,
  `Pages audited: ${pageResults.length}`,
  `Total checks: ${totalPass + totalFail} | Pass: ${totalPass} | Fail: ${totalFail}`,
  ``,
  `## Summary`,
  ``,
  `| Page | Type | Pass | Fail | Status |`,
  `|------|------|------|------|--------|`,
];

for (const { rel, pageType, pass, fail } of pageResults) {
  const status = fail === 0 ? '✅ PASS' : fail <= 2 ? '⚠️ WARN' : '❌ FAIL';
  lines.push(`| \`${rel}\` | ${pageType} | ${pass} | ${fail} | ${status} |`);
}

lines.push(``, `## Detail`, ``);

for (const { rel, pageType, checks } of pageResults) {
  const fail = checks.filter(c => !c.pass).length;
  lines.push(`### \`${rel}\` (${pageType})`);
  lines.push(``);
  for (const { label, pass, value } of checks) {
    const icon = pass ? '✅' : '❌';
    const valStr = value ? ` — \`${value}\`` : '';
    lines.push(`- ${icon} \`${label}\`${valStr}`);
  }
  if (fail === 0) {
    lines.push(``);
    lines.push(`All checks passed.`);
  }
  lines.push(``);
}

lines.push(`## Notes`, ``);
lines.push(`- Dynamic OG images (\`/api/og/*.png\`) are served by the Astro endpoint and not verifiable from static HTML alone.`);
lines.push(`- Pinterest Rich Pins are enabled via \`<meta name="pinterest-rich-pin" content="true">\`.`);
lines.push(`- All Twitter/X cards use \`summary_large_image\` with \`@pieceofstass\` site + creator.`);
lines.push(`- Product pages carry full Facebook/Pinterest product meta (\`product:price:amount\`, \`product:condition\`, etc.).`);
lines.push(`- LinkedIn title ≤ 70 chars, description ≤ 200 chars enforced in SEO.astro.`);
lines.push(`- iMessage/WhatsApp use the primary 1200x630 OG image (no square crop unless \`ogSquareImage\` is passed).`);
lines.push(``);

const md = lines.join('\n');

// Ensure output dir exists
import { mkdirSync } from 'fs';
mkdirSync(resolve(projectRoot, 'docs/seo'), { recursive: true });
writeFileSync(outPath, md);

console.log(`\n📄 Report saved to ${outPath}`);
console.log(`\n🏁 Total: ${totalPass} passed, ${totalFail} failed\n`);

if (totalFail > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
