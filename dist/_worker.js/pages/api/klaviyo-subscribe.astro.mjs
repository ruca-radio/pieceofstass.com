globalThis.process ??= {}; globalThis.process.env ??= {};
export { r as renderers } from '../../chunks/_@astro-renderers_DtL-lId1.mjs';

const POST = async ({ request }) => {
  const { email, phone, source = "website" } = await request.json().catch(() => ({}));
  if (!email && !phone) {
    return new Response(JSON.stringify({ error: "Email or phone required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  console.log("[klaviyo-subscribe] Stub:", { email, phone, source });
  return new Response(JSON.stringify({ success: true, subscribed: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
