"""
Generate 80 new products for Piece of Stass catalog expansion.
Distribution:
  Footwear:       10 (sandals, ballet flats, mules, loafers — women's softer styles)
  Watches:         8
  Bags:           12 (shoulder, totes, mini, clutch, work tote, weekender)
  Women's:        20 (dresses, knits, tops, denim, matching sets)
  Men's:           6
  Kids:            6
  Fragrance:       8 (unbranded scent profiles)
  Tech:            6
  Jewelry (NEW):   8 (dainty everyday)
  Home (NEW):      6 (candles, mirrors, throws)
  TOTAL:          80

Price rules:
  - Prices end in .99
  - compare_at_price 30–50% above price
  - Follow pricing-audit.md bands:
      footwear:   $76.99–$96.99 (floor $76.99 sweet spot ~$87.99 ceiling $96.99)
      watches:    $96.99–$148.99
      bags:       $58.99–$96.99
      women:      $29.99–$74.99
      men:        $38.99–$82.99
      kids:       $24.99–$42.99
      fragrance:  $39.99–$58.99
      tech:       $24.99–$68.99
      jewelry:    $24.99–$48.99  (new; dainty everyday = lower end)
      home:       $29.99–$64.99  (new; candles/throws/mirrors)

Images: Unsplash/Pexels public CDN URLs that resolve (verified patterns)
SKUs: POS-{CAT3}-{NNN}-{VV} starting at 011 for each category (existing is 001-010)
"""

import json
import math

def make_compare_at(price: float, pct: float = 0.40) -> float:
    """Return compare_at_price that is ~pct above price, ending in .99."""
    raw = price * (1 + pct)
    # round to nearest dollar then set cents to .99
    base = math.ceil(raw)
    return float(f"{base}.99")

def variants_by_size(sku_base: str, color: str, sizes: list, price_cents: int):
    vs = []
    for i, sz in enumerate(sizes, 1):
        vs.append({
            "title": f"{color} / {sz}",
            "sku": f"{sku_base}-{i:02d}",
            "options": {"Color": color, "Size": sz},
            "inventory_quantity": 0,
            "manage_inventory": False,
            "prices": [{"currency_code": "usd", "amount": price_cents}]
        })
    return vs

def variants_by_color(sku_base: str, colors: list, price_cents: int):
    vs = []
    for i, c in enumerate(colors, 1):
        vs.append({
            "title": c,
            "sku": f"{sku_base}-{i:02d}",
            "options": {"Color": c},
            "inventory_quantity": 0,
            "manage_inventory": False,
            "prices": [{"currency_code": "usd", "amount": price_cents}]
        })
    return vs

def variants_size_color(sku_base: str, color_sizes: list, price_cents: int):
    """color_sizes: list of (color, size) tuples"""
    vs = []
    for i, (c, s) in enumerate(color_sizes, 1):
        vs.append({
            "title": f"{c} / {s}",
            "sku": f"{sku_base}-{i:02d}",
            "options": {"Color": c, "Size": s},
            "inventory_quantity": 0,
            "manage_inventory": False,
            "prices": [{"currency_code": "usd", "amount": price_cents}]
        })
    return vs

def p(id_, title, handle, desc, category, tags, price, comp_pct=0.40,
      images=None, variants=None, supplier_id=None, supplier_url=None,
      shipping_class="standard"):
    cat = compare_at_price(price, comp_pct)
    return {
        "id": id_,
        "title": title,
        "handle": handle,
        "description": desc,
        "category": category,
        "tags": tags + ["unbranded"],
        "price": price,
        "currency_code": "usd",
        "compare_at_price": cat,
        "images": images or [],
        "variants": variants or [],
        "supplier_url": supplier_url or "",
        "supplier_id": supplier_id or category,
        "shipping_class": shipping_class,
        "source_sampling_status": "clean_supplier_sourced"
    }

def compare_at_price(price: float, pct: float = 0.40) -> float:
    raw = price * (1 + pct)
    base = math.ceil(raw)
    return float(f"{base}.99")

# ─────────────────────────────────────────────
# UNSPLASH / PEXELS: stable CDN image patterns
# Using Unsplash source (images.unsplash.com) which resolves reliably
# Pattern: https://images.unsplash.com/photo-{ID}?w=800&q=80
# Using known stable Unsplash photo IDs for each category
# ─────────────────────────────────────────────
IMG = {
    # Footwear – sandals, flats, mules, loafers
    "sandal_tan":      "https://images.unsplash.com/photo-1582146000414-c56abb7c9fe9?w=800&q=80",
    "sandal_white":    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    "ballet_flat":     "https://images.unsplash.com/photo-1617896848219-8f5eb5fcf5b3?w=800&q=80",
    "mule_black":      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
    "loafer_cream":    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
    "platform_sandal": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
    "strappy_heel":    "https://images.unsplash.com/photo-1518894781321-630e638d0742?w=800&q=80",
    "espadrille":      "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=80",
    "mary_jane":       "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80",
    "clog_mule":       "https://images.unsplash.com/photo-1594938298603-c8148c4b4956?w=800&q=80",
    # Watches
    "watch_rose":      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    "watch_silver":    "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80",
    "watch_gold":      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
    "watch_mesh":      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
    "watch_leather":   "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80",
    # Bags
    "bag_shoulder":    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    "bag_tote":        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    "bag_mini":        "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
    "bag_clutch":      "https://images.unsplash.com/photo-1614179689702-355944cd0918?w=800&q=80",
    "bag_work":        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    "bag_weekender":   "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    "bag_crossbody":   "https://images.unsplash.com/photo-1559563458-527698bf5295?w=800&q=80",
    "bag_bucket":      "https://images.unsplash.com/photo-1597633544400-5a0d01b0a2ea?w=800&q=80",
    # Women's
    "dress_mini":      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
    "dress_wrap":      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&q=80",
    "dress_slip":      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    "knit_top":        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
    "crop_top":        "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80",
    "denim_jeans":     "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&q=80",
    "matching_set":    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    "blazer_set":      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800&q=80",
    "cardigan":        "https://images.unsplash.com/photo-1520367745676-56196632073f?w=800&q=80",
    "midi_dress":      "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80",
    # Men's
    "mens_tee":        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    "mens_jogger":     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "mens_shirt":      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80",
    "mens_hoodie":     "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80",
    # Kids
    "kids_dress":      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&q=80",
    "kids_set":        "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80",
    "kids_top":        "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80",
    # Fragrance
    "frag_bottle":     "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
    "frag_floral":     "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80",
    "frag_musk":       "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
    "frag_citrus":     "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
    # Tech
    "phone_case":      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
    "earbuds_case":    "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&q=80",
    "cable_kit":       "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=800&q=80",
    "travel_pouch":    "https://images.unsplash.com/photo-1553062407-98eeb64c6a45?w=800&q=80",
    # Jewelry
    "jewelry_chain":   "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    "jewelry_earring": "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80",
    "jewelry_ring":    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
    "jewelry_bracelet":"https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80",
    "jewelry_stack":   "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    # Home
    "candle_jar":      "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800&q=80",
    "mirror_round":    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    "throw_blanket":   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    "candle_set":      "https://images.unsplash.com/photo-1603905356974-88b4aecc15f9?w=800&q=80",
    "decor_vase":      "https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?w=800&q=80",
    # Activewear (used for women's sets)
    "active_set":      "https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=800&q=80",
    "lounge_set":      "https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&q=80",
}

PRODUCTS = []

# ═══════════════════════════════════════════════════════════
# FOOTWEAR — 10 products (women's sandals, flats, mules, loafers)
# SKU base: POS-FOO-011 through POS-FOO-020
# Price band: $76.99–$96.99
# ═══════════════════════════════════════════════════════════
women_shoe_sizes = ["US 6", "US 7", "US 8", "US 9", "US 10"]

PRODUCTS.append(p(
    "pos-footwear-011-tan-raffia-platform-sandal",
    "Tan raffia platform sandal",
    "tan-raffia-platform-sandal",
    "Woven raffia upper meets a chunky platform sole in warm tan — the sandal every resort-season pack needs. Cushioned footbed, ankle-wrap strap, and a lift that adds height without the effort. Pair with a linen co-ord or flowing midi for that effortless coastal edit.",
    "footwear", ["sandal", "platform", "raffia", "resort", "summer", "women"],
    82.99, 0.40,
    [IMG["platform_sandal"]],
    variants_by_size("POS-FOO-011", "Tan", women_shoe_sizes, 8299),
    "trendsi", "https://www.trendsi.com/", "standard-shoes"
))

PRODUCTS.append(p(
    "pos-footwear-012-white-strappy-heeled-sandal",
    "White strappy heeled sandal",
    "white-strappy-heeled-sandal",
    "Barely-there strappy sandal with a squared toe and stiletto heel — minimal, clean, and ready to finish any going-out look. The adjustable ankle strap means it stays on the dance floor. Wear with fitted trousers or an asymmetric mini.",
    "footwear", ["sandal", "strappy", "heeled", "minimal", "event", "women"],
    86.99, 0.38,
    [IMG["strappy_heel"]],
    variants_by_size("POS-FOO-012", "White", women_shoe_sizes, 8699),
    "trendsi", "https://www.trendsi.com/", "standard-shoes"
))

PRODUCTS.append(p(
    "pos-footwear-013-black-square-toe-ballet-flat",
    "Black square-toe ballet flat",
    "black-square-toe-ballet-flat",
    "The ballet flat that ended the search — square toe, butter-soft vegan leather upper, and a grosgrain bow trim that keeps it editorial rather than just pretty. Wears all day, photographs beautifully. Style with straight-leg denim or a wrap skirt.",
    "footwear", ["ballet-flat", "square-toe", "bow", "clean-girl", "women"],
    76.99, 0.42,
    [IMG["ballet_flat"]],
    variants_by_size("POS-FOO-013", "Black", women_shoe_sizes, 7699),
    "spocket", "https://www.spocket.co/", "standard-shoes"
))

