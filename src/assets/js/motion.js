/* ======================================================================
   Exotic Tint Qatar — Motion (GSAP + ScrollTrigger + Lenis)
   Everything "assembles": elements arrive from all sides and lock into place.
   Falls back to a fully static page if GSAP fails to load or the visitor
   prefers reduced motion (see the inline script in <head>).
   ====================================================================== */
(function motion() {
  var root = document.documentElement;
  if (!root.classList.contains('gsap-ready')) return;
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('gsap-ready'); return; }
  window.__gsapOn = true;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  var rtl = root.dir === 'rtl';
  var mobile = window.innerWidth < 768;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var k = mobile ? 0.55 : 1; // shorter travel distances on small screens
  var blur = mobile ? 'blur(0px)' : 'blur(10px)';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  /* ---- Smooth scrolling (mouse / trackpad only) ---- */
  if (window.Lenis && finePointer) {
    var lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    root.style.scrollBehavior = 'auto';
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#"]');
      if (!a) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      var target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -100, duration: 1.4 });
    });
    $$('[data-to-top]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopImmediatePropagation(); lenis.scrollTo(0, { duration: 1.6 }); }, true);
    });
    var openBtn = document.getElementById('menu-open');
    if (openBtn) openBtn.addEventListener('click', function () { lenis.stop(); });
    $$('#menu-close, #drawer-backdrop, #drawer a').forEach(function (el) { el.addEventListener('click', function () { lenis.start(); }); });
  }

  /* ---- Where each element flies in from ---- */
  var PATHS = {
    left: { x: -120 }, right: { x: 120 }, up: { y: 60 }, down: { y: -40 },
    top: { y: -110, rotate: -3 }, bottom: { y: 110, rotate: 3 }, rise: { y: 140 },
    zoom: { scale: 0.86, y: 50 }, pop: { scale: 0 }, orbit: { scale: 0.55, rotate: -120 },
    flip: { y: 90, rotateX: -45, transformPerspective: 900, transformOrigin: '50% 0%' },
    'fly-tr': { x: 280, y: -200, rotate: 16, scale: 0.4 }, 'fly-bl': { x: -280, y: 200, rotate: -16, scale: 0.4 },
    'far-left': { x: -460, rotate: -9 }, 'far-right': { x: 460, rotate: 9 },
    'far-top': { y: -360, rotate: 7 }, 'far-bottom': { y: 360, rotate: -7 }
  };
  function from(type) {
    var m = PATHS[type] || { y: 60 };
    var o = { autoAlpha: 0 };
    for (var key in m) o[key] = (key === 'x' || key === 'y') ? m[key] * k : m[key];
    if (rtl && o.x) o.x = -o.x;
    if (type !== 'pop' && type !== 'orbit') o.filter = blur;
    return o;
  }
  var SETTLE = { autoAlpha: 1, x: 0, y: 0, rotate: 0, rotateX: 0, scale: 1, filter: 'blur(0px)' };
  var settle = function (extra) { return Object.assign({}, SETTLE, extra || {}); };
  var tidy = function (el) { gsap.set(el, { clearProps: 'filter' }); };

  /* ---- Split a headline into words (keeps gradient spans and line breaks) ---- */
  function split(el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span');
            w.className = 'inline-block' + (node.classList && node.classList.contains('text-grad') ? ' text-grad' : '');
            w.textContent = part;
            frag.appendChild(w);
            words.push(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    })(el);
    return words;
  }

  /* ---- Header drops in ---- */
  gsap.from('#site-header', { y: -90, autoAlpha: 0, duration: 1, ease: 'expo.out', clearProps: 'transform' });

  /* ---- Hero intro: everything flies in and locks together ---- */
  $$('[data-hero]').forEach(function (hero) {
    var tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out', duration: 1.2 } });
    var pick = function (types) { return $$(types.map(function (t) { return '[data-a="' + t + '"]'; }).join(','), hero); };

    pick(['down', 'left']).forEach(function (el, i) {
      tl.fromTo(el, from(el.dataset.a), settle({ onComplete: function () { tidy(el); } }), i * 0.08);
    });

    var h1 = hero.querySelector('[data-split]');
    if (h1) {
      var words = split(h1);
      gsap.set(h1, { autoAlpha: 1 });
      tl.fromTo(words,
        { autoAlpha: 0, x: function () { return rand(-110, 110) * k; }, y: function () { return rand(-90, 90) * k; }, rotate: function () { return rand(-22, 22); }, scale: 0.5, filter: blur },
        { autoAlpha: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: 'blur(0px)', duration: 1.3, ease: 'back.out(1.6)', stagger: { each: 0.06, from: 'random' },
          onComplete: function () { gsap.set(words, { clearProps: 'filter,transform' }); } }, 0.1);
    }

    var arch = hero.querySelector('[data-a="arch"]');
    if (arch) {
      var shape = arch.dataset.shape || ' round 999px 999px 28px 28px)';
      tl.fromTo(arch, { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%' + shape },
        { clipPath: 'inset(0% 0% 0% 0%' + shape, duration: 1.5, ease: 'expo.inOut', onComplete: function () { gsap.set(arch, { clearProps: 'clipPath' }); } }, 0.15);
      var img = arch.querySelector('[data-arch-img]');
      if (img) tl.fromTo(img, { scale: 1.4 }, { scale: 1, duration: 2 }, 0.2);
    }

    pick(['orbit']).forEach(function (el, i) { tl.fromTo(el, from('orbit'), settle({ duration: 1.8, clearProps: 'transform' }), 0.3 + i * 0.15); });
    pick(['fly-tr', 'fly-bl']).forEach(function (el, i) {
      tl.fromTo(el, from(el.dataset.a), settle({ ease: 'back.out(1.4)', duration: 1.3, onComplete: function () { tidy(el); } }), 0.75 + i * 0.15);
    });
    pick(['pop']).forEach(function (el, i) { tl.fromTo(el, from('pop'), settle({ ease: 'back.out(3)', duration: 0.8 }), 1 + i * 0.1); });
    pick(['up']).forEach(function (el, i) { tl.fromTo(el, from('up'), settle({ onComplete: function () { tidy(el); } }), 0.55 + i * 0.1); });
    pick(['rise']).forEach(function (el) { tl.fromTo(el, from('rise'), settle({ duration: 1.4, onComplete: function () { tidy(el); } }), 0.9); });

    /* Mouse parallax on the hero visual (desktop only, after the intro) */
    var stage = hero.querySelector('[data-parallax]');
    if (stage && finePointer) {
      tl.call(function () {
        var layers = $$('[data-depth]', stage).map(function (el) {
          return { d: parseFloat(el.dataset.depth), x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' }) };
        });
        var tiltX = arch ? gsap.quickTo(arch, 'rotationY', { duration: 1, ease: 'power3' }) : null;
        var tiltY = arch ? gsap.quickTo(arch, 'rotationX', { duration: 1, ease: 'power3' }) : null;
        if (arch) gsap.set(arch, { transformPerspective: 1200 });
        hero.addEventListener('mousemove', function (e) {
          var r = hero.getBoundingClientRect();
          var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
          layers.forEach(function (l) { l.x(nx * l.d); l.y(ny * l.d); });
          if (tiltX) { tiltX(nx * 6); tiltY(-ny * 6); }
        });
        hero.addEventListener('mouseleave', function () {
          layers.forEach(function (l) { l.x(0); l.y(0); });
          if (tiltX) { tiltX(0); tiltY(0); }
        });
      });
    }
  });

  /* ---- Scroll: sections assemble as they enter ---- */
  var groups = new Map();
  $$('[data-a]').forEach(function (el) {
    if (el.closest('[data-hero]')) return;
    var g = el.closest('[data-assemble]') || el;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(el);
  });
  groups.forEach(function (els, g) {
    var scrub = g.getAttribute && g.getAttribute('data-assemble') === 'scrub';
    els.forEach(function (el) { gsap.set(el, from(el.dataset.a)); });
    if (scrub) {
      // Gallery: tiles travel in from every side and lock into the grid as you scroll
      gsap.to(els, settle({ ease: 'power3.out', stagger: 0.05,
        scrollTrigger: { trigger: g, start: 'top 98%', end: mobile ? 'top 45%' : 'center 62%', scrub: 1 } }));
    } else {
      gsap.to(els, settle({ duration: 1.15, ease: 'expo.out', stagger: 0.09,
        onComplete: function () { els.forEach(tidy); },
        scrollTrigger: { trigger: g, start: 'top 82%', once: true } }));
    }
  });

  /* ---- Navy panels widen to full width as they scroll in ---- */
  $$('[data-expand]').forEach(function (el) {
    var side = mobile ? 3 : 6;
    gsap.fromTo(el, { clipPath: 'inset(0% ' + side + '% 0% ' + side + '% round 28px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 30%', scrub: true } });
  });

  /* ---- Chats: messages arrive one by one with a typing indicator ---- */
  function chat(box, selector, status) {
    var items = $$(selector, box);
    if (!items.length) return;
    var typing = box.querySelector('[data-typing]');
    var original = status ? status.textContent : '';
    var setStatus = function (on) { if (status) status.textContent = on ? status.dataset.typingLabel : original; };
    gsap.set(items, { autoAlpha: 0, y: 24, scale: 0.9 });
    var tl = gsap.timeline({ paused: true });
    items.forEach(function (it) {
      var incoming = !it.classList.contains('justify-end');
      if (incoming && typing) {
        tl.call(function () { it.parentNode.insertBefore(typing, it); typing.classList.add('is-on'); setStatus(true); });
        tl.to({}, { duration: 0.8 });
        tl.call(function () { typing.classList.remove('is-on'); setStatus(false); });
      }
      tl.to(it, { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.8)', transformOrigin: incoming !== rtl ? '0% 100%' : '100% 100%' });
      tl.to({}, { duration: 0.3 });
    });
    ST.create({ trigger: box, start: 'top 78%', once: true, onEnter: function () { tl.play(); } });
  }
  $$('[data-chat]').forEach(function (box) {
    var phone = box.closest('.overflow-hidden');
    chat(box, '[data-chat-msg]', phone ? phone.querySelector('[data-status]') : null);
  });
  $$('[data-reviews]').forEach(function (box) { chat(box, '[data-review]', document.querySelector('[data-review-status]')); });

  /* ---- Numbers count up ---- */
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), o = { v: 0 };
    ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
    } });
  });

  /* ---- Drifting aurora glows behind the glass ---- */
  $$('.aurora span').forEach(function (s) {
    gsap.to(s, { x: 'random(-90, 90)', y: 'random(-70, 70)', scale: 'random(0.85, 1.2)', duration: 'random(9, 15)', repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });

  /* ---- Magnetic buttons (desktop) ---- */
  if (finePointer) {
    $$('.btn-primary, .btn-dark').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---- Showcase player: a looping "video" made of live glass layers ---- */
  $$('[data-showcase]').forEach(function (box) {
    var scenes = JSON.parse(box.dataset.scenes);
    var q = function (s) { return box.querySelector(s); };
    var img = q('[data-sc-img]'), glare = q('[data-sc-glare]'), film = q('[data-sc-film]'), edge = q('[data-sc-edge]');
    var temp = q('[data-sc-temp]'), tbar = q('[data-sc-tbar]'), delta = q('[data-sc-delta]'), place = q('[data-sc-place]');
    var ring = q('[data-sc-ring]'), uv = q('[data-sc-uv]'), stepEl = q('[data-sc-step]'), stepNo = q('[data-sc-stepno]');
    var steps = JSON.parse(stepEl.dataset.steps);
    var progs = $$('[data-sc-prog]', box), gos = $$('[data-sc-go]', box), chips = $$('[data-sc-chip]', box);
    var toggle = q('[data-sc-toggle]'), icoPause = q('[data-sc-ico-pause]'), icoPlay = q('[data-sc-ico-play]'), clock = q('[data-sc-time]');
    var C = 125.66, DUR = 7.5;
    var current = 0, tl = null, userPaused = false, inView = false;
    var arabic = root.lang === 'ar';
    var fmt = function (n) { return arabic ? Math.round(n).toLocaleString('ar-EG') : String(Math.round(n)); };

    function caption(i) {
      return function () {
        gsap.fromTo(stepEl.parentNode, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' });
        stepEl.innerHTML = steps[i];
        stepNo.textContent = fmt(i + 1);
      };
    }

    function build(i) {
      var s = scenes[i], t = { v: s.from }, u = { v: 0 };
      var x = gsap.timeline({ onComplete: function () { play((i + 1) % scenes.length); } });
      x.call(function () {
        place.textContent = s.place;
        progs.forEach(function (p, n) { gsap.set(p, { width: n < i ? '100%' : '0%' }); });
        chips.forEach(function (c, n) { c.style.color = n === i ? '#fff' : ''; });
      });
      // 0 — new scene: clear glass, harsh glare, hot reading
      x.set(film, { clipPath: 'inset(0% 100% 0% 0%)' })
        .set(edge, { left: '0%', autoAlpha: 0 })
        .set(tbar, { width: '100%', backgroundImage: 'linear-gradient(90deg,#fbbf24,#ef4444)' })
        .set(ring, { strokeDashoffset: C })
        .call(function () { temp.textContent = fmt(s.from); uv.textContent = fmt(0); delta.textContent = ''; });
      x.to(img, { autoAlpha: 0, duration: 0.35 })
        .call(function () { img.src = img.src.replace(/[^/]+\.webp$/, s.img + '.webp'); })
        .fromTo(img, { scale: 1.12 }, { scale: 1, autoAlpha: 1, duration: DUR, ease: 'none' }, '<')
        .to(glare, { autoAlpha: 1, duration: 0.8 }, '<');
      x.call(caption(0), null, '<0.2');
      x.call(caption(1), null, 1.7);
      // 2.2 — film sweeps across with the squeegee edge
      x.call(caption(2), null, 2.4);
      x.to(edge, { autoAlpha: 1, duration: 0.2 }, 2.4)
        .to(film, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.4, ease: 'power2.inOut' }, 2.4)
        .to(edge, { left: '100%', duration: 2.4, ease: 'power2.inOut' }, 2.4)
        .to(glare, { autoAlpha: 0, duration: 2.4, ease: 'power2.inOut' }, 2.4)
        .to(edge, { autoAlpha: 0, duration: 0.3 }, 4.8);
      // readings respond as the film goes on
      x.to(t, { v: s.to, duration: 2.6, ease: 'power2.out', onUpdate: function () { temp.textContent = fmt(t.v); } }, 2.8)
        .to(tbar, { width: '42%', backgroundImage: 'linear-gradient(90deg,#7dd3fc,#6ee7b7)', duration: 2.6, ease: 'power2.out' }, 2.8)
        .to(u, { v: 99, duration: 2.2, ease: 'power2.out', onUpdate: function () { uv.textContent = fmt(u.v); } }, 2.8)
        .to(ring, { strokeDashoffset: C * 0.01, duration: 2.2, ease: 'power2.out' }, 2.8);
      x.call(function () { delta.textContent = '−' + fmt(s.from - s.to) + '°C'; }, null, 5.4);
      x.call(caption(3), null, 5.4);
      // progress bar + clock for the whole scene
      x.fromTo(progs[i], { width: '0%' }, { width: '100%', duration: DUR, ease: 'none',
        onUpdate: function () { var sec = Math.floor(i * DUR + this.progress() * DUR); clock.textContent = '00:' + (sec < 10 ? '0' : '') + sec; } }, 0);
      return x;
    }

    function play(i) {
      if (tl) tl.kill();
      current = i;
      tl = build(i);
      if (userPaused || !inView) tl.pause();
    }
    function setPaused(p) {
      userPaused = p;
      icoPause.classList.toggle('hidden', p);
      icoPlay.classList.toggle('hidden', !p);
      toggle.setAttribute('aria-label', p ? toggle.dataset.labelPlay : toggle.dataset.labelPause);
      if (tl) (p || !inView ? tl.pause() : tl.play());
    }
    toggle.addEventListener('click', function () { setPaused(!userPaused); });
    gos.forEach(function (g, n) { g.addEventListener('click', function () { play(n); if (!userPaused && inView) tl.play(); }); });

    // Only play while on screen (saves battery, starts fresh when reached)
    ST.create({
      trigger: box, start: 'top 85%', end: 'bottom 15%',
      onToggle: function (self) {
        inView = self.isActive;
        if (!tl) { play(0); }
        if (tl) (inView && !userPaused ? tl.play() : tl.pause());
      }
    });
    // Stage entrance
    gsap.from(box, { y: 80, scale: 0.94, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: box, start: 'top 85%', once: true } });
  });

  window.addEventListener('load', function () { ST.refresh(); });
})();
