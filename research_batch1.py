import pplx_sdk, json, os

queries = [
    ("spocket_dropship", "Spocket dropship 2025 pricing plans API integration shipping times US warehouse"),
    ("cjdropshipping", "CJDropshipping 2025 pricing API Medusa Shopify shipping times US warehouse"),
    ("doba_dropship", "Doba dropship platform 2025 pricing API integration review"),
    ("modalyst", "Modalyst dropship 2025 pricing API Shopify integration US suppliers"),
    ("syncee", "Syncee dropship 2025 pricing plans API Shopify Medusa suppliers"),
    ("zendrop", "Zendrop dropship 2025 pricing plans US warehouse shipping times"),
    ("appscenic", "AppScenic dropship 2025 pricing API US warehouse review"),
    ("inventory_source", "Inventory Source dropship 2025 pricing API integration"),
    ("dsers", "DSers dropship 2025 pricing AliExpress API Shopify review"),
]

results = {}
for key, q in queries:
    hits = pplx_sdk.search.web(q, limit=4)
    results[key] = [{"url": h.url, "title": h.title, "snippet": getattr(h, "snippet", "")} for h in hits]

out = "/home/user/workspace/pieceofstass.com/research_batch1.json"
with open(out, "w") as f:
    json.dump(results, f, indent=2)
print("saved to", out)
