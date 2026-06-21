globalThis.process ??= {}; globalThis.process.env ??= {};
import { j as jsxRuntimeExports } from './store_C5mL8FT6.mjs';
import { a as reactExports } from './_@astro-renderers_DtL-lId1.mjs';
import { P as ProductCard } from './ProductCard_CATYbnRf.mjs';

function PLPFilters({ products, categoryTitle }) {
  const [sort, setSort] = reactExports.useState("featured");
  const [filterDrawerOpen, setFilterDrawerOpen] = reactExports.useState(false);
  const [priceMax, setPriceMax] = reactExports.useState(null);
  const [visibleCount, setVisibleCount] = reactExports.useState(24);
  Math.max(...products.map((p) => p.price));
  const filtered = products.filter((p) => {
    if (priceMax !== null && p.price > priceMax) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "newest") return b.id.localeCompare(a.id);
    return 0;
  });
  const visible = sorted.slice(0, visibleCount);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "12px 0",
          borderBottom: "1px solid var(--color-slate)",
          marginBottom: "24px",
          position: "sticky",
          top: "100px",
          background: "var(--color-ink)",
          zIndex: 10
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setFilterDrawerOpen(true),
                "data-testid": "button-filters",
                style: { display: "flex", alignItems: "center", gap: "6px", background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "999px", padding: "8px 14px", color: "var(--color-paper)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-family-sans)" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z" }) }),
                  "Filters",
                  priceMax !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "var(--color-lime)", color: "var(--color-ink)", borderRadius: "999px", padding: "0 5px", fontSize: "10px", fontWeight: 700 }, children: "1" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-family-mono)" }, children: [
              filtered.length,
              " items"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: sort,
              onChange: (e) => setSort(e.target.value),
              "data-testid": "select-sort",
              style: { background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "999px", padding: "8px 14px", color: "var(--color-paper)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-family-sans)", outline: "none" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "featured", children: "Featured" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "newest", children: "Newest" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price-asc", children: "Price: low to high" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price-desc", children: "Price: high to low" })
              ]
            }
          )
        ]
      }
    ),
    priceMax !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setPriceMax(null),
        style: { display: "flex", alignItems: "center", gap: "4px", background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "999px", padding: "6px 12px", color: "var(--color-paper)", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-family-sans)" },
        children: [
          "Under $",
          priceMax,
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6 6 18M6 6l12 12" }) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px"
        },
        className: "product-grid",
        children: visible.map((product, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product, eager: i < 4 }, product.id))
      }
    ),
    visibleCount < sorted.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center", marginTop: "40px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setVisibleCount((n) => n + 24),
        "data-testid": "button-load-more",
        style: { background: "transparent", border: "1.5px solid var(--color-slate)", borderRadius: "999px", padding: "14px 32px", color: "var(--color-paper)", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-family-display)", transition: "border-color 150ms, color 150ms" },
        onMouseOver: (e) => {
          e.currentTarget.style.borderColor = "var(--color-lime)";
          e.currentTarget.style.color = "var(--color-lime)";
        },
        onMouseOut: (e) => {
          e.currentTarget.style.borderColor = "var(--color-slate)";
          e.currentTarget.style.color = "var(--color-paper)";
        },
        children: [
          "Load more (",
          sorted.length - visibleCount,
          " remaining)"
        ]
      }
    ) }),
    filterDrawerOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: () => setFilterDrawerOpen(false), style: { position: "fixed", inset: 0, background: "rgba(10,10,11,0.6)", zIndex: 300, backdropFilter: "blur(4px)" }, "aria-hidden": "true" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "aside",
        {
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Filter products",
          style: { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--color-charcoal)", zIndex: 400, borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0", padding: "24px", maxHeight: "70vh", overflowY: "auto", animation: "slideUp 300ms var(--ease-expo-out)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", margin: 0 }, children: "Filter" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilterDrawerOpen(false), "aria-label": "Close filters", style: { background: "none", border: "none", cursor: "pointer", color: "var(--color-paper)", padding: "4px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6 6 18M6 6l12 12" }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "24px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", fontFamily: "var(--font-family-mono)", letterSpacing: "0.08em", color: "var(--color-muted)", textTransform: "uppercase", marginBottom: "12px" }, children: "Max price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px" }, children: [50, 100, 150, 200, 300].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setPriceMax(priceMax === p ? null : p),
                  "aria-pressed": priceMax === p,
                  style: { padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontFamily: "var(--font-family-mono)", border: `1.5px solid ${priceMax === p ? "var(--color-lime)" : "var(--color-slate)"}`, background: priceMax === p ? "var(--color-lime)" : "transparent", color: priceMax === p ? "var(--color-ink)" : "var(--color-paper)", cursor: "pointer", transition: "all 150ms" },
                  children: [
                    "Under $",
                    p
                  ]
                },
                p
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "12px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setPriceMax(null);
                    setFilterDrawerOpen(false);
                  },
                  style: { flex: 1, background: "transparent", border: "1.5px solid var(--color-slate)", borderRadius: "999px", padding: "14px", color: "var(--color-paper)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-family-display)", fontSize: "14px" },
                  children: "Clear all"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setFilterDrawerOpen(false),
                  style: { flex: 2, background: "var(--color-lime)", border: "none", borderRadius: "999px", padding: "14px", color: "var(--color-ink)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-family-display)", fontSize: "14px" },
                  children: [
                    "View ",
                    filtered.length,
                    " items"
                  ]
                }
              )
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media (min-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 24px !important;
          }
        }
        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      ` })
  ] });
}

export { PLPFilters as P };
