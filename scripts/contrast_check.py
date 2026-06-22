def lum(hex):
    hex = hex.lstrip('#')
    r, g, b = [int(hex[i:i+2], 16)/255 for i in (0, 2, 4)]
    def lin(c):
        return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
    R, G, B = lin(r), lin(g), lin(b)
    return 0.2126*R + 0.7152*G + 0.0722*B

def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

P = {
    'cream':    '#F6F0E8',
    'surface':  '#FBF7F1',
    'surface2': '#F0E7DA',
    'espresso': '#2A211C',
    'muted':    '#726558',
    'faint':    '#94857A',
    'line':     '#E6DCCF',
    'rose':     '#B25E6B',
    'roseDeep': '#8E3F4C',
    'sage':     '#5E6A4F',
    'sageMid':  '#6F7B5F',
    'clay':     '#C4673D',
    'clayDeep': '#9B4824',
    'success':  '#3F6A44',
    'error':    '#B23A33',
    'warning':  '#9C6A22',
    'warningFill':'#E7B45A',
    'paperWhite':'#FFFFFF',
}

checks = [
    ('espresso on cream (body)',        'espresso', 'cream',    4.5),
    ('espresso on surface',             'espresso', 'surface',  4.5),
    ('espresso on surface2',            'espresso', 'surface2', 4.5),
    ('muted on cream (secondary)',      'muted',    'cream',    4.5),
    ('muted on surface',                'muted',    'surface',  4.5),
    ('faint on cream (large/decor)',    'faint',    'cream',    3.0),
    ('rose on cream (link/large)',      'rose',     'cream',    3.0),
    ('roseDeep on cream (body link)',   'roseDeep', 'cream',    4.5),
    ('cream on roseDeep (CTA fill)',    'cream',    'roseDeep', 4.5),
    ('sage on cream (large)',           'sageMid',  'cream',    3.0),
    ('cream on sage (text on sage)',    'cream',    'sage',     4.5),
    ('clay on cream (large/tag txt)',   'clay',     'cream',    3.0),
    ('clayDeep on cream (body)',        'clayDeep', 'cream',    4.5),
    ('cream on clayDeep (sale fill)',   'cream',    'clayDeep', 4.5),
    ('success on cream',                'success',  'cream',    4.5),
    ('cream on success',                'cream',    'success',  4.5),
    ('error on cream',                  'error',    'cream',    4.5),
    ('cream on error',                  'cream',    'error',    4.5),
    ('warning on cream (large)',        'warning',  'cream',    3.0),
    ('espresso on warningFill (badge)', 'espresso', 'warningFill', 4.5),
    ('warning on cream (body text)',    'warning',  'cream',    4.5),
]

print(f"{'check':40} {'ratio':>7}  target  pass")
print('-'*70)
allpass = True
for label, fg, bg, tgt in checks:
    r = ratio(P[fg], P[bg])
    ok = r >= tgt
    if not ok: allpass = False
    print(f"{label:40} {r:6.2f}:1   {tgt:>4}   {'PASS' if ok else '*** FAIL ***'}")
print('-'*70)
print('ALL PASS' if allpass else 'SOME FAILED')
