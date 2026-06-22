"""
Catalog validation script — Piece of Stass catalog expansion
Checks:
1. JSON parses without errors
2. Total product count
3. No banned terms in titles, descriptions, tags
4. All prices end in .99
5. All compare_at_price 30-50% above price
6. All variant prices match product price (amount == price * 100)
7. All products have at least 2 variants
8. HEAD-check all image URLs (report unreachable, don't fail)
"""
import json
import re
import sys
import urllib.request
import urllib.error
from collections import Counter

PRODUCTS_PATH = "/home/user/workspace/pieceofstass.com/data/products.json"

# ─── 1. JSON parse ─────────────────────────────────────────────────────────────
try:
    with open(PRODUCTS_PATH) as f:
        data = json.load(f)
    products = data["products"]
    print(f"[PASS] JSON parses. Total products: {len(products)}")
except Exception as e:
    print(f"[FAIL] JSON parse error: {e}")
    sys.exit(1)

# ─── 2. Counts ─────────────────────────────────────────────────────────────────
cat_count = Counter(p["category"] for p in products)
print(f"\n[INFO] Category distribution:")
for cat, cnt in sorted(cat_count.items()):
    print(f"       {cat}: {cnt}")
print(f"       TOTAL: {len(products)}")

# ─── 3. Banned terms ───────────────────────────────────────────────────────────
BANNED = [
    r"\bNike\b", r"\bAdidas\b", r"\bLouis\s+Vuitton\b", r"\bLV\b",
    r"\bGucci\b", r"\bRolex\b", r"\bAudemars\s+Piguet\b", r"\bAP\b",
    r"\bApple\b", r"\bSamsung\b", r"\bJordan\b", r"\bAir\s+Jordan\b",
    r"\bYeezy\b", r"\bNew\s+Balance\b", r"\bPuma\b", r"\bConverse\b",
    r"\bVans\b", r"\bHoka\b", r"\bOn\s+Running\b", r"\bBirkenstock\b",
    r"\bDior\b", r"\bChanel\b", r"\bHermes\b", r"\bPrada\b", r"\bFendi\b",
    r"\bCeline\b", r"\bYSL\b", r"\bSaint\s+Laurent\b", r"\bBalenciaga\b",
    r"\bBurberry\b", r"\bBottega\s+Veneta\b", r"\bVersace\b",
    r"\bMichael\s+Kors\b", r"\bCoach\b", r"\bChloe\b", r"\bLoewe\b",
    r"\bValentino\b", r"\bArmani\b", r"\bTommy\s+Hilfiger\b",
    r"\bCalvin\s+Klein\b", r"\bSupreme\b", r"\bBape\b", r"\bMoncler\b",
    r"\bThe\s+North\s+Face\b", r"\bArc.teryx\b", r"\bFear\s+of\s+God\b",
    r"\bRalph\s+Lauren\b", r"\bMiu\s+Miu\b", r"\bGivenchy\b",
    r"\bChrome\s+Hearts\b", r"\bTom\s+Ford\b", r"\bDyson\b",
    r"\bSony\b", r"\bBeats\b", r"\bBose\b", r"\biPhone\b", r"\biPad\b",
    r"\bMacBook\b", r"\bAirPods\b", r"\bAir\s+Max\b", r"\bAir\s+Force\b",
    r"\bDunk\b", r"\bSamba\b", r"\bSubmariner\b", r"\bDaytona\b",
    r"\bDatjust\b", r"\bRoyal\s+Oak\b",
    # replica language
    r"\breplica\b", r"\breps?\b", r"\b1:1\b", r"\bAAA\b", r"\bdupe\b",
    r"\binspired\s+by\b", r"\bauthent\w+\b"
]
BANNED_RX = [re.compile(p, re.IGNORECASE) for p in BANNED]

def check_text(text: str) -> list:
    hits = []
    for rx in BANNED_RX:
        m = rx.search(text)
        if m:
            hits.append(m.group())
    return hits

ban_errors = []
for prod in products:
    for field in ["title", "description"]:
        val = prod.get(field, "")
        hits = check_text(val)
        if hits:
            ban_errors.append((prod["id"], field, hits))
    for tag in prod.get("tags", []):
        hits = check_text(tag)
        if hits:
            ban_errors.append((prod["id"], f"tag:{tag}", hits))

