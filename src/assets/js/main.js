// Exotic Tint — site interactions (no dependencies)
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rtl = document.documentElement.dir === 'rtl';
  var openWA = function (wa, text) { window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(text), '_blank', 'noopener'); };

  /* Navbar shadow on scroll */
  var header = $('#site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mega menu (hover on desktop, click/keyboard everywhere) */
  $$('[data-mega]').forEach(function (wrap) {
    var btn = $('[data-mega-btn]', wrap);
    var panel = $('[data-mega-panel]', wrap);
    var timer;
    var set = function (open) {
      clearTimeout(timer);
      wrap.classList.toggle('open', open);
      panel.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    wrap.addEventListener('mouseenter', function () { set(true); });
    wrap.addEventListener('mouseleave', function () { timer = setTimeout(function () { set(false); }, 180); });
    btn.addEventListener('click', function () { set(!wrap.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) set(false); });
  });

  /* Mobile drawer */
  var drawer = $('#drawer');
  var backdrop = $('#drawer-backdrop');
  var openBtn = $('#menu-open');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('drawer-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (openBtn) openBtn.addEventListener('click', function () { setDrawer(true); });
  if (backdrop) backdrop.addEventListener('click', function () { setDrawer(false); });
  var closeBtn = $('#menu-close');
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); });
  $$('#drawer a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* Scroll reveal */
  var items = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Horizontal card sliders (prev/next buttons live in the same section) */
  $$('[data-slider]').forEach(function (track) {
    var section = track.closest('section');
    var prev = $('[data-slider-prev]', section);
    var next = $('[data-slider-next]', section);
    var bar = $('[data-slider-bar]', section);
    var step = function () { var card = track.firstElementChild; return card ? card.getBoundingClientRect().width + 20 : 300; };
    var dir = rtl ? -1 : 1;
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step() * dir, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step() * dir, behavior: 'smooth' }); });
    var update = function () {
      if (!bar) return;
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? Math.abs(track.scrollLeft) / max : 1;
      var w = Math.max(track.clientWidth / track.scrollWidth, 0.2);
      bar.style.width = (w * 100) + '%';
      bar.style.transform = 'translateX(' + ((rtl ? -1 : 1) * p * (1 / w - 1) * 100) + '%)';
    };
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* Tint studio */
  var lab = $('[data-tint-lab]');
  if (lab) {
    var shades = JSON.parse(lab.getAttribute('data-shades'));
    var overlay = $('[data-tint-overlay]', lab);
    var sws = $$('[data-shade]', lab);
    var vlt = $('[data-out="vlt"]', lab), best = $('[data-out="best"]', lab);
    var cur = -1, shown = 0, rollT = 0, countRaf = 0, demo = [];
    var film = $('[data-tint-film]', lab), line = $('[data-tint-line]', lab), filmImg = film && film.querySelector('img');
    var flip = function (el) { el.classList.remove('is-flip'); void el.offsetWidth; el.classList.add('is-flip'); };
    var opOf = function (s) { return (((100 - s.v) / 100) * 0.92).toFixed(2); };
    var count = function (to) {
      cancelAnimationFrame(countRaf);
      var from = shown, t0 = performance.now();
      var step = function (now) {
        var p = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - p, 3);
        shown = Math.round(from + (to - from) * e);
        vlt.textContent = shown;
        if (p < 1) countRaf = requestAnimationFrame(step);
      };
      countRaf = requestAnimationFrame(step);
    };
    var render = function (i, quiet) {
      if (i === cur) return;
      cur = i;
      var s = shades[i], op = opOf(s);
      sws.forEach(function (b, n) { b.setAttribute('aria-checked', String(n === i)); b.tabIndex = n === i ? 0 : -1; });
      best.textContent = s.best;
      if (quiet || !film) { overlay.style.opacity = op; shown = s.v; vlt.textContent = s.v; return; }
      // roll the new film down over the glass, then settle
      clearTimeout(rollT);
      filmImg.src = sceneImg.getAttribute('src');
      film.style.setProperty('--op', op);
      [film, line].forEach(function (el) { el.classList.remove('is-roll'); void el.offsetWidth; el.classList.add('is-roll'); });
      rollT = setTimeout(function () { overlay.style.opacity = op; film.classList.remove('is-roll'); }, 980);
      count(s.v);
      flip(best);
    };
    var stopDemo = function () { demo.forEach(clearTimeout); demo = []; };
    sws.forEach(function (b, n) {
      b.addEventListener('click', function () { stopDemo(); render(n); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var k = Math.max(0, Math.min(sws.length - 1, n + d));
        render(k);
        sws[k].focus();
      });
    });
    var sceneImg = $('[data-scene-img]', lab);
    render(sws.findIndex ? sws.findIndex(function (b) { return b.getAttribute('aria-checked') === 'true'; }) : 2, true);
    // first time it comes into view: a short demo through the shades
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      new IntersectionObserver(function (es, io) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        [4, 0, 3, 2].forEach(function (k, n) { demo.push(setTimeout(function () { render(k); }, 700 + n * 1500)); });
      }, { threshold: 0.5 }).observe(lab);
    }
    lab.addEventListener('pointermove', function (e) {
      var r = lab.getBoundingClientRect();
      lab.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      lab.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
    var tabs = $$('[data-scene]');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        stopDemo();
        if (tab.getAttribute('aria-selected') === 'true') return;
        tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === tab)); });
        lab.classList.add('is-swap');
        setTimeout(function () {
          // Keep whatever base path the page was built with (works on GitHub Pages sub-paths too)
          sceneImg.onload = function () { lab.classList.remove('is-swap'); };
          sceneImg.src = sceneImg.getAttribute('src').replace(/[^/]+\.webp$/, tab.getAttribute('data-scene') + '.webp');
        }, 350);
      });
    });
  }

  /* Before / after slider */
  $$('[data-ba]').forEach(function (ba) {
    var r = $('input[type="range"]', ba);
    var set = function () { ba.style.setProperty('--pos', r.value + '%'); };
    r.addEventListener('input', set);
    set();
  });

  /* Testimonials */
  var tBox = $('[data-testimonials]');
  if (tBox) {
    var list = JSON.parse(tBox.getAttribute('data-testimonials'));
    var idx = 0;
    var body = $('[data-t-body]', tBox);
    var show = function (n) {
      idx = (n + list.length) % list.length;
      body.classList.add('is-out');
      setTimeout(function () {
        var r = list[idx];
        $('[data-t-text]', tBox).textContent = r.text;
        $('[data-t-name]', tBox).textContent = r.name;
        $('[data-t-role]', tBox).textContent = r.role;
        $('[data-t-service]', tBox).textContent = r.service;
        body.classList.remove('is-out');
      }, 250);
    };
    $('[data-t-prev]', tBox).addEventListener('click', function () { show(idx - 1); });
    $('[data-t-next]', tBox).addEventListener('click', function () { show(idx + 1); });
  }

  /* Quote form → WhatsApp */
  $$('[data-quote-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = form.dataset;
      var val = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var err = $('[data-form-error]', form);
      if (!val('name') || !val('phone')) {
        err.classList.remove('hidden'); err.classList.add('flex');
        (val('name') ? form.elements.phone : form.elements.name).focus();
        return;
      }
      err.classList.add('hidden'); err.classList.remove('flex');
      var lines = [d.msgIntro, '', d.lName + ': ' + val('name'), d.lPhone + ': ' + val('phone'), d.lService + ': ' + val('service'), d.lArea + ': ' + val('area')];
      if (val('message')) lines.push(d.lMessage + ': ' + val('message'));
      openWA(d.wa, lines.join('\n'));
    });
  });

  /* Footer call-back form → WhatsApp */
  $$('[data-callback]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = form.elements.phone.value.trim();
      if (!phone) { form.elements.phone.focus(); return; }
      openWA(form.dataset.wa, form.dataset.msg + ' ' + phone);
    });
  });

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* Footer: live open/closed status (Qatar time, 8 AM – 6 PM daily) + back-to-top ring */
(function () {
  var badges = document.querySelectorAll('[data-open-status]');
  if (badges.length) {
    var h;
    try { h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Qatar' }).format(new Date())); }
    catch (e) { h = (new Date().getUTCHours() + 3) % 24; }
    var open = h >= 8 && h < 18;
    Array.prototype.forEach.call(badges, function (badge) {
      badge.querySelector('[data-open-label]').textContent = open ? badge.dataset.open : badge.dataset.closed;
      if (!open) {
        badge.classList.add('is-closed');
        badge.querySelector('[data-open-dot]').style.background = '#f59e0b';
        badge.querySelector('[data-open-ping]').style.display = 'none';
      }
    });
  }
  var top = document.querySelector('[data-to-top]');
  var ring = document.querySelector('[data-top-ring]');
  if (top) {
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    var upd = function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      if (ring) ring.style.strokeDashoffset = 125.66 * (1 - (max > 0 ? scrollY / max : 0));
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }
})();

/* Footer reveal: lines slide up and columns fade in when the footer enters the screen */
(function () {
  var f = document.querySelector('[data-footer]');
  if (!f) return;
  Array.prototype.forEach.call(f.querySelectorAll('.f-up'), function (el, i) { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (150 + i * 90) + 'ms'); });
  if (!('IntersectionObserver' in window)) { f.classList.add('footer-visible'); return; }
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { f.classList.add('footer-visible'); io.disconnect(); } }, { threshold: 0.12 });
  io.observe(f);
})();


