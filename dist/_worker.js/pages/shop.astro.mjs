globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_WCqRE2GV.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_D9r1jel8.mjs';
import { P as PLPFilters } from '../chunks/PLPFilters_DzjUtRCn.mjs';
import { a as allProducts, b as allCategories } from '../chunks/products_hRpZN1wD.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DtL-lId1.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pieceofstass.com" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://pieceofstass.com/shop" }
    ]
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All products",
    numberOfItems: allProducts.length,
    itemListElement: allProducts.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://pieceofstass.com/shop/${p.category}/${p.handle}`
    }))
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Shop all \u2014 Piece of Stass", "description": "The full stash. Trend-driven footwear, bags, watches, fragrance, tech, and fits \u2014 dropped daily, priced for impulse.", "jsonLd": [breadcrumbJsonLd, itemListJsonLd] }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="max-width: 1280px; margin: 0 auto; padding: 32px 16px;"> <!-- Breadcrumb --> <nav aria-label="Breadcrumb" style="margin-bottom: 24px;"> <ol style="list-style: none; padding: 0; margin: 0; display: flex; gap: 8px; font-size: 12px; color: var(--color-muted); font-family: var(--font-family-mono);"> <li><a href="/" style="color: var(--color-muted); text-decoration: none;">Home</a></li> <li aria-hidden="true" style="color: var(--color-slate);">/</li> <li aria-current="page" style="color: var(--color-paper);">Shop</li> </ol> </nav> <!-- Category quick-nav --> <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 24px; scrollbar-width: none;"> <a href="/shop" style="flex-shrink: 0; padding: 8px 16px; background: var(--color-lime); color: var(--color-ink); border-radius: 999px; font-size: 13px; font-weight: 700; text-decoration: none; font-family: var(--font-family-display);">All</a> ${allCategories.map((cat) => renderTemplate`<a${addAttribute(`/shop/${cat.slug}`, "href")} style="flex-shrink: 0; padding: 8px 16px; background: var(--color-charcoal); border: 1px solid var(--color-slate); color: var(--color-paper); border-radius: 999px; font-size: 13px; font-weight: 500; text-decoration: none; font-family: var(--font-family-display); white-space: nowrap;"> ${cat.title} </a>`)} </div> <div style="margin-bottom: 32px;"> <h1 style="font-family: var(--font-family-display); font-weight: 700; font-size: 38px; letter-spacing: -0.02em; margin: 0 0 8px; color: var(--color-paper);">Shop all</h1> <p style="color: var(--color-muted); font-size: 14px; margin: 0;">${allProducts.length} products in the stash</p> </div> ${renderComponent($$result2, "PLPFilters", PLPFilters, { "products": allProducts, "categoryTitle": "Shop all", "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/PLPFilters", "client:component-export": "default" })} </div> ` })}`;
}, "/home/user/workspace/pieceofstass.com/src/pages/shop/index.astro", void 0);

const $$file = "/home/user/workspace/pieceofstass.com/src/pages/shop/index.astro";
const $$url = "/shop";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
