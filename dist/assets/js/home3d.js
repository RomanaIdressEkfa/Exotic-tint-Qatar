/* ======================================================================
   Homepage 3D sections (Three.js + GSAP), same look as the hero room:
   - [data-h3="twin"]  : two identical rooms in the same sun, one with film
   - [data-h3="smart"] : glass meeting room that switches clear <-> private
   - [data-h3="spill"] : marble island, wine spills, beads up, wiped clean
   Each scene renders only while on screen.
   ====================================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const gsap = window.gsap;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd = (a, b) => a + Math.random() * (b - a);

function webgl() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

/* ---------- textures ---------- */
const canvasTex = (w, h, draw, rep = [1, 1]) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...rep);
  t.anisotropy = 8;
  return t;
};
const radial = (stops, size = 256) => canvasTex(size, size, (g, w) => {
  const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  stops.forEach(([o, c]) => grd.addColorStop(o, c));
  g.fillStyle = grd; g.fillRect(0, 0, w, w);
});
let _oak, _marble, _walnut;
const oak = () => _oak || (_oak = canvasTex(512, 512, (g, w, h) => {
  const rows = 7, pw = w / rows;
  for (let i = 0; i < rows; i++) {
    let y = -rnd(0, h);
    while (y < h) {
      const len = rnd(h * 0.35, h * 0.7);
      g.fillStyle = `hsl(${rnd(32, 36)}, ${rnd(36, 46)}%, ${rnd(76, 84)}%)`;
      g.fillRect(i * pw, y, pw, len);
      for (let k = 0; k < 8; k++) { g.strokeStyle = `rgba(140,95,50,${rnd(0.05, 0.12)})`; g.lineWidth = rnd(0.6, 1.6); g.beginPath(); const x = i * pw + rnd(3, pw - 3); g.moveTo(x, y); g.lineTo(x + rnd(-4, 4), y + len); g.stroke(); }
      g.fillStyle = 'rgba(90,60,30,.25)'; g.fillRect(i * pw, y + len - 1, pw, 1);
      y += len;
    }
    g.fillStyle = 'rgba(90,60,30,.3)'; g.fillRect(i * pw, 0, 1, h);
  }
}));
const marble = () => _marble || (_marble = canvasTex(1024, 512, (g, w, h) => {
  g.fillStyle = '#f5f3ef'; g.fillRect(0, 0, w, h);
  g.filter = 'blur(1.4px)';
  for (let i = 0; i < 14; i++) {
    g.strokeStyle = i % 4 === 0 ? `rgba(176,140,80,${rnd(0.35, 0.6)})` : `rgba(120,124,135,${rnd(0.12, 0.35)})`;
    g.lineWidth = rnd(0.8, 3);
    g.beginPath(); let x = rnd(-50, w), y = 0; g.moveTo(x, y);
    while (y < h) { x += rnd(-60, 70); y += rnd(18, 50); g.lineTo(x, y); }
    g.stroke();
  }
  g.filter = 'none';
}));
const walnut = () => _walnut || (_walnut = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#76502f'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(35,20,8,${rnd(0.1, 0.3)})`; g.lineWidth = rnd(0.5, 2); g.beginPath(); const x = rnd(0, w); g.moveTo(x, 0); g.bezierCurveTo(x + rnd(-8, 8), 80, x + rnd(-8, 8), 170, x + rnd(-5, 5), h); g.stroke(); }
}));

const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, envMapIntensity: 0.6, ...o });
const glowM = (color, o = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...o });

/* ---------- shared stage ---------- */
function makeStage(host, cfg) {
  if (host.dataset.cam) cfg = Object.assign({}, cfg, JSON.parse(host.dataset.cam));
  const canvas = host.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: host.hasAttribute('data-capture') });
  renderer.setPixelRatio(host.hasAttribute('data-capture') ? 3 : Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = cfg.exposure || 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 140);
  const base = new THREE.Vector3(...cfg.cam), target = new THREE.Vector3(...cfg.target);
  const root = new THREE.Group();
  scene.add(root);
  const add = (geo, mat, pos, o = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    if (o.rot) m.rotation.set(...o.rot);
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.receive !== false;
    (o.parent || root).add(m);
    return m;
  };
  const rbox = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  const frames = [];
  const look = { x: 0, y: 0 };
  const dolly = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 };
  if (window.matchMedia('(pointer: fine)').matches) {
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      gsap.to(look, { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5, duration: 0.8, ease: 'power3' });
    });
    host.addEventListener('pointerleave', () => gsap.to(look, { x: 0, y: 0, duration: 1, ease: 'power3' }));
  }
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? cfg.fovTall || 44 : cfg.fov || 30;
    // keep a minimum horizontal view so wide scenes never get cut off on narrow screens
    if (cfg.minHFov) camera.fov = Math.max(camera.fov, (2 * Math.atan(Math.tan((cfg.minHFov * Math.PI) / 360) / (w / h)) * 180) / Math.PI);
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);
  const api = { THREE, renderer, scene, camera, root, add, rbox, frames, look, dolly, onStart: null };
  let running = false, started = false, raf = 0;
  const clock = new THREE.Clock();
  function frame() {
    if (!running) return;
    const t = clock.getElapsedTime();
    camera.position.set(base.x + dolly.x + look.x * 1.4, base.y + dolly.y - look.y * 0.9 + Math.sin(t * 0.5) * 0.06, base.z + dolly.z);
    camera.lookAt(target.x + dolly.tx, target.y + dolly.ty, target.z + dolly.tz);
    for (let i = 0; i < frames.length; i++) frames[i](t);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver((es) => {
    running = es[0].isIntersecting;
    if (running) {
      if (!started) {
        started = true;
        host.classList.add('is-3d');
        if (api.onStart) api.onStart();
      }
      cancelAnimationFrame(raf);
      frame();
    }
  }, { threshold: 0.15 }).observe(host);
  return api;
}

