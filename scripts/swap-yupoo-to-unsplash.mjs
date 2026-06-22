#!/usr/bin/env node
/**
 * Emergency hotfix: replace every Yupoo image URL in data/products.json
 * with a category-appropriate Unsplash photo URL.
 *
 * Why: Yupoo returns HTTP 567 to server-side requests and requires a yupoo.com
 * referer to serve hotlinked browsers — production is broken because of that.
 *
 * Strategy: each product gets a *deterministic* photo chosen from a curated
 * pool per category. Same product handle => same photo, every time. No
 * randomness, no flicker, no Wikipedia images, all royalty-free Unsplash.
 *
 * Run:
 *   node scripts/swap-yupoo-to-unsplash.mjs
 *
 * Then commit data/products.json and redeploy.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const FILE = new URL('../data/products.json', import.meta.url);

// Curated pool of Unsplash photo URLs by category. All use w=1200&q=80&fm=jpg
// which is the modern Unsplash CDN signature. Multiple shots per category so
// products don't all look identical on a PLP.
const POOL = {
  footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // red sneaker
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', // white sneaker
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519', // chunky white
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2', // running shoe
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa', // beige sneaker
    'https://images.unsplash.com/photo-1539185441755-769473a23570', // pink runners
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86', // hightop
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', // black runners
    'https://images.unsplash.com/photo-1517260739337-b0cd4b3d76e1', // ballet flat
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // loafers
    'https://images.unsplash.com/photo-1603487742131-4160ec999306', // mules
    'https://images.unsplash.com/photo-1564859228273-274232fdb516', // sandals
  ],
  watches: [
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d',
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    'https://images.unsplash.com/photo-1606293318240-78a2f1166c98', // rose-gold
    'https://images.unsplash.com/photo-1622434641406-a158123450f9',
    'https://images.unsplash.com/photo-1639037687665-37e8ad21d610',
    'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a',
    'https://images.unsplash.com/photo-1495856458515-0637185db551',
  ],
  bags: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e',
    'https://images.unsplash.com/photo-1564422170194-896b89110ef8',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
    'https://images.unsplash.com/photo-1601369487863-26d2c8c1c5bc',
    'https://images.unsplash.com/photo-1559563458-527698bf5295',
    'https://images.unsplash.com/photo-1547949003-9792a18a2601',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3',
    'https://images.unsplash.com/photo-1607778417141-2c9c6e144042',
    'https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3',
    'https://images.unsplash.com/photo-1610824352934-c10d87b700cc',
  ],
  women: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', // dress
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03',
    'https://images.unsplash.com/photo-1485231183945-fffde7cc051e',
    'https://images.unsplash.com/photo-1551803091-e20673f15770',
    'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
    'https://images.unsplash.com/photo-1600328759364-cc02b6cbeec3',
    'https://images.unsplash.com/photo-1612462766564-895ea3388d28',
    'https://images.unsplash.com/photo-1581338834647-b0fb40704e21',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae',
  ],
  men: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
    'https://images.unsplash.com/photo-1622445275576-721325763afe',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
    'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d',
    'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7',
    'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5',
  ],
  kids: [
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7',
    'https://images.unsplash.com/photo-1545558014-8692077e9b5c',
    'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4',
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8',
    'https://images.unsplash.com/photo-1503944168849-8bf86875b08c',
    'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5',
  ],
  fragrance: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539',
    'https://images.unsplash.com/photo-1587017539504-67cfbddac569',
    'https://images.unsplash.com/photo-1615634260167-c8cdede054de',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f',
    'https://images.unsplash.com/photo-1618329038681-f6a4e4571bf3',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d',
    'https://images.unsplash.com/photo-1574871786514-46e2bcbfe2b1',
  ],
  tech: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', // headphones
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb',
    'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00', // earbuds
    'https://images.unsplash.com/photo-1583394838336-acd977736f90',
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f',
    'https://images.unsplash.com/photo-1546027658-7aa750153465',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e',
    'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6',
  ],
  jewelry: [
    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
    'https://images.unsplash.com/photo-1620656798932-902a8c5eb46f',
  ],
  home: [
    'https://images.unsplash.com/photo-1602874801007-aa1f88abe14d', // candle
    'https://images.unsplash.com/photo-1602874801006-94fcb27c6c39', // candle
    'https://images.unsplash.com/photo-1606744824163-985d376605aa', // mirror
    'https://images.unsplash.com/photo-1567016432779-094069958ea5', // throw
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221', // home accent
    'https://images.unsplash.com/photo-1611078489935-0cb964de46d6',
  ],
};

const FALLBACK = POOL.women;
const PARAMS = '?auto=format&fit=crop&w=1200&q=80';

function pickFor(handle, category, index) {
  const pool = POOL[category] || FALLBACK;
  // Deterministic hash: same handle+index => same photo every run
  const hash = createHash('sha1').update(`${handle}|${index}`).digest('hex');
  const n = parseInt(hash.slice(0, 8), 16);
  return pool[n % pool.length] + PARAMS;
}

// ────────────────────────────────────────────────────────────────────
const data = JSON.parse(readFileSync(FILE, 'utf8'));
let swapped = 0,
  kept = 0,
  productsTouched = 0;

for (const product of data.products) {
  let productSwapped = false;
  product.images = product.images.map((url, i) => {
    if (url.includes('yupoo.com') || url.includes('alfred-internal') || url.includes('myqcloud.com')) {
      swapped += 1;
      productSwapped = true;
      return pickFor(product.handle, product.category, i);
    }
    kept += 1;
    return url;
  });
  if (productSwapped) productsTouched += 1;
}

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

console.log(`Done.`);
console.log(`  Swapped ${swapped} broken image URLs across ${productsTouched} products`);
console.log(`  Kept ${kept} existing (Unsplash) URLs untouched`);
console.log(`  Total products: ${data.products.length}`);
