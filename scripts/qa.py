from playwright.sync_api import sync_playwright
import sys
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:3000'
R=[]  # (area, check, ok, detail)
def rec(a,c,ok,d=''): R.append((a,c,ok,d))
def scroll_all(pg):
    H=pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0,H,250): pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(30)
    pg.wait_for_timeout(1500)
with sync_playwright() as p:
    b=p.chromium.launch()
    # ── Desktop, retina
    ctx=b.new_context(viewport={'width':1440,'height':900}, device_scale_factor=2); pg=ctx.new_page()
    cons=[]; bad=[]
    pg.on('console', lambda m: cons.append(f'{m.type}: {m.text}') if m.type in ('error','warning') else None)
    pg.on('pageerror', lambda e: cons.append(f'pageerror: {e}'))
    pg.on('response', lambda r: bad.append(f'{r.status} {r.url}') if r.status>=400 else None)
    pg.goto(URL, wait_until='networkidle'); scroll_all(pg)
    imgs=pg.evaluate("[...document.querySelectorAll('img')].map(i=>({s:i.currentSrc.split('/').pop(),ok:i.complete&&i.naturalWidth>0,alt:i.getAttribute('alt'),hid:!!i.closest('[aria-hidden=true]')}))")
    rec('Images','All images load (2x screen)', all(i['ok'] for i in imgs), f"{sum(i['ok'] for i in imgs)}/{len(imgs)}")
    noalt=[i['s'] for i in imgs if i['alt'] is None and not i['hid']]
    rec('Accessibility','Images have alt text', not noalt, ', '.join(noalt))
    rec('Network','No failed requests', not bad, '; '.join(bad[:5]))
    rec('Console','No errors/warnings', not cons, '; '.join(cons[:5]))
    # stuck-hidden content after full scroll
    stuck=pg.evaluate("""[...document.querySelectorAll('[data-reveal],[data-reveal-group]>*,.sh-pre,.work-pre,.svc-pre,.phil-pre,[data-work-meta],[data-hero-fade]')].filter(e=>+getComputedStyle(e).opacity<0.5).length""")
    stuckmask=pg.evaluate("""[...document.querySelectorAll('[data-work-mask],[data-about-mask],[data-hero-media]')].filter(e=>getComputedStyle(e).clipPath.includes('100%')).length""")
    rec('Animation','No content left hidden after scrolling', stuck==0 and stuckmask==0, f'{stuck} faded, {stuckmask} masked')
    # anchors
    miss=pg.evaluate("[...document.querySelectorAll('a[href^=\"#\"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(h.slice(1)))")
    rec('Links','Every in-page link has a target', not miss, ', '.join(sorted(set(miss))))
    ext=pg.evaluate("[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('#'))")
    rec('Links','External links', True, ', '.join(sorted(set(ext))) or 'none (socials/email not set yet)')
    # headings
    hs=pg.evaluate("[...document.querySelectorAll('h1,h2,h3,h4')].map(h=>+h.tagName[1])")
    skips=[ (hs[i-1],hs[i]) for i in range(1,len(hs)) if hs[i]-hs[i-1]>1]
    rec('SEO/A11y','Exactly one h1', hs.count(1)==1, f'h1 x{hs.count(1)}')
    rec('SEO/A11y','No skipped heading levels', not skips, str(skips))
    # names on interactive
    unnamed=pg.evaluate("""[...document.querySelectorAll('a,button,input,select,textarea')].filter(e=>{if(e.closest('[aria-hidden=true]')||e.tabIndex<0&&e.tagName==='A')return false;if(e.type==='hidden'||e.name==='website')return false;const n=(e.getAttribute('aria-label')||e.innerText||e.value||'').trim();const lab=e.id&&document.querySelector(`label[for="${e.id}"]`);return !n&&!lab&&!e.closest('label')}).map(e=>e.outerHTML.slice(0,80))""")
    rec('Accessibility','All controls have accessible names', not unnamed, '; '.join(unnamed[:3]))
    meta=pg.evaluate("({t:document.title,d:document.querySelector('meta[name=description]')?.content?.length,og:!!document.querySelector('meta[property=\"og:title\"]'),lang:document.documentElement.lang,ld:!!document.querySelector('script[type=\"application/ld+json\"]'),canon:document.querySelector('link[rel=canonical]')?.href})")
    rec('SEO','Title, description, OG, lang, JSON-LD', bool(meta['t'] and meta['d'] and meta['og'] and meta['lang'] and meta['ld']), str(meta))
    # perf-ish
    perf=pg.evaluate("(()=>{const r=performance.getEntriesByType('resource');const tot=r.reduce((a,x)=>a+(x.transferSize||x.encodedBodySize||0),0);const js=r.filter(x=>x.name.endsWith('.js')).reduce((a,x)=>a+(x.encodedBodySize||0),0);return {requests:r.length,totalKB:Math.round(tot/1024),jsKB:Math.round(js/1024)}})()")
    rec('Performance','Page weight after full scroll (no music)', perf['totalKB']<3000, str(perf))
    # nav glass + hide on scroll
    pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(600)
    pg.evaluate('scrollTo(0,1200)'); pg.wait_for_timeout(900)
    hidden=pg.evaluate("getComputedStyle(document.querySelector('header')).transform")
    pg.evaluate('scrollTo(0,900)'); pg.wait_for_timeout(900)
    back=pg.evaluate("getComputedStyle(document.querySelector('header')).transform")
    rec('Navigation','Hides on scroll down, returns on scroll up', hidden!=back, f'{hidden} -> {back}')
    # nav links scroll to sections
    okn=[]
    for href in ['#work','#services','#about','#contact']:
        pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(300)
        pg.click(f'nav[aria-label=Primary] a[href="{href}"]'); pg.wait_for_timeout(1400)
        top=pg.evaluate(f"document.querySelector('{href}').getBoundingClientRect().top")
        okn.append((href, abs(top)<160))
    rec('Navigation','Desktop nav links scroll to sections', all(o for _,o in okn), str(okn))
    # project assistant (chat)
    ctas=pg.evaluate("[...document.querySelectorAll('[data-open-chat]')].length")
    rec('Assistant','CTAs wired to the assistant', ctas>=10, f'{ctas} triggers')
    rec('Assistant','Old enquiry form removed', pg.locator('#enquiry').count()==0)
    pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(300)
    pg.click('header [data-open-chat]'); pg.wait_for_selector('[role=dialog]'); pg.wait_for_timeout(2200)
    bx=pg.locator('[role=dialog]').bounding_box(); vw=pg.viewport_size
    rec('Assistant','Opens docked bottom-right', abs(bx['x']+bx['width']-(vw['width']-24))<3 and abs(bx['y']+bx['height']-(vw['height']-24))<3, str(bx))
    ta=pg.locator('#chat-input'); ta.fill('a'); ta.press('Shift+Enter'); nl='\n' in ta.input_value()
    ta.fill('A booking app for yoga studios'); ta.press('Enter'); pg.wait_for_timeout(3200)
    rec('Assistant','Enter sends, Shift+Enter adds a line', nl and pg.locator('.chat-bubble-user').count()==1)
    rec('Assistant','Then asks for name + WhatsApp', pg.locator('#cd-name').count()==1 and pg.locator('#cd-phone').count()==1)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(600)
    closed=pg.locator('[role=dialog]').count()==0
    pg.click('button[aria-label="Continue your project conversation"]'); pg.wait_for_timeout(900)
    rec('Assistant','Esc closes and conversation is restored on reopen', closed and pg.locator('.chat-bubble-user').count()==1)
    pg.click('[aria-label="Close chat"]'); pg.wait_for_timeout(600)
    # vibe toggle
    pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(500)
    pg.click('.vibe-capsule'); pg.wait_for_timeout(1500)
    on=pg.evaluate("document.documentElement.classList.contains('vibe-on')")
    pg.click('.vibe-capsule'); pg.wait_for_timeout(600)
    off=not pg.evaluate("document.documentElement.classList.contains('vibe-on')")
    rec('Vibe mode','Toggles on and off', on and off)
    # keyboard: skip link + focus visible
    pg.goto(URL, wait_until='networkidle'); pg.keyboard.press('Tab')
    first=pg.evaluate("document.activeElement.textContent.trim()")
    rec('Accessibility','First Tab lands on "Skip to content"', 'Skip' in first, first)
    ctx.close()

    # ── Responsive overflow
    for w,h in [(320,640),(375,812),(390,844),(768,1024),(1024,768),(1280,800),(1920,1080)]:
        c=b.new_context(viewport={'width':w,'height':h}, is_mobile=w<768, has_touch=w<1024, device_scale_factor=2); q=c.new_page()
        q.goto(URL, wait_until='networkidle'); scroll_all(q)
        ov=q.evaluate('document.documentElement.scrollWidth-innerWidth')
        wide=q.evaluate("[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1&&!e.closest('[aria-hidden=true]')&&getComputedStyle(e).position!=='fixed'}).slice(0,3).map(e=>e.tagName+'.'+String(e.className).slice(0,40))")
        broken=q.evaluate("[...document.querySelectorAll('img')].filter(i=>!(i.complete&&i.naturalWidth>0)).length")
        rec('Responsive',f'{w}×{h}: no sideways scroll, images OK', ov<=0 and broken==0, f'overflow {ov}px, broken imgs {broken} {wide if ov>0 else ""}')
        pass
        c.close()

    # ── Mobile menu
    c=b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True); q=c.new_page(); q.goto(URL, wait_until='networkidle'); q.wait_for_timeout(800)
    q.tap('button[aria-controls=mobile-menu]'); q.wait_for_timeout(900)
    opened=q.locator('#mobile-menu').count()==1; locked=q.evaluate("document.documentElement.style.overflow")=='hidden'
    q.keyboard.press('Escape'); q.wait_for_timeout(900); closed=q.locator('#mobile-menu').count()==0
    q.tap('button[aria-controls=mobile-menu]'); q.wait_for_timeout(900); q.tap('#mobile-menu a[href="#about"]'); q.wait_for_timeout(1500)
    at=q.evaluate("document.querySelector('#about').getBoundingClientRect().top")
    rec('Mobile menu','Opens, locks scroll, Esc closes, link navigates', opened and locked and closed and abs(at)<160, f'open={opened} lock={locked} esc={closed} aboutTop={round(at)}')
    c.close()

    # ── Reduced motion
    c=b.new_context(viewport={'width':1440,'height':900}, reduced_motion='reduce'); q=c.new_page(); q.goto(URL, wait_until='networkidle'); q.wait_for_timeout(800)
    hid=q.evaluate("[...document.querySelectorAll('[data-hero-word],[data-sh-word],[data-reveal],.sh-pre,.work-pre,[data-work-mask]')].filter(e=>+getComputedStyle(e).opacity<0.5||getComputedStyle(e).clipPath.includes('100%')||getComputedStyle(e).transform.includes('matrix(1, 0, 0, 1, 0, ')&&false).length")
    rec('Reduced motion','All content visible without animations', hid==0, f'{hid} hidden')
    c.close()
    b.close()

w=max(len(a)+len(c) for a,c,_,_ in R)
fails=[r for r in R if not r[2]]
for a,c,ok,d in R: print(('PASS' if ok else 'FAIL'), f'[{a}] {c}', '—', d)
print(f'\n{len(R)-len(fails)}/{len(R)} passed')
