globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_WCqRE2GV.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_D9r1jel8.mjs';
import { g as getTrendingProducts } from '../chunks/products_hRpZN1wD.mjs';
import { P as ProductCard } from '../chunks/ProductCard_CATYbnRf.mjs';
/* empty css                               */
export { r as renderers } from '../chunks/_@astro-renderers_DtL-lId1.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  const trending = getTrendingProducts(4);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Page not found \u2014 Piece of Stass", "description": "We couldn't find that page. But we found some great products.", "noindex": true, "data-astro-cid-zetdm5md": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="max-width: 1280px; margin: 0 auto; padding: 80px 16px; text-align: center;" data-astro-cid-zetdm5md> <p style="font-family: var(--font-family-mono); font-size: 64px; color: var(--color-lime); font-weight: 400; margin: 0 0 8px; line-height: 1;" data-astro-cid-zetdm5md>404</p> <h1 style="font-family: var(--font-family-display); font-weight: 700; font-size: 30px; letter-spacing: -0.02em; margin: 0 0 12px; color: var(--color-paper);" data-astro-cid-zetdm5md>Not in the stash</h1> <p style="color: var(--color-muted); font-size: 15px; max-width: 380px; margin: 0 auto 32px; line-height: 1.6;" data-astro-cid-zetdm5md>That page doesn't exist. But these finds do — and they're better anyway.</p> <a href="/shop" style="background: var(--color-lime); color: var(--color-ink); border-radius: 999px; padding: 14px 32px; font-family: var(--font-family-display); font-weight: 700; font-size: 15px; text-decoration: none; display: inline-block; margin-bottom: 64px;" data-astro-cid-zetdm5md>
Raid the stash
</a> <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 800px; margin: 0 auto;" class="four-oh-four-grid" data-astro-cid-zetdm5md> ${trending.map((p) => renderTemplate`${renderComponent($$result2, "ProductCard", ProductCard, { "product": p, "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/ProductCard", "client:component-export": "default", "data-astro-cid-zetdm5md": true })}`)} </div> </div> ` })} `;
}, "/home/user/workspace/pieceofstass.com/src/pages/404.astro", void 0);

const $$file = "/home/user/workspace/pieceofstass.com/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