/* Services expanding slider: auto-advance, hover pause, click to open; swipe on mobile */
(function () {
  var xp = document.querySelector('[data-xp]');
  if (!xp) return;
  var panels = Array.prototype.slice.call(xp.querySelectorAll('[data-xp-panel]'));
  var count = document.querySelector('[data-xp-count]');
  var DUR = 6000, idx = 0, timer = null;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = function () { return window.innerWidth >= 1024; };
  var arabic = document.documentElement.lang === 'ar';
  var fmt = function (n) { var s = (n < 10 ? '0' : '') + n; return arabic ? s.replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }) : s; };
  xp.style.setProperty('--xp-dur', DUR / 1000 + 's');

  function show(i, fromUser) {
    idx = (i + panels.length) % panels.length;
    panels.forEach(function (p, n) { p.classList.toggle('is-active', n === idx); p.setAttribute('aria-expanded', String(n === idx)); });
    if (count) count.textContent = fmt(idx + 1);
    if (!wide()) {
      var p = panels[idx];
      xp.scrollTo({ left: p.offsetLeft - (xp.clientWidth - p.clientWidth) / 2, behavior: 'smooth' });
    }
    if (fromUser) restart();
  }
  function restart() {
    clearInterval(timer);
    if (!reduce && wide()) timer = setInterval(function () { if (!xp.classList.contains('is-paused')) show(idx + 1); }, DUR);
  }
  panels.forEach(function (p, n) {
    p.addEventListener('click', function (e) {
      if (!wide() || p.classList.contains('is-active')) return;
      e.preventDefault();
      show(n, true);
    });
    p.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !p.classList.contains('is-active')) { e.preventDefault(); show(n, true); } });
  });
  xp.addEventListener('mouseenter', function () { xp.classList.add('is-paused'); });
  xp.addEventListener('mouseleave', function () { xp.classList.remove('is-paused'); });
  var prev = document.querySelector('[data-xp-prev]'), next = document.querySelector('[data-xp-next]');
  if (prev) prev.addEventListener('click', function () { show(idx - 1, true); });
  if (next) next.addEventListener('click', function () { show(idx + 1, true); });
  // keep the counter in sync while swiping on mobile
  xp.addEventListener('scroll', function () {
    if (wide()) return;
    var mid = xp.scrollLeft + xp.clientWidth / 2, best = 0, bd = Infinity;
    panels.forEach(function (p, n) { var d = Math.abs(p.offsetLeft + p.clientWidth / 2 - mid); if (d < bd) { bd = d; best = n; } });
    if (best !== idx) { idx = best; if (count) count.textContent = fmt(idx + 1); }
  }, { passive: true });
  window.addEventListener('resize', restart);
  void arabic;
  restart();
})();

