/* ======================================================================
   "How it works" 3D stage (Three.js + GSAP)
   A modern villa on a floating plinth. The scene plays the three steps:
   1. a phone rises, flashes, scans the window and sends the photo,
   2. three film samples fan out and the best one is picked,
   3. the film flies onto the glass, rolls down and the heat bounces off.
   Driven by the step controller in main.js through the `hx:stage` event.
   ====================================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const box = document.querySelector('[data-hf]');
const host = box && box.querySelector('[data-s3d]');
const canvas = host && host.querySelector('canvas');
const gsap = window.gsap;

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

if (host && canvas && gsap && supportsWebGL()) (document.fonts ? document.fonts.ready : Promise.resolve()).then(init);

function init() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ar = document.documentElement.lang === 'ar';
  let S = {};
  try { S = JSON.parse(host.dataset.s3d || '{}'); } catch (e) { /* keep defaults */ }
  S = Object.assign({ name: 'Exotic Tint', online: 'online', villa: 'Villa · 14 windows', reply: 'Got it! Your quote is ready', measured: 'Measured', dims: '5.2 m × 2.0 m', f1: 'Regular tint', f2: 'Nano ceramic', f3: 'Super nano ceramic' }, S);
  const FONT = getComputedStyle(document.body).fontFamily || "'Inter', sans-serif";

  /* ---------- renderer / scene / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  const CAMS = [
    { x: -8.5, y: 9.0, z: 15.5, tx: -1.4, ty: 1.5, tz: 0.6 },
    { x: -2.5, y: 8.0, z: 17.0, tx: -0.8, ty: 1.6, tz: 0.6 },
    { x: 9.5, y: 9.5, z: 16.0, tx: -0.2, ty: 1.4, tz: 0 },
  ];
  const cam = { ...CAMS[0] };

  /* ---------- canvas helpers ---------- */
  const rr = (g, x, y, w, h, r) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };
  const toTex = (c, srgb = true) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const radial = (stops, size = 256) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => grd.addColorStop(o, col));
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    return toTex(c);
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const walnut = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#7a5434';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 60; i++) {
      g.strokeStyle = `rgba(40,22,8,${rnd(0.1, 0.3)})`;
      g.lineWidth = rnd(0.5, 2);
      g.beginPath();
      const x = rnd(0, 256);
      g.moveTo(x, 0);
      g.bezierCurveTo(x + rnd(-8, 8), 80, x + rnd(-8, 8), 170, x + rnd(-5, 5), 256);
      g.stroke();
    }
    return toTex(c);
  })();

  /* ---------- materials ---------- */
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, envMapIntensity: 0.6, ...o });
  const glow = (color, o = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...o });
  const mat = {
    plinth: M('#0c2348', { roughness: 0.32, metalness: 0.5, envMapIntensity: 1 }),
    rim: glow('#3b9bff'),
    deck: M('#e9eef5', { roughness: 0.85 }),
    lawn: M('#8daf84', { roughness: 1 }),
    wall: M('#f8f6f2', { roughness: 0.75 }),
    slab: M('#e2ded6', { roughness: 0.6 }),
    frame: M('#16243a', { roughness: 0.3, metalness: 0.6 }),
    wood: M('#ffffff', { map: walnut, roughness: 0.55 }),
    stone: M('#d6dae1', { roughness: 0.9 }),
    water: M('#56b8ff', { roughness: 0.05, metalness: 0.1, emissive: '#0b72e0', emissiveIntensity: 0.35, envMapIntensity: 1.5 }),
    rail: M('#cfe6ff', { transparent: true, opacity: 0.35, roughness: 0.05, envMapIntensity: 1.5, depthWrite: false }),
    trunk: M('#6b5038', { roughness: 0.9 }),
    leaf: M('#6f9d68', { roughness: 0.8, flatShading: true }),
    leaf2: M('#5a8a58', { roughness: 0.8, flatShading: true }),
    phone: M('#0d1b30', { roughness: 0.22, metalness: 0.75, envMapIntensity: 1.3 }),
    lens: M('#05080f', { roughness: 0.05, metalness: 0.9, envMapIntensity: 2 }),
  };
  const HOT = { c: new THREE.Color('#f2a65a'), e: new THREE.Color('#ff7a1a'), ei: 0.42, m: 0.1, r: 0.25 };
  const COOL = { c: new THREE.Color('#1d3f73'), e: new THREE.Color('#0b4aa3'), ei: 0.3, m: 0.6, r: 0.06 };
  const glassMat = () => M(HOT.c.clone(), { emissive: HOT.e.clone(), emissiveIntensity: HOT.ei, roughness: HOT.r, metalness: HOT.m, envMapIntensity: 1.4 });
  const glassMain = glassMat(), glassUp = glassMat();
  const setGlass = (m, s) => { m.color.copy(s.c); m.emissive.copy(s.e); m.emissiveIntensity = s.ei; m.metalness = s.m; m.roughness = s.r; };
  const tweenGlass = (tl, m, s, at, d) => {
    tl.to(m.color, { r: s.c.r, g: s.c.g, b: s.c.b, duration: d, ease: 'power2.inOut' }, at);
    tl.to(m.emissive, { r: s.e.r, g: s.e.g, b: s.e.b, duration: d, ease: 'power2.inOut' }, at);
    tl.to(m, { emissiveIntensity: s.ei, metalness: s.m, roughness: s.r, duration: d, ease: 'power2.inOut' }, at);
  };

  /* ---------- builders ---------- */
  const world = new THREE.Group();
  scene.add(world);
  const add = (geo, material, pos, o = {}) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    if (o.rot) m.rotation.set(...o.rot);
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.receive !== false;
    (o.parent || world).add(m);
    return m;
  };
  const rbox = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, r);
  const G = 0.12; // deck top

  /* ---------- plinth ---------- */
  add(rbox(14, 0.6, 11, 0.28), mat.plinth, [0, -0.3, 0.5], { cast: false });
  add(rbox(14.08, 0.035, 11.08, 0.015), mat.rim, [0, -0.05, 0.5], { cast: false, receive: false });
  add(rbox(13.5, 0.14, 10.5, 0.06), mat.deck, [0, 0.05, 0.5], { cast: false });

  // lawn, stepping stones, pool
  add(rbox(5.6, 0.06, 4.2, 0.03), mat.lawn, [-3.6, G + 0.03, 3.4], { cast: false });
  for (let i = 0; i < 4; i++) add(rbox(1.2, 0.04, 0.6, 0.03), mat.stone, [-0.2, G + 0.02, 1.2 + i * 1.05], { cast: false });
  add(rbox(4.6, 0.18, 3.4, 0.05), mat.wall, [3.7, G + 0.09, 3.3], { cast: false });
  add(new THREE.BoxGeometry(4.1, 0.04, 2.9), mat.water, [3.7, G + 0.15, 3.3], { cast: false });

  /* ---------- villa ---------- */
  const villa = new THREE.Group();
  world.add(villa);
  add(rbox(8, 2.6, 4, 0.05), mat.wall, [-0.4, G + 1.3, -2.2], { parent: villa }); // front face z = -0.2
  add(rbox(8.4, 0.18, 4.4, 0.04), mat.slab, [-0.4, G + 2.69, -2.2], { parent: villa });
  add(rbox(5.6, 2.1, 4.4, 0.05), mat.wall, [-1.7, G + 3.83, -2.0], { parent: villa }); // front face z = 0.2
  add(rbox(6.0, 0.2, 4.8, 0.04), mat.slab, [-1.7, G + 4.98, -2.0], { parent: villa });
  add(new THREE.BoxGeometry(2.5, 0.5, 0.03), mat.rail, [2.35, G + 3.03, -0.08], { parent: villa, cast: false });
  for (let i = 0; i < 10; i++) add(new THREE.CylinderGeometry(0.045, 0.045, 2.3, 10), mat.wood, [1.75 + i * 0.17, G + 1.25, -0.14], { parent: villa });
  add(rbox(1.9, 0.5, 0.5, 0.2), mat.leaf, [2.55, G + 0.25, 0.32], { parent: villa });

  const makeWindow = (L, R, B, T, zf, glass, divs) => {
    const w = R - L, h = T - B, cx = (L + R) / 2, cy = (B + T) / 2;
    add(new THREE.PlaneGeometry(w, h), glass, [cx, cy, zf + 0.015], { parent: villa, cast: false });
    const bar = (bw, bh, x, y) => add(new THREE.BoxGeometry(bw, bh, 0.1), mat.frame, [x, y, zf + 0.05], { parent: villa });
    bar(w + 0.1, 0.09, cx, B);
    bar(w + 0.1, 0.09, cx, T);
    bar(0.09, h, L, cy);
    bar(0.09, h, R, cy);
    for (let i = 1; i < divs; i++) bar(0.06, h, L + (i * w) / divs, cy);
  };
  const wL = -3.8, wR = 1.4, wB = G + 0.3, wT = G + 2.3, zf = -0.2;
  const wW = wR - wL, wH = wT - wB, wcx = (wL + wR) / 2, wcy = (wB + wT) / 2;
  makeWindow(wL, wR, wB, wT, zf, glassMain, 3);
  makeWindow(-4.1, 0.7, G + 3.1, G + 4.5, 0.2, glassUp, 4);

  // low-poly trees
  const tree = (x, z, s) => {
    const t = new THREE.Group();
    add(new THREE.CylinderGeometry(0.06 * s, 0.09 * s, 1.4 * s, 8), mat.trunk, [0, 0.7 * s, 0], { parent: t });
    add(new THREE.IcosahedronGeometry(0.75 * s, 1), mat.leaf, [0, 1.75 * s, 0], { parent: t });
    add(new THREE.IcosahedronGeometry(0.55 * s, 1), mat.leaf2, [0.35 * s, 1.45 * s, 0.2 * s], { parent: t });
    add(new THREE.IcosahedronGeometry(0.5 * s, 1), mat.leaf2, [-0.3 * s, 2.15 * s, -0.1 * s], { parent: t });
    t.position.set(x, G, z);
    world.add(t);
  };
  tree(-6.0, -1.2, 1.15);
  tree(5.8, -2.4, 1.3);
  tree(5.9, 0.9, 0.8);

  /* ---------- light ---------- */
  scene.add(new THREE.HemisphereLight('#dbe9ff', '#132a52', 0.75));
  const fill = new THREE.DirectionalLight('#bcd6ff', 0.55);
  fill.position.set(-10, 6, 8);
  scene.add(fill);
  const sunPos = new THREE.Vector3(-1.5, 10.5, 7.5);
  const sun = new THREE.DirectionalLight('#ffd29a', 2.6);
  sun.position.copy(sunPos).multiplyScalar(1.6);
  sun.target.position.set(-1, 0, -1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(innerWidth < 700 ? 1024 : 2048, innerWidth < 700 ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 });
  sun.shadow.bias = -0.0008;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target);

  const glowTex = radial([[0, 'rgba(255,255,255,1)'], [0.16, 'rgba(255,240,200,1)'], [0.4, 'rgba(255,190,100,.5)'], [1, 'rgba(255,150,60,0)']]);
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  sunSprite.position.copy(sunPos);
  sunSprite.scale.set(3.2, 3.2, 1);
  sunSprite.visible = false; // the sun is drawn in the page, beside the card's top-right corner

  // contact shadow under the plinth
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(0,8,24,.55)'], [0.6, 'rgba(0,8,24,.2)'], [1, 'rgba(0,8,24,0)']]), transparent: true, depthWrite: false }));
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, -0.7, 0.6);
  scene.add(contact);

  let beamGeo = null;
  // heat beam: a soft pyramid from the sun onto the main window
  const beamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color('#ffbf6e') }, uOpacity: { value: 0.16 } },
    vertexShader: 'attribute float fade; varying float vFade; void main(){ vFade = fade; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity; varying float vFade; void main(){ gl_FragColor = vec4(uColor, uOpacity * pow(vFade, 2.0)); }',
  });
  {
    const corners = [[wL, wT], [wR, wT], [wR, wB], [wL, wB]].map(([x, y]) => new THREE.Vector3(x, y, zf + 0.02));
    const pos = [], fade = [];
    for (let k = 0; k < 4; k++) {
      const a = corners[k], b = corners[(k + 1) % 4];
      [sunPos, a, b].forEach((v) => pos.push(v.x, v.y, v.z));
      fade.push(0.12, 1, 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('fade', new THREE.Float32BufferAttribute(fade, 1));
    scene.add(new THREE.Mesh(g, beamMat));
    beamGeo = g;
  }

  // heat particles: fly in from the sun, pass through the glass — or bounce off once tinted
  const HEAT = 80;
  const heat = { k: 0 };
  const hp = [];
  for (let i = 0; i < HEAT; i++) {
    const P = new THREE.Vector3(rnd(wL + 0.2, wR - 0.2), rnd(wB + 0.15, wT - 0.15), zf + 0.03);
    const Sx = sunPos.clone().add(new THREE.Vector3(rnd(-0.6, 0.6), rnd(-0.6, 0.6), rnd(-0.6, 0.6)));
    const din = P.clone().sub(Sx).normalize();
    const dout = new THREE.Vector3(din.x * 0.6 + rnd(-0.3, 0.3), -din.y * 0.4 + rnd(0, 0.5), Math.abs(din.z) + 0.6).normalize();
    hp.push({ P, S: Sx, off: Sx.clone().sub(sunPos), din, dout, ph: Math.random(), sp: rnd(0.28, 0.4) });
  }
  const heatPos = new Float32Array(HEAT * 3), heatCol = new Float32Array(HEAT * 3);
  const heatGeo = new THREE.BufferGeometry();
  heatGeo.setAttribute('position', new THREE.BufferAttribute(heatPos, 3));
  heatGeo.setAttribute('color', new THREE.BufferAttribute(heatCol, 3));
  const heatMat = new THREE.PointsMaterial({ map: radial([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], 64), size: 0.2, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  scene.add(new THREE.Points(heatGeo, heatMat));
  const cHot = new THREE.Color('#ffa340'), cCool = new THREE.Color('#7cc8ff'), tmpC = new THREE.Color(), tv = new THREE.Vector3(), tv2 = new THREE.Vector3();

  // shield shimmer on the glass once tinted
  const shieldMat = glow('#4db2ff', { transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, map: radial([[0, 'rgba(255,255,255,.9)'], [0.7, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]) });
  const shield = add(new THREE.PlaneGeometry(wW + 1.2, wH + 1.0), shieldMat, [wcx, wcy, zf + 0.08], { cast: false, receive: false });
  const shieldOn = { v: 0 };

  /* ---------- labels (sprites) ---------- */
  function label(top, main, accent = '#0878e8', scale = 0.62) {
    const w = 460, h = 132, k = 2;
    const c = document.createElement('canvas');
    c.width = w * k; c.height = h * k;
    const g = c.getContext('2d');
    g.scale(k, k);
    const ph = h - 32, py = 10, px = 12, pw = w - 24;
    g.shadowColor = 'rgba(2,12,30,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
    rr(g, px, py, pw, ph, ph / 2);
    g.fillStyle = 'rgba(255,255,255,.97)';
    g.fill();
    g.shadowColor = 'transparent';
    const dx = ar ? px + pw - ph / 2 : px + ph / 2;
    g.beginPath(); g.arc(dx, py + ph / 2, 26, 0, Math.PI * 2); g.fillStyle = accent; g.fill();
    g.beginPath(); g.arc(dx, py + ph / 2, 9, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    g.direction = ar ? 'rtl' : 'ltr';
    g.textAlign = ar ? 'right' : 'left';
    const tx = ar ? px + pw - ph - 4 : px + ph + 4;
    g.fillStyle = '#64748b'; g.font = `700 21px ${FONT}`;
    g.fillText(top, tx, py + ph / 2 - 6);
    g.fillStyle = '#071d38'; g.font = `800 32px ${FONT}`;
    g.fillText(main, tx, py + ph / 2 + 28);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: toTex(c), transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
    sp.scale.set((scale * w) / h, scale, 1);
    sp.renderOrder = 10;
    return sp;
  }
  const badge = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 128, 128);
    grd.addColorStop(0, '#2a8ff2'); grd.addColorStop(1, '#0559bd');
    g.beginPath(); g.arc(64, 64, 58, 0, Math.PI * 2); g.fillStyle = grd; g.fill();
    g.lineWidth = 6; g.strokeStyle = '#fff'; g.stroke();
    g.beginPath(); g.moveTo(38, 66); g.lineTo(56, 84); g.lineTo(92, 46);
    g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
    return toTex(c);
  })();
  const spark = radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(180,225,255,.9)'], [1, 'rgba(80,170,255,0)']], 128);

  /* ---------- step 1: phone, flash, scanner ---------- */
  const phoneRoot = new THREE.Group();
  const phone = new THREE.Group();
  phoneRoot.add(phone);
  world.add(phoneRoot);
  phoneRoot.position.set(-4.1, G + 2.0, 3.3);
  add(rbox(1.3, 2.62, 0.14, 0.17), mat.phone, [0, 0, 0], { parent: phone });
  add(rbox(0.46, 0.46, 0.05, 0.1), mat.frame, [-0.36, 0.96, -0.09], { parent: phone });
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 24), mat.lens, [-0.36, 0.96, -0.12], { parent: phone, rot: [Math.PI / 2, 0, 0] });
  const scr = document.createElement('canvas');
  scr.width = 520; scr.height = 1100;
  const screenTex = toTex(scr);
  add(new THREE.PlaneGeometry(1.2, 2.54), new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, toneMapped: false }), [0, 0, 0.072], { parent: phone, cast: false, receive: false });
  const flash = new THREE.PointLight('#e8f3ff', 0, 14, 1.5);
  flash.position.set(-0.36, 0.96, -0.6);
  phone.add(flash);
  const phoneShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(10,30,20,.4)'], [1, 'rgba(10,30,20,0)']]), transparent: true, depthWrite: false }));
  phoneShadow.rotation.x = -Math.PI / 2;
  phoneShadow.position.set(-4.1, G + 0.07, 3.3);
  world.add(phoneShadow);

  function villaThumb(g, x, y, w, h) {
    const sky = g.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, '#8fbbe8'); sky.addColorStop(1, '#ffd9a0');
    g.save(); rr(g, x, y, w, h, 18); g.clip();
    g.fillStyle = sky; g.fillRect(x, y, w, h);
    g.fillStyle = '#ffe6a8'; g.beginPath(); g.arc(x + w * 0.82, y + h * 0.22, 18, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e9eef5'; g.fillRect(x, y + h * 0.82, w, h * 0.18);
    g.fillStyle = '#ffffff'; g.fillRect(x + w * 0.1, y + h * 0.46, w * 0.78, h * 0.36); g.fillRect(x + w * 0.1, y + h * 0.18, w * 0.5, h * 0.28);
    g.fillStyle = '#ffb45c'; g.fillRect(x + w * 0.14, y + h * 0.52, w * 0.46, h * 0.22); g.fillRect(x + w * 0.14, y + h * 0.24, w * 0.4, h * 0.14);
    g.fillStyle = '#7a5434'; g.fillRect(x + w * 0.66, y + h * 0.5, w * 0.16, h * 0.3);
    g.restore();
  }
  function drawScreen(n) {
    const W = 520, H = 1100, g = scr.getContext('2d');
    g.clearRect(0, 0, W, H);
    g.save();
    rr(g, 0, 0, W, H, 62);
    g.clip();
    g.fillStyle = '#efe7dd'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(7,94,84,.05)';
    for (let yy = 220; yy < H; yy += 36) for (let xx = (yy / 36) % 2 ? 18 : 0; xx < W; xx += 36) { g.beginPath(); g.arc(xx, yy, 3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#075e54'; g.fillRect(0, 0, W, 196);
    g.fillStyle = '#fff'; g.font = `700 24px ${FONT}`; g.textAlign = 'left'; g.fillText('9:41', 44, 50);
    rr(g, W / 2 - 70, 18, 140, 38, 19); g.fillStyle = '#000'; g.fill();
    const ax = ar ? W - 78 : 78;
    g.beginPath(); g.arc(ax, 132, 38, 0, Math.PI * 2); g.fillStyle = '#0b2346'; g.fill();
    g.fillStyle = '#fff'; g.font = `800 28px ${FONT}`; g.textAlign = 'center'; g.fillText('ET', ax, 142);
    g.direction = ar ? 'rtl' : 'ltr';
    g.textAlign = ar ? 'right' : 'left';
    const nx = ar ? W - 134 : 134;
    g.font = `800 34px ${FONT}`; g.fillText(S.name, nx, 126);
    g.font = `500 24px ${FONT}`; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(n === 1 ? '…' : S.online, nx, 162);
    const bubble = (mine, y, w, h, color) => {
      const x = mine !== ar ? W - 30 - w : 30;
      g.shadowColor = 'rgba(0,0,0,.12)'; g.shadowBlur = 4; g.shadowOffsetY = 2;
      rr(g, x, y, w, h, 24); g.fillStyle = color; g.fill();
      g.shadowColor = 'transparent';
      return x;
    };
    const ticks = (x, y) => {
      g.strokeStyle = '#34b7f1'; g.lineWidth = 4; g.lineCap = 'round';
      [0, 14].forEach((o) => { g.beginPath(); g.moveTo(x + o, y); g.lineTo(x + o + 8, y + 8); g.lineTo(x + o + 22, y - 8); g.stroke(); });
    };
    let y = 236;
    if (n === 1) {
      const x = bubble(true, y, 130, 70, '#d9fdd3');
      [0, 1, 2].forEach((i) => { g.beginPath(); g.arc(x + 38 + i * 27, y + 35, 8, 0, Math.PI * 2); g.fillStyle = `rgba(74,122,74,${0.4 + i * 0.25})`; g.fill(); });
    }
    if (n >= 2) {
      const x = bubble(true, y, 360, 280, '#d9fdd3');
      villaThumb(g, x + 12, y + 12, 336, 220);
      ticks(x + 300, y + 258);
      y += 300;
    }
    if (n >= 3) {
      g.font = `700 30px ${FONT}`;
      const tw = g.measureText(S.villa).width;
      const x = bubble(true, y, tw + 120, 82, '#d9fdd3');
      g.fillStyle = '#071d38';
      g.fillText(S.villa, ar ? x + tw + 90 : x + 28, y + 52);
      ticks(ar ? x + 20 : x + tw + 50, y + 44);
      y += 102;
    }
    if (n >= 4) {
      g.font = `700 30px ${FONT}`;
      const tw = Math.min(g.measureText(S.reply).width, 380);
      const x = bubble(false, y, tw + 60, 82, '#ffffff');
      g.fillStyle = '#071d38';
      g.fillText(S.reply, ar ? x + tw + 30 : x + 30, y + 52, 380);
    }
    rr(g, 24, H - 112, W - 140, 76, 38); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.arc(W - 64, H - 74, 38, 0, Math.PI * 2); g.fillStyle = '#00a884'; g.fill();
    g.restore();
    screenTex.needsUpdate = true;
  }

  // corner brackets + scan line over the main window
  const scanMat = glow('#5cc8ff', { transparent: true, opacity: 0, depthWrite: false });
  const brackets = new THREE.Group();
  brackets.position.set(wcx, wcy, zf + 0.14);
  const bx = wW / 2 + 0.16, by = wH / 2 + 0.16;
  [[-1, 1], [1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => {
    add(new THREE.BoxGeometry(0.55, 0.05, 0.03), scanMat, [sx * (bx - 0.25), sy * by, 0], { parent: brackets, cast: false, receive: false });
    add(new THREE.BoxGeometry(0.05, 0.55, 0.03), scanMat, [sx * bx, sy * (by - 0.25), 0], { parent: brackets, cast: false, receive: false });
  });
  world.add(brackets);
  const scanner = new THREE.Group();
  const lineMat = glow('#9ad8ff', { transparent: true, opacity: 0, depthWrite: false });
  add(new THREE.BoxGeometry(wW + 0.5, 0.035, 0.03), lineMat, [0, 0, 0], { parent: scanner, cast: false, receive: false });
  const trailTex = (() => {
    const c = document.createElement('canvas');
    c.width = 4; c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(1, 'rgba(255,255,255,.7)');
    g.fillStyle = grd; g.fillRect(0, 0, 4, 128);
    return toTex(c);
  })();
  const trailMat = glow('#4db2ff', { map: trailTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  add(new THREE.PlaneGeometry(wW + 0.5, 0.8), trailMat, [0, 0.4, 0], { parent: scanner, cast: false, receive: false });
  scanner.position.set(wcx, wT, zf + 0.12);
  world.add(scanner);
  const dims = label(S.measured, S.dims, '#2a8ff2', 0.6);
  dims.position.set(wcx, G + 3.05, 0.9);
  dims.material.opacity = 0;
  const DIMS_S = { x: dims.scale.x, y: dims.scale.y };
  world.add(dims);

  /* ---------- step 2: film samples ---------- */
  const samples = new THREE.Group();
  samples.position.set(wcx, G + 1.55, 1.9);
  world.add(samples);
  const FILMS = [
    { name: S.f1, pct: '30%', color: '#c3cfdd', op: 0.5, accent: '#94a3b8', x: -1.75, z: 0.1, ry: 0.3 },
    { name: S.f2, pct: '80%', color: '#5f86b8', op: 0.66, accent: '#2a8ff2', x: 0, z: 0.3, ry: 0 },
    { name: S.f3, pct: '98%', color: '#123f86', op: 0.84, accent: '#0559bd', x: 1.75, z: 0.1, ry: -0.3 },
  ];
  const panels = FILMS.map((f) => {
    const grp = new THREE.Group();
    const m = new THREE.MeshPhysicalMaterial({ color: f.color, transparent: true, opacity: f.op, roughness: 0.08, metalness: 0.35, clearcoat: 1, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide });
    const mesh = add(rbox(1.4, 1.95, 0.05, 0.05), m, [0, 0, 0], { parent: grp, receive: false });
    const fm = M('#e6edf6', { metalness: 0.8, roughness: 0.25, transparent: true, envMapIntensity: 1.4 });
    add(new THREE.BoxGeometry(1.44, 0.05, 0.07), fm, [0, 0.995, 0], { parent: grp });
    const lab = label(f.name, f.pct, f.accent, 0.5);
    lab.position.set(0, 1.42, 0.1);
    grp.add(lab);
    samples.add(grp);
    return { grp, mesh, m, fm, lab, f, a: { v: 0 } };
  });
  const applyAlpha = (p) => { p.m.opacity = p.f.op * p.a.v; p.fm.opacity = p.a.v; p.lab.material.opacity = p.a.v; p.grp.visible = p.a.v > 0.01; };
  const best = panels[2];
  const ringMat = glow('#4db2ff', { transparent: true, opacity: 0.95, depthWrite: false });
  const ring = new THREE.Group();
  [[0, 1.02, 1.52, 0.04], [0, -1.02, 1.52, 0.04], [0.74, 0, 0.04, 2.08], [-0.74, 0, 0.04, 2.08]].forEach(([x, y, w, h]) => add(new THREE.BoxGeometry(w, h, 0.03), ringMat, [x, y, 0.04], { parent: ring, cast: false, receive: false }));
  best.grp.add(ring);
  const check = new THREE.Sprite(new THREE.SpriteMaterial({ map: badge, transparent: true, depthTest: false, toneMapped: false }));
  check.position.set(0.7, 0.98, 0.15);
  check.renderOrder = 11;
  best.grp.add(check);

  /* ---------- step 3: film roll, squeegee, sparkles ---------- */
  const rollGeo = new THREE.PlaneGeometry(wW, wH);
  rollGeo.translate(0, -wH / 2, 0);
  const rollMat = new THREE.MeshStandardMaterial({ color: '#0e3a7a', transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.5, envMapIntensity: 1.5, depthWrite: false });
  const roll = add(rollGeo, rollMat, [wcx, wT, zf + 0.04], { cast: false, receive: false });
  const squeegee = add(rbox(wW + 0.3, 0.09, 0.09, 0.04), glow('#bfe4ff'), [wcx, wT, zf + 0.1], { cast: false, receive: false });
  const sparks = [];
  for (let i = 0; i < 7; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: spark, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    sp.position.set(rnd(wL, wR), rnd(wB, wT + 0.3), zf + 0.3);
    sp.scale.setScalar(0.001);
    world.add(sp);
    sparks.push(sp);
  }

  /* ---------- states ---------- */
  const PANEL_HOME = (p) => ({ x: p.f.x, y: 0, z: p.f.z, ry: p.f.ry, s: 1 });
  const placePanel = (p, o) => { p.grp.position.set(o.x, o.y, o.z); p.grp.rotation.set(0, o.ry, 0); p.grp.scale.set(o.sx || o.s, o.sy || o.s, 1); };
  const PICKED = { x: 0, y: 0.1, z: 0.6, ry: 0, s: 1.12 };
  function prepare(a) {
    gsap.killTweensOf([phoneRoot.position, phoneRoot.rotation, phoneRoot.scale, flash, scanMat, lineMat, trailMat, scanner.position, brackets.scale, dims.material, dims.scale, roll.scale, squeegee.position, squeegee.material, rollMat, heat, shieldOn, beamMat.uniforms.uOpacity, ring.scale, check.scale]);
    panels.forEach((p) => gsap.killTweensOf([p.grp.position, p.grp.rotation, p.grp.scale, p.a, p.lab.material]));
    sparks.forEach((s) => gsap.killTweensOf(s.scale));
    [glassMain, glassUp].forEach((m) => { gsap.killTweensOf([m, m.color, m.emissive]); setGlass(m, HOT); });
    roll.scale.y = 0.001; rollMat.opacity = 0.6;
    squeegee.visible = false; squeegee.position.y = wT;
    heat.k = 0; shieldOn.v = 0; beamMat.uniforms.uOpacity.value = 0.16;
    flash.intensity = 0;
    scanMat.opacity = lineMat.opacity = trailMat.opacity = 0;
    dims.material.opacity = 0;
    sparks.forEach((s) => s.scale.setScalar(0.001));
    phoneRoot.position.y = G + 2.0; phoneRoot.rotation.set(-0.05, 0.42, 0); phoneRoot.scale.setScalar(1);
    if (a === 0) { phoneRoot.scale.setScalar(0.001); drawScreen(0); } else drawScreen(4);
    ring.scale.setScalar(0.001); check.scale.setScalar(0.001);
    panels.forEach((p) => { placePanel(p, PANEL_HOME(p)); p.a.v = 0; p.lab.material.opacity = 0; applyAlpha(p); });
    if (a === 2) {
      placePanel(best, PICKED);
      best.a.v = 1; applyAlpha(best);
      ring.scale.setScalar(1); check.scale.setScalar(0.32);
    }
  }

  /* ---------- acts ---------- */
  const acts = [
    () => {
      const tl = gsap.timeline();
      tl.fromTo(phoneRoot.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'back.out(1.6)' }, 0);
      tl.fromTo(phoneRoot.position, { y: G + 0.6 }, { y: G + 2.0, duration: 1, ease: 'power3.out' }, 0);
      tl.fromTo(phoneRoot.rotation, { y: -1.4 }, { y: 0.42, duration: 1.2, ease: 'power3.out' }, 0);
      tl.call(() => drawScreen(1), null, 0.9);
      tl.to(flash, { intensity: 80, duration: 0.07 }, 1.05).to(flash, { intensity: 0, duration: 0.5, ease: 'power2.out' }, 1.12);
      tl.to(scanMat, { opacity: 0.95, duration: 0.3 }, 1.1);
      tl.fromTo(brackets.scale, { x: 1.25, y: 1.25 }, { x: 1, y: 1, duration: 0.7, ease: 'back.out(2)' }, 1.1);
      tl.to([lineMat, trailMat], { opacity: 1, duration: 0.2 }, 1.2);
      tl.fromTo(scanner.position, { y: wT + 0.05 }, { y: wB - 0.05, duration: 1.3, ease: 'power1.inOut' }, 1.2);
      tl.to([lineMat, trailMat], { opacity: 0, duration: 0.3 }, 2.4);
      tl.call(() => drawScreen(2), null, 1.9);
      tl.call(() => drawScreen(3), null, 2.6);
      tl.call(() => drawScreen(4), null, 3.5);
      tl.to([scanMat, dims.material], { opacity: 0, duration: 0.5 }, 4.5);
      return tl;
    },
    () => {
      const tl = gsap.timeline();
      panels.forEach((p, i) => {
        const at = 0.1 + i * 0.18;
        tl.to(p.a, { v: 1, duration: 0.6, onUpdate: () => applyAlpha(p) }, at);
        tl.fromTo(p.grp.position, { y: -1.2 }, { y: 0, duration: 0.9, ease: 'back.out(1.4)' }, at);
        tl.fromTo(p.grp.rotation, { y: p.f.ry + (i - 1) * 0.6 }, { y: p.f.ry, duration: 1, ease: 'power3.out' }, at);
        if (i < 2) tl.to(p.grp.position, { y: 0.28, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 1 }, 1.25 + i * 0.5);
      });
      tl.to(best.grp.position, { y: 0.28, duration: 0.3, ease: 'power2.out' }, 2.25);
      [panels[0], panels[1]].forEach((p) => {
        tl.to(p.grp.position, { y: -1.4, duration: 0.7, ease: 'power2.in' }, 2.55);
        tl.to(p.a, { v: 0, duration: 0.6, onUpdate: () => applyAlpha(p) }, 2.6);
      });
      tl.to(best.grp.position, { x: PICKED.x, y: PICKED.y, z: PICKED.z, duration: 1, ease: 'power3.inOut' }, 2.6);
      tl.to(best.grp.rotation, { y: PICKED.ry + Math.PI * 2, duration: 1.1, ease: 'power3.inOut' }, 2.6);
      tl.to(best.grp.scale, { x: PICKED.s, y: PICKED.s, duration: 1, ease: 'power3.inOut' }, 2.6);
      tl.set(best.grp.rotation, { y: PICKED.ry }, 3.75);
      tl.to(ring.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(2)' }, 3.4);
      tl.to(check.scale, { x: 0.32, y: 0.32, duration: 0.5, ease: 'back.out(3)' }, 3.6);
      return tl;
    },
    () => {
      const tl = gsap.timeline();
      tl.to([check.scale, ring.scale], { x: 0.001, y: 0.001, z: 0.001, duration: 0.3, ease: 'power2.in' }, 0);
      tl.to(best.lab.material, { opacity: 0, duration: 0.3 }, 0);
      // fly onto the window
      const local = { x: 0, y: wcy - samples.position.y, z: zf + 0.07 - samples.position.z };
      tl.to(best.grp.position, { ...local, duration: 1.1, ease: 'power3.inOut' }, 0.25);
      tl.to(best.grp.scale, { x: wW / 1.4, y: wH / 1.95, duration: 1.1, ease: 'power3.inOut' }, 0.25);
      // roll down + squeegee
      tl.set(squeegee, { visible: true }, 1.3);
      tl.fromTo(roll.scale, { y: 0.001 }, { y: 1, duration: 1.4, ease: 'power2.inOut' }, 1.3);
      tl.fromTo(squeegee.position, { y: wT }, { y: wB, duration: 1.4, ease: 'power2.inOut' }, 1.3);
      tl.to(best.a, { v: 0, duration: 0.6, onUpdate: () => applyAlpha(best) }, 1.4);
      tl.set(squeegee, { visible: false }, 2.75);
      // the glass cools, heat bounces off
      tweenGlass(tl, glassMain, COOL, 2.5, 1.1);
      tweenGlass(tl, glassUp, COOL, 3.0, 1.1);
      tl.to(rollMat, { opacity: 0.2, duration: 1 }, 2.6);
      tl.to(heat, { k: 1, duration: 1.2, ease: 'power2.out' }, 2.5);
      tl.to(shieldOn, { v: 1, duration: 0.8 }, 2.6);
      tl.to(beamMat.uniforms.uOpacity, { value: 0.09, duration: 1.2 }, 2.6);
      sparks.forEach((s, i) => tl.fromTo(s.scale, { x: 0.001, y: 0.001 }, { x: 0.55, y: 0.55, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 }, 2.8 + i * 0.12));
      return tl;
    },
  ];

  /* ---------- camera ---------- */
  const camTo = (a, d = 1.6) => gsap.to(cam, { ...CAMS[a], duration: d, ease: 'power2.inOut', overwrite: true });
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 40 : 30;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);

  /* ---------- stage sync with the step list ---------- */
  let act = -1, tl = null;
  function playAct(a, instant) {
    if (tl) tl.kill();
    const fromEnd = a === 0 && act === 2;
    act = a;
    const run = () => {
      prepare(a);
      tl = acts[a]();
      if (instant) tl.progress(1);
    };
    if (fromEnd && !instant) {
      gsap.to(canvas, {
        opacity: 0, duration: 0.35, overwrite: true,
        onComplete: () => { Object.assign(cam, CAMS[0]); run(); gsap.to(canvas, { opacity: 1, duration: 0.7 }); },
      });
    } else {
      camTo(a, instant ? 0 : 1.6);
      run();
    }
  }
  function onStage(d) {
    if (!d) return;
    if (d.stage === 5) { if (act !== 2) playAct(2, true); return; }
    if (d.flowing) { camTo(Math.min(2, d.active + 1)); return; }
    if (d.active !== act) playAct(d.active, reduce);
  }
  prepare(0);
  phoneRoot.scale.setScalar(1);
  drawScreen(4);
  box.addEventListener('hx:stage', (e) => onStage(e.detail));

  /* ---------- pointer parallax ---------- */
  const look = { x: 0, y: 0 };
  if (window.matchMedia('(pointer: fine)').matches) {
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      gsap.to(look, { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5, duration: 0.8, ease: 'power3' });
    });
    host.addEventListener('pointerleave', () => gsap.to(look, { x: 0, y: 0, duration: 1, ease: 'power3' }));
  }

  /* ---------- render loop (only while visible) ---------- */
  let running = false, started = false, raf = 0;
  const clock = new THREE.Clock();
  const sunNdc = new THREE.Vector3(), sunNow = new THREE.Vector3(), sunDir = new THREE.Vector3();
  function frame() {
    if (!running) return;
    const t = clock.getElapsedTime();
    camera.position.set(cam.x + look.x * 1.4, cam.y - look.y * 0.9 + Math.sin(t * 0.5) * 0.08, cam.z);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    camera.updateMatrixWorld();
    // sunlight comes from where the sun sits on the page: just past the card's top-right corner
    sunNdc.set(ar ? -1.02 : 1.02, 1.02, 0.5).unproject(camera).sub(camera.position).normalize();
    sunNow.copy(camera.position).addScaledVector(sunNdc, 11);
    sun.position.copy(sun.target.position).addScaledVector(sunDir.copy(sunNow).sub(sun.target.position).normalize(), 17);
    if (beamGeo) {
      const bp = beamGeo.attributes.position;
      for (let k = 0; k < 4; k++) bp.setXYZ(k * 3, sunNow.x, sunNow.y, sunNow.z);
      bp.needsUpdate = true;
    }
    for (let i = 0; i < HEAT; i++) {
      const p = hp[i];
      p.S.copy(sunNow).add(p.off);
      p.din.copy(p.P).sub(p.S).normalize();
      p.dout.set(p.din.x * 0.6, -p.din.y * 0.4 + 0.25, Math.abs(p.din.z) + 0.6).normalize();
    }
    phone.position.y = Math.sin(t * 1.3) * 0.08;
    phone.rotation.z = Math.sin(t * 0.9) * 0.025;
    samples.position.y = G + 1.55 + Math.sin(t * 1.1) * 0.05;
    sunSprite.material.rotation = t * 0.05;
    mat.water.emissiveIntensity = 0.32 + Math.sin(t * 1.6) * 0.06;
    shieldMat.opacity = shieldOn.v * (0.16 + Math.sin(t * 2.2) * 0.06);
    for (let i = 0; i < HEAT; i++) {
      const p = hp[i];
      const u = (p.ph + t * p.sp) % 1;
      let br;
      if (u < 0.75) {
        tv.lerpVectors(p.S, p.P, u / 0.75);
        br = Math.min(1, u * 6);
        tmpC.copy(cHot);
      } else {
        const b = (u - 0.75) / 0.25;
        tv.copy(p.P).addScaledVector(p.din, b * 1.4);
        tv2.copy(p.P).addScaledVector(p.dout, b * 2.6);
        tv.lerp(tv2, heat.k);
        br = 1 - b;
        tmpC.copy(cHot).lerp(cCool, heat.k * 0.7);
      }
      heatPos[i * 3] = tv.x; heatPos[i * 3 + 1] = tv.y; heatPos[i * 3 + 2] = tv.z;
      heatCol[i * 3] = tmpC.r * br; heatCol[i * 3 + 1] = tmpC.g * br; heatCol[i * 3 + 2] = tmpC.b * br;
    }
    heatGeo.attributes.position.needsUpdate = true;
    heatGeo.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting;
    if (running) {
      if (!started) {
        started = true;
        host.classList.add('is-3d');
        gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1 });
        onStage(box.__hx);
      }
      cancelAnimationFrame(raf);
      frame();
    }
  }, { threshold: 0.05 }).observe(host);
}
