#!/usr/bin/env python3
"""Assemble the Softora site into dist/. Run: python3 build.py"""
import pathlib, shutil, re
ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"

COMPANY = "Softora"
PRODUCT = "Academy"
TAGLINE = "Software that runs the institution."
EMAIL = "hello@softora.example"          # TODO replace with the real address
PHONE = "+880 1X XXXX XXXX"              # TODO replace
PHONE_TEL = "+8801000000000"             # TODO replace
ADDRESS = "Dhaka, Bangladesh"            # TODO replace with street address
DEMO_HREF = "contact.html"

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
LOGO = '<img class="logo" src="assets/img/softora.png" alt="" width="30" height="30">'
AMARK = '<span class="pmark"><img src="assets/img/academy.png" alt=""></span>'

NAV = [("index.html", "Home"), ("academy.html", PRODUCT), ("custom.html", "Custom software"), ("work.html", "Work"), ("about.html", "About"), ("contact.html", "Contact")]

def header(cur):
    links = "".join(f'<a href="{h}"{" aria-current=page" if h == cur else ""}>{t}</a>' for h, t in NAV)
    big = "".join(f'<a class="big" href="{h}"{" aria-current=page" if h == cur else ""}>{t}<small>0{i+1}</small></a>' for i, (h, t) in enumerate(NAV))
    return f'''<header class="hdr"><div class="wrap">
<a class="brand" href="index.html" aria-label="{COMPANY} home">{LOGO}<span>{COMPANY}</span></a>
<nav class="nav" aria-label="Main">{links}</nav>
<div class="hdr-cta"><a class="btn btn-line btn-sm" href="{DEMO_HREF}">Talk to us</a><a class="btn btn-ink btn-sm" href="{DEMO_HREF}">Book a demo {ARROW}</a>
<button class="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button></div>
</div></header>
<div class="mnav" aria-label="Mobile">{big}<div class="meta"><a class="btn btn-ink" href="{DEMO_HREF}">Book a demo {ARROW}</a><a class="btn btn-line" href="mailto:{EMAIL}">Email</a></div></div>'''

FOOTER = f'''<footer class="ftr"><div class="wrap">
<div class="ftr-top">
<div><a class="brand" href="index.html">{LOGO}<span>{COMPANY}</span></a><p class="muted" style="max-width:36ch;margin:18px 0 0;font-size:15px">{TAGLINE} {PRODUCT} for schools, colleges and training centres, and custom software for everything else.</p></div>
<div><h5>Product</h5><ul><li><a href="academy.html">{PRODUCT}</a></li><li><a href="academy.html#modules">Modules</a></li><li><a href="academy.html#roles">For every role</a></li><li><a href="academy.html#faq">FAQ</a></li></ul></div>
<div><h5>Company</h5><ul><li><a href="custom.html">Custom software</a></li><li><a href="work.html">Work</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li></ul></div>
<div><h5>Reach us</h5><ul><li><a href="mailto:{EMAIL}">{EMAIL}</a></li><li><a href="tel:{PHONE_TEL}">{PHONE}</a></li><li>{ADDRESS}</li></ul></div>
</div>
<div class="giant" aria-hidden="true">{COMPANY}</div>
<div class="ftr-bot"><span>© <span data-year></span> {COMPANY}. All rights reserved.</span><span>Privacy · Terms · Security</span></div>
</div></footer>'''

