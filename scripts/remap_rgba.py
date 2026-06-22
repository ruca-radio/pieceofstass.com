import glob, re

# legacy rgb triplets -> v2 warm triplets (alpha preserved)
SUBS = [
    (r'rgba\(\s*198\s*,\s*255\s*,\s*58\s*,', 'rgba(178,94,107,'),   # lime  -> rose-bright
    (r'rgba\(\s*123\s*,\s*92\s*,\s*255\s*,', 'rgba(111,123,95,'),   # violet-> sage
    (r'rgba\(\s*255\s*,\s*77\s*,\s*141\s*,', 'rgba(196,103,61,'),   # pink  -> clay
    (r'rgba\(\s*10\s*,\s*10\s*,\s*11\s*,',   'rgba(42,33,28,'),     # ink   -> espresso
    (r'rgba\(\s*58\s*,\s*58\s*,\s*62\s*,',   'rgba(230,220,207,'),  # slate -> line (rare)
    (r'rgba\(\s*250\s*,\s*250\s*,\s*247\s*,','rgba(246,240,232,'),  # paper -> cream
]

files = []
for ext in ('astro','tsx','ts','css'):
    files += glob.glob(f'src/**/*.{ext}', recursive=True)

total = {}
for f in files:
    s = open(f).read(); orig = s
    for pat, repl in SUBS:
        s = re.sub(pat, repl, s)
    if s != orig:
        open(f,'w').write(s)
        total[f] = sum(len(re.findall(p, orig)) for p,_ in SUBS)

for f,n in sorted(total.items()):
    print(f"{n:3}  {f}")
print('files changed:', len(total))
