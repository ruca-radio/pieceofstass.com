import pplx_sdk, json, os

queries = [
    ("trendsi", "Trendsi fashion dropship 2025 pricing API US warehouse shipping review"),
    ("faire", "Faire wholesale platform 2025 pricing brands MOQ shipping terms"),
    ("dropcommerce", "DropCommerce dropship 2025 pricing US suppliers API Shopify"),
    ("fashiongo", "FashionGo wholesale platform 2025 pricing MOQ LA fashion"),
    ("fashiongo_dropship", "FashionGo dropship program 2025 review"),
    ("orangeshine", "OrangeShine wholesale fashion 2025 pricing MOQ shipping"),
    ("bloom_wholesale", "Bloom Wholesale fashion 2025 pricing MOQ shipping review"),
    ("tasha_apparel", "Tasha Apparel wholesale dropship 2025 pricing shipping review"),
    ("lashowroom", "LAShowroom wholesale fashion dropship 2025 pricing review"),
]

results = {}
for key, q in queries:
    hits = pplx_sdk.search.web(q, limit=4)
    results[key] = [{"url": h.url, "title": h.title, "snippet": getattr(h, "snippet", "")} for h in hits]

out = "/home/user/workspace/pieceofstass.com/research_batch2.json"
with open(out, "w") as f:
    json.dump(results, f, indent=2)
print("saved to", out)
