"""WCAG contrast ratio helper for Piece of Stass v2 palette verification."""
def _lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
def _lum(hexv):
    h = hexv.lstrip('#')
    r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
    return 0.2126*_lin(r) + 0.7152*_lin(g) + 0.0722*_lin(b)
def ratio(a, b):
    la, lb = _lum(a), _lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)
if __name__ == '__main__':
    CREAM='#F6F0E8'; ESPRESSO='#2A211C'; ROSE='#A14C58'; ROSEB='#B25E6B'
    SAGE='#6F7B5F'; CLAY='#C4673D'; CLAYD='#9B4824'; MUTED='#726558'; FAINT='#94857A'
    SUCCESS='#3F6A44'; ERROR='#B23A33'; WARN='#9C6A22'; WARNFILL='#E7B45A'
    RAISED='#FBF7F1'; SUNKEN='#F0E7DA'; TAUPE='#B8A795'
    pairs = [
        ('Espresso on Cream', ESPRESSO, CREAM),
        ('Muted on Cream', MUTED, CREAM),
        ('Faint on Cream', FAINT, CREAM),
        ('Rose on Cream', ROSE, CREAM),
        ('Cream on Rose', CREAM, ROSE),
        ('Rose-bright on Cream', ROSEB, CREAM),
        ('Cream on Sage', CREAM, SAGE),
        ('Sage on Cream', SAGE, CREAM),
        ('Cream on Clay-deep', CREAM, CLAYD),
        ('Clay-deep on Cream', CLAYD, CREAM),
        ('Cream on Success', CREAM, SUCCESS),
        ('Cream on Error', CREAM, ERROR),
        ('Warning text on Cream', WARN, CREAM),
        ('Espresso on Warning-fill', ESPRESSO, WARNFILL),
        ('Espresso on Raised', ESPRESSO, RAISED),
        ('Espresso on Sunken', ESPRESSO, SUNKEN),
        ('Taupe on Espresso (footer)', TAUPE, ESPRESSO),
        ('Cream on Espresso (footer)', CREAM, ESPRESSO),
        ('Rose-bright on Espresso (footer link)', ROSEB, ESPRESSO),
    ]
    for name, fg, bg in pairs:
        r = ratio(fg, bg)
        aa_body = 'PASS' if r >= 4.5 else 'fail'
        aa_large = 'PASS' if r >= 3.0 else 'FAIL'
        print(f"{name:42s} {r:6.2f}:1  body={aa_body}  large={aa_large}")