/* Tint in motion: film slides across the photo, glare fades, readings count to match */
(function () {
  var box = document.querySelector('[data-tm]');
  if (!box) return;
  var scenes = JSON.parse(box.dataset.scenes);
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tm-tab]'));
  var img = box.querySelector('[data-tm-img]'), temp = box.querySelector('[data-tm-temp]'), uv = box.querySelector('[data-tm-uv]');
  var ring = box.querySelector('[data-tm-ring]'), state = box.querySelector('[data-tm-state]');
  var section = box.closest('section');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ar = document.documentElement.lang === 'ar';
  var fmt = function (n) { n = Math.round(n); return ar ? n.toLocaleString('ar-EG') : String(n); };
  var DUR = 6500, idx = 0, timers = [], raf = 0, cycle = null, visible = false, paused = false;
  section.style.setProperty('--tm-dur', DUR / 1000 + 's');

  function tween(ms, step, done) {
    cancelAnimationFrame(raf);
    var t0 = performance.now();
    (function f(now) {
      var p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      step(e);
      if (p < 1) raf = requestAnimationFrame(f); else if (done) done();
    })(t0);
  }
  function setOff(s) {
    box.classList.remove('is-on', 'is-sweeping');
    box.style.setProperty('--pos', '0%');
    temp.textContent = fmt(s.from); uv.textContent = fmt(0); ring.style.strokeDashoffset = 125.66;
    state.textContent = state.dataset.off;
  }
  function apply(s) {
    box.classList.add('is-sweeping');
    tween(1700, function (e) {
      box.style.setProperty('--pos', (e * 100).toFixed(2) + '%');
      temp.textContent = fmt(s.from - (s.from - s.to) * e);
      uv.textContent = fmt(99 * e);
      ring.style.strokeDashoffset = 125.66 * (1 - 0.99 * e);
      if (e > 0.35 && !box.classList.contains('is-on')) { box.classList.add('is-on'); state.textContent = state.dataset.on; }
    }, function () { box.classList.remove('is-sweeping'); });
  }
  function play(i) {
    timers.forEach(clearTimeout); timers = [];
    idx = (i + scenes.length) % scenes.length;
    var s = scenes[idx];
    tabs.forEach(function (t, n) { t.setAttribute('aria-selected', String(n === idx)); var b = t.querySelector('.tm-bar'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; });
    img.style.opacity = '0';
    timers.push(setTimeout(function () {
      img.src = img.getAttribute('src').replace(/[^/]+\.webp$/, s.img + '.webp');
      setOff(s);
      img.style.opacity = '1';
      if (reduce) { box.style.setProperty('--pos', '100%'); box.classList.add('is-on'); temp.textContent = fmt(s.to); uv.textContent = fmt(99); ring.style.strokeDashoffset = 1.26; state.textContent = state.dataset.on; }
      else timers.push(setTimeout(function () { apply(s); }, 900));
    }, 350));
  }
  function loop() {
    clearInterval(cycle);
    if (!reduce) cycle = setInterval(function () { if (visible && !paused) play(idx + 1); }, DUR);
  }
  tabs.forEach(function (t, n) { t.addEventListener('click', function () { play(n); loop(); }); });
  box.addEventListener('mouseenter', function () { paused = true; section.classList.add('tm-paused'); });
  box.addEventListener('mouseleave', function () { paused = false; section.classList.remove('tm-paused'); });
  var started = false;
  new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting;
    if (visible && !started) { started = true; play(0); loop(); }
  }, { threshold: 0.35 }).observe(box);
  setOff(scenes[0]);
})();

/* Services page: highlight the tab of the service in view */
(function () {
  var nav = document.querySelector('[data-svc-nav]');
  if (!nav || !('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll('[data-svc-link]'));
  var set = function (slug) {
    links.forEach(function (l) {
      var on = l.dataset.svcLink === slug;
      l.classList.toggle('is-active', on);
      if (on) nav.scrollTo({ left: l.offsetLeft - nav.clientWidth / 2 + l.clientWidth / 2, behavior: 'smooth' });
    });
  };
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) set(e.target.dataset.svcRow); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('[data-svc-row]').forEach(function (r) { io.observe(r); });
})();

/* Services page: the sticky stage plays each service's effect as its block scrolls into view */
(function () {
  var sv = document.querySelector('[data-sv]:not([data-svh])');
  if (!sv || !sv.dataset.items) return;
  var items = JSON.parse(sv.dataset.items);
  var steps = Array.prototype.slice.call(document.querySelectorAll('[data-sv-step]'));
  var q = function (s) { return sv.querySelector(s); };
  var img = q('[data-sv-img]'), val = q('[data-sv-val]'), bar = q('[data-sv-bar]'), label = q('[data-sv-label]');
  var chip = q('[data-sv-chip]'), state = q('[data-sv-state]'), n = q('[data-sv-n]');
  var pips = Array.prototype.slice.call(document.querySelectorAll('[data-sv-pip]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ar = document.documentElement.lang === 'ar';
  var dig = function (s) { return ar ? String(s).replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }) : String(s); };
  var cur = -1, raf = 0, timers = [];
  function show(it, e) {
    var from = it.from || 0;
    var v = Math.round(from + (it.to - from) * e);
    val.textContent = it.pre + dig(v) + it.unit;
    var pct = it.from ? 100 - v : (it.to ? (v / it.to) * 100 : 0);
    bar.style.width = pct + '%';
  }
  function play(i) {
    if (i === cur) return;
    cur = i;
    var it = items[i];
    timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf);
    steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    pips.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
    n.textContent = dig((i < 9 ? '0' : '') + (i + 1));
    img.style.opacity = '0';
    timers.push(setTimeout(function () {
      img.src = img.getAttribute('src').replace(/[^/]+\.webp$/, it.img + '.webp');
      sv.dataset.fx = it.fx;
      sv.classList.remove('is-on', 'is-sweeping');
      sv.style.setProperty('--pos', '0%');
      label.innerHTML = it.label; chip.innerHTML = it.chip; state.textContent = state.dataset.off;
      show(it, 0);
      img.style.opacity = '1';
      if (reduce) { sv.style.setProperty('--pos', '100%'); sv.classList.add('is-on'); state.textContent = state.dataset.on; show(it, 1); return; }
      timers.push(setTimeout(function () {
        sv.classList.add('is-sweeping');
        var t0 = performance.now(), D = 1700;
        (function f(now) {
          var p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 3);
          sv.style.setProperty('--pos', (e * 100).toFixed(2) + '%');
          show(it, e);
          if (e > 0.3 && !sv.classList.contains('is-on')) { sv.classList.add('is-on'); state.textContent = state.dataset.on; }
          if (p < 1) raf = requestAnimationFrame(f); else sv.classList.remove('is-sweeping');
        })(t0);
      }, 650));
    }, 300));
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) play(Number(e.target.dataset.svStep)); });
    }, { rootMargin: window.innerWidth >= 1024 ? '-45% 0px -45% 0px' : '-55% 0px -30% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }
  play(0);
})();

