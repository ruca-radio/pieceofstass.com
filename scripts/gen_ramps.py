import json, colorsys

def hex2rgb(h):
    h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def rgb2hex(r,g,b):
    return '#%02X%02X%02X'%(round(r),round(g),round(b))
def mix(c1,c2,t):
    a=hex2rgb(c1); b=hex2rgb(c2)
    return rgb2hex(*[a[i]+(b[i]-a[i])*t for i in range(3)])

WHITE='#FFFFFF'; BLACK='#1A1410'  # warm black endpoint

# anchor each ramp at 500 = base, build toward white (50) and warm-black (950)
def ramp(base):
    # tints (lighter) for 50-400, shades (darker) for 600-950
    out={}
    tint_t=[0.94,0.86,0.74,0.56,0.30]   # 50,100,200,300,400
    shade_t=[0.16,0.34,0.50,0.66,0.82]  # 600,700,800,900,950
    keys_t=[50,100,200,300,400]
    keys_s=[600,700,800,900,950]
    for k,t in zip(keys_t,tint_t): out[str(k)]=mix(base,WHITE,t)
    out['500']=base
    for k,t in zip(keys_s,shade_t): out[str(k)]=mix(base,BLACK,t)
    return out

ramps={
 'cream': ramp('#F6F0E8'),
 'espresso': ramp('#2A211C'),
 'rose': ramp('#A14C58'),
 'sage': ramp('#6F7B5F'),
 'clay': ramp('#C4673D'),
}
print(json.dumps(ramps,indent=2))
