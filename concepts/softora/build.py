#!/usr/bin/env python3
"""Assemble the Softora site into dist/. Run: python3 build.py"""
import pathlib, shutil, re
ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"

# ---- company details (replace placeholders) ----
COMPANY = "Softora"
PRODUCT = "Academy"
EMAIL = "hello@softora.example"            # TODO real address
PHONE = "+880 1XXX-XXXXXX"                 # TODO real number
PHONE_TEL = "+8801000000000"               # TODO
WHATSAPP = "https://wa.me/8801000000000"   # TODO
ADDRESS = "Dhaka, Bangladesh"              # TODO street address

# ---- icons (24x24 stroke) ----
I = {
 "home": '<path d="M3.5 10.5 12 3.5l8.5 7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z"/>',
 "grid": '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="3.5"/>',
 "layers": '<path d="M12 3.5 2.5 8.5 12 13.5l9.5-5z"/><path d="M2.5 12.5 12 17.5l9.5-5"/><path d="M2.5 16.5 12 21.5l9.5-5"/>',
 "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
 "chat": '<path d="M20.5 12a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1-4.4A8.5 8.5 0 1 1 20.5 12z"/><path d="M8.5 12h.1M12 12h.1M15.5 12h.1"/>',
 "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
 "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>',
 "wallet": '<rect x="3" y="6" width="18" height="13.5" rx="3"/><path d="M3 10h18M16 14.75h1.5"/>',
 "award": '<circle cx="12" cy="9" r="5.5"/><path d="M8.6 13.4 7.2 21l4.8-2.6 4.8 2.6-1.4-7.6"/>',
 "bell": '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
 "calendar": '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 "book": '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 20.5A2.5 2.5 0 0 0 7.5 23H19v-5"/>',
 "bus": '<rect x="4.5" y="3.5" width="15" height="14" rx="3"/><path d="M4.5 11h15M8 17.5V20M16 17.5V20M8 14.3v.1M16 14.3v.1"/>',
 "building": '<path d="M4 21V6.5L12 3l8 3.5V21"/><path d="M9.5 21v-4.5h5V21M8 9.5v.1M12 9.5v.1M16 9.5v.1M8 13v.1M12 13v.1M16 13v.1"/>',
 "chart": '<path d="M3.5 20.5h17M7 16.5v-5M12 16.5V6M17 16.5v-8"/>',
 "shield": '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
 "phone": '<rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M11 18.5h2"/>',
 "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
 "code": '<path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5M13.5 5l-3 14"/>',
 "plug": '<path d="M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 0 1-11 0zM12 16.5V21"/>',
 "box": '<path d="M12 2.8 20.5 7.5v9L12 21.2 3.5 16.5v-9z"/><path d="M3.8 7.6 12 12l8.2-4.4M12 12v9"/>',
 "cart": '<path d="M3 4h2.5l2.2 11h10.6L20.5 7H7"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
 "briefcase": '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18"/>',
 "factory": '<path d="M3 20.5V10l5.5 3.5V10l5.5 3.5V10l4-2.5V4h3v16.5z"/><path d="M7 17h2M12 17h2M17 17h1"/>',
 "heart": '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>',
 "truck": '<path d="M2.5 6h11v10.5h-11zM13.5 9.5h4l3 3.5v3.5h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
 "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
 "lock": '<rect x="4.5" y="10.5" width="15" height="10.5" rx="3"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
 "download": '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4 19.5h16"/>',
 "server": '<rect x="3.5" y="4" width="17" height="7" rx="2.5"/><rect x="3.5" y="13" width="17" height="7" rx="2.5"/><path d="M7.5 7.5v.1M7.5 16.5v.1"/>',
 "mail": '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7 12 13l8.5-6"/>',
 "pin": '<path d="M12 21s7-6.1 7-11.5a7 7 0 0 0-14 0C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 "spark": '<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.6 2.6M15.4 15.4 18 18M6 18l2.6-2.6M15.4 8.6 18 6"/>',
 "sliders": '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
 "language": '<path d="M3.5 5.5h9M8 3.5v2M10.5 5.5c-.6 3.4-2.7 6.2-6 7.8M6 8.5c1 2 2.8 3.6 5 4.5"/><path d="M13 20.5 16.5 12l3.5 8.5M14.2 17.8h4.6"/>',
 "receipt": '<path d="M6 3h12v18l-2.5-1.6L13 21l-2.5-1.6L8 21l-2-1.3z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
 "fingerprint": '<path d="M7.5 18.5c1-1.8 1.5-4 1.5-6.5a3 3 0 0 1 6 0c0 1.5-.1 3-.4 4.4M12 12c0 3.2-.8 6-2.2 8.3M18 15.5c.3-1.1.5-2.3.5-3.5a6.5 6.5 0 0 0-11.3-4.4M5.5 15.5c.3-1.1.5-2.3.5-3.5"/>',
 "home2": '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>',
 "wa": '<path d="M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.2-4.2A8.5 8.5 0 1 1 20.5 12z"/><path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l1-1.6-2-1-1 .9c-1.2-.5-2.3-1.6-2.8-2.8l.9-1-1-2z"/>',
 "rocket": '<path d="M5 15c-1 1-1.5 3.5-1.5 5.5 2 0 4.5-.5 5.5-1.5M9.5 14.5 6 13l2-4h5M10.5 18l-1-3.5M10 15l5.5-5.5C17.5 7.5 19 5 20.5 3.5 19 5 16.5 6.5 14.5 8.5L9 14"/><path d="M15 9.5v5l-4 2"/>',
}
def ico(name, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{I[name]}</svg>'
ARROW = ico("arrow")

NAV = [("index.html", "Home", "home"), ("academy.html", PRODUCT, "grid"), ("solutions.html", "Solutions", "layers"), ("about.html", "About", "info"), ("contact.html", "Contact", "chat")]

def header(cur):
    links = "".join(f'<a href="{h}"{" aria-current=page" if h == cur else ""}>{t}</a>' for h, t, _ in NAV)
    return f'''<header class="hdr"><div class="wrap">
<a class="brand" href="index.html" aria-label="{COMPANY} home"><img src="assets/img/softora.png" alt="" width="30" height="30">{COMPANY}</a>
<nav class="nav" aria-label="Main">{links}</nav>
<div class="hdr-cta"><a class="btn btn-ghost btn-sm" href="contact.html?topic=project">Start a project</a><a class="btn btn-primary btn-sm" href="contact.html?topic=demo">Book a demo</a></div>
</div></header>'''

def tabbar(cur):
    items = "".join(f'<a href="{h}"{" aria-current=page" if h == cur else ""}>{ico(i)}<span>{t}</span></a>' for h, t, i in NAV)
    return f'<nav class="tabbar" aria-label="Main">{items}</nav>'

FOOTER = f'''<footer class="ftr"><div class="wrap">
<div class="ftr-grid">
<div><a class="brand" href="index.html"><img src="assets/img/softora.png" alt="" width="30" height="30">{COMPANY}</a><p class="about">We build {PRODUCT}, the management system for schools, colleges and training centres, and custom software for businesses.</p></div>
<div class="ftr-cols">
<div><h5>Product</h5><ul><li><a href="academy.html">{PRODUCT}</a></li><li><a href="academy.html#modules">Modules</a></li><li><a href="academy.html#roles">For every role</a></li><li><a href="contact.html?topic=demo">Book a demo</a></li></ul></div>
<div><h5>Company</h5><ul><li><a href="solutions.html">Custom software</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li></ul></div>
</div>
<div><h5>Reach us</h5><ul><li><a href="mailto:{EMAIL}">{EMAIL}</a></li><li><a href="tel:{PHONE_TEL}">{PHONE}</a></li><li>{ADDRESS}</li></ul></div>
</div>
<div class="ftr-bot"><span>© <span data-year></span> {COMPANY}. All rights reserved.</span><span>Privacy · Terms</span></div>
</div></footer>'''

# ---- Academy app screens (phone mockup) ----
SCREENS = {
"overview": '''<div class="app-h"><div><small>Good morning</small><b>Principal's desk</b></div><span class="av">PR</span></div>
<div class="kpis"><div class="ac"><small>Present today</small><div class="big">93.6%</div><div class="sub">3,912 of 4,180</div></div><div class="ac"><small>Fees · Oct</small><div class="big">৳24.1L</div><div class="sub">82% collected</div></div></div>
<div class="ac" style="margin-top:8px"><small>Collection progress</small><div class="bar"><i style="--w:82%"></i></div></div>
<div class="ac"><small>Needs your approval</small><div class="st"><div class="n">Leave · Mr. Karim<small>2 days · Science</small></div><span class="tag">Review</span></div><div class="st"><div class="n">Fee waiver · Class 7<small>3 students</small></div><span class="tag r">Pending</span></div></div>''',
"attendance": '''<div class="app-h"><div><small>Thursday · Period 1</small><b>Class 8 · B</b></div><span class="av">TA</span></div>
<div class="ac"><small>Marked so far</small><div class="big">34 <span class="sub">/ 38 present</span></div><div class="bar"><i style="--w:89%"></i></div></div>
<div class="ac"><div class="st"><div class="n">Arif Hossain<small>Roll 01</small></div><div class="pa"><span class="p">P</span><span>A</span></div></div><div class="st"><div class="n">Fatema Akter<small>Roll 02</small></div><div class="pa"><span class="p">P</span><span>A</span></div></div><div class="st"><div class="n">Mahin Rahman<small>Roll 03</small></div><div class="pa"><span>P</span><span class="a">A</span></div></div><div class="st"><div class="n">Nabila Islam<small>Roll 04</small></div><div class="pa"><span class="p">P</span><span>A</span></div></div></div>
<span class="app-btn">Submit · SMS 4 parents</span>''',
"fees": '''<div class="app-h"><div><small>Nusrat · Class 9 A</small><b>Fees</b></div><span class="av">NJ</span></div>
<div class="ac"><small>Due by 12 Oct</small><div class="big">৳4,500</div><div class="sub">Tuition ৳3,800 · Lab ৳700</div></div>
<div class="ac"><small>Pay with</small><div class="paym"><span class="sel">bKash</span><span>Nagad</span><span>Card</span></div><span class="app-btn">Pay ৳4,500</span></div>
<div class="ac"><small>Last payment</small><div class="st"><div class="n">September tuition<small>Paid 8 Sep · bKash</small></div><span class="tag gr">Paid</span></div></div>''',
"results": '''<div class="app-h"><div><small>Term 1 · 2026</small><b>Results</b></div><span class="av">NJ</span></div>
<div class="ac"><small>GPA</small><div class="gpa"><span class="big">4.83</span><span class="sub">Rank 6 of 58</span></div></div>
<div class="ac"><div class="sub-r"><span>Mathematics</span><div class="meter"><i style="--w:96%"></i></div><b>A+</b></div><div class="sub-r"><span>Physics</span><div class="meter"><i style="--w:92%"></i></div><b>A+</b></div><div class="sub-r"><span>English</span><div class="meter"><i style="--w:84%"></i></div><b>A</b></div><div class="sub-r"><span>Bangla</span><div class="meter"><i style="--w:90%"></i></div><b>A+</b></div><div class="sub-r"><span>ICT</span><div class="meter"><i style="--w:95%"></i></div><b>A+</b></div></div>
<span class="app-btn">Download report card</span>''',
"notices": f'''<div class="app-h"><div><small>From your school</small><b>Notices</b></div><span class="av">NJ</span></div>
<div class="ac"><div class="nt"><span class="dot">{ico("bell","")}</span><div><b>School closed on Sunday<span class="tag">New</span></b><small>Today · 9:12 AM</small></div></div><div class="nt"><span class="dot">{ico("calendar","")}</span><div><b>Half-yearly exam routine published</b><small>Yesterday</small></div></div><div class="nt"><span class="dot">{ico("wallet","")}</span><div><b>October fees due 12 Oct<span class="tag r">Due</span></b><small>2 days ago</small></div></div><div class="nt"><span class="dot">{ico("award","")}</span><div><b>Science fair registration open</b><small>Monday</small></div></div></div>''',
"routine": '''<div class="app-h"><div><small>Thursday</small><b>Today's classes</b></div><span class="av">NJ</span></div>
<div class="ac"><div class="rt"><time>8:00</time><b>Bangla</b><small>Rm 204</small></div><div class="rt now"><time>8:45</time><b>Mathematics</b><small>Now</small></div><div class="rt"><time>9:30</time><b>Physics lab</b><small>Lab 2</small></div><div class="rt"><time>10:30</time><b>Break</b><small></small></div><div class="rt"><time>11:00</time><b>English</b><small>Rm 204</small></div></div>
<div class="ac"><small>Homework</small><div class="st"><div class="n">Physics · Ch. 4 numericals<small>Due tomorrow</small></div><span class="tag">2 left</span></div></div>''',
}
NAVMAP = [("home", "overview results"), ("calendar", "attendance routine"), ("wallet", "fees"), ("bell", "notices")]

def phone(screens, active, toasts=None, tilt=True):
    sc = "".join(f'<div class="screen{" on" if s == active else ""}" data-screen="{s}">{SCREENS[s]}</div>' for s in screens)
    nav = "".join(f'<span data-for="{f}">{ico(i, "")}</span>' for i, f in NAVMAP)
    ts = ""
    if toasts:
        ts = '<div class="toasts">' + "".join(f'<div class="toast t{k+1}"><span class="tile">{ico(i)}</span><div>{a}<small>{b}</small></div></div>' for k, (i, a, b) in enumerate(toasts)) + "</div>"
    return f'''<div class="stage"><div class="phone"{" data-tilt" if tilt else ""}><span class="notch"></span><div class="scr"><div class="ps-status"><span>9:41</span><i></i></div><div class="screens">{sc}</div><div class="ps-nav">{nav}</div></div></div>{ts}</div>'''

LAPTOP = f'''<div class="laptop"><div class="win"><div class="win-bar"><i></i><i></i><i></i><span>academy.yourschool.edu.bd</span></div>
<div class="dsh"><div class="sb"><div class="lg"><img src="assets/img/academy.png" alt="">{PRODUCT}</div>
<a class="on">{ico("home","")}Overview</a><a>{ico("users","")}Students</a><a>{ico("calendar","")}Attendance</a><a>{ico("wallet","")}Fees</a><a>{ico("award","")}Exams</a><a>{ico("clock","")}Timetable</a><a>{ico("briefcase","")}HR &amp; payroll</a><a>{ico("chart","")}Reports</a></div>
<div class="mn"><div class="tp"><div><small>Thursday, 2 October</small><b>Good morning, Principal</b></div><span class="pill">Term 2 · Week 7</span></div>
<div class="k"><small>Present today</small><b>3,912</b><em>93.6% of students</em></div>
<div class="k"><small>Fees collected · Oct</small><b>৳24.1L</b><em>+8.2% vs September</em></div>
<div class="k"><small>Results pending</small><b>2</b><em style="color:#e2622c">Due Thursday</em></div>
<div class="k"><small>Staff on leave</small><b>6</b><em>3 approved today</em></div>
<div class="bx s2"><h6>Attendance · last 12 days <span>All sections</span></h6><div class="cols">{"".join(f'<i style="--h:{v}%;--n:{n}" class="{"hi" if n == 9 else ""}"></i>' for n, v in enumerate([62,71,68,80,77,85,83,90,88,96,86,91]))}</div></div>
<div class="bx"><h6>Collection rate</h6><div class="donut" style="--v:82" data-v="82%"></div></div>
<div class="bx"><h6>SMS to parents <span>Today</span></h6><table class="tbl"><tr><td>Sent</td><td>4,180</td></tr><tr><td>Delivered</td><td style="color:#14a06f">99.1%</td></tr><tr><td>Absence alerts</td><td>268</td></tr></table></div>
<div class="bx s4"><h6>Fee dues · Classes 9 &amp; 10 <span>Live</span></h6><table class="tbl"><tr><th>Student</th><th>Section</th><th>Amount</th><th>Status</th></tr><tr><td>Nusrat Jahan</td><td>9 · A</td><td>৳4,500</td><td><span class="pill">Paid · bKash</span></td></tr><tr><td>Tanvir Ahmed</td><td>10 · B</td><td>৳4,500</td><td><span class="pill d">Due in 3 days</span></td></tr><tr><td>Sadia Islam</td><td>9 · C</td><td>৳2,250</td><td><span class="pill">Paid · Card</span></td></tr></table></div>
</div></div></div></div>'''

def page(fname, title, desc, body_html):
    return f'''<!doctype html>
<html lang="en" class="no-js"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f7f8fc">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:image" content="assets/img/softora.png">
<link rel="icon" href="assets/img/softora.png" type="image/png"><link rel="apple-touch-icon" href="assets/img/softora.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script type="importmap">{{"imports":{{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}}}</script>
</head><body>
<div class="bg-noise" aria-hidden="true"></div>
<div class="veil" aria-hidden="true"></div>
{header(fname)}
<main>
{body_html}
</main>
{FOOTER}
{tabbar(fname)}
<script src="assets/js/main.js" defer></script>
{'<script type="module" src="assets/js/scene.js"></script>' if 'data-scene' in body_html else ''}
</body></html>'''

def render(body):
    body = re.sub(r"\{\{PHONE:([a-z ]+)\|([a-z]+)(\|toasts)?\}\}", lambda m: phone(m.group(1).split(), m.group(2), TOASTS if m.group(3) else None), body)
    body = re.sub(r"\{\{I:([a-z0-9]+)\}\}", lambda m: ico(m.group(1)), body)
    for k, v in dict(COMPANY=COMPANY, PRODUCT=PRODUCT, EMAIL=EMAIL, PHONE=PHONE, PHONE_TEL=PHONE_TEL, WHATSAPP=WHATSAPP, ADDRESS=ADDRESS, ARROW=ARROW, LAPTOP=LAPTOP).items():
        body = body.replace("{{" + k + "}}", v)
    return body

TOASTS = [("check", "Attendance submitted", "Class 8 · B · 8:12 AM"), ("wallet", "৳4,500 received", "bKash · Nusrat, 9 A"), ("bell", "Notice delivered", "4,180 parents by SMS")]

def build():
    if DIST.exists(): shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    shutil.copytree(ROOT / "assets", DIST / "assets", ignore=shutil.ignore_patterns("*-src.png"))
    for src in sorted((ROOT / "pages").glob("*.html")):
        raw = src.read_text()
        m = re.match(r"<!--\s*title:(.*?)\n\s*desc:(.*?)-->\n", raw, re.S)
        title, desc = m.group(1).strip(), m.group(2).strip()
        (DIST / src.name).write_text(page(src.name, title, desc, render(raw[m.end():])))
        print("built", src.name)
    for f in ("robots.txt", "_headers", "_redirects"):
        shutil.copy(ROOT / f, DIST / f)

if __name__ == "__main__":
    build()
