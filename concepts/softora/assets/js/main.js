(() => {
  const d = document, root = d.documentElement, body = d.body;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* split headlines into words */
  $$('[data-split]').forEach(el => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(d.createTextNode(' '));
          const w = d.createElement('span'); w.className = 'w'; const s = d.createElement('span'); s.textContent = part; w.appendChild(s); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el); el.classList.add('split');
  });
  const playSplit = el => {
    const words = $$('.w > span', el);
    el.classList.add('in');
    if (!hasGsap || reduce) return;
    gsap.fromTo(words, { yPercent: 110, y: 0, rotate: 3 }, { yPercent: 0, y: 0, rotate: 0, duration: 1.2, ease: 'expo.out', stagger: .045, clearProps: 'transform' });
  };

  /* preloader + transitions */
  const pre = $('.pre'), shutter = $('.shutter');
  const start = () => { body.classList.add('loaded'); $$('.hero .split').forEach(playSplit); $$('.hero [data-reveal]').forEach(e => e.classList.add('in')); };
  if (pre && !ss.get('so-seen') && !reduce) {
    ss.set('so-seen', '1');
    const done = () => { pre.classList.add('out'); setTimeout(start, 250); setTimeout(() => pre.remove(), 1100); };
    if (d.readyState === 'complete') setTimeout(done, 500); else { addEventListener('load', () => setTimeout(done, 350)); setTimeout(done, 2600); }
  } else {
    pre && pre.remove();
    if (shutter && ss.get('so-nav') && !reduce) {
      ss.set('so-nav', ''); shutter.classList.add('cover');
      requestAnimationFrame(() => requestAnimationFrame(() => { shutter.classList.add('lift'); setTimeout(() => shutter.classList.remove('cover', 'lift'), 900); }));
      setTimeout(start, 200);
    } else start();
  }
  addEventListener('pageshow', e => { if (e.persisted) { shutter && shutter.classList.remove('cover', 'lift'); start(); } });
  d.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a || reduce || !shutter) return;
    const href = a.getAttribute('href');
    if (!href || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || /^(https?:|mailto:|tel:|#)/.test(href)) return;
    if (href.includes('#') && href.split('#')[0] === location.pathname.split('/').pop()) return;
    e.preventDefault(); body.classList.remove('menu-open');
    ss.set('so-nav', '1'); shutter.classList.remove('lift'); shutter.classList.add('cover');
    setTimeout(() => { location.href = href; }, 620);
  });

  /* header */
  const hdr = $('.hdr'), prog = $('.progress'); let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY, h = root.scrollHeight - innerHeight;
    hdr.classList.toggle('scrolled', y > 30);
    hdr.classList.toggle('hide', y > lastY && y > 320 && !body.classList.contains('menu-open'));
    lastY = y; if (prog) prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('.burger')?.addEventListener('click', () => { const o = body.classList.toggle('menu-open'); $('.burger').setAttribute('aria-expanded', o); });
  addEventListener('keydown', e => { if (e.key === 'Escape') body.classList.remove('menu-open'); });

  /* reveals + split outside hero */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    en.target.classList.add('in'); if (en.target.classList.contains('split')) playSplit(en.target);
  }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal], .split').forEach(el => { if (!el.closest('.hero')) io.observe(el); });

  /* counters */
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const fmt = v => pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US')) + suf;
    if (reduce || !hasGsap) { el.firstChild.textContent = fmt(end); return; }
    const o = { v: 0 }; gsap.to(o, { v: end, duration: 1.8, ease: 'expo.out', onUpdate: () => el.firstChild.textContent = fmt(o.v) });
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* pinned showcase (home) */
  const show = $('.show');
  if (show && hasGsap && innerWidth > 900 && !reduce) {
    const steps = $$('.step', show), dots = $$('.step-dots i', show), dash = $('.dash', show), dev = $('.device-wrap .device', show);
    dash.classList.add('hl');
    const setStep = i => {
      steps.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((s, k) => s.classList.toggle('on', k <= i));
      const keys = (steps[i].dataset.keys || '').split(' ');
      $$('[data-k]', dash).forEach(p => p.classList.toggle('on', keys.includes(p.dataset.k)));
    };
    setStep(0);
    ScrollTrigger.create({ trigger: show, start: 'top top', end: 'bottom bottom', onUpdate: self => setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))) });
    gsap.to(dev, { rotateY: 0, rotateX: 0, ease: 'none', scrollTrigger: { trigger: show, start: 'top 80%', end: 'top 10%', scrub: true } });
  } else if (show) { $$('.step', show).forEach(s => s.classList.add('on')); }

  /* exploded stack */
  const stack = $('.stack');
  if (stack && hasGsap && !reduce) {
    gsap.fromTo(stack, { '--gap': '26px' }, { '--gap': innerWidth > 900 ? '78px' : '58px', ease: 'none', scrollTrigger: { trigger: stack, start: 'top 85%', end: 'center 40%', scrub: true } });
  }

  /* process line */
  const proc = $('.proc');
  if (proc && hasGsap && !reduce) {
    const line = $('.proc-line', proc), steps = $$('.pstep', proc), vertical = innerWidth <= 1080;
    gsap.to(line, { [vertical ? 'scaleY' : 'scaleX']: 1, ease: 'none', scrollTrigger: { trigger: proc, start: 'top 75%', end: 'bottom 55%', scrub: true, onUpdate: s => steps.forEach((st, k) => st.classList.toggle('on', s.progress >= k / steps.length)) } });
  } else if (proc) { $$('.pstep', proc).forEach(s => s.classList.add('on')); $('.proc-line', proc).style.transform = 'none'; }

  /* sticky process (custom page) */
  const phases = $$('.sproc .phase');
  if (phases.length) {
    const pio = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('on', en.isIntersecting)), { rootMargin: '-35% 0px -45% 0px' });
    phases.forEach(p => pio.observe(p));
  }

  /* role tabs */
  const tabs = $$('.tabs .tab'), pill = $('.tab-pill');
  const movePill = t => { if (pill && t) { pill.style.left = t.offsetLeft + 'px'; pill.style.width = t.offsetWidth + 'px'; } };
  if (tabs.length) {
    const set = id => { tabs.forEach(t => t.classList.toggle('on', t.dataset.role === id)); $$('.role').forEach(r => r.classList.toggle('on', r.dataset.role === id)); movePill(tabs.find(t => t.dataset.role === id)); };
    tabs.forEach(t => t.addEventListener('click', () => set(t.dataset.role)));
    set(tabs[0].dataset.role); addEventListener('resize', () => movePill($('.tab.on'))); addEventListener('load', () => movePill($('.tab.on')));
  }

  /* faq */
  $$('.faq details').forEach(dt => {
    const sm = $('summary', dt), ans = $('.ans', dt);
    sm.addEventListener('click', e => {
      if (reduce) return; e.preventDefault();
      if (dt.open) { ans.animate([{ height: ans.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 400, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => dt.open = false; }
      else { dt.open = true; ans.animate([{ height: '0px', opacity: 0 }, { height: ans.scrollHeight + 'px', opacity: 1 }], { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' }); }
    });
  });

  /* tilt, magnetic, cursor */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`; });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
    $$('.btn').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
    const c = $('.cur'); let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
    const loop = () => { cx += (mx - cx) * .2; cy += (my - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); }; loop();
    d.addEventListener('pointerover', e => c.classList.toggle('hover', !!e.target.closest('a,button,summary,[data-tilt]')));
  }

  /* contact form (static demo) */
  const form = $('form.form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form); const subject = encodeURIComponent(`Demo request from ${f.get('name') || ''} · ${f.get('org') || ''}`);
    const bodyTxt = encodeURIComponent([...f.entries()].map(([k, v]) => `${k}: ${v}`).join('\n'));
    location.href = `mailto:${form.dataset.to}?subject=${subject}&body=${bodyTxt}`;
  });

  $$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
})();