function plinth(S, w, d) {
  S.add(S.rbox(w, 0.6, d, 0.28), M('#0c2348', { roughness: 0.32, metalness: 0.5, envMapIntensity: 1 }), [0, -0.3, 0], { cast: false });
  S.add(S.rbox(w + 0.08, 0.035, d + 0.08, 0.015), glowM('#3b9bff'), [0, -0.05, 0], { cast: false, receive: false });
  S.add(S.rbox(w - 0.5, 0.14, d - 0.5, 0.06), M('#eef2f7', { roughness: 0.85 }), [0, 0.05, 0], { cast: false });
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, d * 1.6), new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(0,8,24,.5)'], [0.6, 'rgba(0,8,24,.18)'], [1, 'rgba(0,8,24,0)']]), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2;
  sh.position.y = -0.7;
  S.scene.add(sh);
  return 0.12;
}
function lights(S, sunPos, sunColor = '#ffd9a8', sunI = 2.4) {
  S.scene.add(new THREE.HemisphereLight('#e2eeff', '#1a2f55', 0.8));
  const fill = new THREE.DirectionalLight('#cfe1ff', 0.5);
  fill.position.set(-10, 7, 9);
  S.scene.add(fill);
  const sun = new THREE.DirectionalLight(sunColor, sunI);
  sun.position.set(...sunPos);
  sun.target.position.set(0, 0, 0.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 });
  sun.shadow.bias = -0.0008;
  sun.shadow.radius = 4;
  S.scene.add(sun, sun.target);
  return sun;
}
const plant = (S, x, z, s, G, parent) => {
  const g = new THREE.Group();
  S.add(new THREE.CylinderGeometry(0.22 * s, 0.17 * s, 0.4 * s, 24), M('#ece7df', { roughness: 0.6 }), [0, 0.2 * s, 0], { parent: g });
  S.add(new THREE.CylinderGeometry(0.03 * s, 0.04 * s, 0.7 * s, 8), M('#6b5038'), [0, 0.7 * s, 0], { parent: g });
  [[0, 1.15, 0, 0.42], [0.18, 0.95, 0.1, 0.3], [-0.16, 1.32, -0.06, 0.3]].forEach(([a, b, c, r]) => S.add(new THREE.IcosahedronGeometry(r * s, 1), M(r > 0.35 ? '#6f9d68' : '#5a8a58', { roughness: 0.8, flatShading: true }), [a * s, b * s, c * s], { parent: g }));
  g.position.set(x, G, z);
  (parent || S.root).add(g);
  return g;
};

/* ======================================================================
   1. Same sun, two rooms
   ====================================================================== */