/* Tint savings calculator: monthly spend × cooling share × AC-load reduction */
(function () {
  var box = document.querySelector('[data-sav]');
  if (!box) return;
  var films = JSON.parse(box.dataset.films), modes = JSON.parse(box.dataset.modes);
  var q = function (s) { return box.querySelector(s); };
  var range = q('[data-sav-range]'), note = q('[data-sav-note]');
  var ar = document.documentElement.lang === 'ar';
  var fmt = function (n) { return Math.round(n).toLocaleString(ar ? 'ar-EG' : 'en-US'); };
  var film = 2, mode = 'home';
  function calc() {
    var m = modes[mode], f = films[film], spend = Number(range.value);
    var cool = spend * m.share / 100, month = cool * f.ac / 100;
    range.style.setProperty('--fill', ((spend - m.min) / (m.max - m.min)) * 100 + '%');
    q('[data-sav-spend]').textContent = fmt(spend);
    var set = function (s, v) { var el = q(s); if (el) el.textContent = v; };
    set('[data-sav-cool]', fmt(cool));
    set('[data-sav-month]', fmt(month));
    set('[data-sav-year]', fmt(month * 12));
    set('[data-sav-ac2]', fmt(f.ac));
  }
  function pickFilm(i) {
    film = i;
    var f = films[i];
    box.querySelectorAll('[data-sav-film]').forEach(function (b, n) { b.setAttribute('aria-selected', String(n === i)); });
    q('[data-sav-heat]').textContent = f.heatTxt;
    q('[data-sav-uv]').textContent = f.uv;
    q('[data-sav-ac]').textContent = fmt(f.ac);
    q('[data-sav-heatbar]').style.width = f.heat + '%';
    q('[data-sav-uvbar]').style.width = f.uvN + '%';
    q('[data-sav-acbar]').style.width = f.ac * 2 + '%';
    calc();
  }
  function pickMode(md) {
    mode = md;
    var m = modes[md];
    box.querySelectorAll('[data-sav-mode]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.savMode === md)); });
    range.min = m.min; range.max = m.max; range.step = m.step; range.value = m.val;
    q('[data-sav-label]').textContent = m.label;
    note.textContent = note.dataset[md];
    calc();
  }
  box.querySelectorAll('[data-sav-film]').forEach(function (b, i) { b.addEventListener('click', function () { pickFilm(i); }); });
  box.querySelectorAll('[data-sav-mode]').forEach(function (b) { b.addEventListener('click', function () { pickMode(b.dataset.savMode); }); });
  range.addEventListener('input', calc);
  calc();
})();

/* Car explainer: scroll steps drive the sticky diagram */
(function () {
  var ex = document.querySelector('[data-ex]');
  if (!ex) return;
  var steps = Array.prototype.slice.call(document.querySelectorAll('[data-ex-step]'));
  var pips = Array.prototype.slice.call(ex.querySelectorAll('[data-ex-pip]'));
  var tEl = ex.querySelector('[data-ex-temp]');
  var ar = document.documentElement.lang === 'ar';
  var cur = 0, tNow = 38, raf = 0;
  var fmt = function (n) { return Math.round(n).toLocaleString(ar ? 'ar-EG' : 'en-US'); };
  function go(n) {
    if (n === cur) return;
    cur = n;
    var el = steps[n - 1];
    ex.setAttribute('data-step', n);
    steps.forEach(function (s) { s.classList.toggle('is-active', s === el); });
    pips.forEach(function (p) { p.classList.toggle('is-on', Number(p.dataset.exPip) === n); });
    var from = tNow, to = Number(el.dataset.temp), t0 = performance.now();
    cancelAnimationFrame(raf);
    (function f(now) {
      var p = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - p, 3);
      tNow = from + (to - from) * e; tEl.textContent = fmt(tNow);
      if (p < 1) raf = requestAnimationFrame(f);
    })(t0);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) go(Number(e.target.dataset.exStep)); });
    }, { rootMargin: window.innerWidth >= 1024 ? '-45% 0px -45% 0px' : '-60% 0px -25% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }
  go(1);
})();

