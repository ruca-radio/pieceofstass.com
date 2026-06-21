import pplx_sdk, json, os

queries = [
    ("printful", "Printful print on demand 2025 pricing plans API Medusa Shopify fulfillment time"),
    ("printify", "Printify print on demand 2025 pricing API Medusa Shopify fulfillment time"),
    ("gelato", "Gelato print on demand 2025 pricing API Shopify fulfillment time global network"),
    ("blanka", "Blanka private label beauty cosmetics 2025 pricing MOQ dropship"),
    ("supliful", "Supliful private label supplements fragrance 2025 pricing dropship review"),
    ("supliful_fragrance", "Supliful fragrance private label perfume 2025"),
    ("brandsdistribution", "Brandsdistribution fashion tech accessories 2025 pricing API review"),
    ("fragrance_wholesale", "wholesale generic fragrance dupes private label US 2025 no trademark"),
    ("fashion_watches_wholesale", "fashion watches wholesale US dropship 2025 no brand trademark"),
]

results = {}
for key, q in queries:
    hits = pplx_sdk.search.web(q, limit=4)
    results[key] = [{"url": h.url, "title": h.title, "snippet": getattr(h, "snippet", "")} for h in hits]

out = "/home/user/workspace/pieceofstass.com/research_batch3.json"
with open(out, "w") as f:
    json.dump(results, f, indent=2)
print("saved to", out)
