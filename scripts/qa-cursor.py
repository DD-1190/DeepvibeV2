import sys
from playwright.sync_api import sync_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:3000'
R=[]
def rec(c,ok,d=''): R.append((c,ok,d)); print('PASS' if ok else 'FAIL', c, '—', d)
st=lambda pg: pg.evaluate("document.querySelector('.dv-cursor')?.dataset.state")
vis=lambda pg: pg.evaluate("document.querySelector('.dv-cursor')?.dataset.visible")
ring=lambda pg: pg.evaluate("(()=>{const r=document.querySelector('.dv-cursor__ring').getBoundingClientRect();return [Math.round(r.width),Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)]})()")
dotc=lambda pg: pg.evaluate("(()=>{const r=document.querySelector('.dv-cursor__dot-shape').getBoundingClientRect();return [Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)]})()")
def hover(pg, sel, settle=700):
    el=pg.locator(sel).first; el.scroll_into_view_if_needed(); pg.wait_for_timeout(250)
    bb=el.bounding_box(); x=bb['x']+bb['width']*0.5; y=bb['y']+bb['height']*0.5
    pg.mouse.move(x-30,y-10); pg.mouse.move(x,y,steps=6); pg.wait_for_timeout(settle); return x,y
def shot(pg,name,x,y):
    pass  # pg.screenshot(path=f'cur-{name}.png', clip={'x':max(0,x-90),'y':max(0,y-90),'width':180,'height':180})
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1440,'height':900}); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(1500)
    rec('Mounted on desktop + hides native cursor', pg.evaluate("!!document.querySelector('.dv-cursor') && document.documentElement.classList.contains('has-custom-cursor') && getComputedStyle(document.body).cursor==='none'"))
    rec('Hidden until the mouse moves', vis(pg)=='false')
    pg.mouse.move(700,450); pg.wait_for_timeout(50)
    rec('Appears on first move', vis(pg)=='true')
    # tracking: dot immediate, ring trails then catches up
    pg.mouse.move(300,300); pg.wait_for_timeout(16)
    d=dotc(pg); r=ring(pg)
    rec('Dot follows pointer immediately', abs(d[0]-300)<=1 and abs(d[1]-300)<=1, f'dot {d}')
    rec('Ring trails behind (spring)', abs(r[1]-300)>5 or abs(r[2]-300)>5, f'ring centre right after move {r[1:]}')
    pg.wait_for_timeout(800); r=ring(pg)
    rec('Ring catches up', abs(r[1]-300)<=2 and abs(r[2]-300)<=2, f'{r[1:]}')
    pg.mouse.move(700,500); pg.wait_for_timeout(700)
    rec('Default ring 38px', st(pg)=='default' and ring(pg)[0]==38, f'{st(pg)} {ring(pg)[0]}px')
    x,y=hover(pg,'nav[aria-label=Primary] a[href="/#services"]'); 
    rec('Nav link → hover ring 54px', st(pg)=='hover' and ring(pg)[0]==54, f'{st(pg)} {ring(pg)[0]}px'); shot(pg,'hover',x,y)
    x,y=hover(pg,'nav[aria-label=Primary] a[href="/#contact"].bg-lime, nav[aria-label=Primary] li:last-child a')
    rec("Lime CTA ('Let's Talk') → hover", st(pg)=='hover', st(pg)); shot(pg,'cta',x,y)
    x,y=hover(pg,'#hero-title'); rec('Plain heading → default', st(pg)=='default', st(pg))
    # video (only when a founder video is configured)
    if pg.evaluate("!!document.querySelector('video')"):
        x,y=hover(pg,'[data-hero-media] figure', 900)
        s1=st(pg); rec('Founder video → play/pause cursor 64px', s1 in ('play','pause') and ring(pg)[0]==64, f'{s1} {ring(pg)[0]}px'); shot(pg,'video-'+s1,x,y)
        before=pg.evaluate("document.querySelector('video').paused"); pg.mouse.click(x,y); pg.wait_for_timeout(500)
        after=pg.evaluate("document.querySelector('video').paused"); s2=st(pg)
        rec('Clicking the film toggles playback and swaps icon', before!=after and s2!=s1, f'paused {before}->{after}, cursor {s1}->{s2}'); shot(pg,'video-'+s2,x,y)
        if not pg.evaluate("document.querySelector('video').paused"): pg.mouse.click(x,y); pg.wait_for_timeout(400)
        bx,by=hover(pg,'[data-hero-media] button[aria-label*="founder video"]')
        rec('Play button inside the film → hover ring', st(pg)=='hover', st(pg))
    else:
        x,y=hover(pg,'[data-hero-media] figure', 700)
        rec('Founder photo (no video yet) → no play cursor', st(pg)=='default', st(pg))
    # portfolio
    x,y=hover(pg,'#work-naukri [data-work-mask]', 900)
    lbl=pg.evaluate("document.querySelector('.dv-cursor__label').textContent")
    rec('Portfolio card → filled VIEW ↗ 76px', st(pg)=='view' and ring(pg)[0]==76 and 'View' in lbl, f'{st(pg)} {ring(pg)[0]}px "{lbl}"'); shot(pg,'view',x,y)
    x,y=hover(pg,'#work-naukri h3 a'); rec('Project title link → hover', st(pg)=='hover', st(pg))
    # services button
    x,y=hover(pg,'#svc-btn-design-systems'); rec('Service panel button → hover', st(pg)=='hover', st(pg))
    # drag
    x,y=hover(pg,'[data-cursor=drag]', 900)
    lbl=pg.evaluate("document.querySelector('.dv-cursor__label').textContent")
    rec('Marquee → DRAG cursor 64px', st(pg)=='drag' and ring(pg)[0]==64 and lbl=='Drag', f'{st(pg)} {ring(pg)[0]}px'); shot(pg,'drag',x,y)
    tx0=pg.evaluate("gsap=null; new DOMMatrix(getComputedStyle(document.querySelector('[data-cursor=drag]>div')).transform).m41")
    pg.mouse.down(); pg.mouse.move(x+220,y,steps=10); pg.wait_for_timeout(16)
    tx1=pg.evaluate("new DOMMatrix(getComputedStyle(document.querySelector('[data-cursor=drag]>div')).transform).m41"); pg.mouse.up()
    rec('Marquee actually drags', tx1-tx0>120 or tx1<tx0-200, f'{round(tx0)} → {round(tx1)}')
    # assistant: chips hover, composer keeps native I-beam, clicks pass through
    x,y=hover(pg,'#contact button[data-open-chat="Something else"]'); rec('Starter chip → hover', st(pg)=='hover', st(pg))
    pg.click('#contact button[data-open-chat=""]'); pg.wait_for_selector('#chat-input'); pg.wait_for_timeout(2600)
    rec('Clicks pass through the cursor (chat opened)', pg.locator('[role=dialog]').count()==1)
    x,y=hover(pg,'#chat-input')
    rec('Chat composer → native I-beam, custom hidden', st(pg)=='text' and pg.evaluate("getComputedStyle(document.querySelector('#chat-input')).cursor")=='text', st(pg))
    pg.click('[aria-label="Close chat"]'); pg.wait_for_timeout(500)
    rec('Cursor never captures events', pg.evaluate("getComputedStyle(document.querySelector('.dv-cursor')).pointerEvents")=='none')
    # text selection → native
    el=pg.locator('#about p').first; el.scroll_into_view_if_needed(); bb=el.bounding_box()
    pg.mouse.move(bb['x']+5,bb['y']+10); pg.wait_for_timeout(200); pg.mouse.down(); pg.mouse.move(bb['x']+260,bb['y']+12,steps=8); pg.wait_for_timeout(200)
    sel_state=st(pg); sel_txt=pg.evaluate("document.getSelection().toString().length")
    pg.mouse.up(); pg.wait_for_timeout(200)
    rec('Selecting text → native cursor, then restores', sel_state=='text' and sel_txt>0 and st(pg)!='text', f'during={sel_state} chars={sel_txt} after={st(pg)}')
    # leave viewport
    pg.evaluate("document.dispatchEvent(new MouseEvent('mouseout',{bubbles:true,relatedTarget:null}))"); pg.wait_for_timeout(100)
    rec('Hides when pointer leaves the window', vis(pg)=='false')
    pg.mouse.move(600,400); pg.wait_for_timeout(100); rec('Returns on re-entry', vis(pg)=='true')
    # scroll under a still pointer
    pg.mouse.move(720,450); pg.evaluate("document.querySelector('#work-truckx [data-work-mask]').scrollIntoView({block:'center'})"); pg.wait_for_timeout(1200)
    rec('Updates state when content scrolls under a still pointer', st(pg) in ('view','default','hover'), st(pg))
    # no React re-render on move: count DOM mutations on the cursor root during 60 moves over a plain area
    pg.evaluate("window.__m=0; new MutationObserver(l=>window.__m+=l.filter(r=>r.attributeName!=='style').length).observe(document.querySelector('.dv-cursor'),{attributes:true,subtree:true,childList:true})")
    pg.evaluate("document.querySelector('#philosophy-title').scrollIntoView({block:'center'})"); pg.wait_for_timeout(800)
    bb=pg.locator('#philosophy-title').bounding_box(); pg.mouse.move(bb['x']+20,bb['y']+20); pg.wait_for_timeout(300)
    pg.evaluate("window.__m=0")
    for i in range(120): pg.mouse.move(bb['x']+20+i*4, bb['y']+20+(i%10))
    pg.wait_for_timeout(100); m=pg.evaluate("window.__m")
    rec('No re-render/DOM churn while moving (only transforms)', m==0, f'{m} non-transform changes over 120 moves')
    rec('No console errors', not errs, '; '.join(errs[:3]))
    b.close()

    # touch / tablet
    for name,opts in [('phone',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)),('tablet',dict(viewport={'width':820,'height':1180},is_mobile=True,has_touch=True))]:
        b=p.chromium.launch(); c=b.new_context(**opts); q=c.new_page(); q.goto(URL, wait_until='networkidle'); q.wait_for_timeout(1000)
        rec(f'{name}: not mounted, native cursor kept', q.evaluate("!document.querySelector('.dv-cursor') && !document.documentElement.classList.contains('has-custom-cursor')"))
        b.close()
    # reduced motion
    b=p.chromium.launch(); c=b.new_context(viewport={'width':1440,'height':900}, reduced_motion='reduce'); q=c.new_page(); q.goto(URL, wait_until='networkidle'); q.wait_for_timeout(800)
    q.mouse.move(500,500); q.mouse.move(300,300); q.wait_for_timeout(30); r=ring(q)
    rec('Reduced motion: ring follows instantly (no trailing)', abs(r[1]-300)<=1 and abs(r[2]-300)<=1, f'{r[1:]}')
    b.close()
print(f"\n{sum(1 for r in R if r[1])}/{len(R)} passed")