/* Car "how it works" stepper: auto-plays when visible, tabs to jump, pauses on hover */
(function () {
  var hw = document.querySelector('[data-hw]');
  if (!hw) return;
  var tabs = Array.prototype.slice.call(hw.querySelectorAll('[data-hw-tab]'));
  var caps = Array.prototype.slice.call(hw.querySelectorAll('[data-hw-cap]'));
  var temps = JSON.parse(hw.dataset.temps), tEl = hw.querySelector('[data-hw-temp]');
  var ar = document.documentElement.lang === 'ar';
  var started = false, DUR = 3600, idx = -1, timer = null, visible = false, paused = false, tNow = temps[0], raf = 0;
  hw.style.setProperty('--hw-dur', DUR / 1000 + 's');
  var unit = hw.dataset.unit === undefined ? '°C' : hw.dataset.unit;
  var fmt = function (n) { return typeof n === 'string' ? n : Math.round(n).toLocaleString(ar ? 'ar-EG' : 'en-US') + unit; };
  function go(i) {
    idx = (i + tabs.length) % tabs.length;
    hw.setAttribute('data-step', idx);
    tabs.forEach(function (t, n) { t.setAttribute('aria-selected', String(n === idx)); var b = t.querySelector('.hw-bar'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; });
    caps.forEach(function (c, n) { c.classList.toggle('is-on', n === idx); });
    if (typeof temps[idx] !== 'number' || typeof tNow !== 'number') { tNow = temps[idx]; tEl.textContent = fmt(tNow); return; }
    var from = tNow, to = temps[idx], t0 = performance.now();
    cancelAnimationFrame(raf);
    (function f(now) { var p = Math.min(1, (now - t0) / 1100), e = 1 - Math.pow(1 - p, 3); tNow = from + (to - from) * e; tEl.textContent = fmt(tNow); if (p < 1) raf = requestAnimationFrame(f); })(t0);
  }
  function loop() { clearInterval(timer); timer = setInterval(function () { if (visible && !paused) go(idx + 1); }, DUR); }
  tabs.forEach(function (t, n) { t.addEventListener('click', function () { started = true; go(n); loop(); }); });
  hw.addEventListener('mouseenter', function () { paused = true; hw.classList.add('is-paused'); });
  hw.addEventListener('mouseleave', function () { paused = false; hw.classList.remove('is-paused'); });
  new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting;
    if (visible && !started) { started = true; go(0); loop(); }
  }, { threshold: 0.3 }).observe(hw);
  hw.setAttribute('data-step', '0');

})();


/* Service hero demos: before → film sweeps across → after, on a loop */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-svh]'), function (box) {
    var vals = JSON.parse(box.dataset.vals), val = box.querySelector('[data-svh-val]'), st = box.querySelector('[data-svh-state]');
    var ar = document.documentElement.lang === 'ar';
    var unit = vals.length && typeof vals[0] === 'number' ? '°C' : '';
    var fmt = function (n) { return typeof n === 'number' ? Math.round(n).toLocaleString(ar ? 'ar-EG' : 'en-US') + unit : n; };
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches, raf = 0;
    function off() { box.classList.remove('is-on', 'is-sweeping'); box.style.setProperty('--pos', '0%'); val.textContent = fmt(vals[0]); st.textContent = st.dataset.off; }
    function on() {
      box.classList.add('is-sweeping');
      var t0 = performance.now();
      cancelAnimationFrame(raf);
      (function f(now) {
        var p = Math.min(1, (now - t0) / 1600), e = 1 - Math.pow(1 - p, 3);
        box.style.setProperty('--pos', (e * 100).toFixed(1) + '%');
        if (typeof vals[0] === 'number') val.textContent = fmt(vals[0] + (vals[1] - vals[0]) * e);
        if (e > 0.35 && !box.classList.contains('is-on')) { box.classList.add('is-on'); st.textContent = st.dataset.on; if (typeof vals[1] !== 'number') val.textContent = vals[1]; }
        if (p < 1) raf = requestAnimationFrame(f); else box.classList.remove('is-sweeping');
      })(t0);
    }
    if (reduce) { box.style.setProperty('--pos', '100%'); box.classList.add('is-on'); val.textContent = fmt(vals[1]); st.textContent = st.dataset.on; return; }
    off();
    var cycle = function () { off(); setTimeout(on, 900); };
    var timer = null;
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!timer) { cycle(); timer = setInterval(cycle, 5600); } }
      else { clearInterval(timer); timer = null; }
    }, { threshold: 0.2 }).observe(box);
  });
})();

/* Service options explorer: plays through each option like a short film; click to jump */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-ox]'), function (box) {
    var tabs = box.querySelectorAll('[data-ox-tab]'), panels = box.querySelectorAll('[data-ox-panel]');
    var dur = parseInt(getComputedStyle(box).getPropertyValue('--ox-dur'), 10) || 4800;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var i = 0, timer = null;
    function go(n) {
      i = (n + tabs.length) % tabs.length;
      Array.prototype.forEach.call(tabs, function (t, k) { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', String(k === i)); });
      Array.prototype.forEach.call(panels, function (p, k) { p.classList.toggle('is-on', k === i); if (k === i) p.removeAttribute('aria-hidden'); else p.setAttribute('aria-hidden', 'true'); });
    }
    function stop() { clearInterval(timer); timer = null; }
    function play() {
      stop();
      if (reduce || tabs.length < 2) return;
      box.classList.add('is-playing');
      timer = setInterval(function () { go(i + 1); }, dur);
    }
    Array.prototype.forEach.call(tabs, function (t, k) {
      t.addEventListener('click', function () {
        // restart the progress bar on the chosen option
        box.classList.remove('is-playing'); void box.offsetWidth;
        go(k); play();
      });
    });
    go(0);
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!timer) play(); }
      else { stop(); box.classList.remove('is-playing'); }
    }, { threshold: 0.25 }).observe(box);
  });
})();

