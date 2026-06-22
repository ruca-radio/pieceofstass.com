import re, glob, os

# On a Rose (--color-lime) fill, Espresso (--color-ink) text fails AA (3.53:1).
# Cream text on Rose passes (5.03:1). Any line that pairs a lime/rose fill with
# an ink text color: swap that ink -> cream. ink is only ever used as `color:`
# (text) on these lines, so this is safe.
files = []
for ext in ('astro','tsx','ts'):
    files += glob.glob(f'src/**/*.{ext}', recursive=True)

changed = {}
for f in files:
    src = open(f).read()
    out_lines = []
    n = 0
    for line in src.split('\n'):
        if 'var(--color-lime)' in line and 'var(--color-ink)' in line:
            # replace ink with cream wherever ink appears on this line
            new = line.replace('--color-ink)', '--color-cream)')
            if new != line:
                n += 1
            out_lines.append(new)
        else:
            out_lines.append(line)
    if n:
        open(f,'w').write('\n'.join(out_lines))
        changed[f] = n

for f,n in changed.items():
    print(f"{n:3}  {f}")
print('total lines changed:', sum(changed.values()))
