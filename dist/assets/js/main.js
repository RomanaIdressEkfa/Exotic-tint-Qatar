// Exotic Tint Qatar — site interactions (no dependencies)
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
    var range = $('[data-shade-range]', lab);
    var overlay = $('[data-tint-overlay]', lab);
    var bars = $$('[data-out="privacy"] span', lab);
    var out = function (k) { return $$('[data-out="' + k + '"]', lab); };
    var render = function () {
      var i = Number(range.value);
      var s = shades[i];
      range.style.setProperty('--fill', (i / (shades.length - 1)) * 100 + '%');
      overlay.style.backgroundColor = 'rgba(10,16,28,' + (((100 - s.v) / 100) * 0.92).toFixed(2) + ')';
      out('vlt').concat(out('vlt2'), out('vlt3')).forEach(function (o) { o.textContent = s.v; });
      out('block').forEach(function (o) { o.textContent = 100 - s.v; });
      out('best').forEach(function (o) { o.textContent = s.best; });
      bars.forEach(function (b, n) { b.className = 'h-2.5 flex-1 rounded-full transition ' + (n < s.privacy ? 'bg-grad' : 'bg-line'); });
    };
    range.addEventListener('input', render);
    render();

    var sceneImg = $('[data-scene-img]', lab);
    var tabs = $$('[data-scene]');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === tab)); });
        sceneImg.style.opacity = '0';
        setTimeout(function () {
          // Keep whatever base path the page was built with (works on GitHub Pages sub-paths too)
          sceneImg.src = sceneImg.getAttribute('src').replace(/[^/]+\.webp$/, tab.getAttribute('data-scene') + '.webp');
          sceneImg.onload = function () { sceneImg.style.opacity = '1'; };
        }, 200);
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
  var badge = document.querySelector('[data-open-status]');
  if (badge) {
    var h;
    try { h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Qatar' }).format(new Date())); }
    catch (e) { h = (new Date().getUTCHours() + 3) % 24; }
    var open = h >= 8 && h < 18;
    badge.querySelector('[data-open-label]').textContent = open ? badge.dataset.open : badge.dataset.closed;
    if (!open) {
      badge.querySelector('[data-open-dot]').style.background = '#f59e0b';
      badge.querySelector('[data-open-ping]').style.display = 'none';
    }
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
  var sv = document.querySelector('[data-sv]');
  if (!sv) return;
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