/* How it works: steps on the left, matching scene on the right; dots run between steps; loops while visible */
(function () {
  var box = document.querySelector('[data-hf]');
  if (!box) return;
  var q = function (s) { return box.querySelectorAll(s); };
  var steps = q('[data-hf-step]'), links = q('[data-hf-link]'), panes = q('[data-hf-pane]'), dots = q('[data-hf-dot]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // stage: 0 step1 · 1 link1 · 2 step2 · 3 link2 · 4 step3 · 5 hold
  var DUR = [5200, 900, 5200, 900, 6000, 1800], stage = -1, timer = null;
  box.style.setProperty('--hx-dur', DUR[0] + 'ms');
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };
  function paint() {
    var active = Math.min(2, Math.floor(stage / 2));
    var flowing = stage % 2 === 1 && stage < 5;
    each(steps, function (s, i) {
      s.classList.toggle('is-on', !flowing && stage < 5 && i === active);
      s.classList.toggle('is-done', i < active || (flowing && i === active) || stage === 5);
    });
    each(panes, function (p, i) {
      var show = flowing ? i === active : i === active;
      p.classList.toggle('is-show', show);
      p.classList.toggle('is-on', show && !flowing && stage < 5);
      p.classList.toggle('is-done', show && (flowing || stage === 5));
    });
    each(dots, function (d, i) { d.classList.toggle('is-on', i === active); });
    each(links, function (l, i) {
      l.classList.toggle('is-flow', stage === i * 2 + 1);
      l.classList.toggle('is-done', stage > i * 2 + 1 && stage < 5);
    });
    box.style.setProperty('--hx-dur', DUR[stage] + 'ms');
    // the 3D stage (steps3d.js) follows along
    box.__hx = { stage: stage, active: active, flowing: flowing };
    box.dispatchEvent(new CustomEvent('hx:stage', { detail: box.__hx }));
  }
  var st = null, shown = -1; // scroll mode (desktop): the section pins and each scroll shows the next step
  function go(i) {
    if (st) { window.scrollTo({ top: st.start + ((st.end - st.start) * i) / 2, behavior: 'smooth' }); return; }
    clearTimeout(timer);
    each(steps, function (s) { s.classList.remove('is-on', 'is-done'); });
    each(panes, function (p) { p.classList.remove('is-on', 'is-done'); });
    void box.offsetWidth;
    stage = i * 2 - 1;
    next();
  }
  each(steps, function (s, i) {
    s.addEventListener('click', function () { go(i); });
    s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i); } });
  });
  function next() {
    stage = (stage + 1) % DUR.length;
    if (stage === 0) { each(steps, function (s) { s.classList.remove('is-on', 'is-done'); }); each(panes, function (p) { p.classList.remove('is-on', 'is-done'); }); void box.offsetWidth; }
    paint();
    timer = setTimeout(next, DUR[stage]);
  }
  if (reduce) { stage = 5; paint(); return; }
  var ST = window.ScrollTrigger, sec = box.closest('section');
  var desk = window.matchMedia('(min-width: 1024px) and (min-height: 700px)').matches;
  // phones: pin too, as long as the compact section fits on screen under the header
  var phoneFit = !desk && sec && sec.offsetHeight <= window.innerHeight - 90;
  if (ST && window.gsap && sec && (desk || phoneFit)) {
    window.gsap.registerPlugin(ST);
    var show = function (i) {
      if (i === shown) return;
      shown = i;
      each(steps, function (s) { s.classList.remove('is-on', 'is-done'); });
      each(panes, function (p) { p.classList.remove('is-on', 'is-done'); });
      void box.offsetWidth;
      stage = i * 2;
      paint();
    };
    // scroll 1 → step 1, scroll 2 → step 2, scroll 3 → step 3, then the page moves on
    st = ST.create({
      trigger: sec,
      start: desk ? function () { return 'top ' + Math.round(88 + Math.max(0, (window.innerHeight - 88 - sec.offsetHeight) / 2)) + 'px'; } : 'top 84px',
      invalidateOnRefresh: true,
      end: function () { return '+=' + Math.round(window.innerHeight * 1.4); },
      pin: true,
      anticipatePin: 1,
      snap: { snapTo: [0, 0.5, 1], duration: { min: 0.25, max: 0.6 }, delay: 0.05, ease: 'power2.inOut' },
      onUpdate: function (self) { show(Math.round(self.progress * 2)); },
    });
    show(0);
    return;
  }
  new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { if (!timer) { stage = -1; next(); } }
    else { clearTimeout(timer); timer = null; }
  }, { threshold: 0.3 }).observe(box);
})();

/* Client stories: prev/next, auto-advances every 7s while visible, pauses on hover */
(function () {
  var box = document.querySelector('[data-cs]');
  if (!box) return;
  var slides = box.querySelectorAll('[data-cs-slide]'), imgs = box.querySelectorAll('[data-cs-img]');
  var each = function (l, fn) { Array.prototype.forEach.call(l, fn); };
  var i = 0, timer = null, visible = false, hover = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(k) {
    i = (k + slides.length) % slides.length;
    each(slides, function (s, j) { s.classList.toggle('is-on', j === i); s.setAttribute('aria-hidden', String(j !== i)); });
    each(imgs, function (s, j) { s.classList.toggle('is-on', j === i); });
  }
  function tick() {
    clearTimeout(timer);
    if (reduce || !visible || hover) return;
    timer = setTimeout(function () { show(i + 1); tick(); }, 7000);
  }
  box.querySelector('[data-cs-prev]').addEventListener('click', function () { show(i - 1); tick(); });
  box.querySelector('[data-cs-next]').addEventListener('click', function () { show(i + 1); tick(); });
  box.addEventListener('mouseenter', function () { hover = true; tick(); });
  box.addEventListener('mouseleave', function () { hover = false; tick(); });
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; tick(); }, { threshold: 0.3 }).observe(box);
})();

/* WhatsApp booking: play the chat once it scrolls into view */
(function () {
  var box = document.querySelector('.wb');
  if (!box) return;
  new IntersectionObserver(function (es, io) { if (es[0].isIntersecting) { box.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.35 }).observe(box);
})();

/* Service "in action": desktop pins and scrolls one topic per step; phones auto-play. Each scene replays while shown. */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-tw]'), function (box) {
    var steps = box.querySelectorAll('[data-tw-step]'), scenes = box.querySelectorAll('[data-tw-scene]'), dots = box.querySelectorAll('.tw-dots span');
    var n = steps.length, cur = -1, replay = null, auto = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var each = function (l, fn) { Array.prototype.forEach.call(l, fn); };
    var play = function (sc) { sc.classList.remove('play'); void sc.getBoundingClientRect(); sc.classList.add('play'); };
    function show(i) {
      if (i === cur) return;
      cur = i;
      each(steps, function (s, j) { s.classList.toggle('is-on', j === i); });
      each(dots, function (d, j) { d.classList.toggle('is-on', j === i); });
      each(scenes, function (s, j) { s.classList.toggle('is-on', j === i); if (j !== i) s.classList.remove('play'); });
      if (!reduce) { play(scenes[i]); clearInterval(replay); replay = setInterval(function () { play(scenes[cur]); }, 4600); }
    }
    var sec = box.closest('section'), ST = window.ScrollTrigger, st = null;
    if (!reduce && n > 1 && ST && window.gsap && sec && window.matchMedia('(min-width: 1024px) and (min-height: 700px)').matches) {
      window.gsap.registerPlugin(ST);
      var snaps = []; for (var k = 0; k < n; k++) snaps.push(k / (n - 1));
      st = ST.create({
        trigger: sec, start: 'center center', pin: true, anticipatePin: 1,
        end: function () { return '+=' + Math.round(window.innerHeight * 0.65 * (n - 1)); },
        snap: { snapTo: snaps, duration: { min: 0.25, max: 0.6 }, delay: 0.05, ease: 'power2.inOut' },
        onUpdate: function (self) { show(Math.round(self.progress * (n - 1))); },
      });
      each(steps, function (s, i) {
        var go = function () { window.scrollTo({ top: st.start + ((st.end - st.start) * i) / (n - 1), behavior: 'smooth' }); };
        s.addEventListener('click', go);
        s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      show(0);
      return;
    }
    // phones / short screens: auto-advance while visible
    box.classList.add('tw-auto');
    var visible = false;
    var tick = function () { clearTimeout(auto); if (!visible || reduce || n < 2) return; auto = setTimeout(function () { show((cur + 1) % n); tick(); }, 5200); };
    each(steps, function (s, i) {
      var go = function () { show(i); tick(); };
      s.addEventListener('click', go);
      s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && cur < 0) show(0); tick(); }, { threshold: 0.3 }).observe(box);
  });
})();

