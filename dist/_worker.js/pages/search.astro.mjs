globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_WCqRE2GV.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CtbDq2BL.mjs';
import { j as jsxRuntimeExports } from '../chunks/store_C5mL8FT6.mjs';
import { a as reactExports } from '../chunks/_@astro-renderers_DtL-lId1.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DtL-lId1.mjs';
import { P as ProductCard } from '../chunks/ProductCard_CATYbnRf.mjs';
import { s as searchProducts, a as allProducts } from '../chunks/products_hRpZN1wD.mjs';

function SearchResults({ initialQuery = "" }) {
  const [query, setQuery] = reactExports.useState(initialQuery);
  const [results, setResults] = reactExports.useState(
    initialQuery ? searchProducts(initialQuery) : []
  );
  reactExports.useEffect(() => {
    if (query.length >= 2) {
      setResults(searchProducts(query));
    } else if (query.length === 0) {
      setResults([]);
    }
  }, [query]);
  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      const url = new URL(window.location.href);
      url.searchParams.set("q", query);
      window.history.replaceState({}, "", url.toString());
    }
  };
  const trending = allProducts.slice(0, 8);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSearch, style: { marginBottom: "40px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "12px", background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "999px", padding: "0 20px", maxWidth: "640px", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "var(--color-muted)", strokeWidth: "2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m21 21-4.35-4.35" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "search",
          placeholder: "Search the stash...",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          "data-testid": "input-search-page",
          style: { flex: 1, background: "none", border: "none", outline: "none", color: "var(--color-paper)", fontSize: "16px", padding: "16px 0", fontFamily: "var(--font-family-sans)" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", style: { background: "var(--color-lime)", color: "var(--color-ink)", border: "none", borderRadius: "999px", padding: "10px 20px", fontWeight: 700, fontSize: "14px", cursor: "pointer", flexShrink: 0, fontFamily: "var(--font-family-display)" }, children: "Search" })
    ] }) }),
    query.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.01em", color: "var(--color-paper)", margin: "0 0 20px" }, children: "Trending picks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }, className: "search-grid", children: trending.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product }, product.id)) })
    ] }) : results.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "60px 0", color: "var(--color-muted)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontFamily: "var(--font-family-display)", fontSize: "20px", fontWeight: 600, color: "var(--color-paper)" }, children: [
        'Nothing found for "',
        query,
        '"'
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "14px", marginBottom: "24px" }, children: "Try a different term or browse categories." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }, children: ["sneakers", "bag", "watch", "fragrance", "tech"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQuery(t), style: { padding: "8px 16px", background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "999px", color: "var(--color-paper)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-family-sans)" }, children: t }, t)) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "13px", color: "var(--color-muted)", fontFamily: "var(--font-family-mono)", marginBottom: "24px" }, children: [
        results.length,
        ' results for "',
        query,
        '"'
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }, className: "search-grid", children: results.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product }, product.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media (min-width: 768px) {
          .search-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .search-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      ` })
  ] });
}

const $$Astro = createAstro("https://pieceofstass.com");
const $$Search = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Search;
  const query = Astro2.url.searchParams.get("q") || "";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": query ? `"${query}" \u2014 Search \u2014 Piece of Stass` : "Search \u2014 Piece of Stass", "description": "Search the stash. Find trend-driven footwear, bags, watches, fragrance, tech, and fits.", "noindex": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="max-width: 1280px; margin: 0 auto; padding: 40px 16px;"> <h1 style="font-family: var(--font-family-display); font-weight: 700; font-size: clamp(24px, 4vw, 38px); letter-spacing: -0.02em; margin: 0 0 32px; color: var(--color-paper);"> ${query ? `Results for "${query}"` : "Search the stash"} </h1> ${renderComponent($$result2, "SearchResultsIsland", SearchResults, { "initialQuery": query, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/SearchResults", "client:component-export": "default" })} </div> ` })}`;
}, "/home/user/workspace/pieceofstass.com/src/pages/search.astro", void 0);

const $$file = "/home/user/workspace/pieceofstass.com/src/pages/search.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Search,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
