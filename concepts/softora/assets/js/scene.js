// Three.js hero scene: a field of rounded tiles that assemble into a formation,
// drift, follow the pointer, and disperse as the page scrolls.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const el = document.querySelector('[data-scene]');
if (el) init(el);

function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function formation(kind, rnd) {
  const pts = [];
  if (kind === 'grid') {
    for (let x = -3; x <= 3; x++) for (let z = -2; z <= 2; z++) {
      const h = 1 + Math.floor(rnd() * 3) * (rnd() > .55 ? 1 : 0);
      for (let y = 0; y < h; y++) pts.push([x * 1.08, y * 1.08 - .9, z * 1.08]);
    }
  } else if (kind === 'stack') {
    for (let l = 0; l < 4; l++) for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
      if (l === 3 && (Math.abs(x) + Math.abs(z)) > 1) continue;
      pts.push([x * 1.08 + (l % 2) * .54, l * 1.25 - 1.9, z * 1.08 - (l % 2) * .54]);
    }
  } else { // cluster
    for (let x = -1.5; x <= 1.5; x++) for (let y = -1.5; y <= 1.5; y++) for (let z = -1.5; z <= 1.5; z++) {
      const d = Math.abs(x) + Math.abs(y) + Math.abs(z);
      if (d > 3.6 || (d > 2.4 && rnd() < .55)) continue;
      pts.push([x * 1.08, y * 1.08, z * 1.08]);
    }
  }
  return pts;
}

function init(host) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = innerWidth < 900;
  const kind = host.dataset.scene || 'cluster';
  const rnd = seeded(kind.length * 7919 + 17);
  const pts = formation(kind, rnd);
  const N = pts.length;

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { host.classList.add('no-gl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(7.5, 6, 9); camera.lookAt(0, -.2, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfcbc0, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-6, 9, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe6ff, .9); fill.position.set(8, 2, -6); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, .6); rim.position.set(0, -6, -8); scene.add(rim);

  const geo = new RoundedBoxGeometry(.92, .92, .92, 4, .12);
  const mat = new THREE.MeshPhysicalMaterial({ roughness: .38, metalness: .04, clearcoat: .55, clearcoatRoughness: .35, vertexColors: false });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const group = new THREE.Group(); group.add(mesh); scene.add(group);
  const baseScale = kind === 'grid' ? .8 : kind === 'stack' ? .95 : 1; group.scale.setScalar(baseScale);
  if (kind === 'grid') group.position.y = .35;

  const paper = new THREE.Color(0xf7f6f1), ink = new THREE.Color(0x15181d), blue = new THREE.Color(0x1e8bff), violet = new THREE.Color(0x8b3dff);
  const dark = host.closest('.dark') != null;
  const target = [], scatter = [], cur = [], phase = [], scl = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < N; i++) {
    const [x, y, z] = pts[i];
    target.push(new THREE.Vector3(x, y, z));
    const dir = new THREE.Vector3(x + (rnd() - .5), y + (rnd() - .5) * 2, z + (rnd() - .5)).normalize();
    scatter.push(dir.multiplyScalar(6 + rnd() * 7));
    cur.push(scatter[i].clone().multiplyScalar(1.4));
    phase.push(rnd() * Math.PI * 2);
    scl.push(0);
    const r = rnd();
    let c = dark ? ink : paper;
    if (r > .86) c = blue.clone().lerp(violet, (x + z + 3.3) / 6.6); else if (r > .76) c = dark ? paper : ink;
    mesh.setColorAt(i, c);
  }
  mesh.instanceColor.needsUpdate = true;

  // state
  let w = 1, h = 1, t0 = performance.now(), scrollP = 0, px = 0, py = 0, tx = 0, ty = 0, visible = true, raf = 0;
  const assembleDur = reduce ? 1 : 1900;

  const resize = () => { const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);
  new ResizeObserver(resize).observe(host);

  if (!mobile) addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
  addEventListener('scroll', () => { const r = host.getBoundingClientRect(); scrollP = Math.min(1, Math.max(0, -r.top / (r.height * .9))); }, { passive: true });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) loop(); }, { rootMargin: '120px' }).observe(host);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) loop(); });

  const ease = x => 1 - Math.pow(1 - x, 4);
  const v = new THREE.Vector3();

  function frame(now) {
    const t = (now - t0) / 1000;
    const a = ease(Math.min(1, (now - t0) / assembleDur));
    px += (tx - px) * .05; py += (ty - py) * .05;
    const disperse = reduce ? 0 : scrollP;
    for (let i = 0; i < N; i++) {
      const stag = Math.min(1, Math.max(0, (a * 1.25) - (i / N) * .25));
      v.copy(scatter[i]).lerp(target[i], ease(stag));
      if (disperse > 0) { v.lerp(scatter[i], disperse * disperse); }
      if (!reduce) { v.y += Math.sin(t * .9 + phase[i]) * .06 * (1 - disperse); }
      cur[i].lerp(v, .18);
      scl[i] += ((stag > 0 ? 1 : 0) * (1 - disperse * .6) - scl[i]) * .12;
      dummy.position.copy(cur[i]);
      dummy.rotation.set(disperse * phase[i] * .4, disperse * phase[i] * .3, 0);
      dummy.scale.setScalar(Math.max(.001, scl[i]));
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    group.rotation.y = (reduce ? 0 : t * .12) + px * .35;
    group.rotation.x = py * .12;
    group.position.y = (kind === 'grid' ? .35 : 0) + Math.sin(t * .6) * .08 - scrollP * 1.2;
    renderer.render(scene, camera);
  }
  function loop() {
    if (!visible || document.hidden) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    frame(performance.now());
  }
  if (reduce) { frame(t0 + 10); } else loop();
  host.classList.add('gl-ready');
}