/* Topic sections: each animation plays when it scrolls into view and replays while visible */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('[data-tp-scene]'), function (sc) {
    if (reduce) return;
    var timer = null;
    var play = function () { sc.classList.remove('play'); void sc.getBoundingClientRect(); sc.classList.add('play'); };
    new IntersectionObserver(function (es) {
      clearInterval(timer);
      if (es[0].isIntersecting) { play(); timer = setInterval(play, 4600); }
    }, { threshold: 0.4 }).observe(sc);
  });
})();

/* Topic photos: run the film effect only while on screen */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-fx]'), function (el) {
    new IntersectionObserver(function (es) { el.classList.toggle('is-in', es[0].isIntersecting); }, { threshold: 0.35 }).observe(el);
  });
})();

/* Contact cards: copy phone / email */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (btn) {
    btn.addEventListener('click', function () {
      var v = btn.getAttribute('data-copy');
      var done = function () { btn.classList.add('is-copied'); setTimeout(function () { btn.classList.remove('is-copied'); }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, done);
      else { var t = document.createElement('textarea'); t.value = v; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
    });
  });
})();

/* Service pages: the options section pins and steps through each option as you scroll */
(function () {
  var mq = window.matchMedia('(min-width: 1024px)');
  Array.prototype.forEach.call(document.querySelectorAll('[data-ss]'), function (ss) {
    var steps = ss.querySelectorAll('.ss-step');
    var figs = ss.querySelectorAll('.ss-fig');
    var pin = ss.querySelector('.ss-pin');
    var n = steps.length;
    if (n < 2) return;
    var cur = -1;
    var set = function (i) {
      if (i === cur) return;
      cur = i;
      for (var k = 0; k < n; k++) {
        steps[k].classList.toggle('is-on', k === i);
        steps[k].classList.toggle('is-done', k < i);
        if (figs[k]) figs[k].classList.toggle('is-on', k === i);
      }
      var scene = ss.querySelector('[data-h3]');
      if (scene) { scene.dataset.step = i; scene.dispatchEvent(new CustomEvent('h3:step')); }
    };
    var range = function () { return Math.max(1, ss.offsetHeight - pin.offsetHeight); };
    var update = function () {
      if (!mq.matches) { ss.style.removeProperty('--p'); return; }
      var top = ss.getBoundingClientRect().top;
      var p = Math.min(1, Math.max(0, (104 - top) / range()));
      ss.style.setProperty('--p', p.toFixed(4));
      set(Math.min(n - 1, Math.floor(p * n)));
    };
    var ticking = false;
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    Array.prototype.forEach.call(steps, function (st, i) {
      st.addEventListener('click', function (e) {
        if (!mq.matches || e.target.closest('a')) return;
        var y = window.scrollY + ss.getBoundingClientRect().top - 104 + range() * (i + 0.5) / n;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
    update();
  });
})();

/* How it works: the sun rises when the stage comes into view */
(function () {
  var sun = document.querySelector('.hx-sun');
  if (!sun || !('IntersectionObserver' in window)) { if (sun) sun.classList.add('is-up'); return; }
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { sun.classList.add('is-up'); o.disconnect(); } }, { threshold: 0.35 }).observe(sun.parentNode);
})();

/* Smart glass remote: each switch replays the finger tap, IR beam and glass flash */
(function () {
  var st = document.querySelector('.sm2-stage');
  var rm = st && st.querySelector('.rm2');
  if (!rm) return;
  var last = null;
  new MutationObserver(function () {
    var p = st.classList.contains('is-private');
    if (p === last) return;
    last = p;
    rm.setAttribute('data-press', p ? 'private' : 'clear');
    [rm, st].forEach(function (e) { e.classList.remove('is-tap'); void e.offsetWidth; e.classList.add('is-tap'); });
  }).observe(st, { attributes: true, attributeFilter: ['class'] });
})();

/* Knowledge section: click a topic to show its card; gently auto-advances while visible */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-kn]'), function (box) {
    var tabs = box.querySelectorAll('[data-kn-tab]'), panels = box.querySelectorAll('[data-kn-panel]');
    var i = 0, timer = null, seen = false, hover = false;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(k, fromUser) {
      i = (k + tabs.length) % tabs.length;
      Array.prototype.forEach.call(tabs, function (t, n) { t.classList.toggle('is-on', n === i); t.setAttribute('aria-selected', String(n === i)); });
      Array.prototype.forEach.call(panels, function (p, n) { p.classList.toggle('is-on', n === i); });
      if (fromUser && window.innerWidth < 1024) tabs[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    function tick() {
      clearTimeout(timer);
      box.classList.remove('is-auto'); void box.offsetWidth;
      if (reduce || !seen || hover) return;
      box.classList.add('is-auto');
      timer = setTimeout(function () { show(i + 1); tick(); }, 8000);
    }
    Array.prototype.forEach.call(tabs, function (t, n) { t.addEventListener('click', function () { show(n, true); tick(); }); });
    box.addEventListener('mouseenter', function () { hover = true; tick(); });
    box.addEventListener('mouseleave', function () { hover = false; tick(); });
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; tick(); }, { threshold: 0.3 }).observe(box);
  });
})();

