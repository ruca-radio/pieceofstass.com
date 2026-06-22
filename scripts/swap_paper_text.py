import glob

# Canvas flipped to light cream. --color-paper was light text on dark surfaces.
# As foreground text it must now be --color-espresso to be readable on cream.
# paper has ZERO background/border uses (verified), so every var(--color-paper)
# that is a foreground/text color becomes espresso. We replace the token globally;
# dark surfaces (footer, announcement bar, toasts) are restored to cream afterward
# in their own component edits.
files = []
for ext in ('astro','tsx','ts','css'):
    files += glob.glob(f'src/**/*.{ext}', recursive=True)

total = 0
perfile = {}
for f in files:
    s = open(f).read()
    c = s.count('var(--color-paper)')
    if c:
        s = s.replace('var(--color-paper)', 'var(--color-espresso)')
        open(f,'w').write(s)
        perfile[f] = c
        total += c

for f,c in sorted(perfile.items()):
    print(f"{c:3}  {f}")
print('total replacements:', total)
