/* ======================================================================
   Automotive page hero: a stylised 3D car (Three.js + GSAP).
   The car rolls in, the sun heats the cabin, then window film is applied
   pane by pane and the cabin cools. Visitors can toggle the film.
   ====================================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const host = document.querySelector('[data-car]');
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
else if (host) host.classList.add('car-fallback');

function init() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ar = document.documentElement.lang === 'ar';
  const fmt = (n) => (ar ? Math.round(n).toLocaleString('ar-EG') : String(Math.round(n)));

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const camBase = new THREE.Vector3(7.6, 3.9, 8.4);
  const target = new THREE.Vector3(-0.1, 0.95, 0);

  const radial = (stops, size = 256) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => grd.addColorStop(o, col));
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  /* ---------- materials ---------- */
  const paint = new THREE.MeshPhysicalMaterial({ color: '#f4f2ee', roughness: 0.32, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12 });
  const trim = new THREE.MeshStandardMaterial({ color: '#141922', roughness: 0.5, metalness: 0.3 });
  const tyre = new THREE.MeshStandardMaterial({ color: '#16181d', roughness: 0.9 });
  const rim = new THREE.MeshStandardMaterial({ color: '#c9ced6', roughness: 0.25, metalness: 0.9 });
  const seat = new THREE.MeshStandardMaterial({ color: '#c47f1e', roughness: 0.7 });
  const cabinFloor = new THREE.MeshStandardMaterial({ color: '#2b2f38', roughness: 0.9 });
  const lightMat = new THREE.MeshStandardMaterial({ color: '#fff4dc', emissive: '#ffe2a8', emissiveIntensity: 0.6 });
  const tailMat = new THREE.MeshStandardMaterial({ color: '#b3122e', emissive: '#b3122e', emissiveIntensity: 0.5 });
  // glass: starts clear, film turns it dark
  const glass = new THREE.MeshPhysicalMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.36, roughness: 0.05, metalness: 0.1, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });

  const car = new THREE.Group();
  car.scale.setScalar(1.12);
  scene.add(car);
  const add = (geo, mat, pos, parent = car, rot) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  /* ---------- body: low, sleek saloon ---------- */
  // greenhouse key points (x, y) — shared by glass, pillars and roof
  const GF = [1.3, 1.08], RF = [0.62, 1.86], RB = [-1.22, 1.86], GB = [-1.78, 1.08];
  const ZS = 0.84; // half-width of the glasshouse
  add(new RoundedBoxGeometry(4.7, 0.68, 1.98, 8, 0.3), paint, [0, 0.74, 0]); // main body
  add(new RoundedBoxGeometry(4.74, 0.12, 2.0, 3, 0.05), trim, [0, 0.44, 0]); // dark sill line
  add(new RoundedBoxGeometry(1.84, 0.1, 1.72, 4, 0.05), paint, [(RF[0] + RB[0]) / 2, RF[1] + 0.03, 0]); // roof

  // thin bar between two (x,y) points at depth z — used for pillars
  const bar = (a, b2, z, thick = 0.085) => {
    const dx = b2[0] - a[0], dy = b2[1] - a[1];
    const len = Math.hypot(dx, dy);
    const m = add(new THREE.BoxGeometry(len, thick, thick), paint, [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2, z]);
    m.rotation.z = Math.atan2(dy, dx);
    return m;
  };
  [ZS, -ZS].forEach((z) => {
    bar(GF, RF, z); // A pillar
    bar(GB, RB, z); // C pillar
    bar([-0.22, GF[1]], [-0.22, RF[1]], z, 0.1); // B pillar
    bar(RF, RB, z, 0.07); // roof rail
  });

  /* ---------- glass (exact quads, so nothing sticks out) ---------- */
  const panes = [];
  const quad = (pts) => {
    const g = new THREE.BufferGeometry();
    const [a, b2, c, d] = pts;
    g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b2, ...c, ...a, ...c, ...d], 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, glass.clone());
    car.add(m);
    panes.push(m);
  };
  // windscreen and rear screen
  quad([[GF[0], GF[1], ZS], [GF[0], GF[1], -ZS], [RF[0], RF[1], -ZS], [RF[0], RF[1], ZS]]);
  quad([[GB[0], GB[1], ZS], [RB[0], RB[1], ZS], [RB[0], RB[1], -ZS], [GB[0], GB[1], -ZS]]);
  // side windows (front + rear door) on both sides
  [ZS + 0.005, -ZS - 0.005].forEach((z) => {
    quad([[-0.16, GF[1], z], [GF[0] - 0.08, GF[1], z], [RF[0] - 0.03, RF[1] - 0.04, z], [-0.16, RF[1] - 0.04, z]]);
    quad([[GB[0] + 0.08, GB[1], z], [-0.28, GB[1], z], [-0.28, RB[1] - 0.04, z], [RB[0] + 0.03, RB[1] - 0.04, z]]);
  });

  /* ---------- interior (visible through clear glass) ---------- */
  add(new THREE.BoxGeometry(2.7, 0.05, 1.6), cabinFloor, [-0.25, 1.09, 0]);
  [[0.35, 0.42], [0.35, -0.42], [-0.85, 0.42], [-0.85, -0.42]].forEach(([x, z]) => {
    add(new RoundedBoxGeometry(0.5, 0.16, 0.5, 2, 0.06), seat, [x, 1.18, z]);
    add(new RoundedBoxGeometry(0.14, 0.5, 0.46, 2, 0.06), seat, [x - 0.24, 1.4, z], car, [0, 0, -0.18]);
  });
  add(new RoundedBoxGeometry(0.3, 0.06, 0.3, 2, 0.02), trim, [0.95, 1.38, 0.42], car, [0, 0, 0.5]); // steering hint

  /* ---------- lights ---------- */
  [0.62, -0.62].forEach((z) => {
    add(new RoundedBoxGeometry(0.08, 0.16, 0.42, 2, 0.04), lightMat, [2.35, 0.86, z]);
    add(new RoundedBoxGeometry(0.08, 0.14, 0.42, 2, 0.04), tailMat, [-2.35, 0.88, z]);
  });

  /* ---------- wheels ---------- */
  const wheels = [];
  [[1.45, 0.94], [1.45, -0.94], [-1.45, 0.94], [-1.45, -0.94]].forEach(([x, z]) => {
    const w = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 40), tyre);
    t.rotation.x = Math.PI / 2;
    t.castShadow = true;
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.32, 28), rim);
    r.rotation.x = Math.PI / 2;
    w.add(t, r);
    w.position.set(x, 0.4, z);
    car.add(w);
    wheels.push(w);
  });

  /* ---------- heat glow inside the cabin ---------- */
  const heatMat = new THREE.SpriteMaterial({ map: radial([[0, 'rgba(255,120,40,.9)'], [0.5, 'rgba(255,90,40,.35)'], [1, 'rgba(255,90,40,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const heat = new THREE.Sprite(heatMat);
  heat.scale.set(3.6, 1.8, 1);
  heat.position.set(-0.3, 1.45, 0);
  car.add(heat);

  /* ---------- ground: soft shadow + gold glow ---------- */
  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: '#2a1d08', opacity: 0.22 }));
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.5), new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(233,166,59,.55)'], [0.5, 'rgba(240,170,70,.2)'], [1, 'rgba(246,199,102,0)']]), transparent: true, depthWrite: false, toneMapped: false }));
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.005;
  scene.add(glow);

  /* ---------- lighting ---------- */
  scene.add(new THREE.HemisphereLight('#ffffff', '#e9dcc4', 1.25));
  const SUN_ON = 3.4, SUN_OFF = 1.6;
  const sun = new THREE.DirectionalLight('#ffd08a', SUN_ON);
  sun.position.set(-4, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  sun.shadow.radius = 6;
  sun.shadow.bias = -0.0006;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#ffffff', 0.7);
  fill.position.set(8, 5, 8);
  scene.add(fill);
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,236,190,1)'], [0.5, 'rgba(255,200,110,.45)'], [1, 'rgba(255,170,60,0)']]), transparent: true, depthWrite: false, toneMapped: false }));
  sunSprite.position.set(-3.2, 4.6, -3);
  sunSprite.scale.set(2.6, 2.6, 1);
  // (sun disc omitted: the glow read as a stray blob at the canvas edge)

  /* ---------- sizing ---------- */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 36 : 30;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);

  /* ---------- HUD ---------- */
  const q = (s) => host.querySelector(s);
  const hud = { temp: q('[data-c-temp]'), uv: q('[data-c-uv]'), ring: q('[data-c-ring]'), state: q('[data-c-state]'), btns: host.querySelectorAll('[data-c-mode]'), bar: document.querySelector('[data-c-progress]') };
  const read = { t: 38, uv: 0 };
  const paint2 = () => {
    hud.temp.textContent = fmt(read.t);
    hud.uv.textContent = fmt(read.uv);
    hud.ring.style.strokeDashoffset = 125.66 * (1 - read.uv / 100);
  };
  paint2();
  const HOT = 62, COOL = 52;
  const setState = (on) => {
    host.classList.toggle('is-tinted', on);
    hud.btns.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.cMode === 'on') === on)));
    hud.state.textContent = on ? hud.state.dataset.on : hud.state.dataset.off;
  };

  /* ---------- film timeline: each pane tints in turn, cabin cools ---------- */
  // pane order: windscreen, rear screen, then side windows front→back on both sides
  const film = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  panes.forEach((p, i) => {
    film.to(p.material, { opacity: 0.88, duration: 0.5 }, i * 0.32);
    film.to(p.material.color, { r: 0.07, g: 0.1, b: 0.16, duration: 0.5 }, i * 0.32);
  });
  const filmEnd = (panes.length - 1) * 0.32 + 0.5;
  film.fromTo(heatMat, { opacity: 0.85 }, { opacity: 0.08, duration: filmEnd, immediateRender: false }, 0);
  film.fromTo(sun, { intensity: SUN_ON }, { intensity: SUN_OFF, duration: filmEnd, immediateRender: false }, 0);
  film.fromTo(read, { t: HOT, uv: 0 }, { t: COOL, uv: 99, duration: filmEnd, onUpdate: paint2, immediateRender: false }, 0);
  film.eventCallback('onUpdate', () => {
    const p = film.progress();
    setState(p > 0.55);
    if (hud.bar) hud.bar.style.width = (p * 100).toFixed(1) + '%';
  });

  /* ---------- intro: car rolls in and heats up (plays once, on load) ---------- */
  const intro = gsap.timeline({ paused: true });
  intro.from(car.position, { x: -9, duration: 1, ease: 'power3.out' }, 0);
  wheels.forEach((w) => intro.from(w.rotation, { z: 12, duration: 1.2, ease: 'power3.out' }, 0));
  intro.from(glow.scale, { x: 0.01, y: 0.01, duration: 1, ease: 'expo.out' }, 0.4);
  intro.to(read, { t: HOT, duration: 0.9, ease: 'power1.in', onUpdate: paint2 }, 0.7);
  intro.to(heatMat, { opacity: 0.85, duration: 0.8 }, 0.7);

  /* ---------- film plays by itself after the car parks, like a short video ---------- */
  film.timeScale(filmEnd / 2.2); // whole film sequence ≈ 2.2 seconds
  intro.eventCallback('onComplete', () => film.play(0));
  hud.btns.forEach((b) =>
    b.addEventListener('click', () => {
      const on = b.dataset.cMode === 'on';
      film.timeScale(filmEnd / 1.6);
      if (on) film.play(); else film.reverse();
    })
  );

  /* ---------- pointer orbit ---------- */
  const look = { x: 0, y: 0 };
  if (window.matchMedia('(pointer: fine)').matches) {
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      gsap.to(look, { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5, duration: 0.8, ease: 'power3' });
    });
    host.addEventListener('pointerleave', () => gsap.to(look, { x: 0, y: 0, duration: 1 }));
  }

  /* ---------- render while visible ---------- */
  let running = false, started = false;
  const clock = new THREE.Clock();
  function frame() {
    if (!running) return;
    const t = clock.getElapsedTime();
    const ang = look.x * 0.5;
    camera.position.set(camBase.x * Math.cos(ang) - camBase.z * Math.sin(ang), camBase.y - look.y * 1.5 + Math.sin(t * 0.6) * 0.06, camBase.x * Math.sin(ang) + camBase.z * Math.cos(ang));
    camera.lookAt(target);
    car.position.y = Math.sin(t * 1.4) * 0.008;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  new IntersectionObserver((es) => {
    running = es[0].isIntersecting;
    if (running) {
      if (!started) {
        started = true;
        host.classList.add('is-ready');
        if (reduce) { film.progress(1); } else { intro.play(); }
      }
      frame();
    }
  }, { threshold: 0.05 }).observe(host);
}
