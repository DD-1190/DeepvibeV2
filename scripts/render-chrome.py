import numpy as np
from PIL import Image
N=1800
def sdf(p):
    x,y,z=p[...,0],p[...,1],p[...,2]
    # rotate for a 3/4 view
    a=1.05; ca,sa=np.cos(a),np.sin(a)
    y,z=ca*y-sa*z, sa*y+ca*z
    b=-0.35; cb,sb=np.cos(b),np.sin(b)
    x,z=cb*x-sb*z, sb*x+cb*z
    ang=np.arctan2(z,x)
    R=1.0+0.06*np.sin(3*ang)
    r=0.2+0.07*np.sin(2*ang+1.3)+0.025*np.sin(5*ang)
    q=np.sqrt(x*x+z*z)-R
    # twist the tube cross-section into an ellipse that rotates around the ring
    t=ang*2.0
    u=q*np.cos(t)-y*np.sin(t); v=q*np.sin(t)+y*np.cos(t)
    d=np.sqrt((u/2.1)**2+(v*1.0)**2)-r
    return d*0.45
def normal(p):
    e=1e-3; n=np.zeros_like(p)
    for i in range(3):
        o=np.zeros(3); o[i]=e
        n[...,i]=sdf(p+o)-sdf(p-o)
    return n/np.linalg.norm(n,axis=-1,keepdims=True)
def env(d):
    x,y,z=d[...,0],d[...,1],d[...,2]
    sky=np.where(y>0, 0.10+0.22*np.exp(-y*4), 0.015+0.02*np.exp(y*6))
    c=np.repeat(sky[...,None],3,-1)*np.array([0.95,1.0,1.02])
    hz=np.exp(-((y-0.03)/0.035)**2)
    c+=hz[...,None]*np.array([1.3,1.32,1.28])
    sb=np.exp(-((x+0.15)**2*5+(z-0.1)**2*5))*np.clip(y,0,1)**1.5
    c+=sb[...,None]*np.array([2.2,2.25,2.2])
    ls=np.exp(-((x+0.75)/0.12)**2)*np.exp(-(y/0.55)**2)
    c+=ls[...,None]*np.array([0.72,0.96,0.42])*2.2
    for xx,w in ((0.55,0.04),(0.8,0.02)):
        st=np.exp(-((x-xx)/w)**2)*np.exp(-(y/0.7)**2)*(z>-0.3)
        c+=st[...,None]*np.array([1.5,1.5,1.45])
    return c
ys,xs=np.mgrid[0:N,0:N].astype(np.float32)
u=(xs+0.5)/N*2-1; v=-((ys+0.5)/N*2-1)
ro=np.array([0,0,4.2]); fov=0.42
rd=np.stack([u*fov,v*fov,-np.ones_like(u)],-1); rd/=np.linalg.norm(rd,axis=-1,keepdims=True)
t=np.zeros(u.shape); hit=np.zeros(u.shape,bool); alive=np.ones(u.shape,bool)
P=ro+rd*t[...,None]
for i in range(320):
    idx=alive
    p=ro+rd[idx]*t[idx][...,None]
    d=sdf(p)
    t[idx]+=d
    h=d<5e-4; far=t[idx]>8
    sub=np.where(idx)
    hit[sub[0][h],sub[1][h]]=True
    alive[sub[0][h|far],sub[1][h|far]]=False
    if not alive.any(): break
p=ro+rd*t[...,None]
col=np.zeros((N,N,3)); alpha=hit.astype(np.float32)
pi=p[hit]; n=normal(pi); dv=rd[hit]
refl=dv-2*(dv*n).sum(-1,keepdims=True)*n
fres=0.85+0.15*(1-np.clip(-(dv*n).sum(-1,keepdims=True),0,1))**4
c=env(refl)*fres
# chrome tint + slight AO from curvature proxy
c=c*np.array([0.95,0.98,1.0])
c=c/(1+0.6*c)*1.15  # tonemap
col[hit]=np.clip(c,0,1)
img=np.dstack([col,alpha[...,None]])
im=Image.fromarray((img*255).astype(np.uint8),'RGBA')
im=im.resize((900,900),Image.LANCZOS)
bb=im.getbbox(); im=im.crop(bb); print(im.size)
# Renders the liquid-chrome form used in Section 03 → public/images/philosophy-chrome.(png|webp)
im.save('public/images/philosophy-chrome-render.png')
im.save('public/images/philosophy-chrome-render.webp',quality=86,method=6)