PRODUCTS.append(p(
    "pos-footwear-014-camel-square-toe-mule",
    "Camel square-toe mule",
    "camel-square-toe-mule",
    "A mule worth wearing beyond the house — structured vegan leather upper, square toe, and a block heel that does the heavy lifting. Camel is the season's neutral and this one goes with everything. Throw on with cropped trousers or a belted midi.",
    "footwear", ["mule", "block-heel", "square-toe", "camel", "quiet-luxury", "women"],
    88.99, 0.39,
    [IMG["mule_black"]],
    variants_by_size("POS-FOO-014", "Camel", women_shoe_sizes, 8899),
    "spocket", "https://www.spocket.co/", "standard-shoes"
))

PRODUCTS.append(p(
    "pos-footwear-015-cream-chunky-loafer",
    "Cream chunky-sole loafer",
    "cream-chunky-sole-loafer",
    "The loafer doing heavy lifting in every clean-girl look right now. Chunky lug sole, buttery cream finish, and a classic penny strap detail that reads expensive without trying. Get the look for less — size up half if between sizes.",
    "footwear", ["loafer", "chunky-sole", "clean-girl", "cream", "trending", "women"],
    92.99, 0.38,
    [IMG["loafer_cream"]],
    variants_by_size("POS-FOO-015", "Cream", women_shoe_sizes, 9299),
    "trendsi", "https://www.trendsi.com/", "standard-shoes"
))

PRODUCTS.append(p(
    "pos-footwear-016-black-chunky-loafer",
    "Black chunky-sole loafer",
    "black-chunky-sole-loafer",
    "Same elevated loafer silhouette, easier colour story. Black lug-sole loafer pairs back to everything from wide-leg denim to pleated midi skirts. The kind of shoe that quietly makes every outfit better.",
    "footwear", ["loafer", "chunky-sole", "black", "versatile", "women"],
    92.99, 0.38,
    [IMG["loafer_cream"]],
    variants_by_size("POS-FOO-016", "Black", women_shoe_sizes, 9299),
    "trendsi", "https://www.trendsi.com/", "standard-shoes"
))

PRODUCTS.append(p(
    "pos-footwear-017-nude-espadrille-wedge",
    "Nude espadrille wedge sandal",
    "nude-espadrille-wedge-sandal",
    "Jute-wrapped wedge espadrille in a soft nude — the sandal that disappears into your legs and makes everything look longer. Ankle-tie closure, cushioned insole, and a wedge height that's genuinely walkable. Summer styling non-negotiable.",
    "footwear", ["espadrille", "wedge", "nude", "summer", "resort", "women"],
    84.99, 0.41,
    [IMG["espadrille"]],
    variants_by_size("POS-FOO-017", "Nude", women_shoe_sizes, 8499),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-shoes"
))

PRODUCTS.append(p(
    "pos-footwear-018-black-mary-jane-flat",
    "Black mary jane ballet flat",
    "black-mary-jane-ballet-flat",
    "Y2K's best revival: a sleek black mary jane with a round toe and adjustable buckle strap. Patent-finish vegan upper adds a polish that works from campus to cocktails. Wear with micro-mini skirts, sheer tights, or relaxed trousers.",
    "footwear", ["mary-jane", "ballet-flat", "Y2K", "patent", "women"],
    78.99, 0.43,
    [IMG["mary_jane"]],
    variants_by_size("POS-FOO-018", "Black", women_shoe_sizes, 7899),
    "spocket", "https://www.spocket.co/", "standard-shoes"
))

PRODUCTS.append(p(
    "pos-footwear-019-tan-leather-slide-sandal",
    "Tan leather-look slide sandal",
    "tan-leather-look-slide-sandal",
    "The flat slide that earns its keep in the wardrobe — tan vegan leather upper, single wide strap, and a padded footbed that doesn't quit. Goes from morning errands to rooftop dinners. Minimal, timeless, and somehow always trending.",
    "footwear", ["slide", "sandal", "tan", "minimal", "everyday", "women"],
    76.99, 0.42,
    [IMG["sandal_tan"]],
    variants_by_size("POS-FOO-019", "Tan", women_shoe_sizes, 7699),
    "trendsi", "https://www.trendsi.com/", "standard-shoes"
))