if ban_errors:
    print(f"\n[FAIL] Banned term violations ({len(ban_errors)}):")
    for pid, field, hits in ban_errors[:20]:
        print(f"       {pid} / {field}: {hits}")
else:
    print(f"\n[PASS] No banned terms found in any title, description, or tag.")

# ─── 4. Prices end in .99 ──────────────────────────────────────────────────────
bad_prices = [(p["id"], p["price"]) for p in products if not str(p["price"]).endswith(".99")]
bad_comp   = [(p["id"], p.get("compare_at_price")) for p in products if not str(p.get("compare_at_price","")).endswith(".99")]

if bad_prices:
    print(f"\n[FAIL] Prices not ending in .99: {bad_prices[:10]}")
else:
    print(f"[PASS] All {len(products)} product prices end in .99")

if bad_comp:
    print(f"[FAIL] compare_at_price not ending in .99: {bad_comp[:10]}")
else:
    print(f"[PASS] All {len(products)} compare_at_price values end in .99")

# ─── 5. compare_at_price 30-50% above price ───────────────────────────────────
bad_ratio = []
for prod in products:
    price = prod.get("price", 0)
    comp  = prod.get("compare_at_price", 0)
    if price > 0 and comp > 0:
        r = comp / price
        if r < 1.29 or r > 1.52:
            bad_ratio.append((prod["id"], price, comp, round(r, 3)))

if bad_ratio:
    print(f"\n[FAIL] compare_at ratio out of 30-50% band ({len(bad_ratio)} products):")
    for x in bad_ratio[:10]:
        print(f"       {x}")
else:
    print(f"[PASS] All compare_at ratios within 30–50% band")

# ─── 6. Variant price sync ────────────────────────────────────────────────────
variant_errors = []
for prod in products:
    expected_cents = round(prod["price"] * 100)
    for v in prod.get("variants", []):
        for vp in v.get("prices", []):
            if vp.get("amount") != expected_cents:
                variant_errors.append((prod["id"], v["sku"], vp.get("amount"), expected_cents))

if variant_errors:
    print(f"\n[WARN] Variant price mismatches ({len(variant_errors)}). First 10:")
    for e in variant_errors[:10]:
        print(f"       {e}")
else:
    print(f"[PASS] All variant prices match product price")

# ─── 7. Minimum 2 variants ────────────────────────────────────────────────────
few_variants = [(p["id"], len(p.get("variants",[]))) for p in products if len(p.get("variants",[])) < 2]
if few_variants:
    print(f"\n[WARN] Products with fewer than 2 variants ({len(few_variants)}): {few_variants[:10]}")
else:
    print(f"[PASS] All products have >= 2 variants")

# ─── 8. Image URL HEAD checks ─────────────────────────────────────────────────
print(f"\n[INFO] Checking image URLs (HEAD requests, timeout 5s)...")
unreachable = []
reachable   = 0
seen_urls   = set()

for prod in products:
    for url in prod.get("images", []):
        if url in seen_urls:
            continue
        seen_urls.add(url)
        try:
            req = urllib.request.Request(url, method="HEAD",
                                         headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status < 400:
                    reachable += 1
                else:
                    unreachable.append((prod["id"], url, resp.status))
        except Exception as ex:
            unreachable.append((prod["id"], url, str(ex)[:80]))

print(f"[INFO] Unique image URLs checked: {len(seen_urls)}")
print(f"[INFO] Reachable: {reachable}")
if unreachable:
    print(f"[WARN] Unreachable image URLs ({len(unreachable)}):")
    for pid, url, status in unreachable[:20]:
        print(f"       [{status}] {pid}")
        print(f"              {url}")
else:
    print(f"[PASS] All image URLs reachable")

# ─── Summary ──────────────────────────────────────────────────────────────────
print("\n─────────────────────────────────")
print("VALIDATION COMPLETE")
print(f"  Total products : {len(products)}")
print(f"  Banned-term    : {'PASS' if not ban_errors else 'FAIL'}")
print(f"  Prices .99     : {'PASS' if not bad_prices and not bad_comp else 'FAIL'}")
print(f"  compare_at     : {'PASS' if not bad_ratio else 'FAIL'}")
print(f"  Variants       : {'PASS' if not variant_errors else 'WARN'}")
print(f"  Images (HEAD)  : {f'WARN — {len(unreachable)} unreachable' if unreachable else 'PASS'}")
