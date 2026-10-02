// Softora 3D mark: the "C and dot" logo built live in Three.js.
// Variants: "logo" (ring + dot) and "orbit" (ring + orbiting module spheres).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const host = document.querySelector('[data-scene]');
if (host) { try { init(host); } catch (e) { console.warn('3D disabled', e); } }

function init(host) {
  const kind = host.dataset.scene || 'logo';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = innerWidth < 768;
  const fine = matchMedia('(pointer: fine)').matches;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.6 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-3, 4, 6); scene.add(key);
  const pv = new THREE.PointLight(0x9a4dff, 40, 18); pv.position.set(3.5, -2.5, 3); scene.add(pv);
  const pb = new THREE.PointLight(0x1f9bff, 40, 18); pb.position.set(-3.5, 3, 2.5); scene.add(pb);

  const root = new THREE.Group(); scene.add(root);
  const logo = new THREE.Group(); root.add(logo);

  // geometry constants derived from the logo proportions
  const R = 1.4, TUBE = 0.36, HALF = 0.66, ARC = Math.PI * 2 - HALF * 2;
  const DOT_R = 0.5, DOT_X = 1.5;
  const cBlue = new THREE.Color('#2a7dff'), cMid = new THREE.Color('#5b4cff'), cViolet = new THREE.Color('#9b3dff');
  const span = 2 * (R + TUBE);
  const colorAt = (x, y, out) => {
    const t = THREE.MathUtils.clamp(0.5 - (x + y) / (span * 1.15), 0, 1);
    return t < 0.5 ? out.copy(cBlue).lerp(cMid, t * 2) : out.copy(cMid).lerp(cViolet, (t - 0.5) * 2);
  };
  const paint = (geo, ox = 0, oy = 0) => {
    const p = geo.attributes.position, c = new Float32Array(p.count * 3), tmp = new THREE.Color();
    for (let i = 0; i < p.count; i++) { colorAt(p.getX(i) + ox, p.getY(i) + oy, tmp); c[i * 3] = tmp.r; c[i * 3 + 1] = tmp.g; c[i * 3 + 2] = tmp.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
  };
  const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.22, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.75, sheen: 0.25, sheenColor: new THREE.Color('#b9a6ff') });

  // ring (rebuilt while it draws in)
  const ring = new THREE.Mesh(new THREE.BufferGeometry(), mat); logo.add(ring);
  const capGeo = new THREE.SphereGeometry(TUBE, 40, 28);
  const capMats = [mat.clone(), mat.clone()]; capMats.forEach(m => { m.vertexColors = false; });
  const caps = capMats.map(m => { const s = new THREE.Mesh(capGeo, m); logo.add(s); return s; });
  let builtFrac = -1;
  const buildRing = frac => {
    frac = Math.max(0.002, Math.min(1, frac));
    if (Math.abs(frac - builtFrac) < 0.004) return; builtFrac = frac;
    const g = new THREE.TorusGeometry(R, TUBE, small ? 32 : 44, Math.max(8, Math.round((small ? 140 : 200) * frac)), ARC * frac);
    g.rotateZ(HALF); paint(g);
    ring.geometry.dispose(); ring.geometry = g;
    const a0 = HALF, a1 = HALF + ARC * frac, tmp = new THREE.Color();
    [a0, a1].forEach((a, i) => { const x = Math.cos(a) * R, y = Math.sin(a) * R; caps[i].position.set(x, y, 0); capMats[i].color.copy(colorAt(x, y, tmp)); });
  };

  // dot or orbiters
  const dotGeo = new THREE.SphereGeometry(DOT_R, 64, 48); paint(dotGeo, DOT_X, 0);
  const dot = new THREE.Mesh(dotGeo, mat); dot.position.set(DOT_X, 0, 0); logo.add(dot);
  const orbiters = [];
  if (kind === 'orbit') {
    dot.visible = false;
    const oGeo = new THREE.SphereGeometry(0.17, 32, 24);
    for (let i = 0; i < 7; i++) {
      const g = oGeo.clone(); const c = new THREE.Color(); colorAt(Math.cos(i) * 2, Math.sin(i) * 2, c);
      const m = new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.25, clearcoat: 1, metalness: 0.1 });
      const s = new THREE.Mesh(g, m); root.add(s);
      orbiters.push({ s, r: 2.25 + (i % 3) * 0.32, speed: 0.35 + i * 0.06, tilt: (i - 3) * 0.32, phase: i * 0.9 });
    }
    const ringOrbit = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.006, 6, 180), new THREE.MeshBasicMaterial({ color: 0x6f73ff, transparent: true, opacity: 0.35 }));
    ringOrbit.rotation.x = 1.25; root.add(ringOrbit);
  }

  // particles
  const N = small ? 220 : 520;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), tmpc = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const u = Math.random(), v = Math.random(), th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), r = 2.6 + Math.random() * 2.2;
    const x = r * Math.sin(ph) * Math.cos(th), y = r * Math.sin(ph) * Math.sin(th) * 0.8, z = r * Math.cos(ph) * 0.6 - 0.5;
    pos.set([x, y, z], i * 3); colorAt(x * 0.6, y * 0.6, tmpc); col.set([tmpc.r, tmpc.g, tmpc.b], i * 3);
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const cx = cv.getContext('2d');
  const grd = cx.createRadialGradient(32, 32, 0, 32, 32, 32); grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,.6)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  cx.fillStyle = grd; cx.fillRect(0, 0, 64, 64);
  const pmat = new THREE.PointsMaterial({ size: small ? 0.07 : 0.06, map: new THREE.CanvasTexture(cv), vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });
  const points = new THREE.Points(pg, pmat); root.add(points);

  // sizing
  let w = 1, h = 1;
  const resize = () => {
    const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const need = kind === 'orbit' ? 3.1 : 2.45;
    camera.position.z = Math.max(9, need / (Math.tan(THREE.MathUtils.degToRad(16)) * camera.aspect));
    camera.updateProjectionMatrix();
  };
  resize(); new ResizeObserver(resize).observe(host);
  logo.position.x = kind === 'orbit' ? 0.15 : -0.12;

  // input: desktop pointer tilt, touch drag (horizontal) with inertia
  let tx = 0, ty = 0, px = 0, py = 0, drag = 0, vel = 0, down = false, lastX = 0;
  if (fine) addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
  const cvEl = renderer.domElement;
  cvEl.addEventListener('pointerdown', e => { down = true; lastX = e.clientX; vel = 0; cvEl.setPointerCapture?.(e.pointerId); });
  cvEl.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * 0.012; drag += vel; });
  const up = () => { down = false; }; cvEl.addEventListener('pointerup', up); cvEl.addEventListener('pointercancel', up);

  let scrollP = 0;
  addEventListener('scroll', () => { const r = host.getBoundingClientRect(); scrollP = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height))); }, { passive: true });

  let visible = true, raf = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) loop(); }, { rootMargin: '100px' }).observe(host);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) loop(); });

  const t0 = performance.now();
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeBack = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

  function frame(now) {
    const t = (now - t0) / 1000;
    const draw = reduce ? 1 : easeOut(Math.min(1, t / 1.5));
    buildRing(draw);
    const dIn = reduce ? 1 : Math.min(1, Math.max(0, (t - 1.05) / 0.8));
    dot.scale.setScalar(Math.max(0.001, easeBack(dIn)));
    dot.position.y = (1 - easeOut(dIn)) * 1.4 + (reduce ? 0 : Math.sin(t * 1.6) * 0.04 * dIn);

    orbiters.forEach((o, i) => {
      const a = (reduce ? 0 : t) * o.speed + o.phase, k = Math.min(1, Math.max(0, (t - 0.6 - i * 0.12) / 0.8));
      o.s.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r * Math.sin(o.tilt) * 0.6 + Math.sin(a * 0.5) * 0.2, Math.sin(a) * o.r * Math.cos(o.tilt) * 0.6);
      o.s.scale.setScalar(Math.max(0.001, easeBack(k)));
    });

    if (!down) { vel *= 0.94; drag += vel; drag *= 0.985; }
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    const idle = reduce ? 0 : t;
    logo.rotation.y = Math.sin(idle * 0.45) * 0.38 + px * 0.45 + drag;
    logo.rotation.x = Math.sin(idle * 0.35) * 0.12 + py * 0.25;
    root.rotation.z = scrollP * 0.5;
    root.position.y = Math.sin(idle * 0.8) * 0.06 + scrollP * 1.4;
    points.rotation.y = idle * 0.03 + px * 0.1; points.rotation.x = idle * 0.015;
    renderer.render(scene, camera);
  }
  function loop() {
    if (!visible || document.hidden) { raf = 0; return; }
    raf = requestAnimationFrame(loop); frame(performance.now());
  }
  frame(t0 + (reduce ? 5000 : 0));
  host.classList.add('gl');
  if (!reduce) loop();
}
