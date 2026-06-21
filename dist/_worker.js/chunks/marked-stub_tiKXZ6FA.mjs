globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, n as renderSlot } from './astro/server_WCqRE2GV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_D9r1jel8.mjs';
/* empty css                                  */

const $$Astro = createAstro("https://pieceofstass.com");
const $$LegalLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$LegalLayout;
  const { title, description, lastUpdated } = Astro2.props;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pieceofstass.com" },
      { "@type": "ListItem", position: 2, name: title, item: `https://pieceofstass.com${Astro2.url.pathname}` }
    ]
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${title} \u2014 Piece of Stass`, "description": description, "jsonLd": [breadcrumbJsonLd], "data-astro-cid-dpidqgiz": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="max-width: 720px; margin: 0 auto; padding: 48px 16px 80px;" data-astro-cid-dpidqgiz> <nav aria-label="Breadcrumb" style="margin-bottom: 32px;" data-astro-cid-dpidqgiz> <ol style="list-style: none; padding: 0; margin: 0; display: flex; gap: 8px; font-size: 12px; color: var(--color-muted); font-family: var(--font-family-mono);" data-astro-cid-dpidqgiz> <li data-astro-cid-dpidqgiz><a href="/" style="color: var(--color-muted); text-decoration: none;" data-astro-cid-dpidqgiz>Home</a></li> <li aria-hidden="true" style="color: var(--color-slate);" data-astro-cid-dpidqgiz>/</li> <li aria-current="page" style="color: var(--color-paper);" data-astro-cid-dpidqgiz>${title}</li> </ol> </nav> <header style="margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid var(--color-slate);" data-astro-cid-dpidqgiz> <h1 style="font-family: var(--font-family-display); font-weight: 700; font-size: clamp(30px, 5vw, 48px); letter-spacing: -0.02em; margin: 0 0 12px; color: var(--color-paper);" data-astro-cid-dpidqgiz>${title}</h1> ${lastUpdated && renderTemplate`<p style="font-family: var(--font-family-mono); font-size: 12px; color: var(--color-muted); margin: 0;" data-astro-cid-dpidqgiz>
Last updated: ${lastUpdated} </p>`} </header> <div class="legal-body" data-astro-cid-dpidqgiz> ${renderSlot($$result2, $$slots["default"])} </div> </div> ` })} `;
}, "/home/user/workspace/pieceofstass.com/src/layouts/LegalLayout.astro", void 0);

function marked(text) {
  return text.replace(/^---[\s\S]*?---\n?/, "").replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>").replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^#### (.+)$/gm, "<h4>$1</h4>").replace(/^---$/gm, "<hr/>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/^[-*] (.+)$/gm, "<li>$1</li>").replace(/(<li>[\s\S]+?<\/li>)(?!\s*<li>)/g, "<ul>$&</ul>").replace(/^\d+\. (.+)$/gm, "<li>$1</li>").replace(/^(?!<[a-z])(.{1,})$/gm, "<p>$1</p>").replace(/<p>(<h[1-6]>)/g, "$1").replace(/(<\/h[1-6]>)<\/p>/g, "$1").replace(/<p>(<ul>)/g, "$1").replace(/(<\/ul>)<\/p>/g, "$1").replace(/<p>(<li>)/g, "$1").replace(/(<\/li>)<\/p>/g, "$1").replace(/<p>(<hr\/>)/g, "$1").replace(/(<hr\/>)<\/p>/g, "$1").replace(/<p>(<blockquote>)/g, "$1").replace(/(<\/blockquote>)<\/p>/g, "$1").replace(/<p>\s*<\/p>/g, "").trim();
}

export { $$LegalLayout as $, marked as m };
