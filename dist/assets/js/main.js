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
          sceneImg.src = '/assets/img/' + tab.getAttribute('data-scene') + '.webp';
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
