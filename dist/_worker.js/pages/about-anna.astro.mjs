globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_WCqRE2GV.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CtbDq2BL.mjs';
import { P as ProductCard } from '../chunks/ProductCard_CATYbnRf.mjs';
import { a as allProducts } from '../chunks/products_hRpZN1wD.mjs';
/* empty css                                      */
export { r as renderers } from '../chunks/_@astro-renderers_DtL-lId1.mjs';

const $$AboutAnna = createComponent(($$result, $$props, $$slots) => {
  const favorites = allProducts.slice(0, 6);
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Anna L.",
    jobTitle: "Founder & Creative Director",
    worksFor: { "@type": "Organization", name: "Piece of Stass" }
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pieceofstass.com" },
      { "@type": "ListItem", position: 2, name: "About Anna", item: "https://pieceofstass.com/about-anna" }
    ]
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "About Anna \u2014 Piece of Stass", "description": "Meet Anna L., founder and curator of Piece of Stass. Taste, not the price tag.", "jsonLd": [personJsonLd, breadcrumbJsonLd], "data-astro-cid-yle7eieq": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<section style="padding: 80px 0; background: var(--color-ink); position: relative; overflow: hidden;" data-astro-cid-yle7eieq> <div style="position: absolute; top: 0; right: 0; width: 40%; height: 100%; background: radial-gradient(ellipse at 80% 50%, rgba(198,255,58,0.05) 0%, transparent 70%); pointer-events: none;" data-astro-cid-yle7eieq></div> <div style="max-width: 1280px; margin: 0 auto; padding: 0 16px; display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center;" class="about-hero" data-astro-cid-yle7eieq> <div data-astro-cid-yle7eieq> <p style="font-family: var(--font-family-mono); font-size: 11px; letter-spacing: 0.12em; color: var(--color-lime); text-transform: uppercase; margin: 0 0 16px;" data-astro-cid-yle7eieq>Founder's story</p> <h1 style="font-family: var(--font-family-display); font-weight: 700; font-size: clamp(38px, 6vw, 64px); line-height: 1.05; letter-spacing: -0.03em; color: var(--color-paper); margin: 0 0 24px;" data-astro-cid-yle7eieq>
Taste, not<br data-astro-cid-yle7eieq><span style="color: var(--color-lime);" data-astro-cid-yle7eieq>the price tag.</span> </h1> <p style="font-size: 18px; color: var(--color-muted); line-height: 1.7; max-width: 520px; margin: 0;" data-astro-cid-yle7eieq>
I started Piece of Stass because great style shouldn't be gatekept. The name says it all — stash plus sass. I've hoarded the good stuff so you don't have to dig.
</p> </div> <div style="background: var(--color-charcoal); border: 1px solid var(--color-slate); border-radius: var(--radius-2xl); aspect-ratio: 4/5; overflow: hidden; max-width: 400px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;" data-astro-cid-yle7eieq> <span style="font-size: 64px;" data-astro-cid-yle7eieq>🤌</span> <span style="font-family: var(--font-family-display); font-weight: 700; font-size: 20px; color: var(--color-paper);" data-astro-cid-yle7eieq>Anna L.</span> <span style="font-family: var(--font-family-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--color-muted);" data-astro-cid-yle7eieq>Founder & Creative Director</span> </div> </div> </section>  <section style="padding: 80px 0; border-top: 1px solid var(--color-charcoal);" data-astro-cid-yle7eieq> <div style="max-width: 720px; margin: 0 auto; padding: 0 16px;" data-astro-cid-yle7eieq> <h2 style="font-family: var(--font-family-display); font-weight: 700; font-size: 30px; letter-spacing: -0.02em; margin: 0 0 32px; color: var(--color-paper);" data-astro-cid-yle7eieq>Why I started this</h2> ${[
    "Piece of Stass started from one question I kept asking myself: why does looking expensive have to cost expensive? I kept seeing the same looks go viral \u2014 the chunky loafer moment, the iced-out tennis watch, the structured leather tote \u2014 and then the $800 price tags attached.",
    "I've spent years learning to spot the look underneath the logo. The silhouette. The finish. The vibe. And I realised that the best styling isn't about what brand you're wearing \u2014 it's about what you know.",
    "So I built a stash. A personal edit of the internet's best trend-driven finds, priced for the scroll. Every product passes through me before it lands here. If I wouldn't wear it, it doesn't make the stash.",
    "The name? Stash plus sass. We hoard the good stuff so you don't have to dig, and we have opinions about all of it. Confident, cheeky, and built to screenshot. This is the taste you've been looking for."
  ].map((para) => renderTemplate`<p style="font-size: 17px; color: var(--color-muted); line-height: 1.8; margin: 0 0 20px;" data-astro-cid-yle7eieq>${para}</p>`)} </div> </section>  <section style="padding: 80px 0; background: var(--color-charcoal); border-top: 1px solid var(--color-slate);" data-astro-cid-yle7eieq> <div style="max-width: 1280px; margin: 0 auto; padding: 0 16px;" data-astro-cid-yle7eieq> <h2 style="font-family: var(--font-family-display); font-weight: 700; font-size: 30px; letter-spacing: -0.02em; margin: 0 0 48px; color: var(--color-paper);" data-astro-cid-yle7eieq>What we stand for</h2> <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;" class="values-grid" data-astro-cid-yle7eieq> ${[
    { icon: "\u{1F3AF}", title: "Taste is the product", desc: "We don't sell everything. We sell the edit. Curation is the value we add." },
    { icon: "\u{1F513}", title: "Access over exclusivity", desc: "Good design shouldn't be gatekept behind a price tag. We democratize the look." },
    { icon: "\u26A1", title: "Move at the speed of the feed", desc: "Trends move in days, not seasons. We ship the moment, not the catalog." },
    { icon: "\u270B", title: "Honest hype", desc: "Confident, never deceptive. We sell the vibe, openly. The look for less \u2014 stated plainly." }
  ].map(({ icon, title, desc }) => renderTemplate`<div style="padding: 24px; background: var(--color-ink); border-radius: var(--radius-xl); border: 1px solid var(--color-slate);" data-astro-cid-yle7eieq> <span style="font-size: 28px; display: block; margin-bottom: 12px;" aria-hidden="true" data-astro-cid-yle7eieq>${icon}</span> <h3 style="font-family: var(--font-family-display); font-weight: 700; font-size: 18px; margin: 0 0 8px; color: var(--color-paper);" data-astro-cid-yle7eieq>${title}</h3> <p style="font-size: 14px; color: var(--color-muted); margin: 0; line-height: 1.6;" data-astro-cid-yle7eieq>${desc}</p> </div>`)} </div> </div> </section>  <section style="padding: 80px 0;" data-astro-cid-yle7eieq> <div style="max-width: 1280px; margin: 0 auto; padding: 0 16px;" data-astro-cid-yle7eieq> <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 32px;" data-astro-cid-yle7eieq> <div data-astro-cid-yle7eieq> <p style="font-family: var(--font-family-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--color-lime); text-transform: uppercase; margin: 0 0 6px;" data-astro-cid-yle7eieq>Anna's picks</p> <h2 style="font-family: var(--font-family-display); font-weight: 700; font-size: 30px; letter-spacing: -0.02em; margin: 0; color: var(--color-paper);" data-astro-cid-yle7eieq>My current favorites</h2> </div> <a href="/shop" style="font-size: 13px; font-weight: 600; color: var(--color-lime); text-decoration: none; font-family: var(--font-family-display);" data-astro-cid-yle7eieq>View all →</a> </div> <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;" class="favs-grid" data-astro-cid-yle7eieq> ${favorites.map((p) => renderTemplate`${renderComponent($$result2, "ProductCard", ProductCard, { "product": p, "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/ProductCard", "client:component-export": "default", "data-astro-cid-yle7eieq": true })}`)} </div> </div> </section> ` })} `;
}, "/home/user/workspace/pieceofstass.com/src/pages/about-anna.astro", void 0);

const $$file = "/home/user/workspace/pieceofstass.com/src/pages/about-anna.astro";
const $$url = "/about-anna";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$AboutAnna,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