/* Phones: AOS-style reveals across the whole page — headings fade up, the blocks after them slide in
   from the left and right alternately. Skips the hero, pinned step sections and GSAP-driven elements. */
(function () {
  if (window.innerWidth >= 768 || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var main = document.getElementById('main');
  if (!main) return;
  var skip = '[data-a], [data-hero], [data-ss], [data-hf], .ss, .pin-spacer';
  var targets = [];
  Array.prototype.forEach.call(main.children, function (block, bi) {
    if (bi === 0) return; // the hero has its own intro
    Array.prototype.forEach.call(block.querySelectorAll('.container-site'), function (c) {
      if (c.closest(skip) || c.parentElement.closest('.container-site')) return;
      var n = 0;
      Array.prototype.forEach.call(c.children, function (el) {
        if (el.matches(skip) || el.querySelector('[data-ss], [data-hf]')) return;
        // a grid/flex row of cards: reveal each card on its own
        var cs = getComputedStyle(el);
        if (cs.display === 'contents') return; // layout-only wrapper (no box to animate)
        // a grid/flex row of cards: reveal each card on its own — but a sideways-swipe row as one block
        var swipe = /auto|scroll/.test(cs.overflowX);
        var kids = !swipe && el.children.length > 1 && /grid|flex/.test(cs.display) && !el.matches('h1,h2,h3,p,a,ul,ol') ? el.children : [el];
        Array.prototype.forEach.call(kids, function (k) {
          if (k.matches(skip) || getComputedStyle(k).display === 'contents') return;
          var heading = n === 0 || k.matches('h2, h3, .eyebrow') || !!k.querySelector(':scope > h2');
          k.classList.add('aos', heading ? 'aos-up' : (n % 2 ? 'aos-right' : 'aos-left'));
          targets.push(k);
          n++;
        });
      });
    });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('aos-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  targets.forEach(function (t) { io.observe(t); });
})();

/* What to know (phones): Read more opens the full answer */
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('[data-kn-more]');
  if (!b) return;
  var p = b.closest('.kn-panel'), open = !p.classList.contains('is-open');
  p.classList.toggle('is-open', open);
  b.setAttribute('aria-expanded', String(open));
});

/* Portfolio: category filter + lightbox (arrows, swipe, Esc) */
(function () {
  var grid = document.querySelector('[data-pf]');
  if (!grid) return;
  var items = [].slice.call(grid.querySelectorAll('[data-pf-item]'));
  var chips = [].slice.call(document.querySelectorAll('[data-pf-filter]'));
  var box = document.querySelector('[data-pf-box]'), img = box.querySelector('[data-pf-img]'), cap = box.querySelector('[data-pf-cap]');
  var list = items, cur = 0;
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var k = c.dataset.pfFilter;
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      items.forEach(function (it) { it.classList.toggle('is-hidden', k !== 'all' && it.dataset.pfItem !== k); });
      list = items.filter(function (it) { return !it.classList.contains('is-hidden'); });
    });
  });
  function show(i) {
    cur = (i + list.length) % list.length;
    var el = list[cur].querySelector('img');
    img.src = el.dataset.full; img.alt = el.alt;
    cap.textContent = list[cur].querySelector('.pf-tag').textContent + ' · ' + (cur + 1) + ' / ' + list.length;
  }
  function open(i) { show(i); box.hidden = false; document.body.style.overflow = 'hidden'; box.querySelector('[data-pf-close]').focus(); }
  function close() { box.hidden = true; document.body.style.overflow = ''; }
  items.forEach(function (it) { it.addEventListener('click', function () { open(list.indexOf(it)); }); });
  var rtl = document.documentElement.dir === 'rtl';
  box.querySelector('[data-pf-prev]').addEventListener('click', function () { show(cur - 1); });
  box.querySelector('[data-pf-next]').addEventListener('click', function () { show(cur + 1); });
  box.querySelector('[data-pf-close]').addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(cur + (rtl ? -1 : 1));
    if (e.key === 'ArrowLeft') show(cur + (rtl ? 1 : -1));
  });
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(cur + ((dx < 0) !== rtl ? 1 : -1)); x0 = null; });
})();

/* Hero: soft spotlight follows the cursor (desktop, fine pointers only) */
(function heroSpot() {
  var h = document.querySelector('[data-hp]');
  if (!h || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var raf = 0, x = 0, y = 0;
  h.addEventListener('pointermove', function (e) {
    var r = h.getBoundingClientRect(); x = e.clientX - r.left; y = e.clientY - r.top;
    if (!raf) raf = requestAnimationFrame(function () { h.style.setProperty('--mx', x + 'px'); h.style.setProperty('--my', y + 'px'); raf = 0; });
  });
  h.addEventListener('pointerenter', function () { h.classList.add('is-hover'); });
  h.addEventListener('pointerleave', function () { h.classList.remove('is-hover'); });
})();

/* Hero: pause decorative animations when the hero scrolls out of view */
(function heroPause() {
  var h = document.querySelector('[data-hp]');
  if (!h || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (es) { h.classList.toggle('hp-paused', !es[0].isIntersecting); }, { rootMargin: '80px' }).observe(h);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { h.classList.add('hp-paused'); return; } var r = h.getBoundingClientRect(); h.classList.toggle('hp-paused', r.bottom < -80 || r.top > innerHeight + 80); });
})();

/* Blog article: highlight the section you are reading in the side list */
(function postToc() {
  var links = document.querySelectorAll('.pst-toc a[data-toc]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {}; links.forEach(function (a) { map[a.dataset.toc] = a; });
  var set = function (id) { links.forEach(function (a) { a.classList.toggle('is-on', a.dataset.toc === id); }); };
  set(links[0].dataset.toc);
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting && map[e.target.id]) set(e.target.id); });
  }, { rootMargin: '-20% 0px -70% 0px' });
  Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
})();
