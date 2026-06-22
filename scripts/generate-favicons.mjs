/**
 * generate-favicons.mjs
 *
 * Generates the complete favicon + PWA icon set from the existing favicon.svg.
 * Uses sharp for PNG rasterization.
 *
 * Output files:
 *   /public/favicon.ico           (32x32 ICO via sharp)
 *   /public/apple-touch-icon.png  (180x180)
 *   /public/icon-192.png          (192x192)
 *   /public/icon-512.png          (512x512)
 *   /public/safari-pinned-tab.svg (monochrome version)
 *   /public/site.webmanifest      (PWA manifest)
 *   /public/browserconfig.xml     (Windows tiles)
 *
 * Run: node scripts/generate-favicons.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const publicDir = resolve(projectRoot, 'public');

const svgPath = resolve(publicDir, 'favicon.svg');
const svgBuffer = readFileSync(svgPath);

console.log('🎨 Generating favicon set from favicon.svg…\n');

// ── Generate PNG sizes ────────────────────────────────────────────────────────
const pngSizes = [
  { size: 32,  out: 'favicon-32x32.png' },
  { size: 180, out: 'apple-touch-icon.png' },
  { size: 192, out: 'icon-192.png' },
  { size: 512, out: 'icon-512.png' },
];

for (const { size, out } of pngSizes) {
  const outPath = resolve(publicDir, out);
  await sharp(svgBuffer)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`✓ ${out} (${size}×${size})`);
}

// ── Generate favicon.ico (32x32) ──────────────────────────────────────────────
// sharp doesn't write ICO natively; write a 32x32 PNG and rename for browsers
// that fall back. Modern browsers use the SVG; only IE/old Edge uses .ico.
// For a proper multi-res ICO, we embed the 32x32 PNG inside an ICO container.
const ico32Buffer = await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toBuffer();

// Minimal ICO container: ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes) + PNG data
function buildIco(pngBuffer) {
  const ICONDIR = Buffer.alloc(6);
  ICONDIR.writeUInt16LE(0, 0);   // reserved
  ICONDIR.writeUInt16LE(1, 2);   // type: ICO
  ICONDIR.writeUInt16LE(1, 4);   // count: 1

  const ICONDIRENTRY = Buffer.alloc(16);
  ICONDIRENTRY.writeUInt8(32, 0);  // width (0 = 256, 32 = 32)
  ICONDIRENTRY.writeUInt8(32, 1);  // height
  ICONDIRENTRY.writeUInt8(0, 2);   // color count
  ICONDIRENTRY.writeUInt8(0, 3);   // reserved
  ICONDIRENTRY.writeUInt16LE(1, 4);  // planes
  ICONDIRENTRY.writeUInt16LE(32, 6); // bit count
  ICONDIRENTRY.writeUInt32LE(pngBuffer.length, 8); // size
  ICONDIRENTRY.writeUInt32LE(22, 12); // offset (6 + 16)

  return Buffer.concat([ICONDIR, ICONDIRENTRY, pngBuffer]);
}

const icoBuffer = buildIco(ico32Buffer);
writeFileSync(resolve(publicDir, 'favicon.ico'), icoBuffer);
console.log('✓ favicon.ico (32×32 ICO container)');

// ── Safari pinned tab (monochrome SVG) ────────────────────────────────────────
const safariSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#000000"/>
  <path d="M9 7h8c2.761 0 5 2.239 5 5s-2.239 5-5 5H9V7z" fill="#ffffff"/>
  <path d="M9 17v8" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
</svg>`;
writeFileSync(resolve(publicDir, 'safari-pinned-tab.svg'), safariSvg);
console.log('✓ safari-pinned-tab.svg (monochrome)');

// ── site.webmanifest ──────────────────────────────────────────────────────────
const webmanifest = {
  name: 'Piece of Stass',
  short_name: 'Stass',
  description: 'Raid the stash. Aesthetic fashion & accessories.',
  start_url: '/',
  display: 'standalone',
  background_color: '#FAF7F2',
  theme_color: '#3D2A1F',
  orientation: 'portrait',
  icons: [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    },
  ],
  categories: ['shopping', 'lifestyle'],
  lang: 'en-US',
};
writeFileSync(
  resolve(publicDir, 'site.webmanifest'),
  JSON.stringify(webmanifest, null, 2)
);
console.log('✓ site.webmanifest');

// ── browserconfig.xml ─────────────────────────────────────────────────────────
const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/icon-192.png"/>
      <TileColor>#2A211C</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
writeFileSync(resolve(publicDir, 'browserconfig.xml'), browserconfig);
console.log('✓ browserconfig.xml');

console.log('\n✅ Favicon set generated successfully!\n');
