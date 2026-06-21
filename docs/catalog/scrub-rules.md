# IP Scrub Rules — Piece of Stass

## Non-negotiable rule
Customer-facing titles, descriptions, tags, SEO fields, image alt text, option names, and merchandising copy must contain **zero protected brand names, model names, logos, monograms tied to a brand, factory claims, or replica language**.

## Banned trademark and model terms
- Nike
- Adidas
- Louis Vuitton
- LV
- Gucci
- Rolex
- Audemars Piguet
- AP
- Apple
- Samsung
- Jordan
- Air Jordan
- Yeezy
- New Balance
- Puma
- Converse
- Vans
- Hoka
- On Running
- Birkenstock
- Dior
- Chanel
- Hermes
- Prada
- Fendi
- Celine
- YSL
- Saint Laurent
- Balenciaga
- Burberry
- Bottega Veneta
- Versace
- Michael Kors
- Coach
- Chloe
- Loewe
- Valentino
- Armani
- Tommy Hilfiger
- Lacoste
- Calvin Klein
- Evisu
- Champion
- Supreme
- Fila
- Off-White
- Bape
- Aape
- Moncler
- The North Face
- Patagonia
- Arc’teryx
- Arc'teryx
- Descente
- Fear of God
- Palm Angels
- Gallery Dept
- Maison Margiela
- MM6
- Amiri
- Zimmermann
- Schiaparelli
- Ralph Lauren
- Miu Miu
- Alexander Wang
- Acne Studios
- Balmain
- Givenchy
- Chrome Hearts
- Jil Sander
- Moschino
- Welldone
- Tom Ford
- Dyson
- Sony
- Beats
- Bose
- JBL
- Marshall
- Bang & Olufsen
- B&O
- Razer
- Audio-Technica
- iPhone
- iPad
- MacBook
- AirPods
- Air Max
- Air Force
- Dunk
- Samba
- Superstar
- Ultra Boost
- NMD
- Cloudnova
- Cloudtilt
- Submariner
- Daytona
- Datejust
- Royal Oak

## Regex checks
Run these checks case-insensitively before publishing:

```regex
(?:Bang\ \&\ Olufsen|Audemars\ Piguet|The\ North\ Face|Maison\ Margiela|Bottega\ Veneta|Tommy\ Hilfiger|Alexander\ Wang|Audio\-Technica|Louis\ Vuitton|Saint\ Laurent|Chrome\ Hearts|Michael\ Kors|Calvin\ Klein|Fear\ of\ God|Gallery\ Dept|Ralph\ Lauren|Acne\ Studios|New\ Balance|Palm\ Angels|Schiaparelli|Ultra\ Boost|Air\ Jordan|On\ Running|Birkenstock|Jil\ Sander|Balenciaga|Off\-White|Zimmermann|Air\ Force|Submariner|Royal\ Oak|Valentino|Patagonia|Arc’teryx|Arc'teryx|Tom\ Ford|Superstar|Cloudnova|Cloudtilt|Converse|Burberry|Champion|Descente|Miu\ Miu|Givenchy|Moschino|Welldone|Marshall|Air\ Max|Datejust|Samsung|Versace|Lacoste|Supreme|Moncler|Balmain|MacBook|AirPods|Daytona|Adidas|Jordan|Chanel|Hermes|Celine|Armani|iPhone|Gucci|Rolex|Apple|Yeezy|Prada|Fendi|Coach|Chloe|Loewe|Evisu|Amiri|Dyson|Beats|Razer|Samba|Nike|Puma|Vans|Hoka|Dior|Fila|Bape|Aape|Sony|Bose|B\&O|iPad|Dunk|YSL|MM6|JBL|NMD|LV|AP)\b
```

```regex
\b(?:replica|reps?|1:1|mirror|AAA|top\s*version|original\s*version|factory|authentic|dupe|inspired\s*by|same\s*as|copy|clone)\b
```

```regex
(?:\b[A-Z]{1,3}\b\s*){2,}|[A-Z]\*+[A-Z]*|[A-Z]\$+[A-Z]*|[A-Z]@+[A-Z]*
```

Use the third rule as a review flag for supplier shorthand such as masked brand abbreviations. It may catch harmless all-caps words, so review manually.

## Rewrite patterns
- `Brand/model running shoe` → `Lightweight mesh runner sneaker`.
- `Brand flap bag` → `Quilted flap crossbody bag`.
- `Brand logo T-shirt` → `Clean typographic short-sleeve tee` only if the final image can be merchandised without visible logo emphasis.
- `Luxury watch model` → `Stainless diver automatic watch` or `blue dial bracelet watch`.
- `Phone brand charger` → `USB-C fast charging kit`.

## Image and alt text rules
- Never write alt text that names a logo or brand visible in the supplier image.
- Use generic alt text: `white high-top court sneaker side view`, `black quilted flap crossbody front view`, `silver blue dial bracelet watch`.
- If a photo prominently displays a protected logo, prioritize re-shooting, cropping, or excluding it from launch.

## Publishing checklist
- Title passes banned-term regex.
- Description passes banned-term regex.
- Tags and SEO fields pass banned-term regex.
- No replica/factory/authenticity claims.
- Supplier URL remains internal.
- Product images are reviewed for visible logos before paid ads or homepage features.
