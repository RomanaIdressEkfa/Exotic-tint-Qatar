/* ======================================================================
   Hero 3D room (Three.js + GSAP)
   An isometric villa corner assembles itself, the sun burns through the
   window, then Exotic Tint film rolls down and the room cools.
   ====================================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const host = document.querySelector('[data-room]');
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

if (host && canvas && gsap && supportsWebGL()) init();
else if (host) host.classList.add('room-fallback');

function init() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ar = document.documentElement.lang === 'ar';
  const fmt = (n) => (ar ? Math.round(n).toLocaleString('ar-EG') : String(Math.round(n)));

  /* ---------- renderer / scene / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  // same camera in both languages (mirroring a 3D room would show it from behind a wall)
  const camBase = new THREE.Vector3(15.5, 12.5, 15.5);
  const target = new THREE.Vector3(0, 1.3, 0);
  camera.position.copy(camBase);
  camera.lookAt(target);

  /* ---------- materials ---------- */
  const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...extra });
  const mat = {
    floor: M('#ffffff', { roughness: 0.92, emissive: '#fff6e8', emissiveIntensity: 0.28 }),
    wall: M('#e3b25e', { roughness: 0.9 }),
    wallEdge: M('#c9963f'),
    frame: M('#1d2b42', { roughness: 0.4, metalness: 0.3 }),
    cream: M('#f3ede2'),
    white: M('#ffffff', { roughness: 0.5 }),
    orange: M('#d9893a', { roughness: 0.6 }),
    wood: M('#b07a43', { roughness: 0.7 }),
    dark: M('#1b1f27', { roughness: 0.35, metalness: 0.2 }),
    screen: M('#2a3240', { roughness: 0.15, metalness: 0.4, emissive: '#0f1a2c', emissiveIntensity: 0.6 }),
    green: M('#4f8f5f', { roughness: 0.8 }),
    rug: M('#ead9bd', { roughness: 1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0, clearcoat: 1, depthWrite: false }),
    film: new THREE.MeshStandardMaterial({ color: '#0f1d33', transparent: true, opacity: 0.72, roughness: 0.2, metalness: 0.4, depthWrite: false, side: THREE.DoubleSide }),
  };

  const groups = []; // pieces that assemble on intro
  const room = new THREE.Group();
  scene.add(room);
  const add = (geo, material, pos, opts = {}) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    if (opts.rot) m.rotation.set(...opts.rot);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = opts.receive !== false;
    (opts.parent || room).add(m);
    return m;
  };
  const box = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, r);

  /* ---------- floor ---------- */
  const floor = add(box(10, 0.3, 10, 0.08), mat.floor, [0, -0.15, 0], { cast: false });
  groups.push({ obj: floor, type: 'floor' });

  /* ---------- walls (left solid with TV, back with big window) ---------- */
  const H = 4.4, T = 0.3;
  const leftWall = new THREE.Group();
  add(box(T, H, 10, 0.04), mat.wall, [-5 + T / 2, H / 2, 0], { parent: leftWall });
  add(new THREE.BoxGeometry(0.06, 1.25, 2.3), mat.dark, [-4.8, 2.3, 0.6], { parent: leftWall }); // TV
  add(new THREE.BoxGeometry(0.02, 1.13, 2.18), mat.screen, [-4.76, 2.3, 0.6], { parent: leftWall });
  room.add(leftWall);
  groups.push({ obj: leftWall, type: 'wall' });

  const backWall = new THREE.Group();
  const z = -5 + T / 2;
  const winL = -3.2, winR = 3.4, winB = 0.9, winT = 3.6;
  add(box(10, winB, T, 0.04), mat.wall, [0, winB / 2, z], { parent: backWall });
  add(box(10, H - winT, T, 0.04), mat.wall, [0, winT + (H - winT) / 2, z], { parent: backWall });
  add(box(winL + 5, winT - winB, T, 0.02), mat.wall, [(-5 + winL) / 2, (winB + winT) / 2, z], { parent: backWall });
  add(box(5 - winR, winT - winB, T, 0.02), mat.wall, [(winR + 5) / 2, (winB + winT) / 2, z], { parent: backWall });
  room.add(backWall);
  groups.push({ obj: backWall, type: 'wall' });

  /* ---------- window: frame, glass, film ---------- */
  const win = new THREE.Group();
  const wW = winR - winL, wH = winT - winB, cx = (winL + winR) / 2, cy = (winB + winT) / 2;
  const bar = (w, h, x, y) => add(new THREE.BoxGeometry(w, h, 0.18), mat.frame, [x, y, z], { parent: win });
  bar(wW + 0.12, 0.12, cx, winB);
  bar(wW + 0.12, 0.12, cx, winT);
  bar(0.12, wH, winL, cy);
  bar(0.12, wH, winR, cy);
  bar(0.08, wH, winL + wW / 3, cy);
  bar(0.08, wH, winL + (2 * wW) / 3, cy);
  add(new THREE.PlaneGeometry(wW, wH), mat.glass, [cx, cy, z + 0.02], { parent: win, cast: false, receive: false });
  // film: three panes that roll down from the top (scale.y animated, anchored at top)
  const films = [];
  for (let i = 0; i < 3; i++) {
    const pw = wW / 3 - 0.1;
    const geo = new THREE.PlaneGeometry(pw, wH - 0.1);
    geo.translate(0, -(wH - 0.1) / 2, 0); // pivot at top edge
    const f = add(geo, mat.film, [winL + wW / 6 + (i * wW) / 3, winT - 0.05, z + 0.06], { parent: win, cast: false, receive: false });
    f.scale.y = 0.001;
    films.push(f);
  }
  room.add(win);
  groups.push({ obj: win, type: 'drop' });

  /* ---------- furniture ---------- */
  const sofa = new THREE.Group();
  add(box(3.6, 0.5, 1.4, 0.12), mat.cream, [0, 0.45, 0], { parent: sofa });
  add(box(3.6, 0.9, 0.35, 0.12), mat.cream, [0, 0.85, -0.55], { parent: sofa });
  add(box(0.35, 0.7, 1.4, 0.12), mat.cream, [-1.8, 0.65, 0], { parent: sofa });
  add(box(0.35, 0.7, 1.4, 0.12), mat.cream, [1.8, 0.65, 0], { parent: sofa });
  add(box(1.05, 0.22, 1.0, 0.1), mat.orange, [-1.05, 0.8, 0.1], { parent: sofa });
  add(box(1.05, 0.22, 1.0, 0.1), mat.orange, [0, 0.8, 0.1], { parent: sofa });
  add(box(1.05, 0.22, 1.0, 0.1), mat.orange, [1.05, 0.8, 0.1], { parent: sofa });
  add(box(0.6, 0.55, 0.18, 0.08), mat.orange, [-1.2, 1.15, -0.3], { parent: sofa, rot: [-0.25, 0.2, 0] });
  sofa.position.set(1.4, 0, 1.6);
  sofa.rotation.y = Math.PI;
  room.add(sofa);
  groups.push({ obj: sofa, type: 'drop' });


  const table = new THREE.Group();
  add(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 40), mat.white, [0, 0.55, 0], { parent: table });
  add(new THREE.CylinderGeometry(0.12, 0.25, 0.5, 20), mat.white, [0, 0.27, 0], { parent: table });
  add(new THREE.BoxGeometry(0.4, 0.04, 0.28), mat.dark, [0.15, 0.62, 0.1], { parent: table, rot: [0, 0.4, 0] });
  table.position.set(1.2, 0, -0.4);
  room.add(table);
  groups.push({ obj: table, type: 'drop' });

  const chair = new THREE.Group();
  add(box(1.0, 0.4, 1.0, 0.15), mat.orange, [0, 0.55, 0], { parent: chair });
  add(box(1.0, 0.8, 0.25, 0.12), mat.orange, [0, 0.95, -0.4], { parent: chair });
  [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(([x, zz]) => add(new THREE.CylinderGeometry(0.04, 0.03, 0.4, 8), mat.wood, [x, 0.2, zz], { parent: chair }));
  chair.position.set(-2.4, 0, -1.9);
  chair.rotation.y = 0.6;
  room.add(chair);
  groups.push({ obj: chair, type: 'drop' });

  const plant = new THREE.Group();
  add(new THREE.CylinderGeometry(0.32, 0.24, 0.6, 24), mat.white, [0, 0.3, 0], { parent: plant });
  [[0, 1.05, 0, 0.5], [0.25, 1.45, 0.1, 0.38], [-0.2, 1.35, -0.1, 0.36], [0.05, 1.75, -0.05, 0.28]].forEach(([x, y, zz, r]) =>
    add(new THREE.IcosahedronGeometry(r, 1), mat.green, [x, y, zz], { parent: plant })
  );
  plant.position.set(4.1, 0, -4.1);
  room.add(plant);
  groups.push({ obj: plant, type: 'pop' });

  const lamp = new THREE.Group();
  add(new THREE.CylinderGeometry(0.25, 0.3, 0.05, 24), mat.dark, [0, 0.03, 0], { parent: lamp });
  add(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8), mat.dark, [0, 1.15, 0], { parent: lamp });
  add(new THREE.ConeGeometry(0.38, 0.45, 24, 1, true), mat.white, [0, 2.4, 0], { parent: lamp });
  lamp.position.set(-3.9, 0, -3.8);
  // (lamp removed for a cleaner composition)

  /* ---------- light: warm sun pouring through the window ---------- */
  const radial = (stops, size = 256) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => grd.addColorStop(o, col));
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  scene.add(new THREE.HemisphereLight('#ffffff', '#efe2c8', 1.45));

  // soft key light from the front: casts the room's shadow *behind* it onto the ground
  const fill = new THREE.DirectionalLight('#ffffff', 1.0);
  fill.position.set(9, 14, 13);
  fill.castShadow = false;
  fill.shadow.mapSize.set(1024, 1024);
  fill.shadow.camera.left = -12; fill.shadow.camera.right = 12; fill.shadow.camera.top = 12; fill.shadow.camera.bottom = -12;
  fill.shadow.camera.near = 1; fill.shadow.camera.far = 50;
  fill.shadow.bias = -0.001;
  fill.shadow.radius = 10;
  fill.shadow.blurSamples = 16;
  scene.add(fill);

  const SUN_ON = 4.2, SUN_OFF = 1.1;
  const sun = new THREE.DirectionalLight('#ffc46b', SUN_ON);
  sun.position.set(-1.5, 7.5, -14);
  sun.target.position.set(0.6, 0, 1.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -13; sun.shadow.camera.right = 13; sun.shadow.camera.top = 13; sun.shadow.camera.bottom = -13;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.0008;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  // soft shadow behind the room (fades out, never hits the canvas edge) + tight contact shadow underneath
  const shadowTex = radial([[0, 'rgba(46,32,10,.5)'], [0.45, 'rgba(46,32,10,.22)'], [1, 'rgba(46,32,10,0)']]);
  const backShadow = new THREE.Mesh(new THREE.PlaneGeometry(15, 12), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  backShadow.rotation.x = -Math.PI / 2;
  backShadow.rotation.z = 0.5;
  backShadow.position.set(-2.4, -0.32, -2.6);
  scene.add(backShadow);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 12.5), new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(46,32,10,.38)'], [0.7, 'rgba(46,32,10,.12)'], [1, 'rgba(46,32,10,0)']]), transparent: true, depthWrite: false }));
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, -0.31, 0);
  scene.add(contact);
  groups.push({ obj: backShadow, type: 'pop' }, { obj: contact, type: 'pop' });

  // warm sky + sun disc, seen through the window only
  const skyTex = (() => {
    const c = document.createElement('canvas');
    c.width = 8; c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#8fbbe8');
    grd.addColorStop(0.55, '#ffd9a0');
    grd.addColorStop(1, '#ffb45c');
    g.fillStyle = grd;
    g.fillRect(0, 0, 8, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 3.7), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false }));
  sky.position.set(-0.6, 1.85, -6.5);
  scene.add(sky);
  const glowTex = radial([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,240,200,1)'], [0.42, 'rgba(255,200,110,.55)'], [1, 'rgba(255,160,60,0)']]);
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  sunSprite.position.set(0.2, 2.4, -6.3);
  sunSprite.scale.set(2.6, 2.6, 1);
  scene.add(sunSprite);

  // god rays: one shaft per pane, projected along the real sun direction, fading toward the floor
  const sunDir = new THREE.Vector3().subVectors(sun.target.position, sun.position).normalize();
  const toFloor = (p) => p.clone().addScaledVector(sunDir, (p.y - 0.04) / -sunDir.y);
  const rayMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color('#ffcf85') }, uOpacity: { value: 0.22 }, uTime: { value: 0 } },
    vertexShader: 'attribute float fade; varying float vFade; varying vec3 vPos; void main(){ vFade = fade; vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity; uniform float uTime; varying float vFade; varying vec3 vPos; void main(){ float shimmer = 0.85 + 0.15 * sin(vPos.x * 3.0 + vPos.y * 2.0 + uTime * 0.8); gl_FragColor = vec4(uColor, uOpacity * pow(vFade, 1.6) * shimmer); }',
  });
  const rays = new THREE.Group();
  const paneW = wW / 3;
  for (let i = 0; i < 3; i++) {
    const x0 = winL + i * paneW + 0.08, x1 = winL + (i + 1) * paneW - 0.08;
    const top = [new THREE.Vector3(x0, winT - 0.06, z), new THREE.Vector3(x1, winT - 0.06, z), new THREE.Vector3(x1, winB + 0.06, z), new THREE.Vector3(x0, winB + 0.06, z)];
    const bot = top.map(toFloor);
    const pos = [], fade = [];
    for (let k = 0; k < 4; k++) {
      const a = top[k], b = top[(k + 1) % 4], c = bot[(k + 1) % 4], d = bot[k];
      [a, b, c, a, c, d].forEach((v) => pos.push(v.x, v.y, v.z));
      fade.push(1, 1, 0, 1, 0, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('fade', new THREE.Float32BufferAttribute(fade, 1));
    rays.add(new THREE.Mesh(g, rayMat));
  }
  scene.add(rays);
  const beamMat = rayMat.uniforms.uOpacity; // animated on tint on/off

  // dust floating in the sunbeams
  const DUST = 90;
  const dustBase = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    const p = new THREE.Vector3(THREE.MathUtils.lerp(winL, winR, Math.random()), THREE.MathUtils.lerp(winB, winT, Math.random()), z);
    const v = p.clone().lerp(toFloor(p), Math.random() * 0.92);
    dustBase.set([v.x, v.y, v.z], i * 3);
  }
  const dustPos = new Float32Array(dustBase);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ map: radial([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], 64), color: '#ffe2a8', size: 0.06, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(dustGeo, dustMat));

  // soft brand-gold glow pooled under the furniture
  const glowMat = new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(240,160,50,.9)'], [0.35, 'rgba(240,160,50,.5)'], [0.7, 'rgba(240,160,50,.14)'], [1, 'rgba(240,160,50,0)']]), transparent: true, depthWrite: false, toneMapped: false });
  const furnitureGlow = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 7.5), glowMat);
  furnitureGlow.rotation.x = -Math.PI / 2;
  furnitureGlow.rotation.z = -0.3;
  furnitureGlow.position.set(0.9, 0.012, 0.6);
  furnitureGlow.receiveShadow = false;
  scene.add(furnitureGlow);
  groups.push({ obj: furnitureGlow, type: 'pop' });

  // warm hot-spot glow on the floor (turns cool when tinted)
  const spotMat = new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(255,255,255,.9)'], [1, 'rgba(255,255,255,0)']]), color: '#ff9a3c', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
  const spotC = toFloor(new THREE.Vector3((winL + winR) / 2, (winB + winT) / 2, z));
  const spot = new THREE.Mesh(new THREE.PlaneGeometry(9, 6), spotMat);
  spot.rotation.x = -Math.PI / 2;
  spot.position.set(spotC.x, 0.05, spotC.z);
  scene.add(spot);

  /* ---------- sizing ---------- */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole room in frame on narrow screens
    camera.fov = w / h < 0.95 ? 36 : 32;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);

  /* ---------- HUD ---------- */
  const q = (s) => host.querySelector(s);
  const hud = { temp: q('[data-r-temp]'), uv: q('[data-r-uv]'), ring: q('[data-r-ring]'), bar: q('[data-r-bar]'), state: q('[data-r-state]'), btns: host.querySelectorAll('[data-r-mode]') };
  const reading = { t: 46, uv: 0 };
  const paintHud = () => {
    hud.temp.textContent = fmt(reading.t);
    hud.uv.textContent = fmt(reading.uv);
    hud.ring.style.strokeDashoffset = 125.66 * (1 - reading.uv / 100);
    hud.bar.style.width = ((reading.t - 30) / 18) * 100 + '%';
  };
  paintHud();

  /* ---------- tint on / off ---------- */
  let tinted = false;
  function setTint(on, instant) {
    tinted = on;
    hud.btns.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.rMode === 'on') === on)));
    host.classList.toggle('is-tinted', on);
    hud.state.textContent = on ? hud.state.dataset.on : hud.state.dataset.off;
    const d = instant ? 0 : 1;
    films.forEach((f, i) => gsap.to(f.scale, { y: on ? 1 : 0.001, duration: 1.4 * d, delay: on ? i * 0.15 * d : 0, ease: on ? 'power3.inOut' : 'power2.in' }));
    gsap.to(sun, { intensity: on ? SUN_OFF : SUN_ON, duration: 1.6 * d, delay: 0.3 * d });
    gsap.to(sun.color, { r: on ? 0.82 : 1, g: on ? 0.88 : 0.81, b: on ? 1 : 0.51, duration: 1.6 * d, delay: 0.3 * d });
    gsap.to(dustMat, { opacity: on ? 0.08 : 0.6, duration: 1.6 * d, delay: 0.3 * d });
    gsap.to(beamMat, { value: on ? 0.03 : 0.22, duration: 1.6 * d, delay: 0.3 * d });
    gsap.to(spotMat, { opacity: on ? 0.28 : 0.55, duration: 1.6 * d, delay: 0.3 * d });
    gsap.to(spotMat.color, { r: on ? 0.55 : 1, g: on ? 0.75 : 0.6, b: on ? 1 : 0.24, duration: 1.6 * d, delay: 0.3 * d });
    gsap.to(sunSprite.material, { opacity: on ? 0.45 : 1, duration: 1.6 * d });
    gsap.to(reading, { t: on ? 36 : 46, uv: on ? 99 : 0, duration: 2 * d, delay: 0.4 * d, ease: 'power2.out', onUpdate: paintHud });
  }

  /* ---------- intro: the room assembles ---------- */
  const intro = gsap.timeline({ delay: 0.4, paused: true });
  groups.forEach((g, i) => {
    const o = g.obj;
    if (g.type === 'floor') intro.from(o.scale, { x: 0.001, z: 0.001, duration: 1, ease: 'expo.out' }, 0);
    else if (g.type === 'wall') intro.from(o.position, { y: -5, duration: 1.1, ease: 'expo.out' }, 0.25 + i * 0.08);
    else if (g.type === 'pop') intro.from(o.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.8, ease: 'back.out(2)' }, 0.8 + i * 0.07);
    else intro.from(o.position, { y: 7, duration: 1.1, ease: 'bounce.out' }, 0.7 + i * 0.09);
  });
  intro.from(room.rotation, { y: -0.35, duration: 2.4, ease: 'expo.out' }, 0);
  intro.call(() => setTint(true), null, '+=0.6');

  /* ---------- auto demo loop + user control ---------- */
  let auto = !reduce;
  let loop = null;
  const startLoop = () => {
    clearInterval(loop);
    if (auto) loop = setInterval(() => setTint(!tinted), 5200);
  };
  hud.btns.forEach((b) =>
    b.addEventListener('click', () => {
      auto = false;
      clearInterval(loop);
      setTint(b.dataset.rMode === 'on');
    })
  );

  /* ---------- pointer parallax ---------- */
  const look = { x: 0, y: 0 };
  if (window.matchMedia('(pointer: fine)').matches) {
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      gsap.to(look, { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5, duration: 0.8, ease: 'power3' });
    });
    host.addEventListener('pointerleave', () => gsap.to(look, { x: 0, y: 0, duration: 1, ease: 'power3' }));
  }

  /* ---------- render only while visible ---------- */
  let running = false, started = false, raf = 0;
  const clock = new THREE.Clock();
  function frame() {
    if (!running) return;
    const tt = clock.getElapsedTime();
    camera.position.set(camBase.x + look.x * 2.2, camBase.y - look.y * 1.4 + Math.sin(tt * 0.5) * 0.12, camBase.z - look.x * 1.2);
    camera.lookAt(target);
    sunSprite.material.rotation = tt * 0.05;
    rayMat.uniforms.uTime.value = tt;
    for (let i = 0; i < DUST; i++) {
      const k = i * 3;
      dustPos[k] = dustBase[k] + Math.sin(tt * 0.35 + i) * 0.12;
      dustPos[k + 1] = dustBase[k + 1] + Math.sin(tt * 0.25 + i * 1.7) * 0.18;
      dustPos[k + 2] = dustBase[k + 2] + Math.cos(tt * 0.3 + i * 0.9) * 0.12;
    }
    dustGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting;
    if (running) {
      if (!started) {
        started = true;
        host.classList.add('is-ready');
        if (reduce) { setTint(true, true); } else { intro.play(); setTimeout(startLoop, 6500); }
      }
      cancelAnimationFrame(raf);
      frame();
    }
  }, { threshold: 0.05 }).observe(host);
}
