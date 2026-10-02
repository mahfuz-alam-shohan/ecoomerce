(() => {
  const d = document, root = d.documentElement, body = d.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const ss = { get(k){ try { return sessionStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { sessionStorage.setItem(k,v); } catch(e){} } };
  const $ = (s, c=d) => c.querySelector(s), $$ = (s, c=d) => [...c.querySelectorAll(s)];

  /* ---------- split headlines ---------- */
  $$('[data-split]').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(' ')); return; }
            const w = d.createElement('span'); w.className = 'w';
            const s = d.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el); el.classList.add('split');
  });

  /* ---------- preloader / page transition ---------- */
  const pre = $('.pre'), curtain = $('.curtain');
  const start = () => { body.classList.add('loaded'); revealHero(); };
  const revealHero = () => $$('.hero [data-split], .hero [data-reveal]').forEach(e => e.classList.add('in'));
  if (pre && !ss.get('bh-seen') && !reduce) {
    ss.set('bh-seen', '1');
    const pct = $('.pct', pre); let n = 0;
    const t = setInterval(() => { n = Math.min(100, n + Math.ceil(Math.random()*9)); pct.textContent = n; if (n >= 100) { clearInterval(t); setTimeout(() => { pre.classList.add('out'); setTimeout(start, 350); setTimeout(() => pre.remove(), 1200); }, 250); } }, 45);
  } else {
    pre && pre.remove();
    if (curtain && ss.get('bh-nav') && !reduce) {
      curtain.classList.add('cover'); ss.set('bh-nav', '');
      requestAnimationFrame(() => requestAnimationFrame(() => { curtain.classList.add('lift'); setTimeout(() => { curtain.classList.remove('cover','lift'); }, 1000); }));
      setTimeout(start, 250);
    } else start();
  }
  addEventListener('pageshow', e => { if (e.persisted && curtain) { curtain.classList.remove('cover','lift'); start(); } });
  d.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a || reduce) return;
    const href = a.getAttribute('href');
    if (!href || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || /^(https?:|mailto:|tel:|#)/.test(href)) return;
    e.preventDefault(); body.classList.remove('menu-open');
    ss.set('bh-nav', '1'); curtain.classList.remove('lift'); curtain.classList.add('cover');
    setTimeout(() => { location.href = href; }, 760);
  });

  /* ---------- header ---------- */
  const hdr = $('.hdr'), prog = $('.progress'); let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY, h = d.documentElement.scrollHeight - innerHeight;
    hdr.classList.toggle('scrolled', y > 40);
    hdr.classList.toggle('hide', y > lastY && y > 300 && !body.classList.contains('menu-open'));
    lastY = y;
    if (prog) prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('.burger')?.addEventListener('click', () => { const o = body.classList.toggle('menu-open'); $('.burger').setAttribute('aria-expanded', o); });
  addEventListener('keydown', e => { if (e.key === 'Escape') body.classList.remove('menu-open'); });

  /* ---------- open now (America/New_York, 6a-9p daily) ---------- */
  const OPEN = 6, CLOSE = 21;
  const ny = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const isOpen = ny.getHours() >= OPEN && ny.getHours() < CLOSE;
  $$('.status').forEach(s => { s.classList.toggle('open', isOpen); $('em', s).textContent = isOpen ? 'Open now · til 9 PM' : 'Closed · opens 6 AM'; });
  const today = ny.getDay();
  $$('.hours li').forEach(li => { if (+li.dataset.day === today) li.classList.add('today'); });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal],[data-split],.clip').forEach(el => { if (!el.closest('.hero')) io.observe(el); });

  /* ---------- counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1]||'').length, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1800;
    const step = t => { const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 4)); el.textContent = v.toFixed(dec) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- parallax + horizontal scroll ---------- */
  const par = $$('[data-parallax]');
  const hs = $('.hs'), track = $('.hs-track'), hsBar = $('.hs-progress i');
  const sizeHS = () => { if (!hs) return; if (innerWidth > 900 && !reduce) { hs.style.height = (track.scrollWidth - innerWidth + innerHeight) + 'px'; } else { hs.style.height = ''; track.style.transform = ''; } };
  sizeHS(); addEventListener('resize', sizeHS); addEventListener('load', sizeHS);
  let ticking = false;
  const frame = () => {
    ticking = false;
    if (!reduce) par.forEach(el => { const r = el.parentElement.getBoundingClientRect(); const f = parseFloat(el.dataset.parallax) || .15; if (r.bottom > 0 && r.top < innerHeight) el.style.transform = `translate3d(0,${(r.top + r.height/2 - innerHeight/2) * -f}px,0)`; });
    if (hs && innerWidth > 900 && !reduce) {
      const r = hs.getBoundingClientRect(), max = track.scrollWidth - innerWidth, p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      track.style.transform = `translate3d(${-p * max}px,0,0)`; if (hsBar) hsBar.style.transform = `scaleX(${p})`;
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true }); frame();

  /* ---------- quotes carousel ---------- */
  const qs = $$('.q'), qb = $$('.q-nav button'); let qi = 0, qt;
  const showQ = i => { qi = (i + qs.length) % qs.length; qs.forEach((q, k) => q.classList.toggle('on', k === qi)); qb.forEach((b, k) => { b.classList.remove('on'); void b.offsetWidth; b.classList.toggle('on', k === qi); }); clearTimeout(qt); qt = setTimeout(() => showQ(qi + 1), 6000); };
  if (qs.length) { qb.forEach((b, k) => b.addEventListener('click', () => showQ(k))); showQ(0); }

  /* ---------- menu tabs ---------- */
  const tabs = $$('.tab'), pill = $('.tab-pill');
  const movePill = t => { if (!pill || !t) return; pill.style.left = t.offsetLeft + 'px'; pill.style.width = t.offsetWidth + 'px'; };
  const setCat = (id, scroll) => {
    tabs.forEach(t => t.classList.toggle('on', t.dataset.cat === id));
    $$('.cat').forEach(c => { const on = c.id === id; c.classList.toggle('on', on); if (on) $$('.item', c).forEach((it, k) => { it.style.animation = 'none'; void it.offsetWidth; it.style.animation = ''; it.style.setProperty('--i', k); }); });
    $$('.menu-aside img').forEach(im => im.classList.toggle('on', im.dataset.cat === id));
    const t = tabs.find(t => t.dataset.cat === id); movePill(t); t?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    if (scroll) { const m = $('#menu-top'); if (m && m.getBoundingClientRect().top < 0) scrollTo({ top: scrollY + m.getBoundingClientRect().top - 150, behavior: 'smooth' }); }
  };
  if (tabs.length) { tabs.forEach(t => t.addEventListener('click', () => setCat(t.dataset.cat, true))); setCat(tabs[0].dataset.cat); addEventListener('resize', () => movePill($('.tab.on'))); addEventListener('load', () => movePill($('.tab.on'))); }

  /* ---------- lightbox ---------- */
  const lb = $('.lb');
  if (lb) {
    const img = $('img', lb);
    $$('.gallery button').forEach(b => b.addEventListener('click', () => { img.src = $('img', b).src; img.alt = $('img', b).alt; lb.classList.add('on'); }));
    lb.addEventListener('click', e => { if (e.target !== img) lb.classList.remove('on'); });
    addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('on'); });
  }

  /* ---------- FAQ smooth open ---------- */
  $$('.faq details').forEach(dt => {
    const sm = $('summary', dt), ans = $('.ans', dt);
    sm.addEventListener('click', e => {
      if (reduce) return; e.preventDefault();
      if (dt.open) { const h = ans.scrollHeight; ans.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => dt.open = false; }
      else { dt.open = true; const h = ans.scrollHeight; ans.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' }); }
    });
  });

  /* ---------- tilt + magnetic + cursor (desktop) ---------- */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg)`; });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
    $$('.btn').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .18}px,${(e.clientY - r.top - r.height/2) * .3}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
    const c = $('.cur'), cd = $('.cur-dot'); let mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; cd.style.transform = `translate(${mx}px,${my}px)`; });
    const loop = () => { cx += (mx - cx) * .16; cy += (my - cy) * .16; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); }; loop();
    d.addEventListener('pointerover', e => c.classList.toggle('hover', !!e.target.closest('a,button,summary,[data-tilt]')));
  }

  /* ---------- concept ribbon ---------- */
  const cb = $('.concept');
  if (cb) { if (ss.get('bh-concept') === 'x') cb.classList.add('gone'); $('button', cb).addEventListener('click', () => { cb.classList.add('gone'); ss.set('bh-concept', 'x'); }); }

  $$('.theme-t').forEach(btn => btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next; try { localStorage.setItem('bh-theme', next); } catch(e) {}
    const m = $('meta[name=theme-color]'); if (m) m.content = next === 'dark' ? '#0e0a07' : '#f7f1e7';
  }));

  $$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
})();