function twin(host) {
  const S = makeStage(host, { cam: [0, 7.4, 14.6], target: [0, 1.25, -0.4], fov: 30, fovTall: 56, minHFov: 50 });
  const G = plinth(S, 13.4, 6.6);
  const sun = lights(S, [3, 11, -12], '#ffd29a', 2.6);

  // sky + sun behind the rooms
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(22, 7), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(8, 256, (g, w, h) => { const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#8fbbe8'); grd.addColorStop(0.6, '#ffd9a0'); grd.addColorStop(1, '#ffb45c'); g.fillStyle = grd; g.fillRect(0, 0, w, h); }) }));
  sky.position.set(0, 2.6, -4.4);
  S.scene.add(sky);
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,240,200,1)'], [0.45, 'rgba(255,190,100,.5)'], [1, 'rgba(255,150,60,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  sunSprite.position.set(0, 3.4, -4.2);
  sunSprite.scale.set(3.2, 3.2, 1);
  S.scene.add(sunSprite);

  const wallMat = M('#f6f3ee', { roughness: 0.9 });
  const frameMat = M('#1d2b42', { roughness: 0.35, metalness: 0.5 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#d6ebff', transparent: true, opacity: 0.16, roughness: 0.05, clearcoat: 1, depthWrite: false });
  const cream = M('#efe6d6', { roughness: 0.95 });
  const rooms = [];
  function room(x, film) {
    const g = new THREE.Group();
    g.position.x = x;
    S.root.add(g);
    const W = 5.6, D = 4.6, H = 3.5, T = 0.18, z0 = -D / 2;
    const wl = -1.75, wr = 1.75, wb = 0.55, wt = 2.95;
    S.add(S.rbox(W, 0.14, D, 0.05), M('#ffffff', { map: oak(), roughness: 0.55 }), [0, G + 0.07, 0], { parent: g, cast: false });
    S.add(S.rbox(W, wb, T, 0.03), wallMat, [0, G + wb / 2, z0], { parent: g });
    S.add(S.rbox(W, H - wt, T, 0.03), wallMat, [0, G + wt + (H - wt) / 2, z0], { parent: g });
    S.add(S.rbox(W / 2 + wl, wt - wb, T, 0.02), wallMat, [(-W / 2 + wl) / 2, G + (wb + wt) / 2, z0], { parent: g });
    S.add(S.rbox(W / 2 - wr, wt - wb, T, 0.02), wallMat, [(W / 2 + wr) / 2, G + (wb + wt) / 2, z0], { parent: g });
    const sx = x < 0 ? -W / 2 : W / 2;
    S.add(S.rbox(T, H, D, 0.03), wallMat, [sx, G + H / 2, 0], { parent: g });
    // window
    const cx = 0, cy = G + (wb + wt) / 2, ww = wr - wl, wh = wt - wb;
    [[ww + 0.1, 0.08, cx, G + wb], [ww + 0.1, 0.08, cx, G + wt], [0.08, wh, wl, cy], [0.08, wh, wr, cy], [0.05, wh, 0, cy]].forEach(([w, h, px, py]) => S.add(new THREE.BoxGeometry(w, h, 0.14), frameMat, [px, py, z0], { parent: g }));
    S.add(new THREE.PlaneGeometry(ww, wh), glassMat, [cx, cy, z0 + 0.02], { parent: g, cast: false, receive: false });
    let filmMesh = null;
    if (film) {
      const fg = new THREE.PlaneGeometry(ww - 0.06, wh - 0.06);
      fg.translate(0, -(wh - 0.06) / 2, 0);
      filmMesh = S.add(fg, new THREE.MeshStandardMaterial({ color: '#0f2f5f', transparent: true, opacity: 0.62, roughness: 0.15, metalness: 0.4, depthWrite: false }), [cx, G + wt - 0.03, z0 + 0.05], { parent: g, cast: false, receive: false });
      filmMesh.scale.y = 0.001;
    }
    // furniture
    S.add(S.rbox(3.1, 0.03, 2.1, 0.015), M('#e8dcc6', { roughness: 1 }), [0, G + 0.155, 0.5], { parent: g, cast: false });
    const sofa = new THREE.Group();
    S.add(S.rbox(2.4, 0.34, 0.95, 0.12), cream, [0, 0.26, 0], { parent: sofa });
    S.add(S.rbox(2.4, 0.6, 0.24, 0.1), cream, [0, 0.62, 0.38], { parent: sofa });
    [-1.12, 1.12].forEach((ax) => S.add(S.rbox(0.24, 0.48, 0.95, 0.1), cream, [ax, 0.45, 0], { parent: sofa }));
    S.add(S.rbox(0.5, 0.42, 0.14, 0.07), M('#c6834a', { roughness: 0.95 }), [-0.6, 0.66, 0.24], { parent: sofa, rot: [-0.2, 0.1, 0] });
    sofa.position.set(0, G + 0.14, 1.35);
    g.add(sofa);
    S.add(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 40), M('#f4f2ee', { roughness: 0.2, envMapIntensity: 1 }), [0, G + 0.5, 0.15], { parent: g });
    S.add(new THREE.CylinderGeometry(0.22, 0.26, 0.36, 28), M('#ffffff', { map: walnut(), roughness: 0.5 }), [0, G + 0.31, 0.15], { parent: g });
    plant(S, x < 0 ? -2.15 : 2.15, -1.55, 1.05, G, g);
    // AC unit on the side wall + status LED
    const ax = x < 0 ? -W / 2 + 0.24 : W / 2 - 0.24;
    S.add(S.rbox(0.26, 0.34, 1.15, 0.06), M('#ffffff', { roughness: 0.4 }), [ax, G + 3.0, -0.5], { parent: g });
    S.add(new THREE.BoxGeometry(0.02, 0.04, 0.12), glowM(film ? '#38bdf8' : '#fb923c'), [x < 0 ? ax + 0.14 : ax - 0.14, G + 2.92, -0.05], { parent: g, cast: false });
    // cold air from the AC: strong when the room is hot, gentle when cool
    const N = film ? 14 : 46, sp = film ? 0.25 : 0.7;
    const pos = new Float32Array(N * 3), base = [];
    for (let i = 0; i < N; i++) base.push({ ph: Math.random(), z: rnd(-1, 0), s: rnd(0.8, 1.2) });
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const air = new THREE.Points(ag, new THREE.PointsMaterial({ map: radial([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], 64), color: '#bfe4ff', size: 0.16, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
    g.add(air);
    // sun beam + warm patch on the floor
    const patchMat = new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(255,255,255,.95)'], [1, 'rgba(255,255,255,0)']]), color: film ? '#6fb3ff' : '#ff8a3c', transparent: true, opacity: film ? 0.25 : 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
    const patch = S.add(new THREE.PlaneGeometry(3.8, 2.6), patchMat, [0, G + 0.18, -0.4], { parent: g, rot: [-Math.PI / 2, 0, 0], cast: false, receive: false });
    const beamMat = new THREE.MeshBasicMaterial({ color: film ? '#9cc9ff' : '#ffcf85', transparent: true, opacity: film ? 0.05 : 0.2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const corners = [[wl, wt], [wr, wt], [wr, wb], [wl, wb]].map(([a, b]) => new THREE.Vector3(a, G + b, z0));
    const floorPts = corners.map((v) => new THREE.Vector3(v.x * 1.05, G + 0.18, z0 + (v.y - G) * 0.95 + 0.3));
    const bp = [];
    for (let k = 0; k < 4; k++) { const a = corners[k], b = corners[(k + 1) % 4], c = floorPts[(k + 1) % 4], d = floorPts[k]; [a, b, c, a, c, d].forEach((v) => bp.push(v.x, v.y, v.z)); }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
    g.add(new THREE.Mesh(bg, beamMat));
    // heat shimmer rising from the hot floor
    const HN = film ? 8 : 40, hpos = new Float32Array(HN * 3), hbase = [];
    for (let i = 0; i < HN; i++) hbase.push({ x: rnd(-1.6, 1.6), z: rnd(-1.4, 0.6), ph: Math.random() });
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', new THREE.BufferAttribute(hpos, 3));
    const heat = new THREE.Points(hg, new THREE.PointsMaterial({ map: radial([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], 64), color: film ? '#93c5fd' : '#ffae5c', size: 0.13, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    g.add(heat);
    S.frames.push((t) => {
      for (let i = 0; i < N; i++) {
        const b = base[i], u = (b.ph + t * sp * b.s) % 1;
        pos[i * 3] = (x < 0 ? ax + 0.2 + u * 1.6 : ax - 0.2 - u * 1.6);
        pos[i * 3 + 1] = G + 2.85 - u * u * 2.2;
        pos[i * 3 + 2] = -0.5 + b.z * 0.6;
      }
      ag.attributes.position.needsUpdate = true;
      for (let i = 0; i < HN; i++) {
        const b = hbase[i], u = (b.ph + t * 0.25) % 1;
        hpos[i * 3] = b.x + Math.sin(t * 2 + i) * 0.08;
        hpos[i * 3 + 1] = G + 0.2 + u * 2.4;
        hpos[i * 3 + 2] = b.z;
      }
      hg.attributes.position.needsUpdate = true;
      patchMat.opacity = (film ? 0.22 : 0.55) + Math.sin(t * 1.6) * 0.05;
    });
    rooms.push({ g, filmMesh, film });
  }
  room(-3.05, false);
  room(3.05, true);
  S.frames.push((t) => { sunSprite.material.rotation = t * 0.05; });

  const temps = host.querySelectorAll('[data-h3-temp]'), bars = host.querySelectorAll('[data-h3-bar]');
  const set = (el, v, k) => { el.textContent = Math.round(v); if (bars[k]) bars[k].style.width = Math.max(8, Math.min(100, ((v - 26) / 22) * 100)) + '%'; };
  S.onStart = () => {
    const tl = gsap.timeline({ delay: 0.2 });
    rooms.forEach((r, i) => tl.from(r.g.position, { y: 5, duration: 1.1, ease: 'bounce.out' }, i * 0.2));
    const f = rooms[1].filmMesh;
    if (f) tl.to(f.scale, { y: 1, duration: 1.4, ease: 'power3.inOut' }, 1.3);
    const a = { v: 38 }, b = { v: 38 };
    tl.to(a, { v: 46, duration: 2.2, ease: 'power2.out', onUpdate: () => set(temps[0], a.v, 0) }, 1.4);
    tl.to(b, { v: 32, duration: 2.2, ease: 'power2.out', onUpdate: () => set(temps[1], b.v, 1) }, 1.6);
    if (reduce) tl.progress(1);
  };
}

/* ======================================================================
   2. Smart glass meeting room
   ====================================================================== */
function smartRoom(host) {
  const S = makeStage(host, { cam: [8.8, 7.2, 12.4], target: [0, 1.0, 0], fov: 30, fovTall: 46 });
  const G = plinth(S, 10.6, 8.6);
  lights(S, [6, 12, 8], '#fff3e0', 2.2);
  const W = 6.4, D = 4.2, H = 2.7;
  S.add(S.rbox(W + 0.3, 0.12, D + 0.3, 0.05), M('#ffffff', { map: oak(), roughness: 0.55 }), [0, G + 0.06, 0], { cast: false });
  const metal = M('#1d2b42', { roughness: 0.3, metalness: 0.7, envMapIntensity: 1.2 });
  [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2], [0, D / 2], [0, -D / 2]].forEach(([x, z]) => S.add(S.rbox(0.1, H, 0.1, 0.03), metal, [x, G + 0.12 + H / 2, z]));
  [[0, D / 2, W + 0.1, 0.1], [0, -D / 2, W + 0.1, 0.1]].forEach(([x, z, w, d]) => S.add(S.rbox(w, 0.1, d, 0.03), metal, [x, G + 0.12 + H, z]));
  [[-W / 2, 0], [W / 2, 0]].forEach(([x, z]) => S.add(S.rbox(0.1, 0.1, D + 0.1, 0.03), metal, [x, G + 0.12 + H, z]));
  // interior
  const walnutM = M('#ffffff', { map: walnut(), roughness: 0.45 });
  S.add(S.rbox(3.4, 0.1, 1.3, 0.05), walnutM, [0, G + 0.9, 0.1]);
  [-1.2, 1.2].forEach((x) => S.add(S.rbox(0.12, 0.76, 0.9, 0.04), M('#1f2937', { metalness: 0.6, roughness: 0.3 }), [x, G + 0.5, 0.1]));
  const chairM = M('#2b3a52', { roughness: 0.7 });
  const peopleM = [M('#e5d3c0'), M('#c9a68a'), M('#8d6e5a'), M('#e9d6c4')], shirtM = [M('#3b82f6'), M('#f1f5f9'), M('#64748b'), M('#0f766e')];
  [[-1, -0.75], [0, -0.75], [1, -0.75], [-1, 0.95], [0, 0.95], [1, 0.95]].forEach(([x, z], i) => {
    const ch = new THREE.Group();
    S.add(S.rbox(0.5, 0.08, 0.5, 0.03), chairM, [0, 0.48, 0], { parent: ch });
    S.add(S.rbox(0.5, 0.55, 0.07, 0.03), chairM, [0, 0.78, z < 0 ? -0.24 : 0.24], { parent: ch });
    S.add(new THREE.CylinderGeometry(0.03, 0.03, 0.44, 8), metal, [0, 0.24, 0], { parent: ch });
    if (i % 2 === 0 || i === 3) {
      const k = Math.floor(i / 2) % 4;
      S.add(new THREE.CapsuleGeometry(0.17, 0.36, 6, 12), shirtM[k], [0, 0.82, z < 0 ? -0.05 : 0.05], { parent: ch });
      S.add(new THREE.SphereGeometry(0.13, 20, 16), peopleM[k], [0, 1.2, z < 0 ? -0.04 : 0.04], { parent: ch });
    }
    ch.position.set(x, G + 0.12, z + 0.1);
    S.root.add(ch);
  });
  const scr = document.createElement('canvas');
  scr.width = 512; scr.height = 288;
  const sg = scr.getContext('2d');
  const grd = sg.createLinearGradient(0, 0, 512, 288); grd.addColorStop(0, '#0b2346'); grd.addColorStop(1, '#0878e8');
  sg.fillStyle = grd; sg.fillRect(0, 0, 512, 288);
  sg.fillStyle = 'rgba(255,255,255,.9)'; sg.fillRect(40, 50, 180, 18); sg.fillStyle = 'rgba(255,255,255,.5)'; sg.fillRect(40, 84, 120, 12);
  [60, 110, 80, 150, 120].forEach((h, i) => { sg.fillStyle = i === 3 ? '#7cc0ff' : 'rgba(255,255,255,.65)'; sg.fillRect(270 + i * 40, 240 - h, 26, h); });
  const scrTex = new THREE.CanvasTexture(scr); scrTex.colorSpace = THREE.SRGBColorSpace;
  S.add(S.rbox(2.2, 1.25, 0.08, 0.03), M('#111827', { roughness: 0.3 }), [0, G + 1.75, -D / 2 + 0.12]);
  S.add(new THREE.PlaneGeometry(2.08, 1.13), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false }), [0, G + 1.75, -D / 2 + 0.165], { cast: false });
  plant(S, -W / 2 - 0.9, D / 2 + 0.5, 1.2, G);
  plant(S, W / 2 + 0.8, -D / 2 - 0.4, 1.4, G);
  // glass walls
  const walls = [];
  const wallDefs = [
    [new THREE.BoxGeometry(W / 2 - 0.1, H - 0.05, 0.03), [-W / 4, D / 2]], [new THREE.BoxGeometry(W / 2 - 0.1, H - 0.05, 0.03), [W / 4, D / 2]],
    [new THREE.BoxGeometry(0.03, H - 0.05, D - 0.1), [W / 2, 0]], [new THREE.BoxGeometry(0.03, H - 0.05, D - 0.1), [-W / 2, 0]],
    [new THREE.BoxGeometry(W / 2 - 0.1, H - 0.05, 0.03), [-W / 4, -D / 2]], [new THREE.BoxGeometry(W / 2 - 0.1, H - 0.05, 0.03), [W / 4, -D / 2]],
  ];
  wallDefs.forEach(([geo, [x, z]]) => {
    const m = new THREE.MeshPhysicalMaterial({ color: '#e6f1ff', transparent: true, opacity: 0.14, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.4, depthWrite: false });
    const mesh = S.add(geo, m, [x, G + 0.12 + H / 2, z], { cast: false, receive: false });
    mesh.renderOrder = 5;
    walls.push(m);
  });
  // LED edge that lights up when the film switches
  const led = glowM('#3b9bff', { transparent: true, opacity: 0.25 });
  [[0, D / 2 + 0.02, W, 0.03], [0, -D / 2 - 0.02, W, 0.03]].forEach(([x, z, w, d]) => S.add(new THREE.BoxGeometry(w, 0.03, d), led, [x, G + 0.14, z], { cast: false, receive: false }));
  [[W / 2 + 0.02, 0], [-W / 2 - 0.02, 0]].forEach(([x, z]) => S.add(new THREE.BoxGeometry(0.03, 0.03, D), led, [x, G + 0.14, z], { cast: false, receive: false }));

  const sweepMat = new THREE.MeshBasicMaterial({ map: canvasTex(64, 8, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(160,210,255,0)'); gr.addColorStop(0.5, 'rgba(220,240,255,1)'); gr.addColorStop(1, 'rgba(160,210,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  const sweep = S.add(new THREE.PlaneGeometry(0.7, H), sweepMat, [-W / 2, G + 0.12 + H / 2, D / 2 + 0.03], { cast: false, receive: false });
  sweep.renderOrder = 6;
  const btns = host.closest('[data-h3-wrap]').querySelectorAll('[data-h3-mode]');
  let priv = false, auto = null;
  function setMode(p, instant) {
    priv = p;
    btns.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.h3Mode === 'private') === p)));
    host.classList.toggle('is-private', p);
    const d = instant ? 0 : 1;
    walls.forEach((m, i) => {
      gsap.to(m, { opacity: p ? 0.9 : 0.14, roughness: p ? 0.95 : 0.05, duration: 0.55 * d, delay: i * 0.07 * d, ease: 'power2.inOut' });
      gsap.to(m.color, { r: p ? 0.97 : 0.9, g: p ? 0.98 : 0.945, b: p ? 1 : 1, duration: 0.55 * d, delay: i * 0.07 * d });
    });
    gsap.fromTo(led, { opacity: 1 }, { opacity: 0.25, duration: 1.2 * d, ease: 'power2.out' });
    if (!instant) {
      gsap.fromTo(sweep.position, { x: -W / 2 }, { x: W / 2, duration: 0.7, ease: 'power2.inOut' });
      gsap.fromTo(sweepMat, { opacity: 0.9 }, { opacity: 0, duration: 0.8, ease: 'power1.in' });
    }
  }
  btns.forEach((b) => b.addEventListener('click', () => { clearInterval(auto); setMode(b.dataset.h3Mode === 'private'); }));
  S.onStart = () => {
    setMode(false, true);
    if (!reduce) auto = setInterval(() => setMode(!priv), 3600);
  };
}

/* ======================================================================
   3. Spill it, wipe it — marble island
   ====================================================================== */
function spill(host) {
  const S = makeStage(host, { cam: [6.6, 7.0, 11.2], target: [0, 1.3, 0.1], fov: 30, fovTall: 46 });
  const G = plinth(S, 10, 7.4);
  lights(S, [5, 11, 7], '#fff1dc', 2.1);
  S.add(S.rbox(9, 3.6, 0.2, 0.05), M('#f2eee8', { roughness: 0.9 }), [0, G + 1.8, -2.6]);
  S.add(S.rbox(9, 0.9, 0.04, 0.01), M('#ffffff', { map: marble(), roughness: 0.25 }), [0, G + 2.15, -2.48], { cast: false });
  // back counter + cabinets
  S.add(S.rbox(8.6, 1.5, 0.9, 0.04), M('#ffffff', { map: walnut(), roughness: 0.5 }), [0, G + 0.75, -2.0]);
  S.add(S.rbox(8.8, 0.08, 1.0, 0.02), M('#ffffff', { map: marble(), roughness: 0.2 }), [0, G + 1.54, -2.0]);
  // island
  const topY = G + 1.72;
  S.add(S.rbox(4.6, 1.5, 2.0, 0.06), M('#ffffff', { map: walnut(), roughness: 0.5 }), [0, G + 0.82, 0.4]);
  S.add(S.rbox(5.0, 0.14, 2.4, 0.05), M('#ffffff', { map: marble(), roughness: 0.15, envMapIntensity: 1.2 }), [0, topY - 0.07, 0.4]);
  // film layer + sheen that sweeps on as it is applied
  const filmMat = new THREE.MeshStandardMaterial({ color: '#7cc0ff', transparent: true, opacity: 0, roughness: 0.05, metalness: 0.2, depthWrite: false });
  S.add(new THREE.BoxGeometry(4.96, 0.004, 2.36), filmMat, [0, topY + 0.003, 0.4], { cast: false, receive: false });
  const sheenMat = new THREE.MeshBasicMaterial({ map: canvasTex(128, 8, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const sheen = S.add(new THREE.PlaneGeometry(0.9, 2.36), sheenMat, [-2.4, topY + 0.01, 0.4], { rot: [-Math.PI / 2, 0, 0], cast: false, receive: false });
  // stools
  [-1.4, 0, 1.4].forEach((x) => {
    S.add(new THREE.CylinderGeometry(0.32, 0.3, 0.1, 32), M('#2b3a52', { roughness: 0.6 }), [x, G + 1.1, 2.1]);
    S.add(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 10), M('#c9a25e', { metalness: 1, roughness: 0.3 }), [x, G + 0.58, 2.1]);
    S.add(new THREE.TorusGeometry(0.22, 0.02, 8, 30), M('#c9a25e', { metalness: 1, roughness: 0.3 }), [x, G + 0.4, 2.1], { rot: [Math.PI / 2, 0, 0] });
  });
  // pendants
  [-1.4, 0, 1.4].forEach((x) => {
    S.add(new THREE.CylinderGeometry(0.008, 0.008, 1.6, 6), M('#1f2937'), [x, G + 4.0, 0.4], { cast: false });
    S.add(new THREE.SphereGeometry(0.2, 24, 16), glowM('#fff1d6'), [x, G + 3.1, 0.4], { cast: false });
  });
  // fruit bowl
  S.add(new THREE.LatheGeometry([[0, 0], [0.32, 0.02], [0.4, 0.16], [0.42, 0.2]].map(([a, b]) => new THREE.Vector2(a, b)), 40), M('#ffffff', { roughness: 0.4, side: THREE.DoubleSide }), [-1.5, topY, 0.1]);
  [[-1.58, 0.12, 0.06, '#f59e0b'], [-1.42, 0.14, 0.16, '#84cc16'], [-1.5, 0.22, 0.02, '#ef4444']].forEach(([x, y, z, c]) => S.add(new THREE.SphereGeometry(0.12, 20, 14), M(c, { roughness: 0.5 }), [x, topY + y, 0.1 + z]));
  // wine glass (pivot at its base) with wine
  const glassPivot = new THREE.Group();
  glassPivot.position.set(0.5, topY, 0.55);
  S.root.add(glassPivot);
  const prof = [[0, 0], [0.16, 0], [0.16, 0.015], [0.02, 0.03], [0.02, 0.32], [0.12, 0.42], [0.17, 0.58], [0.16, 0.74], [0.15, 0.76]].map(([a, b]) => new THREE.Vector2(a, b));
  S.add(new THREE.LatheGeometry(prof, 40), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.32, roughness: 0.02, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }), [0, 0, 0], { parent: glassPivot, cast: false });
  const wine = S.add(new THREE.LatheGeometry([[0, 0.36], [0.1, 0.42], [0.15, 0.55], [0.0, 0.55]].map(([a, b]) => new THREE.Vector2(a, b)), 32), M('#7f1d1d', { roughness: 0.1 }), [0, 0, 0], { parent: glassPivot });
  // spill blobs
  const wineM = M('#7a1020', { roughness: 0.05, metalness: 0.1, envMapIntensity: 1.6 });
  const blobs = [[0.95, 0.5, 0.26], [1.3, 0.62, 0.2], [1.25, 0.38, 0.17], [1.6, 0.52, 0.15], [1.05, 0.72, 0.13], [1.8, 0.66, 0.11]].map(([x, z, r]) => {
    const b = S.add(new THREE.SphereGeometry(1, 28, 18), wineM, [x, topY + 0.01, z], { receive: false });
    b.scale.setScalar(0.0001);
    b.userData.r = r;
    return b;
  });
  const cloth = S.add(S.rbox(0.9, 0.08, 0.7, 0.03), M('#93c5fd', { roughness: 1 }), [-3.2, topY + 0.05, 0.6]);
  cloth.visible = false;
  const sparkTex = radial([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(190,230,255,.9)'], [1, 'rgba(80,170,255,0)']], 128);
  const sparks = [[1.0, 0.5], [1.5, 0.7], [1.8, 0.45]].map(([x, z]) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    s.position.set(x, topY + 0.25, z);
    s.scale.setScalar(0.001);
    S.root.add(s);
    return s;
  });

  const splashM = M('#8b1426', { roughness: 0.05, envMapIntensity: 1.6 });
  const splash = Array.from({ length: 9 }, () => { const s = S.add(new THREE.SphereGeometry(0.035, 12, 10), splashM, [0.9, topY + 0.05, 0.5], { cast: false }); s.visible = false; return s; });
  const stepEls = host.closest('[data-h3-wrap]').querySelectorAll('[data-h3-step]');
  const wrapEl = host.closest('[data-h3-wrap]');
  const capN = wrapEl.querySelector('[data-sp-n]'), capT = wrapEl.querySelector('[data-sp-t]'), cap = capT && capT.parentNode;
  const step = (k) => {
    stepEls.forEach((el, i) => { el.classList.toggle('is-on', i === k); el.classList.toggle('is-done', i < k); });
    if (cap && stepEls[k]) {
      cap.classList.remove('is-swap'); void cap.offsetWidth; cap.classList.add('is-swap');
      capN.textContent = '0' + (k + 1);
      capT.textContent = stepEls[k].dataset.label;
    }
    if (cap) cap.classList.toggle('is-done', k >= stepEls.length);
  };
  let tl = null;
  function play() {
    if (tl) tl.kill();
    tl = gsap.timeline({ repeat: reduce ? 0 : -1, repeatDelay: 1 });
    tl.set(glassPivot.rotation, { z: 0 }).set(glassPivot.position, { x: 0.5 }).set(wine.scale, { x: 1, y: 1, z: 1 }).set(cloth, { visible: false }).set(cloth.position, { x: -3.2 }).set(filmMat, { opacity: 0 });
    blobs.forEach((b) => tl.set(b.scale, { x: 0.0001, y: 0.0001, z: 0.0001 }, 0).set(b.position, { y: topY + 0.01 }, 0));
    sparks.forEach((s) => tl.set(s.scale, { x: 0.001, y: 0.001 }, 0));
    tl.call(() => step(0), null, 0.15).call(() => step(1), null, 1.75).call(() => step(2), null, 2.95).call(() => step(3), null, 3.85).call(() => step(4), null, 5.6);
    splash.forEach((s, i) => {
      const ang = (i / splash.length) * Math.PI - 0.2, dist = rnd(0.35, 0.9);
      tl.set(s, { visible: true }, 2.1).set(s.position, { x: 0.9, y: topY + 0.05, z: 0.5 }, 2.1)
        .to(s.position, { x: 0.9 + Math.cos(ang) * dist, z: 0.5 + Math.sin(ang) * dist * 0.6, duration: 0.45, ease: 'power2.out' }, 2.1)
        .to(s.position, { keyframes: [{ y: topY + rnd(0.25, 0.45), duration: 0.2, ease: 'power2.out' }, { y: topY + 0.03, duration: 0.25, ease: 'power2.in' }] }, 2.1)
        .set(s, { visible: false }, 3.9 + i * 0.05);
    });
    // 1) film goes on
    tl.set(sheenMat, { opacity: 1 }, 0.2).fromTo(sheen.position, { x: -2.4 }, { x: 2.4, duration: 1.1, ease: 'power2.inOut' }, 0.2).to(sheenMat, { opacity: 0, duration: 0.2 }, 1.2);
    tl.to(filmMat, { opacity: 0.16, duration: 0.8 }, 0.4);
    tl.set(S.dolly, { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 }, 0)
      .to(S.dolly, { x: -1.6, y: -1.7, z: -3.0, tx: 0.5, ty: 0.15, tz: 0.2, duration: 1.3, ease: 'power2.inOut' }, 1.4)
      .to(S.dolly, { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, duration: 1.4, ease: 'power2.inOut' }, 5.2);
    // 2) the glass tips over
    tl.to(glassPivot.rotation, { z: -1.45, duration: 0.45, ease: 'power2.in' }, 1.8);
    tl.to(glassPivot.position, { x: 0.62, duration: 0.45 }, 1.8);
    tl.to(wine.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.3 }, 2.05);
    // 3) wine spreads, then pulls up into beads (it can't soak in)
    blobs.forEach((b, i) => {
      const r = b.userData.r;
      tl.to(b.scale, { x: r, y: 0.025, z: r * 0.8, duration: 0.35, ease: 'power2.out' }, 2.15 + i * 0.05);
      tl.to(b.scale, { x: r * 0.55, y: r * 0.42, z: r * 0.55, duration: 0.5, ease: 'back.out(2)' }, 3.0 + i * 0.05);
      tl.to(b.position, { y: topY + r * 0.42 * 0.9, duration: 0.5 }, 3.0 + i * 0.05);
    });
    // 4) one wipe and it's gone
    tl.set(cloth, { visible: true }, 3.9).fromTo(cloth.position, { x: 0.2 }, { x: 2.6, duration: 1.0, ease: 'power1.inOut' }, 3.9);
    blobs.forEach((b) => tl.to(b.scale, { x: 0.0001, y: 0.0001, z: 0.0001, duration: 0.18 }, 3.9 + ((b.position.x - 0.2) / 2.4) * 1.0));
    tl.set(cloth, { visible: false }, 5.0);
    sparks.forEach((s, i) => tl.to(s.scale, { x: 0.45, y: 0.45, duration: 0.25, yoyo: true, repeat: 1 }, 5.0 + i * 0.12));
    // 5) glass back up
    tl.to(glassPivot.rotation, { z: 0, duration: 0.6, ease: 'power2.out' }, 5.4).to(glassPivot.position, { x: 0.5, duration: 0.6 }, 5.4).to(wine.scale, { x: 1, y: 1, z: 1, duration: 0.4 }, 5.8);
  }
  const again = host.closest('[data-h3-wrap]').querySelector('[data-h3-again]');
  if (again) again.addEventListener('click', play);
  S.onStart = play;
}


/* ======================================================================
   4. Decorative glass — office partition with a frosted pattern + logo band
   ====================================================================== */
function decorScene(host) {
  const S = makeStage(host, { cam: [7.2, 6.4, 10.4], target: [0, 1.4, 0], fov: 30, fovTall: 46 });
  const G = plinth(S, 10, 8);
  lights(S, [6, 12, 8], '#fff3e0', 2.2);
  S.add(S.rbox(8.6, 0.1, 6.4, 0.04), M('#ffffff', { map: oak(), roughness: 0.55 }), [0, G + 0.05, 0], { cast: false });
  const metal = M('#1d2b42', { roughness: 0.3, metalness: 0.7, envMapIntensity: 1.2 });
  const H = 2.9, z = -1.2;
  // frosted pattern texture: diamonds band + logo circle, rest clear
  const pat = canvasTex(1024, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.88)'; g.fillRect(0, h * 0.34, w, h * 0.3);
    g.globalCompositeOperation = 'destination-out';
    for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x + 32, h * 0.38); g.lineTo(x + 56, h * 0.49); g.lineTo(x + 32, h * 0.6); g.lineTo(x + 8, h * 0.49); g.closePath(); g.fill(); }
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 18; i++) g.fillRect(0, h * 0.7 + i * 7, w, 2);
  });
  [-2.6, 0, 2.6].forEach((x, i) => {
    S.add(new THREE.BoxGeometry(2.5, H, 0.04), new THREE.MeshPhysicalMaterial({ color: '#e8f3ff', transparent: true, opacity: 0.18, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.4, depthWrite: false }), [x, G + 0.1 + H / 2, z], { cast: false, receive: false }).renderOrder = 4;
    const pm = new THREE.MeshBasicMaterial({ map: pat, transparent: true, depthWrite: false, toneMapped: false });
    S.add(new THREE.PlaneGeometry(2.5, H), pm, [x, G + 0.1 + H / 2, z + 0.03], { cast: false, receive: false }).renderOrder = 5;
  });
  [-3.9, -1.3, 1.3, 3.9].forEach((x) => S.add(S.rbox(0.09, H, 0.09, 0.03), metal, [x, G + 0.1 + H / 2, z]));
  S.add(S.rbox(7.9, 0.09, 0.09, 0.03), metal, [0, G + 0.1 + H, z]);
  // logo on the middle pane
  const logo = canvasTex(256, 256, (g, w) => { g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(w / 2, w / 2, w * 0.42, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'destination-out'; g.font = `800 ${w * 0.3}px 'Inter', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ET', w / 2, w / 2 + 6); });
  S.add(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshBasicMaterial({ map: logo, transparent: true, depthWrite: false, toneMapped: false }), [0, G + 2.35, z + 0.04], { cast: false, receive: false }).renderOrder = 6;
  // office behind and in front
  const wal = M('#ffffff', { map: walnut(), roughness: 0.45 });
  S.add(S.rbox(2.2, 0.08, 1.0, 0.03), wal, [-0.6, G + 0.85, -2.6]);
  [-1.5, 0.3].forEach((x) => S.add(S.rbox(0.08, 0.75, 0.9, 0.03), metal, [x, G + 0.47, -2.6]));
  S.add(S.rbox(0.9, 0.55, 0.05, 0.02), M('#111827', { roughness: 0.3 }), [-0.6, G + 1.25, -2.95]);
  S.add(S.rbox(0.6, 0.6, 0.6, 0.12), M('#2b3a52', { roughness: 0.7 }), [-0.6, G + 0.5, -2.0]);
  plant(S, 3.0, -2.6, 1.3, G);
  plant(S, -3.6, 1.6, 1.1, G);
  S.add(S.rbox(1.8, 0.08, 0.8, 0.03), M('#f4f2ee', { roughness: 0.2 }), [1.5, G + 0.5, 1.3]);
  S.add(new THREE.CylinderGeometry(0.06, 0.08, 0.42, 12), metal, [1.5, G + 0.27, 1.3]);
  S.add(S.rbox(2.2, 0.36, 0.9, 0.14), M('#efe6d6', { roughness: 0.95 }), [1.5, G + 0.28, 2.4]);
}

/* ======================================================================
   5. Fabric protection — sofa where water beads up on the cushions
   ====================================================================== */
function fabricScene(host) {
  const S = makeStage(host, { cam: [5.6, 5.0, 9.2], target: [0, 1.0, 0], fov: 30, fovTall: 44 });
  const G = plinth(S, 9, 7);
  lights(S, [5, 11, 7], '#fff1dc', 2.1);
  S.add(S.rbox(8.4, 3.2, 0.2, 0.05), M('#eef2f6', { roughness: 0.9 }), [0, G + 1.6, -2.4]);
  S.add(S.rbox(5.2, 0.03, 3.4, 0.015), M('#e6dccb', { roughness: 1 }), [0, G + 0.02, 0.2], { cast: false });
  const fab = M('#8fa7c4', { roughness: 0.95 });
  const fab2 = M('#7d97b6', { roughness: 0.95 });
  const sofa = new THREE.Group();
  S.add(S.rbox(3.8, 0.42, 1.4, 0.16), fab2, [0, 0.36, 0], { parent: sofa });
  S.add(S.rbox(3.8, 0.85, 0.32, 0.14), fab2, [0, 0.9, -0.56], { parent: sofa });
  [-1.78, 1.78].forEach((x) => S.add(S.rbox(0.34, 0.66, 1.4, 0.15), fab2, [x, 0.62, 0], { parent: sofa }));
  [-0.9, 0.9].forEach((x) => S.add(S.rbox(1.7, 0.26, 1.15, 0.12), fab, [x, 0.7, 0.1], { parent: sofa }));
  [-0.9, 0.9].forEach((x) => S.add(S.rbox(1.6, 0.7, 0.3, 0.14), fab, [x, 1.1, -0.36], { parent: sofa, rot: [-0.15, 0, 0] }));
  S.add(S.rbox(0.6, 0.5, 0.16, 0.08), M('#e8d5b5', { roughness: 0.95 }), [-1.2, 1.05, -0.12], { parent: sofa, rot: [-0.3, 0.2, 0.06] });
  [-1.6, 1.6].forEach((x) => [-0.5, 0.5].forEach((z) => S.add(new THREE.CylinderGeometry(0.035, 0.025, 0.16, 8), M('#c9a25e', { metalness: 1, roughness: 0.3 }), [x, 0.08, z], { parent: sofa })));
  sofa.position.set(0, G, -0.6);
  S.root.add(sofa);
  // water beads sitting on the fabric (they don't soak in)
  const drop = new THREE.MeshPhysicalMaterial({ color: '#cfeaff', roughness: 0, metalness: 0, transparent: true, opacity: 0.85, clearcoat: 1, envMapIntensity: 2.2 });
  [[-1.2, 0.2, 0.09], [-0.7, 0.42, 0.07], [-0.95, -0.05, 0.06], [0.6, 0.3, 0.1], [1.1, 0.05, 0.07], [0.85, 0.5, 0.05], [1.35, 0.35, 0.06], [-0.4, 0.15, 0.05]].forEach(([x, z, r]) => {
    const d = S.add(new THREE.SphereGeometry(1, 24, 16), drop, [x, G + 0.83 + r * 0.6, -0.5 + z], { cast: false });
    d.scale.set(r, r * 0.75, r);
  });
  // side table + glass
  S.add(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 36), M('#f4f2ee', { roughness: 0.2 }), [2.7, G + 0.62, -0.3]);
  S.add(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 10), M('#c9a25e', { metalness: 1, roughness: 0.3 }), [2.7, G + 0.31, -0.3]);
  S.add(new THREE.CylinderGeometry(0.11, 0.09, 0.3, 24), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, roughness: 0, clearcoat: 1 }), [2.6, G + 0.8, -0.25]);
  plant(S, -2.9, -1.6, 1.4, G);
}

/* ---------- boot ---------- */
const hosts = document.querySelectorAll('[data-h3]');
if (hosts.length && gsap && webgl()) {
  const map = { twin, smart: smartRoom, spill, decor: decorScene, fabric: fabricScene };
  hosts.forEach((h) => {
    const fn = map[h.dataset.h3];
    if (!fn) return;
    if (h.hasAttribute('data-capture')) return fn(h);
    // create the WebGL scene only when the section is about to scroll into view
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); fn(h); } }, { rootMargin: '600px 0px' });
    io.observe(h);
  });
} else {
  hosts.forEach((h) => h.classList.add('h3-fallback'));
}
