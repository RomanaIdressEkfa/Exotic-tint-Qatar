// Static site generator: renders every page in English (/) and Arabic (/ar/).
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const C = require('./content');
const POSTS = require('./blog');

const DIST = path.join(__dirname, '..', 'dist');
const LANGS = ['en', 'ar'];

/* ---------------------------------------------------------------- helpers */
let L = 'en';
let QR = '';
const t = (x) => (Array.isArray(x) ? x[L === 'ar' ? 1 : 0] : x);
const tr = (en, ar) => (L === 'ar' ? ar : en);
const base = (lang) => (lang === 'ar' ? '/ar/' : '/');
const href = (p = '') => base(L) + p;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');
const num = (n) => (L === 'ar' ? Number(n).toLocaleString('ar-EG') : String(n));
const waLink = (msg) => `https://wa.me/${C.site.whatsapp}?text=${encodeURIComponent(msg)}`;
const waHello = () => waLink(tr('Hello Exotic Tint for Trading and Contracting, I would like a free quote.', 'مرحباً إكزوتك تينت للتجارة والمقاولات، أرغب في الحصول على عرض سعر مجاني.'));
const reveal = (d = 0) => `data-reveal style="--d:${d}ms"`;
const img3d = (name, cls = 'h-28 w-28') => `<img src="/assets/img/3d/${name}.webp" alt="" class="${cls}" loading="lazy" width="200" height="200">`;

