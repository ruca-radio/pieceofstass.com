globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_WCqRE2GV.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_D9r1jel8.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DtL-lId1.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pieceofstass.com" },
      { "@type": "ListItem", position: 2, name: "The Edit", item: "https://pieceofstass.com/blog" }
    ]
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "The Edit \u2014 Blog \u2014 Piece of Stass", "description": "Style guides, trend reports, and curator notes from Anna L. Get the look, keep the change.", "jsonLd": [breadcrumbJsonLd] }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="max-width: 1280px; margin: 0 auto; padding: 64px 16px;"> <div style="text-align: center; max-width: 640px; margin: 0 auto 64px;"> <p style="font-family: var(--font-family-mono); font-size: 11px; letter-spacing: 0.12em; color: var(--color-lime); text-transform: uppercase; margin: 0 0 12px;">Curator's notes</p> <h1 style="font-family: var(--font-family-display); font-weight: 700; font-size: clamp(38px, 6vw, 64px); letter-spacing: -0.03em; margin: 0 0 16px; color: var(--color-paper);">The edit</h1> <p style="font-size: 16px; color: var(--color-muted);">Trend reports, style guides, and the occasional hot take. Written by someone with a real opinion.</p> </div> <!-- Coming soon state --> <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; border: 1px solid var(--color-slate); border-radius: var(--radius-2xl); background: var(--color-charcoal); text-align: center;"> <span style="font-size: 48px;">🔖</span> <h2 style="font-family: var(--font-family-display); font-weight: 700; font-size: 24px; margin: 0; color: var(--color-paper);">First drop coming soon</h2> <p style="color: var(--color-muted); font-size: 14px; max-width: 360px; margin: 0;">Anna's working on the first issue. Subscribe to the newsletter and you'll get it first.</p> <a href="/#newsletter" style="background: var(--color-lime); color: var(--color-ink); border-radius: 999px; padding: '12px 24px'; font-family: var(--font-family-display); font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px;">
Get early access
</a> </div> </div> ` })}`;
}, "/home/user/workspace/pieceofstass.com/src/pages/blog/index.astro", void 0);

const $$file = "/home/user/workspace/pieceofstass.com/src/pages/blog/index.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
