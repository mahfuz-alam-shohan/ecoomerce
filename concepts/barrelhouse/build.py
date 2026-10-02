#!/usr/bin/env python3
"""Assemble static pages into dist/. Run: python3 build.py"""
import pathlib, shutil, re
ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"

PHONE = "(814) 778-2243"; TEL = "+18147782243"
ADDR1 = "8946 US Route 6"; ADDR2 = "Kane, PA 16735"
EMAIL = "thebarrelhouserestaurant@gmail.com"
MAPS = "https://www.google.com/maps/search/?api=1&query=Barrel+House+Restaurant+%26+Tavern+8946+US-6+Kane+PA+16735"

LOGO = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><ellipse cx="24" cy="8" rx="13" ry="3.5"/><path d="M11 8c-3 10-3 22 0 32M37 8c3 10 3 22 0 32"/><path d="M11 40c0 2 6 3.5 13 3.5S37 42 37 40"/><path d="M9.6 17c3 1.6 9 2.4 14.4 2.4S35.4 18.6 38.4 17M9.6 31c3 1.6 9 2.4 14.4 2.4S35.4 32.6 38.4 31"/></svg>'
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18.3 5.5 22l1.7-7.4-5.7-5 7.5-.7z"/></svg>'

NAV = [("index.html", "Home"), ("menu.html", "Menu"), ("tavern.html", "Tavern"), ("story.html", "Our Story"), ("visit.html", "Visit")]

def header(cur):
    links = "".join(f'<a href="{h}"{" aria-current=page" if h == cur else ""}>{t}</a>' for h, t in NAV)
    big = "".join(f'<a class="big" href="{h}"{" aria-current=page" if h == cur else ""}>{t}</a>' for h, t in NAV)
    return f'''<header class="hdr"><div class="wrap">
<a class="brand" href="index.html" aria-label="Barrel House home">{LOGO}<span><b>Barrel House</b><small>Restaurant &amp; Tavern</small></span></a>
<nav class="nav" aria-label="Main">{links}</nav>
<div class="hdr-cta"><span class="status"><i></i><em>Open daily</em></span>
<button class="theme-t" aria-label="Switch light or dark theme"><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
<a class="btn btn-primary" href="tel:{TEL}" style="--h:46px" aria-label="Call {PHONE}"><span>Call</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg></a>
<button class="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button></div>
</div></header>
<div class="mnav" aria-label="Mobile">{big}<div class="meta"><span class="status"><i></i><em>Open daily</em></span><a href="tel:{TEL}">{PHONE}</a><span>{ADDR1}, {ADDR2}</span></div></div>'''

FOOTER = f'''<footer class="ftr"><div class="wrap">
<div class="ftr-top">
<div><a class="brand" href="index.html">{LOGO}<span><b>Barrel House</b><small>Restaurant &amp; Tavern</small></span></a>
<p class="muted" style="max-width:34ch;margin-top:20px">Breakfast, lunch, dinner and a full bar at Lantz Corners, where Route 6 meets Route 219.</p></div>
<div><h5>Visit</h5><ul><li>{ADDR1}</li><li>{ADDR2}</li><li><a class="link-u" href="{MAPS}" target="_blank" rel="noopener">Get directions</a></li></ul></div>
<div><h5>Hours</h5><ul><li>Every day</li><li>6:00 AM – 9:00 PM</li><li class="muted">Kitchen &amp; bar</li></ul></div>
<div><h5>Contact</h5><ul><li><a class="link-u" href="tel:{TEL}">{PHONE}</a></li><li><a class="link-u" href="mailto:{EMAIL}">Email us</a></li><li><a class="link-u" href="https://www.facebook.com/100063626707462/" target="_blank" rel="noopener">Facebook</a></li></ul></div>
</div>
<div class="giant" aria-hidden="true">Barrel House</div>
<div class="ftr-bot"><span>© <span data-year></span> Barrel House Restaurant &amp; Tavern · Kane, Pennsylvania</span><span>Concept design preview · not the official website</span></div>
</div></footer>'''

def page(fname, title, desc, body_html):
    return f'''<!doctype html>
<html lang="en" data-theme="light"><head>
<script>try{{var t=localStorage.getItem("bh-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t;}}catch(e){{}}</script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f7f1e7">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..600,0..100,0..1;1,9..144,300..600,0..100,0..1&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
</head><body>
<div class="pre" aria-hidden="true"><svg class="mark" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><ellipse cx="24" cy="8" rx="13" ry="3.5"/><path d="M11 8c-3 10-3 22 0 32M37 8c3 10 3 22 0 32"/><path d="M11 40c0 2 6 3.5 13 3.5S37 42 37 40"/><path d="M9.6 17c3 1.6 9 2.4 14.4 2.4S35.4 18.6 38.4 17M9.6 31c3 1.6 9 2.4 14.4 2.4S35.4 32.6 38.4 31"/></svg><span class="word">Lantz Corners · Kane, PA</span><span class="pct">0</span></div>
<div class="curtain" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
<div class="progress" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<div class="cur" aria-hidden="true"></div><div class="cur-dot" aria-hidden="true"></div>
{header(fname)}
<main>
{body_html}
</main>
{FOOTER}
<div class="concept" role="note"><span><b>Concept preview.</b> <span class="long">A design proposal, not the official Barrel House site.</span><span class="short">Not the official site.</span></span><button aria-label="Dismiss">✕</button></div>
<script src="assets/js/main.js" defer></script>
</body></html>'''

def build():
    if DIST.exists(): shutil.rmtree(DIST)
    (DIST / "assets").mkdir(parents=True)
    shutil.copytree(ROOT / "assets", DIST / "assets", dirs_exist_ok=True)
    for src in sorted((ROOT / "pages").glob("*.html")):
        raw = src.read_text()
        m = re.match(r"<!--\s*title:(.*?)\n\s*desc:(.*?)-->\n", raw, re.S)
        title, desc = m.group(1).strip(), m.group(2).strip()
        body_html = raw[m.end():]
        for k, v in dict(PHONE=PHONE, TEL=TEL, ADDR1=ADDR1, ADDR2=ADDR2, EMAIL=EMAIL, MAPS=MAPS, ARROW=ARROW, STAR=STAR, LOGO=LOGO).items():
            body_html = body_html.replace("{{" + k + "}}", v)
        (DIST / src.name).write_text(page(src.name, title, desc, body_html))
        print("built", src.name)
    for f in ("robots.txt", "_headers"):
        shutil.copy(ROOT / f, DIST / f)

if __name__ == "__main__":
    build()