/* ------------------------------------------------------------------ icons */
const P = {
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  frost: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  thermo: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.910a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  badge: '<path d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z"/><path d="m9 12 2 2 4-4"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM2 16l3-8 3 8c-.87.65-1.920 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .01-1 1.03V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
};
const icon = (name, cls = 'h-5 w-5', sw = 1.9) =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
const waIcon = (cls = 'h-5 w-5') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.81-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.9.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.48 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.6C5.76.6.65 5.7.65 11.98c0 2 .52 3.96 1.52 5.69L.55 23.4l5.86-1.54a11.4 11.4 0 0 0 5.62 1.43h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z"/></svg>`;
const fbIcon = (cls = 'h-5 w-5') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.6V14h2.7v8h3.2z"/></svg>`;
const ttIcon = (cls = 'h-5 w-5') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 5 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.3-1.6z"/></svg>`;
const fmtDate = (d) => new Date(d).toLocaleDateString(L === 'ar' ? 'ar-QA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const starsRow = (cls = 'h-4 w-4') =>
  `<span class="inline-flex gap-0.5 text-gold-500" aria-label="5/5">${('<svg class="' + cls + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + P.star + '</svg>').repeat(5)}</span>`;
const arrow = (cls = 'h-4 w-4') => icon('arrow', cls + ' rtl:-scale-x-100', 2.2);

// Drifting colour blobs behind glass surfaces (animated by GSAP)
const aurora = (tone = '') => `<div class="aurora ${tone}" aria-hidden="true"><span></span><span></span><span></span></div>`;

/* Per-service visual identity (pastel card + accent + 3D emoji) */
const SV = {
  'architectural-window-film-solutions': { emoji: 'office', bg: 'linear-gradient(160deg,#EAF5FF 0%,#F4F9FF 100%)', acc: 'linear-gradient(135deg,#3592EF,#0553A3)', on: '#fff', color: '#0666C7', badge: ['Up to 98% heat blocked', 'حجب حتى ٩٨٪ من الحرارة'] },
  'smart-glass-privacy-solutions': { emoji: 'voltage', bg: 'linear-gradient(160deg,#E8EBF6 0%,#F8F9FD 100%)', acc: 'linear-gradient(135deg,#2A4066,#12233D)', on: '#fff', color: '#1D3150', badge: ['Clear ↔ private in a second', 'شفاف ↔ خاص في ثانية'] },
  'surface-protection-solutions': { emoji: 'rock', bg: 'linear-gradient(160deg,#F4ECE3 0%,#FCFAF7 100%)', acc: 'linear-gradient(135deg,#C9A27A,#8A6440)', on: '#fff', color: '#8A6440', badge: ['Invisible finish', 'لمسة غير مرئية'] },
  'decorative-interior-solutions': { emoji: 'sparkles', bg: 'linear-gradient(160deg,#E1F5F3 0%,#F5FCFB 100%)', acc: 'linear-gradient(135deg,#2DD4BF,#0F766E)', on: '#fff', color: '#0F766E', badge: ['Any design or logo', 'أي تصميم أو شعار'] },
  'fabric-material-protection': { emoji: 'couch', bg: 'linear-gradient(160deg,#EFE9FF 0%,#FBF9FF 100%)', acc: 'linear-gradient(135deg,#A78BFA,#6D28D9)', on: '#fff', color: '#6D28D9', badge: ['Spill-proof fabric', 'أقمشة مقاومة للانسكاب'] },
};

/* ------------------------------------------------------------------- logo */
// The company logo: white-background version on light surfaces, transparent version on dark ones.
const logo = (size = 'md', dark = false) =>
  `<img src="/assets/img/logo-${dark ? 'dark' : 'light'}.webp" alt="${esc(t(C.site.name))}" class="${size === 'lg' ? 'h-24' : 'h-[64px]'} w-auto" width="270" height="240">`;
const mark = (cls = 'h-9 w-9') => `<span class="grid ${cls} shrink-0 place-items-center rounded-full bg-ink p-1"><img src="/assets/img/logo-mark.webp" alt="" class="h-full w-full object-contain"></span>`;

/* Room control bar: temperature · film toggle · UV — one slim glass dock under the 3D room */
const roomDock = (gid) => `
      <div class="absolute inset-x-0 bottom-[2%] flex justify-center px-2">
        <div class="room-dock room-hud flex items-center gap-1 rounded-full p-1.5 sm:gap-2" data-r-card>
          <div class="flex items-center gap-2 ps-2.5 pe-1 sm:ps-3.5 sm:pe-2" title="${tr('Room temperature', 'حرارة الغرفة')}">
            ${icon('thermo', 'h-4 w-4 text-rose-500', 2.2)}
            <div class="leading-none">
              <p class="font-head text-lg font-extrabold text-ink sm:text-xl" dir="ltr"><span data-r-temp>46</span><span class="text-xs text-muted">°C</span></p>
              <div class="mt-1 h-1 w-10 overflow-hidden rounded-full bg-line sm:w-12"><div class="room-tbar h-full rounded-full" data-r-bar style="width:90%"></div></div>
            </div>
          </div>
          <span class="h-7 w-px bg-line"></span>
          <div class="flex" role="group" aria-label="${tr('Window film', 'فيلم النوافذ')}">
            <button type="button" class="room-btn" data-r-mode="off" aria-pressed="true">${icon('sun', 'h-4 w-4', 2.2)}<span class="hidden min-[420px]:inline">${tr('Without film', 'بدون فيلم')}</span></button>
            <button type="button" class="room-btn" data-r-mode="on" aria-pressed="false">${icon('shield', 'h-4 w-4', 2.2)}<span class="hidden whitespace-nowrap min-[420px]:inline">${tr('With Exotic Tint', 'مع إكزوتك تينت')}</span></button>
          </div>
          <span class="h-7 w-px bg-line"></span>
          <div class="flex items-center gap-1.5 pe-2.5 ps-1 sm:pe-3.5 sm:ps-2" title="${tr('UV blocked', 'حجب الأشعة')}">
            <svg class="h-7 w-7 -rotate-90" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19" fill="none" stroke="#eceef3" stroke-width="7"/><circle cx="24" cy="24" r="20" fill="none" stroke="url(#${gid})" stroke-width="7" stroke-linecap="round" stroke-dasharray="125.66" stroke-dashoffset="125.66" data-r-ring/><defs><linearGradient id="${gid}"><stop stop-color="#3592EF"/><stop offset="1" stop-color="#0553A3"/></linearGradient></defs></svg>
            <p class="leading-none"><span class="font-head text-lg font-extrabold text-ink sm:text-xl" dir="ltr"><span data-r-uv>0</span>%</span><span class="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-muted">UV</span></p>
          </div>
          <span class="sr-only" aria-live="polite" data-r-state data-on="${tr('With Exotic Tint film', 'مع فيلم إكزوتك تينت')}" data-off="${tr('Direct sun · no film', 'شمس مباشرة · بدون فيلم')}">${tr('Direct sun · no film', 'شمس مباشرة · بدون فيلم')}</span>
        </div>
      </div>`;

/* ------------------------------------------------------------------ pages */
const PAGES = [
  { key: 'home', path: '' },
  { key: 'about', path: 'about/' },
  { key: 'services', path: 'service/' },
  ...C.services.map((s) => ({ key: 'service', path: `service/${s.slug}/`, service: s })),
  { key: 'reviews', path: 'reviews/' },
  { key: 'blogs', path: 'blogs/' },
  ...POSTS.map((p) => ({ key: 'post', path: `${p.slug}/`, post: p })),
  { key: 'contact', path: 'contact/' },
];

/* ----------------------------------------------------------------- layout */
function head(page, meta) {
  const canonical = C.site.domain + base(L) + page.path;
  return `<!doctype html>
<html lang="${L}" dir="${L === 'ar' ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<meta name="theme-color" content="#ffffff">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${C.site.domain}/${page.path}">
<link rel="alternate" hreflang="ar" href="${C.site.domain}/ar/${page.path}">
<link rel="alternate" hreflang="x-default" href="${C.site.domain}/${page.path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(t(C.site.name))}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${C.site.domain}/assets/img/${meta.image || 'residential'}.webp">
<meta property="og:locale" content="${L === 'ar' ? 'ar_QA' : 'en_QA'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Urbanist:wght@500;600;700;800;900${L === 'ar' ? '&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700' : ''}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/app.css">
<script>(function(d){d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('gsap-ready');setTimeout(function(){if(!window.__gsapOn)d.classList.remove('gsap-ready')},4000)}})(document.documentElement)</script>
${(page.key === 'home' || (page.service && page.service.slug === 'architectural-window-film-solutions')) ? '<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>' : ''}
${meta.jsonld ? `<script type="application/ld+json">${JSON.stringify(meta.jsonld)}</script>` : ''}
</head>`;
}

function header(page) {
  const other = L === 'en' ? 'ar' : 'en';
  const cur = (k) => (page.key === k ? ' aria-current="page"' : '');
  const megaItems = C.services
    .map(
      (s) => `<a href="${href('service/' + s.slug + '/')}" class="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-tint">
        <span class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style="background:${SV[s.slug].bg}">${img3d(SV[s.slug].emoji, 'h-10 w-10')}</span>
        <span><span class="block font-head text-[1.02rem] font-bold text-ink group-hover:text-gold-700">${t(s.title)}</span><span class="block text-sm text-muted">${t(s.short)}</span></span>
      </a>`
    )
    .join('');
  return `
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">${t(C.ui.skip)}</a>

<div class="hidden border-b border-line bg-tint-2 lg:block">
  <div class="container-site flex h-10 items-center justify-between text-[13px] text-muted">
    <p class="flex items-center gap-2"><span class="grid h-5 w-5 place-items-center rounded-md bg-grad text-white">${icon('bolt', 'h-3 w-3', 2.4)}</span><b class="font-bold text-ink">${tr('Free on-site estimates.', 'تقدير مجاني في موقعك.')}</b> ${tr('Premium tint & protective films across Qatar.', 'أفلام تظليل وحماية فاخرة في جميع أنحاء قطر.')}</p>
    <div class="flex items-center gap-5">
      <span class="flex items-center gap-1.5">${icon('clock', 'h-3.5 w-3.5 text-gold-600')} ${t(C.site.hours)}</span>
      <a href="tel:${C.site.phoneRaw}" class="flex items-center gap-1.5 font-semibold text-ink hover:text-gold-700">${icon('phone', 'h-3.5 w-3.5 text-gold-600')} <span dir="ltr">${C.site.phone}</span></a>
    </div>
  </div>
</div>

<header id="site-header" class="nav-wrap sticky top-0 z-50 bg-white">
  <div class="container-site relative flex h-[84px] items-center justify-between gap-4">
    <a href="${href()}" class="shrink-0" aria-label="${esc(t(C.site.name))}">${logo()}</a>
    <nav class="nav-pill hidden items-center p-1.5 lg:flex" aria-label="Primary">
      <a href="${href()}" class="nav-link"${cur('home')}>${t(C.ui.nav.home)}</a>
      <div class="has-mega" data-mega>
        <button type="button" class="nav-link" aria-expanded="false" data-mega-btn${page.key === 'service' || page.key === 'services' ? ' aria-current="page"' : ''}>${t(C.ui.nav.services)} ${icon('chevron', 'chev h-4 w-4')}</button>
        <div class="mega" data-mega-panel>
          <div class="container-site grid gap-8 py-8 lg:grid-cols-12">
            <div class="lg:col-span-8">
              <p class="mb-3 px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-gold-700">${tr('Our services', 'خدماتنا')}</p>
              <div class="grid grid-cols-2 gap-1">${megaItems}</div>
            </div>
            <div class="relative overflow-hidden rounded-[22px] p-7 navy-bg lg:col-span-4">
              <div class="relative">
                <span class="chip-dot !border-white/20 !bg-white/10 !text-gold-300">${tr('Free estimate', 'تقدير مجاني')}</span>
                <h4 class="mt-4 font-head text-2xl font-extrabold leading-tight text-white">${tr('Not sure which film you need?', 'لست متأكداً من الفيلم المناسب؟')}</h4>
                <p class="mt-2 text-sm text-white/70">${tr('Send a photo on WhatsApp — we reply with a flat-rate quote.', 'أرسل صورة عبر واتساب — ونرد بعرض سعر ثابت.')}</p>
                <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-primary mt-6 !py-3 text-sm">${waIcon('h-4 w-4')} ${t(C.ui.whatsapp)}</a>
              </div>
              ${img3d('sparkles', 'absolute -bottom-4 end-2 h-24 w-24 opacity-90')}
            </div>
          </div>
        </div>
      </div>
      <a href="${href('about/')}" class="nav-link"${cur('about')}>${t(C.ui.nav.about)}</a>
      <a href="${href('reviews/')}" class="nav-link"${cur('reviews')}>${tr('Reviews', 'التقييمات')}</a>
      <a href="${href('blogs/')}" class="nav-link"${page.key === 'blogs' || page.key === 'post' ? ' aria-current="page"' : ''}>${tr('Blog', 'المدونة')}</a>
      <a href="${href('contact/')}" class="nav-link"${cur('contact')}>${t(C.ui.nav.contact)}</a>
    </nav>
    <div class="flex items-center gap-2.5">
      <a href="${base(other)}${page.path}" hreflang="${other}" lang="${other}" class="hidden items-center gap-2 rounded-full px-3 py-2 font-semibold text-ink transition hover:text-gold-700 sm:inline-flex ${other === 'ar' ? 'font-arabic' : ''}"><span class="grid h-9 w-9 place-items-center rounded-full bg-[#f2f4f7]">${icon('globe', 'h-4 w-4')}</span><span class="lg:hidden xl:inline">${t(C.ui.langSwitch)}</span></a>
      <a href="${href('contact/')}#quote" class="btn btn-dark hidden !px-6 !py-3 md:inline-flex">${t(C.ui.quote)}</a>
      <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-outline hidden !py-3 xl:inline-flex">${waIcon('h-4 w-4 text-[#25D366]')} WhatsApp</a>
      <button type="button" id="menu-open" class="grid h-11 w-11 place-items-center rounded-xl bg-[#f2f4f7] text-ink lg:hidden" aria-label="${t(C.ui.menu)}" aria-expanded="false" aria-controls="drawer">${icon('menu', 'h-5 w-5', 2.2)}</button>
    </div>
  </div>
</header>

<div id="drawer-backdrop" class="drawer-backdrop fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm lg:hidden"></div>
<aside id="drawer" class="drawer fixed inset-y-0 end-0 z-[70] flex w-[88%] max-w-sm flex-col bg-white shadow-2xl lg:hidden" aria-hidden="true">
  <div class="flex h-[84px] items-center justify-between border-b border-line px-5">
    ${logo()}
    <button type="button" id="menu-close" class="grid h-10 w-10 place-items-center rounded-xl bg-[#f2f4f7] text-ink" aria-label="${t(C.ui.close)}">${icon('x', 'h-5 w-5', 2.2)}</button>
  </div>
  <div class="flex-1 overflow-y-auto px-5 py-5">
    <a href="${href()}" class="block rounded-xl px-3 py-3 font-head text-lg font-bold text-ink hover:bg-tint">${t(C.ui.nav.home)}</a>
    <p class="mt-3 px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-gold-700">${t(C.ui.nav.services)}</p>
    <div class="mt-2 grid gap-1">
      ${C.services.map((s) => `<a href="${href('service/' + s.slug + '/')}" class="flex items-center gap-3 rounded-xl p-2 hover:bg-tint"><span class="grid h-10 w-10 place-items-center rounded-xl" style="background:${SV[s.slug].bg}">${img3d(SV[s.slug].emoji, 'h-7 w-7')}</span><span class="font-semibold text-ink">${t(s.title)}</span></a>`).join('')}
    </div>
    <a href="${href('about/')}" class="mt-3 block rounded-xl px-3 py-3 font-head text-lg font-bold text-ink hover:bg-tint">${t(C.ui.nav.about)}</a>
    <a href="${href('reviews/')}" class="block rounded-xl px-3 py-3 font-head text-lg font-bold text-ink hover:bg-tint">${tr('Reviews', 'التقييمات')}</a>
    <a href="${href('blogs/')}" class="block rounded-xl px-3 py-3 font-head text-lg font-bold text-ink hover:bg-tint">${tr('Blog', 'المدونة')}</a>
    <a href="${href('contact/')}" class="block rounded-xl px-3 py-3 font-head text-lg font-bold text-ink hover:bg-tint">${t(C.ui.nav.contact)}</a>
    <a href="${base(other)}${page.path}" class="mt-2 flex items-center gap-2 rounded-xl px-3 py-3 font-semibold text-ink hover:bg-tint ${other === 'ar' ? 'font-arabic' : ''}">${icon('globe', 'h-4 w-4')} ${t(C.ui.langSwitch)}</a>
  </div>
  <div class="grid gap-2 border-t border-line p-5">
    <a href="${href('contact/')}#quote" class="btn btn-dark w-full">${t(C.ui.quote)}</a>
    <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-outline w-full">${waIcon('h-4 w-4 text-[#25D366]')} ${t(C.ui.whatsapp)}</a>
  </div>
</aside>`;
}

// Footer "Let's talk": each letter waves (Arabic waves per word so the script stays joined)
function wavy(text) {
  const parts = L === 'ar' ? text.split(/(\s+)/) : [...text];
  let i = 0;
  return parts
    .map((ch) => (/^\s+$/.test(ch) ? '<span class="inline-block w-[0.28em]"></span>' : `<span class="wavy-char" style="--i:${i++}">${ch}</span>`))
    .join('');
}
// Line that slides up out of a mask when the footer comes into view
const reveal2 = (html, d = 0) => `<span class="reveal-wrap"><span class="reveal-content" style="--d:${d}ms">${html}</span></span>`;

function footer() {
  const other = L === 'en' ? 'ar' : 'en';
  const head = (txt) => `<h3 class="text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-white/40">${txt}</h3>`;
  const link = ([label, url]) =>
    `<li><a href="${url}" class="group inline-flex items-center text-[0.93rem] text-white/75 transition hover:text-white"><span class="h-px w-0 bg-gold-400 transition-all duration-300 group-hover:me-2 group-hover:w-3"></span>${label}</a></li>`;
  const follow = (url, label, ic, bg) =>
    `<a href="${url}" target="_blank" rel="noopener" class="group relative flex items-center justify-between overflow-hidden border border-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:border-transparent" style="--b:${bg}">
      <span class="absolute inset-0 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 rtl:origin-right" style="background:var(--b)"></span>
      <span class="relative">${label}</span><span class="relative text-white/60 transition group-hover:text-white">${ic}</span>
    </a>`;
  const colCls = 'f-up py-8 lg:py-10';
  return `
<footer class="relative mt-6 overflow-hidden bg-ink text-white" data-footer>
  <div class="pointer-events-none absolute inset-0 grid-lines-dark opacity-40"></div>
  <div class="pointer-events-none absolute -top-32 start-0 h-72 w-[40rem] rounded-full bg-gold-500/15 blur-[110px]"></div>
  <div class="f-topline pointer-events-none absolute inset-x-0 top-0 h-px"></div>

  <div class="container-site relative">
    <!-- Let's talk -->
    <div class="flex flex-col gap-7 pb-8 pt-12 lg:flex-row lg:items-end lg:justify-between lg:pb-10 lg:pt-14">
      <div>
        <p class="text-[0.7rem] font-extrabold uppercase tracking-[0.3em] text-gold-400">${reveal2(tr('Premium tint &amp; protection · Qatar', 'تظليل وحماية فاخرة · قطر'))}</p>
        <p class="mt-2 font-head text-[2.8rem] font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl" aria-label="${tr('Let’s talk', 'لنتحدث')}"><span aria-hidden="true">${wavy(tr('Let’s talk', 'لنتحدث'))}</span></p>
        <p class="mt-4 max-w-2xl font-head text-xl font-medium leading-snug text-white sm:text-2xl md:text-[2rem]">${reveal2(tr('Cooler homes, brighter offices,', 'منازل أبرد، مكاتب أكثر إشراقاً،'), 150)} ${reveal2('<span class="premium-text-shine font-extrabold">' + tr('protected surfaces.', 'وأسطح محمية.') + '</span>', 300)}</p>
      </div>
      <div class="f-up flex flex-col items-start gap-2.5 lg:items-end" style="--d:400ms">
        <a href="${waHello()}" target="_blank" rel="noopener" class="group inline-flex items-center gap-6 bg-white px-6 py-4 font-head text-lg font-bold text-ink transition hover:bg-gold-300">${tr('Get a free quote', 'احصل على عرض سعر مجاني')} <span class="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">${arrow('h-5 w-5')}</span></a>
        <p class="text-sm text-white/45">${tr('Reply within minutes on WhatsApp.', 'نرد خلال دقائق عبر واتساب.')}</p>
      </div>
    </div>

    <!-- columns -->
    <div class="grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
      <div class="${colCls} col-span-2 border-b border-white/10 pe-6 md:col-span-1 lg:border-b-0 lg:pe-8">
        ${head(tr('Contact', 'التواصل'))}
        <a href="${href()}" class="mt-4 inline-block" aria-label="${esc(t(C.site.name))}">${logo('md', true)}</a>
        <p class="mt-3 font-head text-lg font-bold">${t(C.site.address)}</p>
        <p class="text-sm text-white/50">${tr('On-site service across Qatar', 'خدمة في الموقع في كل قطر')}</p>
        <a href="mailto:${C.site.email}" class="mt-3 block break-all font-semibold text-white transition hover:text-gold-300">${C.site.email}</a>
        <a href="tel:${C.site.phoneRaw}" class="mt-1 block text-sm font-bold text-white/60 transition hover:text-gold-300" dir="ltr">${C.site.phone}</a>
      </div>
      <div class="${colCls} border-white/10 pe-4 md:border-b md:border-s md:ps-8 lg:border-b-0 lg:px-8">
        ${head(t(C.ui.nav.services))}
        <ul class="mt-5 space-y-2.5">${C.services.map((s) => link([t(s.title), href('service/' + s.slug + '/')])).join('')}</ul>
      </div>
      <div class="${colCls} border-s border-white/10 ps-5 md:border-s-0 md:ps-0 lg:border-s lg:px-8">
        ${head(tr('Company', 'الشركة'))}
        <ul class="mt-5 space-y-2.5">${[[t(C.ui.nav.home), href()], [t(C.ui.nav.about), href('about/')], [tr('Reviews', 'التقييمات'), href('reviews/')], [tr('Blog', 'المدونة'), href('blogs/')], [t(C.ui.nav.contact), href('contact/')]].map(link).join('')}</ul>
      </div>
      <div class="${colCls} col-span-2 border-t border-white/10 md:col-span-1 md:border-s md:border-t-0 md:ps-8">
        ${head(tr('Follow us', 'تابعنا'))}
        <div class="mt-5 grid grid-cols-2 gap-2 md:grid-cols-1">
          ${follow(C.site.instagram, 'Instagram', icon('instagram', 'h-4 w-4'), 'linear-gradient(90deg,#f9ce34,#ee2a7b,#6228d7)')}
          ${follow(C.site.facebook, 'Facebook', fbIcon('h-4 w-4'), '#1877F2')}
          ${follow(C.site.tiktok, 'TikTok', ttIcon('h-4 w-4'), '#111')}
          ${follow('https://wa.me/' + C.site.whatsapp, 'WhatsApp', waIcon('h-4 w-4'), '#1fa855')}
        </div>
      </div>
    </div>
  </div>

  <!-- bottom bar over a giant faint wordmark -->
  <div class="relative border-t border-white/10">
    <p class="f-wordmark pointer-events-none absolute -bottom-[0.18em] left-1/2 select-none whitespace-nowrap text-center font-head text-[17vw] font-black uppercase leading-none tracking-tight lg:text-[11rem] ${L === 'ar' ? 'font-arabic' : ''}" aria-hidden="true">${tr('Exotic Tint', 'إكزوتك تينت')}</p>
    <div class="container-site relative flex flex-col items-center justify-between gap-4 pb-24 pt-6 text-sm md:flex-row md:py-6">
      <p class="text-center text-white/45 md:text-start">© <span data-year>2026</span> ${t(C.site.name)}. ${t(C.ui.rights)}</p>
      <div class="flex flex-wrap items-center justify-center gap-2.5">
        <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/80" data-open-status data-open="${tr('Open now', 'مفتوح الآن')}" data-closed="${tr('Closed · opens 8 AM', 'مغلق · نفتح ٨ ص')}">
          <span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" data-open-ping></span><span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" data-open-dot></span></span><span data-open-label>${tr('Open daily', 'مفتوح يومياً')}</span>
        </span>
        <a href="${base(other)}" hreflang="${other}" class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 font-semibold text-white/80 transition hover:border-gold-400/50 hover:text-white ${other === 'ar' ? 'font-arabic' : ''}">${icon('globe', 'h-4 w-4')} ${t(C.ui.langSwitch)}</a>
        <button type="button" class="relative grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white transition hover:bg-white/[0.12]" data-to-top aria-label="${tr('Back to top', 'العودة للأعلى')}">
          <svg class="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="2"/><circle cx="22" cy="22" r="20" fill="none" stroke="#0878E8" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.66" stroke-dashoffset="125.66" data-top-ring/></svg>
          ${icon('arrow', 'relative h-4 w-4 -rotate-90', 2.4)}
        </button>
      </div>
    </div>
  </div>
</footer>

<a href="${waHello()}" target="_blank" rel="noopener" aria-label="${t(C.ui.whatsapp)}" class="fixed bottom-5 end-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_-8px_rgba(37,211,102,.7)] transition hover:scale-105">
  <span class="ping-soft absolute inset-0 rounded-full bg-[#25D366]"></span>${waIcon('relative h-7 w-7')}
</a>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="/assets/js/main.js" defer></script>
<script src="/assets/js/motion.js" defer></script>
</body>
</html>`;
}

const layout = (page, meta, body) => `${head(page, meta)}
<body>
${header(page)}
<main id="main">
${body}
</main>
${page.key === 'home' || (page.service && page.service.slug === 'architectural-window-film-solutions') ? footer().replace('</body>', '<script type="module" src="/assets/js/room3d.js"></script>\n</body>') : footer()}`;

/* --------------------------------------------------------------- sections */
function sectionHead({ eyebrow, title, text, center = false, dark = false }) {
  return `<div class="${center ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}" ${reveal()}>
    <span class="eyebrow ${center ? 'center' : ''} ${dark ? '!text-gold-300' : ''}">${eyebrow}</span>
    <h2 class="mt-4 text-balance font-head text-[1.85rem] font-extrabold leading-[1.12] min-[400px]:text-[2.1rem] sm:text-[2.6rem] lg:text-[2.9rem] ${dark ? 'text-white' : 'text-ink'}">${title}</h2>
    ${text ? `<p class="mt-4 text-[1.08rem] leading-relaxed ${dark ? 'text-white/70' : 'text-muted'}">${text}</p>` : ''}
  </div>`;
}

function archVisual({ image, alt, top, bottom }) {
  return `
  <div class="relative mx-auto w-full max-w-[440px] py-6" data-parallax>
    <div class="orbit orbit-spin inset-[-6%] hidden sm:block" data-a="orbit"></div>
    <div class="orbit orbit-spin-rev inset-[-16%] hidden opacity-60 sm:block" data-a="orbit"></div>
    <span class="absolute start-[2%] top-[12%] text-2xl text-gold-500" data-a="pop" data-depth="18">✦</span>
    <span class="absolute bottom-[18%] end-[-2%] h-3 w-3 rounded-full bg-gold-400" data-a="pop" data-depth="-14"></span>
    <div class="arch relative aspect-[4/5]" data-a="arch">
      <img src="/assets/img/${image}.webp" alt="${esc(alt)}" class="h-full w-full object-cover" fetchpriority="high" data-arch-img>
    </div>
    ${top ? `<div class="absolute end-[-2%] top-[14%] z-10 xl:end-[-10%]" data-a="fly-tr" data-depth="26"><div class="float-chip floaty flex items-center gap-3 p-3 pe-5">${top}</div></div>` : ''}
    ${bottom ? `<div class="absolute bottom-[14%] start-[-2%] z-10 xl:start-[-10%]" data-a="fly-bl" data-depth="-22"><div class="float-chip floaty-2 flex items-center gap-3 p-3 pe-5">${bottom}</div></div>` : ''}
  </div>`;
}

function hero() {
  return `
<section class="px-2.5 sm:px-3">
  <div class="hero-bg relative overflow-hidden rounded-[28px]" data-hero>
    ${aurora()}
    <div class="pointer-events-none absolute inset-0 grid-lines"></div>
    <div class="container-site relative grid items-center gap-6 pb-48 pt-10 lg:grid-cols-12 lg:gap-4 lg:pb-52 lg:pt-6">
      <!-- copy (kept short) -->
      <div class="lg:col-span-5">
        <span class="chip" data-a="left"><span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-white">${icon('sun', 'h-4 w-4', 2.2)}</span>${tr('Window tint · Qatar', 'تظليل النوافذ · قطر')}</span>
        <h1 class="mt-6 font-head text-[2.6rem] font-extrabold leading-[1.02] text-ink min-[400px]:text-[3rem] sm:text-[4rem] lg:text-[3.6rem] xl:text-[4.6rem]">
          <span class="block" data-split>${tr('Stay cool.', 'برودة دائمة.')}</span>
          <span class="block text-grad" data-a="up">${tr('Stay protected.', 'حماية تامة.')}</span>
        </h1>
        <p class="mt-5 max-w-md text-[1.1rem] leading-relaxed text-muted" data-a="up">${tr('Window film, smart glass and surface protection for villas, offices and buildings — installed on-site across Qatar.', 'أفلام نوافذ وزجاج ذكي وحماية أسطح للفلل والمكاتب والمباني — نركّبها في موقعك في أنحاء قطر.')}</p>
        <div class="mt-8 flex flex-wrap gap-3" data-a="up">
          <a href="#quote" class="btn btn-primary">${t(C.ui.quote)} ${arrow()}</a>
          <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-white">${waIcon('h-5 w-5 text-[#25D366]')} WhatsApp</a>
        </div>
      </div>

      <!-- 3D room -->
      <div class="relative lg:col-span-7" data-a="up">
        <div class="room3d relative aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[11/10]" data-room>
          <div class="pointer-events-none absolute inset-[12%] rounded-full bg-gold-300/30 blur-[80px]"></div>
          <canvas class="relative h-full w-full" aria-label="${tr('3D living room showing window film blocking the sun', 'غرفة ثلاثية الأبعاد توضح حجب فيلم النوافذ للشمس')}" role="img"></canvas>
          <img src="/assets/img/residential.webp" alt="" class="room-fallback-img absolute inset-[8%] hidden h-[84%] w-[84%] rounded-[28px] object-cover shadow-float">

${roomDock('ruv')}
        </div>
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-0">
      <div class="container-site">
        <div class="rounded-t-[28px] bg-white px-4 pb-6 pt-6 sm:px-8" data-a="rise">
          <p class="flex items-center justify-center gap-4 text-center text-sm text-muted"><span class="hidden h-px w-20 bg-line sm:block"></span><span>${tr('Serving <b class="text-ink">homes, offices &amp; businesses</b> across Qatar', 'نخدم <b class="text-ink">المنازل والمكاتب والشركات</b> في جميع أنحاء قطر')}</span><span class="hidden h-px w-20 bg-line sm:block"></span></p>
          <div class="marquee mt-5 overflow-hidden" dir="ltr">
            <div class="marquee-track">
              ${[0, 1]
                .map(() => C.areas.map((a) => `<span class="flex shrink-0 items-center gap-2 font-head text-xl font-bold text-[#a3adbd] ${L === 'ar' ? 'font-arabic' : ''}">${icon('pin', 'h-5 w-5 text-gold-400')}${t(a)}</span>`).join(''))
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function serviceCard(s, { grid = false } = {}) {
  const v = SV[s.slug];
  const i = C.services.indexOf(s);
  return `
<a href="${href('service/' + s.slug + '/')}" class="svc2 group flex flex-col overflow-hidden rounded-[26px] border border-line bg-white p-2 shadow-card transition duration-500 hover:-translate-y-1.5 hover:border-transparent hover:shadow-soft ${grid ? 'h-full' : 'w-[290px] shrink-0 snap-start sm:w-[320px]'}">
  <div class="relative aspect-[4/3] overflow-hidden rounded-[20px]">
    <img src="/assets/img/${s.img}.webp" alt="${esc(t(s.title))}" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy">
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"></div>
    <span class="glass-hud absolute start-3 top-3 grid h-10 w-10 place-items-center rounded-xl text-white">${icon(s.icon, 'h-5 w-5', 2)}</span>
    <span class="absolute end-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-head text-xs font-extrabold text-ink backdrop-blur">${num(pad(i + 1))}</span>
    <span class="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink shadow-sm"><span class="h-1.5 w-1.5 rounded-full bg-gold-500"></span>${t(v.badge)}</span>
  </div>
  <div class="flex flex-1 flex-col px-4 pb-4 pt-5">
    <p class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold-700">${t(s.short)}</p>
    <h3 class="mt-1.5 font-head text-[1.3rem] font-bold leading-snug text-ink">${t(s.title)}</h3>
    <p class="mb-5 mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-muted">${t(s.summary)}</p>
    <div class="mt-auto flex items-center justify-between border-t border-dashed border-line pt-4">
      <span class="text-sm font-bold text-ink transition group-hover:text-gold-700">${t(C.ui.learnMore)}</span>
      <span class="grid h-10 w-10 place-items-center rounded-full bg-[#f2f4f7] text-white transition duration-300 group-hover:bg-grad group-hover:shadow-gold">${arrow('h-4 w-4')}</span>
    </div>
  </div>
</a>`;
}

/* Services overview — five clean cards (photo, icon badge, name); sits above the expanding slider */
function servicesGrid() {
  return `
<section class="pb-20 lg:pb-28" data-assemble>
  <div class="container-site">
    <div class="text-center" data-a="up">
      <span class="eyebrow center">${tr('What we do', 'ماذا نقدم')}</span>
      <h2 class="mt-3 font-head text-[2rem] font-extrabold leading-tight text-ink sm:text-[2.6rem]">${tr('Premium Tinting &amp; <span class="text-grad">Protection Solutions</span>', 'حلول <span class="text-grad">تظليل وحماية فاخرة</span>')}</h2>
    </div>
    <div class="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 [&>*:last-child]:col-span-2 [&>*:last-child]:aspect-[2/1] md:[&>*:last-child]:col-span-1 md:[&>*:last-child]:aspect-[4/5]">
      ${C.services
        .map(
          (s) => `<a href="${href('service/' + s.slug + '/')}" class="group relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-ink shadow-soft ring-1 ring-ink/5 transition duration-500 hover:-translate-y-1.5 hover:shadow-float" data-a="up">
        <img src="/assets/img/${s.img}.webp" alt="${esc(t(s.title))}" class="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-110" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent"></div>
        <span class="glass-hud absolute start-3 top-3 grid h-10 w-10 place-items-center rounded-xl text-white transition duration-300 group-hover:bg-gold-500">${icon(s.icon, 'h-[18px] w-[18px]', 2.2)}</span>
        <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
          <h3 class="font-head text-[1rem] font-bold leading-snug text-white sm:text-[1.08rem]">${t(s.title)}</h3>
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition duration-300 group-hover:bg-gold-500">${arrow('h-3.5 w-3.5')}</span>
        </div>
      </a>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function servicesSlider() {
  const panel = (s, i) => {
    const v = SV[s.slug];
    return `
      <article class="xp-panel ${i === 0 ? 'is-active' : ''}" data-xp-panel tabindex="0" aria-label="${esc(t(s.title))}">
        <img src="/assets/img/${s.img}.webp" alt="" class="xp-img absolute inset-0 h-full w-full object-cover" loading="lazy">
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/5"></div>

        <!-- collapsed -->
        <div class="xp-closed pointer-events-none absolute inset-0 flex flex-col items-center justify-between py-6 text-white">
          <span class="font-head text-sm font-extrabold text-white/80">${num(pad(i + 1))}</span>
          <span class="xp-vtitle font-head text-lg font-bold">${t(s.title)}</span>
          <span class="glass-hud grid h-11 w-11 place-items-center rounded-xl">${icon(s.icon, 'h-5 w-5', 2)}</span>
        </div>

        <!-- expanded -->
        <div class="xp-open absolute inset-0 flex flex-col justify-between p-6 text-white sm:p-8">
          <div class="flex items-start justify-between gap-3">
            <span class="glass-hud inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold">${icon(s.icon, 'h-4 w-4', 2.2)} ${t(s.short)}</span>
            <span class="font-head text-5xl font-extrabold leading-none text-white/25">${num(pad(i + 1))}</span>
          </div>
          <div class="max-w-xl">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-grad px-3 py-1 text-xs font-extrabold text-white"><span class="h-1.5 w-1.5 rounded-full bg-ink"></span>${t(v.badge)}</span>
            <h3 class="mt-4 font-head text-[1.9rem] font-extrabold leading-[1.1] sm:text-[2.6rem]">${t(s.title)}</h3>
            <p class="mt-3 max-w-lg text-[1.02rem] leading-relaxed text-white/80">${t(s.summary)}</p>
            <div class="mt-6 flex flex-wrap gap-3">
              <a href="${href('service/' + s.slug + '/')}" class="btn btn-primary !py-3 text-sm">${t(C.ui.learnMore)} ${arrow()}</a>
              <a href="${waLink(tr('Hello, I would like a quote for ', 'مرحباً، أرغب في عرض سعر لخدمة ') + t(s.title))}" target="_blank" rel="noopener" class="btn btn-glass !py-3 text-sm">${waIcon('h-4 w-4')} ${tr('Free quote', 'عرض مجاني')}</a>
            </div>
            <div class="mt-7 hidden h-[3px] overflow-hidden rounded-full bg-white/20 lg:block"><span class="xp-bar block h-full rounded-full bg-grad"></span></div>
          </div>
        </div>
      </article>`;
  };
  return `
<section id="services" class="relative pb-20 lg:pb-28" data-assemble>
  <div class="container-site">
    <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      ${sectionHead({
        eyebrow: tr('Our services', 'خدماتنا'),
        title: tr('Find the right film for <span class="text-grad">your space</span>', 'اختر الفيلم المناسب <span class="text-grad">لمساحتك</span>'),
        text: tr('Five specialist services for homes, offices, glass and surfaces — installed on-site by our team.', 'خمس خدمات متخصصة للمنازل والمكاتب والزجاج والأسطح — يركّبها فريقنا في موقعك.'),
      })}
      <div class="flex items-center gap-3" data-a="right">
        <span class="font-head text-lg font-extrabold text-ink" dir="ltr"><span data-xp-count>${tr('01', '٠١')}</span><span class="text-[#c7cdd8]"> / ${tr(pad(C.services.length), pad(C.services.length).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]))}</span></span>
        <button type="button" class="grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-ink shadow-card transition hover:-translate-y-0.5" data-xp-prev aria-label="${tr('Previous', 'السابق')}">${icon('arrowLeft', 'h-5 w-5 rtl:-scale-x-100', 2.2)}</button>
        <button type="button" class="grid h-12 w-12 place-items-center rounded-full bg-grad text-white shadow-gold transition hover:-translate-y-0.5" data-xp-next aria-label="${tr('Next', 'التالي')}">${arrow('h-5 w-5')}</button>
      </div>
    </div>
    <div class="xp mt-12" data-xp data-a="up">
      ${C.services.map(panel).join('')}
    </div>
    <div class="mt-8 flex flex-wrap items-center justify-between gap-4">
      <p class="inline-flex items-center gap-3 rounded-full border border-line bg-white px-5 py-3 text-[0.95rem] font-medium text-ink shadow-card"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">${icon('shield', 'h-4 w-4', 2.2)}</span>${tr('Every estimate is free — no hidden fees.', 'كل التقديرات مجانية — دون رسوم خفية.')}</p>
      <a href="${href('service/')}" class="btn btn-white !pe-2">${t(C.ui.nav.allServices)} <span class="grid h-9 w-9 place-items-center rounded-full bg-grad text-white">${arrow('h-4 w-4')}</span></a>
    </div>
  </div>
</section>`;
}

function howItWorks() {
  // Auto-playing flow: step 1 → dots travel → step 2 → dots travel → step 3 → loop
  const wa = waHello();
  const step = (n, title, line, scene) => `
      <div class="hf-step" data-hf-step>
        <div class="hf-scene">${scene}</div>
        <div class="mt-6 text-center">
          <span class="hf-node"><span class="hf-num">${tr('Step', 'الخطوة')} ${num(pad(n))}</span><span class="hf-tick">${icon('check', 'h-3.5 w-3.5', 3)} ${tr('Done', 'تم')}</span></span>
          <h3 class="mt-3 font-head text-[1.45rem] font-extrabold text-ink">${title}</h3>
          <p class="mt-1 text-[0.98rem] text-muted">${line}</p>
        </div>
      </div>`;
  const link = (ic) => `<div class="hf-link" data-hf-link aria-hidden="true"><span class="hf-dots"></span><span class="hf-runner">${icon(ic, 'h-4 w-4', 2.2)}</span></div>`;
  const scene1 = `
    <div class="hf-phone">
      <div class="hf-phone-top"><img src="/assets/img/logo-mark.webp" alt="" class="h-6 w-6 rounded-full bg-ink p-0.5"><span>Exotic Tint<small>${tr('online', 'متصل')}</small></span>${waIcon('ms-auto h-4 w-4')}</div>
      <div class="hf-phone-body">
        <div class="hf-typing"><span></span><span></span><span></span></div>
        <div class="hf-bubble hf-b1">${tr('Villa · 14 windows', 'فيلا · ١٤ نافذة')}</div>
        <div class="hf-bubble hf-b2"><img src="/assets/img/residential.webp" alt="" loading="lazy"></div>
        <div class="hf-seen">${icon('check', 'h-3.5 w-3.5', 3)}${icon('check', 'h-3.5 w-3.5 -ms-2', 3)}</div>
      </div>
    </div>`;
  const opt = (k, l, tag) => `<div class="hf-opt hf-o${k}"><span class="hf-radio"></span><span class="flex-1">${l}</span><span class="hf-tag">${tag}</span></div>`;
  const scene2 = `
    <div class="hf-quote">
      <p class="hf-q-head">${icon('layers', 'h-4 w-4', 2.2)} ${tr('Recommended film', 'الفيلم الموصى به')}</p>
      ${opt(1, tr('Regular tint', 'تظليل عادي'), '30%')}${opt(2, tr('Nano ceramic', 'نانو سيراميك'), '80%')}${opt(3, tr('Super nano ceramic', 'سوبر نانو سيراميك'), '98%')}
      <span class="hf-cursor"><svg viewBox="0 0 24 24" class="h-6 w-6"><path d="M5 3l14 8-6 1.6L10 19z" fill="#071d38" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></span><span class="hf-ripple"></span>
      <div class="hf-price"><span>${tr('Your quote', 'عرض السعر')}</span><b>${icon('wallet', 'h-4 w-4', 2.2)} ${tr('Fixed price', 'سعر ثابت')}</b></div>
    </div>`;
  const scene3 = `
    <div class="hf-room">
      <div class="hf-win"><span class="hf-sun"></span><span class="hf-film"></span><span class="hf-bar"></span><span class="hf-sill"></span><span class="hf-cool">${'<i></i>'.repeat(8)}</span></div>
      <svg class="hf-heat" viewBox="0 0 40 60" aria-hidden="true"><path d="M8 58c-6-8 6-12 0-20s6-12 0-20"/><path d="M20 58c-6-8 6-12 0-20s6-12 0-20"/><path d="M32 58c-6-8 6-12 0-20s6-12 0-20"/></svg>
      <div class="hf-gauge">
        <span class="hf-g-label">${icon('thermo', 'h-3.5 w-3.5', 2.2)} ${tr('Room', 'الغرفة')}</span>
        <span class="hf-temp" dir="ltr"><span class="hf-t1">46°</span><span class="hf-t2">32°</span></span>
        <span class="hf-g-bar"><span></span></span>
      </div>
      <div class="hf-done">${icon('check', 'h-4 w-4', 3)} ${tr('Installed', 'تم التركيب')}</div>
    </div>`;
  return `
<section class="hf-sec relative" data-assemble>
  <div class="hf-glow" aria-hidden="true"><span></span><span></span></div>
  <div class="container-site">
    <div class="text-center" data-a="up">
      <span class="eyebrow center">${tr('How it works', 'كيف نعمل')}</span>
      <h2 class="mt-3 font-head text-[2.1rem] font-extrabold leading-tight text-ink sm:text-[2.9rem]">${tr('3 simple <span class="text-grad">steps</span>', '٣ <span class="text-grad">خطوات بسيطة</span>')}</h2>
    </div>
    <div class="hf-progress mx-auto mt-7 max-w-md" aria-hidden="true"><span data-hf-bar></span></div>
    <div class="hf mt-8 lg:mt-10" data-hf data-a="up">
      ${step(1, tr('Send a photo', 'أرسل صورة'), tr('On WhatsApp, in seconds', 'عبر واتساب في ثوانٍ'), scene1)}
      ${link('chat')}
      ${step(2, tr('Get your film', 'اختر الفيلم'), tr('Fixed price, no surprises', 'سعر ثابت دون مفاجآت'), scene2)}
      ${link('layers')}
      ${step(3, tr('We install', 'نركّب لك'), tr('At your home or office', 'في منزلك أو مكتبك'), scene3)}
    </div>
    <div class="mt-9 text-center" data-a="up"><a href="${wa}" target="_blank" rel="noopener" class="btn btn-primary">${waIcon('h-5 w-5')} ${tr('Start on WhatsApp', 'ابدأ عبر واتساب')}</a></div>
  </div>
</section>`;
}

function difference() {
  return `
<section class="py-20 lg:py-28">
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[28px] border border-[#d3e8fd] bg-gradient-to-br from-tint via-white to-[#EAF5FF] p-6 shadow-glow sm:p-10 lg:p-14">
      <div class="pointer-events-none absolute inset-0 grid-lines opacity-70"></div>
      <div class="relative grid items-center gap-12 lg:grid-cols-2">
        <div class="relative" ${reveal()}>
          <div class="ba relative aspect-[5/4] select-none overflow-hidden rounded-[22px] border-[6px] border-white shadow-float" dir="ltr" data-ba>
            <img src="/assets/img/commercial.webp" alt="${tr('Office glass façade with heat-rejection film', 'واجهة مكتب زجاجية بفيلم عازل للحرارة')}" loading="lazy" class="absolute inset-0 h-full w-full object-cover" style="filter:saturate(.95) brightness(.85) contrast(1.06)">
            <div class="absolute inset-0 bg-sky-950/20 mix-blend-multiply"></div>
            <div class="ba-top absolute inset-0">
              <img src="/assets/img/commercial.webp" alt="" class="absolute inset-0 h-full w-full object-cover" style="filter:brightness(1.18) saturate(1.2) contrast(.92)">
              <div class="absolute inset-0 bg-gradient-to-bl from-orange-300/50 via-amber-200/25 to-transparent mix-blend-screen"></div>
              <span class="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink shadow ${L === 'ar' ? 'font-arabic' : ''}">${tr('Without film', 'بدون فيلم')}</span>
            </div>
            <span class="absolute right-3 top-3 rounded-full bg-grad px-3 py-1.5 text-xs font-bold text-white shadow ${L === 'ar' ? 'font-arabic' : ''}">${tr('With Exotic Tint', 'مع إكزوتك تينت')}</span>
            <div class="ba-handle pointer-events-none absolute inset-y-0 w-1 -translate-x-1/2 bg-white">
              <span class="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-float">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6-6 6 6 6M15 6l6 6-6 6"/></svg>
              </span>
            </div>
            <input type="range" min="0" max="100" value="50" aria-label="${tr('Compare without and with film', 'قارن بدون الفيلم ومعه')}" class="absolute inset-0 h-full w-full cursor-ew-resize opacity-0">
          </div>
          <div class="float-chip floaty absolute -bottom-5 start-4 flex items-center gap-3 p-3 pe-5 sm:-start-5">
            <span class="ico">${icon('sun', 'h-5 w-5', 2.2)}</span>
            <span><span class="block text-xs text-muted">${tr('UV blocked', 'حجب الأشعة')}</span><span class="block font-head text-lg font-extrabold">99%</span></span>
          </div>
        </div>
        <div>
          <span class="chip-dot" ${reveal()}>${tr('See the difference', 'شاهد الفرق')}</span>
          <h2 class="mt-5 font-head text-[2.1rem] font-extrabold leading-[1.1] text-ink sm:text-5xl" ${reveal(60)}>${tr('Less glare.<br><span class="text-grad">Lower bills.</span>', 'وهج أقل.<br><span class="text-grad">فواتير أقل.</span>')}</h2>
          <p class="mt-5 max-w-lg text-[1.08rem] leading-relaxed text-muted" ${reveal(120)}>${tr('Drag the slider. Heat-rejection film tames harsh sunlight, protects interiors from fading and keeps rooms comfortable — while you keep the view.', 'اسحب المؤشر. أفلام العزل الحراري تروّض أشعة الشمس القوية وتحمي التصميم الداخلي من البهتان وتُبقي الغرف مريحة — مع الحفاظ على الإطلالة.')}</p>
          <div class="mt-8 grid gap-3 sm:grid-cols-3" ${reveal(180)}>
            ${[
              ['thermo', tr('Less heat', 'حرارة أقل'), tr('Cooler rooms', 'غرف أبرد')],
              ['eyeoff', tr('Less glare', 'وهج أقل'), tr('Easy on screens', 'مريح للشاشات')],
              ['bolt', tr('Save energy', 'توفير الطاقة'), tr('Lower AC load', 'حمل تكييف أقل')],
            ]
              .map(([ic, a, b]) => `<div class="rounded-2xl border border-line bg-white p-4 shadow-card"><span class="ico !h-10 !w-10">${icon(ic, 'h-[18px] w-[18px]', 2.2)}</span><span class="mt-3 block font-head font-bold text-ink">${a}</span><span class="block text-sm text-muted">${b}</span></div>`)
              .join('')}
          </div>
          <div class="mt-5 flex flex-col items-start gap-5 rounded-[22px] border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center" ${reveal(220)}>
            <div class="relative shrink-0 rounded-2xl border border-line p-2">
              <span class="absolute -start-px -top-px h-4 w-4 rounded-ss-xl border-s-2 border-t-2 border-gold-500"></span>
              <span class="absolute -bottom-px -end-px h-4 w-4 rounded-ee-xl border-b-2 border-e-2 border-gold-500"></span>
              <div class="h-24 w-24">${QR}</div>
            </div>
            <div>
              <p class="font-head text-lg font-bold text-ink">${tr('Chat with a tint expert', 'تحدث مع خبير تظليل')}</p>
              <p class="text-sm text-muted">${tr('Scan the code or tap below — we reply fast.', 'امسح الرمز أو اضغط أدناه — نرد بسرعة.')}</p>
              <a href="${waHello()}" target="_blank" rel="noopener" class="mt-3 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5">${waIcon('h-5 w-5 text-[#25D366]')} ${tr('Open WhatsApp', 'افتح واتساب')}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function tintStudio() {
  const shades = [
    { v: 70, privacy: 1, best: tr('Clear views · homes & offices', 'رؤية واضحة · منازل ومكاتب') },
    { v: 50, privacy: 2, best: tr('Bright rooms with less glare', 'غرف مضيئة بوهج أقل') },
    { v: 35, privacy: 3, best: tr('Balanced everyday comfort', 'راحة يومية متوازنة') },
    { v: 20, privacy: 4, best: tr('Bedrooms & street-facing rooms', 'غرف النوم والغرف المطلة على الشارع') },
    { v: 5, privacy: 5, best: tr('Maximum, full privacy', 'خصوصية قصوى وكاملة') },
  ];
  const scenes = [
    ['home', tr('Home', 'منزل'), 'residential'],
    ['building', tr('Office', 'مكتب'), 'frosted'],
  ];
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      ${sectionHead({
        eyebrow: tr('Tint studio', 'استوديو التظليل'),
        title: tr('Preview your privacy <span class="text-grad">in seconds</span>', 'جرّب مستوى خصوصيتك <span class="text-grad">في ثوانٍ</span>'),
        text: tr('Move the slider to see how each shade looks — lower percentage means more privacy.', 'حرّك المؤشر لترى شكل كل درجة — كلما قلت النسبة زادت الخصوصية.'),
      })}
      <div class="inline-flex w-max rounded-2xl border border-line bg-white p-1.5 shadow-card" role="tablist" data-scenes ${reveal(100)}>
        ${scenes.map(([ic, l, img], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-scene="${img}" class="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-muted transition aria-selected:bg-grad aria-selected:text-white aria-selected:shadow-gold">${icon(ic, 'h-4 w-4', 2.2)} ${l}</button>`).join('')}
      </div>
    </div>
    <div class="mt-10 grid overflow-hidden rounded-[28px] border border-line shadow-soft lg:grid-cols-2" data-tint-lab data-shades='${esc(JSON.stringify(shades))}' data-assemble>
      <div class="relative bg-white p-6 sm:p-10" data-a="left">
        <div class="pointer-events-none absolute inset-0 dots opacity-40 [mask-image:linear-gradient(180deg,#000,transparent_60%)]"></div>
        <div class="relative">
          <div class="flex items-center justify-between gap-4">
            <span class="flex items-center gap-3 font-head text-lg font-bold text-ink"><span class="ico ico-soft !h-10 !w-10">${icon('sun', 'h-[18px] w-[18px]', 2.2)}</span>${tr('Tint shade (VLT)', 'درجة التظليل (VLT)')}</span>
            <span class="rounded-2xl border border-line bg-white px-5 py-2.5 font-head text-xl font-extrabold text-ink shadow-card" dir="ltr"><span data-out="vlt">35</span>%</span>
          </div>
          <input type="range" min="0" max="4" step="1" value="2" class="range mt-8" aria-label="${tr('Tint shade', 'درجة التظليل')}" data-shade-range dir="ltr">
          <div class="mt-3 flex justify-between text-xs font-semibold text-[#9aa5b8]" dir="ltr">${shades.map((s) => `<span>${s.v}%</span>`).join('')}</div>
          <div class="my-8 border-t border-dashed border-line"></div>
          <div class="flex items-center justify-between gap-4">
            <span class="flex items-center gap-3 font-head text-lg font-bold text-ink"><span class="ico ico-soft !h-10 !w-10">${icon('eyeoff', 'h-[18px] w-[18px]', 2.2)}</span>${tr('Privacy level', 'مستوى الخصوصية')}</span>
            <span class="flex w-32 gap-1.5 sm:w-40" data-out="privacy">${'<span class="h-2.5 flex-1 rounded-full bg-line"></span>'.repeat(5)}</span>
          </div>
          <div class="my-8 border-t border-dashed border-line"></div>
          <div class="flex items-center gap-3"><span class="ico ico-soft !h-10 !w-10">${icon('check', 'h-[18px] w-[18px]', 2.4)}</span><span><span class="block text-sm text-muted">${tr('Best for', 'الأنسب لـ')}</span><span class="block font-head text-lg font-bold text-ink" data-out="best">${shades[2].best}</span></span></div>
          <p class="mt-8 flex gap-2 rounded-2xl border border-[#d3e8fd] bg-tint p-4 text-sm text-muted">${icon('info', 'mt-0.5 h-4 w-4 shrink-0 text-gold-700', 2.2)}${tr('Visual preview only. Our ceramic films block 99% of UV in every shade — we help you pick the right one for each room.', 'معاينة بصرية فقط. أفلام السيراميك لدينا تحجب ٩٩٪ من الأشعة بكل الدرجات — ونساعدك على اختيار الأنسب لكل غرفة.')}</p>
        </div>
      </div>
      <div class="relative p-6 sm:p-10 navy-bg" data-a="right">
        <div class="flex items-center gap-2 text-white/80"><span class="font-semibold">${tr('Your preview', 'المعاينة')}</span><span class="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold uppercase text-emerald-300">${tr('Live', 'مباشر')}</span></div>
        <p class="mt-2 font-head text-5xl font-extrabold text-white" dir="ltr"><span data-out="vlt2">35</span>% <span class="text-2xl text-white/60">VLT</span></p>
        <div class="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl border-4 border-white/10">
          <img src="/assets/img/residential.webp" alt="${tr('Tint preview', 'معاينة التظليل')}" class="h-full w-full object-cover transition-opacity duration-300" data-scene-img loading="lazy">
          <div class="absolute inset-0 transition-[background-color] duration-500" data-tint-overlay style="background-color:rgba(10,16,28,.6)"></div>
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
        </div>
        <div class="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] text-sm">
          <div class="flex justify-between border-b border-dashed border-white/10 px-5 py-3.5 text-white/80"><span class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-white/40"></span>${tr('Light let in', 'الضوء النافذ')}</span><b class="text-white" dir="ltr"><span data-out="vlt3">35</span>%</b></div>
          <div class="flex justify-between border-b border-dashed border-white/10 px-5 py-3.5 text-white/80"><span class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-gold-400"></span>${tr('Light blocked', 'الضوء المحجوب')}</span><b class="text-white" dir="ltr"><span data-out="block">65</span>%</b></div>
          <div class="flex justify-between bg-white/[0.05] px-5 py-3.5 font-semibold text-white"><span>${tr('UV blocked', 'الأشعة المحجوبة')}</span><b class="text-gold-300">99%</b></div>
        </div>
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <a href="#quote" class="btn btn-primary">${tr('Get this shade', 'اطلب هذه الدرجة')} ${arrow()}</a>
          <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-glass">${waIcon('h-4 w-4')} ${tr('Ask an expert', 'اسأل خبيراً')}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* Tint explained + money-saved calculator
   Film figures come from the client's article "Super Nano Ceramic vs Nano Ceramic vs Regular Tint".
   Savings model (shown openly on the page):
     saving = monthly spend × cooling share × AC-load reduction
     cooling share: home ≈ 60% of the electricity bill; office ≈ 50%
     AC-load reduction: regular 10%, nano ceramic 20%, super nano ceramic 30% ("up to 30%" in the article) */
function savings() {
  const films = [
    { id: 'regular', name: tr('Regular tint', 'التظليل العادي'), heat: 25, heatTxt: '20–30%', uv: '40–50%', uvN: 45, ac: 10 },
    { id: 'nano', name: tr('Nano ceramic', 'نانو سيراميك'), heat: 75, heatTxt: '70–80%', uv: '99%', uvN: 99, ac: 20 },
    { id: 'super', name: tr('Super nano ceramic', 'سوبر نانو سيراميك'), heat: 94, heatTxt: '90–98%', uv: '99%+', uvN: 99, ac: 30 },
  ];
  const modes = {
    home: { label: tr('My monthly Kahramaa bill', 'فاتورة كهرماء الشهرية'), min: 300, max: 5000, step: 100, val: 1500, share: 60 },
    office: { label: tr('Monthly office electricity bill', 'فاتورة كهرباء المكتب الشهرية'), min: 1000, max: 30000, step: 500, val: 6000, share: 50 },
  };
  const qar = tr('QAR', 'ر.ق');
  return `
<section id="savings" class="pb-20 lg:pb-28" data-assemble>
  <div class="container-site">
    ${sectionHead({
      eyebrow: tr('Tint, explained', 'التظليل ببساطة'),
      title: tr('Darker isn’t cooler. <span class="text-grad">The right film is.</span>', 'الأغمق ليس الأبرد. <span class="text-grad">الفيلم الصحيح هو الأبرد.</span>'),
      text: tr('The shade you choose is about privacy. What cuts the heat — and your electricity bill — is the film technology inside.', 'درجة التظليل تتعلق بالخصوصية. أما ما يخفض الحرارة — وفاتورة الكهرباء — فهو تقنية الفيلم نفسها.'),
      center: true,
    })}
    <div class="mt-12 grid gap-5 lg:grid-cols-12" data-sav data-films='${esc(JSON.stringify(films))}' data-modes='${esc(JSON.stringify(modes))}'>

      <!-- LEFT: what sunlight is made of, and what each film stops -->
      <div class="card p-6 sm:p-8 lg:col-span-7" data-a="left">
        <p class="flex items-center gap-3 font-head text-lg font-bold text-ink"><span class="ico ico-soft !h-10 !w-10">${icon('sun', 'h-[18px] w-[18px]', 2.2)}</span>${tr('What hits your glass', 'ما الذي يصل إلى زجاجك')}</p>
        <div class="mt-5 flex h-12 overflow-hidden rounded-2xl text-xs font-extrabold text-white">
          <div class="flex items-center justify-center bg-gradient-to-r from-ink to-ink-3" style="width:53%">${tr('Heat (infrared) 53%', 'حرارة ٥٣٪')}</div>
          <div class="flex items-center justify-center bg-gradient-to-r from-gold-200 to-gold-50 text-ink" style="width:44%">${tr('Light 44%', 'ضوء ٤٤٪')}</div>
          <div class="flex items-center justify-center bg-gold-500" style="width:3%" title="UV 3%"></div>
        </div>
        <div class="mt-2 grid grid-cols-3 gap-3 text-[13px] leading-snug text-muted">
          <p><b class="text-ink">${tr('Heat', 'الحرارة')}</b> — ${tr('makes rooms hot and the AC work hard.', 'تسخّن الغرف وترهق المكيف.')}</p>
          <p><b class="text-gold-600">${tr('Light', 'الضوء')}</b> — ${tr('what you see. The shade % controls this (privacy).', 'ما تراه. نسبة التظليل تتحكم به (الخصوصية).')}</p>
          <p><b class="text-gold-700">UV</b> — ${tr('burns skin and fades interiors.', 'يحرق البشرة ويُبهت الأثاث.')}</p>
        </div>

        <div class="my-7 border-t border-dashed border-line"></div>
        <p class="font-head text-lg font-bold text-ink">${tr('How much each film stops', 'كم يحجب كل فيلم')}</p>
        <div class="mt-4 inline-flex flex-wrap gap-1.5 rounded-2xl border border-line bg-white p-1.5 shadow-card" role="tablist">
          ${films.map((f, i) => `<button type="button" role="tab" aria-selected="${i === 2}" data-sav-film="${i}" class="rounded-xl px-4 py-2.5 text-sm font-bold text-muted transition aria-selected:bg-grad aria-selected:text-white aria-selected:shadow-gold">${f.name}</button>`).join('')}
        </div>
        <div class="mt-6 space-y-5">
          <div>
            <div class="flex items-center justify-between text-sm font-bold"><span class="text-ink">${tr('Heat blocked', 'الحرارة المحجوبة')}</span><span class="text-ink" dir="ltr" data-sav-heat>${films[2].heatTxt}</span></div>
            <div class="mt-2 h-3 overflow-hidden rounded-full bg-gold-50"><div class="h-full rounded-full bg-gradient-to-r from-ink-3 to-ink transition-[width] duration-700" style="width:${films[2].heat}%" data-sav-heatbar></div></div>
          </div>
          <div>
            <div class="flex items-center justify-between text-sm font-bold"><span class="text-ink">${tr('UV blocked', 'الأشعة المحجوبة')}</span><span class="text-gold-700" dir="ltr" data-sav-uv>${films[2].uv}</span></div>
            <div class="mt-2 h-3 overflow-hidden rounded-full bg-gold-50"><div class="h-full rounded-full bg-gold-300 transition-[width] duration-700" style="width:${films[2].uvN}%" data-sav-uvbar></div></div>
          </div>
          <div>
            <div class="flex items-center justify-between text-sm font-bold"><span class="text-ink">${tr('AC workload cut', 'تخفيض حمل المكيف')}</span><span class="text-gold-700" dir="ltr"><span data-sav-ac>${films[2].ac}</span>%</span></div>
            <div class="mt-2 h-3 overflow-hidden rounded-full bg-gold-50"><div class="h-full rounded-full bg-grad transition-[width] duration-700" style="width:${films[2].ac * 2}%" data-sav-acbar></div></div>
          </div>
        </div>
        <p class="mt-6 flex gap-2 rounded-2xl border border-[#d3e8fd] bg-tint p-4 text-sm text-ink-2">${icon('info', 'mt-0.5 h-4 w-4 shrink-0 text-gold-700', 2.2)}<span>${tr('Any shade — light or dark — can come in nano or super nano ceramic. So you can keep a <b>light, bright shade</b> and still block most of the heat.', 'يمكن لأي درجة — فاتحة أو داكنة — أن تكون نانو أو سوبر نانو سيراميك. لذلك يمكنك اختيار <b>درجة فاتحة ومشرقة</b> مع حجب معظم الحرارة.')}</span></p>
      </div>

      <!-- RIGHT: money saved -->
      <div class="relative overflow-hidden rounded-[22px] p-6 navy-bg sm:p-8 lg:col-span-5" data-a="right">
        <div class="pointer-events-none absolute inset-0 grid-lines-dark"></div>
        <div class="relative">
          <p class="font-head text-lg font-bold text-white">${tr('How much will you save?', 'كم ستوفر؟')}</p>
          <div class="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-white/10 p-1" role="tablist">
            <button type="button" role="tab" aria-selected="true" data-sav-mode="home" class="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white/70 transition aria-selected:bg-white aria-selected:text-ink">${icon('home', 'h-4 w-4', 2.2)} ${tr('Home', 'منزل')}</button>
            <button type="button" role="tab" aria-selected="false" data-sav-mode="office" class="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white/70 transition aria-selected:bg-white aria-selected:text-ink">${icon('building', 'h-4 w-4', 2.2)} ${tr('Office', 'مكتب')}</button>
          </div>
          <div class="mt-6 flex items-end justify-between gap-3">
            <label class="text-sm font-semibold text-white/75" for="sav-spend" data-sav-label>${modes.home.label}</label>
            <span class="font-head text-xl font-extrabold text-white" dir="ltr"><span data-sav-spend>1,500</span> <span class="text-sm text-white/60">${qar}</span></span>
          </div>
          <input id="sav-spend" type="range" class="range mt-3" min="${modes.home.min}" max="${modes.home.max}" step="${modes.home.step}" value="${modes.home.val}" data-sav-range dir="ltr">

          <div class="mt-7 rounded-2xl bg-white p-5 text-center">
            <p class="text-xs font-bold uppercase tracking-wider text-muted">${tr('You could save about', 'يمكنك توفير حوالي')}</p>
            <p class="mt-1 font-head text-5xl font-extrabold text-ink" dir="ltr"><span data-sav-year>0</span> <span class="text-xl text-muted">${qar}</span></p>
            <p class="text-sm font-semibold text-gold-700">${tr('per year', 'سنوياً')} · <span dir="ltr"><span data-sav-month>0</span> ${qar}</span> ${tr('per month', 'شهرياً')}</p>
          </div>

          <div class="mt-5 space-y-2 text-sm text-white/75">
            <p class="flex justify-between gap-3"><span>${tr('Spent on cooling (AC)', 'ما يُنفق على التبريد')}</span><b class="text-white" dir="ltr"><span data-sav-cool>0</span> ${qar}/${tr('mo', 'شهر')}</b></p>
            <p class="flex justify-between gap-3"><span>${tr('AC workload cut by', 'تخفيض حمل المكيف')}</span><b class="text-white" dir="ltr"><span data-sav-ac2>30</span>%</b></p>
          </div>
          <a href="#quote" class="btn btn-primary mt-6 w-full">${tr('Start saving — free quote', 'ابدأ التوفير — عرض مجاني')} ${arrow()}</a>
          <p class="mt-4 text-[11px] leading-relaxed text-white/50" data-sav-note data-home="${esc(tr('Estimate. Assumes cooling is about 60% of a Qatar home’s electricity bill. Real savings depend on your home, glass and film.', 'تقدير. يفترض أن التبريد يمثل حوالي ٦٠٪ من فاتورة كهرباء المنزل في قطر. التوفير الفعلي يعتمد على منزلك والزجاج والفيلم.'))}" data-office="${esc(tr('Estimate. Assumes cooling is about 50% of an office’s electricity bill in Qatar. Real savings depend on the building, glass and film.', 'تقدير. يفترض أن التبريد يمثل حوالي ٥٠٪ من فاتورة كهرباء المكتب في قطر. التوفير الفعلي يعتمد على المبنى والزجاج والفيلم.'))}">${tr('Estimate. Assumes cooling is about 60% of a Qatar home’s electricity bill. Real savings depend on your home, glass and film.', 'تقدير. يفترض أن التبريد يمثل حوالي ٦٠٪ من فاتورة كهرباء المنزل في قطر. التوفير الفعلي يعتمد على منزلك والزجاج والفيلم.')}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function statsStrip() {
  const items = [
    ['star', '99', '%', tr('UV blocked', 'حجب الأشعة'), tr('With ceramic films', 'مع أفلام السيراميك')],
    ['thermo', '98', '%', tr('Heat rejection', 'العزل الحراري'), tr('Super nano ceramic', 'سوبر نانو سيراميك')],
    ['layers', '5', '', tr('Specialist services', 'خدمات متخصصة'), tr('Glass, surfaces & interiors', 'زجاج وأسطح وديكور')],
    ['clock', '7', '/7', tr('Days a week', 'أيام في الأسبوع'), tr('8 AM – 6 PM', '٨ ص – ٦ م')],
  ];
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="grid grid-cols-2 overflow-hidden rounded-[28px] border-2 border-[#d3e8fd] bg-white shadow-glow lg:grid-cols-4" ${reveal()}>
      ${items
        .map(
          ([ic, n, sup, title, sub], i) => `
      <div class="flex flex-col items-center px-4 py-9 text-center ${i % 2 ? 'border-s border-dashed border-line' : ''} ${i > 1 ? 'border-t border-dashed border-line lg:border-t-0' : ''} ${i === 2 ? 'lg:border-s' : ''}">
        <span class="ico">${icon(ic, 'h-5 w-5', 2.2)}</span>
        <span class="mt-4 font-head text-[2.6rem] font-extrabold leading-none text-ink sm:text-[3.2rem]" dir="ltr"><span data-count="${n}">${n}</span><sup class="text-2xl text-gold-600">${sup}</sup></span>
        <span class="mt-2 font-head text-lg font-bold text-ink">${title}</span>
        <span class="text-sm text-muted">${sub}</span>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function filmTech() {
  // Figures from the client's own article "Super Nano Ceramic vs Nano Ceramic vs Regular Tint"
  const films = [
    { name: tr('Regular tint', 'التظليل العادي'), sub: tr('Dyed / metallic', 'مصبوغ / معدني'), emoji: 'sun', cost: 1 },
    { name: tr('Nano ceramic', 'نانو سيراميك'), sub: tr('Ceramic nanoparticles', 'جزيئات نانو سيراميكية'), emoji: 'shield', cost: 2 },
    { name: tr('Super nano ceramic', 'سوبر نانو سيراميك'), sub: tr('Multi-layer ceramic', 'سيراميك متعدد الطبقات'), emoji: 'glowstar', cost: 3, featured: true },
  ];
  const yes = `<span class="inline-flex items-center gap-1.5 font-semibold text-emerald-600">${icon('check', 'h-4 w-4', 3)} ${tr('None', 'لا يوجد')}</span>`;
  const rows = [
    ['thermo', tr('Heat rejection', 'العزل الحراري'), ['20–30%', '70–80%', '90–98%'], [25, 75, 94]],
    ['sun', tr('UV protection', 'الحماية من الأشعة'), ['40–50%', '99%', '99%+'], [45, 99, 100]],
    ['bolt', tr('Signal interference', 'التأثير على الإشارة'), [`<span class="font-semibold text-rose-500">${tr('Possible', 'محتمل')}</span>`, yes, yes]],
    ['shield', tr('Durability', 'المتانة'), [tr('Low', 'منخفضة'), tr('High', 'عالية'), tr('Superior', 'ممتازة')]],
    ['clock', tr('Lifespan', 'العمر الافتراضي'), [tr('2–4 years', '٢–٤ سنوات'), tr('8–10 years', '٨–١٠ سنوات'), tr('10–15 years', '١٠–١٥ سنة')]],
    ['star', tr('Best for', 'الأنسب لـ'), [tr('Privacy & style', 'الخصوصية والمظهر'), tr('Comfort & protection', 'الراحة والحماية'), tr('Premium performance', 'أداء فاخر')]],
  ];
  const cell = (fi, content) => `<div class="flex items-center justify-center px-4 py-4 text-center text-[0.95rem] text-ink ${films[fi].featured ? 'bg-gold-50/80' : ''}">${content}</div>`;
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    ${sectionHead({
      eyebrow: tr('Film technology', 'تقنية الأفلام'),
      title: tr('Not all tint is <span class="text-grad">created equal</span>', 'ليس كل تظليل <span class="text-grad">متساوياً</span>'),
      text: tr('Super nano ceramic vs nano ceramic vs regular tint — the real numbers for Qatar’s 45°C summers.', 'سوبر نانو سيراميك أم نانو سيراميك أم تظليل عادي — الأرقام الحقيقية لصيف قطر الذي يتجاوز ٤٥ درجة.'),
      center: true,
    })}
    <div class="no-scrollbar mt-12 overflow-x-auto rounded-[28px] border border-line bg-white shadow-soft" ${reveal(120)}>
      <div class="grid min-w-[760px] grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div class="flex items-end p-6"><p class="font-head text-lg font-bold text-ink">${tr('Compare films', 'قارن الأفلام')}<span class="mt-1 block text-sm font-normal text-muted">${tr('Source: our film guide', 'المصدر: دليل الأفلام لدينا')}</span></p></div>
        ${films
          .map(
            (f) => `<div class="relative flex flex-col items-center px-4 pb-5 pt-7 text-center ${f.featured ? 'rounded-t-[22px] bg-gold-50/80' : ''}">
          ${f.featured ? `<span class="absolute -top-0 rounded-b-xl bg-grad px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-gold">${tr('Recommended', 'موصى به')}</span>` : ''}
          ${img3d(f.emoji, 'mt-2 h-14 w-14 drop-shadow-lg')}
          <span class="mt-3 font-head text-lg font-extrabold text-ink">${f.name}</span>
          <span class="text-xs text-muted">${f.sub}</span>
          <span class="mt-2 text-sm font-bold tracking-widest text-gold-700" dir="ltr">${'$'.repeat(f.cost)}<span class="text-line">${'$'.repeat(3 - f.cost)}</span></span>
        </div>`
          )
          .join('')}
        ${rows
          .map(
            ([ic, label, vals, bars]) => `
        <div class="flex items-center gap-3 border-t border-dashed border-line px-6 py-4 font-semibold text-ink-2"><span class="ico ico-soft !h-9 !w-9 !rounded-lg">${icon(ic, 'h-4 w-4', 2.2)}</span>${label}</div>
        ${vals
          .map((v, fi) =>
            cell(
              fi,
              bars
                ? `<div class="w-full max-w-[9rem]"><span class="font-head text-lg font-extrabold" dir="ltr">${v}</span><div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"><div class="h-full rounded-full ${fi === 2 ? 'bg-grad' : fi === 1 ? 'bg-gold-300' : 'bg-[#c3cad6]'}" style="width:${bars[fi]}%"></div></div></div>`
                : v
            ).replace('class="flex', `class="border-t border-dashed border-line flex`)
          )
          .join('')}`
          )
          .join('')}
        <div class="border-t border-dashed border-line p-6"></div>
        ${films.map((f, fi) => `<div class="flex items-center justify-center border-t border-dashed border-line p-5 ${f.featured ? 'rounded-b-[22px] bg-gold-50/80' : ''}"><a href="#quote" class="btn ${f.featured ? 'btn-primary' : 'btn-outline'} !px-5 !py-2.5 text-sm">${tr('Get a quote', 'اطلب عرض سعر')}</a></div>`).join('')}
      </div>
    </div>
    <p class="mt-5 text-center text-sm text-muted" ${reveal()}>${tr('Want the full breakdown?', 'تريد التفاصيل الكاملة؟')} <a class="font-semibold text-gold-700 underline-offset-4 hover:underline" href="${href(POSTS[0].slug + '/')}">${tr('Read our film guide', 'اقرأ دليل الأفلام')} ${arrow('inline h-3.5 w-3.5')}</a></p>
  </div>
</section>`;
}

/* Why us — bento (from the original "Qatar’s Top Window Tint & Protection Experts" section) */
function whyUs() {
  // [emoji, title, text, metric, metric label, accent]
  const feats = [
    ['thermometer', tr('Heat reduction', 'تقليل الحرارة'), tr('Cooler rooms and offices with heat-rejection film.', 'غرف ومكاتب أبرد مع أفلام العزل الحراري.'), tr('−10°C', '−١٠°'), tr('cooler inside', 'أبرد من الداخل'), '#FCA5A5'],
    ['shield', tr('UV protection', 'الحماية من الأشعة'), tr('Protects skin, furniture and interiors from fading.', 'يحمي البشرة والأثاث والتصميم الداخلي من البهتان.'), '99%', tr('UV blocked', 'حجب الأشعة'), '#93C5FD'],
    ['locked', tr('Daytime privacy', 'خصوصية نهارية'), tr('See out clearly while keeping prying eyes out.', 'رؤية واضحة للخارج مع حجب الأنظار.'), tr('1-way', 'اتجاه واحد'), tr('mirror view', 'رؤية عاكسة'), '#6FB0F6'],
    ['voltage', tr('Energy savings', 'توفير الطاقة'), tr('Less AC load and lower Kahramaa bills.', 'حمل أقل على التكييف وفواتير كهرماء أقل.'), tr('30%', '٣٠٪'), tr('less AC usage', 'استهلاك تكييف أقل'), '#6EE7B7'],
  ];
  const card = ([emoji, title, text, metric, label, acc], i) => `
        <div class="glass-dark group relative overflow-hidden rounded-[20px] p-4 sm:rounded-[22px] sm:p-5 transition duration-500 hover:-translate-y-1 hover:bg-white/[0.09]" data-a="up">
          <span class="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" style="background:linear-gradient(90deg,${acc},transparent)"></span>
          <div class="flex items-center justify-between gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.08] ring-1 ring-inset ring-white/10 transition duration-500 group-hover:-rotate-6 sm:h-12 sm:w-12 sm:rounded-2xl">${img3d(emoji, 'h-7 w-7 drop-shadow-lg sm:h-8 sm:w-8')}</span>
            <div class="text-end"><p class="font-head text-[1.3rem] font-extrabold leading-none sm:text-[1.7rem]" style="color:${acc}" dir="ltr">${metric}</p><p class="mt-1 hidden text-[11px] font-semibold text-white/50 sm:block">${label}</p></div>
          </div>
          <h3 class="mt-3 font-head text-[0.98rem] font-bold leading-snug text-white sm:mt-4 sm:text-lg">${title}</h3>
          <p class="mt-1 hidden text-sm leading-relaxed text-white/60 sm:block">${text}</p>
        </div>`;
  const stat = (n, l) => `<div class="text-center"><p class="font-head text-xl font-extrabold text-white" dir="ltr">${n}</p><p class="text-[11px] font-semibold text-white/50">${l}</p></div>`;
  return `
<section class="relative pb-16 pt-12 lg:pb-24 lg:pt-16" data-assemble>
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[30px] navy-bg p-6 shadow-float sm:p-9 lg:p-10" data-a="up">
      <div class="pointer-events-none absolute inset-0 grid-lines-dark"></div>
      <img src="/assets/img/residential.webp" alt="" class="pointer-events-none absolute inset-y-0 end-0 hidden h-full w-1/2 object-cover opacity-[0.13] [mask-image:linear-gradient(to_left,#000,transparent)] rtl:[mask-image:linear-gradient(to_right,#000,transparent)] lg:block" loading="lazy">
      <div class="pointer-events-none absolute -start-20 -top-24 h-64 w-64 rounded-full bg-gold-400/25 blur-3xl"></div>
      <div class="relative grid items-end gap-6 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <span class="eyebrow !text-gold-300">${tr('Why Exotic Tint', 'لماذا إكزوتك تينت')}</span>
          <h2 class="mt-3 font-head text-[1.8rem] font-extrabold leading-[1.12] text-white sm:text-[2.3rem]">${tr('Qatar’s top window tint &amp; <span class="text-grad">protection experts</span>', 'خبراء التظليل <span class="text-grad">والحماية</span> الأوائل في قطر')}</h2>
          <p class="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-white/65">${tr('Expert on-site installation across Doha, Lusail, Al Rayyan and beyond.', 'تركيب احترافي في موقعك في الدوحة ولوسيل والريان وما بعدها.')}</p>
        </div>
        <div class="flex flex-col gap-4 lg:col-span-5 lg:items-end">
          <div class="grid w-full grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.05] py-3 rtl:divide-x-reverse lg:w-auto lg:min-w-[19rem]">
            ${stat(num(C.services.length), tr('Services', 'خدمات'))}${stat(num(C.areas.length) + '+', tr('Areas', 'مناطق'))}${stat('7/7', tr('Days open', 'أيام العمل'))}
          </div>
          <a href="tel:${C.site.phoneRaw}" class="group flex w-full items-center justify-between gap-4 rounded-2xl bg-white p-2.5 ps-4 transition hover:bg-gold-50 lg:w-auto lg:min-w-[19rem]">
            <span><span class="block text-[10px] font-bold uppercase tracking-wider text-muted">${tr('Call · free estimate', 'اتصل · تقدير مجاني')}</span><span class="block font-head text-lg font-extrabold text-ink" dir="ltr">${C.site.phone}</span></span>
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-grad text-white shadow-gold transition group-hover:scale-110">${icon('phone', 'h-4 w-4', 2.2)}</span>
          </a>
        </div>
      </div>
      <div class="relative mt-6 grid grid-cols-2 gap-3 sm:mt-8 lg:grid-cols-4">
        ${feats.map(card).join('')}
      </div>
    </div>
  </div>
</section>`;
}

/* "Book in less than 60 sec" — gold card + WhatsApp chat mock */
function bookFast() {
  // (spacing) preceded by sections that already carry bottom padding
  const points = [
    ['card', tr('Affordable flat-rate pricing', 'أسعار ثابتة ومناسبة'), tr('No hidden fees — just premium tint and protection.', 'دون رسوم خفية — فقط تظليل وحماية فاخرة.')],
    ['calendar', tr('Fast & easy booking', 'حجز سريع وسهل'), tr('Get a quote and schedule your service in minutes.', 'احصل على عرض سعر واحجز خدمتك خلال دقائق.')],
    ['bulb', tr('Advanced tint & protection', 'حلول تظليل وحماية متطورة'), tr('Privacy, UV protection and energy efficiency for homes and offices.', 'خصوصية وحماية من الأشعة وكفاءة طاقة للمنازل والمكاتب.')],
  ];
  const bubble = (me, text, time) =>
    `<div class="flex ${me ? 'justify-end' : 'justify-start'}" data-chat-msg><div class="max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug shadow-sm ${me ? 'rounded-ee-md bg-[#d9fdd3] text-ink' : 'rounded-es-md bg-white text-ink'}">${text}<span class="ms-2 inline-block align-bottom text-[10px] text-muted">${time}${me ? ' ✓✓' : ''}</span></div></div>`;
  return `
<section class="pb-20 lg:pb-28" data-assemble>
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[28px] bg-grad p-7 shadow-glow sm:p-12" data-a="zoom">
      <div class="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full border-[40px] border-white/15"></div>
      <div class="pointer-events-none absolute -bottom-32 start-1/3 h-72 w-72 rounded-full bg-white/10"></div>
      <div class="relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gold-300">${icon('clock', 'h-3.5 w-3.5', 2.4)} ${tr('Book in less than 60 sec', 'احجز في أقل من ٦٠ ثانية')}</span>
          <h2 class="mt-5 font-head text-[2.1rem] font-extrabold leading-[1.08] text-ink sm:text-[2.8rem]">${tr('Premium tint, booked in a single chat.', 'تظليل فاخر، تحجزه في محادثة واحدة.')}</h2>
          <div class="mt-8 space-y-3">
            ${points.map(([e, a, b]) => `<div class="flex items-center gap-4 rounded-2xl bg-white/70 p-4 backdrop-blur">${img3d(e, 'h-12 w-12 shrink-0 drop-shadow-lg')}<div><p class="font-head text-lg font-bold text-ink">${a}</p><p class="text-sm text-ink/70">${b}</p></div></div>`).join('')}
          </div>
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-dark">${waIcon('h-5 w-5 text-[#25D366]')} ${tr('Book on WhatsApp', 'احجز عبر واتساب')}</a>
            <a href="tel:${C.site.phoneRaw}" class="btn btn-white">${icon('phone', 'h-4 w-4')} <span dir="ltr">${C.site.phone}</span></a>
          </div>
        </div>
        <div class="relative mx-auto w-full max-w-[340px]" data-a="right">
          <p class="mb-3 text-center text-xs font-semibold text-ink/60">${tr('Example of how booking works', 'مثال على طريقة الحجز')}</p>
          <div class="rounded-[38px] bg-ink p-2.5 shadow-[0_40px_70px_-25px_rgba(18,35,61,.7)]">
            <div class="overflow-hidden rounded-[30px] bg-[#efe7dd]">
              <div class="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
                ${mark('h-9 w-9')}
                <div class="flex-1"><p class="text-sm font-semibold">${t(C.site.name)}</p><p class="text-[11px] text-white/75" data-status data-typing-label="${tr('typing…', 'يكتب…')}" data-online-label="${tr('online', 'متصل الآن')}">${tr('online', 'متصل الآن')}</p></div>
                ${icon('phone', 'h-4 w-4')}
              </div>
              <div class="space-y-2.5 p-4 [background-image:radial-gradient(rgba(0,0,0,.04)_1px,transparent_1px)] [background-size:14px_14px]" data-chat>
                <p class="mx-auto w-max rounded-lg bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-muted">${tr('TODAY', 'اليوم')}</p>
                ${bubble(true, tr('Hi! I need heat film for my villa windows 🏡☀️', 'مرحباً! أحتاج فيلماً حرارياً لنوافذ الفيلا 🏡☀️'), '10:02')}
                ${bubble(false, tr('Welcome to Exotic Tint! Send us a photo and we’ll recommend the best film 👌', 'أهلاً بك في إكزوتك تينت! أرسل لنا صورة وسنوصي بأفضل فيلم 👌'), '10:03')}
                <div class="flex justify-end" data-chat-msg><div class="h-24 w-36 overflow-hidden rounded-2xl rounded-ee-md border-4 border-[#d9fdd3]"><img src="/assets/img/residential.webp" alt="" class="h-full w-full object-cover" loading="lazy"></div></div>
                ${bubble(false, tr('Super nano ceramic is perfect ✅ We can install tomorrow at 10 AM in Lusail.', 'السوبر نانو سيراميك مثالي ✅ يمكننا التركيب غداً الساعة ١٠ صباحاً في لوسيل.'), '10:05')}
                ${bubble(true, tr('Booked! Thank you 🙏', 'تم الحجز! شكراً لكم 🙏'), '10:05')}
                <div class="typing hidden w-max rounded-2xl rounded-es-md bg-white px-4 py-3 shadow-sm" data-typing><span></span><span></span><span></span></div>
              </div>
              <div class="flex items-center gap-2 bg-[#efe7dd] px-3 pb-4"><span class="flex-1 rounded-full bg-white px-4 py-2 text-xs text-muted">${tr('Message', 'رسالة')}</span><span class="grid h-9 w-9 place-items-center rounded-full bg-[#00A884] text-white">${icon('arrow', 'h-4 w-4 rtl:-scale-x-100', 2.4)}</span></div>
            </div>
          </div>
          <div class="float-chip floaty absolute -start-6 top-16 hidden items-center gap-2 px-3 py-2 sm:flex"><span class="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600">${icon('clock', 'h-4 w-4', 2.4)}</span><span class="text-sm font-bold text-ink">${tr('Booked in 60s', 'حجز في ٦٠ ثانية')}</span></div>
          
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* We promise you (from the original About page) */
function promiseSection() {
  const items = [
    ['trophy', tr('Professional quality guarantee', 'ضمان الجودة الاحترافية'), tr('High-performance tint films and protective coatings for durability, UV protection and heat reduction.', 'أفلام تظليل وطلاءات حماية عالية الأداء للمتانة والحماية من الأشعة وتقليل الحرارة.')],
    ['card', tr('Easy & affordable payments', 'دفع سهل وبأسعار مناسبة'), tr('Transparent pricing and flexible, cashless payment options for hassle-free service.', 'أسعار شفافة وخيارات دفع إلكتروني مرنة لخدمة دون عناء.')],
    ['gem', tr('Best product guarantee', 'ضمان أفضل المنتجات'), tr('Premium films and coatings with superior privacy, energy efficiency and long-term protection.', 'أفلام وطلاءات فاخرة بخصوصية وكفاءة طاقة وحماية طويلة الأمد.')],
  ];
  return `
<section class="relative pb-20 lg:pb-28">
  <div class="container-site">
    <div class="grid items-end gap-6 lg:grid-cols-2">
      ${sectionHead({ eyebrow: tr('We promise you', 'وعدنا لك'), title: tr('Quality, affordability <span class="text-grad">&amp; reliability</span>', 'الجودة والسعر المناسب <span class="text-grad">والموثوقية</span>') })}
      <p class="text-[1.08rem] leading-relaxed text-muted lg:pb-2" ${reveal(80)}>${tr('We take pride in delivering exceptional window tinting and surface protection — trusted across Doha, Lusail, Al Rayyan and surrounding areas.', 'نفخر بتقديم خدمات تظليل وحماية أسطح استثنائية — موثوقة في الدوحة ولوسيل والريان والمناطق المحيطة.')}</p>
    </div>
    <div class="mt-12 grid gap-5 md:grid-cols-3">
      ${items
        .map(
          ([emoji, a, b], i) => `
      <div class="group relative rounded-[28px] bg-gradient-to-b from-gold-200 to-line p-px shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-glow" ${reveal(i * 90)}>
        <div class="relative h-full overflow-hidden rounded-[27px] bg-white p-8">
          <div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-tint to-transparent"></div>
          <span class="absolute end-6 top-6 font-head text-5xl font-extrabold text-gold-100">${num(pad(i + 1))}</span>
          ${img3d(emoji, 'relative h-20 w-20 drop-shadow-xl transition duration-500 group-hover:-translate-y-1 group-hover:rotate-6')}
          <h3 class="relative mt-6 font-head text-[1.4rem] font-bold leading-tight text-ink">${a}</h3>
          <p class="relative mt-3 leading-relaxed text-muted">${b}</p>
          <div class="relative mt-6 flex items-center gap-2 border-t border-dashed border-line pt-5 text-sm font-bold text-gold-700">${icon('badge', 'h-4 w-4', 2.2)} ${tr('Guaranteed by Exotic Tint', 'بضمان إكزوتك تينت')}</div>
        </div>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

/* Our work — photo bento + Instagram */
function gallery() {
  const svc = (slug) => C.services.find((s) => s.slug === slug);
  const tile = (slug, cls, from) => {
    const s = svc(slug);
    return `<a href="${href('service/' + s.slug + '/')}" class="group relative overflow-hidden rounded-[22px] shadow-card ${cls}" data-a="${from}">
      <img src="/assets/img/${s.img}.webp" alt="${esc(t(s.title))}" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy">
      <div class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-80 transition group-hover:opacity-100"></div>
      <div class="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <div><span class="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink">${t(s.short)}</span><p class="mt-2 font-head text-lg font-bold text-white">${t(s.title)}</p></div>
        <span class="grid h-10 w-10 shrink-0 translate-y-2 place-items-center rounded-full bg-grad text-white opacity-0 shadow-gold transition group-hover:translate-y-0 group-hover:opacity-100">${arrow('h-4 w-4')}</span>
      </div>
    </a>`;
  };
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      ${sectionHead({ eyebrow: tr('Our work', 'أعمالنا'), title: tr('Fresh from our <span class="text-grad">installations</span>', 'من أحدث <span class="text-grad">أعمالنا</span>'), text: tr('Villas, offices, glass and surfaces — finished by our team across Qatar.', 'فلل ومكاتب وزجاج وأسطح — أنجزها فريقنا في أنحاء قطر.') })}
      <a href="${C.site.instagram}" target="_blank" rel="noopener" class="btn btn-white w-max" ${reveal(100)}><span class="grid h-7 w-7 place-items-center rounded-lg text-white" style="background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)">${icon('instagram', 'h-4 w-4')}</span>@exotic_tint_qatar</a>
    </div>
    <div class="mt-10 grid auto-rows-[200px] grid-cols-2 gap-4 lg:auto-rows-[230px] lg:grid-cols-4" data-assemble="scrub">
      ${tile('architectural-window-film-solutions', 'col-span-2 row-span-2', 'far-left')}
      ${tile('smart-glass-privacy-solutions', '', 'far-top')}
      ${tile('surface-protection-solutions', '', 'far-right')}
      ${tile('decorative-interior-solutions', 'col-span-2', 'far-right')}
      ${tile('fabric-material-protection', 'col-span-2', 'far-bottom')}
      <a href="${C.site.instagram}" target="_blank" rel="noopener" class="group relative col-span-2 flex flex-col justify-between overflow-hidden rounded-[22px] p-5 text-white" style="background:linear-gradient(135deg,#f9ce34 0%,#ee2a7b 50%,#6228d7 100%)" data-a="far-bottom">
        ${img3d('camera', 'absolute -bottom-3 -end-3 h-24 w-24 opacity-90 drop-shadow-xl transition duration-500 group-hover:rotate-12')}
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur">${icon('instagram', 'h-5 w-5')}</span>
        <div><p class="font-head text-xl font-extrabold leading-tight">${tr('See more on Instagram', 'شاهد المزيد على إنستغرام')}</p><p class="mt-1 text-sm text-white/85">${tr('Follow for daily work', 'تابعنا لأعمالنا اليومية')}</p></div>
      </a>
    </div>
  </div>
</section>`;
}

/* Service areas (from the original site) */
function areasSection() {
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[28px] border border-[#d3e8fd] bg-gradient-to-br from-tint via-white to-tint-2 p-7 shadow-glow sm:p-12">
      <div class="pointer-events-none absolute inset-0 dots opacity-50 [mask-image:radial-gradient(ellipse_at_70%_50%,#000_20%,transparent_70%)]"></div>
      <div class="relative grid items-center gap-12 lg:grid-cols-12">
        <div class="lg:col-span-5">
          ${sectionHead({
            eyebrow: tr('Service areas', 'مناطق الخدمة'),
            title: tr('Across Qatar. <span class="text-grad">At your door.</span>', 'في كل قطر. <span class="text-grad">عند بابك.</span>'),
            text: tr('Professional window tint and marble protection across Doha, Lusail, Al Rayyan, Al Wakra and surrounding areas — heat-resistant, UV-blocking solutions for your home and office.', 'خدمات تظليل وحماية رخام احترافية في الدوحة ولوسيل والريان والوكرة والمناطق المحيطة — حلول مقاومة للحرارة وحاجبة للأشعة لمنزلك ومكتبك.'),
          })}
          <div class="mt-8 flex flex-wrap gap-3" ${reveal(120)}>
            <a href="#quote" class="btn btn-primary">${tr('Check availability', 'تحقق من التوفر')} ${arrow()}</a>
            <a href="${waLink(tr('Hello, do you cover my area? I am in ', 'مرحباً، هل تغطون منطقتي؟ أنا في '))}" target="_blank" rel="noopener" class="btn btn-white">${waIcon('h-4 w-4 text-[#25D366]')} ${tr('Ask about your area', 'اسأل عن منطقتك')}</a>
          </div>
          <div class="mt-8 flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card" ${reveal(160)}>
            ${img3d('truck', 'h-14 w-14 shrink-0 drop-shadow-lg')}
            <div><p class="font-head font-bold text-ink">${tr('Mobile service — we come to you', 'خدمة متنقلة — نأتي إليك')}</p><p class="text-sm text-muted">${tr('Home, office or parking spot. 7 days a week.', 'المنزل أو المكتب أو الموقف. ٧ أيام في الأسبوع.')}</p></div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7">
          ${C.areas
            .map(
              (a, i) => `<div class="group flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-card transition hover:-translate-y-0.5 hover:border-gold-300 sm:p-4 " ${reveal(i * 50)}>
            <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tint transition group-hover:bg-gold-100">${img3d('pin', 'h-7 w-7')}</span>
            <span class="min-w-0"><span class="block truncate font-head text-[1.05rem] font-bold text-ink">${t(a)}</span><span class="flex items-center gap-1.5 text-xs text-muted"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>${L === 'ar' ? a[0] : `<span class="font-arabic">${a[1]}</span>`}</span></span>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* "Review us on" strip */
function reviewUs() {
  const s = (link, bg, ic, name, sub) => `<a href="${link}" target="_blank" rel="noopener" class="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 pe-5 shadow-card transition hover:-translate-y-0.5"><span class="grid h-11 w-11 place-items-center rounded-xl text-white" style="background:${bg}">${ic}</span><span><span class="block font-head font-bold text-ink">${name}</span><span class="block text-xs text-muted">${sub}</span></span></a>`;
  return `
<div class="container-site -mt-8 pb-20 lg:pb-28">
  <div class="flex flex-col items-center justify-between gap-5 rounded-[22px] border border-dashed border-[#bfdcfb] bg-tint-2 p-5 sm:p-6 lg:flex-row" ${reveal()}>
    <div class="flex items-center gap-4">${img3d('chat', 'h-14 w-14 drop-shadow-lg')}<div><p class="font-head text-xl font-bold text-ink">${tr('Happy with our work? Review us on', 'راضٍ عن عملنا؟ قيّمنا على')}</p><p class="text-sm text-muted">${tr('Your feedback helps other homeowners and businesses in Qatar.', 'رأيك يساعد أصحاب المنازل والشركات الآخرين في قطر.')}</p></div></div>
    <div class="flex flex-wrap justify-center gap-3">
      ${s(C.site.facebook, '#1877F2', fbIcon('h-5 w-5'), 'Facebook', tr('Leave a review', 'اكتب تقييماً'))}
      ${s(C.site.instagram, 'linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)', icon('instagram', 'h-5 w-5'), 'Instagram', '@exotic_tint_qatar')}
      ${s(C.site.tiktok, '#000', ttIcon('h-5 w-5'), 'TikTok', '@exotic_window_tinting_qa')}
    </div>
  </div>
</div>`;
}

/* Blog — featured + list (Fincoach style) */
function blogSection() {
  const [f, ...rest] = POSTS;
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      ${sectionHead({ eyebrow: tr('Insights & guides', 'مقالات وأدلة'), title: tr('From our <span class="text-grad">blog</span>', 'من <span class="text-grad">مدونتنا</span>'), text: tr('Practical tint and protection guides written for Qatar’s climate.', 'أدلة عملية للتظليل والحماية مكتوبة لمناخ قطر.') })}
      <a href="${href('blogs/')}" class="btn btn-white w-max !pe-2" ${reveal(100)}>${tr('View all posts', 'كل المقالات')} <span class="grid h-9 w-9 place-items-center rounded-full bg-grad text-white">${arrow('h-4 w-4')}</span></a>
    </div>
    <div class="mt-10 grid gap-5 lg:grid-cols-12">
      <a href="${href(f.slug + '/')}" class="group relative min-h-[460px] overflow-hidden rounded-[28px] shadow-soft lg:col-span-7" ${reveal()}>
        <img src="/assets/img/${f.img}.webp" alt="${esc(t(f.title))}" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"></div>
        <span class="absolute start-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gold-700 shadow">${icon('star', 'h-3.5 w-3.5', 2.4)} ${tr('Editor’s pick', 'اختيار المحرر')}</span>
        <span class="absolute end-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">${icon('clock', 'h-3.5 w-3.5', 2.4)} ${num(f.read)} ${tr('min read', 'دقائق قراءة')}</span>
        <div class="absolute inset-x-4 bottom-4 rounded-[22px] border border-white/20 bg-ink/55 p-6 backdrop-blur-xl">
          <span class="rounded-full bg-grad px-2.5 py-1 text-[11px] font-extrabold uppercase text-white">${t(f.cat)}</span>
          <h3 class="mt-3 font-head text-2xl font-extrabold leading-tight text-white">${t(f.title)}</h3>
          <p class="mt-2 line-clamp-2 text-sm text-white/80">${t(f.excerpt)}</p>
          <div class="mt-4 flex items-center justify-between border-t border-white/15 pt-4">
            <span class="flex items-center gap-2.5">${mark('h-9 w-9')}<span><span class="block text-sm font-bold text-white">${tr('Exotic Tint team', 'فريق إكزوتك تينت')}</span><span class="block text-xs text-white/70">${fmtDate(f.date)}</span></span></span>
            <span class="grid h-11 w-11 place-items-center rounded-full bg-white text-ink transition group-hover:bg-gold-300">${arrow('h-4 w-4')}</span>
          </div>
        </div>
      </a>
      <div class="grid gap-5 lg:col-span-5">
        ${rest
          .map(
            (p, i) => `<a href="${href(p.slug + '/')}" class="group flex gap-4 rounded-[22px] sm:gap-5 border border-line bg-white p-4 shadow-card transition hover:-translate-y-1 hover:shadow-soft" ${reveal(i * 90)}>
          <div class="relative w-24 shrink-0 overflow-hidden rounded-2xl min-[400px]:w-32 sm:w-40"><img src="/assets/img/${p.img}.webp" alt="" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy"></div>
          <div class="flex min-w-0 flex-1 flex-col py-1">
            <span class="w-max rounded-full bg-tint px-2.5 py-1 text-[11px] font-bold uppercase text-gold-700">${t(p.cat)}</span>
            <h3 class="mt-2 line-clamp-3 font-head text-lg font-bold leading-snug text-ink">${t(p.title)}</h3>
            <div class="mt-auto flex items-center justify-between pt-3 text-xs text-muted"><span class="flex items-center gap-1.5">${icon('clock', 'h-3.5 w-3.5')} ${num(p.read)} ${tr('min', 'د')} · ${fmtDate(p.date)}</span><span class="grid h-8 w-8 place-items-center rounded-full bg-[#f2f4f7] text-white transition group-hover:bg-grad">${arrow('h-3.5 w-3.5')}</span></div>
          </div>
        </a>`
          )
          .join('')}
        <div class="relative overflow-hidden rounded-[22px] p-6 navy-bg" ${reveal(200)}>
          ${img3d('news', 'absolute -bottom-2 end-3 h-20 w-20 opacity-90')}
          <p class="font-head text-lg font-bold text-white">${tr('Have a question about film?', 'لديك سؤال عن الأفلام؟')}</p>
          <p class="mt-1 max-w-[16rem] text-sm text-white/70">${tr('Ask our specialists — we reply fast on WhatsApp.', 'اسأل مختصينا — نرد بسرعة عبر واتساب.')}</p>
          <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-primary mt-4 !py-2.5 text-sm">${waIcon('h-4 w-4')} ${tr('Ask now', 'اسأل الآن')}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* Premium CTA banner (from the original "Premium Tint & Protection for Your Windows!") */
function ctaBanner() {
  return `
<section class="px-2.5 pb-20 sm:px-3 lg:pb-28">
  <div class="relative overflow-hidden rounded-[28px] navy-bg">
    <div class="pointer-events-none absolute inset-0 grid-lines-dark"></div>
    <div class="pointer-events-none absolute -start-20 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-gold-500/20 blur-[100px]"></div>
    <div class="container-site relative grid items-center gap-12 py-16 lg:grid-cols-12 lg:py-20">
      <div class="lg:col-span-7" ${reveal()}>
        <span class="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gold-300">${img3d('glowstar', 'h-5 w-5')} ${tr('Free estimate · Limited time', 'تقدير مجاني · لفترة محدودة')}</span>
        <h2 class="mt-6 font-head text-[2.3rem] font-extrabold leading-[1.05] text-white sm:text-[3.4rem]">${tr('Premium tint &amp; protection <span class="text-grad">for your windows!</span>', 'تظليل وحماية فاخرة <span class="text-grad">لنوافذك!</span>')}</h2>
        <p class="mt-5 max-w-xl text-lg text-white/70">${tr('Enhance privacy, block UV rays and protect your surfaces with high-quality tint solutions. Let us work while you unwind.', 'عزّز الخصوصية واحجب الأشعة واحمِ أسطحك بحلول تظليل عالية الجودة. دعنا نعمل بينما تسترخي.')}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href="#quote" class="btn btn-primary">${tr('Get my free estimate', 'احصل على تقديري المجاني')} ${arrow()}</a>
          <a href="tel:${C.site.phoneRaw}" class="btn btn-glass">${icon('phone', 'h-4 w-4')} <span dir="ltr">${C.site.phone}</span></a>
        </div>
        <div class="mt-10 grid max-w-xl grid-cols-3 gap-3">
          ${[
            ['99%', tr('UV blocked', 'حجب الأشعة')],
            [tr('60s', '٦٠ث'), tr('To book', 'للحجز')],
            ['7/7', tr('Days open', 'أيام العمل')],
          ]
            .map(([n, l]) => `<div class="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><p class="font-head text-2xl font-extrabold text-white" dir="ltr">${n}</p><p class="text-xs text-white/60">${l}</p></div>`)
            .join('')}
        </div>
      </div>
      <div class="relative mx-auto w-full max-w-sm lg:col-span-5" ${reveal(150)}>
        <div class="absolute inset-[-10%] rounded-full border border-dashed border-gold-400/30"></div>
        <div class="arch relative aspect-[4/5] !border-white/10"><img src="/assets/img/frosted.webp" alt="${tr('Frosted film on office glass', 'فيلم مصنفر على زجاج مكتب')}" class="h-full w-full object-cover" loading="lazy"></div>
        ${img3d('sparkles', 'floaty absolute -end-6 -top-4 h-20 w-20 drop-shadow-2xl')}
        <div class="float-chip floaty-2 absolute -start-6 bottom-12 flex items-center gap-3 p-3 pe-5"><span class="ico">${icon('shield', 'h-5 w-5', 2.2)}</span><span><span class="block text-xs text-muted">${tr('Every job', 'كل عمل')}</span><span class="block font-head font-extrabold text-ink">${tr('Quality guaranteed', 'جودة مضمونة')}</span></span></div>
      </div>
    </div>
  </div>
</section>`;
}

/* Detailed 5-step process (from the original service pages) */
function processTimeline() {
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    ${sectionHead({ eyebrow: tr('Our process', 'طريقة عملنا'), title: tr('Five steps to a <span class="text-grad">flawless finish</span>', 'خمس خطوات نحو <span class="text-grad">نتيجة مثالية</span>'), center: true })}
    <ol class="relative mt-14 grid gap-5 md:grid-cols-5">
      <div class="pointer-events-none absolute inset-x-[10%] top-9 hidden border-t-2 border-dashed border-gold-200 md:block"></div>
      ${C.process
        .map(
          ([a, b], i) => `<li class="relative text-center" ${reveal(i * 80)}>
        <span class="relative mx-auto grid h-[72px] w-[72px] place-items-center rounded-full border-[6px] border-white bg-grad font-head text-2xl font-extrabold text-white shadow-gold">${num(i + 1)}</span>
        <div class="card mt-5 p-5"><h3 class="font-head text-lg font-bold text-ink">${t(a)}</h3><p class="mt-1.5 text-sm leading-relaxed text-muted">${t(b)}</p></div>
      </li>`
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

/* Contact map */
function mapSection() {
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[28px] border border-line shadow-soft" ${reveal()}>
      <iframe title="${tr('Map of Doha, Qatar', 'خريطة الدوحة، قطر')}" src="https://www.google.com/maps?q=Doha%2C%20Qatar&z=11&output=embed" class="h-[420px] w-full grayscale-[30%]" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <div class="absolute start-4 top-4 max-w-xs rounded-[22px] bg-white p-6 shadow-float sm:start-8 sm:top-8">
        ${img3d('pin', 'h-12 w-12 drop-shadow-lg')}
        <p class="mt-3 font-head text-xl font-bold text-ink">${tr('Based in Doha', 'مقرنا في الدوحة')}</p>
        <p class="mt-1 text-sm text-muted">${tr('On-site installation across all of Qatar — we come to you.', 'تركيب في الموقع في كل أنحاء قطر — نأتي إليك.')}</p>
        <a href="tel:${C.site.phoneRaw}" class="btn btn-dark mt-4 !py-2.5 text-sm">${icon('phone', 'h-4 w-4')} <span dir="ltr">${C.site.phone}</span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* Signature section: a clean, auto-playing tint demo (photo + sliding glass film + live readings) */
function showcase() {
  // Illustrative temperatures (the villa drop matches the 9°C example in the client's own article)
  const scenes = [
        { img: 'residential', icon: 'home', label: tr('Villa living room', 'غرفة معيشة الفيلا'), from: 41, to: 32 },
    { img: 'commercial', icon: 'building', label: tr('Office workspace', 'مساحة المكتب'), from: 38, to: 30 },
  ];
  const deg = (n) => (L === 'ar' ? Number(n).toLocaleString('ar-EG') : n) + '°';
  return `
<section class="relative pb-20 lg:pb-28" data-assemble>
  <div class="container-site grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
    <div class="lg:col-span-5" data-a="left">
      <span class="eyebrow">${tr('Tint in motion', 'التظليل أثناء العمل')}</span>
      <h2 class="mt-4 text-balance font-head text-[1.95rem] font-extrabold leading-[1.1] text-ink sm:text-[2.6rem]">${tr('Watch the heat <span class="text-grad">disappear</span>', 'شاهد الحرارة <span class="text-grad">تختفي</span>')}</h2>
      <p class="mt-4 max-w-md text-[1.03rem] leading-relaxed text-muted">${tr('Our film slides on, the glare fades and the room cools — with 99% of UV blocked.', 'يُركّب الفيلم، فيختفي الوهج وتبرد الغرفة — مع حجب ٩٩٪ من الأشعة فوق البنفسجية.')}</p>
      <div class="mt-8 space-y-2.5" role="tablist">
        ${scenes
          .map(
            (s, i) => `
        <button type="button" role="tab" class="tm-tab group relative w-full overflow-hidden rounded-2xl border border-line bg-white p-3.5 text-start shadow-card transition hover:border-gold-200" aria-selected="${i === 0}" data-tm-tab="${i}">
          <span class="flex items-center gap-3.5">
            <span class="tm-ico grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f2f4f7] text-ink transition">${icon(s.icon, 'h-5 w-5', 2)}</span>
            <span class="min-w-0 flex-1"><span class="block font-head font-bold text-ink">${s.label}</span><span class="block text-xs text-muted">${tr('Illustrative', 'توضيحي')}</span></span>
            <span class="font-head text-sm font-extrabold text-ink" dir="ltr"><span class="text-rose-500">${deg(s.from)}</span> <span class="text-muted">→</span> <span class="text-emerald-600">${deg(s.to)}</span></span>
          </span>
          <span class="absolute inset-x-0 bottom-0 h-[3px] bg-transparent"><span class="tm-bar block h-full bg-grad"></span></span>
        </button>`
          )
          .join('')}
      </div>
      <a href="#quote" class="btn btn-primary mt-8">${tr('Get this result', 'احصل على هذه النتيجة')} ${arrow()}</a>
    </div>

    <div class="lg:col-span-7" data-a="right">
      <div class="relative" data-tm data-scenes='${esc(JSON.stringify(scenes.map((s) => ({ img: s.img, from: s.from, to: s.to }))))}'>
        <div class="pointer-events-none absolute -inset-5 rounded-[40px] bg-gradient-to-br from-gold-200/60 via-transparent to-[#c7d5ee]/60 blur-2xl"></div>
        <div class="relative aspect-[4/3] overflow-hidden rounded-[30px] border-[6px] border-white bg-ink shadow-float sm:aspect-[16/11]" dir="ltr">
          <img src="/assets/img/${scenes[0].img}.webp" alt="${tr('Window film demonstration', 'عرض توضيحي لفيلم النوافذ')}" class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" data-tm-img loading="lazy">
          <div class="tm-glare absolute inset-0" style="background:radial-gradient(70% 80% at 88% 8%,rgba(255,240,200,.95),rgba(255,190,90,.5) 35%,transparent 70%),linear-gradient(180deg,rgba(255,210,130,.28),rgba(255,170,80,.12))"></div>
          <div class="tm-film absolute inset-0" style="background:linear-gradient(115deg,rgba(14,26,46,.55),rgba(22,40,70,.4) 50%,rgba(14,26,46,.55))">
            <div class="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,.12)_48%,transparent_56%)]"></div>
          </div>
          <div class="tm-edge pointer-events-none absolute inset-y-0 w-[3px] bg-white shadow-[0_0_24px_6px_rgba(255,255,255,.6)]"></div>
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"></div>

          <span class="glass-hud absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold text-white ${L === 'ar' ? 'font-arabic' : ''}">
            <span class="tm-dot h-2 w-2 rounded-full"></span><span data-tm-state data-off="${tr('Without film', 'بدون فيلم')}" data-on="${tr('With Exotic Tint', 'مع إكزوتك تينت')}">${tr('Without film', 'بدون فيلم')}</span>
          </span>

          <div class="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4 sm:gap-3">
            <div class="room-hud rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
              <p class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted ${L === 'ar' ? 'font-arabic' : ''}">${tr('Temperature', 'الحرارة')}</p>
              <p class="font-head text-2xl font-extrabold leading-tight text-ink sm:text-4xl"><span data-tm-temp>${scenes[0].from}</span><span class="text-lg text-muted">°C</span></p>
              <div class="mt-1.5 hidden h-1.5 w-36 overflow-hidden rounded-full bg-line sm:block"><div class="tm-tbar h-full rounded-full"></div></div>
            </div>
            <div class="room-hud flex items-center gap-2 rounded-2xl p-2 pe-3 sm:gap-3 sm:p-3 sm:pe-4">
              <svg class="h-9 w-9 -rotate-90 sm:h-11 sm:w-11" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#eceef3" stroke-width="5"/><circle cx="24" cy="24" r="20" fill="none" stroke="url(#tmuv)" stroke-width="5" stroke-linecap="round" stroke-dasharray="125.66" stroke-dashoffset="125.66" data-tm-ring/><defs><linearGradient id="tmuv"><stop stop-color="#3592EF"/><stop offset="1" stop-color="#0553A3"/></linearGradient></defs></svg>
              <div><p class="text-[11px] font-bold uppercase tracking-wider text-muted ${L === 'ar' ? 'font-arabic' : ''}">${tr('UV blocked', 'حجب الأشعة')}</p><p class="font-head text-xl font-extrabold text-ink"><span data-tm-uv>0</span>%</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function testimonials() {
  const avatarBg = ['#0878E8', '#2563EB', '#0F766E', '#6D28D9'];
  const msg = (r, i) => `
        <div class="flex items-end gap-2.5 ${i % 2 ? 'sm:ps-10' : ''}" data-review>
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full font-head text-xs font-extrabold text-white shadow-md" style="background:${avatarBg[i % 4]}">${r.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
          <div class="max-w-[30rem] rounded-2xl rounded-es-md border border-white/70 bg-white/90 p-4 shadow-card backdrop-blur">
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p class="font-head text-[0.95rem] font-bold text-ink">${r.name} <span class="font-sans text-xs font-medium text-muted">· ${t(r.role)}</span></p>
              ${starsRow('h-3.5 w-3.5')}
            </div>
            <p class="mt-2 text-[0.97rem] leading-relaxed text-ink-2">${t(r.text)}</p>
            <div class="mt-3 flex items-center justify-between gap-3">
              <span class="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-bold text-gold-700">${t(r.service)}</span>
              <span class="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">${icon('check', 'h-3.5 w-3.5', 3)}${tr('Client review', 'تقييم عميل')}</span>
            </div>
          </div>
        </div>`;
  const social = (link, bg, ic, name) => `<a href="${link}" target="_blank" rel="noopener" class="flex items-center gap-2.5 rounded-2xl border border-line bg-white px-3.5 py-2.5 text-sm font-bold text-ink shadow-card transition hover:-translate-y-0.5"><span class="grid h-8 w-8 place-items-center rounded-lg text-white" style="background:${bg}">${ic}</span>${name}</a>`;
  return `
<section class="relative overflow-hidden pb-20 lg:pb-28" data-assemble>
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[28px] border border-line bg-gradient-to-br from-tint-2 via-white to-tint p-6 shadow-glow sm:p-10 lg:p-14">
      ${aurora('soft')}
      <div class="relative grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-5" data-a="left">
          <span class="eyebrow">${tr('Client stories', 'قصص العملاء')}</span>
          <h2 class="mt-4 text-balance font-head text-[1.85rem] font-extrabold leading-[1.12] text-ink min-[400px]:text-[2.1rem] sm:text-[2.6rem]">${tr('What our clients <span class="text-grad">tell us</span>', 'ماذا يقول <span class="text-grad">عملاؤنا</span>')}</h2>
          <p class="mt-4 text-[1.05rem] leading-relaxed text-muted">${tr('Real words from homeowners and businesses we’ve worked with across Qatar.', 'كلمات حقيقية من سائقين وأصحاب منازل وشركات عملنا معهم في أنحاء قطر.')}</p>
          <div class="mt-8 rounded-[22px] border border-line bg-white p-5 shadow-card">
            <div class="flex items-center gap-4">
              <img src="/assets/img/logo-light.webp" alt="" class="h-14 w-auto">
              <div><p class="font-head text-lg font-bold text-ink">${t(C.site.name)}</p><p class="flex items-center gap-2 text-sm text-muted">${starsRow('h-4 w-4')} ${tr('Rated by our clients', 'بتقييم عملائنا')}</p></div>
            </div>
            <div class="mt-5 grid grid-cols-3 gap-2 border-t border-dashed border-line pt-5 text-center">
              <div><p class="font-head text-xl font-extrabold text-ink">${num(C.services.length)}</p><p class="text-[11px] text-muted">${tr('Services', 'خدمات')}</p></div>
              <div><p class="font-head text-xl font-extrabold text-ink">${num(C.areas.length)}+</p><p class="text-[11px] text-muted">${tr('Areas', 'مناطق')}</p></div>
              <div><p class="font-head text-xl font-extrabold text-ink" dir="ltr">7/7</p><p class="text-[11px] text-muted">${tr('Days open', 'أيام العمل')}</p></div>
            </div>
          </div>
          <p class="mt-8 text-sm font-semibold text-ink">${tr('Find us &amp; leave a review', 'تابعنا واكتب تقييمك')}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            ${social(C.site.facebook, '#1877F2', fbIcon('h-4 w-4'), 'Facebook')}
            ${social(C.site.instagram, 'linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)', icon('instagram', 'h-4 w-4'), 'Instagram')}
            ${social(C.site.tiktok, '#000', ttIcon('h-4 w-4'), 'TikTok')}
          </div>
        </div>
        <div class="lg:col-span-7" data-a="right">
          <div class="glass-card overflow-hidden rounded-[26px]">
            <div class="flex items-center justify-between gap-3 border-b border-white/70 bg-white/60 px-5 py-4">
              <div class="flex items-center gap-3">
                <span class="relative grid h-10 w-10 place-items-center rounded-full bg-grad text-white">${icon('chat', 'h-5 w-5', 2.2)}<span class="absolute -end-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span></span>
                <div><p class="font-head font-bold text-ink">${tr('Client reviews', 'تقييمات العملاء')}</p><p class="text-xs text-muted" data-review-status data-typing-label="${tr('new review…', 'تقييم جديد…')}">${num(C.testimonials.length)} ${tr('reviews', 'تقييمات')}</p></div>
              </div>
              <a href="${href('reviews/')}" class="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-card hover:text-gold-700">${tr('See all', 'عرض الكل')} ${arrow('h-3.5 w-3.5')}</a>
            </div>
            <div class="space-y-4 p-4 sm:p-6" data-reviews>
              ${C.testimonials.map(msg).join('')}
              <div class="typing hidden w-max rounded-2xl rounded-es-md bg-white px-4 py-3 shadow-sm ms-11" data-typing><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}
function faqSection(items, title) {
  return `
<section class="pb-20 lg:pb-28" data-assemble>
  <div class="container-site grid gap-12 lg:grid-cols-12">
    <div class="lg:col-span-5">
      ${sectionHead({ eyebrow: tr('FAQ', 'الأسئلة الشائعة'), title: title || tr('Questions? <span class="text-grad">Answered.</span>', 'لديك أسئلة؟ <span class="text-grad">إليك الإجابات.</span>') })}
      <div class="relative mt-8 overflow-hidden rounded-[22px] p-7 navy-bg shadow-float" data-a="left">
        ${img3d('wrench', 'absolute -bottom-3 end-3 h-20 w-20 opacity-90')}
        <p class="font-head text-xl font-bold text-white">${tr('Still have a question?', 'لديك سؤال آخر؟')}</p>
        <p class="mt-1 max-w-xs text-sm text-white/70">${tr('Our specialists reply fast on WhatsApp, 7 days a week.', 'يرد مختصونا بسرعة عبر واتساب، ٧ أيام في الأسبوع.')}</p>
        <div class="mt-6 flex flex-wrap gap-2">
          <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-primary !py-3 text-sm">${waIcon('h-4 w-4')} ${t(C.ui.whatsapp)}</a>
          <a href="tel:${C.site.phoneRaw}" class="btn btn-glass !py-3 text-sm">${icon('phone', 'h-4 w-4')} ${t(C.ui.callUs)}</a>
        </div>
      </div>
    </div>
    <div class="space-y-3 lg:col-span-7">
      ${items
        .map(
          ([q, a], i) => `
      <details class="faq group rounded-2xl border border-line bg-white px-6 shadow-card transition" ${i === 0 ? 'open' : ''} data-a="right">
        <summary class="flex cursor-pointer items-center justify-between gap-6 py-5 font-head text-lg font-bold text-ink">
          <span>${t(q)}</span>
          <span class="faq-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tint text-gold-700 transition duration-300">${icon('plus', 'h-4 w-4', 2.4)}</span>
        </summary>
        <p class="pb-6 pe-12 leading-relaxed text-muted">${t(a)}</p>
      </details>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function quoteSection() {
  const opt = (v) => `<option value="${esc(v)}">${v}</option>`;
  return `
<section id="quote" class="pb-20 lg:pb-28">
  <div class="container-site">
    ${sectionHead({
      eyebrow: tr('Free estimate', 'تقدير مجاني'),
      title: tr('Book your tint <span class="text-grad">in 60 seconds</span>', 'احجز تظليلك <span class="text-grad">في ٦٠ ثانية</span>'),
      text: tr('Fill in a few details — your request goes straight to our team on WhatsApp.', 'أدخل بعض التفاصيل — يصل طلبك مباشرة إلى فريقنا عبر واتساب.'),
    })}
    <div class="mt-10 grid overflow-hidden rounded-[28px] border border-line shadow-soft lg:grid-cols-12" data-assemble>
      <form class="relative bg-white p-6 sm:p-10 lg:col-span-7" data-a="left" data-quote-form novalidate
        data-msg-intro="${esc(tr('Hello Exotic Tint for Trading and Contracting! I would like a free quote.', 'مرحباً إكزوتك تينت للتجارة والمقاولات! أرغب في الحصول على عرض سعر مجاني.'))}"
        data-l-name="${esc(tr('Name', 'الاسم'))}" data-l-phone="${esc(tr('Phone', 'الهاتف'))}" data-l-service="${esc(tr('Service', 'الخدمة'))}" data-l-area="${esc(tr('Area', 'المنطقة'))}" data-l-message="${esc(tr('Details', 'التفاصيل'))}" data-wa="${C.site.whatsapp}">
        <div class="pointer-events-none absolute inset-0 dots opacity-30 [mask-image:linear-gradient(180deg,#000,transparent_50%)]"></div>
        <div class="relative grid gap-5 sm:grid-cols-2">
          <div><label class="label" for="f-name">${tr('Full name', 'الاسم الكامل')} *</label><input id="f-name" name="name" required autocomplete="name" class="field" placeholder="${tr('Your name', 'اسمك')}"></div>
          <div><label class="label" for="f-phone">${tr('Phone', 'رقم الهاتف')} *</label><input id="f-phone" name="phone" required type="tel" autocomplete="tel" class="field" placeholder="+974" dir="ltr"></div>
          <div><label class="label" for="f-service">${tr('Service', 'الخدمة')}</label><select id="f-service" name="service" class="field">${C.services.map((s) => opt(t(s.title))).join('')}${opt(tr('Not sure yet', 'لم أحدد بعد'))}</select></div>
          <div><label class="label" for="f-area">${tr('Area', 'المنطقة')}</label><select id="f-area" name="area" class="field">${C.areas.map((a) => opt(t(a))).join('')}${opt(tr('Other', 'أخرى'))}</select></div>
          <div class="sm:col-span-2"><label class="label" for="f-message">${tr('Details', 'التفاصيل')}</label><textarea id="f-message" name="message" rows="4" class="field resize-none" placeholder="${tr('Number of windows, glass or surface size…', 'عدد النوافذ، مقاس الزجاج أو السطح…')}"></textarea></div>
        </div>
        <p class="relative mt-4 hidden items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600" data-form-error>${icon('info', 'h-4 w-4', 2.2)} ${tr('Please add your name and phone number.', 'يرجى إدخال الاسم ورقم الهاتف.')}</p>
        <button type="submit" class="btn btn-primary relative mt-6 w-full !py-4">${waIcon('h-5 w-5')} ${tr('Send request on WhatsApp', 'أرسل الطلب عبر واتساب')}</button>
      </form>
      <div class="relative p-6 sm:p-10 navy-bg lg:col-span-5" data-a="right">
        <div class="pointer-events-none absolute inset-0 grid-lines-dark"></div>
        <div class="relative">
          <p class="flex items-center gap-2 text-white/80">${tr('Prefer to talk?', 'تفضل التحدث؟')} <span class="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold uppercase text-emerald-300">${tr('7 days a week', '٧ أيام في الأسبوع')}</span></p>
          <a href="tel:${C.site.phoneRaw}" class="mt-2 block font-head text-4xl font-extrabold text-white hover:text-gold-300" dir="ltr">${C.site.phone}</a>
          <div class="mt-8 space-y-px overflow-hidden rounded-2xl border border-white/10">
            ${[
              ['clock', t(C.ui.hoursLabel), t(C.site.hours)],
              ['mail', tr('Email', 'البريد'), C.site.email],
              ['pin', tr('Location', 'الموقع'), tr('Doha · on-site across Qatar', 'الدوحة · في موقعك في كل قطر')],
              ['wallet', tr('Payment', 'الدفع'), tr('Cashless & flexible', 'إلكتروني ومرن')],
            ]
              .map(([ic, a, b]) => `<div class="flex items-center gap-4 bg-white/[0.04] px-5 py-4"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-gold-300">${icon(ic, 'h-[18px] w-[18px]')}</span><span class="min-w-0"><span class="block text-xs text-white/55">${a}</span><span class="block break-words font-semibold text-white">${b}</span></span></div>`)
              .join('')}
          </div>
          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-primary">${waIcon('h-4 w-4')} WhatsApp</a>
            <a href="${C.site.instagram}" target="_blank" rel="noopener" class="btn btn-glass">${icon('instagram', 'h-4 w-4')} Instagram</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function pageHero({ chip, title, text, crumbs = [], image, alt, chips = {} }) {
  return `
<section class="px-2.5 sm:px-3">
  <div class="hero-bg relative overflow-hidden rounded-[28px]" data-hero>
    ${aurora()}
    <div class="pointer-events-none absolute inset-0 grid-lines"></div>
    <div class="container-site relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
      <div>
        <nav class="flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb" data-a="down">
          <a href="${href()}" class="font-semibold hover:text-gold-700">${t(C.ui.nav.home)}</a>
          ${crumbs.map(([label, link]) => `${icon('chevron', 'h-3.5 w-3.5 -rotate-90 rtl:rotate-90')}${link ? `<a href="${link}" class="font-semibold hover:text-gold-700">${label}</a>` : `<span class="font-semibold text-ink">${label}</span>`}`).join('')}
        </nav>
        <span class="chip mt-6" data-a="left">${chip}</span>
        <h1 class="mt-5 text-balance font-head text-[2.15rem] font-extrabold leading-[1.08] text-ink min-[400px]:text-[2.5rem] sm:text-[3.2rem] lg:text-[2.9rem] xl:text-[3.4rem]" data-split>${title}</h1>
        ${text ? `<p class="mt-5 max-w-xl text-[1.1rem] leading-relaxed text-muted" data-a="up">${text}</p>` : ''}
        <div class="mt-8 flex flex-wrap gap-3" data-a="up">
          <a href="#quote" class="btn btn-primary">${t(C.ui.quote)} ${arrow()}</a>
          <a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-white">${waIcon('h-5 w-5 text-[#25D366]')} ${t(C.ui.whatsapp)}</a>
        </div>
      </div>
      ${image ? archVisual({ image, alt, ...chips }) : ''}
    </div>
  </div>
</section>`;
}

const chipHeat = () => ({
  top: `<span class="ico">${icon('sun', 'h-5 w-5', 2.2)}</span><span><span class="block text-xs text-muted">${tr('UV blocked', 'حجب الأشعة')}</span><span class="block font-head text-lg font-extrabold text-ink">99%</span></span>`,
  bottom: `<span class="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">${icon('check', 'h-4 w-4', 3)}</span><span><span class="block text-xs text-muted">${tr('Free estimate', 'تقدير مجاني')}</span><span class="block font-head text-base font-extrabold text-ink">${tr('Flat-rate', 'سعر ثابت')}</span></span>`,
});

/* ------------------------------------------------------------------ pages */
function pageHome(page) {
  return layout(
    page,
    {
      title: tr('Exotic Tint for Trading and Contracting — Premium Window Tinting & Protective Films in Doha', 'إكزوتك تينت للتجارة والمقاولات — تظليل نوافذ وأفلام حماية فاخرة في الدوحة'),
      description: tr(
        'Architectural window films, smart switchable glass, surface protection, decorative films and fabric nano coating across Qatar. 99% UV protection, on-site installation, free estimates.',
        'أفلام نوافذ معمارية وزجاج ذكي قابل للتحويل وحماية أسطح وأفلام ديكورية وطلاء نانو للأقمشة في جميع أنحاء قطر. حماية ٩٩٪ من الأشعة وتركيب في موقعك وتقديرات مجانية.'
      ),
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Exotic Tint for Trading and Contracting',
        alternateName: 'إكزوتك تينت للتجارة والمقاولات',
        url: C.site.domain,
        logo: C.site.domain + '/assets/img/logo-light.webp',
        telephone: C.site.phoneRaw,
        email: C.site.email,
        image: C.site.domain + '/assets/img/residential.webp',
        address: { '@type': 'PostalAddress', addressLocality: 'Doha', addressCountry: 'QA' },
        areaServed: C.areas.map((a) => a[0]),
        openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '08:00', closes: '18:00' },
        sameAs: [C.site.instagram],
      },
    },
    hero() +
      // section 1 is the ice-blue hero; after it, even sections are white and odd ones ice blue
      [
        servicesGrid(),
        howItWorks(),
        tintStudio(),
        savings(),
        showcase(),
        bookFast(),
        gallery(),
        testimonials(),
        faqSection(C.homeFaq),
        quoteSection(),
      ]
        .map((html, i) => `<div class="home-band ${i % 2 ? 'band-ice' : 'bg-white'} py-12 lg:py-16">${html}</div>`)
        .join('')
  );
}

function pageAbout(page) {
  const body = `
${pageHero({
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-white">${icon('user', 'h-4 w-4', 2.2)}</span>${tr('About us', 'من نحن')}`,
  title: tr('Comfort, privacy &amp; protection — <span class="text-grad">installed on-site</span>', 'راحة وخصوصية وحماية — <span class="text-grad">تُركّب في موقعك</span>'),
  text: tr('Exotic Tint for Trading and Contracting specialises in window films, smart glass, surface protection and interior finishes for homes, offices and commercial spaces.', 'تتخصص إكزوتك تينت للتجارة والمقاولات في أفلام النوافذ والزجاج الذكي وحماية الأسطح والتشطيبات الداخلية للمنازل والمكاتب والمساحات التجارية.'),
  crumbs: [[t(C.ui.nav.about)]],
  image: 'commercial',
  alt: tr('Technician working on a glass façade', 'فني يعمل على واجهة زجاجية'),
  chips: chipHeat(),
})}
<section class="py-20 lg:py-28">
  <div class="container-site grid items-center gap-12 lg:grid-cols-2">
    <div class="grid grid-cols-2 gap-4" ${reveal()}>
      <img src="/assets/img/marble.webp" alt="${tr('Marble protection film installation', 'تركيب فيلم حماية الرخام')}" class="aspect-[3/4] w-full rounded-[22px] border-[6px] border-white object-cover shadow-float" loading="lazy">
      <div class="mt-10 space-y-4">
        <img src="/assets/img/frosted.webp" alt="${tr('Decorative frosted film', 'فيلم مصنفر زخرفي')}" class="aspect-square w-full rounded-[22px] border-[6px] border-white object-cover shadow-float" loading="lazy">
        <div class="rounded-[22px] bg-grad p-5 text-white shadow-gold"><span class="block font-head text-4xl font-extrabold">${num(6)}</span><span class="text-sm font-semibold">${tr('Specialist services under one roof', 'خدمات متخصصة تحت سقف واحد')}</span></div>
      </div>
    </div>
    <div>
      ${sectionHead({
        eyebrow: tr('Who we are', 'من نحن'),
        title: tr('A team of specialists <span class="text-grad">who come to you</span>', 'فريق من المختصين <span class="text-grad">يأتي إليك</span>'),
        text: tr('We are a team of skilled professionals offering on-site installation services across Qatar. Our goal is to provide cutting-edge tinting and coating solutions that enhance comfort, aesthetics and durability for homes and buildings.', 'نحن فريق من المحترفين نقدم خدمات التركيب في الموقع في جميع أنحاء قطر. هدفنا تقديم حلول تظليل وطلاء متطورة تعزز الراحة والجمال والمتانة للمنازل والمباني.'),
      })}
      <ul class="mt-8 space-y-3" ${reveal(100)}>
        ${[
          tr('Best heat rejection, UV protection and privacy', 'أفضل عزل حراري وحماية من الأشعة وخصوصية'),
          tr('Expert installation with clear, flat-rate pricing', 'تركيب احترافي بأسعار واضحة وثابتة'),
          tr('Trusted across Doha, Lusail, Al Rayyan and beyond', 'موثوقون في الدوحة ولوسيل والريان وما بعدها'),
        ]
          .map((x) => `<li class="hero-check"><span>${icon('check', 'h-3 w-3', 3)}</span>${x}</li>`)
          .join('')}
      </ul>
    </div>
  </div>
</section>
${promiseSection()}
${statsStrip()}
<div class="-mt-20 lg:-mt-28"></div>
${whyUs()}
${processTimeline()}
${bookFast()}
${gallery()}
${areasSection()}
${testimonials()}
${reviewUs()}
${ctaBanner()}
${quoteSection()}`;
  return layout(
    page,
    {
      title: tr('About Exotic Tint for Trading and Contracting — Window Tint & Protection Specialists', 'عن إكزوتك تينت للتجارة والمقاولات — مختصو التظليل والحماية'),
      description: tr('Meet Exotic Tint for Trading and Contracting: skilled professionals delivering on-site window tinting, frosted film, marble protection and nano coating across Doha, Lusail and Al Rayyan.', 'تعرّف على إكزوتك تينت للتجارة والمقاولات: محترفون يقدمون خدمات التظليل والأفلام المصنفرة وحماية الرخام وطلاء النانو في موقعك.'),
      image: 'commercial',
    },
    body
  );
}

function pageServices(page) {
  const S = C.services;
  // Per-service animation + one honest headline metric (figures from the client's own content)
  const FX = {
    'architectural-window-film-solutions': { fx: 'tint', label: tr('Solar heat blocked', 'حرارة شمس محجوبة'), to: 98, pre: tr('up to ', 'حتى '), unit: '%', chip: tr('99% UV blocked', 'حجب ٩٩٪ من الأشعة') },
    'smart-glass-privacy-solutions': { fx: 'frost', label: tr('Privacy, on demand', 'خصوصية عند الطلب'), to: 100, pre: '', unit: '%', chip: tr('Clear ↔ private in a second', 'شفاف ↔ خاص في ثانية') },
    'surface-protection-solutions': { fx: 'shield', label: tr('Years of protection', 'سنوات حماية'), to: 10, pre: tr('up to ', 'حتى '), unit: tr(' yrs', ' سنوات'), chip: tr('Marble, wood & steel', 'رخام وخشب وستانلس') },
    'decorative-interior-solutions': { fx: 'pattern', label: tr('Designs we can cut', 'تصاميم يمكننا قصها'), to: 100, pre: '', unit: '%', chip: tr('Your logo or pattern', 'شعارك أو نقشك') },
    'fabric-material-protection': { fx: 'bead', label: tr('Spills that soak in', 'انسكابات تتغلغل'), to: 0, from: 100, pre: '', unit: '%', chip: tr('Liquids bead &amp; wipe away', 'السوائل تتجمع وتُمسح') },
  };
  const data = S.map((s) => ({ img: s.img, ...FX[s.slug], label: FX[s.slug].label, chip: FX[s.slug].chip }));

  const hero = `
<section class="px-2.5 sm:px-3">
  <div class="hero-bg relative overflow-hidden rounded-[28px]" data-hero>
    ${aurora()}
    <div class="pointer-events-none absolute inset-0 grid-lines"></div>
    <div class="container-site relative py-12 text-center lg:py-16">
      <nav class="flex items-center justify-center gap-2 text-sm text-muted" aria-label="Breadcrumb" data-a="down">
        <a href="${href()}" class="font-semibold hover:text-gold-700">${t(C.ui.nav.home)}</a>${icon('chevron', 'h-3.5 w-3.5 -rotate-90 rtl:rotate-90')}<span class="font-semibold text-ink">${t(C.ui.nav.services)}</span>
      </nav>
      <h1 class="mx-auto mt-5 max-w-3xl text-balance font-head text-[2.3rem] font-extrabold leading-[1.06] text-ink sm:text-[3.4rem]"><span data-split>${tr('Five ways to protect', 'خمس طرق لحماية')}</span> <span class="text-grad" data-a="up">${tr('what you love.', 'ما تحب.')}</span></h1>
      <p class="mx-auto mt-4 max-w-xl text-[1.06rem] leading-relaxed text-muted" data-a="up">${tr('Scroll to see each film at work — installed on-site across Qatar.', 'مرّر لترى كل فيلم أثناء العمل — نركّبه في موقعك في أنحاء قطر.')}</p>
      <div class="mt-7 flex flex-wrap justify-center gap-2" data-a="up">
        ${S.map((s) => `<a href="#svc-${s.slug}" class="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-3.5 py-2 text-sm font-semibold text-ink shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:text-gold-700">${icon(s.icon, 'h-4 w-4 text-gold-600', 2.2)}${t(s.short)}</a>`).join('')}
      </div>
    </div>
  </div>
</section>`;

  const stage = `
<div class="sv-stage relative" data-sv data-items='${esc(JSON.stringify(data))}' dir="ltr">
  <div class="pointer-events-none absolute -inset-4 rounded-[40px] bg-gradient-to-br from-gold-200/60 via-transparent to-[#c7d5ee]/60 blur-2xl"></div>
  <div class="relative aspect-[16/11] overflow-hidden rounded-[30px] border-[6px] border-white bg-ink shadow-float lg:aspect-[4/4.4]">
    <img src="/assets/img/${S[0].img}.webp" alt="" class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" data-sv-img>
    <!-- before: glare / scratches -->
    <div class="sv-glare absolute inset-0" style="background:radial-gradient(70% 80% at 85% 8%,rgba(255,240,200,.95),rgba(255,190,90,.5) 35%,transparent 70%),linear-gradient(180deg,rgba(255,210,130,.3),rgba(255,170,80,.12))"></div>
    <svg class="sv-scratch absolute inset-0 h-full w-full" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true"><g stroke="rgba(255,255,255,.75)" stroke-width="1.6" stroke-linecap="round" fill="none"><path d="M60 250 L170 210"/><path d="M90 290 L210 250"/><path d="M240 300 L340 240"/><path d="M200 170 L300 140"/><path d="M120 330 L190 310"/></g></svg>
    <!-- after layers (revealed by the sweep) -->
    <div class="sv-layer sv-tint absolute inset-0" style="background:linear-gradient(115deg,rgba(14,26,46,.55),rgba(22,40,70,.38) 50%,rgba(14,26,46,.55))"></div>
    <div class="sv-layer sv-frost absolute inset-0"></div>
    <div class="sv-layer sv-shield absolute inset-0"><span class="sv-sheen absolute inset-0"></span></div>
    <div class="sv-layer sv-pattern absolute inset-0"><span class="sv-brand">${tr('YOUR BRAND', 'علامتك')}</span></div>
    <div class="sv-beads absolute inset-0">${Array.from({ length: 14 }, (_, i) => `<span style="--x:${[12, 22, 35, 48, 60, 72, 84, 18, 41, 55, 68, 80, 30, 90][i]}%;--y:${[30, 52, 38, 60, 34, 56, 42, 72, 78, 70, 82, 66, 64, 76][i]}%;--s:${[26, 18, 22, 30, 20, 24, 16, 21, 28, 18, 23, 19, 15, 21][i]}px;--d:${i * 0.09}s"></span>`).join('')}</div>
    <div class="sv-edge pointer-events-none absolute inset-y-0 w-[3px] bg-white shadow-[0_0_26px_7px_rgba(255,255,255,.65)]"></div>
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/20"></div>

    <div class="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
      <span class="glass-hud inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold text-white ${L === 'ar' ? 'font-arabic' : ''}"><span class="sv-dot h-2 w-2 rounded-full"></span><span data-sv-state data-off="${tr('Before', 'قبل')}" data-on="${tr('Protected by Exotic Tint', 'محمي بإكزوتك تينت')}">${tr('Before', 'قبل')}</span></span>
      <span class="glass-hud rounded-full px-3 py-2 font-head text-xs font-extrabold text-white"><span data-sv-n>${tr('01', '٠١')}</span> / ${tr(pad(S.length), num(pad(S.length)))}</span>
    </div>
    <div class="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
      <div class="room-hud min-w-0 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
        <p class="truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted ${L === 'ar' ? 'font-arabic' : ''}" data-sv-label>${data[0].label}</p>
        <p class="font-head text-2xl font-extrabold leading-tight text-ink sm:text-4xl ${L === 'ar' ? 'font-arabic' : ''}" data-sv-val>—</p>
        <div class="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-line sm:w-40"><div class="h-full rounded-full bg-grad" style="width:0%" data-sv-bar></div></div>
      </div>
      <span class="glass-hud hidden max-w-[11rem] rounded-2xl px-3.5 py-2.5 text-xs font-bold leading-snug text-white sm:block ${L === 'ar' ? 'font-arabic text-right' : ''}" data-sv-chip>${data[0].chip}</span>
    </div>
  </div>
  <div class="mt-4 hidden justify-center gap-1.5 lg:flex">${S.map((_, i) => `<span class="sv-pip h-1.5 w-6 rounded-full bg-line transition-all duration-500" data-sv-pip="${i}"></span>`).join('')}</div>
</div>`;

  const block = (s, i) => `
    <article id="svc-${s.slug}" class="sv-block scroll-mt-28 py-10 lg:flex lg:min-h-[62vh] lg:flex-col lg:justify-center lg:py-0" data-sv-step="${i}">
      <span class="eyebrow"><span class="font-head text-gold-600">${num(pad(i + 1))}</span> ${t(s.short)}</span>
      <h2 class="mt-3 font-head text-[1.85rem] font-extrabold leading-[1.1] text-ink sm:text-[2.3rem]">${t(s.title)}</h2>
      <p class="mt-3 text-[1.02rem] leading-relaxed text-muted">${t(s.summary)}</p>
      <ul class="mt-5 grid gap-2 sm:grid-cols-2">
        ${s.options.slice(0, 6).map(([b]) => `<li class="flex items-center gap-2.5 text-[0.95rem] font-semibold text-ink-2"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tint text-gold-700">${icon('check', 'h-3.5 w-3.5', 3)}</span>${t(b)}</li>`).join('')}
      </ul>
      <div class="mt-6 flex flex-wrap gap-3">
        <a href="${href('service/' + s.slug + '/')}" class="btn btn-primary !py-3 text-sm">${t(C.ui.learnMore)} ${arrow()}</a>
        <a href="${waLink(tr('Hello, I would like a quote for ', 'مرحباً، أرغب في عرض سعر لخدمة ') + t(s.title))}" target="_blank" rel="noopener" class="btn btn-white !py-3 text-sm">${waIcon('h-4 w-4 text-[#25D366]')} ${tr('Free quote', 'عرض مجاني')}</a>
      </div>
    </article>`;

  const body = `
${hero}
<section class="relative pb-16 pt-10 lg:pb-20">
  <div class="container-site grid gap-6 lg:grid-cols-12 lg:gap-14">
    <div class="sticky top-[92px] z-10 lg:col-span-6 lg:top-28 lg:self-start">${stage}</div>
    <div class="lg:col-span-6">${S.map(block).join('')}</div>
  </div>
</section>
${faqSection(C.homeFaq)}
${quoteSection()}`;
  return layout(
    page,
    {
      title: tr('Window Tinting & Protection Services in Qatar | Exotic Tint for Trading and Contracting', 'خدمات التظليل والحماية في قطر | إكزوتك تينت للتجارة والمقاولات'),
      description: tr('Architectural window films, smart switchable glass, surface protection, decorative films and fabric nano coating in Qatar.', 'أفلام النوافذ المعمارية والزجاج الذكي وحماية الأسطح والأفلام الديكورية وطلاء النانو للأقمشة في قطر.'),
      image: 'residential',
    },
    body
  );
}

/* ============================================================
   Service pages — 5 main services, each with its own options.
   Same structure as the original car page: animated hero, auto-playing
   "how it works", an auto-playing options explorer, one unique section,
   three steps, FAQ and CTA.
   ============================================================ */

/* Generic "how it works" stepper — configurable rays */
function howItWorksFor(cfg) {
  const ar = L === 'ar';
  const arrowM = (id, color) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${color}"/></marker>`;
  const line = (cls, d, color, mk) => `<path class="hw-line ${cls}" d="${d}" stroke="${color}" marker-end="url(#${mk})" pathLength="1"/>`;
  const pill = (cls, x, y, color, text, ic) => `<span dir="${ar ? 'rtl' : 'ltr'}" class="hw-pill ${cls}" style="left:${x}%;top:${y}%;--c:${color}">${ic}${text}</span>`;
  const xIc = '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const backIc = '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/></svg>';
  const inIc = '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const IN = ['M114 104 L292 130', 'M112 116 L292 196', 'M104 126 L292 262'];
  const THRU = ['M318 132 L450 146', 'M318 198 L450 206', 'M318 264 L450 268'];
  const ys = [32, 49, 66];
  const mk = ['hw-a0', 'hw-a1', 'hw-a2'];
  const rays = cfg.rays;
  const filmPill = (r, i) =>
    r.film === 'bounce' ? pill('hw-p3', 14, 50, r.color, r.filmLabel, backIc) : r.film === 'block' ? pill('hw-p3', 52, [40, 57, 74][i], r.color, r.filmLabel, xIc) : pill('hw-p3', 57, ys[i], r.color, r.filmLabel, inIc);
  const meterVal = (v) => (typeof v === 'number' ? (ar ? v.toLocaleString('ar-EG') : v) + (cfg.unit || '') : v);
  const diagram = `
  <div class="hw-diagram relative" dir="ltr">
    <svg viewBox="0 0 640 360" class="w-full" aria-hidden="true">
      <defs>${rays.map((r, i) => arrowM(mk[i], r.color)).join('')}
        <radialGradient id="hw-sun2"><stop offset="0" stop-color="#fff7e0"/><stop offset=".6" stop-color="#f6c766"/><stop offset="1" stop-color="#e9a63b"/></radialGradient>
        <linearGradient id="hw-in2" x1="0" x2="1"><stop offset="0" stop-color="#f3f6fb"/><stop offset="1" stop-color="#e9eff8"/></linearGradient>
      </defs>
      <rect x="326" y="16" width="300" height="328" rx="22" fill="url(#hw-in2)"/>
      <rect x="326" y="16" width="300" height="328" rx="22" fill="#ef4444" class="hw-hot"/>
      <rect x="326" y="16" width="300" height="328" rx="22" fill="#38bdf8" class="hw-cool"/>
      <text x="40" y="34" class="hw-zone">${cfg.outZone}</text>
      <text x="378" y="46" class="hw-zone">${cfg.inZone}</text>
      ${cfg.sourceEmoji ? '' : '<circle cx="80" cy="96" r="54" fill="#f6c766" opacity=".2"/><circle cx="80" cy="96" r="32" fill="url(#hw-sun2)"/>'}
      ${rays.map((r, i) => line('hw-in' + (i + 1), IN[i], r.color, mk[i])).join('')}
      ${rays.map((r, i) => line('hw-thru' + (r.film === 'pass' ? ' fp' : ''), THRU[i], r.color, mk[i])).join('')}
      ${rays[0].film === 'bounce' ? line('hw-bounce', 'M292 134 L150 206', rays[0].color, mk[0]) : ''}
      <rect x="296" y="40" width="20" height="290" rx="6" fill="${cfg.baseFill || '#d9ecff'}" stroke="${cfg.baseStroke || '#9cc4ea'}" stroke-width="2"/>
      <rect x="316" y="40" width="9" height="290" rx="3" fill="${cfg.layerFill || '#1d3150'}" class="hw-film"/>
      <text x="306" y="352" text-anchor="middle" class="hw-small">${cfg.baseLabel}</text>
      <rect x="596" y="64" width="16" height="200" rx="8" fill="#fff" stroke="#e3e7ee" stroke-width="2"/>
      <rect x="600" y="70" width="8" height="190" rx="4" fill="#ef4444" class="hw-merc"/>
      <circle cx="604" cy="276" r="15" fill="#ef4444" class="hw-bulb"/>
    </svg>
    ${cfg.sourceEmoji ? `<img src="/assets/img/3d/${cfg.sourceEmoji}.webp" alt="" class="absolute h-[19%] w-auto" style="left:6%;top:15%">` : ''}
    <img src="/assets/img/3d/${cfg.insideEmoji}.webp" alt="" class="absolute h-[34%] w-auto drop-shadow-xl" style="left:72%;top:40%">
    ${rays.map((r, i) => pill('hw-p1', [22, 21, 19][i], [22, 43, 64][i], r.color, r.label, '')).join('')}
    ${rays.map((r, i) => pill('hw-p2', 58, ys[i], r.color, r.inLabel, inIc)).join('')}
    ${rays.map(filmPill).join('')}
    ${pill('hw-p3 hw-film-tag', 46, 7, '#1d3150', cfg.layerLabel, '')}
    <span class="hw-temp" data-hw-temp>${meterVal(cfg.meter[0])}</span>
  </div>`;
  const s = cfg.steps;
  return `
<section class="relative pt-20 lg:pt-28" data-assemble>
  <div class="container-site">
    <div data-a="up">
      <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-gold-700">${tr('How it works', 'كيف يعمل')}</p>
      <h2 class="mt-3 font-head text-[2rem] font-extrabold leading-tight text-ink sm:text-[2.7rem]">${cfg.title}</h2>
    </div>
    <div class="hw mt-8 overflow-hidden rounded-[28px] border border-line bg-white shadow-soft" data-hw data-temps='${esc(JSON.stringify(cfg.meter))}' data-unit='${cfg.unit || ''}' data-a="up">
      <div class="grid grid-cols-4 border-b border-line" role="tablist">
        ${s.map((st, i) => `<button type="button" role="tab" aria-selected="${i === 0}" class="hw-tab relative px-2 py-4 text-center sm:px-4" data-hw-tab="${i}">
          <span class="block text-[11px] font-extrabold text-gold-700">${num(pad(i + 1))}</span>
          <span class="block font-head text-sm font-bold text-ink sm:text-base">${st[0]}</span>
          <span class="absolute inset-x-0 bottom-0 h-[3px]"><span class="hw-bar block h-full bg-grad"></span></span>
        </button>`).join('')}
      </div>
      <div class="grid items-center gap-6 p-5 sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-10">
        <div class="lg:col-span-4">
          ${s.map((st, i) => `<div class="hw-cap ${i === 0 ? 'is-on' : ''}" data-hw-cap="${i}">
            <h3 class="font-head text-[1.6rem] font-extrabold leading-tight text-ink sm:text-[1.9rem]">${st[1]}</h3>
            <p class="mt-3 text-[1.03rem] leading-relaxed text-muted">${st[2]}</p>
            ${i === 2 && cfg.chips ? `<div class="mt-5 flex flex-wrap gap-2">${cfg.chips.map(([c, t2]) => `<span class="rounded-full bg-${c}-50 px-3 py-1.5 text-sm font-bold text-${c}-600">${t2}</span>`).join('')}</div>` : ''}
            ${i === 3 ? `<ul class="mt-5 space-y-2 text-[0.98rem] font-semibold text-ink-2">${cfg.results.map((x) => `<li class="flex items-center gap-2.5"><span class="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-600">${icon('check', 'h-3.5 w-3.5', 3)}</span>${x}</li>`).join('')}</ul>${cfg.note ? `<p class="mt-3 text-xs text-muted">${cfg.note}</p>` : ''}` : ''}
          </div>`).join('')}
        </div>
        <div class="lg:col-span-8">${diagram}</div>
      </div>
    </div>
  </div>
</section>`;
}

/* Looping photo demo for heroes: tint / frost / shield / bead / smart (switchable) / pattern (decor & branding) */
function fxStage(cfg) {
  const ar = L === 'ar';
  return `
  <div class="relative" data-a="up">
    <div class="pointer-events-none absolute -inset-4 rounded-[40px] bg-gradient-to-br from-gold-200/60 via-transparent to-[#c7d5ee]/60 blur-2xl"></div>
    <div class="relative aspect-[4/3] overflow-hidden rounded-[30px] border-[6px] border-white bg-ink shadow-float" data-sv data-svh data-fx="${cfg.fx}" data-vals='${esc(JSON.stringify(cfg.vals))}' dir="ltr">
      <img src="/assets/img/${cfg.img}.webp" alt="${esc(cfg.alt)}" class="absolute inset-0 h-full w-full object-cover" style="object-position:${cfg.pos || '50% 50%'}" fetchpriority="high">
      <div class="sv-glare absolute inset-0" style="background:radial-gradient(70% 80% at 85% 8%,rgba(255,240,200,.95),rgba(255,190,90,.5) 35%,transparent 70%),linear-gradient(180deg,rgba(255,210,130,.3),rgba(255,170,80,.12))"></div>
      <svg class="sv-scratch absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true"><g stroke="rgba(255,255,255,.8)" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M60 190 L170 160"/><path d="M90 220 L210 190"/><path d="M240 230 L340 180"/><path d="M200 130 L300 105"/><path d="M120 250 L190 236"/></g></svg>
      <div class="sv-layer sv-tint absolute inset-0" style="background:linear-gradient(115deg,rgba(14,26,46,.55),rgba(22,40,70,.38) 50%,rgba(14,26,46,.55))"></div>
      <div class="sv-layer sv-frost absolute inset-0"></div>
      <div class="sv-layer sv-shield absolute inset-0"><span class="sv-sheen absolute inset-0"></span></div>
      <div class="sv-layer sv-pattern absolute inset-0"><span class="sv-brand">${tr('YOUR BRAND', 'علامتك')}</span></div>
      <div class="sv-beads absolute inset-0">${Array.from({ length: 14 }, (_, i) => `<span style="--x:${[12, 22, 35, 48, 60, 72, 84, 18, 41, 55, 68, 80, 30, 90][i]}%;--y:${[30, 52, 38, 60, 34, 56, 42, 72, 78, 70, 82, 66, 64, 76][i]}%;--s:${[26, 18, 22, 30, 20, 24, 16, 21, 28, 18, 23, 19, 15, 21][i]}px;--d:${i * 0.07}s"></span>`).join('')}</div>
      <div class="sv-edge pointer-events-none absolute inset-y-0 w-[3px] bg-white shadow-[0_0_26px_7px_rgba(255,255,255,.65)]"></div>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"></div>
      <span class="glass-hud absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold text-white ${ar ? 'font-arabic' : ''}"><span class="sv-dot h-2 w-2 rounded-full"></span><span data-svh-state data-off="${cfg.off}" data-on="${cfg.on}">${cfg.off}</span></span>
      ${cfg.fx === 'smart' ? `<span class="sv-switch glass-hud absolute right-4 top-4 inline-flex items-center gap-2 rounded-full py-1.5 pl-3 pr-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white" aria-hidden="true">${icon('bolt', 'h-3.5 w-3.5', 2.4)}<span class="sv-toggle"><span></span></span></span>` : ''}
      <div class="room-hud absolute bottom-4 left-4 rounded-2xl px-4 py-3 ${ar ? 'text-right' : ''}" dir="${ar ? 'rtl' : 'ltr'}">
        <p class="text-[11px] font-bold uppercase tracking-wider text-muted">${cfg.metric}</p>
        <p class="font-head text-2xl font-extrabold leading-tight text-ink sm:text-3xl" data-svh-val>${cfg.vals[0]}</p>
      </div>
    </div>
    ${cfg.caption ? `<p class="mt-3 text-center text-[11px] text-muted">${cfg.caption}</p>` : ''}
  </div>`;
}

/* 3D villa room (same scene as the homepage) */
function roomStage() {
  return `
  <div class="relative" data-a="up">
    <div class="room3d relative aspect-[4/5] w-full sm:aspect-[5/4]" data-room>
      <div class="pointer-events-none absolute inset-[12%] rounded-full bg-gold-300/30 blur-[80px]"></div>
      <canvas class="relative h-full w-full" aria-label="${tr('3D living room showing window film blocking the sun', 'غرفة ثلاثية الأبعاد توضح حجب فيلم النوافذ للشمس')}" role="img"></canvas>
      <img src="/assets/img/residential.webp" alt="" class="room-fallback-img absolute inset-[8%] hidden h-[84%] w-[84%] rounded-[28px] object-cover shadow-float">
${roomDock('ruv2')}
    </div>
  </div>`;
}

/* Options explorer — every sub-option of a main service, auto-playing like a short film.
   Each item: { title, desc, img, pos, layer (html), stat: [label, value], tag } */
function optionExplorer({ kicker, title, text, items, wa }) {
  const ar = L === 'ar';
  return `
<section class="px-2.5 pt-20 sm:px-3 lg:pt-28">
  <div class="relative overflow-hidden rounded-[28px] bg-ink" data-assemble>
    <div class="pointer-events-none absolute inset-0 grid-lines-dark"></div>
    <div class="pointer-events-none absolute -top-40 end-[-10%] h-[28rem] w-[28rem] rounded-full bg-gold-500/20 blur-[110px]"></div>
    <div class="container-site relative py-16 lg:py-24">
      <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-end" data-a="up">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-gold-300">${kicker}</p>
          <h2 class="mt-3 max-w-2xl font-head text-[2rem] font-extrabold leading-tight text-white sm:text-[2.7rem]">${title}</h2>
        </div>
        <p class="max-w-sm text-white/60">${text}</p>
      </div>
      <div class="ox mt-10 grid gap-6 lg:grid-cols-12 lg:gap-10" data-ox style="--ox-dur:4800ms" data-a="up">
        <div class="order-2 lg:order-1 lg:col-span-5" role="tablist">
          ${items.map((it, i) => `<button type="button" role="tab" aria-selected="${i === 0}" class="ox-tab ${i === 0 ? 'is-on' : ''}" data-ox-tab="${i}">
            <span class="ox-num">${num(pad(i + 1))}</span>
            <span class="min-w-0 flex-1 text-start">
              <span class="ox-title">${it.title}</span>
              <span class="ox-desc"><span>${it.desc}</span></span>
            </span>
            <span class="ox-bar" aria-hidden="true"><span></span></span>
          </button>`).join('')}
          <a href="${wa}" target="_blank" rel="noopener" class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-gold-400 decoration-2 underline-offset-8 hover:text-gold-300">${tr('Not sure which one? Ask us', 'لست متأكداً؟ اسألنا')} ${arrow('h-4 w-4')}</a>
        </div>
        <div class="order-1 lg:order-2 lg:col-span-7">
          <div class="ox-stage relative aspect-[4/3] overflow-hidden rounded-[24px] border-[5px] border-white/10 bg-ink-2 shadow-float" dir="ltr">
            ${items.map((it, i) => `<div class="ox-panel ${i === 0 ? 'is-on' : ''}" data-ox-panel="${i}" ${i ? 'aria-hidden="true"' : ''}>
              ${it.img ? `<img src="/assets/img/${it.img}.webp" alt="" class="ox-img absolute inset-0 h-full w-full object-cover" style="object-position:${it.pos || '50% 50%'}" loading="lazy">` : ''}
              <div class="ox-layer absolute inset-0">${it.layer || ''}</div>
              <span class="ox-edge" aria-hidden="true"></span>
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/10"></div>
              <span class="glass-hud absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold text-white ${ar ? 'font-arabic' : ''}" dir="${ar ? 'rtl' : 'ltr'}"><span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.25)]"></span>${it.tag || it.title}</span>
              <div class="room-hud ox-stat absolute bottom-4 left-4 rounded-2xl px-4 py-3 ${ar ? 'text-right' : ''}" dir="${ar ? 'rtl' : 'ltr'}">
                <p class="text-[11px] font-bold uppercase tracking-wider text-muted">${it.stat[0]}</p>
                <p class="font-head text-2xl font-extrabold leading-tight text-ink sm:text-3xl">${it.stat[1]}</p>
              </div>
              <span class="absolute bottom-4 right-4 font-head text-5xl font-extrabold leading-none text-white/20 sm:text-6xl">${num(pad(i + 1))}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* Overlay helpers for the explorer (pure CSS/SVG so every option gets a clear visual) */
const OX = {
  tint: (a = 0.42) => `<div class="absolute inset-0" style="background:linear-gradient(115deg,rgba(14,26,46,${a}),rgba(22,40,70,${a * 0.7}) 50%,rgba(14,26,46,${a}))"></div>`,
  mirror: () => `<div class="absolute inset-0" style="background:linear-gradient(135deg,rgba(238,242,247,.9),rgba(168,180,196,.82) 42%,rgba(242,245,249,.88) 62%,rgba(186,197,211,.85))"></div><div class="ox-sheen absolute inset-0"></div>`,
  frost: (css = 'background:rgba(255,255,255,.42)') => `<div class="absolute inset-0" style="${css};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)"></div>`,
  blackout: () => `<div class="absolute inset-0" style="background:rgba(4,7,12,.93)"></div>`,
  sky: () => `<div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(14,26,46,.62),rgba(14,26,46,.3) 55%,transparent 80%)"></div>`,
  crack: () => `<div class="absolute inset-0" style="background:rgba(160,200,230,.12)"></div><svg class="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true"><g stroke="rgba(255,255,255,.9)" stroke-width="1.4" fill="none" stroke-linecap="round"><path d="M250 120 L330 40 M250 120 L360 140 M250 120 L300 250 M250 120 L150 60 M250 120 L170 220 M250 120 L120 140"/><path d="M290 80 L330 100 M300 175 L340 200 M200 90 L210 140 M205 170 L250 190 M160 110 L180 160" stroke-width="1"/></g><circle cx="250" cy="120" r="7" fill="rgba(255,255,255,.95)"/></svg>`,
  sheen: () => `<div class="ox-sheen absolute inset-0"></div><div class="absolute inset-0" style="box-shadow:inset 0 0 0 3px rgba(76,198,242,.55)"></div>`,
  beads: (n = 9) => `<div class="ox-beads absolute inset-0">${Array.from({ length: n }, (_, i) => `<span style="left:${[18, 32, 46, 60, 74, 26, 52, 66, 40][i]}%;top:${[38, 56, 42, 60, 46, 70, 74, 32, 26][i]}%;--s:${[24, 18, 28, 20, 16, 22, 18, 26, 14][i]}px;--d:${i * 0.12}s"></span>`).join('')}</div>`,
  brand: () => `<div class="absolute inset-0" style="background:linear-gradient(180deg,transparent 0 30%,rgba(255,255,255,.5) 30% 62%,transparent 62%);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)"></div><div class="absolute inset-x-0 top-[38%] text-center font-head text-[2.2rem] font-black uppercase tracking-[0.25em] text-ink/80 sm:text-5xl">${tr('Your logo', 'شعارك')}</div>`,
  steel: () => `<div class="ox-steel absolute inset-0"></div><div class="ox-prints absolute inset-0"></div>`,
  wood: () => `<div class="ox-wood absolute inset-0"></div>`,
  wall: () => `<div class="ox-wall absolute inset-0"></div><img src="/assets/img/3d/couch.webp" alt="" class="absolute bottom-[6%] left-1/2 h-[42%] w-auto -translate-x-1/2 drop-shadow-2xl">`,
  smart: () => `<div class="ox-smart absolute inset-0"></div>`,
};

function shadeStrip(img, title, text) {
  const shades = [
    [70, tr('Almost clear', 'شبه شفاف'), tr('Keeps your view, cuts the heat', 'يحافظ على الإطلالة ويقلل الحرارة')],
    [50, tr('Light', 'فاتح'), tr('Subtle look, less glare', 'مظهر هادئ ووهج أقل')],
    [35, tr('Medium', 'متوسط'), tr('Our most popular balance', 'التوازن الأكثر طلباً')],
    [20, tr('Dark', 'داكن'), tr('Strong daytime privacy', 'خصوصية نهارية قوية')],
    [5, tr('Max', 'أقصى'), tr('Full privacy, bedrooms & media rooms', 'خصوصية كاملة لغرف النوم والسينما')],
  ];
  return `
<section class="py-20 lg:py-28" data-assemble>
  <div class="container-site">
    <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-end" data-a="up">
      <h2 class="font-head text-[2rem] font-extrabold leading-tight text-ink sm:text-[2.7rem]">${title}</h2>
      <p class="max-w-sm text-muted">${text}</p>
    </div>
    <div class="shade-strip mt-10 flex h-[420px] gap-2 overflow-hidden rounded-[28px] sm:h-[460px]" data-a="up" dir="ltr">
      ${shades.map(([v, n, u], i) => `<div class="shade group relative flex-1 overflow-hidden rounded-[18px] ${i === 2 ? 'is-on' : ''}" tabindex="0">
        <img src="/assets/img/${img}.webp" alt="" class="absolute inset-0 h-full w-full object-cover" style="object-position:${18 + i * 16}% 50%" loading="lazy">
        <div class="absolute inset-0" style="background:rgba(8,12,20,${((100 - v) / 100) * 0.85})"></div>
        <div class="absolute inset-x-0 bottom-0 p-4 text-white ${L === 'ar' ? 'text-right' : ''}" dir="${L === 'ar' ? 'rtl' : 'ltr'}">
          <p class="font-head text-3xl font-extrabold leading-none sm:text-4xl" dir="ltr">${v}%</p>
          <p class="shade-more mt-2 font-head font-bold">${n}</p>
          <p class="shade-more text-xs text-white/75">${u}</p>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

function finishGrid(img, title, text, items) {
  // items: [name, note, overlay css]
  return `
<section class="py-20 lg:py-28" data-assemble>
  <div class="container-site">
    <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-end" data-a="up">
      <h2 class="font-head text-[2rem] font-extrabold leading-tight text-ink sm:text-[2.7rem]">${title}</h2>
      <p class="max-w-sm text-muted">${text}</p>
    </div>
    <div class="mt-10 grid gap-3 ${items.length === 2 ? 'sm:grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}">
      ${items.map(([n, note, overlay]) => `<div class="group relative ${items.length === 2 ? 'aspect-[4/3]' : 'aspect-[3/4]'} overflow-hidden rounded-[22px]" data-a="up">
        <img src="/assets/img/${img}.webp" alt="" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy">
        <div class="absolute inset-0" style="${overlay}"></div>
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4 pt-16">
          <p class="font-head text-lg font-bold text-white">${n}</p>
          <p class="text-xs text-white/75">${note}</p>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

function spillTest() {
  const drinks = [
    [tr('Water', 'ماء'), 'rgba(170,210,245,.85)'],
    [tr('Coffee', 'قهوة'), 'rgba(120,72,36,.9)'],
    [tr('Juice', 'عصير'), 'rgba(240,140,40,.9)'],
  ];
  return `
<section class="py-20 lg:py-28" data-assemble>
  <div class="container-site">
    <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-end" data-a="up">
      <h2 class="font-head text-[2rem] font-extrabold leading-tight text-ink sm:text-[2.7rem]">${tr('The spill <span class="text-grad">test.</span>', 'اختبار <span class="text-grad">الانسكاب.</span>')}</h2>
      <p class="max-w-sm text-muted">${tr('Coated fabric makes liquids sit on top as drops. Blot them away before they soak in.', 'القماش المطلي يجعل السوائل تبقى قطرات على السطح. امسحها قبل أن تتغلغل.')}</p>
    </div>
    <div class="mt-10 grid gap-4 md:grid-cols-3">
      ${drinks.map(([n, c], k) => `<div class="spill relative aspect-[4/3] overflow-hidden rounded-[22px]" data-a="up" style="--liq:${c}">
        <img src="/assets/img/nano.webp" alt="" class="absolute inset-0 h-full w-full object-cover" style="object-position:${20 + k * 30}% 70%" loading="lazy">
        <div class="absolute inset-0 bg-[#e9e4dc]/70"></div>
        ${[[30, 45, 34], [55, 40, 26], [44, 62, 30], [68, 60, 20], [24, 66, 18]].map(([x, y, s2], j) => `<span class="spill-drop" style="left:${x}%;top:${y}%;width:${s2}px;height:${s2 * 0.82}px;--d:${j * 0.15 + k * 0.4}s"></span>`).join('')}
        <span class="absolute start-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold text-ink shadow">${n}</span>
        <span class="absolute bottom-4 end-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">${icon('check', 'h-3.5 w-3.5', 3)} ${tr('Beads up', 'تتجمع قطرات')}</span>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

/* Per-service setup */
function premiumConfig(slug) {
  const s = C.services.find((x) => x.slug === slug);
  if (!s) return null;
  const opt = (i) => (s.options[i] ? { title: t(s.options[i][0]), desc: t(s.options[i][1]) } : {});
  const heat = (inZone, baseLabel, insideEmoji, title, steps, results, meter, note) => ({
    title, outZone: tr('OUTSIDE', 'الخارج'), inZone, baseLabel, insideEmoji, layerLabel: tr('Ceramic film', 'فيلم سيراميك'), unit: '°C', meter, note,
    rays: [
      { color: '#ef4444', label: tr('Heat 53%', 'حرارة ٥٣٪'), inLabel: tr('Heat gets in', 'الحرارة تدخل'), film: 'bounce', filmLabel: tr('Heat bounced back', 'الحرارة ارتدت') },
      { color: '#e9a63b', label: tr('Light 44%', 'ضوء ٤٤٪'), inLabel: tr('Light gets in', 'الضوء يدخل'), film: 'pass', filmLabel: tr('Light comes in', 'الضوء يدخل') },
      { color: '#8b5cf6', label: tr('UV 3%', 'أشعة ٣٪'), inLabel: tr('UV gets in', 'الأشعة تدخل'), film: 'block', filmLabel: tr('UV blocked', 'الأشعة محجوبة') },
    ],
    chips: [['rose', tr('Up to 98% heat blocked', 'حجب حتى ٩٨٪ من الحرارة')], ['violet', tr('99% UV blocked', 'حجب ٩٩٪ من الأشعة')]],
    steps, results,
  });
  const C2 = {
    'architectural-window-film-solutions': {
      kicker: tr('Architectural window film', 'أفلام النوافذ المعمارية'),
      h1: [tr('Bright rooms.', 'غرف مشرقة.'), tr('Without the heat.', 'دون حرارة.')],
      sub: tr('Six films for villas, offices and towers — heat control, safety, mirror, privacy, blackout and skylights. Fitted on-site.', 'ستة أفلام للفلل والمكاتب والأبراج — عزل حراري وأمان وعاكس وخصوصية وتعتيم ومناور. تُركّب في موقعك.'),
      facts: [['clock', tr('Most homes in a day', 'معظم المنازل في يوم')], ['building', tr('Villas to full towers', 'من الفلل إلى الأبراج')], ['sun', tr('Keeps your view', 'يحافظ على الإطلالة')]],
      wa: tr('Hi, I want a price for window film. Building / number of windows: ', 'مرحباً، أريد سعر أفلام النوافذ. المبنى / عدد النوافذ: '),
      stage: 'room',
      how: heat(tr('INSIDE', 'الداخل'), tr('Window', 'النافذة'), 'couch', tr('How the film keeps <span class="text-grad">rooms cool</span>', 'كيف يُبقي الفيلم <span class="text-grad">الغرف باردة</span>'),
        [[tr('Sun', 'الشمس'), tr('The sun hits your glass', 'الشمس تضرب زجاجك'), tr('Big windows bring in light — and a lot of heat and UV with it.', 'النوافذ الكبيرة تُدخل الضوء — ومعه الكثير من الحرارة والأشعة.')],
         [tr('No film', 'بدون فيلم'), tr('Without film, rooms heat up', 'بدون فيلم، تسخن الغرف'), tr('Heat pours in, the AC runs all day, and furniture slowly fades.', 'تدخل الحرارة ويعمل المكيف طوال اليوم ويبهت الأثاث تدريجياً.')],
         [tr('With film', 'مع الفيلم'), tr('With Exotic Tint', 'مع إكزوتك تينت'), tr('The ceramic layer bounces heat back out and stops UV. Daylight still fills the room.', 'طبقة السيراميك تعكس الحرارة وتوقف الأشعة. ويبقى ضوء النهار يملأ الغرفة.')],
         [tr('Result', 'النتيجة'), tr('What you get', 'ماذا تحصل عليه'), tr('A room you can actually sit in at 3 PM — and a smaller Kahramaa bill.', 'غرفة يمكنك الجلوس فيها الساعة ٣ عصراً — وفاتورة كهرماء أصغر.')]],
        [tr('Up to 9°C cooler rooms*', 'غرف أبرد حتى ٩°*'), tr('Lower electricity bills', 'فواتير كهرباء أقل'), tr('Floors & furniture protected', 'حماية الأرضيات والأثاث')], [30, 41, 32, 32], tr('*From our Doha villa example. Results vary.', '*من مثال فيلا في الدوحة. النتائج تختلف.')),
      ox: {
        kicker: tr('Six films', 'ستة أفلام'),
        title: tr('One service. <span class="text-grad">A film for every window.</span>', 'خدمة واحدة. <span class="text-grad">فيلم لكل نافذة.</span>'),
        text: tr('Watch each film at work — or tap one to see it.', 'شاهد كل فيلم أثناء العمل — أو اضغط على أحدها لتراه.'),
        items: [
          { ...opt(0), img: 'residential', pos: '60% 50%', layer: OX.tint(0.4), stat: [tr('Heat blocked', 'الحرارة المحجوبة'), tr('Up to 98%', 'حتى ٩٨٪')] },
          { ...opt(1), img: 'commercial', pos: '70% 40%', layer: OX.crack(), stat: [tr('If the glass breaks', 'إذا انكسر الزجاج'), tr('Held in place', 'يبقى متماسكاً')] },
          { ...opt(2), img: 'blog-home', pos: '50% 50%', layer: OX.mirror(), stat: [tr('From outside', 'من الخارج'), tr('Mirror finish', 'مظهر مرآة')] },
          { ...opt(3), img: 'residential', pos: '40% 50%', layer: OX.tint(0.68), stat: [tr('Seen from outside', 'المرئي من الخارج'), tr('Almost nothing', 'تقريباً لا شيء')] },
          { ...opt(4), img: 'blog-ceramic', pos: '50% 50%', layer: OX.blackout(), stat: [tr('Light blocked', 'الضوء المحجوب'), '100%'] },
          { ...opt(5), img: 'commercial', pos: '50% 0%', layer: OX.sky(), stat: [tr('Overhead glare', 'الوهج العلوي'), tr('Gone', 'اختفى')] },
        ],
      },
      middle: () => shadeStrip('residential', tr('Same room. <span class="text-grad">Five shades.</span>', 'نفس الغرفة. <span class="text-grad">خمس درجات.</span>'), tr('Lower % = darker and more private. The film type, not the shade, blocks the heat.', 'نسبة أقل = أغمق وأكثر خصوصية. نوع الفيلم وليس الدرجة هو ما يحجب الحرارة.')),
      steps: [[tr('Send window sizes or photos', 'أرسل المقاسات أو الصور'), tr('On WhatsApp. We reply with a fixed price.', 'عبر واتساب. نرد بسعر ثابت.')], [tr('We visit and measure', 'نزورك ونقيس'), tr('Any day, 8 AM to 6 PM, at no cost.', 'أي يوم من ٨ ص إلى ٦ م، مجاناً.')], [tr('Fitted, clean, done', 'تركيب نظيف وجاهز'), tr('Evenings and weekends for offices.', 'مساءً وفي العطلات للمكاتب.')]],
      cta: [tr('Send a photo of your windows. <span class="text-grad">Get a price today.</span>', 'أرسل صورة لنوافذك. <span class="text-grad">واحصل على السعر اليوم.</span>'), 'residential'],
    },
    'smart-glass-privacy-solutions': {
      kicker: tr('Smart switchable film', 'الفيلم الذكي القابل للتحويل'),
      h1: [tr('Clear glass.', 'زجاج شفاف.'), tr('Private in one tap.', 'وخاص بلمسة واحدة.')],
      sub: tr('Smart film goes on your existing glass. Switch it off and the glass frosts — switch it on and it’s crystal clear again.', 'يُركّب الفيلم الذكي على زجاجك الحالي. أطفئه فيصبح الزجاج مصنفراً — وشغّله فيعود شفافاً تماماً.'),
      facts: [['bolt', tr('Switch, remote or app', 'مفتاح أو ريموت أو تطبيق')], ['frost', tr('No new glass needed', 'دون تغيير الزجاج')], ['sun', tr('Light still comes in', 'الضوء يبقى يدخل')]],
      wa: tr('Hi, I want a price for smart switchable film. Glass size / room: ', 'مرحباً، أريد سعر الفيلم الذكي. مقاس الزجاج / الغرفة: '),
      stage: { fx: 'smart', img: 'residential', pos: '60% 50%', alt: tr('Office glass with smart film', 'زجاج مكتب مع فيلم ذكي'), off: tr('Clear mode', 'الوضع الشفاف'), on: tr('Privacy mode', 'وضع الخصوصية'), metric: tr('Seen from outside', 'المرئي من الخارج'), vals: [tr('Everything', 'كل شيء'), tr('Nothing', 'لا شيء')] },
      how: { title: tr('How smart film <span class="text-grad">switches</span>', 'كيف يتحول <span class="text-grad">الفيلم الذكي</span>'), outZone: tr('CORRIDOR', 'الممر'), inZone: tr('YOUR ROOM', 'غرفتك'), baseLabel: tr('Glass', 'الزجاج'), sourceEmoji: 'camera', insideEmoji: 'locked', layerLabel: tr('Smart film', 'فيلم ذكي'), layerFill: '#dfe7ef',
        rays: [
          { color: '#1d3150', label: tr('Eyes', 'الأنظار'), inLabel: tr('Can see in', 'يرون الداخل'), film: 'block', filmLabel: tr('View blocked', 'الرؤية محجوبة') },
          { color: '#e9a63b', label: tr('Light', 'الضوء'), inLabel: tr('Light in', 'الضوء يدخل'), film: 'pass', filmLabel: tr('Soft light in', 'ضوء ناعم يدخل') },
          { color: '#8b5cf6', label: tr('Screens', 'الشاشات'), inLabel: tr('Visible', 'مرئية'), film: 'block', filmLabel: tr('Kept private', 'تبقى خاصة') },
        ],
        meter: ['', tr('Fully seen', 'مرئي كلياً'), tr('Private', 'خاص'), tr('Private', 'خاص')],
        steps: [[tr('Power on', 'تشغيل'), tr('Power on: crystal clear', 'عند التشغيل: شفاف تماماً'), tr('Open, bright and see-through — like normal glass.', 'مفتوح ومشرق وشفاف — مثل الزجاج العادي.')], [tr('Need privacy', 'وقت الخصوصية'), tr('A meeting starts', 'يبدأ الاجتماع'), tr('Everyone in the corridor can see the screen and the people.', 'الجميع في الممر يرون الشاشة والأشخاص.')], [tr('Switch off', 'إيقاف'), tr('One tap — it frosts', 'لمسة واحدة — فيتصنفر'), tr('The film scatters the view in a second. Daylight still passes.', 'يشتت الفيلم الرؤية في ثانية. ويبقى ضوء النهار يمر.')], [tr('Result', 'النتيجة'), tr('What you get', 'ماذا تحصل عليه'), tr('Privacy when you want it, open glass when you don’t.', 'خصوصية عندما تريدها وزجاج مفتوح عندما لا تحتاجها.')]],
        results: [tr('Clear ↔ private in a second', 'شفاف ↔ خاص في ثانية'), tr('No blinds to clean', 'لا ستائر للتنظيف'), tr('Can double as a projection screen', 'يمكن استخدامه كشاشة عرض')] },
      ox: {
        kicker: tr('Smart Switchable Film', 'الفيلم الذكي القابل للتحويل'),
        title: tr('One film. <span class="text-grad">Every room that needs privacy.</span>', 'فيلم واحد. <span class="text-grad">لكل غرفة تحتاج خصوصية.</span>'),
        text: tr('Applied to your existing glass. Power on: clear. Power off: frosted.', 'يُركّب على زجاجك الحالي. عند التشغيل: شفاف. عند الإيقاف: مصنفر.'),
        items: [
          { title: tr('Meeting rooms', 'غرف الاجتماعات'), desc: tr('Clear for the team, private for the meeting.', 'شفاف للفريق وخاص للاجتماع.'), img: 'commercial', pos: '75% 40%', layer: OX.smart(), tag: tr('Switching…', 'يتحول…'), stat: [tr('Switches in', 'يتحول خلال'), tr('Under 1 sec', 'أقل من ثانية')] },
          { title: tr('Bathrooms & bedrooms', 'الحمامات وغرف النوم'), desc: tr('Glass walls without giving up privacy.', 'جدران زجاجية دون التخلي عن الخصوصية.'), img: 'residential', pos: '70% 50%', layer: OX.smart(), tag: tr('Switching…', 'يتحول…'), stat: [tr('Controlled by', 'التحكم'), tr('Switch or app', 'مفتاح أو تطبيق')] },
          { title: tr('Clinics & offices', 'العيادات والمكاتب'), desc: tr('Private consultations behind open-looking glass.', 'استشارات خاصة خلف زجاج يبدو مفتوحاً.'), img: 'blog-ceramic', pos: '50% 50%', layer: OX.smart(), tag: tr('Switching…', 'يتحول…'), stat: [tr('Privacy', 'الخصوصية'), tr('On demand', 'عند الطلب')] },
          { title: tr('Shopfronts & screens', 'الواجهات والشاشات'), desc: tr('Frosted mode doubles as a projection screen.', 'الوضع المصنفر يعمل كشاشة عرض.'), img: 'blog-home', pos: '50% 50%', layer: OX.smart(), tag: tr('Switching…', 'يتحول…'), stat: [tr('Frosted mode', 'الوضع المصنفر'), tr('Projection-ready', 'جاهز للعرض')] },
        ],
      },
      middle: () => '',
      steps: [[tr('Send the glass size', 'أرسل مقاس الزجاج'), tr('Plus where the switch should go.', 'ومكان المفتاح المطلوب.')], [tr('We measure & wire', 'نقيس ونمدد الأسلاك'), tr('Film cut to size, power hidden neatly.', 'فيلم بالمقاس وتوصيل مخفي بدقة.')], [tr('Tap and done', 'لمسة وانتهى'), tr('We show you every control before we leave.', 'نشرح لك كل طرق التحكم قبل المغادرة.')]],
      cta: [tr('Turn any glass into <span class="text-grad">smart glass.</span>', 'حوّل أي زجاج إلى <span class="text-grad">زجاج ذكي.</span>'), 'frosted'],
    },
    'surface-protection-solutions': {
      kicker: tr('Surface protection film', 'أفلام حماية الأسطح'),
      h1: [tr('Spill it.', 'اسكبها.'), tr('Your surfaces won’t mind.', 'أسطحك لن تتأثر.')],
      sub: tr('Invisible film for marble, wood, tabletops, countertops and stainless steel. Stops stains, etching and scratches — for far less than restoring.', 'فيلم غير مرئي للرخام والخشب والطاولات وأسطح المطابخ والستانلس ستيل. يمنع البقع والتآكل والخدوش — بتكلفة أقل بكثير من الترميم.'),
      facts: [['shield', tr('Invisible gloss or matte', 'لامع أو مطفي غير مرئي')], ['clock', tr('Lasts 7–10 years', 'يدوم ٧–١٠ سنوات')], ['wallet', tr('Cheaper than restoring', 'أرخص من الترميم')]],
      wa: tr('Hi, I want surface protection film for: ', 'مرحباً، أريد فيلم حماية أسطح لـ: '),
      stage: { fx: 'shield', img: 'marble', alt: tr('Marble table being protected', 'طاولة رخام تتم حمايتها'), off: tr('Unprotected surface', 'سطح دون حماية'), on: tr('Protection film on', 'مع فيلم الحماية'), metric: tr('Surface', 'السطح'), vals: [tr('Scratched & stained', 'خدوش وبقع'), tr('Protected', 'محمي')] },
      how: { title: tr('How the film <span class="text-grad">protects your surfaces</span>', 'كيف يحمي الفيلم <span class="text-grad">أسطحك</span>'), outZone: tr('DAILY LIFE', 'الاستخدام اليومي'), inZone: tr('YOUR SURFACE', 'سطحك'), baseLabel: tr('Film layer', 'طبقة الفيلم'), sourceEmoji: 'droplet', insideEmoji: 'rock', layerLabel: tr('Protection film', 'فيلم حماية'), baseFill: '#f1ece4', baseStroke: '#d8cdbd', layerFill: '#c9a27a',
        rays: [
          { color: '#e9a63b', label: tr('Lemon & coffee', 'ليمون وقهوة'), inLabel: tr('Etches & stains', 'تآكل وبقع'), film: 'block', filmLabel: tr('Stays on the film', 'يبقى على الفيلم') },
          { color: '#1d3150', label: tr('Keys & cups', 'مفاتيح وأكواب'), inLabel: tr('Scratches', 'خدوش'), film: 'block', filmLabel: tr('Scratch-guarded', 'محمي من الخدوش') },
          { color: '#8b5cf6', label: tr('Fingerprints', 'البصمات'), inLabel: tr('Smudges', 'لطخات'), film: 'block', filmLabel: tr('Wipe clean', 'تُمسح بسهولة') },
        ],
        meter: ['', tr('High risk', 'خطر عالٍ'), tr('Protected', 'محمي'), tr('Protected', 'محمي')],
        steps: [[tr('Daily life', 'الاستخدام اليومي'), tr('Surfaces take a beating', 'الأسطح تتعرض للكثير'), tr('Acid, keys, hot cups and fingerprints all leave their mark.', 'الأحماض والمفاتيح والأكواب الساخنة والبصمات كلها تترك أثرها.')], [tr('No film', 'بدون فيلم'), tr('Without film, marks are permanent', 'بدون فيلم، العلامات دائمة'), tr('Lemon etches marble, water rings wood, keys scratch steel — then you pay to restore.', 'الليمون يحفر الرخام والماء يترك حلقات على الخشب والمفاتيح تخدش الستانلس — ثم تدفع للترميم.')], [tr('With film', 'مع الفيلم'), tr('With protection film', 'مع فيلم الحماية'), tr('The film takes the hit. Wipe it clean — the surface underneath stays perfect.', 'الفيلم يتحمل الضرر. امسحه — ويبقى السطح تحته مثالياً.')], [tr('Result', 'النتيجة'), tr('What you save', 'ماذا توفر'), tr('Restoration can cost QAR 120–250/m² every few years. Film is QAR 80–120/m², once.', 'قد يكلف الترميم ١٢٠–٢٥٠ ريال/م² كل بضع سنوات. الفيلم ٨٠–١٢٠ ريال/م² مرة واحدة.')]],
        results: [tr('Stain, etch & scratch protection', 'حماية من البقع والتآكل والخدوش'), tr('Same natural look', 'نفس المظهر الطبيعي'), tr('Lasts 7–10 years', 'يدوم ٧–١٠ سنوات')], note: tr('Prices from our marble restoration guide.', 'الأسعار من دليل ترميم الرخام لدينا.') },
      ox: {
        kicker: tr('Four surfaces', 'أربعة أسطح'),
        title: tr('Whatever it’s made of, <span class="text-grad">we can protect it.</span>', 'مهما كانت مادته، <span class="text-grad">يمكننا حمايته.</span>'),
        text: tr('Same invisible film, matched to each surface.', 'نفس الفيلم غير المرئي، مطابق لكل سطح.'),
        items: [
          { ...opt(0), img: 'marble', pos: '50% 40%', layer: OX.sheen(), stat: [tr('Lemon & coffee', 'ليمون وقهوة'), tr('No etching', 'دون تآكل')] },
          { ...opt(1), img: '', layer: OX.wood() + OX.sheen(), stat: [tr('Water & heat', 'الماء والحرارة'), tr('No rings', 'دون حلقات')] },
          { ...opt(2), img: 'blog-marble', pos: '50% 60%', layer: OX.sheen(), stat: [tr('Daily use', 'الاستخدام اليومي'), tr('Wipe clean', 'يُمسح بسهولة')] },
          { ...opt(3), img: '', layer: OX.steel(), stat: [tr('Fingerprints', 'البصمات'), tr('Gone', 'اختفت')] },
        ],
      },
      middle: () => finishGrid('marble', tr('Gloss or <span class="text-grad">matte.</span>', 'لامع أو <span class="text-grad">مطفي.</span>'), tr('We match the film to your surface, so nobody can tell it’s there.', 'نطابق الفيلم مع سطحك حتى لا يلاحظه أحد.'), [
        [tr('Gloss', 'لامع'), tr('For polished marble & steel — keeps the shine', 'للرخام المصقول والستانلس — يحافظ على اللمعة'), 'background:linear-gradient(115deg,transparent 25%,rgba(255,255,255,.65) 42%,rgba(255,255,255,.15) 52%,transparent 62%),linear-gradient(0deg,rgba(255,255,255,.08),rgba(255,255,255,.08))'],
        [tr('Matte', 'مطفي'), tr('For honed stone & wood — no shine added', 'للحجر غير اللامع والخشب — دون لمعة إضافية'), 'background:rgba(238,234,226,.45);backdrop-filter:saturate(.55) contrast(.9);-webkit-backdrop-filter:saturate(.55) contrast(.9)'],
      ]),
      steps: [[tr('Send photos of the surface', 'أرسل صور السطح'), tr('Size and material. Fixed price back.', 'المقاس ونوع المادة. نرد بسعر ثابت.')], [tr('We clean & prep', 'نُنظف ونُجهز'), tr('The surface must be spotless first.', 'يجب أن يكون السطح نظيفاً تماماً أولاً.')], [tr('Film fitted invisibly', 'تركيب غير مرئي'), tr('Edges trimmed flush, ready to use.', 'حواف مقصوصة بدقة وجاهز للاستخدام.')]],
      cta: [tr('Protect it once. <span class="text-grad">Stop paying to restore it.</span>', 'احمه مرة واحدة. <span class="text-grad">وتوقف عن دفع تكاليف الترميم.</span>'), 'marble'],
    },
    'decorative-interior-solutions': {
      kicker: tr('Decorative & interior', 'الديكور والتصميم الداخلي'),
      h1: [tr('Plain glass?', 'زجاج عادي؟'), tr('Make it yours.', 'اجعله يشبهك.')],
      sub: tr('Decorative films, office branding, frosted designs and wallpaper — cut to your design and fitted on-site.', 'أفلام ديكورية وهوية بصرية للمكاتب وتصاميم مصنفرة وورق جدران — تُقص حسب تصميمك وتُركّب في موقعك.'),
      facts: [['edit', tr('Any design or logo', 'أي تصميم أو شعار')], ['check', tr('Proof before we cut', 'نموذج قبل القص')], ['layers', tr('Removable later', 'قابل للإزالة')]],
      wa: tr('Hi, I want decorative film / branding for: ', 'مرحباً، أريد فيلماً ديكورياً / هوية بصرية لـ: '),
      stage: { fx: 'pattern', img: 'commercial', pos: '70% 40%', alt: tr('Office glass with branded film', 'زجاج مكتب مع فيلم بالهوية'), off: tr('Plain glass', 'زجاج عادي'), on: tr('Branded with Exotic Tint', 'بهوية من إكزوتك تينت'), metric: tr('Your glass', 'زجاجك'), vals: [tr('Plain', 'عادي'), tr('On brand', 'بهويتك')] },
      how: { title: tr('How decorative film <span class="text-grad">works for you</span>', 'كيف يعمل الفيلم الديكوري <span class="text-grad">لصالحك</span>'), outZone: tr('PASSERS-BY', 'المارّة'), inZone: tr('YOUR SPACE', 'مساحتك'), baseLabel: tr('Glass', 'الزجاج'), sourceEmoji: 'camera', insideEmoji: 'office', layerLabel: tr('Decorative film', 'فيلم ديكوري'), layerFill: '#bfe5f6',
        rays: [
          { color: '#1d3150', label: tr('Eyes', 'الأنظار'), inLabel: tr('See everything', 'يرون كل شيء'), film: 'block', filmLabel: tr('View softened', 'الرؤية مخففة') },
          { color: '#e9a63b', label: tr('Light', 'الضوء'), inLabel: tr('Light in', 'الضوء يدخل'), film: 'pass', filmLabel: tr('Light still in', 'الضوء يبقى يدخل') },
          { color: '#0666C7', label: tr('Visitors', 'الزوار'), inLabel: tr('Plain glass', 'زجاج عادي'), film: 'pass', filmLabel: tr('See your brand', 'يرون هويتك') },
        ],
        meter: ['', tr('Plain', 'عادي'), tr('On brand', 'بهويتك'), tr('On brand', 'بهويتك')],
        steps: [[tr('Plain glass', 'زجاج عادي'), tr('Plain glass says nothing', 'الزجاج العادي لا يقول شيئاً'), tr('Bare doors and partitions look unfinished — and show everything.', 'الأبواب والقواطع العارية تبدو غير مكتملة — وتكشف كل شيء.')], [tr('No film', 'بدون فيلم'), tr('No privacy, no identity', 'لا خصوصية ولا هوية'), tr('Visitors see desks and cables, not your brand.', 'يرى الزوار المكاتب والأسلاك، لا هويتك.')], [tr('With film', 'مع الفيلم'), tr('Your design on the glass', 'تصميمك على الزجاج'), tr('Patterns, logos or frosted bands — light still comes in.', 'نقوش أو شعارات أو أشرطة مصنفرة — والضوء يبقى يدخل.')], [tr('Result', 'النتيجة'), tr('What you get', 'ماذا تحصل عليه'), tr('A finished, on-brand space — for a fraction of a fit-out.', 'مساحة مكتملة بهويتك — بجزء من تكلفة التجهيز.')]],
        results: [tr('Your logo or pattern on glass', 'شعارك أو نقشك على الزجاج'), tr('Privacy where you need it', 'خصوصية حيث تحتاجها'), tr('Removable when you rebrand', 'قابل للإزالة عند تغيير الهوية')] },
      ox: {
        kicker: tr('Four ways to finish', 'أربع طرق للتشطيب'),
        title: tr('Glass, walls, logos. <span class="text-grad">Designed for you.</span>', 'زجاج وجدران وشعارات. <span class="text-grad">مصممة لك.</span>'),
        text: tr('Send your idea — we prepare a proof before anything is cut.', 'أرسل فكرتك — نجهز نموذجاً قبل قص أي شيء.'),
        items: [
          { ...opt(0), img: 'frosted', pos: '80% 50%', layer: '', stat: [tr('Pattern', 'النقش'), tr('Your choice', 'حسب اختيارك')] },
          { ...opt(1), img: 'commercial', pos: '75% 40%', layer: OX.brand(), stat: [tr('Branding', 'الهوية'), tr('Logo & colours', 'شعار وألوان')] },
          { ...opt(2), img: '', layer: OX.wall(), stat: [tr('Feature wall', 'جدار مميز'), tr('Fitted in a day', 'تركيب في يوم')] },
          { ...opt(3), img: 'frosted', pos: '30% 50%', layer: OX.frost('background:linear-gradient(180deg,transparent 0 34%,rgba(255,255,255,.55) 34% 66%,transparent 66%)'), stat: [tr('Privacy band', 'شريط الخصوصية'), tr('At eye level', 'بمستوى العين')] },
        ],
      },
      middle: () => finishGrid('frosted', tr('Pick a <span class="text-grad">frosted style.</span>', 'اختر <span class="text-grad">نمط التصنفير.</span>'), tr('Or send us your own design or logo — we cut it to fit.', 'أو أرسل لنا تصميمك أو شعارك — ونقصّه بالمقاس.'), [
        [tr('Full frost', 'مصنفر كامل'), tr('Total privacy', 'خصوصية تامة'), 'background:rgba(255,255,255,.5);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)'],
        [tr('Privacy band', 'شريط خصوصية'), tr('Eye-level strip', 'شريط بمستوى العين'), 'background:linear-gradient(180deg,transparent 0 35%,rgba(255,255,255,.6) 35% 65%,transparent 65%)'],
        [tr('Gradient', 'متدرج'), tr('Fades to clear', 'يتدرج إلى شفاف'), 'background:linear-gradient(0deg,rgba(255,255,255,.7),transparent 85%)'],
        [tr('Lines', 'خطوط'), tr('Modern and light', 'عصري وخفيف'), 'background:repeating-linear-gradient(90deg,rgba(255,255,255,.55) 0 10px,transparent 10px 22px)'],
      ]),
      steps: [[tr('Send size & idea', 'أرسل المقاس والفكرة'), tr('Photos, logo file or a reference.', 'صور أو ملف الشعار أو مثال.')], [tr('Approve a proof', 'وافق على النموذج'), tr('We show you the design before cutting.', 'نعرض عليك التصميم قبل القص.')], [tr('Cut & fitted', 'قص وتركيب'), tr('Precise, bubble-free, on-site.', 'دقيق ودون فقاعات وفي موقعك.')]],
      cta: [tr('Send your idea. <span class="text-grad">We’ll design it.</span>', 'أرسل فكرتك. <span class="text-grad">ونحن نصممها.</span>'), 'frosted'],
    },
    'fabric-material-protection': {
      kicker: tr('Fabric & material protection', 'حماية الأقمشة والمواد'),
      h1: [tr('Spills just', 'الانسكابات'), tr('roll away.', 'تنزلق بعيداً.')],
      sub: tr('Invisible nano coating for sofas, majlis, carpets and curtains. Liquids bead up instead of soaking in.', 'طلاء نانو غير مرئي للكنب والمجالس والسجاد والستائر. السوائل تتجمع قطرات بدل أن تتغلغل.'),
      facts: [['drop', tr('Liquids bead up', 'السوائل تتجمع قطرات')], ['home', tr('Done at your home', 'في منزلك')], ['check', tr('Same look & feel', 'نفس المظهر والملمس')]],
      wa: tr('Hi, I want nano coating for: ', 'مرحباً، أريد طلاء نانو لـ: '),
      stage: { fx: 'bead', img: 'nano', alt: tr('Spill on a coated sofa', 'انسكاب على كنبة مطلية'), off: tr('Untreated fabric', 'قماش غير معالج'), on: tr('Nano coating on', 'مع طلاء النانو'), metric: tr('Spill', 'الانسكاب'), vals: [tr('Soaks in', 'يتغلغل'), tr('Beads up', 'يتجمع قطرات')] },
      how: { title: tr('How nano coating <span class="text-grad">keeps fabric clean</span>', 'كيف يحافظ النانو <span class="text-grad">على نظافة القماش</span>'), outZone: tr('SPILLS', 'الانسكابات'), inZone: tr('YOUR SOFA', 'كنبتك'), baseLabel: tr('Fabric', 'القماش'), sourceEmoji: 'droplet', insideEmoji: 'couch', layerLabel: tr('Nano coating', 'طلاء نانو'), baseFill: '#efe7dc', baseStroke: '#d8cbb8', layerFill: '#7dd3fc',
        rays: [
          { color: '#8a5a2b', label: tr('Coffee & juice', 'قهوة وعصير'), inLabel: tr('Soaks in', 'يتغلغل'), film: 'bounce', filmLabel: tr('Beads up & wipes off', 'يتجمع ويُمسح') },
          { color: '#e9a63b', label: tr('Oil & dirt', 'زيت وأوساخ'), inLabel: tr('Stains fibres', 'يلطخ الألياف'), film: 'block', filmLabel: tr('Kept on top', 'يبقى على السطح') },
          { color: '#38bdf8', label: tr('Air', 'الهواء'), inLabel: tr('Breathes', 'يتنفس'), film: 'pass', filmLabel: tr('Still breathes', 'يبقى يتنفس') },
        ],
        meter: ['', tr('High risk', 'خطر عالٍ'), tr('Low risk', 'خطر منخفض'), tr('Low risk', 'خطر منخفض')],
        steps: [[tr('Spills', 'الانسكابات'), tr('Every sofa meets coffee', 'كل كنبة تلتقي بالقهوة'), tr('Kids, guests, majlis evenings — spills are a matter of when.', 'الأطفال والضيوف وسهرات المجلس — الانسكاب مسألة وقت.')], [tr('No coating', 'بدون طلاء'), tr('Without coating, it soaks in', 'بدون طلاء، يتغلغل'), tr('Liquid sinks into the fibres in seconds and leaves a stain.', 'يتغلغل السائل في الألياف خلال ثوانٍ ويترك بقعة.')], [tr('With coating', 'مع الطلاء'), tr('With nano coating', 'مع طلاء النانو'), tr('Each fibre is coated, so liquid sits on top as drops. Blot it and it’s gone.', 'كل ليف مطلي، فيبقى السائل قطرات على السطح. امسحه فيختفي.')], [tr('Result', 'النتيجة'), tr('What you get', 'ماذا تحصل عليه'), tr('Furniture that looks new for longer — with no change to how it feels.', 'أثاث يبدو جديداً لفترة أطول — دون تغيير في ملمسه.')]],
        results: [tr('Spills wipe away', 'الانسكابات تُمسح'), tr('Fabric still breathes', 'القماش يبقى يتنفس'), tr('Safe for family use', 'آمن للاستخدام العائلي')] },
      ox: {
        kicker: tr('Two treatments', 'معالجتان'),
        title: tr('Coat the fabric. <span class="text-grad">Repel the mess.</span>', 'اطلِ القماش. <span class="text-grad">واطرد الفوضى.</span>'),
        text: tr('Sofas, majlis, carpets, curtains and cushions — done at your home.', 'الكنب والمجالس والسجاد والستائر والوسائد — في منزلك.'),
        items: [
          { ...opt(0), img: 'nano', pos: '40% 60%', layer: OX.beads(9), stat: [tr('Fabric feel', 'ملمس القماش'), tr('Unchanged', 'دون تغيير')] },
          { ...opt(1), img: 'nano', pos: '75% 70%', layer: OX.beads(6), stat: [tr('Coffee, juice, oil', 'قهوة وعصير وزيت'), tr('Rolls off', 'تنزلق')] },
        ],
      },
      middle: () => spillTest(),
      steps: [[tr('Tell us what to coat', 'أخبرنا ماذا نطلي'), tr('Sofas, majlis, carpets or curtains.', 'كنب أو مجالس أو سجاد أو ستائر.')], [tr('We clean & coat', 'ننظف ونطلي'), tr('At your home, same day.', 'في منزلك وفي نفس اليوم.')], [tr('Let it cure', 'اتركه يجف'), tr('Ready to use after it dries.', 'جاهز للاستخدام بعد الجفاف.')]],
      cta: [tr('Coat it once. <span class="text-grad">Stop worrying about spills.</span>', 'اطلِه مرة واحدة. <span class="text-grad">وتوقف عن القلق من الانسكاب.</span>'), 'nano'],
    },
  };
  return C2[slug] || null;
}

function pageService(page) {
  const s = page.service;
  const cfg = premiumConfig(s.slug);
  const wa = waLink(cfg.wa);
  const hero = `
<section class="px-2.5 sm:px-3">
  <div class="hero-bg relative overflow-hidden rounded-[28px]" data-hero>
    <div class="pointer-events-none absolute inset-0 grid-lines"></div>
    <div class="container-site relative grid items-center gap-8 py-10 lg:grid-cols-12 lg:py-12">
      <div class="lg:col-span-5">
        <nav class="flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb" data-a="down">
          <a href="${href()}" class="font-semibold hover:text-gold-700">${t(C.ui.nav.home)}</a>${icon('chevron', 'h-3.5 w-3.5 -rotate-90 rtl:rotate-90')}
          <a href="${href('service/')}" class="font-semibold hover:text-gold-700">${t(C.ui.nav.services)}</a>
        </nav>
        <p class="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-gold-700" data-a="left">${cfg.kicker}</p>
        <h1 class="mt-3 font-head text-[2.5rem] font-extrabold leading-[1.04] text-ink sm:text-[3.4rem] xl:text-[4rem]">
          <span class="block" data-split>${cfg.h1[0]}</span>
          <span class="block text-grad" data-a="up">${cfg.h1[1]}</span>
        </h1>
        <p class="mt-5 max-w-md text-[1.08rem] leading-relaxed text-muted" data-a="up">${cfg.sub}</p>
        <div class="mt-8 flex flex-wrap gap-3" data-a="up">
          <a href="${wa}" target="_blank" rel="noopener" class="btn btn-primary">${waIcon('h-5 w-5')} ${tr('Get a price', 'اعرف السعر')}</a>
          <a href="tel:${C.site.phoneRaw}" class="btn btn-white">${icon('phone', 'h-4 w-4')} <span dir="ltr">${C.site.phone}</span></a>
        </div>
        <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink-2" data-a="up">
          ${cfg.facts.map(([ic, x]) => `<li class="flex items-center gap-2">${icon(ic, 'h-4 w-4 text-gold-600', 2.2)} ${x}</li>`).join('')}
        </ul>
      </div>
      <div class="lg:col-span-7">${cfg.stage === 'room' ? roomStage() : fxStage(cfg.stage)}</div>
    </div>
    <div class="container-site relative pb-8">
      <div class="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" data-a="up">
        ${s.options.map(([n]) => `<span class="inline-flex shrink-0 items-center gap-2 rounded-full border border-white bg-white/80 px-3.5 py-2 text-[13px] font-semibold text-ink shadow-card backdrop-blur"><span class="h-1.5 w-1.5 rounded-full bg-gold-500"></span>${t(n)}</span>`).join('')}
      </div>
    </div>
  </div>
</section>`;
  const stepSec = `
<section class="py-20 lg:py-28" data-assemble>
  <div class="container-site">
    <div class="flex flex-col justify-between gap-6 sm:flex-row sm:items-end" data-a="up">
      <h2 class="font-head text-[2rem] font-extrabold leading-tight text-ink sm:text-[2.7rem]">${tr('Three steps. <span class="text-grad">Zero hassle.</span>', 'ثلاث خطوات. <span class="text-grad">دون عناء.</span>')}</h2>
      <a href="${wa}" target="_blank" rel="noopener" class="inline-flex w-max items-center gap-2 text-sm font-bold text-ink underline decoration-gold-400 decoration-2 underline-offset-8 hover:text-gold-700">${tr('Start on WhatsApp', 'ابدأ عبر واتساب')} ${arrow('h-4 w-4')}</a>
    </div>
    <ol class="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
      ${cfg.steps.map(([a, d], i) => `<li class="border-t-2 ${i === 0 ? 'border-gold-500' : 'border-line'} pt-6" data-a="up">
        <p class="font-head text-sm font-extrabold tracking-wider text-gold-600">${num(pad(i + 1))}</p>
        <h3 class="mt-3 font-head text-2xl font-bold text-ink">${a}</h3>
        <p class="mt-2 max-w-xs text-muted">${d}</p>
      </li>`).join('')}
    </ol>
  </div>
</section>`;
  const cta = `
<section class="px-2.5 pb-16 sm:px-3">
  <div class="relative overflow-hidden rounded-[28px] bg-ink">
    <img src="/assets/img/${cfg.cta[1]}.webp" alt="" class="absolute inset-0 h-full w-full object-cover opacity-40" loading="lazy">
    <div class="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30 rtl:bg-gradient-to-l"></div>
    <div class="container-site relative flex flex-col items-start justify-between gap-6 py-16 lg:flex-row lg:items-center lg:py-20">
      <h2 class="max-w-xl font-head text-[2.1rem] font-extrabold leading-tight text-white sm:text-5xl">${cfg.cta[0]}</h2>
      <div class="flex flex-wrap gap-3">
        <a href="${wa}" target="_blank" rel="noopener" class="btn btn-primary">${waIcon('h-5 w-5')} WhatsApp</a>
        <a href="tel:${C.site.phoneRaw}" class="btn btn-glass">${icon('phone', 'h-4 w-4')} <span dir="ltr">${C.site.phone}</span></a>
      </div>
    </div>
  </div>
</section>`;
  return layout(
    page,
    {
      title: tr(`${t(s.title)} in Qatar | ${t(C.site.name)}`, `${t(s.title)} في قطر | ${t(C.site.name)}`),
      description: t(s.summary),
      image: s.img,
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: t(s.title),
        description: t(s.summary),
        areaServed: 'Qatar',
        provider: { '@type': 'LocalBusiness', name: t(C.site.name), telephone: C.site.phoneRaw },
        hasOfferCatalog: { '@type': 'OfferCatalog', name: t(s.title), itemListElement: s.options.map(([n, d]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t(n), description: t(d) } })) },
      },
    },
    hero + howItWorksFor(cfg.how) + optionExplorer({ ...cfg.ox, wa }) + cfg.middle(s) + stepSec + faqSection(s.faq, tr('Quick <span class="text-grad">answers</span>', 'إجابات <span class="text-grad">سريعة</span>')) + cta
  );
}

function pageContact(page) {
  const cards = [
    ['phone', t(C.ui.callUs), `<span dir="ltr">${C.site.phone}</span>`, `tel:${C.site.phoneRaw}`, 'linear-gradient(160deg,#EAF5FF,#F4F9FF)'],
    ['wa', 'WhatsApp', tr('Chat with a specialist', 'تحدث مع مختص'), `https://wa.me/${C.site.whatsapp}`, 'linear-gradient(160deg,#E2F8EA,#F6FDF8)'],
    ['mail', tr('Email us', 'راسلنا'), C.site.email, `mailto:${C.site.email}`, 'linear-gradient(160deg,#E6EFFF,#F7FAFF)'],
    ['instagram', 'Instagram', '@exotic_tint_qatar', C.site.instagram, 'linear-gradient(160deg,#FCE7F3,#FFF7FB)'],
  ];
  const body = `
${pageHero({
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-white">${icon('chat', 'h-4 w-4', 2.2)}</span>${tr('Contact', 'تواصل معنا')}`,
  title: tr('Contact us &amp; <span class="text-grad">enjoy your time off</span>', 'تواصل معنا <span class="text-grad">واستمتع بوقتك</span>'),
  text: tr('Reach out for expert advice in Doha. Whether it’s window film, smart glass or surface protection, we’re here to help with precision and care.', 'تواصل معنا للحصول على استشارة متخصصة في الدوحة. سواء كانت أفلام نوافذ أو زجاجاً ذكياً أو حماية أسطح، نحن هنا لمساعدتك بدقة وعناية.'),
  crumbs: [[t(C.ui.nav.contact)]],
  image: 'frosted',
  alt: tr('Frosted film on office glass', 'فيلم مصنفر على زجاج مكتب'),
  chips: chipHeat(),
})}
<section class="py-20">
  <div class="container-site grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    ${cards
      .map(
        ([ic, title, value, link, bg], i) => `<a href="${link}" ${link.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="svc-card flex flex-col !p-7" style="background:${bg};color:#12233D" ${reveal(i * 70)}>
        <span class="ico ${ic === 'wa' ? '!bg-[#25D366] !text-white' : ''}">${ic === 'wa' ? waIcon() : icon(ic, 'h-5 w-5', 2.1)}</span>
        <span class="mt-8 text-sm font-semibold text-muted">${title}</span>
        <span class="mt-1 break-all font-head text-lg font-bold text-ink">${value}</span>
        <span class="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-gold-700">${tr('Open', 'افتح')} ${arrow('h-3.5 w-3.5')}</span>
      </a>`
      )
      .join('')}
  </div>
</section>
${quoteSection()}
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="grid gap-5 md:grid-cols-3">
      ${[
        ['clock', tr('Saves your time', 'يوفر وقتك'), tr('Fast, hassle-free tinting and mobile service tailored to your schedule.', 'تظليل سريع ودون عناء مع خدمة متنقلة تناسب جدولك.')],
        ['wallet', tr('Cashless payment', 'دفع إلكتروني'), tr('Secure, seamless cashless transactions for every service.', 'معاملات إلكترونية آمنة وسلسة لكل خدمة.')],
        ['chat', tr('Seamless communication', 'تواصل سلس'), tr('A responsive support team from quote to handover.', 'فريق دعم سريع الاستجابة من العرض حتى التسليم.')],
      ]
        .map(([ic, a, b], i) => `<div class="card flex gap-5 p-7" ${reveal(i * 80)}><span class="ico">${icon(ic, 'h-5 w-5', 2.2)}</span><div><h3 class="font-head text-lg font-bold text-ink">${a}</h3><p class="mt-1 text-muted">${b}</p></div></div>`)
        .join('')}
    </div>
  </div>
</section>
${mapSection()}
${bookFast()}
${areasSection()}
${reviewUs()}
${faqSection(C.homeFaq)}`;
  return layout(
    page,
    {
      title: tr('Contact Exotic Tint for Trading and Contracting — Free Window Tint Estimate', 'تواصل مع إكزوتك تينت للتجارة والمقاولات — تقدير مجاني للتظليل'),
      description: tr(`Call ${C.site.phone} or WhatsApp us for a free flat-rate estimate. Window tinting and protection films across Qatar, 7 days a week.`, `اتصل على ${C.site.phone} أو راسلنا على واتساب لتقدير مجاني بسعر ثابت. تظليل وأفلام حماية في كل قطر، ٧ أيام في الأسبوع.`),
      image: 'frosted',
    },
    body
  );
}

function pageReviews(page) {
  const body = `
${pageHero({
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-white">${icon('star', 'h-4 w-4', 2.2)}</span>${tr('Reviews', 'التقييمات')}`,
  title: tr('What our clients <span class="text-grad">say about us</span>', 'ماذا يقول <span class="text-grad">عملاؤنا عنا</span>'),
  text: tr('Drivers, homeowners and businesses across Qatar trust Exotic Tint for heat-rejection film, frosted designs, marble protection and nano coating.', 'يثق بنا السائقون وأصحاب المنازل والشركات في أنحاء قطر في أفلام العزل الحراري والتصاميم المصنفرة وحماية الرخام وطلاء النانو.'),
  crumbs: [[tr('Reviews', 'التقييمات')]],
  image: 'residential',
  alt: tr('Tinted villa', 'فيلا مظللة'),
  chips: chipHeat(),
})}
<section class="py-20 lg:py-28">
  <div class="container-site">
    ${sectionHead({ eyebrow: tr('Client stories', 'قصص العملاء'), title: tr('Real results, <span class="text-grad">real clients</span>', 'نتائج حقيقية <span class="text-grad">لعملاء حقيقيين</span>'), center: true })}
    <div class="mt-12 grid gap-5 md:grid-cols-2">
      ${C.testimonials
        .map(
          (r, i) => `<figure class="relative overflow-hidden rounded-[28px] border border-line bg-white p-8 shadow-card transition hover:-translate-y-1 hover:shadow-soft" ${reveal(i * 80)}>
        <div class="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-tint"></div>
        <div class="relative flex items-center justify-between">${starsRow()}<span class="ico !h-11 !w-11">${icon('quote', 'h-5 w-5', 2)}</span></div>
        <blockquote class="relative mt-6 font-head text-xl font-semibold leading-snug text-ink">${t(r.text)}</blockquote>
        <figcaption class="relative mt-7 flex items-center gap-3 border-t border-dashed border-line pt-6">
          <span class="grid h-12 w-12 place-items-center rounded-full bg-grad font-head font-extrabold text-white">${r.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
          <span class="flex-1"><span class="block font-head font-bold text-ink">${r.name}</span><span class="block text-sm text-muted">${t(r.role)}</span></span>
          <span class="rounded-full border border-[#bfdcfb] bg-tint px-3 py-1 text-xs font-bold text-gold-700">${t(r.service)}</span>
        </figcaption>
      </figure>`
        )
        .join('')}
    </div>
  </div>
</section>
${reviewUs()}
${statsStrip()}
${gallery()}
${ctaBanner()}
${quoteSection()}`;
  return layout(page, { title: tr('Client Reviews — Exotic Tint for Trading and Contracting', 'آراء العملاء — إكزوتك تينت للتجارة والمقاولات'), description: tr('Read what homeowners and businesses in Qatar say about Exotic Tint for Trading and Contracting.', 'اقرأ آراء السائقين وأصحاب المنازل والشركات في قطر عن إكزوتك تينت للتجارة والمقاولات.'), image: 'residential' }, body);
}

function postCard(p, i) {
  return `<a href="${href(p.slug + '/')}" class="group flex flex-col overflow-hidden rounded-[28px] border border-line bg-white shadow-card transition hover:-translate-y-1.5 hover:shadow-soft" ${reveal(i * 80)}>
    <div class="relative aspect-[16/10] overflow-hidden"><img src="/assets/img/${p.img}.webp" alt="${esc(t(p.title))}" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy">
      <span class="absolute start-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase text-gold-700 shadow">${t(p.cat)}</span></div>
    <div class="flex flex-1 flex-col p-6">
      <p class="flex items-center gap-2 text-xs text-muted">${icon('calendar', 'h-3.5 w-3.5')} ${fmtDate(p.date)} · ${num(p.read)} ${tr('min read', 'دقائق قراءة')}</p>
      <h3 class="mt-3 font-head text-xl font-bold leading-snug text-ink group-hover:text-gold-700">${t(p.title)}</h3>
      <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">${t(p.excerpt)}</p>
      <span class="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-ink">${tr('Read article', 'اقرأ المقال')} <span class="grid h-8 w-8 place-items-center rounded-full bg-grad shadow-gold">${arrow('h-3.5 w-3.5')}</span></span>
    </div>
  </a>`;
}

function pageBlogs(page) {
  const body = `
${pageHero({
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-white">${icon('edit', 'h-4 w-4', 2.2)}</span>${tr('Blog', 'المدونة')}`,
  title: tr('Tint &amp; protection <span class="text-grad">guides for Qatar</span>', 'أدلة التظليل والحماية <span class="text-grad">في قطر</span>'),
  text: tr('Honest, practical advice on window film, heat rejection and surface protection — written for Gulf weather.', 'نصائح عملية وصادقة عن أفلام النوافذ والعزل الحراري وحماية الأسطح — مكتوبة لطقس الخليج.'),
  crumbs: [[tr('Blog', 'المدونة')]],
  image: 'blog-ceramic',
  alt: tr('Window with desert view', 'نافذة تطل على الصحراء'),
  chips: chipHeat(),
})}
${blogSection()}
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    ${sectionHead({ eyebrow: tr('All articles', 'كل المقالات'), title: tr('Latest <span class="text-grad">posts</span>', 'أحدث <span class="text-grad">المقالات</span>') })}
    <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">${POSTS.map(postCard).join('')}</div>
  </div>
</section>
${ctaBanner()}
${quoteSection()}`;
  return layout(page, { title: tr('Blog — Window Tint & Protection Guides | Exotic Tint for Trading and Contracting', 'المدونة — أدلة التظليل والحماية | إكزوتك تينت للتجارة والمقاولات'), description: tr('Guides on window tinting, nano ceramic film and marble protection in Qatar.', 'أدلة عن تظليل النوافذ وأفلام النانو سيراميك وحماية الرخام في قطر.'), image: 'blog-ceramic' }, body);
}

function renderBlocks(blocks) {
  let h2 = 0;
  return blocks
    .map((b) => {
      if (b.h) return `<h2 id="s${++h2}" class="mt-12 scroll-mt-32 font-head text-[1.7rem] font-extrabold leading-tight text-ink">${t(b.h)}</h2>`;
      if (b.p) return `<p class="mt-5 text-[1.08rem] leading-[1.85] text-ink-2/85">${t(b.p)}</p>`;
      if (b.list) return `<ul class="mt-4 space-y-2.5">${b.list.map((x) => `<li class="flex gap-3 text-[1.05rem] leading-relaxed text-ink-2/90"><span class="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tint text-gold-700">${icon('check', 'h-3.5 w-3.5', 3)}</span>${t(x)}</li>`).join('')}</ul>`;
      if (b.callout) return `<div class="mt-6 flex gap-4 rounded-2xl border border-[#bfdcfb] bg-tint p-5">${img3d('bulb', 'h-10 w-10 shrink-0')}<p class="font-semibold leading-relaxed text-ink">${t(b.callout)}</p></div>`;
      if (b.table)
        return `<div class="no-scrollbar mt-6 overflow-x-auto rounded-2xl border border-line shadow-card"><table class="w-full min-w-[520px] text-start text-sm"><thead class="bg-ink text-white"><tr>${b.table.head.map((x, i) => `<th class="px-4 py-3.5 text-start font-head font-bold ${i === b.table.head.length - 1 ? 'text-gold-300' : ''}">${t(x)}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map((r, ri) => `<tr class="${ri % 2 ? 'bg-tint-2' : 'bg-white'}">${r.map((c, ci) => `<td class="border-t border-line px-4 py-3.5 ${ci === 0 ? 'font-semibold text-ink' : 'text-ink-2'} ${ci === r.length - 1 && ci ? 'font-bold text-gold-700' : ''}">${t(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      return '';
    })
    .join('');
}

function pagePost(page) {
  const p = page.post;
  const toc = p.body.filter((b) => b.h).map((b, i) => `<li><a href="#s${i + 1}" class="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-tint hover:text-ink">${t(b.h)}</a></li>`).join('');
  const others = POSTS.filter((x) => x !== p);
  const body = `
<section class="px-2.5 sm:px-3">
  <div class="hero-bg relative overflow-hidden rounded-[28px]">
    <div class="pointer-events-none absolute inset-0 grid-lines"></div>
    <div class="container-site relative py-12 lg:py-16">
      <nav class="flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <a href="${href()}" class="font-semibold hover:text-gold-700">${t(C.ui.nav.home)}</a>${icon('chevron', 'h-3.5 w-3.5 -rotate-90 rtl:rotate-90')}
        <a href="${href('blogs/')}" class="font-semibold hover:text-gold-700">${tr('Blog', 'المدونة')}</a>
      </nav>
      <div class="mt-8 max-w-4xl">
        <span class="chip"><span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-white">${icon('edit', 'h-4 w-4', 2.2)}</span>${t(p.cat)}</span>
        <h1 class="mt-5 text-balance font-head text-[2.2rem] font-extrabold leading-[1.1] text-ink sm:text-[3rem]">${t(p.title)}</h1>
        <p class="mt-5 max-w-2xl text-lg leading-relaxed text-muted">${t(p.excerpt)}</p>
        <div class="mt-7 flex flex-wrap items-center gap-5 text-sm text-muted">
          <span class="flex items-center gap-2.5">${mark('h-10 w-10 shadow')}<b class="text-ink">${tr('Exotic Tint team', 'فريق إكزوتك تينت')}</b></span>
          <span class="flex items-center gap-1.5">${icon('calendar', 'h-4 w-4')} ${fmtDate(p.date)}</span>
          <span class="flex items-center gap-1.5">${icon('clock', 'h-4 w-4')} ${num(p.read)} ${tr('min read', 'دقائق قراءة')}</span>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="py-14 lg:py-20">
  <div class="container-site grid gap-12 lg:grid-cols-12">
    <article class="min-w-0 lg:col-span-8">
      <img src="/assets/img/${p.img}.webp" alt="${esc(t(p.title))}" class="aspect-[16/9] w-full rounded-[28px] border-[6px] border-white object-cover shadow-float">
      <div class="mt-4">${renderBlocks(p.body)}</div>
      <div class="relative mt-12 overflow-hidden rounded-[28px] bg-grad p-8 shadow-glow">
        ${img3d('sparkles', 'absolute -bottom-4 end-4 h-24 w-24')}
        <p class="font-head text-2xl font-extrabold text-ink">${tr('Ready to upgrade your glass?', 'مستعد لترقية زجاجك؟')}</p>
        <p class="mt-1 max-w-md text-ink/75">${tr('Contact Exotic Tint for Trading and Contracting for a free consultation and flat-rate quote.', 'تواصل مع إكزوتك تينت للتجارة والمقاولات لاستشارة مجانية وعرض سعر ثابت.')}</p>
        <div class="mt-5 flex flex-wrap gap-3"><a href="#quote" class="btn btn-dark">${t(C.ui.quote)} ${arrow()}</a><a href="${waHello()}" target="_blank" rel="noopener" class="btn btn-white">${waIcon('h-4 w-4 text-[#25D366]')} WhatsApp</a></div>
      </div>
    </article>
    <aside class="lg:col-span-4">
      <div class="sticky top-28 space-y-5">
        <div class="card p-5"><p class="px-3 font-head text-lg font-bold text-ink">${tr('In this article', 'في هذا المقال')}</p><ol class="mt-3 space-y-0.5">${toc}</ol></div>
        <div class="relative overflow-hidden rounded-[22px] p-6 navy-bg">
          ${img3d('chat', 'absolute -bottom-2 end-2 h-16 w-16 opacity-90')}
          <p class="font-head text-lg font-bold text-white">${tr('Talk to a tint expert', 'تحدث مع خبير تظليل')}</p>
          <p class="mt-1 text-sm text-white/70">${tr('Free advice, 7 days a week.', 'استشارة مجانية ٧ أيام في الأسبوع.')}</p>
          <a href="tel:${C.site.phoneRaw}" class="btn btn-primary mt-4 !py-2.5 text-sm">${icon('phone', 'h-4 w-4')} <span dir="ltr">${C.site.phone}</span></a>
        </div>
        <div class="card p-5"><p class="font-head text-lg font-bold text-ink">${tr('More articles', 'مقالات أخرى')}</p>
          ${others.map((o) => `<a href="${href(o.slug + '/')}" class="group mt-4 flex gap-3"><img src="/assets/img/${o.img}.webp" alt="" class="h-16 w-16 shrink-0 rounded-xl object-cover" loading="lazy"><span class="line-clamp-3 text-sm font-semibold leading-snug text-ink group-hover:text-gold-700">${t(o.title)}</span></a>`).join('')}
        </div>
      </div>
    </aside>
  </div>
</section>
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    ${sectionHead({ eyebrow: tr('Keep reading', 'تابع القراءة'), title: tr('More from <span class="text-grad">our blog</span>', 'المزيد من <span class="text-grad">مدونتنا</span>') })}
    <div class="mt-10 grid gap-5 md:grid-cols-2">${others.map(postCard).join('')}</div>
  </div>
</section>
${quoteSection()}`;
  return layout(
    page,
    {
      title: `${t(p.title)} | ${t(C.site.name)}`,
      description: t(p.excerpt),
      image: p.img,
      jsonld: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: t(p.title), description: t(p.excerpt), datePublished: p.date, image: `${C.site.domain}/assets/img/${p.img}.webp`, author: { '@type': 'Organization', name: 'Exotic Tint for Trading and Contracting' }, publisher: { '@type': 'Organization', name: 'Exotic Tint for Trading and Contracting', logo: { '@type': 'ImageObject', url: `${C.site.domain}/assets/img/logo-original.webp` } } },
    },
    body
  );
}

/* ------------------------------------------------------------------ build */
const renderers = { home: pageHome, about: pageAbout, services: pageServices, service: pageService, contact: pageContact, reviews: pageReviews, blogs: pageBlogs, post: pagePost };
// Site base path: "/" for a custom domain or local dev, "/Exotic-tint-Qatar/" for GitHub Pages.
// Set with the BASE environment variable at build time.
const BASE = ('/' + (process.env.BASE || '').replace(/^\/+|\/+$/g, '') + '/').replace('//', '/');
function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (BASE !== '/' && file.endsWith('.html')) {
    html = html.replace(/(href|src|action)="\/(?!\/)/g, `$1="${BASE}`).replace(/url=\/(?!\/)/g, `url=${BASE}`);
  }
  fs.writeFileSync(file, html);
}

(async () => {
  QR = await QRCode.toString(`https://wa.me/${C.site.whatsapp}`, { type: 'svg', margin: 0, color: { dark: '#12233D', light: '#0000' } });
  QR = QR.replace('<svg ', '<svg class="h-full w-full" role="img" aria-label="WhatsApp QR code" ');
  let count = 0;
  for (const lang of LANGS) {
    L = lang;
    for (const page of PAGES) {
      write(path.join(DIST, lang === 'ar' ? 'ar' : '', page.path, 'index.html'), renderers[page.key](page));
      count++;
    }
  }
  fs.mkdirSync(path.join(DIST, 'assets', 'js'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'assets', 'js', 'main.js'), path.join(DIST, 'assets', 'js', 'main.js'));
  fs.copyFileSync(path.join(__dirname, 'assets', 'js', 'motion.js'), path.join(DIST, 'assets', 'js', 'motion.js'));
  fs.copyFileSync(path.join(__dirname, 'assets', 'js', 'room3d.js'), path.join(DIST, 'assets', 'js', 'room3d.js'));
  fs.rmSync(path.join(DIST, 'assets', 'js', 'car3d.js'), { force: true });
  fs.rmSync(path.join(DIST, 'assets', 'img', 'favicon.svg'), { force: true });
  // Old URLs kept alive → point to the new main service pages
  const redirect = (from, to, label) => write(from, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title><link rel="canonical" href="${C.site.domain}${to}"><meta http-equiv="refresh" content="0; url=${to}"><meta name="robots" content="noindex"></head><body><a href="${to}">${label}</a></body></html>`);
  redirect(path.join(DIST, 'commercial-window-tinting', 'index.html'), '/service/architectural-window-film-solutions/', 'Architectural Window Film Solutions');
  for (const [old, to] of Object.entries(C.redirects)) {
    for (const lang of LANGS) {
      const pre = lang === 'ar' ? '/ar' : '';
      const dest = pre + '/service/' + (to ? to + '/' : '');
      redirect(path.join(DIST, ...(lang === 'ar' ? ['ar'] : []), 'service', old, 'index.html'), dest, 'Exotic Tint');
    }
  }
  write(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${C.site.domain}/sitemap.xml\n`);
  const urls = PAGES.flatMap((p) => [`${C.site.domain}/${p.path}`, `${C.site.domain}/ar/${p.path}`]);
  write(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  L = 'en';
  write(
    path.join(DIST, '404.html'),
    layout({ key: '404', path: '' }, { title: 'Page not found — Exotic Tint for Trading and Contracting', description: 'Page not found' }, pageHero({ chip: '404', title: 'This page has been <span class="text-grad">tinted out.</span>', text: 'The page you’re looking for doesn’t exist. <a class="font-semibold text-gold-700 underline" href="/">Go back home</a> · <a class="font-semibold text-gold-700 underline" href="/ar/">العودة للرئيسية</a>' }))
  );
  console.log(`Built ${count} pages (${LANGS.join(', ')}) → dist/`);
})();
