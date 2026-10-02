(() => {
  const d = document, root = d.documentElement, body = d.body;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  root.classList.remove('no-js');

  /* split headings into words */
  $$('[data-split]').forEach(el => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) return f.appendChild(d.createTextNode(' '));
          const w = d.createElement('span'); w.className = 'w';
          const s = d.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
          w.appendChild(s); f.appendChild(w);
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el); el.classList.add('split');
  });

  /* page transition */
  const veil = $('.veil');
  if (veil && ss.get('so-nav')) { ss.set('so-nav', ''); veil.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.remove('on'))); }
  addEventListener('pageshow', e => { if (e.persisted && veil) veil.classList.remove('on'); });
  d.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a || !veil || reduce) return;
    const href = a.getAttribute('href');
    if (!href || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || /^(https?:|mailto:|tel:|#|wa\.me)/.test(href)) return;
    const [path] = href.split('#'); const here = location.pathname.split('/').pop() || 'index.html';
    if (href.includes('#') && (path === '' || path === here)) return;
    e.preventDefault(); ss.set('so-nav', '1'); veil.classList.add('on');
    setTimeout(() => { location.href = href; }, 320);
  });

  /* header */
  const hdr = $('.hdr');
  const onScroll = () => hdr.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal],[data-split],.replaces,.laptop').forEach(el => io.observe(el));
  requestAnimationFrame(() => $$('.hero [data-reveal], .hero [data-split]').forEach(el => el.classList.add('in')));

  /* card spotlight */
  if (fine) d.addEventListener('pointermove', e => {
    const c = e.target.closest('.card'); if (!c) return;
    const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* tabs + phone screens */
  const showScreen = (phone, id) => {
    if (!phone) return;
    $$('.screen', phone).forEach(s => {
      const on = s.dataset.screen === id;
      if (s.classList.contains('on') && !on) { s.classList.remove('on'); s.classList.add('out'); setTimeout(() => s.classList.remove('out'), 500); }
      else if (on) s.classList.add('on');
    });
    const nav = $('.ps-nav', phone);
    if (nav) $$('span', nav).forEach(n => n.classList.toggle('on', (n.dataset.for || '').split(' ').includes(id)));
  };
  $$('[data-tabs]').forEach(group => {
    const tabs = $$('.tab', group), ind = $('.tab-ind', group);
    const scope = group.closest('[data-switch]') || group.parentElement;
    const phone = $('.phone', scope);
    const move = t => { if (ind && t) { ind.style.width = t.offsetWidth + 'px'; ind.style.transform = `translateX(${t.offsetLeft - 5}px)`; } };
    let timer;
    const set = (id, user) => {
      tabs.forEach(t => { const on = t.dataset.tab === id; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
      $$('.panel', scope).forEach(p => p.classList.toggle('on', p.dataset.panel === id));
      const t = tabs.find(t => t.dataset.tab === id); move(t);
      if (t && user) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      showScreen(phone, $('.panel.on', scope)?.dataset.screen || id);
      if (user) { clearInterval(timer); timer = null; }
    };
    tabs.forEach(t => t.addEventListener('click', () => set(t.dataset.tab, true)));
    set(tabs[0].dataset.tab);
    addEventListener('resize', () => move($('.tab.on', group)));
    if (d.fonts) d.fonts.ready.then(() => move($('.tab.on', group)));
    // auto-advance until the user interacts, only while visible
    if (!reduce && group.hasAttribute('data-auto')) {
      let vis = false;
      new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: .4 }).observe(scope);
      timer = setInterval(() => { if (!vis) return; const i = tabs.findIndex(t => t.classList.contains('on')); set(tabs[(i + 1) % tabs.length].dataset.tab); }, 4200);
    }
  });

  /* toasts near phones */
  $$('.toasts').forEach(box => {
    const ts = $$('.toast', box); if (!ts.length) return;
    if (reduce) { ts.forEach(t => t.classList.add('on')); return; }
    let i = 0;
    const tick = () => { const two = innerWidth >= 768; ts.forEach((t, k) => t.classList.toggle('on', k === i || (two && k === (i + 1) % ts.length))); i = (i + 1) % ts.length; };
    tick(); setInterval(tick, 2800);
  });

  /* rails + dots */
  $$('[data-rail]').forEach(rail => {
    const dots = rail.nextElementSibling?.classList.contains('dots') ? rail.nextElementSibling : null; if (!dots) return;
    const items = [...rail.children]; dots.innerHTML = items.map(() => '<i></i>').join('');
    const ds = [...dots.children];
    const upd = () => { const x = rail.scrollLeft, w = items[0].offsetWidth + 12; const i = Math.min(items.length - 1, Math.round(x / w)); ds.forEach((dd, k) => dd.classList.toggle('on', k === i)); };
    rail.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); upd();
  });

  /* timeline progress */
  $$('.tl').forEach(tl => {
    const steps = $$('.step', tl), horiz = () => tl.classList.contains('h') && innerWidth >= 1024;
    const upd = () => {
      const r = tl.getBoundingClientRect(), vh = innerHeight;
      const p = horiz() ? Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .5))) : Math.min(1, Math.max(0, (vh * .7 - r.top) / r.height));
      tl.style.setProperty('--p', p.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle('on', p >= (horiz() ? i / steps.length : (s.offsetTop) / r.height) - .001));
    };
    addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); addEventListener('resize', upd); upd();
  });

  /* replaces strike stagger */
  $$('.replaces span').forEach((s, i) => s.style.setProperty('--d', (i * 180) + 'ms'));

  /* phone tilt */
  if (fine && !reduce) $$('[data-tilt]').forEach(el => {
    const area = el.closest('.stage, .devices') || el;
    area.addEventListener('pointermove', e => { const r = area.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`; });
    area.addEventListener('pointerleave', () => el.style.transform = '');
  });

  /* faq animation */
  $$('.faq details').forEach(dt => {
    const sm = $('summary', dt), ans = $('.ans', dt);
    sm.addEventListener('click', e => {
      if (reduce) return; e.preventDefault();
      if (dt.open) { const a = ans.animate([{ height: ans.scrollHeight + 'px' }, { height: '0px' }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' }); a.onfinish = () => dt.open = false; }
      else { dt.open = true; ans.animate([{ height: '0px', opacity: 0 }, { height: ans.scrollHeight + 'px', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' }); }
    });
  });

  /* contact: option cards set the topic */
  const opts = $$('.opt'), topic = $('#topic');
  opts.forEach(o => o.addEventListener('click', () => { opts.forEach(x => x.classList.toggle('on', x === o)); if (topic) topic.value = o.dataset.topic; $('#name')?.focus({ preventScroll: true }); $('#form')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }));
  const pre = new URLSearchParams(location.search).get('topic');
  if (pre && topic) { const o = opts.find(x => x.dataset.topic.toLowerCase().includes(pre)); if (o) { o.classList.add('on'); topic.value = o.dataset.topic; } }

  const form = $('form.form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const subject = encodeURIComponent(`${f.get('topic')} · ${f.get('org') || f.get('name')}`);
    const text = encodeURIComponent([...f.entries()].map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)}: ${v}`).join('\n'));
    location.href = `mailto:${form.dataset.to}?subject=${subject}&body=${text}`;
  });

  $$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
})();
