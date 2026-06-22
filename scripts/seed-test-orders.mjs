/**
 * seed-test-orders.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds 5 test orders covering all statuses into the running dev server.
 * Requires the dev server to be running at BASE_URL.
 *
 * Usage:
 *   node scripts/seed-test-orders.mjs [--base-url http://localhost:4324]
 *
 * The script:
 *   1. Signs in to get an admin cookie
 *   2. POSTs each order via /api/admin/seed-test-order
 *   3. Verifies each order is readable via /api/admin/orders/:id
 *   4. Outputs a summary table
 *
 * NOTE: Dev server seeds these orders automatically via globalThis.__posDevMemory
 * in orders-server.ts on first request. This script is for explicit KV seeding
 * via the API endpoint (useful after a KV wipe or in wrangler dev mode).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const args = process.argv.slice(2);
const baseUrlArg = args.find((a) => a.startsWith('--base-url='))?.split('=')[1];
const BASE_URL = baseUrlArg || process.env.ADMIN_BASE_URL || 'http://localhost:4324';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'testpassword';

// ── Test orders covering all statuses ────────────────────────────────────────

const TEST_ORDERS = [
  {
    id: 'order_test_001',
    customer_email: 'jane@example.com',
    customer_name: 'Jane Smith',
    customer_phone: '+1-555-0100',
    stripe_session_id: 'cs_test_abc123',
    stripe_payment_intent_id: 'pi_test_abc123',
    items: [
      {
        product_id: 'pos-footwear-001-white-cement-high-top-court-sneaker',
        variant_sku: 'POS-FOO-001-01',
        title: 'White cement high-top court sneaker',
        image: 'https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg',
        color: 'White/Grey',
        size: 'EU 38',
        qty: 1,
        unit_price: 149,
        category: 'footwear',
        supplier_sku: 'CHEN-52AC704F-WG38',
      },
    ],
    subtotal: 149,
    shipping: 0,
    tax: 12,
    total: 161,
    currency: 'usd',
    status: 'payment_captured',  // Needs fulfillment — shows in attention card
    shipping_address: {
      name: 'Jane Smith',
      line1: '123 Main St',
      city: 'Brooklyn',
      state: 'NY',
      postal_code: '11201',
      country: 'US',
    },
    timeline: [
      {
        id: 'evt_001a',
        ts: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured via Stripe',
      },
    ],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },

  {
    id: 'order_test_002',
    customer_email: 'anna@example.com',
    customer_name: 'Anna T.',
    stripe_session_id: 'cs_test_def456',
    stripe_payment_intent_id: 'pi_test_def456',
    items: [
      {
        product_id: 'pos-women-003',
        variant_sku: 'POS-WOM-003-02',
        title: 'Floral wrap midi dress',
        image: 'https://photo.yupoo.com/ypd2023/abc/medium.jpeg',
        color: 'Rose',
        size: 'M',
        qty: 2,
        unit_price: 89,
        category: 'women',
        supplier_sku: 'YPD-ABC-R-M',
      },
    ],
    subtotal: 178,
    shipping: 0,
    tax: 14,
    total: 192,
    currency: 'usd',
    status: 'shipped',
    tracking_number: '1Z9999999999999999',
    shipping_carrier: 'UPS',
    shipping_address: {
      name: 'Anna T.',
      line1: '456 Park Ave',
      city: 'Manhattan',
      state: 'NY',
      postal_code: '10022',
      country: 'US',
    },
    timeline: [
      {
        id: 'evt_002a',
        ts: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured via Stripe',
      },
      {
        id: 'evt_002b',
        ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Marked as Sent to Supplier',
      },
      {
        id: 'evt_002c',
        ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Shipped — tracking 1Z9999999999999999 (UPS)',
        meta: { tracking_number: '1Z9999999999999999', carrier: 'UPS' },
      },
      {
        id: 'evt_002d',
        ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'email_sent',
        message: 'Shipping notification email sent to anna@example.com',
      },
    ],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    id: 'order_test_003',
    customer_email: 'mike@example.com',
    customer_name: 'Mike Chen',
    stripe_session_id: 'cs_test_ghi789',
    stripe_payment_intent_id: 'pi_test_ghi789',
    items: [
      {
        product_id: 'pos-bags-001',
        variant_sku: 'POS-BAG-001-01',
        title: 'Structured mini crossbody bag',
        image: 'https://photo.yupoo.com/3293950449/abc/medium.jpeg',
        color: 'Black',
        size: 'One Size',
        qty: 1,
        unit_price: 119,
        category: 'bags',
        supplier_sku: 'BAG-001-BLK',
      },
    ],
    subtotal: 119,
    shipping: 0,
    tax: 10,
    total: 129,
    currency: 'usd',
    status: 'sent_to_supplier',
    supplier_status: 'Confirmed',
    supplier_confirmed_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    shipping_address: {
      name: 'Mike Chen',
      line1: '789 Market St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'US',
    },
    timeline: [
      {
        id: 'evt_003a',
        ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured',
      },
      {
        id: 'evt_003b',
        ts: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'supplier',
        message: 'Sent to supplier — Bags Supplier 3293950449. Confirmed at ' +
          new Date(Date.now() - 25 * 60 * 60 * 1000).toLocaleString(),
      },
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
  },

  {
    id: 'order_test_004',
    customer_email: 'sarah@example.com',
    customer_name: 'Sarah Johnson',
    stripe_session_id: 'cs_test_jkl012',
    stripe_payment_intent_id: 'pi_test_jkl012',
    items: [
      {
        product_id: 'pos-men-005',
        variant_sku: 'POS-MEN-005-02',
        title: 'Premium cotton slim-fit polo',
        image: 'https://photo.yupoo.com/miao2017/abc/medium.jpeg',
        color: 'Navy',
        size: 'L',
        qty: 1,
        unit_price: 75,
        category: 'men',
        supplier_sku: 'MIAO-POLO-NVY-L',
      },
    ],
    subtotal: 75,
    shipping: 0,
    tax: 6,
    total: 81,
    currency: 'usd',
    status: 'delivered',
    tracking_number: 'USPS123456789',
    shipping_carrier: 'USPS',
    shipping_address: {
      name: 'Sarah Johnson',
      line1: '321 Oak Lane',
      city: 'Chicago',
      state: 'IL',
      postal_code: '60601',
      country: 'US',
    },
    timeline: [
      {
        id: 'evt_004a',
        ts: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured',
      },
      {
        id: 'evt_004b',
        ts: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Sent to supplier',
      },
      {
        id: 'evt_004c',
        ts: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Shipped — tracking USPS123456789 (USPS)',
      },
      {
        id: 'evt_004d',
        ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'status_change',
        message: 'Marked as Delivered',
      },
    ],
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    id: 'order_test_005',
    customer_email: 'james@example.com',
    customer_name: 'James Wu',
    stripe_session_id: 'cs_test_mno345',
    stripe_payment_intent_id: 'pi_test_mno345',
    items: [
      {
        product_id: 'pos-watches-002',
        variant_sku: 'POS-WAT-002-01',
        title: 'Minimalist field watch',
        image: 'https://photo.yupoo.com/117034687/abc/medium.jpeg',
        color: 'Silver/Black',
        size: '40mm',
        qty: 1,
        unit_price: 210,
        category: 'watches',
        supplier_sku: 'WAT-002-SB-40',
      },
    ],
    subtotal: 210,
    shipping: 0,
    tax: 17,
    total: 227,
    currency: 'usd',
    status: 'refunded',
    shipping_address: {
      name: 'James Wu',
      line1: '654 Pine St',
      city: 'Seattle',
      state: 'WA',
      postal_code: '98101',
      country: 'US',
    },
    refund: {
      stripe_refund_id: 're_test_xyz',
      amount: 227,
      reason: 'customer_request',
      partial: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    timeline: [
      {
        id: 'evt_005a',
        ts: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'status_change',
        message: 'Order placed — payment captured',
      },
      {
        id: 'evt_005b',
        ts: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'admin',
        type: 'refund',
        message: 'Full refund issued — $227.00 (customer_request). Stripe refund: re_test_xyz',
      },
      {
        id: 'evt_005c',
        ts: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        type: 'email_sent',
        message: 'Refund confirmation email sent to james@example.com',
      },
    ],
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function getAdminCookie() {
  const res = await fetch(`${BASE_URL}/api/admin/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sign-in failed (${res.status}): ${text}`);
  }
  const cookie = res.headers.get('set-cookie');
  if (!cookie) throw new Error('No cookie returned from sign-in');
  // Extract just the cookie value
  return cookie.split(';')[0];
}

async function seedOrder(order, cookie) {
  const res = await fetch(`${BASE_URL}/api/admin/seed-test-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
    body: JSON.stringify(order),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: text };
  }
  return { ok: true };
}

async function verifyOrder(orderId, cookie) {
  const res = await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
    headers: { 'Cookie': cookie },
  });
  if (!res.ok) return { ok: false, status: res.status };
  const data = await res.json();
  return { ok: true, status: data.status, total: data.total };
}

async function main() {
  console.log('Piece of Stass — Seed Test Orders');
  console.log('='.repeat(50));
  console.log(`Target: ${BASE_URL}`);
  console.log('');

  let cookie;
  try {
    console.log('Authenticating...');
    cookie = await getAdminCookie();
    console.log('✓ Admin authenticated\n');
  } catch (err) {
    console.error('✗ Auth failed:', err.message);
    console.error('  Is the dev server running? Try: npm run dev');
    process.exit(1);
  }

  const results = [];

  for (const order of TEST_ORDERS) {
    process.stdout.write(`Seeding ${order.id} (${order.status})... `);
    const seedResult = await seedOrder(order, cookie);
    if (!seedResult.ok) {
      // Endpoint may not accept custom order body; that's fine — dev memory seeds on startup
      console.log(`[note: seed endpoint returned ${seedResult.status} — order may already exist via dev memory]`);
    } else {
      console.log('seeded');
    }

    // Verify readability
    const verify = await verifyOrder(order.id, cookie).catch(() => ({ ok: false, error: 'fetch error' }));
    results.push({
      id: order.id,
      expected_status: order.status,
      seeded: seedResult.ok || seedResult.status === 409,
      readable: verify.ok,
      actual_status: verify.status ?? 'N/A',
      total: verify.total ?? order.total,
    });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('RESULTS');
  console.log('='.repeat(50));
  const rows = results.map((r) => ({
    id: r.id,
    expected: r.expected_status,
    readable: r.readable ? '✓' : '✗',
    status_match: r.actual_status === r.expected_status ? '✓' : `✗ (got ${r.actual_status})`,
    total: `$${r.total}`,
  }));

  // Print table
  console.log('\n ID              | Expected Status    | Readable | Status Match');
  console.log(' ────────────────────────────────────────────────────────────');
  for (const r of rows) {
    console.log(` ${r.id.padEnd(16)} | ${r.expected.padEnd(18)} | ${r.readable.padEnd(8)} | ${r.status_match}`);
  }

  const allReadable = results.every((r) => r.readable);
  console.log('\n' + (allReadable ? '✓ All orders readable' : '✗ Some orders not readable'));

  // Note about dev memory
  console.log('\nNOTE: In dev mode (globalThis.__posDevMemory), these orders are seeded');
  console.log('automatically in orders-server.ts on first request. This script verifies');
  console.log('they are readable via the admin API.\n');

  // Write seed manifest
  const outDir = new URL('../docs/qa/', import.meta.url).pathname;
  mkdirSync(outDir, { recursive: true });
  const manifest = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    orders: results,
  };
  writeFileSync(`${outDir}seed-manifest.json`, JSON.stringify(manifest, null, 2));
  console.log('Seed manifest written to docs/qa/seed-manifest.json');
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
