import pplx_sdk, json, os

queries = [
    ("medusa_dropship_integrations", "Medusa.js dropship integrations 2025 Spocket Printful CJ API"),
    ("medusa_plugins", "Medusa.js plugins dropship supplier 2025 github"),
    ("watches_wholesale_legitimate", "legitimate fashion watches wholesale dropship US 2025"),
    ("kids_fashion_wholesale", "kids fashion wholesale dropship US 2025 no MOQ"),
    ("bags_fashion_wholesale", "women bags handbags fashion wholesale US dropship 2025"),
    ("tech_accessories_dropship", "tech accessories phone cases dropship US 2025 API"),
    ("yupoo_alternatives", "Yupoo alternatives legitimate dropship 2025"),
    ("tiktok_shop_safe_dropship", "TikTok shop approved dropship suppliers 2025"),
    ("meta_ads_safe_dropship", "Meta ads approved dropship suppliers fashion 2025"),
]

results = {}
for key, q in queries:
    hits = pplx_sdk.search.web(q, limit=4)
    results[key] = [{"url": h.url, "title": h.title, "snippet": getattr(h, "snippet", "")} for h in hits]

out = "/home/user/workspace/pieceofstass.com/research_batch4.json"
with open(out, "w") as f:
    json.dump(results, f, indent=2)
print("saved to", out)