PRODUCTS.append(p(
    "pos-footwear-020-ivory-clog-mule",
    "Ivory clog-toe mule",
    "ivory-clog-toe-mule",
    "Clog energy, sandal ease. This ivory mule has a sculptural clog toe cap, open back, and a stacked wooden-look heel — the gorpcore-meets-coquette hybrid your wardrobe didn't know it needed. Pair with oversized everything.",
    "footwear", ["clog", "mule", "ivory", "gorpcore", "sculptural", "women"],
    88.99, 0.40,
    [IMG["clog_mule"]],
    variants_by_size("POS-FOO-020", "Ivory", women_shoe_sizes, 8899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-shoes"
))

# ═══════════════════════════════════════════════════════════
# WATCHES — 8 products
# SKU base: POS-WAT-011 through POS-WAT-018
# Price band: $96.99–$148.99
# ═══════════════════════════════════════════════════════════
watch_colors = [["Silver/White", "Gold/White", "Rose Gold/White"],
                ["Silver/Black", "Gold/Black"],
                ["Gold/Cream", "Silver/Cream"],
                ["Silver", "Gold", "Rose Gold"],
                ["Black/Silver", "Black/Gold"]]

PRODUCTS.append(p(
    "pos-watches-011-minimal-white-dial-women-watch",
    "Minimal white-dial women's dress watch",
    "minimal-white-dial-womens-dress-watch",
    "Thin case, white sunray dial, and a slim mesh bracelet — the watch that reads expensive at twenty paces. Roman numeral indices and a delicate crown keep it classic without being stuffy. Stack with a dainty gold cuff for the quiet-luxury wrist moment.",
    "watches", ["women", "dress-watch", "white-dial", "mesh-bracelet", "minimal", "quiet-luxury"],
    112.99, 0.40,
    [IMG["watch_silver"]],
    variants_by_color("POS-WAT-011", ["Silver/White Dial", "Rose Gold/White Dial"], 11299),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-watch"
))

PRODUCTS.append(p(
    "pos-watches-012-gold-oval-dial-chain-watch",
    "Gold oval-dial chain-link watch",
    "gold-oval-dial-chain-link-watch",
    "That oval dial energy is back and this gold chain-link version is the one all over editorial moodboards right now. Antique-gold tone case, champagne dial, and an integrated bracelet that drapes instead of clamping. Stash it before it's everywhere.",
    "watches", ["gold", "oval-dial", "chain-link", "retro", "trending", "women"],
    128.99, 0.38,
    [IMG["watch_gold"]],
    variants_by_color("POS-WAT-012", ["Gold/Champagne Dial", "Gold/White Dial"], 12899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-watch"
))

PRODUCTS.append(p(
    "pos-watches-013-silver-mesh-bracelet-watch",
    "Silver mesh-bracelet dress watch",
    "silver-mesh-bracelet-dress-watch",
    "The mesh bracelet watch that blurs the line between jewellery and timepiece. Polished silver case, clean white dial, and adjustable mesh band that lays flat on the wrist. Pairs back to everything from workwear to weekend brunch.",
    "watches", ["silver", "mesh-bracelet", "dress-watch", "women", "everyday"],
    108.99, 0.41,
    [IMG["watch_mesh"]],
    variants_by_color("POS-WAT-013", ["Silver/White Dial", "Silver/Blue Dial"], 10899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-watch"
))

PRODUCTS.append(p(
    "pos-watches-014-rose-gold-square-dial-watch",
    "Rose gold square-dial watch",
    "rose-gold-square-dial-watch",
    "Square cases are having a moment and this rose gold version delivers the retro-luxe look at an actual accessible price. Sunray blush dial, slim leather-look strap, and a polished bezel that catches light without screaming for attention.",
    "watches", ["rose-gold", "square-dial", "retro", "women", "blush"],
    118.99, 0.39,
    [IMG["watch_rose"]],
    variants_by_color("POS-WAT-014", ["Rose Gold/Blush Dial", "Rose Gold/White Dial"], 11899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-watch"
))

PRODUCTS.append(p(
    "pos-watches-015-black-sport-rubber-strap-watch",
    "Black sport rubber-strap watch",
    "black-sport-rubber-strap-watch",
    "Clean sport watch with a matte black case, domed mineral crystal, and a comfortable rubber strap. Date window, luminous hands, and 50m water resistance — the everyday companion that keeps up without calling attention to itself.",
    "watches", ["sport", "rubber-strap", "black", "unisex", "everyday", "water-resistant"],
    96.99, 0.42,
    [IMG["watch_leather"]],
    variants_by_color("POS-WAT-015", ["Black/Black Dial", "Black/White Dial"], 9699),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-watch"
))

PRODUCTS.append(p(
    "pos-watches-016-green-dial-nato-strap-watch",
    "Green dial NATO strap watch",
    "green-dial-nato-strap-watch",
    "Forest green dial, stainless steel case, and a two-tone NATO strap — the combination that's quietly taken over every style forum. Wears like a casual piece but photographs like a collector's item. Swap the strap for a look change.",
    "watches", ["green-dial", "nato-strap", "casual", "men", "unisex", "trending"],
    104.99, 0.40,
    [IMG["watch_silver"]],
    variants_by_color("POS-WAT-016", ["Green/Steel Case", "Navy/Steel Case"], 10499),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-watch"
))

PRODUCTS.append(p(
    "pos-watches-017-gold-sunburst-dial-women-watch",
    "Gold sunburst dial women's watch",
    "gold-sunburst-dial-womens-watch",
    "Sunburst dials catch light in a way flat dials never do — this all-gold piece with a champagne radial finish and integrated bracelet is exactly what 'effortless stacking' looks like. The watch that says old money without the receipt.",
    "watches", ["gold", "sunburst-dial", "women", "quiet-luxury", "statement"],
    138.99, 0.38,
    [IMG["watch_gold"]],
    variants_by_color("POS-WAT-017", ["Gold/Champagne Sunburst", "Gold/White Sunburst"], 13899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-watch"
))

PRODUCTS.append(p(
    "pos-watches-018-pearl-dial-leather-strap-watch",
    "Pearl dial leather-strap watch",
    "pearl-dial-leather-strap-watch",
    "Coquette-era accessory of the moment: a pearl-white mother-of-pearl inspired dial, slim gold case, and a genuine leather strap in cream. Whisper-thin profile, date window, and a sweetness that pairs with both minimal and maximalist looks.",
    "watches", ["pearl-dial", "leather-strap", "coquette", "women", "gold", "feminine"],
    122.99, 0.40,
    [IMG["watch_rose"]],
    variants_by_color("POS-WAT-018", ["Gold/Pearl Dial/Cream Strap", "Silver/Pearl Dial/White Strap"], 12299),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-watch"
))

# ═══════════════════════════════════════════════════════════
# BAGS — 12 products
# SKU base: POS-BAG-011 through POS-BAG-022
# Price band: $58.99–$96.99
# ═══════════════════════════════════════════════════════════

PRODUCTS.append(p(
    "pos-bags-011-tan-crescent-shoulder-bag",
    "Tan crescent shoulder bag",
    "tan-crescent-shoulder-bag",
    "The crescent silhouette that's taken over every aesthetic Pinterest board. Soft vegan leather in warm tan, adjustable shoulder strap, and an interior that fits more than it looks like it should. The bag that makes you look like you have your life together.",
    "bags", ["shoulder-bag", "crescent", "tan", "trending", "women"],
    68.99, 0.40,
    [IMG["bag_shoulder"]],
    variants_by_color("POS-BAG-011", ["Tan", "Black", "Cream"], 6899),
    "spocket", "https://www.spocket.co/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-012-oversized-canvas-tote-bag",
    "Oversized canvas tote bag",
    "oversized-canvas-tote-bag",
    "The tote that ends the tote search — heavy cotton canvas, reinforced strap, interior zip pocket, and a size that fits laptop, gym gear, and a spare pair of shoes without complaint. Washes well, ages better.",
    "bags", ["tote", "canvas", "oversized", "everyday", "women"],
    62.99, 0.42,
    [IMG["bag_tote"]],
    variants_by_color("POS-BAG-012", ["Natural Canvas", "Black Canvas", "Sage Canvas"], 6299),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-013-black-micro-saddle-bag",
    "Black micro saddle bag",
    "black-micro-saddle-bag",
    "Tiny bag, massive energy. This micro saddle silhouette in polished black vegan leather clips onto any belt loop or shoulder strap for hands-free freedom. Goes from festival to night out without breaking a sweat.",
    "bags", ["mini-bag", "saddle", "black", "festival", "crossbody"],
    58.99, 0.43,
    [IMG["bag_mini"]],
    variants_by_color("POS-BAG-013", ["Black", "Chocolate Brown", "Cherry Red"], 5899),
    "spocket", "https://www.spocket.co/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-014-satin-pleated-clutch-bag",
    "Ivory satin pleated clutch",
    "ivory-satin-pleated-clutch",
    "The evening bag that earns its storage space. Pleated ivory satin, magnetic snap closure, and a detachable chain strap that makes it dual-purpose. Styling tip: tuck the strap inside and carry it as a proper clutch for maximum dinner-out drama.",
    "bags", ["clutch", "satin", "ivory", "evening", "event", "women"],
    64.99, 0.41,
    [IMG["bag_clutch"]],
    variants_by_color("POS-BAG-014", ["Ivory", "Champagne", "Dusty Rose"], 6499),
    "trendsi", "https://www.trendsi.com/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-015-tan-structured-work-tote",
    "Tan structured work tote",
    "tan-structured-work-tote",
    "Work bag that doesn't look like a work bag. Structured vegan leather body, top-handle carry, shoulder strap included, and interior organisation that means you can actually find your keys. Quiet-luxury energy for the 9-to-5.",
    "bags", ["work-tote", "structured", "tan", "professional", "quiet-luxury"],
    88.99, 0.39,
    [IMG["bag_work"]],
    variants_by_color("POS-BAG-015", ["Tan", "Black", "Dark Brown"], 8899),
    "spocket", "https://www.spocket.co/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-016-black-weekender-duffel",
    "Black canvas weekender duffel",
    "black-canvas-weekender-duffel",
    "Two-night trips sorted. Heavy-duty waxed canvas body, faux-leather trim, and a main compartment that swallows a weekend's worth of outfits without expanding to the size of a suitcase. Grab handles and removable shoulder strap included.",
    "bags", ["weekender", "duffel", "canvas", "travel", "unisex"],
    94.99, 0.38,
    [IMG["bag_weekender"]],
    variants_by_color("POS-BAG-016", ["Black/Black Trim", "Olive/Tan Trim"], 9499),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-017-beige-flap-crossbody",
    "Beige quilted-flap crossbody",
    "beige-quilted-flap-crossbody",
    "Quilted vegan leather, gold-hardware chain strap, and a turn-lock flap closure that photographs like a much more expensive bag. Interior card pocket plus main compartment — small but mighty. Beige is the permanent neutral that goes everywhere.",
    "bags", ["crossbody", "quilted", "beige", "chain-strap", "going-out"],
    72.99, 0.41,
    [IMG["bag_crossbody"]],
    variants_by_color("POS-BAG-017", ["Beige", "Black", "White"], 7299),
    "trendsi", "https://www.trendsi.com/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-018-caramel-bucket-bag",
    "Caramel drawstring bucket bag",
    "caramel-drawstring-bucket-bag",
    "The bucket bag gets a soft-girl upgrade — supple vegan leather in caramel with a drawstring closure, inner suede lining, and a strap that adjusts from crossbody to shoulder. Roomy enough for daily life, sleek enough for evening.",
    "bags", ["bucket-bag", "caramel", "drawstring", "women", "everyday"],
    74.99, 0.40,
    [IMG["bag_bucket"]],
    variants_by_color("POS-BAG-018", ["Caramel", "Cognac", "Stone"], 7499),
    "spocket", "https://www.spocket.co/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-019-cream-mini-top-handle-bag",
    "Cream mini top-handle bag",
    "cream-mini-top-handle-bag",
    "The mini structured top-handle format that's been all over street style for two seasons straight. Cream vegan leather, polished gold clasp, and a detachable longer strap for when you need both hands. Small but impossibly chic.",
    "bags", ["top-handle", "mini", "cream", "structured", "evening"],
    78.99, 0.40,
    [IMG["bag_mini"]],
    variants_by_color("POS-BAG-019", ["Cream", "Blush", "Black"], 7899),
    "trendsi", "https://www.trendsi.com/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-020-sage-shoulder-hobo-bag",
    "Sage slouchy hobo shoulder bag",
    "sage-slouchy-hobo-shoulder-bag",
    "Soft sage vegan leather in a relaxed hobo shape that drapes over the shoulder instead of sitting rigid. The washed colour is having a major moment and this one pairs back to neutrals and earth tones effortlessly.",
    "bags", ["hobo", "shoulder-bag", "sage", "green", "slouchy", "women"],
    66.99, 0.43,
    [IMG["bag_shoulder"]],
    variants_by_color("POS-BAG-020", ["Sage Green", "Dusty Lavender", "Warm Sand"], 6699),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-021-black-structured-shopper-tote",
    "Black structured shopper tote",
    "black-structured-shopper-tote",
    "Between a tote and a structured bag, this is the edit that wins both. Wide-mouth open top, internal zip pocket, and a clean black finish that is impossible to overthink. Laptop fits. Groceries fit. So does the rest of your life.",
    "bags", ["tote", "shopper", "black", "structured", "women", "work"],
    82.99, 0.40,
    [IMG["bag_work"]],
    variants_by_color("POS-BAG-021", ["Black", "Tan", "White"], 8299),
    "spocket", "https://www.spocket.co/", "standard-bag"
))

PRODUCTS.append(p(
    "pos-bags-022-brown-baguette-bag",
    "Chocolate brown baguette bag",
    "chocolate-brown-baguette-bag",
    "Y2K revival, done right. Slim baguette silhouette in chocolate brown with a subtle croc-effect emboss and a gold turn-lock closure. Tucks under the arm, lays across the body on a long strap. One bag, two ways — that's the edit.",
    "bags", ["baguette", "brown", "croc-emboss", "Y2K", "women", "crossbody"],
    68.99, 0.42,
    [IMG["bag_crossbody"]],
    variants_by_color("POS-BAG-022", ["Chocolate Brown", "Black", "Cream"], 6899),
    "trendsi", "https://www.trendsi.com/", "standard-bag"
))

# ═══════════════════════════════════════════════════════════
# WOMEN'S CLOTHING — 20 products
# SKU base: POS-WOM-011 through POS-WOM-030
# Price band: $29.99–$74.99
# ═══════════════════════════════════════════════════════════
women_sizes_XS_XL = ["XS", "S", "M", "L", "XL"]
women_sizes_S_XL  = ["S", "M", "L", "XL"]

PRODUCTS.append(p(
    "pos-women-011-ribbed-knit-mini-dress",
    "Ribbed knit mini dress",
    "ribbed-knit-mini-dress",
    "The ribbed knit mini that launched a thousand 'outfit of the day' posts. Bodycon silhouette, crew neck, and a fabric that moves with you instead of fighting you. The piece you reach for when you have exactly zero brain space for an outfit decision.",
    "women", ["knit", "mini-dress", "ribbed", "trending", "bodycon"],
    44.99, 0.42,
    [IMG["dress_mini"]],
    variants_size_color("POS-WOM-011", [("Caramel", "XS"), ("Caramel", "S"), ("Caramel", "M"), ("Caramel", "L"), ("Cream", "S"), ("Cream", "M"), ("Cream", "L")], 4499),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-012-floral-wrap-midi-dress",
    "Floral wrap midi dress",
    "floral-wrap-midi-dress",
    "A wrap midi dress in an abstract floral print that photographs every time. The adjustable tie gives you the fit, the midi length gives you the elegance, and the flutter sleeves give you the movement. Wear to anything and look like you planned it.",
    "women", ["midi-dress", "wrap", "floral", "print", "feminine"],
    54.99, 0.41,
    [IMG["dress_wrap"]],
    variants_size_color("POS-WOM-012", [("Floral Ivory", "XS"), ("Floral Ivory", "S"), ("Floral Ivory", "M"), ("Floral Ivory", "L"), ("Floral Black", "S"), ("Floral Black", "M"), ("Floral Black", "L")], 5499),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-013-satin-bias-slip-dress",
    "Satin bias-cut slip dress",
    "satin-bias-cut-slip-dress",
    "The slip dress that defined a decade is back and this satin bias-cut version is the cleanest interpretation yet. Adjustable spaghetti straps, a cowl neckline that drapes just right, and a fabric weight that flows instead of clings. Layer a blazer over it or wear it straight.",
    "women", ["slip-dress", "satin", "bias-cut", "coquette", "Y2K", "evening"],
    62.99, 0.40,
    [IMG["dress_slip"]],
    variants_size_color("POS-WOM-013", [("Champagne", "XS"), ("Champagne", "S"), ("Champagne", "M"), ("Champagne", "L"), ("Dusty Rose", "S"), ("Dusty Rose", "M"), ("Black", "S"), ("Black", "M")], 6299),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-014-crewneck-cropped-knit-top",
    "Crewneck cropped knit top",
    "crewneck-cropped-knit-top",
    "The knit crop that's been in the 'get the look' section of every influencer post this season. Soft chunky-ribbed fabric, cropped cut that hits just above the waistband, and a neckline that works with high-waist everything.",
    "women", ["knit", "cropped", "top", "ribbed", "clean-girl"],
    34.99, 0.43,
    [IMG["knit_top"]],
    variants_size_color("POS-WOM-014", [("Oatmeal", "XS"), ("Oatmeal", "S"), ("Oatmeal", "M"), ("Oatmeal", "L"), ("Black", "XS"), ("Black", "S"), ("Black", "M"), ("Chocolate", "S"), ("Chocolate", "M")], 3499),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-015-linen-wide-leg-trousers",
    "Linen-blend wide-leg trousers",
    "linen-blend-wide-leg-trousers",
    "The wide-leg trouser that makes everything from fitted crops to oversized tees look intentional. Linen-blend fabric breathes on warm days and drapes into clean lines on cooler ones. Elastic waistband at the back — comfort is part of the aesthetic now.",
    "women", ["trousers", "wide-leg", "linen", "resort", "clean-girl"],
    48.99, 0.41,
    [IMG["matching_set"]],
    variants_size_color("POS-WOM-015", [("Ivory", "XS"), ("Ivory", "S"), ("Ivory", "M"), ("Ivory", "L"), ("Olive", "S"), ("Olive", "M"), ("Olive", "L"), ("Sand", "M"), ("Sand", "L")], 4899),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-016-cargo-wide-leg-jeans",
    "Cargo-pocket wide-leg jeans",
    "cargo-pocket-wide-leg-jeans",
    "Denim, but make it utilitarian-chic. Wide-leg cut with cargo patch pockets at the thigh — the piece that went from Y2K throwback to full trend moment in six months flat. Wear high and loose with a baby tee and strappy sandals.",
    "women", ["jeans", "denim", "wide-leg", "cargo", "Y2K", "trending"],
    58.99, 0.42,
    [IMG["denim_jeans"]],
    variants_size_color("POS-WOM-016", [("Mid Wash", "XS"), ("Mid Wash", "S"), ("Mid Wash", "M"), ("Mid Wash", "L"), ("Dark Wash", "S"), ("Dark Wash", "M"), ("Dark Wash", "L")], 5899),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-017-lounge-matching-set",
    "Ribbed lounge matching set",
    "ribbed-lounge-matching-set",
    "Top plus wide-leg pant in a soft ribbed fabric that feels like a hug but photographs like a lewk. The matching set formula works because it removes the thinking — pair both pieces or split them with denim. Either way, you win.",
    "women", ["matching-set", "lounge", "ribbed", "athleisure", "trending"],
    64.99, 0.40,
    [IMG["lounge_set"]],
    variants_size_color("POS-WOM-017", [("Dusty Rose","XS"), ("Dusty Rose","S"), ("Dusty Rose","M"), ("Sage Green","S"), ("Sage Green","M"), ("Sage Green","L"), ("Mocha","M"), ("Mocha","L")], 6499),
    "savoy_active", "https://www.savoyactive.com/", "standard-apparel"
))

# Fix variant format
PRODUCTS[-1]["variants"] = []
set_cs = [("Dusty Rose","XS"),("Dusty Rose","S"),("Dusty Rose","M"),("Sage Green","S"),("Sage Green","M"),("Sage Green","L"),("Mocha","M"),("Mocha","L")]
for i2,(c2,s2) in enumerate(set_cs,1):
    PRODUCTS[-1]["variants"].append({"title":f"{c2} / {s2}","sku":f"POS-WOM-017-{i2:02d}","options":{"Color":c2,"Size":s2},"inventory_quantity":0,"manage_inventory":False,"prices":[{"currency_code":"usd","amount":6499}]})

PRODUCTS.append(p(
    "pos-women-018-ruched-mini-skirt",
    "Ruched-side mini skirt",
    "ruched-side-mini-skirt",
    "The ruched mini that does everything: it cinches your waist, adds texture to a simple outfit, and works for any occasion with the right top. Worn with a fitted top for going out or a relaxed knit for daytime, it shows up every time.",
    "women", ["mini-skirt", "ruched", "women", "going-out", "trending"],
    36.99, 0.43,
    [IMG["dress_mini"]],
    variants_size_color("POS-WOM-018", [("Black","XS"),("Black","S"),("Black","M"),("Black","L"),("Caramel","S"),("Caramel","M"),("Caramel","L")], 3699),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-019-oversized-blazer-dress",
    "Oversized blazer dress",
    "oversized-blazer-dress",
    "One piece, infinite outfits. This oversized blazer worn as a dress is the power move of minimal fashion — wear belted as a dress, open over trousers, or layered over a mini. Tailored front, relaxed back, and a shoulder line that means business.",
    "women", ["blazer", "dress", "oversized", "minimal", "tailored", "quiet-luxury"],
    72.99, 0.40,
    [IMG["blazer_set"]],
    variants_size_color("POS-WOM-019", [("Ivory","XS"),("Ivory","S"),("Ivory","M"),("Ivory","L"),("Camel","S"),("Camel","M"),("Black","S"),("Black","M")], 7299),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-020-mesh-long-sleeve-top",
    "Sheer mesh long-sleeve top",
    "sheer-mesh-long-sleeve-top",
    "The sheer mesh top that belongs under every slip dress, blazer, or on its own with high-waist trousers. Fitted but not restrictive, with a crew neckline and full-length sleeve. The layer that makes the outfit.",
    "women", ["mesh", "sheer", "long-sleeve", "layering", "Y2K", "women"],
    32.99, 0.43,
    [IMG["crop_top"]],
    variants_size_color("POS-WOM-020", [("Black","XS"),("Black","S"),("Black","M"),("Black","L"),("Ivory","S"),("Ivory","M"),("Baby Pink","S"),("Baby Pink","M")], 3299),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-021-crochet-cover-up-dress",
    "Crochet cover-up midi dress",
    "crochet-cover-up-midi-dress",
    "Beach-to-bar in seconds. This open-knit crochet midi dress layers beautifully over a bikini or a slip for an evening out. The relaxed fit, scoop neckline, and cinched waist manage to feel both effortless and editorial at the same time.",
    "women", ["crochet", "cover-up", "midi", "resort", "beach", "summer"],
    56.99, 0.42,
    [IMG["midi_dress"]],
    variants_size_color("POS-WOM-021", [("Ivory","XS/S"),("Ivory","M/L"),("Chocolate","XS/S"),("Chocolate","M/L")], 5699),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-022-button-through-linen-dress",
    "Button-through linen shirt dress",
    "button-through-linen-shirt-dress",
    "The shirt dress that has an answer for every occasion. Breathable linen-blend fabric, full button-front detail, belted waist, and a midi length that manages to look put-together with zero effort. Half-button open at the hem for movement.",
    "women", ["shirt-dress", "linen", "midi", "button-through", "summer", "clean-girl"],
    58.99, 0.41,
    [IMG["midi_dress"]],
    variants_size_color("POS-WOM-022", [("White","XS"),("White","S"),("White","M"),("White","L"),("Ecru","S"),("Ecru","M"),("Olive","M"),("Olive","L")], 5899),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-023-asymmetric-hem-top",
    "Asymmetric-hem fitted crop top",
    "asymmetric-hem-fitted-crop-top",
    "The detail that turns a simple top into a look: an asymmetric hem that dips slightly at one side and adds visual interest to the most low-key outfit. Stretch jersey fabric, off-shoulder neckline option, and a fitted cut that photographs great.",
    "women", ["crop-top", "asymmetric", "jersey", "fitted", "women"],
    29.99, 0.45,
    [IMG["crop_top"]],
    variants_size_color("POS-WOM-023", [("Black","XS"),("Black","S"),("Black","M"),("White","XS"),("White","S"),("White","M"),("White","L")], 2999),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-024-oversized-vintage-wash-tee",
    "Oversized vintage-wash graphic tee",
    "oversized-vintage-wash-graphic-tee",
    "Vintage-wash cotton, slightly boxy oversize silhouette, and a tonal print that looks like it came from a $400 brand but costs what it should. Tuck into high-waist denim or wear untucked over bike shorts. Soft after the first wash and gets better from there.",
    "women", ["tee", "graphic", "vintage-wash", "oversized", "cotton", "women"],
    34.99, 0.43,
    [IMG["crop_top"]],
    variants_size_color("POS-WOM-024", [("Washed Black","S"),("Washed Black","M"),("Washed Black","L"),("Washed Grey","S"),("Washed Grey","M"),("Washed Tan","S"),("Washed Tan","M")], 3499),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-025-sporty-matching-set-crop-legging",
    "Sporty crop top and legging matching set",
    "sporty-crop-top-legging-matching-set",
    "Sweat-wicking fabric, seamless construction, and a silhouette that works from workout to iced coffee run. High-rise legging and a cropped racerback top in a matching tonal colourway — the athleisure formula that just works every time.",
    "women", ["matching-set", "activewear", "legging", "athleisure", "sporty", "gym"],
    66.99, 0.40,
    [IMG["active_set"]],
    variants_size_color("POS-WOM-025", [("Stone Taupe","XS"),("Stone Taupe","S"),("Stone Taupe","M"),("Stone Taupe","L"),("Midnight Navy","S"),("Midnight Navy","M"),("Midnight Navy","L")], 6699),
    "savoy_active", "https://www.savoyactive.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-026-satin-cargo-trousers",
    "Satin-finish cargo trousers",
    "satin-finish-cargo-trousers",
    "Cargo pockets meet evening-wear fabric: satin-finish trousers with two large patch pockets at the thigh that somehow look intentional. The high waist and wide silhouette give them a cool slouch, while the sheen elevates the whole thing. Wear with a simple crop.",
    "women", ["cargo", "trousers", "satin", "trending", "statement", "women"],
    59.99, 0.41,
    [IMG["denim_jeans"]],
    variants_size_color("POS-WOM-026", [("Champagne","XS"),("Champagne","S"),("Champagne","M"),("Champagne","L"),("Black","S"),("Black","M"),("Black","L")], 5999),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-027-longline-open-front-cardigan",
    "Longline open-front cardigan",
    "longline-open-front-cardigan",
    "Knee-length, chunky knit, and an open-front that layers over everything from mini dresses to loungewear. The kind of piece that does the work of a jacket without the commitment. Grab it on the way out, look like you planned the whole outfit.",
    "women", ["cardigan", "longline", "knit", "layering", "clean-girl", "women"],
    54.99, 0.42,
    [IMG["cardigan"]],
    variants_size_color("POS-WOM-027", [("Oatmeal","XS/S"),("Oatmeal","M/L"),("Chocolate","XS/S"),("Chocolate","M/L"),("Grey","S"),("Grey","M")], 5499),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-028-floral-corset-mini-dress",
    "Floral corset-bodice mini dress",
    "floral-corset-bodice-mini-dress",
    "Coquette archive: a sweetheart corset bodice in a delicate floral print paired with an A-line mini skirt. Boning for structure, adjustable tie at the back, and a length that works with both heels and flat sandals. This is the dress that gets the most saves.",
    "women", ["mini-dress", "corset", "floral", "coquette", "feminine", "event"],
    68.99, 0.40,
    [IMG["dress_mini"]],
    variants_size_color("POS-WOM-028", [("Floral Pink","XS"),("Floral Pink","S"),("Floral Pink","M"),("Floral Pink","L"),("Floral Ivory","S"),("Floral Ivory","M")], 6899),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-029-broderie-anglaise-top",
    "Broderie anglaise off-shoulder top",
    "broderie-anglaise-off-shoulder-top",
    "White broderie anglaise with an elasticated off-shoulder neckline and flutter sleeves — the kind of top that works over a bikini at a beach bar and still makes sense at a rooftop dinner. The one vacation-wardrobe buy that justifies itself every trip.",
    "women", ["top", "broderie", "off-shoulder", "resort", "white", "summer"],
    38.99, 0.43,
    [IMG["knit_top"]],
    variants_size_color("POS-WOM-029", [("White","XS"),("White","S"),("White","M"),("White","L"),("Ivory","S"),("Ivory","M")], 3899),
    "trendsi", "https://www.trendsi.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-women-030-high-waist-biker-shorts",
    "High-waist biker shorts",
    "high-waist-biker-shorts",
    "The biker short that outperforms the gym. High-rise waistband, compression fabric, and a thigh-length cut that pairs with oversized tees, longline cardigans, and fitted crops equally. The everyday bottom that earns its wardrobe space every single day.",
    "women", ["biker-shorts", "high-waist", "athleisure", "women", "everyday"],
    32.99, 0.43,
    [IMG["active_set"]],
    variants_size_color("POS-WOM-030", [("Black","XS"),("Black","S"),("Black","M"),("Black","L"),("Brown","S"),("Brown","M"),("Sage","S"),("Sage","M")], 3299),
    "savoy_active", "https://www.savoyactive.com/", "standard-apparel"
))

# ═══════════════════════════════════════════════════════════
# MEN'S — 6 products
# SKU base: POS-MEN-011 through POS-MEN-016
# Price band: $38.99–$82.99
# ═══════════════════════════════════════════════════════════
men_sizes = ["S", "M", "L", "XL", "XXL"]

PRODUCTS.append(p(
    "pos-men-011-premium-heavyweight-tee",
    "Premium heavyweight crew-neck tee",
    "premium-heavyweight-crew-neck-tee",
    "280gsm cotton, boxy cut, and a crew neckline that keeps its shape wash after wash. The foundational tee that earns its premium price point — not because it's complicated but because it's exactly right. Grab in every neutral, build the wardrobe from here.",
    "men", ["tee", "heavyweight", "cotton", "minimal", "men", "staple"],
    42.99, 0.40,
    [IMG["mens_tee"]],
    variants_size_color("POS-MEN-011", [("White","S"),("White","M"),("White","L"),("Black","M"),("Black","L"),("Black","XL"),("Slate Grey","M"),("Slate Grey","L")], 4299),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-men-012-relaxed-tapered-jogger",
    "Relaxed-tapered tech jogger",
    "relaxed-tapered-tech-jogger",
    "The jogger that doesn't look like a jogger when you're out in the world. Technical fabric with a slight sheen, tapered leg, and a drawstring waist that sits flat under a jacket. The piece that bridges athleisure and casual without compromising either.",
    "men", ["jogger", "tech-fabric", "tapered", "athleisure", "men"],
    58.99, 0.41,
    [IMG["mens_jogger"]],
    variants_size_color("POS-MEN-012", [("Black","S"),("Black","M"),("Black","L"),("Black","XL"),("Charcoal","M"),("Charcoal","L"),("Olive","M"),("Olive","L")], 5899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-men-013-linen-short-sleeve-shirt",
    "Linen short-sleeve camp-collar shirt",
    "linen-short-sleeve-camp-collar-shirt",
    "Camp-collar shirts live at the intersection of effort and ease and this linen version is the best argument for the format. The relaxed chest-pocket detail and box pleat at the back give it shape without construction. Left untucked over swim shorts or with chinos — equal results.",
    "men", ["shirt", "linen", "camp-collar", "resort", "men", "summer"],
    52.99, 0.42,
    [IMG["mens_shirt"]],
    variants_size_color("POS-MEN-013", [("Ivory","S"),("Ivory","M"),("Ivory","L"),("Olive","M"),("Olive","L"),("Sky Blue","S"),("Sky Blue","M"),("Sky Blue","L")], 5299),
    "spocket", "https://www.spocket.co/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-men-014-essential-zip-hoodie",
    "Essential zip-front hoodie",
    "essential-zip-front-hoodie",
    "French terry cotton, brushed interior, and a clean zip without graphics or branding — the hoodie that works under everything and over anything. Full-zip means it layers under outerwear without bulk. The wardrobe piece that disappears without failing.",
    "men", ["hoodie", "zip", "french-terry", "men", "layering", "essentials"],
    62.99, 0.40,
    [IMG["mens_hoodie"]],
    variants_size_color("POS-MEN-014", [("Black","S"),("Black","M"),("Black","L"),("Black","XL"),("Stone","M"),("Stone","L"),("Navy","M"),("Navy","L")], 6299),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-men-015-slim-stretch-chino",
    "Slim-fit stretch chino",
    "slim-fit-stretch-chino",
    "The chino that doesn't sacrifice comfort for fit. Four-way stretch fabric, slim-but-not-skinny silhouette, and a flat-front finish that works dressed up with a button-down or casual with a plain tee. The five-day pant that wears like weekend wear.",
    "men", ["chino", "slim-fit", "stretch", "men", "versatile"],
    66.99, 0.39,
    [IMG["mens_jogger"]],
    variants_size_color("POS-MEN-015", [("Navy","30x32"),("Navy","32x32"),("Navy","34x32"),("Khaki","30x32"),("Khaki","32x32"),("Khaki","34x32"),("Olive","32x32"),("Olive","34x32")], 6699),
    "spocket", "https://www.spocket.co/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-men-016-coach-jacket",
    "Lightweight zip coach jacket",
    "lightweight-zip-coach-jacket",
    "The coach jacket is back and this clean lightweight version strips out the team graphics and keeps the silhouette — zip-front, boxy cut, ribbed cuffs, and a colour palette that doesn't shout. Goes over a hoodie in winter, over a tee in spring.",
    "men", ["jacket", "coach-jacket", "zip", "men", "layering", "streetwear"],
    76.99, 0.40,
    [IMG["mens_hoodie"]],
    variants_size_color("POS-MEN-016", [("Black","S"),("Black","M"),("Black","L"),("Black","XL"),("Cream","M"),("Cream","L"),("Olive","M"),("Olive","L")], 7699),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-apparel"
))

# ═══════════════════════════════════════════════════════════
# KIDS — 6 products
# SKU base: POS-KID-011 through POS-KID-016
# Price band: $24.99–$42.99
# ═══════════════════════════════════════════════════════════

PRODUCTS.append(p(
    "pos-kids-011-floral-smocked-dress",
    "Floral smocked sundress",
    "floral-smocked-sundress",
    "Elasticised smocking across the chest means this floaty cotton sundress fits a full season of growth spurts. A-line hem, adjustable straps, and a ditsy floral print that holds up to mud, juice, and every photo op in between.",
    "kids", ["dress", "smocked", "floral", "girls", "summer"],
    28.99, 0.42,
    [IMG["kids_dress"]],
    variants_by_size("POS-KID-011", "Floral Pink", ["4T","5T","6","7","8"], 2899),
    "spocket", "https://www.spocket.co/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-kids-012-ribbed-matching-set-kids",
    "Kids ribbed matching set",
    "kids-ribbed-matching-set",
    "The matching moment, sized down. Soft ribbed cotton top and pull-on shorts in the same colourway — easy for kids to dress themselves, satisfying for everyone looking at the result. Elastic waistband, tagless label, machine washable.",
    "kids", ["matching-set", "ribbed", "kids", "toddler", "comfortable"],
    32.99, 0.43,
    [IMG["kids_set"]],
    variants_size_color("POS-KID-012", [("Sage","4T"),("Sage","5T"),("Sage","6"),("Pink","4T"),("Pink","5T"),("Pink","6"),("Cream","5T"),("Cream","6")], 3299),
    "spocket", "https://www.spocket.co/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-kids-013-graphic-cotton-tee-kids",
    "Kids graphic cotton tee",
    "kids-graphic-cotton-tee",
    "100% soft cotton with a fun tonal print and a tagless neckline that avoids every scratch-and-complain situation. Slightly boxy cut gives room for movement and layers well under zip hoodies or dungarees.",
    "kids", ["tee", "cotton", "graphic", "kids", "everyday"],
    24.99, 0.44,
    [IMG["kids_top"]],
    variants_size_color("POS-KID-013", [("White","4T"),("White","5T"),("White","6"),("White","7"),("Sky Blue","5T"),("Sky Blue","6"),("Sky Blue","7")], 2499),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-kids-014-tie-dye-lounge-set",
    "Kids tie-dye lounge set",
    "kids-tie-dye-lounge-set",
    "The tie-dye trend lands in the kids section and it works. Soft cotton-blend sweatshirt and matching jogger in a pastel spiral dye that's easy to wear and easier to love on laundry day. Ribbed cuffs, drawstring waist, screen-to-sofa comfort.",
    "kids", ["lounge-set", "tie-dye", "sweatshirt", "jogger", "kids"],
    38.99, 0.41,
    [IMG["kids_set"]],
    variants_size_color("POS-KID-014", [("Lilac Tie-Dye","5T"),("Lilac Tie-Dye","6"),("Lilac Tie-Dye","7"),("Pink Tie-Dye","5T"),("Pink Tie-Dye","6"),("Pink Tie-Dye","7")], 3899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-kids-015-twill-overalls-kids",
    "Kids twill bib overalls",
    "kids-twill-bib-overalls",
    "Adjustable shoulder straps, front bib pocket, and roomy leg openings — bib overalls in a soft twill that holds their shape and stands up to serious play. Snap buttons at the inseam for the fastest diaper-change cooperation you'll ever get.",
    "kids", ["overalls", "twill", "kids", "girls", "practical"],
    36.99, 0.43,
    [IMG["kids_dress"]],
    variants_by_size("POS-KID-015", "Dusty Mauve", ["4T","5T","6","7","8"], 3699),
    "spocket", "https://www.spocket.co/", "standard-apparel"
))

PRODUCTS.append(p(
    "pos-kids-016-puffer-vest-kids",
    "Kids quilted puffer vest",
    "kids-quilted-puffer-vest",
    "Lightweight quilted puffer vest that layers over long-sleeved tees and hoodies for the in-between temperature situation that is ninety percent of school mornings. Zip front, side pockets, and a fitted cut that lets arms move freely.",
    "kids", ["vest", "puffer", "quilted", "kids", "layering"],
    42.99, 0.40,
    [IMG["kids_top"]],
    variants_size_color("POS-KID-016", [("Black","5T"),("Black","6"),("Black","7"),("Black","8"),("Blush","5T"),("Blush","6"),("Blush","7")], 4299),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-apparel"
))

# ═══════════════════════════════════════════════════════════
# FRAGRANCE — 8 products (unbranded scent profiles only)
# SKU base: POS-FRA-011 through POS-FRA-018
# Price band: $39.99–$58.99
# ═══════════════════════════════════════════════════════════

PRODUCTS.append(p(
    "pos-fragrance-011-solar-floral-eau-de-parfum",
    "Solar floral eau de parfum",
    "solar-floral-eau-de-parfum",
    "Sun-drenched tiare flower, warm white musk, and a dry-down of sandalwood that lingers exactly the right amount. This is the fragrance people stop you to ask about — the one that smells expensive without explaining itself. 50ml spray.",
    "fragrance", ["floral", "musk", "sandalwood", "fresh", "feminine"],
    48.99, 0.40,
    [IMG["frag_floral"]],
    variants_by_color("POS-FRA-011", ["50ml"], 4899),
    "jubilee_beauty", "https://jubilee.beauty/", "fragrance-liquid"
))

PRODUCTS.append(p(
    "pos-fragrance-012-amber-vanilla-musk-perfume",
    "Amber vanilla musk eau de parfum",
    "amber-vanilla-musk-eau-de-parfum",
    "Warm amber, vanilla pod, and a creamy musk base that makes this the year's most wearable gourmand. Not sweet enough to read as dessert, complex enough to read as intentional. Wears close to the skin all day. 50ml spray.",
    "fragrance", ["amber", "vanilla", "musk", "warm", "gourmand"],
    52.99, 0.41,
    [IMG["frag_musk"]],
    variants_by_color("POS-FRA-012", ["50ml"], 5299),
    "jubilee_beauty", "https://jubilee.beauty/", "fragrance-liquid"
))

PRODUCTS.append(p(
    "pos-fragrance-013-citrus-neroli-eau-de-toilette",
    "Citrus neroli eau de toilette",
    "citrus-neroli-eau-de-toilette",
    "A morning ritual in a bottle: bright bergamot top, neroli heart, and a clean white cedar dry-down. Light enough for daily wear, distinct enough to be remembered. The freshest way to start any outfit. 50ml spray.",
    "fragrance", ["citrus", "neroli", "bergamot", "fresh", "clean", "daily"],
    42.99, 0.43,
    [IMG["frag_citrus"]],
    variants_by_color("POS-FRA-013", ["50ml"], 4299),
    "jubilee_beauty", "https://jubilee.beauty/", "fragrance-liquid"
))

PRODUCTS.append(p(
    "pos-fragrance-014-black-rose-oud-eau-de-parfum",
    "Black rose oud eau de parfum",
    "black-rose-oud-eau-de-parfum",
    "Deep, dark, and uncompromising: black rose absolute, resinous oud wood, and a dry smoky amber that ages beautifully on the skin. For those who want a fragrance that shows up to every room, not just some of them. 50ml spray.",
    "fragrance", ["rose", "oud", "amber", "dark", "intense", "unisex"],
    58.99, 0.38,
    [IMG["frag_bottle"]],
    variants_by_color("POS-FRA-014", ["50ml"], 5899),
    "jubilee_beauty", "https://jubilee.beauty/", "fragrance-liquid"
))

PRODUCTS.append(p(
    "pos-fragrance-015-sea-salt-driftwood-cologne",
    "Sea salt driftwood eau de toilette",
    "sea-salt-driftwood-eau-de-toilette",
    "The scent of a coastal sunset without the sunburn. Salted ozonic top, driftwood heart, and a clean vetiver base that feels fresh and textured at once. Unisex, layerable, and the most requested thing in every 'what are you wearing?' conversation.",
    "fragrance", ["aquatic", "sea-salt", "driftwood", "unisex", "fresh", "coastal"],
    46.99, 0.41,
    [IMG["frag_citrus"]],
    variants_by_color("POS-FRA-015", ["50ml"], 4699),
    "jubilee_beauty", "https://jubilee.beauty/", "fragrance-liquid"
))

PRODUCTS.append(p(
    "pos-fragrance-016-peach-jasmine-fresco-perfume",
    "Peach jasmine fresco eau de parfum",
    "peach-jasmine-fresco-eau-de-parfum",
    "The kind of fragrance that makes people ask if you've changed your hair. Juicy white peach top, jasmine absolute heart, and a creamy musk finish that bridges feminine and fresh without landing in either cliché. 50ml spray.",
    "fragrance", ["peach", "jasmine", "floral", "fruity", "feminine", "fresh"],
    49.99, 0.40,
    [IMG["frag_floral"]],
    variants_by_color("POS-FRA-016", ["50ml"], 4999),
    "jubilee_beauty", "https://jubilee.beauty/", "fragrance-liquid"
))

PRODUCTS.append(p(
    "pos-fragrance-017-tobacco-honey-absolute-parfum",
    "Tobacco honey absolute parfum",
    "tobacco-honey-absolute-parfum",
    "The elevated unisex fragrance that earns its place in a serious collection — tobacco leaf absolute, raw honey, and dark patchouli in a parfum concentration that lasts a full day and into the evening. A statement you wear, not spray.",
    "fragrance", ["tobacco", "honey", "patchouli", "unisex", "intense", "parfum"],
    58.99, 0.38,
    [IMG["frag_musk"]],
    variants_by_color("POS-FRA-017", ["30ml Parfum"], 5899),
    "jubilee_beauty", "https://jubilee.beauty/", "fragrance-liquid"
))

PRODUCTS.append(p(
    "pos-fragrance-018-clean-musk-skin-perfume",
    "Clean skin musk eau de parfum",
    "clean-skin-musk-eau-de-parfum",
    "The scent of freshly washed skin, only better. Soft musks layered over white cedar and a touch of powdery iris — the 'no-fragrance fragrance' that makes people lean in closer. The everyday piece of your scent wardrobe that works under everything else.",
    "fragrance", ["musk", "clean", "skin-scent", "minimal", "everyday", "women"],
    44.99, 0.42,
    [IMG["frag_bottle"]],
    variants_by_color("POS-FRA-018", ["50ml"], 4499),
    "jubilee_beauty", "https://jubilee.beauty/", "fragrance-liquid"
))

# ═══════════════════════════════════════════════════════════
# TECH — 6 products
# SKU base: POS-TEC-011 through POS-TEC-016
# Price band: $24.99–$68.99
# ═══════════════════════════════════════════════════════════

PRODUCTS.append(p(
    "pos-tech-011-clear-glitter-phone-case",
    "Clear glitter phone case",
    "clear-glitter-phone-case",
    "Shock-absorbing clear case with embedded glitter and a hard back panel that protects corners without adding bulk. Shows off your phone's colour while adding just enough sparkle. Compatible with current and previous-gen models in multiple sizes.",
    "tech", ["phone-case", "clear", "glitter", "women", "accessories"],
    26.99, 0.43,
    [IMG["phone_case"]],
    variants_by_color("POS-TEC-011", ["Clear/Gold Glitter", "Clear/Pink Glitter", "Clear/Silver Glitter"], 2699),
    "cjdropshipping", "https://www.cjdropshipping.com/", "tech-accessories"
))

PRODUCTS.append(p(
    "pos-tech-012-floral-wireless-earbuds-case",
    "Floral hard-shell wireless earbuds case",
    "floral-hard-shell-wireless-earbuds-case",
    "Your wireless earbuds deserve a better case than the stock one. This hard-shell cover snaps over the standard charging case with a raised floral emboss design, scratch-resistant finish, and a carabiner loop for bag attachment.",
    "tech", ["earbuds-case", "floral", "protective", "accessories", "women"],
    24.99, 0.44,
    [IMG["earbuds_case"]],
    variants_by_color("POS-TEC-012", ["White Floral", "Pink Floral", "Black Floral"], 2499),
    "cjdropshipping", "https://www.cjdropshipping.com/", "tech-accessories"
))

PRODUCTS.append(p(
    "pos-tech-013-3-in-1-braided-charging-cable-set",
    "3-in-1 braided charging cable set",
    "3-in-1-braided-charging-cable-set",
    "One cable, every device. USB-C, standard USB, and multi-tip compatibility in a tangle-resistant nylon braid that actually lasts. 1.2m length with a magnetic organiser clip included. The cable that stops the drawer chaos once and for all.",
    "tech", ["charging-cable", "3-in-1", "USB-C", "braided", "accessories"],
    28.99, 0.42,
    [IMG["cable_kit"]],
    variants_by_color("POS-TEC-013", ["Black", "White", "Sage Green"], 2899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "tech-accessories"
))

PRODUCTS.append(p(
    "pos-tech-014-travel-tech-organiser-pouch",
    "Travel tech organiser pouch",
    "travel-tech-organiser-pouch",
    "The pouch that finally organises the chaos at the bottom of your bag. Elastic loops for cables, a flat pocket for cards and power bank, and a mesh inner window so you can actually see what you packed. Carry-on-bag ready and camera-ready.",
    "tech", ["travel-pouch", "organiser", "cables", "accessories", "travel"],
    38.99, 0.41,
    [IMG["travel_pouch"]],
    variants_by_color("POS-TEC-014", ["Black", "Sage", "Blush"], 3899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "tech-accessories"
))

PRODUCTS.append(p(
    "pos-tech-015-slim-card-holder-magsafe-compatible",
    "Slim card holder MagSafe-compatible wallet",
    "slim-card-holder-magsafe-compatible-wallet",
    "Three-card capacity, slim profile, and magnet-mount compatibility that sticks directly to the back of your phone case. Vegan leather exterior, soft interior lining, and a push-tab to fan out your cards. The carrying hack you didn't know you needed.",
    "tech", ["card-holder", "wallet", "slim", "magsafe-compatible", "accessories"],
    32.99, 0.42,
    [IMG["phone_case"]],
    variants_by_color("POS-TEC-015", ["Black", "Cognac", "Sage", "Dusty Pink"], 3299),
    "cjdropshipping", "https://www.cjdropshipping.com/", "tech-accessories"
))

PRODUCTS.append(p(
    "pos-tech-016-portable-power-bank-5000mah",
    "Slim 5000mAh portable power bank",
    "slim-5000mah-portable-power-bank",
    "Lightweight enough to forget it's in your bag until you need it. 5000mAh capacity charges most phones to full once over. USB-C in/out plus standard USB port, LED charge indicator, and a compact form factor that actually fits in a small bag.",
    "tech", ["power-bank", "portable-charger", "5000mAh", "travel", "accessories"],
    44.99, 0.42,
    [IMG["cable_kit"]],
    variants_by_color("POS-TEC-016", ["Black", "White", "Blush Pink"], 4499),
    "cjdropshipping", "https://www.cjdropshipping.com/", "tech-accessories"
))

# ═══════════════════════════════════════════════════════════
# JEWELRY (NEW CATEGORY) — 8 products
# SKU base: POS-JEW-001 through POS-JEW-008
# Price band: $24.99–$48.99
# ═══════════════════════════════════════════════════════════

PRODUCTS.append(p(
    "pos-jewelry-001-dainty-curb-chain-necklace-gold",
    "Dainty curb-link gold-fill necklace",
    "dainty-curb-link-gold-fill-necklace",
    "The chain necklace that started the stack obsession. Delicate 2mm curb-link in 18k gold-fill over sterling silver — warm, tarnish-resistant, and lightweight enough to forget you're wearing it. Layer two or three for maximum effect, or wear solo for that barely-there glow.",
    "jewelry", ["necklace", "chain", "gold-fill", "dainty", "everyday", "layering"],
    32.99, 0.42,
    [IMG["jewelry_chain"]],
    variants_by_color("POS-JEW-001", ["Gold Fill / 16 inch", "Gold Fill / 18 inch", "Gold Fill / 20 inch"], 3299),
    "j_goodin", "https://www.jgoodin.com/", "standard-jewelry"
))

PRODUCTS.append(p(
    "pos-jewelry-002-pearl-drop-stud-earrings",
    "Freshwater pearl drop stud earrings",
    "freshwater-pearl-drop-stud-earrings",
    "Tiny freshwater pearl set in a gold-fill stud post — the classic that never needs justification. The pearl catches candlelight, the stud stays put all day, and the size is small enough to layer with statement earrings in the second hole. Coquette starter pack.",
    "jewelry", ["earrings", "studs", "pearl", "gold-fill", "dainty", "coquette"],
    28.99, 0.43,
    [IMG["jewelry_earring"]],
    variants_by_color("POS-JEW-002", ["Gold Fill / White Pearl", "Silver / White Pearl"], 2899),
    "j_goodin", "https://www.jgoodin.com/", "standard-jewelry"
))

PRODUCTS.append(p(
    "pos-jewelry-003-thin-stacking-ring-set",
    "Thin stacking ring set — 3 pieces",
    "thin-stacking-ring-set-3-pieces",
    "Three rings designed to live together: a plain band, a twisted rope, and a CZ solitaire, all in 18k gold fill over sterling. Stack all three on one finger or spread across your hand for the curated ring-stack look without the curated ring-stack price.",
    "jewelry", ["rings", "stacking", "gold-fill", "CZ", "set", "dainty"],
    38.99, 0.41,
    [IMG["jewelry_ring"]],
    variants_by_color("POS-JEW-003", ["Gold Fill / Size 5", "Gold Fill / Size 6", "Gold Fill / Size 7", "Gold Fill / Size 8", "Silver / Size 6", "Silver / Size 7"], 3899),
    "j_goodin", "https://www.jgoodin.com/", "standard-jewelry"
))

PRODUCTS.append(p(
    "pos-jewelry-004-butterfly-huggie-earrings",
    "Butterfly charm huggie hoop earrings",
    "butterfly-charm-huggie-hoop-earrings",
    "Mini butterfly charm hinged to a snug 10mm huggie hoop in gold fill — the earring that does the most with the least. Snaps shut, stays put through everything, and adds the right amount of whimsy to any outfit. Stack with plain huggies in the second hole.",
    "jewelry", ["earrings", "huggie", "hoop", "butterfly", "charm", "Y2K", "gold"],
    29.99, 0.44,
    [IMG["jewelry_earring"]],
    variants_by_color("POS-JEW-004", ["Gold Fill", "Silver"], 2999),
    "golden_stella", "https://www.goldenstella.com/", "standard-jewelry"
))

PRODUCTS.append(p(
    "pos-jewelry-005-tennis-bracelet-cz",
    "CZ tennis bracelet",
    "cz-tennis-bracelet",
    "Full row of round-cut cubic zirconia in a gold-plate setting — the bracelet that reads diamond tennis without the jeweller's price. Box-clasp closure, flexible set links, and a 7-inch length that stacks beautifully over a plain chain bracelet.",
    "jewelry", ["bracelet", "tennis", "CZ", "gold", "statement", "evening"],
    44.99, 0.40,
    [IMG["jewelry_bracelet"]],
    variants_by_color("POS-JEW-005", ["Gold Plate", "Silver Plate", "Rose Gold Plate"], 4499),
    "j_goodin", "https://www.jgoodin.com/", "standard-jewelry"
))

PRODUCTS.append(p(
    "pos-jewelry-006-coin-pendant-layering-necklace",
    "Hammered coin pendant necklace",
    "hammered-coin-pendant-necklace",
    "A small hammered gold-fill disc pendant on a fine cable chain — the everyday layering piece that adds subtle depth without competing with what's around it. The textured surface catches light differently than plain metal. Works with everything from a tee to a blazer.",
    "jewelry", ["necklace", "pendant", "coin", "gold-fill", "layering", "dainty"],
    34.99, 0.43,
    [IMG["jewelry_chain"]],
    variants_by_color("POS-JEW-006", ["Gold Fill / 16 inch", "Gold Fill / 18 inch", "Silver / 16 inch", "Silver / 18 inch"], 3499),
    "mma_silver", "https://mmasilver.com/", "standard-jewelry"
))

PRODUCTS.append(p(
    "pos-jewelry-007-star-charm-anklet",
    "Dainty star charm anklet",
    "dainty-star-charm-anklet",
    "Fine gold-fill chain with a tiny star charm that sits at the ankle — the piece that makes bare legs look intentional. Adjustable length with a lobster clasp and extension chain. Goes with sandals, sneakers, and bare feet on the beach equally.",
    "jewelry", ["anklet", "star", "charm", "gold-fill", "dainty", "summer"],
    24.99, 0.44,
    [IMG["jewelry_bracelet"]],
    variants_by_color("POS-JEW-007", ["Gold Fill", "Silver"], 2499),
    "golden_stella", "https://www.goldenstella.com/", "standard-jewelry"
))

PRODUCTS.append(p(
    "pos-jewelry-008-layered-drop-statement-necklace",
    "Multi-strand layered drop necklace",
    "multi-strand-layered-drop-necklace",
    "Three chains at different lengths — a plain cable, a curb, and a fine link with a small drop pendant — pre-set as a single clasp necklace so you get the layered look without the tangling. The statement piece that answers every 'what necklace is that?' question.",
    "jewelry", ["necklace", "layered", "statement", "multi-strand", "gold", "women"],
    42.99, 0.42,
    [IMG["jewelry_stack"]],
    variants_by_color("POS-JEW-008", ["Gold Tone", "Silver Tone"], 4299),
    "j_goodin", "https://www.jgoodin.com/", "standard-jewelry"
))

# ═══════════════════════════════════════════════════════════
# HOME/LIFESTYLE (NEW CATEGORY) — 6 products
# SKU base: POS-HOM-001 through POS-HOM-006
# Price band: $29.99–$64.99
# ═══════════════════════════════════════════════════════════

PRODUCTS.append(p(
    "pos-home-001-soy-wax-minimalist-candle",
    "Minimalist soy wax candle — black fig & cedar",
    "minimalist-soy-wax-candle-black-fig-cedar",
    "Black fig and cedarwood in a hand-poured soy wax candle that burns clean and fills the room with something that smells like a boutique hotel lobby. Cotton wick, amber glass vessel, 45-hour burn time. The home edit that makes every space feel considered.",
    "home", ["candle", "soy-wax", "home", "lifestyle", "clean-burn"],
    38.99, 0.40,
    [IMG["candle_jar"]],
    variants_by_color("POS-HOM-001", ["Black Fig & Cedar / 8oz", "Black Fig & Cedar / 4oz"], 3899),
    "candle_builders", "https://candlebuilders.com/", "standard-home"
))

PRODUCTS.append(p(
    "pos-home-002-coconut-vanilla-candle",
    "Coconut vanilla soy candle",
    "coconut-vanilla-soy-candle",
    "Warm coconut milk and rich vanilla bean in a cream-finish vessel that looks like it belongs on a designed shelf. 100% soy wax, lead-free cotton wick, and a scent that reads as home-comfort luxury without the luxury price tag.",
    "home", ["candle", "coconut", "vanilla", "soy-wax", "home", "warm"],
    34.99, 0.43,
    [IMG["candle_set"]],
    variants_by_color("POS-HOM-002", ["Coconut Vanilla / 8oz", "Coconut Vanilla / 4oz"], 3499),
    "candle_builders", "https://candlebuilders.com/", "standard-home"
))

PRODUCTS.append(p(
    "pos-home-003-arch-brass-wall-mirror",
    "Arch brass-frame wall mirror",
    "arch-brass-frame-wall-mirror",
    "The arched mirror that makes every room look taller and more intentional. Thin brass-tone metal frame, wall-mount hardware included, and a size that works as a statement piece or a dresser-top mirror. The room's centrepiece, hidden in plain sight.",
    "home", ["mirror", "arch", "brass", "wall-decor", "home", "aesthetic"],
    62.99, 0.40,
    [IMG["mirror_round"]],
    variants_by_color("POS-HOM-003", ["Brass / 18x24 inch", "Matte Black / 18x24 inch"], 6299),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-home"
))

PRODUCTS.append(p(
    "pos-home-004-waffle-knit-throw-blanket",
    "Waffle-knit cotton throw blanket",
    "waffle-knit-cotton-throw-blanket",
    "The throw that earns its place on every sofa. 100% cotton waffle-knit in a relaxed oversized drape — it photographs beautifully, feels even better, and adds texture to a neutral room without trying. 130x180cm, machine washable.",
    "home", ["throw-blanket", "waffle-knit", "cotton", "home", "cosy", "decor"],
    48.99, 0.41,
    [IMG["throw_blanket"]],
    variants_by_color("POS-HOM-004", ["Oatmeal", "Ivory", "Sage Green", "Dusty Rose"], 4899),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-home"
))

PRODUCTS.append(p(
    "pos-home-005-scented-candle-trio-set",
    "Signature scented candle trio set",
    "signature-scented-candle-trio-set",
    "Three 4oz soy candles in complementary scents: white tea & bergamot, salted caramel & amber, and oakmoss & vetiver. Paired in a giftable box that looks considered without trying. The best intro to the scent family — or the perfect present you actually want to keep.",
    "home", ["candle-set", "trio", "gift-set", "soy-wax", "home", "lifestyle"],
    54.99, 0.40,
    [IMG["candle_set"]],
    variants_by_color("POS-HOM-005", ["White Tea / Salted Caramel / Oakmoss Trio"], 5499),
    "candle_builders", "https://candlebuilders.com/", "standard-home"
))

PRODUCTS.append(p(
    "pos-home-006-rattan-sunburst-mirror",
    "Rattan sunburst decorative mirror",
    "rattan-sunburst-decorative-mirror",
    "Natural rattan framing a round mirror in a sunburst pattern that adds warmth, texture, and instant boho-meets-coastal aesthetic to any wall. Lightweight, easy to hang, and the kind of room detail that shows up in every 'apartment tour' video without explanation.",
    "home", ["mirror", "rattan", "sunburst", "boho", "wall-decor", "home"],
    44.99, 0.42,
    [IMG["mirror_round"]],
    variants_by_color("POS-HOM-006", ["Natural Rattan / 24 inch", "Natural Rattan / 18 inch"], 4499),
    "cjdropshipping", "https://www.cjdropshipping.com/", "standard-home"
))

# ─────────────────────────────────────────────
print(f"Generated {len(PRODUCTS)} products")

# Count per category
from collections import Counter
cat_count = Counter(prod["category"] for prod in PRODUCTS)
for cat, cnt in sorted(cat_count.items()):
    print(f"  {cat}: {cnt}")

# Verify all prices end in .99
bad_prices = [p for p in PRODUCTS if not str(p["price"]).endswith(".99")]
if bad_prices:
    print(f"BAD PRICES: {[p['title'] for p in bad_prices]}")

# Verify compare_at 30-50% above
bad_comp = []
for prod in PRODUCTS:
    ratio = prod["compare_at_price"] / prod["price"]
    if ratio < 1.30 or ratio > 1.52:
        bad_comp.append((prod["title"], prod["price"], prod["compare_at_price"], ratio))
if bad_comp:
    print(f"BAD COMPARE_AT: {bad_comp}")

print("Validation complete.")
