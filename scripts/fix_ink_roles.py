import glob, re

files = []
for ext in ('astro','tsx','ts'):
    files += glob.glob(f'src/**/*.{ext}', recursive=True)

# Skip admin (its own dark theme, handled separately)
files = [f for f in files if 'admin' not in f.lower()]

stats = {}
for f in files:
    s = open(f).read(); orig = s

    # 1) any leftover --color-paper as foreground text -> espresso
    s = s.replace("color: var(--color-paper)", "color: var(--color-espresso)")
    s = s.replace("color: 'var(--color-paper)'", "color: 'var(--color-espresso)'")

    # 2) --color-ink used as a BACKGROUND (dark surface no longer valid on light
    #    canvas) -> sunken cream surface so inset fields/cards read correctly.
    s = s.replace("background: var(--color-ink)", "background: var(--color-surface)")
    s = s.replace("background:var(--color-ink)", "background: var(--color-surface)")
    s = s.replace("background: 'var(--color-ink)'", "background: 'var(--color-surface)'")
    # css custom 'background:' on its own line (addresses.astro:160 style block)
    s = re.sub(r"background:\s*var\(--color-ink\);", "background: var(--color-surface);", s)

    # 3) Every remaining --color-ink is now a FOREGROUND text/icon on a rose/lime
    #    accent fill (backgrounds already converted above) -> cream for AA.
    s = s.replace("var(--color-ink)", "var(--color-cream)")

    if s != orig:
        open(f,'w').write(s)
        stats[f] = 1

for f in sorted(stats): print(' ', f)
print('files changed:', len(stats))
