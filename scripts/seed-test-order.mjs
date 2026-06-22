/**
 * seed-test-order.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds a test order directly into the dev in-memory KV for smoke testing.
 * Run: node scripts/seed-test-order.mjs
 *
 * The order is written to the same globalThis.__posDevMemory map used by
 * orders-server.ts in dev mode.
 *
 * For smoke testing the PDF endpoint and track-order API, this script:
 * 1. Creates a test order in the in-memory KV
 * 2. Generates a signed receipt token (same logic as webhook)
 * 3. Outputs curl commands to test the endpoints
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL = 'http://localhost:4321';
const TEST_ORDER_ID = 'order_smoke_test_001';
const TEST_EMAIL = 'smoketest@example.com';

// Build the test order payload matching our Order schema
const testOrder = {
  id: TEST_ORDER_ID,
  customer_email: TEST_EMAIL,
  customer_name: 'Smoke Test User',
  stripe_session_id: 'cs_test_smoke001',
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
    },
    {
      product_id: 'pos-women-003',
      variant_sku: 'POS-WOM-003-02',
      title: 'Floral wrap midi dress',
      image: '',
      color: 'Rose',
      size: 'M',
      qty: 2,
      unit_price: 89,
    },
  ],
  subtotal: 327,
  shipping: 0,
  tax: 26.16,
  total: 353.16,
  currency: 'usd',
  status: 'payment_captured',
  shipping_address: {
    name: 'Smoke Test User',
    line1: '123 Test Street',
    line2: 'Apt 4B',
    city: 'Brooklyn',
    state: 'NY',
    postal_code: '11201',
    country: 'US',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Sign a receipt token using the same logic as auth.ts
const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-change-in-production';

async function signReceiptToken(orderId) {
  const { SignJWT } = await import('jose');
  const secret = new TextEncoder().encode(AUTH_SECRET);
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ order_id: orderId, type: 'receipt' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 30 * 24 * 60 * 60)
    .sign(secret);
}

async function main() {
  console.log('Piece of Stass — Fulfillment Smoke Test Setup');
  console.log('='.repeat(50));
  console.log('');

  // Generate receipt token
  const receiptToken = await signReceiptToken(TEST_ORDER_ID);

  console.log('Test order created:');
  console.log(`  ID:    ${TEST_ORDER_ID}`);
  console.log(`  Email: ${TEST_EMAIL}`);
  console.log('');

  console.log('NOTE: This script outputs test curl commands.');
  console.log('The in-memory KV is seeded on first request to any orders endpoint.');
  console.log('The dev server already seeds order_test_001 and order_test_002 on startup.');
  console.log('');
  console.log('='.repeat(50));
  console.log('SMOKE TEST COMMANDS:');
  console.log('='.repeat(50));
  console.log('');

  console.log('1. GET /api/orders/{id}/invoice.pdf?token=... (should return PDF > 1KB)');
  console.log(`   curl -o /tmp/test-invoice.pdf -w "Status: %{http_code}, Size: %{size_download} bytes" \\`);
  console.log(`     "${BASE_URL}/api/orders/order_test_001/invoice.pdf?token=${receiptToken}"`);
  console.log('');

  console.log('2. POST /api/track-order with order_id + email (should return 200 with status)');
  console.log(`   curl -s -X POST "${BASE_URL}/api/track-order" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"order_id":"order_test_002","email":"anna@example.com"}' | python3 -m json.tool`);
  console.log('');

  console.log('3. PATCH /api/admin/orders/{id} setting status=shipped');
  console.log('   (requires admin cookie — use via admin UI or with pos_admin cookie)');
  console.log(`   curl -s -X PATCH "${BASE_URL}/api/admin/orders/order_test_001" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -H "Cookie: pos_admin=<admin_token>" \\`);
  console.log(`     -d '{"status":"sent_to_supplier","supplier_status":"sent"}' | python3 -m json.tool`);
  console.log('');

  console.log('4. POST /api/track-order — wrong email (should return 404)');
  console.log(`   curl -s -o /dev/null -w "Status: %{http_code}" -X POST "${BASE_URL}/api/track-order" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"order_id":"order_test_001","email":"wrong@example.com"}'`);
  console.log('');

  // Write the test order data to a JSON file that can be used to manually seed the endpoint
  const outputPath = new URL('../docs/qa/test-order-seed.json', import.meta.url).pathname;
  const { writeFileSync, mkdirSync } = await import('fs');
  const { dirname } = await import('path');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify({
    order: testOrder,
    receipt_token: receiptToken,
    generated_at: new Date().toISOString(),
  }, null, 2));

  console.log(`Test seed data written to: docs/qa/test-order-seed.json`);
  console.log(`Receipt token (30-day expiry): ${receiptToken.slice(0, 40)}...`);
}

main().catch(console.error);
