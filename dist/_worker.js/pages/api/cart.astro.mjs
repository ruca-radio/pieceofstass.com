globalThis.process ??= {}; globalThis.process.env ??= {};
export { r as renderers } from '../../chunks/_@astro-renderers_DtL-lId1.mjs';

const GET = async ({ request }) => {
  return new Response(JSON.stringify({ items: [], subtotal: 0 }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  return new Response(JSON.stringify({ success: true, item: body }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const DELETE = async ({ request }) => {
  await request.json().catch(() => ({}));
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
