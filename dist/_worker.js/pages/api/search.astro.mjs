globalThis.process ??= {}; globalThis.process.env ??= {};
import { s as searchProducts } from '../../chunks/products_hRpZN1wD.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DtL-lId1.mjs';

const GET = async ({ url }) => {
  const q = url.searchParams.get("q") || "";
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ results: [], query: q }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  const results = searchProducts(q).slice(0, limit).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    category: p.category,
    price: p.price,
    image: p.images[0],
    url: `/shop/${p.category}/${p.handle}`
  }));
  return new Response(JSON.stringify({ results, query: q, count: results.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
