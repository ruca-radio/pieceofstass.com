globalThis.process ??= {}; globalThis.process.env ??= {};
import { a as allProducts } from '../chunks/products_hRpZN1wD.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DtL-lId1.mjs';

const GET = async ({ site }) => {
  const siteUrl = site?.toString() || "https://pieceofstass.com";
  const items = allProducts.slice(0, 20).map((p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${siteUrl}/shop/${p.category}/${p.handle}</link>
      <guid isPermaLink="true">${siteUrl}/shop/${p.category}/${p.handle}</guid>
      <description><![CDATA[${p.description}]]></description>
      <category>${p.category}</category>
      <g:price>${p.price} USD</g:price>
      <g:image_link>${p.images[0]}</g:image_link>
    </item>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Piece of Stass — New Arrivals</title>
    <link>${siteUrl}</link>
    <description>Raid the stash. The look for less, dropped daily.</description>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <image>
      <url>${siteUrl}/favicon.svg</url>
      <title>Piece of Stass</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