def page(fname, title, desc, body_html):
    return f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f4f3ee">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<link rel="icon" href="assets/img/softora.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script type="importmap">{{"imports":{{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}}}</script>
</head><body>
<div class="pre" aria-hidden="true"><img class="logo" src="assets/img/softora.png" alt=""><span class="pct">Loading</span></div>
<div class="shutter" aria-hidden="true"></div>
<div class="progress" aria-hidden="true"></div>
<div class="cur" aria-hidden="true"></div>
{header(fname)}
<main>
{body_html}
</main>
{FOOTER}
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="assets/js/main.js" defer></script>
<script type="module" src="assets/js/scene.js"></script>
</body></html>'''

VARIANTS = {
    "admin": dict(url="academy.yourschool.edu.bd", brand=PRODUCT, side=[("admin","Overview"),("students","Students"),("attendance","Attendance"),("fees","Fees"),("exams","Exams &amp; results"),("timetable","Timetable"),("hr","HR &amp; payroll"),("reports","Reports")], on="admin",
        title="Good morning, Principal", chip="Term 2 · Week 7",
        stats=[("students","Students present","3,912 <span style=\"font-size:12px;color:var(--mute)\">/ 4,180</span>","93.6% today"),("fees","Fees collected · Oct","৳ 2.41 Cr","+8.2% vs Sep"),("exams","Results pending","2 <span style=\"font-size:12px;color:var(--mute)\">of 14 exams</span>","Due Thursday"),("staff","Staff on leave","6","3 approved today")],
        chart=("attendance","Attendance, last 12 days","Section-wise",[62,71,68,80,77,85,83,90,88,94,86,91]), ring=("collection","Collection rate",82),
        small=("sms","Parent notices","SMS",[("Sent","Delivered"),("4,180","<span class=ok>99.1%</span>"),("Fee reminder","<span class=ok>Done</span>")]),
        table=("dues","Fee dues, class 9 &amp; 10","Live",[("Student","Section","Amount","Status"),("Nusrat Jahan","9 · A","৳ 4,500","<span class=ok>Paid · bKash</span>"),("Tanvir Ahmed","10 · B","৳ 4,500","<span class=due>Due 3 days</span>"),("Sadia Islam","9 · C","৳ 2,250","<span class=ok>Paid · Card</span>")])),
    "erp": dict(url="erp.yourfactory.com", brand="Factory ERP", side=[("admin","Overview"),("orders","Orders"),("production","Production"),("inventory","Inventory"),("procurement","Procurement"),("accounts","Accounts"),("reports","Reports")], on="reports",
        title="Daily cost report · Line 3", chip="Order #PO-2291",
        stats=[("orders","Open orders","14","3 shipping this week"),("cost","Cost per piece","৳ 412","−3.1% vs quote"),("wip","WIP pieces","18,400","Cutting 62% done"),("fabric","Fabric on hand","4.2 t","Reorder in 9 days")],
        chart=("output","Output per day, pcs","Line 3",[55,60,58,70,72,78,80,84,82,90,88,93]), ring=("efficiency","Line efficiency",76),
        small=("vat","Mushak 6.3","VAT",[("Month","Status"),("Sep","<span class=ok>Filed</span>"),("Oct","<span class=due>Draft</span>")]),
        table=("po","Purchase orders awaiting approval","Live",[("Supplier","Item","Amount","Status"),("Dhaka Textiles","Twill 240 gsm","৳ 18.4 L","<span class=due>Pending</span>"),("Union Thread","Poly thread","৳ 2.1 L","<span class=ok>Approved</span>"),("Pack & Print","Cartons","৳ 1.6 L","<span class=ok>Approved</span>")])),
    "pos": dict(url="hq.yourpharmacy.com", brand="Retail HQ", side=[("admin","Overview"),("branches","Branches"),("stock","Stock"),("expiry","Expiry"),("purchases","Purchases"),("accounts","Accounts"),("reports","Reports")], on="branches",
        title="19 branches · live", chip="Today",
        stats=[("sales","Sales today","৳ 6.8 L","+11% vs last Thu"),("branches","Branches online","19 <span style=\"font-size:12px;color:var(--mute)\">/ 19</span>","All synced"),("expiring","Expiring in 30 days","212 <span style=\"font-size:12px;color:var(--mute)\">SKUs</span>","Transfer suggested"),("low","Low stock alerts","37","8 critical")],
        chart=("hourly","Sales by hour","All branches",[20,35,48,60,66,58,52,70,84,90,76,60]), ring=("margin","Gross margin",31),
        small=("sync","Branch sync","Live",[("Branch","Last sync"),("Mirpur 10","<span class=ok>12 s ago</span>"),("Uttara 7","<span class=ok>40 s ago</span>")]),
        table=("transfers","Suggested transfers","Auto",[("Item","From","To","Qty"),("Napa Extend 665","Dhanmondi","Uttara 7","240"),("Seclo 20","Mirpur 10","Banani","120"),("Fexo 120","Gulshan 2","Mohakhali","90")])),
}

def dashboard(variant="admin", cls=""):
    """HTML dashboard mockup used on several pages."""
    v = VARIANTS.get(variant, VARIANTS["admin"])
    side = "".join(f'<a class="{"on" if n == v["on"] else ""}"><i></i>{t}</a>' for n, t in v["side"])
    ck, ct, cs, vals = v["chart"]; hi = vals.index(max(vals))
    bars = "".join(f'<i style="--v:{val};--n:{n}" class="{"hi" if n == hi else ""}"></i>' for n, val in enumerate(vals))
    stats = "".join(f'<div class="stat" data-k="{k}"><small>{a}</small><b>{b}</b><em>{c}</em></div>' for k, a, b, c in v["stats"])
    rk, rt, rp = v["ring"]; sk, st, ss, srows = v["small"]; tk, tt, ts, trows = v["table"]
    rows = lambda rs: "".join("<div>" + "".join(f"<span>{c}</span>" for c in r) + "</div>" for r in rs)
    return f'''<div class="device {cls}"><div class="bar"><i></i><i></i><i></i><span>{v["url"]}</span></div>
<div class="dash"><div class="side"><b>{v["brand"]}</b>{side}</div>
<div class="main"><div class="top"><h5>{v["title"]}</h5><span class="chip">{v["chip"]}</span></div>
{stats}
<div class="panel span2" data-k="{ck}"><h6>{ct} <span>{cs}</span></h6><div class="bars">{bars}</div></div>
<div class="panel" data-k="{rk}"><h6>{rt}</h6><div class="ring" style="--p:{rp}" data-v="{rp}%"></div></div>
<div class="panel" data-k="{sk}"><h6>{st} <span>{ss}</span></h6><div class="rows">{rows(srows)}</div></div>
<div class="panel span4" data-k="{tk}"><h6>{tt} <span>{ts}</span></h6><div class="rows">{rows(trows)}</div></div>
</div></div></div>'''

def build():
    if DIST.exists(): shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    shutil.copytree(ROOT / "assets", DIST / "assets", ignore=shutil.ignore_patterns("*-src.png"))
    for src in sorted((ROOT / "pages").glob("*.html")):
        raw = src.read_text()
        m = re.match(r"<!--\s*title:(.*?)\n\s*desc:(.*?)-->\n", raw, re.S)
        title, desc = m.group(1).strip(), m.group(2).strip()
        body_html = raw[m.end():]
        body_html = re.sub(r"\{\{DASH(?::([a-z]+))?(?::([a-z\- ]+))?\}\}", lambda mm: dashboard(mm.group(1) or "admin", mm.group(2) or ""), body_html)
        for k, v in dict(COMPANY=COMPANY, PRODUCT=PRODUCT, TAGLINE=TAGLINE, EMAIL=EMAIL, PHONE=PHONE, PHONE_TEL=PHONE_TEL, ADDRESS=ADDRESS, DEMO=DEMO_HREF, ARROW=ARROW, AMARK=AMARK).items():
            body_html = body_html.replace("{{" + k + "}}", v)
        (DIST / src.name).write_text(page(src.name, title, desc, body_html))
        print("built", src.name)
    for f in ("robots.txt", "_headers"):
        shutil.copy(ROOT / f, DIST / f)

if __name__ == "__main__":
    build()
