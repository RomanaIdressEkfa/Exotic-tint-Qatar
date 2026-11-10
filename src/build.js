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
const waHello = () => waLink(tr('Hello Exotic Tint Qatar, I would like a free quote.', 'مرحباً إكزوتك تينت قطر، أرغب في الحصول على عرض سعر مجاني.'));
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

/* Per-service visual identity (pastel card + accent + 3D emoji) */
const SV = {
  'automotive-window-tinting': { emoji: 'car', bg: 'linear-gradient(160deg,#FFF0D6 0%,#FFFAF1 100%)', acc: 'linear-gradient(135deg,#F6C766,#C47F1E)', on: '#12233D', color: '#C47F1E', badge: ['Up to 60% less heat', 'حرارة أقل حتى ٦٠٪'] },
  'residential-window-tinting-services': { emoji: 'house', bg: 'linear-gradient(160deg,#E6EFFF 0%,#F7FAFF 100%)', acc: 'linear-gradient(135deg,#60A5FA,#1D4ED8)', on: '#fff', color: '#2563EB', badge: ['99% UV blocked', 'حجب ٩٩٪ من الأشعة'] },
  'commercial-window-tinting-services': { emoji: 'office', bg: 'linear-gradient(160deg,#E8EBF6 0%,#F8F9FD 100%)', acc: 'linear-gradient(135deg,#2A4066,#12233D)', on: '#fff', color: '#1D3150', badge: ['Lower AC bills', 'فواتير تكييف أقل'] },
  'customized-cut-frosted-film': { emoji: 'window', bg: 'linear-gradient(160deg,#E1F5F3 0%,#F5FCFB 100%)', acc: 'linear-gradient(135deg,#2DD4BF,#0F766E)', on: '#fff', color: '#0F766E', badge: ['Custom designs', 'تصاميم مخصصة'] },
  'marble-protection-film': { emoji: 'rock', bg: 'linear-gradient(160deg,#F4ECE3 0%,#FCFAF7 100%)', acc: 'linear-gradient(135deg,#C9A27A,#8A6440)', on: '#fff', color: '#8A6440', badge: ['Invisible finish', 'لمسة غير مرئية'] },
  'fabric-nano-coating-service': { emoji: 'couch', bg: 'linear-gradient(160deg,#EFE9FF 0%,#FBF9FF 100%)', acc: 'linear-gradient(135deg,#A78BFA,#6D28D9)', on: '#fff', color: '#6D28D9', badge: ['Spill-proof fabric', 'أقمشة مقاومة للانسكاب'] },
};

/* ------------------------------------------------------------------- logo */
// The client's original logo, used as-is.
const logo = (size = 'md') =>
  `<img src="/assets/img/logo-original.webp" alt="${esc(t(C.site.name))}" class="${size === 'lg' ? 'h-24' : 'h-[62px]'} w-auto" width="106" height="120">`;

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
<meta property="og:image" content="${C.site.domain}/assets/img/${meta.image || 'automotive'}.webp">
<meta property="og:locale" content="${L === 'ar' ? 'ar_QA' : 'en_QA'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Urbanist:wght@500;600;700;800;900${L === 'ar' ? '&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700' : ''}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/app.css">
<script>document.documentElement.classList.add('js')</script>
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
    <p class="flex items-center gap-2"><span class="grid h-5 w-5 place-items-center rounded-md bg-grad text-ink">${icon('bolt', 'h-3 w-3', 2.4)}</span><b class="font-bold text-ink">${tr('Free on-site estimates.', 'تقدير مجاني في موقعك.')}</b> ${tr('Premium tint & protective films across Qatar.', 'أفلام تظليل وحماية فاخرة في جميع أنحاء قطر.')}</p>
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

function footer() {
  const col = (title, links) => `
    <div>
      <h3 class="flex items-center gap-2 font-head text-lg font-bold text-white"><span class="h-0.5 w-3 rounded bg-grad"></span>${title}</h3>
      <ul class="mt-5 space-y-3">${links.map(([label, link]) => `<li><a href="${link}" class="text-white/65 transition hover:text-gold-300">${label}</a></li>`).join('')}</ul>
    </div>`;
  return `
<footer class="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
  <div class="relative overflow-hidden rounded-[28px] navy-bg">
    <div class="pointer-events-none absolute inset-0 grid-lines-dark opacity-60"></div>
    <div class="container-site relative pb-8 pt-16">
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="grid gap-10 sm:grid-cols-3 lg:col-span-7">
          ${col(t(C.ui.quickLinks), [[t(C.ui.nav.home), href()], [t(C.ui.nav.about), href('about/')], [t(C.ui.nav.services), href('service/')], [tr('Reviews', 'التقييمات'), href('reviews/')], [tr('Blog', 'المدونة'), href('blogs/')], [t(C.ui.nav.contact), href('contact/')]])}
          ${col(tr('Tinting', 'التظليل'), C.services.slice(0, 3).map((s) => [t(s.title), href('service/' + s.slug + '/')]))}
          ${col(tr('Protection', 'الحماية'), C.services.slice(3).map((s) => [t(s.title), href('service/' + s.slug + '/')]))}
        </div>
        <div class="rounded-[22px] border border-white/10 bg-white/[0.05] p-7 lg:col-span-5">
          <h3 class="flex items-center gap-2 font-head text-lg font-bold text-white"><span class="h-0.5 w-3 rounded bg-grad"></span>${t(C.ui.getInTouch)}</h3>
          <div class="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            <a href="tel:${C.site.phoneRaw}" class="flex items-center gap-3 font-semibold text-white hover:text-gold-300"><span class="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-gold-300">${icon('phone', 'h-4 w-4')}</span><span dir="ltr">${C.site.phone}</span></a>
            <a href="mailto:${C.site.email}" class="flex items-center gap-3 font-semibold text-white hover:text-gold-300"><span class="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-gold-300">${icon('mail', 'h-4 w-4')}</span>${C.site.email}</a>
          </div>
          <form class="mt-6 flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] p-1.5" data-callback data-wa="${C.site.whatsapp}" data-msg="${esc(tr('Hello Exotic Tint Qatar, please call me back on:', 'مرحباً إكزوتك تينت قطر، يرجى الاتصال بي على الرقم:'))}">
            <label for="cb-phone" class="sr-only">${tr('Your phone number', 'رقم هاتفك')}</label>
            <input id="cb-phone" name="phone" type="tel" required placeholder="${tr('Your phone number', 'رقم هاتفك')}" class="min-w-0 flex-1 bg-transparent px-4 text-white placeholder-white/45 focus:outline-none">
            <button class="btn btn-primary !px-5 !py-2.5 text-sm">${tr('Call me back', 'اتصلوا بي')}</button>
          </form>
          <p class="mt-6 font-semibold text-white">${t(C.ui.hoursLabel)}</p>
          <p class="mt-1 text-sm text-white/65">${t(C.site.hours)}</p>
        </div>
      </div>
      <div class="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-end md:justify-between">
        <div>
          <a href="${href()}" aria-label="${esc(t(C.site.name))}" class="inline-block">${logo('lg')}</a>
          <p class="mt-4 text-sm text-white/55">© <span data-year>2026</span> ${t(C.site.name)} — ${t(C.site.tagline)}. ${t(C.ui.rights)}</p>
        </div>
        <div class="flex flex-col gap-4 md:items-end">
          <div class="flex gap-2.5">
            <a href="${C.site.instagram}" target="_blank" rel="noopener" aria-label="Instagram" class="grid h-11 w-11 place-items-center rounded-full text-white transition hover:-translate-y-0.5" style="background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)">${icon('instagram', 'h-5 w-5')}</a>
            <a href="${C.site.facebook}" target="_blank" rel="noopener" aria-label="Facebook" class="grid h-11 w-11 place-items-center rounded-full bg-[#1877F2] text-white transition hover:-translate-y-0.5">${fbIcon('h-5 w-5')}</a>
            <a href="${C.site.tiktok}" target="_blank" rel="noopener" aria-label="TikTok" class="grid h-11 w-11 place-items-center rounded-full bg-black text-white ring-1 ring-white/20 transition hover:-translate-y-0.5">${ttIcon('h-5 w-5')}</a>
            <a href="https://wa.me/${C.site.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp" class="grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white transition hover:-translate-y-0.5">${waIcon('h-5 w-5')}</a>
          </div>
          <p class="flex items-center gap-2 text-sm text-white/65">${icon('pin', 'h-4 w-4 text-gold-400')} ${t(C.site.address)} · ${tr('On-site service across Qatar', 'خدمة في الموقع في جميع أنحاء قطر')}</p>
        </div>
      </div>
    </div>
  </div>
</footer>

<a href="${waHello()}" target="_blank" rel="noopener" aria-label="${t(C.ui.whatsapp)}" class="fixed bottom-5 end-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_-8px_rgba(37,211,102,.7)] transition hover:scale-105">
  <span class="ping-soft absolute inset-0 rounded-full bg-[#25D366]"></span>${waIcon('relative h-7 w-7')}
</a>
<script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

const layout = (page, meta, body) => `${head(page, meta)}
<body>
${header(page)}
<main id="main">
${body}
</main>
${footer()}`;

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
  <div class="relative mx-auto w-full max-w-[440px] py-6" ${reveal(150)}>
    <div class="orbit inset-[-6%] hidden sm:block"></div>
    <div class="orbit inset-[-16%] hidden opacity-60 sm:block"></div>
    <span class="absolute start-[2%] top-[12%] text-2xl text-gold-500">✦</span>
    <span class="absolute bottom-[18%] end-[-2%] h-3 w-3 rounded-full bg-gold-400"></span>
    <div class="arch relative aspect-[4/5]">
      <img src="/assets/img/${image}.webp" alt="${esc(alt)}" class="h-full w-full object-cover" fetchpriority="high">
    </div>
    ${top ? `<div class="float-chip floaty absolute end-[-2%] top-[14%] flex items-center gap-3 p-3 pe-5 xl:end-[-10%]">${top}</div>` : ''}
    ${bottom ? `<div class="float-chip floaty-2 absolute bottom-[14%] start-[-2%] flex items-center gap-3 p-3 pe-5 xl:start-[-10%]">${bottom}</div>` : ''}
  </div>`;
}

function hero() {
  return `
<section class="px-2.5 sm:px-3">
  <div class="hero-bg relative overflow-hidden rounded-[28px]">
    <div class="pointer-events-none absolute inset-0 grid-lines"></div>
    <div class="container-site relative grid items-center gap-12 pb-44 pt-12 lg:grid-cols-2 lg:pt-16">
      <div>
        <span class="chip" ${reveal()}><span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-ink">${icon('sun', 'h-4 w-4', 2.2)}</span>${tr('Window tint & protection · Qatar', 'تظليل وحماية · قطر')}</span>
        <h1 class="mt-6 font-head text-[2.3rem] font-extrabold leading-[1.06] text-ink min-[400px]:text-[2.7rem] sm:text-6xl lg:text-[3.3rem] xl:text-[4.1rem]" ${reveal(80)}>
          ${tr('Beat Qatar’s heat.', 'تغلّب على حرارة قطر.')}<br>${tr('Tinted to', 'بتظليل')} <span class="text-grad">${tr('perfection.', 'مثالي.')}</span>
        </h1>
        <p class="mt-5 max-w-lg text-[1.12rem] leading-relaxed text-muted" ${reveal(140)}>${tr(
          'Premium window tinting and protective films for cars, homes and offices — installed on-site anywhere in Qatar, 7 days a week.',
          'تظليل نوافذ وأفلام حماية فاخرة للسيارات والمنازل والمكاتب — نركّبها في موقعك في أي مكان في قطر، ٧ أيام في الأسبوع.'
        )}</p>
        <div class="mt-8 flex flex-wrap gap-3" ${reveal(200)}>
          <a href="#quote" class="btn btn-primary">${t(C.ui.quote)} ${arrow()}</a>
          <a href="tel:${C.site.phoneRaw}" class="btn btn-white"><span class="grid h-7 w-7 place-items-center rounded-lg bg-tint text-gold-700">${icon('phone', 'h-4 w-4')}</span><span dir="ltr">${C.site.phone}</span></a>
        </div>
        <div class="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[0.95rem]" ${reveal(260)}>
          <span class="hero-check"><span>${icon('check', 'h-3 w-3', 3)}</span>${tr('99% UV blocked', 'حجب ٩٩٪ من الأشعة')}</span>
          <span class="hero-check"><span>${icon('check', 'h-3 w-3', 3)}</span>${tr('We come to you', 'نأتي إليك')}</span>
          <span class="hero-check"><span>${icon('check', 'h-3 w-3', 3)}</span>${tr('Flat-rate pricing', 'أسعار ثابتة')}</span>
        </div>
      </div>
      ${archVisual({
        image: 'automotive',
        alt: tr('Professionally tinted car windows', 'زجاج سيارة مظلل باحترافية'),
        top: `<span class="ico">${icon('thermo', 'h-5 w-5', 2.2)}</span><span><span class="block text-xs text-muted">${tr('Heat rejection', 'العزل الحراري')}</span><span class="block font-head text-lg font-extrabold text-ink">${tr('Up to 60%', 'حتى ٦٠٪')}</span></span>`,
        bottom: `<span class="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">${icon('check', 'h-4 w-4', 3)}</span><span><span class="block text-xs text-muted">${tr('Installed on-site', 'تم التركيب في الموقع')}</span><span class="block font-head text-base font-extrabold text-ink">${tr('Lusail · Today', 'لوسيل · اليوم')}</span></span>`,
      })}
    </div>

    <div class="absolute inset-x-0 bottom-0">
      <div class="container-site">
        <div class="rounded-t-[28px] bg-white px-4 pb-6 pt-6 sm:px-8">
          <p class="flex items-center justify-center gap-4 text-center text-sm text-muted"><span class="hidden h-px w-20 bg-line sm:block"></span><span>${tr('Serving <b class="text-ink">drivers, homes &amp; businesses</b> across Qatar', 'نخدم <b class="text-ink">السائقين والمنازل والشركات</b> في جميع أنحاء قطر')}</span><span class="hidden h-px w-20 bg-line sm:block"></span></p>
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
  return `
<a href="${href('service/' + s.slug + '/')}" class="svc-card flex min-h-[290px] flex-col ${grid ? 'h-full' : 'w-[290px] shrink-0 snap-start sm:w-[300px]'}" style="background:${v.bg};color:${v.color}">
  <div class="flex items-center gap-3">
    <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-md" style="background:${v.acc};color:${v.on}">${icon(s.icon, 'h-5 w-5', 2.1)}</span>
    <h3 class="font-head text-[1.22rem] font-bold leading-tight text-ink">${t(s.title)}</h3>
  </div>
  <span class="mt-4 inline-flex w-max rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm" style="color:${v.color}">${t(v.badge)}</span>
  <p class="mt-3 line-clamp-3 max-w-[15rem] text-[0.95rem] leading-snug text-muted">${t(s.summary)}</p>
  <div class="relative z-10 mt-auto flex items-end justify-between pt-4">
    <span class="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold shadow-md" style="background:${v.acc};color:${v.on}">${t(C.ui.learnMore)} ${arrow('h-3.5 w-3.5')}</span>
    ${img3d(v.emoji, 'emoji -mb-3 -me-2 h-28 w-28 drop-shadow-xl')}
  </div>
</a>`;
}

function servicesSlider() {
  return `
<section id="services" class="relative pb-20 pt-4 lg:pb-28">
  <div class="pointer-events-none absolute inset-x-0 top-10 mx-auto h-72 max-w-4xl rounded-full bg-gold-100/60 blur-3xl"></div>
  <div class="container-site relative">
    ${sectionHead({
      eyebrow: tr('Our services', 'خدماتنا'),
      title: tr('Find the right film for <span class="text-grad">your space</span>', 'اختر الفيلم المناسب <span class="text-grad">لمساحتك</span>'),
      text: tr('From daily drivers to marble kitchens — six specialist services, installed on-site by our team.', 'من السيارات اليومية إلى مطابخ الرخام — ست خدمات متخصصة يركّبها فريقنا في موقعك.'),
      center: true,
    })}
    <div class="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 pt-2" data-slider>
      ${C.services.map((s) => serviceCard(s)).join('')}
    </div>
    <div class="mt-2 flex flex-wrap items-center justify-between gap-4">
      <p class="inline-flex items-center gap-3 rounded-full border border-line bg-white px-4 py-2.5 text-[0.95rem] font-medium text-ink shadow-card"><span class="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600">${icon('shield', 'h-4 w-4', 2.2)}</span>${tr('Every estimate is free — no hidden fees.', 'كل التقديرات مجانية — دون رسوم خفية.')}</p>
      <div class="flex items-center gap-4">
        <div class="hidden h-1 w-36 overflow-hidden rounded-full bg-line sm:block"><div class="h-full w-1/3 rounded-full bg-grad transition-all duration-300" data-slider-bar></div></div>
        <button type="button" class="grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-ink shadow-card transition hover:-translate-y-0.5" data-slider-prev aria-label="${tr('Previous', 'السابق')}">${icon('arrowLeft', 'h-5 w-5 rtl:-scale-x-100', 2.2)}</button>
        <button type="button" class="grid h-12 w-12 place-items-center rounded-full bg-grad text-ink shadow-gold transition hover:-translate-y-0.5" data-slider-next aria-label="${tr('Next', 'التالي')}">${arrow('h-5 w-5')}</button>
      </div>
    </div>
  </div>
</section>`;
}

function howItWorks() {
  const step = (n, ic, title, text, mock, d) => `
    <div class="relative flex flex-col rounded-[22px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur" ${reveal(d)}>
      <div class="flex items-start justify-between">
        <span class="font-head text-[2.6rem] font-extrabold leading-none text-grad">${num(pad(n))}</span>
        <span class="ico">${icon(ic, 'h-5 w-5', 2.2)}</span>
      </div>
      <h3 class="mt-5 font-head text-xl font-bold text-white">${title}</h3>
      <p class="mt-2 text-[0.95rem] leading-relaxed text-white/65">${text}</p>
      <div class="mt-7 pt-1 sm:mt-auto">${mock}</div>
    </div>`;
  const mock1 = `
    <div class="rounded-xl bg-white p-3.5 text-ink"><span class="block text-xs text-muted">${tr('What needs tinting?', 'ماذا تريد أن تظلل؟')}</span><span class="mt-0.5 block font-head text-lg font-bold">${tr('Villa · 14 windows', 'فيلا · ١٤ نافذة')}</span></div>
    <div class="mt-2.5 grid grid-cols-3 gap-1 rounded-xl bg-white p-1 text-center text-sm font-semibold text-muted">
      <span class="py-2">${tr('Car', 'سيارة')}</span><span class="rounded-lg bg-grad py-2 text-ink shadow-gold">${tr('Home', 'منزل')}</span><span class="py-2">${tr('Office', 'مكتب')}</span>
    </div>`;
  const mock2 = `
    <div class="space-y-2 text-sm font-semibold">
      <div class="flex items-center justify-between rounded-xl border-2 border-gold-400 bg-white px-3.5 py-2.5 text-ink"><span class="flex items-center gap-2">${icon('layers', 'h-4 w-4 text-gold-600')}${tr('Super nano ceramic', 'سوبر نانو سيراميك')}</span><span class="rounded-full bg-grad px-2 py-0.5 text-[11px] font-bold">${tr('Best', 'الأفضل')}</span></div>
      <div class="flex items-center justify-between rounded-xl bg-white/85 px-3.5 py-2.5 text-ink/80"><span class="flex items-center gap-2">${icon('layers', 'h-4 w-4 text-muted')}${tr('Nano ceramic', 'نانو سيراميك')}</span><span class="text-xs">${tr('Great', 'ممتاز')}</span></div>
      <div class="flex items-center justify-between rounded-xl bg-white/70 px-3.5 py-2.5 text-ink/70"><span class="flex items-center gap-2">${icon('layers', 'h-4 w-4 text-muted')}${tr('Regular tint', 'تظليل عادي')}</span><span class="text-xs">${tr('Basic', 'أساسي')}</span></div>
    </div>`;
  const mock3 = `
    <div class="flex items-center gap-3 rounded-xl bg-white p-3.5"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">${icon('check', 'h-4 w-4', 3)}</span><span><span class="block font-head font-bold text-ink">${tr('Installation booked', 'تم حجز التركيب')}</span><span class="block text-xs text-muted">${tr('Tomorrow · 10:00 AM · Lusail', 'غداً · ١٠:٠٠ صباحاً · لوسيل')}</span></span></div>
    <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div class="h-full w-4/5 rounded-full bg-grad"></div></div>`;
  return `
<section class="px-2.5 sm:px-3">
  <div class="relative overflow-hidden rounded-[28px] navy-bg">
    <div class="pointer-events-none absolute inset-0 grid-lines-dark"></div>
    <div class="container-site relative py-20 lg:py-24">
      <div class="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        ${sectionHead({
          eyebrow: tr('How it works', 'كيف نعمل'),
          title: tr('Get tinted in <span class="text-grad">3 simple steps</span>', 'تظليل احترافي في <span class="text-grad">٣ خطوات بسيطة</span>'),
          text: tr('From your first message to a flawless finish — no showroom visits, no waiting around.', 'من رسالتك الأولى حتى النتيجة المثالية — دون زيارة معارض ودون انتظار.'),
          dark: true,
        })}
        <div class="flex flex-wrap items-center gap-3" ${reveal(100)}>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/75">${icon('clock', 'h-4 w-4')} ${tr('Book in under <b class="text-white">60 sec</b>', 'احجز في أقل من <b class="text-white">٦٠ ثانية</b>')}</span>
          <a href="#quote" class="btn btn-primary">${tr('Get started', 'ابدأ الآن')} ${arrow()}</a>
        </div>
      </div>
      <div class="mt-12 grid gap-5 lg:grid-cols-3">
        ${step(1, 'edit', tr('Tell us what you need', 'أخبرنا بما تحتاجه'), tr('Car, villa, office or surface — send sizes or a few photos on WhatsApp.', 'سيارة أو فيلا أو مكتب أو سطح — أرسل المقاسات أو بعض الصور عبر واتساب.'), mock1, 0)}
        ${step(2, 'scale', tr('Choose your film', 'اختر الفيلم'), tr('We recommend the right film and send a clear, flat-rate quote.', 'نوصي بالفيلم المناسب ونرسل عرض سعر واضحاً وثابتاً.'), mock2, 100)}
        ${step(3, 'check', tr('We install on-site', 'نركّب في موقعك'), tr('Our specialists come to you, install with precision and inspect before handover.', 'يأتي مختصونا إليك ويركّبون بدقة ويفحصون العمل قبل التسليم.'), mock3, 200)}
      </div>
      <div class="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4" ${reveal(150)}>
        ${[
          ['sun', tr('99% UV protection', 'حماية ٩٩٪ من الأشعة')],
          ['wallet', tr('Flat-rate, no hidden fees', 'سعر ثابت دون رسوم خفية')],
          ['truck', tr('On-site across Qatar', 'في موقعك في كل قطر')],
          ['calendar', tr('Open 7 days a week', 'نعمل ٧ أيام في الأسبوع')],
        ]
          .map(([ic, l]) => `<div class="flex items-center justify-center gap-2.5 bg-ink px-4 py-4 text-sm font-semibold text-white">${icon(ic, 'h-4 w-4 text-gold-400', 2.2)} ${l}</div>`)
          .join('')}
      </div>
    </div>
  </div>
</section>`;
}

function difference() {
  return `
<section class="py-20 lg:py-28">
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[28px] border border-[#f6e6c8] bg-gradient-to-br from-tint via-white to-[#FFF3DD] p-6 shadow-glow sm:p-10 lg:p-14">
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
            <span class="absolute right-3 top-3 rounded-full bg-grad px-3 py-1.5 text-xs font-bold text-ink shadow ${L === 'ar' ? 'font-arabic' : ''}">${tr('With Exotic Tint', 'مع إكزوتك تينت')}</span>
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
    { v: 35, privacy: 3, best: tr('Balanced daily driving', 'قيادة يومية متوازنة') },
    { v: 20, privacy: 4, best: tr('Rear windows & villas', 'النوافذ الخلفية والفلل') },
    { v: 5, privacy: 5, best: tr('Maximum, limo-level privacy', 'خصوصية قصوى بمستوى الليموزين') },
  ];
  const scenes = [
    ['car', tr('Car', 'سيارة'), 'automotive'],
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
        ${scenes.map(([ic, l, img], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-scene="${img}" class="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-muted transition aria-selected:bg-grad aria-selected:text-ink aria-selected:shadow-gold">${icon(ic, 'h-4 w-4', 2.2)} ${l}</button>`).join('')}
      </div>
    </div>
    <div class="mt-10 grid overflow-hidden rounded-[28px] border border-line shadow-soft lg:grid-cols-2" data-tint-lab data-shades='${esc(JSON.stringify(shades))}' ${reveal(150)}>
      <div class="relative bg-white p-6 sm:p-10">
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
          <p class="mt-8 flex gap-2 rounded-2xl border border-[#f6e3bf] bg-tint p-4 text-sm text-muted">${icon('info', 'mt-0.5 h-4 w-4 shrink-0 text-gold-700', 2.2)}${tr('Visual preview only. Our ceramic films block 99% of UV. Vehicle tint must follow local regulations — we’ll advise on compliant options.', 'معاينة بصرية فقط. أفلام السيراميك لدينا تحجب ٩٩٪ من الأشعة. يجب أن يتوافق تظليل السيارات مع الأنظمة المحلية — وسننصحك بالخيارات المسموحة.')}</p>
        </div>
      </div>
      <div class="relative p-6 sm:p-10 navy-bg">
        <div class="flex items-center gap-2 text-white/80"><span class="font-semibold">${tr('Your preview', 'المعاينة')}</span><span class="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold uppercase text-emerald-300">${tr('Live', 'مباشر')}</span></div>
        <p class="mt-2 font-head text-5xl font-extrabold text-white" dir="ltr"><span data-out="vlt2">35</span>% <span class="text-2xl text-white/60">VLT</span></p>
        <div class="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl border-4 border-white/10">
          <img src="/assets/img/automotive.webp" alt="${tr('Tint preview', 'معاينة التظليل')}" class="h-full w-full object-cover transition-opacity duration-300" data-scene-img loading="lazy">
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

function statsStrip() {
  const items = [
    ['star', '99', '%', tr('UV blocked', 'حجب الأشعة'), tr('With ceramic films', 'مع أفلام السيراميك')],
    ['thermo', '60', '%', tr('Heat rejection', 'العزل الحراري'), tr('Premium auto films', 'أفلام السيارات الفاخرة')],
    ['layers', '6', '+', tr('Specialist services', 'خدمات متخصصة'), tr('Cars, homes & surfaces', 'سيارات ومنازل وأسطح')],
    ['clock', '7', '/7', tr('Days a week', 'أيام في الأسبوع'), tr('8 AM – 6 PM', '٨ ص – ٦ م')],
  ];
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="grid grid-cols-2 overflow-hidden rounded-[28px] border-2 border-[#f6e6c8] bg-white shadow-glow lg:grid-cols-4" ${reveal()}>
      ${items
        .map(
          ([ic, n, sup, title, sub], i) => `
      <div class="flex flex-col items-center px-4 py-9 text-center ${i % 2 ? 'border-s border-dashed border-line' : ''} ${i > 1 ? 'border-t border-dashed border-line lg:border-t-0' : ''} ${i === 2 ? 'lg:border-s' : ''}">
        <span class="ico">${icon(ic, 'h-5 w-5', 2.2)}</span>
        <span class="mt-4 font-head text-[2.6rem] font-extrabold leading-none text-ink sm:text-[3.2rem]" dir="ltr">${n}<sup class="text-2xl text-gold-600">${sup}</sup></span>
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
          ${f.featured ? `<span class="absolute -top-0 rounded-b-xl bg-grad px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink shadow-gold">${tr('Recommended', 'موصى به')}</span>` : ''}
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
  const feats = [
    ['thermometer', tr('Heat reduction', 'تقليل الحرارة'), tr('Keep spaces cool and comfortable with heat-rejection window film.', 'حافظ على برودة وراحة المكان مع أفلام العزل الحراري.'), tr('Up to 10°C cooler', 'أبرد حتى ١٠ درجات')],
    ['shield', tr('99% UV protection', 'حماية ٩٩٪ من الأشعة'), tr('Safeguard interiors and skin from harmful rays all year.', 'احمِ التصميم الداخلي والبشرة من الأشعة الضارة طوال العام.'), tr('Ceramic films', 'أفلام السيراميك')],
    ['locked', tr('Privacy & security', 'الخصوصية والأمان'), tr('Peace of mind for vehicles, villas and workplaces.', 'راحة بال للسيارات والفلل وأماكن العمل.'), tr('Day-time privacy', 'خصوصية نهارية')],
    ['voltage', tr('Energy savings', 'توفير الطاقة'), tr('Lower AC load and reduce Kahramaa bills.', 'حمل أقل على التكييف وفواتير كهرماء أقل.'), tr('Up to 30% less AC', 'تكييف أقل حتى ٣٠٪')],
  ];
  return `
<section class="py-20 lg:py-28">
  <div class="container-site">
    <div class="grid gap-5 lg:grid-cols-12">
      <div class="relative overflow-hidden rounded-[28px] p-8 navy-bg sm:p-10 lg:col-span-5 lg:row-span-2" ${reveal()}>
        <div class="pointer-events-none absolute inset-0 grid-lines-dark"></div>
        <div class="relative flex h-full flex-col">
          <span class="eyebrow !text-gold-300">${tr('Why Exotic Tint', 'لماذا إكزوتك تينت')}</span>
          <h2 class="mt-4 font-head text-[2rem] font-extrabold leading-[1.1] text-white sm:text-[2.5rem]">${tr('Qatar’s top window tint &amp; <span class="text-grad">protection experts</span>', 'خبراء التظليل <span class="text-grad">والحماية</span> الأوائل في قطر')}</h2>
          <p class="mt-4 leading-relaxed text-white/70">${tr('We reduce heat, block UV rays and enhance privacy with expert installation across Doha, Lusail, Al Rayyan and beyond.', 'نقلل الحرارة ونحجب الأشعة ونعزز الخصوصية بتركيب احترافي في الدوحة ولوسيل والريان وما بعدها.')}</p>
          <div class="relative mt-8 overflow-hidden rounded-[22px] border-4 border-white/10">
            <img src="/assets/img/residential.webp" alt="${tr('Tinted villa windows', 'نوافذ فيلا مظللة')}" class="aspect-[16/10] w-full object-cover" loading="lazy">
            <div class="float-chip absolute bottom-3 start-3 flex items-center gap-2 px-3 py-2 text-sm font-bold text-ink">${starsRow('h-3.5 w-3.5')} ${tr('Trusted across Qatar', 'موثوقون في كل قطر')}</div>
          </div>
          <div class="mt-auto pt-8">
            <div class="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white p-4 ps-5">
              <div><p class="text-xs font-semibold uppercase tracking-wider text-muted">${tr('Call us!', 'اتصل بنا!')}</p><a href="tel:${C.site.phoneRaw}" class="font-head text-2xl font-extrabold text-ink" dir="ltr">${C.site.phone}</a></div>
              <a href="tel:${C.site.phoneRaw}" class="grid h-12 w-12 place-items-center rounded-full bg-grad text-ink shadow-gold" aria-label="${t(C.ui.callUs)}">${icon('phone', 'h-5 w-5', 2.2)}</a>
            </div>
          </div>
        </div>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:col-span-7">
      ${feats
        .map(
          ([emoji, title, text, stat], i) => `
      <div class="group relative overflow-hidden rounded-[28px] border border-line bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft" ${reveal(i * 80)}>
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-gold-100/60 transition duration-500 group-hover:scale-125"></div>
        <div class="relative flex h-full flex-col">
          <div class="flex items-start justify-between gap-3">${img3d(emoji, 'h-20 w-20 drop-shadow-xl transition duration-500 group-hover:-rotate-6 group-hover:scale-110')}<span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-gold-700 shadow-sm">${stat}</span></div>
          <h3 class="mt-6 font-head text-[1.35rem] font-bold text-ink">${title}</h3>
          <p class="mt-2 leading-relaxed text-muted">${text}</p>
          <span class="mt-auto pt-5 font-head text-5xl font-extrabold leading-none text-gold-100">${num(pad(i + 1))}</span>
        </div>
      </div>`
        )
        .join('')}
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
    ['bulb', tr('Advanced tint & protection', 'حلول تظليل وحماية متطورة'), tr('Privacy, UV protection and energy efficiency for cars, homes and offices.', 'خصوصية وحماية وكفاءة طاقة للسيارات والمنازل والمكاتب.')],
  ];
  const bubble = (me, text, time) =>
    `<div class="flex ${me ? 'justify-end' : 'justify-start'}"><div class="max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug shadow-sm ${me ? 'rounded-ee-md bg-[#d9fdd3] text-ink' : 'rounded-es-md bg-white text-ink'}">${text}<span class="ms-2 inline-block align-bottom text-[10px] text-muted">${time}${me ? ' ✓✓' : ''}</span></div></div>`;
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[28px] bg-grad p-7 shadow-glow sm:p-12" ${reveal()}>
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
        <div class="relative mx-auto w-full max-w-[340px]">
          <div class="rounded-[38px] bg-ink p-2.5 shadow-[0_40px_70px_-25px_rgba(18,35,61,.7)]">
            <div class="overflow-hidden rounded-[30px] bg-[#efe7dd]">
              <div class="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
                <img src="/assets/img/logo-original.webp" alt="" class="h-9 w-9 rounded-full bg-white object-contain p-0.5">
                <div class="flex-1"><p class="text-sm font-semibold">${t(C.site.name)}</p><p class="text-[11px] text-white/75">${tr('online', 'متصل الآن')}</p></div>
                ${icon('phone', 'h-4 w-4')}
              </div>
              <div class="space-y-2.5 p-4 [background-image:radial-gradient(rgba(0,0,0,.04)_1px,transparent_1px)] [background-size:14px_14px]">
                <p class="mx-auto w-max rounded-lg bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-muted">${tr('TODAY', 'اليوم')}</p>
                ${bubble(true, tr('Hi! I need tint for my car and villa windows 🚙🏡', 'مرحباً! أحتاج تظليل لسيارتي ونوافذ الفيلا 🚙🏡'), '10:02')}
                ${bubble(false, tr('Welcome to Exotic Tint Qatar! Send us a photo and we’ll recommend the best film 👌', 'أهلاً بك في إكزوتك تينت قطر! أرسل لنا صورة وسنوصي بأفضل فيلم 👌'), '10:03')}
                <div class="flex justify-end"><div class="h-24 w-36 overflow-hidden rounded-2xl rounded-ee-md border-4 border-[#d9fdd3]"><img src="/assets/img/residential.webp" alt="" class="h-full w-full object-cover" loading="lazy"></div></div>
                ${bubble(false, tr('Super nano ceramic is perfect ✅ We can install tomorrow at 10 AM in Lusail.', 'السوبر نانو سيراميك مثالي ✅ يمكننا التركيب غداً الساعة ١٠ صباحاً في لوسيل.'), '10:05')}
                ${bubble(true, tr('Booked! Thank you 🙏', 'تم الحجز! شكراً لكم 🙏'), '10:05')}
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
  const tile = (slug, cls) => {
    const s = svc(slug);
    return `<a href="${href('service/' + s.slug + '/')}" class="group relative overflow-hidden rounded-[22px] ${cls}" ${reveal()}>
      <img src="/assets/img/${s.img}.webp" alt="${esc(t(s.title))}" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy">
      <div class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-80 transition group-hover:opacity-100"></div>
      <div class="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <div><span class="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink">${t(s.short)}</span><p class="mt-2 font-head text-lg font-bold text-white">${t(s.title)}</p></div>
        <span class="grid h-10 w-10 shrink-0 translate-y-2 place-items-center rounded-full bg-grad text-ink opacity-0 shadow-gold transition group-hover:translate-y-0 group-hover:opacity-100">${arrow('h-4 w-4')}</span>
      </div>
    </a>`;
  };
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      ${sectionHead({ eyebrow: tr('Our work', 'أعمالنا'), title: tr('Fresh from our <span class="text-grad">installations</span>', 'من أحدث <span class="text-grad">أعمالنا</span>'), text: tr('Cars, villas, offices and surfaces — finished by our team across Qatar.', 'سيارات وفلل ومكاتب وأسطح — أنجزها فريقنا في أنحاء قطر.') })}
      <a href="${C.site.instagram}" target="_blank" rel="noopener" class="btn btn-white w-max" ${reveal(100)}><span class="grid h-7 w-7 place-items-center rounded-lg text-white" style="background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)">${icon('instagram', 'h-4 w-4')}</span>@exotic_tint_qatar</a>
    </div>
    <div class="mt-10 grid auto-rows-[200px] grid-cols-2 gap-4 lg:auto-rows-[230px] lg:grid-cols-4">
      ${tile('automotive-window-tinting', 'col-span-2 row-span-2')}
      ${tile('customized-cut-frosted-film', '')}
      ${tile('marble-protection-film', '')}
      ${tile('commercial-window-tinting-services', 'col-span-2')}
      ${tile('fabric-nano-coating-service', '')}
      <a href="${C.site.instagram}" target="_blank" rel="noopener" class="group relative flex flex-col justify-between overflow-hidden rounded-[22px] p-5 text-white" style="background:linear-gradient(135deg,#f9ce34 0%,#ee2a7b 50%,#6228d7 100%)" ${reveal()}>
        ${img3d('camera', 'absolute -bottom-3 -end-3 h-24 w-24 opacity-90 drop-shadow-xl transition duration-500 group-hover:rotate-12')}
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur">${icon('instagram', 'h-5 w-5')}</span>
        <div><p class="font-head text-xl font-extrabold leading-tight">${tr('See more on Instagram', 'شاهد المزيد على إنستغرام')}</p><p class="mt-1 text-sm text-white/85">${tr('Follow for daily work', 'تابعنا لأعمالنا اليومية')}</p></div>
      </a>
      ${tile('residential-window-tinting-services', 'col-span-2')}
    </div>
  </div>
</section>`;
}

/* Service areas (from the original site) */
function areasSection() {
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[28px] border border-[#f6e6c8] bg-gradient-to-br from-tint via-white to-tint-2 p-7 shadow-glow sm:p-12">
      <div class="pointer-events-none absolute inset-0 dots opacity-50 [mask-image:radial-gradient(ellipse_at_70%_50%,#000_20%,transparent_70%)]"></div>
      <div class="relative grid items-center gap-12 lg:grid-cols-12">
        <div class="lg:col-span-5">
          ${sectionHead({
            eyebrow: tr('Service areas', 'مناطق الخدمة'),
            title: tr('Across Qatar. <span class="text-grad">At your door.</span>', 'في كل قطر. <span class="text-grad">عند بابك.</span>'),
            text: tr('Professional window tint and marble protection across Doha, Lusail, Al Rayyan, Al Wakra and surrounding areas — heat-resistant, UV-blocking solutions for your home, office and vehicle.', 'خدمات تظليل وحماية رخام احترافية في الدوحة ولوسيل والريان والوكرة والمناطق المحيطة — حلول مقاومة للحرارة وحاجبة للأشعة لمنزلك ومكتبك وسيارتك.'),
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
  <div class="flex flex-col items-center justify-between gap-5 rounded-[22px] border border-dashed border-[#e7d7b8] bg-tint-2 p-5 sm:p-6 lg:flex-row" ${reveal()}>
    <div class="flex items-center gap-4">${img3d('chat', 'h-14 w-14 drop-shadow-lg')}<div><p class="font-head text-xl font-bold text-ink">${tr('Happy with our work? Review us on', 'راضٍ عن عملنا؟ قيّمنا على')}</p><p class="text-sm text-muted">${tr('Your feedback helps other drivers and homeowners in Qatar.', 'رأيك يساعد السائقين وأصحاب المنازل الآخرين في قطر.')}</p></div></div>
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
      <a href="${href('blogs/')}" class="btn btn-white w-max !pe-2" ${reveal(100)}>${tr('View all posts', 'كل المقالات')} <span class="grid h-9 w-9 place-items-center rounded-full bg-grad text-ink">${arrow('h-4 w-4')}</span></a>
    </div>
    <div class="mt-10 grid gap-5 lg:grid-cols-12">
      <a href="${href(f.slug + '/')}" class="group relative min-h-[460px] overflow-hidden rounded-[28px] shadow-soft lg:col-span-7" ${reveal()}>
        <img src="/assets/img/${f.img}.webp" alt="${esc(t(f.title))}" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"></div>
        <span class="absolute start-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gold-700 shadow">${icon('star', 'h-3.5 w-3.5', 2.4)} ${tr('Editor’s pick', 'اختيار المحرر')}</span>
        <span class="absolute end-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">${icon('clock', 'h-3.5 w-3.5', 2.4)} ${num(f.read)} ${tr('min read', 'دقائق قراءة')}</span>
        <div class="absolute inset-x-4 bottom-4 rounded-[22px] border border-white/20 bg-ink/55 p-6 backdrop-blur-xl">
          <span class="rounded-full bg-grad px-2.5 py-1 text-[11px] font-extrabold uppercase text-ink">${t(f.cat)}</span>
          <h3 class="mt-3 font-head text-2xl font-extrabold leading-tight text-white">${t(f.title)}</h3>
          <p class="mt-2 line-clamp-2 text-sm text-white/80">${t(f.excerpt)}</p>
          <div class="mt-4 flex items-center justify-between border-t border-white/15 pt-4">
            <span class="flex items-center gap-2.5"><img src="/assets/img/logo-original.webp" alt="" class="h-9 w-9 rounded-full bg-white object-contain p-0.5"><span><span class="block text-sm font-bold text-white">${tr('Exotic Tint team', 'فريق إكزوتك تينت')}</span><span class="block text-xs text-white/70">${fmtDate(f.date)}</span></span></span>
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
            <div class="mt-auto flex items-center justify-between pt-3 text-xs text-muted"><span class="flex items-center gap-1.5">${icon('clock', 'h-3.5 w-3.5')} ${num(p.read)} ${tr('min', 'د')} · ${fmtDate(p.date)}</span><span class="grid h-8 w-8 place-items-center rounded-full bg-[#f2f4f7] text-ink transition group-hover:bg-grad">${arrow('h-3.5 w-3.5')}</span></div>
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
        <span class="relative mx-auto grid h-[72px] w-[72px] place-items-center rounded-full border-[6px] border-white bg-grad font-head text-2xl font-extrabold text-ink shadow-gold">${num(i + 1)}</span>
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

function testimonials() {
  const data = C.testimonials.map((r) => ({ text: t(r.text), name: r.name, role: t(r.role), service: t(r.service) }));
  const r0 = data[0];
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      ${sectionHead({ eyebrow: tr('Client stories', 'قصص العملاء'), title: tr('Loved by clients <span class="text-grad">across Qatar</span>', 'محبوب لدى العملاء <span class="text-grad">في كل قطر</span>') })}
      <span class="inline-flex w-max items-center gap-3 rounded-full border border-line bg-white px-5 py-2.5 shadow-card" ${reveal(100)}>${starsRow()} <b class="text-ink">5.0</b><span class="text-sm text-muted">${tr('client rating', 'تقييم العملاء')}</span></span>
    </div>
    <div class="relative mt-10 overflow-hidden rounded-[28px] border border-line bg-gradient-to-br from-tint-2 via-white to-tint p-7 shadow-glow sm:p-12" data-testimonials='${esc(JSON.stringify(data))}' ${reveal(150)}>
      <div class="pointer-events-none absolute -bottom-24 -start-24 h-72 w-72 rounded-full border-[40px] border-gold-100/70"></div>
      <div class="relative grid items-center gap-12 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <span class="ico !h-14 !w-14 !rounded-2xl">${icon('quote', 'h-6 w-6', 2)}</span>
          <div data-t-body>
            <blockquote class="mt-7 min-h-[7.5rem] font-head text-[1.45rem] font-semibold leading-snug text-ink sm:text-[1.75rem]" data-t-text>${r0.text}</blockquote>
            <div class="my-7 border-t border-dashed border-[#e7d7b8]"></div>
            <div class="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p class="font-head text-xl font-bold text-ink" data-t-name>${r0.name}</p>
                <p class="text-muted" data-t-role>${r0.role}</p>
                <span class="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#f3d7a6] bg-white px-3 py-1 text-xs font-bold text-gold-700">${icon('user', 'h-3.5 w-3.5', 2.4)}<span data-t-service>${r0.service}</span></span>
              </div>
              <div class="flex gap-3">
                <button type="button" class="grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-ink shadow-card transition hover:-translate-y-0.5" data-t-prev aria-label="${tr('Previous', 'السابق')}">${icon('arrowLeft', 'h-5 w-5 rtl:-scale-x-100', 2.2)}</button>
                <button type="button" class="grid h-12 w-12 place-items-center rounded-full bg-grad text-ink shadow-gold transition hover:-translate-y-0.5" data-t-next aria-label="${tr('Next', 'التالي')}">${arrow('h-5 w-5')}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="relative mx-auto w-full max-w-sm lg:col-span-5">
          <div class="absolute inset-[-8%] rounded-full bg-gradient-to-br from-gold-200 via-gold-300 to-gold-500 opacity-80"></div>
          <div class="arch relative aspect-[4/5]"><img src="/assets/img/residential.webp" alt="${tr('A tinted villa in Qatar', 'فيلا مظللة في قطر')}" class="h-full w-full object-cover" loading="lazy"></div>
          <div class="float-chip absolute end-[-4%] top-[10%] px-3 py-2">${starsRow('h-4 w-4')}</div>
          <div class="float-chip floaty absolute bottom-[12%] start-[-6%] flex items-center gap-3 p-3 pe-5">
            <span class="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600">${icon('check', 'h-4 w-4', 3)}</span>
            <span><span class="block text-xs text-muted">${tr('Verified', 'موثّق')}</span><span class="block font-head font-bold text-ink">${tr('Exotic Tint client', 'عميل إكزوتك تينت')}</span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function faqSection(items, title) {
  return `
<section class="pb-20 lg:pb-28">
  <div class="container-site grid gap-12 lg:grid-cols-12">
    <div class="lg:col-span-5">
      ${sectionHead({ eyebrow: tr('FAQ', 'الأسئلة الشائعة'), title: title || tr('Questions? <span class="text-grad">Answered.</span>', 'لديك أسئلة؟ <span class="text-grad">إليك الإجابات.</span>') })}
      <div class="relative mt-8 overflow-hidden rounded-[22px] p-7 navy-bg" ${reveal(100)}>
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
      <details class="faq group rounded-2xl border border-line bg-white px-6 shadow-card transition" ${i === 0 ? 'open' : ''} ${reveal(i * 50)}>
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
    <div class="mt-10 grid overflow-hidden rounded-[28px] border border-line shadow-soft lg:grid-cols-12" ${reveal(120)}>
      <form class="relative bg-white p-6 sm:p-10 lg:col-span-7" data-quote-form novalidate
        data-msg-intro="${esc(tr('Hello Exotic Tint Qatar! I would like a free quote.', 'مرحباً إكزوتك تينت قطر! أرغب في الحصول على عرض سعر مجاني.'))}"
        data-l-name="${esc(tr('Name', 'الاسم'))}" data-l-phone="${esc(tr('Phone', 'الهاتف'))}" data-l-service="${esc(tr('Service', 'الخدمة'))}" data-l-area="${esc(tr('Area', 'المنطقة'))}" data-l-message="${esc(tr('Details', 'التفاصيل'))}" data-wa="${C.site.whatsapp}">
        <div class="pointer-events-none absolute inset-0 dots opacity-30 [mask-image:linear-gradient(180deg,#000,transparent_50%)]"></div>
        <div class="relative grid gap-5 sm:grid-cols-2">
          <div><label class="label" for="f-name">${tr('Full name', 'الاسم الكامل')} *</label><input id="f-name" name="name" required autocomplete="name" class="field" placeholder="${tr('Your name', 'اسمك')}"></div>
          <div><label class="label" for="f-phone">${tr('Phone', 'رقم الهاتف')} *</label><input id="f-phone" name="phone" required type="tel" autocomplete="tel" class="field" placeholder="+974" dir="ltr"></div>
          <div><label class="label" for="f-service">${tr('Service', 'الخدمة')}</label><select id="f-service" name="service" class="field">${C.services.map((s) => opt(t(s.title))).join('')}${opt(tr('Not sure yet', 'لم أحدد بعد'))}</select></div>
          <div><label class="label" for="f-area">${tr('Area', 'المنطقة')}</label><select id="f-area" name="area" class="field">${C.areas.map((a) => opt(t(a))).join('')}${opt(tr('Other', 'أخرى'))}</select></div>
          <div class="sm:col-span-2"><label class="label" for="f-message">${tr('Details', 'التفاصيل')}</label><textarea id="f-message" name="message" rows="4" class="field resize-none" placeholder="${tr('Car model, number of windows, surface size…', 'طراز السيارة، عدد النوافذ، مساحة السطح…')}"></textarea></div>
        </div>
        <p class="relative mt-4 hidden items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600" data-form-error>${icon('info', 'h-4 w-4', 2.2)} ${tr('Please add your name and phone number.', 'يرجى إدخال الاسم ورقم الهاتف.')}</p>
        <button type="submit" class="btn btn-primary relative mt-6 w-full !py-4">${waIcon('h-5 w-5')} ${tr('Send request on WhatsApp', 'أرسل الطلب عبر واتساب')}</button>
      </form>
      <div class="relative p-6 sm:p-10 navy-bg lg:col-span-5">
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
  <div class="hero-bg relative overflow-hidden rounded-[28px]">
    <div class="pointer-events-none absolute inset-0 grid-lines"></div>
    <div class="container-site relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
      <div>
        <nav class="flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb" ${reveal()}>
          <a href="${href()}" class="font-semibold hover:text-gold-700">${t(C.ui.nav.home)}</a>
          ${crumbs.map(([label, link]) => `${icon('chevron', 'h-3.5 w-3.5 -rotate-90 rtl:rotate-90')}${link ? `<a href="${link}" class="font-semibold hover:text-gold-700">${label}</a>` : `<span class="font-semibold text-ink">${label}</span>`}`).join('')}
        </nav>
        <span class="chip mt-6" ${reveal(40)}>${chip}</span>
        <h1 class="mt-5 text-balance font-head text-[2.15rem] font-extrabold leading-[1.08] text-ink min-[400px]:text-[2.5rem] sm:text-[3.2rem] lg:text-[2.9rem] xl:text-[3.4rem]" ${reveal(80)}>${title}</h1>
        ${text ? `<p class="mt-5 max-w-xl text-[1.1rem] leading-relaxed text-muted" ${reveal(140)}>${text}</p>` : ''}
        <div class="mt-8 flex flex-wrap gap-3" ${reveal(200)}>
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
      title: tr('Exotic Tint Qatar — Premium Window Tinting & Protective Films in Doha', 'إكزوتك تينت قطر — تظليل نوافذ وأفلام حماية فاخرة في الدوحة'),
      description: tr(
        'Premium car, home and commercial window tinting, frosted film, marble protection and fabric nano coating across Qatar. 99% UV protection, on-site installation, free estimates.',
        'تظليل فاخر للسيارات والمنازل والمباني التجارية، وأفلام مصنفرة وحماية رخام وطلاء نانو للأقمشة في جميع أنحاء قطر. حماية ٩٩٪ من الأشعة، تركيب في موقعك، وتقدير مجاني.'
      ),
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Exotic Tint Qatar',
        alternateName: 'إكزوتك تينت قطر',
        url: C.site.domain,
        logo: C.site.domain + '/assets/img/logo-original.webp',
        telephone: C.site.phoneRaw,
        email: C.site.email,
        image: C.site.domain + '/assets/img/automotive.webp',
        address: { '@type': 'PostalAddress', addressLocality: 'Doha', addressCountry: 'QA' },
        areaServed: C.areas.map((a) => a[0]),
        openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '08:00', closes: '18:00' },
        sameAs: [C.site.instagram],
      },
    },
    hero() +
      whyUs() +
      servicesSlider() +
      bookFast() +
      howItWorks() +
      difference() +
      tintStudio() +
      statsStrip() +
      filmTech() +
      promiseSection() +
      gallery() +
      areasSection() +
      testimonials() +
      reviewUs() +
      blogSection() +
      faqSection(C.homeFaq) +
      ctaBanner() +
      quoteSection()
  );
}

function pageAbout(page) {
  const body = `
${pageHero({
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-ink">${icon('user', 'h-4 w-4', 2.2)}</span>${tr('About us', 'من نحن')}`,
  title: tr('Comfort, privacy &amp; protection — <span class="text-grad">installed on-site</span>', 'راحة وخصوصية وحماية — <span class="text-grad">تُركّب في موقعك</span>'),
  text: tr('Exotic Tint Qatar specialises in premium window tinting and protective film solutions for cars, homes, offices and commercial spaces.', 'تتخصص إكزوتك تينت قطر في حلول تظليل النوافذ وأفلام الحماية الفاخرة للسيارات والمنازل والمكاتب والمنشآت التجارية.'),
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
        <div class="rounded-[22px] bg-grad p-5 text-ink shadow-gold"><span class="block font-head text-4xl font-extrabold">${num(6)}</span><span class="text-sm font-semibold">${tr('Specialist services under one roof', 'خدمات متخصصة تحت سقف واحد')}</span></div>
      </div>
    </div>
    <div>
      ${sectionHead({
        eyebrow: tr('Who we are', 'من نحن'),
        title: tr('A team of specialists <span class="text-grad">who come to you</span>', 'فريق من المختصين <span class="text-grad">يأتي إليك</span>'),
        text: tr('We are a team of skilled professionals offering on-site installation services across Qatar. Our goal is to provide cutting-edge tinting and coating solutions that enhance comfort, aesthetics and durability for both vehicles and buildings.', 'نحن فريق من المحترفين نقدم خدمات التركيب في الموقع في جميع أنحاء قطر. هدفنا تقديم حلول تظليل وطلاء متطورة تعزز الراحة والجمال والمتانة للسيارات والمباني.'),
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
      title: tr('About Exotic Tint Qatar — Window Tint & Protection Specialists', 'عن إكزوتك تينت قطر — مختصو التظليل والحماية'),
      description: tr('Meet Exotic Tint Qatar: skilled professionals delivering on-site window tinting, frosted film, marble protection and nano coating across Doha, Lusail and Al Rayyan.', 'تعرّف على إكزوتك تينت قطر: محترفون يقدمون خدمات التظليل والأفلام المصنفرة وحماية الرخام وطلاء النانو في موقعك.'),
      image: 'commercial',
    },
    body
  );
}

function pageServices(page) {
  const body = `
${pageHero({
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-ink">${icon('layers', 'h-4 w-4', 2.2)}</span>${tr('Our services', 'خدماتنا')}`,
  title: tr('Premium tinting &amp; <span class="text-grad">protection services</span>', 'خدمات تظليل وحماية <span class="text-grad">فاخرة</span>'),
  text: tr('Six specialist services for cars, homes, offices and surfaces — all installed on-site across Qatar.', 'ست خدمات متخصصة للسيارات والمنازل والمكاتب والأسطح — جميعها تُركّب في موقعك في أنحاء قطر.'),
  crumbs: [[t(C.ui.nav.services)]],
  image: 'residential',
  alt: tr('Tinted home windows', 'نوافذ منزل مظللة'),
  chips: chipHeat(),
})}
<section class="py-20 lg:py-28">
  <div class="container-site">
    ${sectionHead({ eyebrow: tr('All services', 'جميع الخدمات'), title: tr('Choose what you want <span class="text-grad">to protect</span>', 'اختر ما تريد <span class="text-grad">حمايته</span>'), center: true })}
    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">${C.services.map((s, i) => `<div ${reveal(i * 60)}>${serviceCard(s, { grid: true })}</div>`).join('')}</div>
  </div>
</section>
${whyUs()}
${bookFast()}
${howItWorks()}
<div class="h-20 lg:h-28"></div>
${filmTech()}
${processTimeline()}
${gallery()}
${areasSection()}
${faqSection(C.homeFaq)}
${ctaBanner()}
${quoteSection()}`;
  return layout(
    page,
    {
      title: tr('Window Tinting & Protection Services in Qatar | Exotic Tint Qatar', 'خدمات التظليل والحماية في قطر | إكزوتك تينت قطر'),
      description: tr('Automotive, residential and commercial window tinting, custom frosted film, marble protection film and fabric nano coating in Qatar.', 'تظليل السيارات والمنازل والمباني التجارية، والأفلام المصنفرة المخصصة، وأفلام حماية الرخام، وطلاء النانو للأقمشة في قطر.'),
      image: 'residential',
    },
    body
  );
}

function pageService(page) {
  const s = page.service;
  const v = SV[s.slug];
  const related = C.services.filter((x) => x !== s);
  const body = `
${pageHero({
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full" style="background:${v.acc};color:${v.on}">${icon(s.icon, 'h-4 w-4', 2.2)}</span>${t(s.title)}`,
  title: t(s.headline).replace(/(\S+\.?)$/, '<span class="text-grad">$1</span>'),
  text: t(s.summary),
  crumbs: [[t(C.ui.nav.services), href('service/')], [t(s.title)]],
  image: s.img,
  alt: t(s.title),
  chips: {
    top: `<span class="ico">${icon('star', 'h-5 w-5', 2.2)}</span><span><span class="block text-xs text-muted">${tr('Highlight', 'الميزة')}</span><span class="block font-head text-base font-extrabold text-ink">${t(v.badge)}</span></span>`,
    bottom: chipHeat().bottom,
  },
})}
<section class="py-20 lg:py-28">
  <div class="container-site grid gap-12 lg:grid-cols-12">
    <div class="lg:col-span-5">
      ${sectionHead({ eyebrow: tr('Overview', 'نظرة عامة'), title: tr(`What is <span class="text-grad">${t(s.title).toLowerCase()}</span>?`, `ما هو <span class="text-grad">${t(s.title)}</span>؟`) })}
      <div class="mt-8 flex items-center gap-4 rounded-[22px] p-5" style="background:${v.bg}" ${reveal(100)}>
        ${img3d(v.emoji, 'h-20 w-20 drop-shadow-xl')}
        <div><p class="font-head text-lg font-bold text-ink">${t(s.short)}</p><p class="text-sm text-muted">${tr('Installed on-site across Qatar', 'يُركّب في موقعك في كل قطر')}</p></div>
      </div>
    </div>
    <div class="space-y-5 text-[1.1rem] leading-relaxed text-muted lg:col-span-7" ${reveal(100)}>
      <p class="font-head text-[1.35rem] font-semibold leading-snug text-ink">${t(s.intro)}</p>
      <p>${t(s.whatIs)}</p>
    </div>
  </div>
</section>
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    ${sectionHead({ eyebrow: tr('Benefits', 'المزايا'), title: tr('Why it’s worth it <span class="text-grad">in Qatar</span>', 'لماذا يستحق ذلك <span class="text-grad">في قطر</span>'), center: true })}
    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      ${s.benefits.map(([b, d], i) => `<div class="card p-7 transition hover:-translate-y-1" ${reveal(i * 60)}><div class="flex items-center justify-between"><span class="ico">${icon('check', 'h-5 w-5', 2.6)}</span><span class="font-head text-3xl font-extrabold text-line">${num(pad(i + 1))}</span></div><h3 class="mt-5 font-head text-xl font-bold text-ink">${t(b)}</h3><p class="mt-2 leading-relaxed text-muted">${t(d)}</p></div>`).join('')}
    </div>
  </div>
</section>
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="relative overflow-hidden rounded-[28px] p-6 sm:p-10 lg:p-14" style="background:${v.bg}">
      <div class="pointer-events-none absolute inset-0 grid-lines opacity-60"></div>
      <div class="relative">
        ${sectionHead({ eyebrow: tr('Best uses', 'أفضل الاستخدامات'), title: tr('Made for <span class="text-grad">real life</span>', 'مصمم <span class="text-grad">لحياتك اليومية</span>') })}
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${s.uses.map(([u, d], i) => `<div class="rounded-[22px] border border-white bg-white/80 p-6 shadow-card backdrop-blur" ${reveal(i * 70)}><span class="font-head text-sm font-extrabold" style="color:${v.color}">${num(pad(i + 1))}</span><h3 class="mt-3 font-head text-xl font-bold text-ink">${t(u)}</h3><p class="mt-2 text-sm leading-relaxed text-muted">${t(d)}</p></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>
${processTimeline()}
${howItWorks()}
<div class="h-20 lg:h-28"></div>
${s.slug === 'automotive-window-tinting' || s.slug.includes('residential') || s.slug.includes('commercial') ? filmTech() : ''}
${testimonials()}
${faqSection(s.faq, tr(`${t(s.title)} <span class="text-grad">FAQ</span>`, `أسئلة حول <span class="text-grad">${t(s.title)}</span>`))}
<section class="pb-20 lg:pb-28">
  <div class="container-site">
    <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      ${sectionHead({ eyebrow: tr('Explore more', 'اكتشف المزيد'), title: tr('Other <span class="text-grad">services</span>', 'خدمات <span class="text-grad">أخرى</span>') })}
      <div class="flex gap-3">
        <button type="button" class="grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-ink shadow-card" data-slider-prev aria-label="${tr('Previous', 'السابق')}">${icon('arrowLeft', 'h-5 w-5 rtl:-scale-x-100', 2.2)}</button>
        <button type="button" class="grid h-12 w-12 place-items-center rounded-full bg-grad text-ink shadow-gold" data-slider-next aria-label="${tr('Next', 'التالي')}">${arrow('h-5 w-5')}</button>
      </div>
    </div>
    <div class="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 pt-2" data-slider>${related.map((r) => serviceCard(r)).join('')}</div>
  </div>
</section>
${areasSection()}
${ctaBanner()}
${quoteSection()}`;
  return layout(
    page,
    {
      title: tr(`${t(s.title)} in Qatar | Exotic Tint Qatar`, `${t(s.title)} في قطر | إكزوتك تينت قطر`),
      description: t(s.summary),
      image: s.img,
      jsonld: { '@context': 'https://schema.org', '@type': 'Service', name: t(s.title), description: t(s.summary), areaServed: 'Qatar', provider: { '@type': 'LocalBusiness', name: 'Exotic Tint Qatar', telephone: C.site.phoneRaw } },
    },
    body
  );
}

function pageContact(page) {
  const cards = [
    ['phone', t(C.ui.callUs), `<span dir="ltr">${C.site.phone}</span>`, `tel:${C.site.phoneRaw}`, 'linear-gradient(160deg,#FFF0D6,#FFFAF1)'],
    ['wa', 'WhatsApp', tr('Chat with a specialist', 'تحدث مع مختص'), `https://wa.me/${C.site.whatsapp}`, 'linear-gradient(160deg,#E2F8EA,#F6FDF8)'],
    ['mail', tr('Email us', 'راسلنا'), C.site.email, `mailto:${C.site.email}`, 'linear-gradient(160deg,#E6EFFF,#F7FAFF)'],
    ['instagram', 'Instagram', '@exotic_tint_qatar', C.site.instagram, 'linear-gradient(160deg,#FCE7F3,#FFF7FB)'],
  ];
  const body = `
${pageHero({
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-ink">${icon('chat', 'h-4 w-4', 2.2)}</span>${tr('Contact', 'تواصل معنا')}`,
  title: tr('Contact us &amp; <span class="text-grad">enjoy your time off</span>', 'تواصل معنا <span class="text-grad">واستمتع بوقتك</span>'),
  text: tr('Reach out for expert advice and personalised tinting solutions in Doha. Whether it’s car, home or commercial tinting, we’re here to help with precision and care.', 'تواصل معنا للحصول على استشارة متخصصة وحلول تظليل مخصصة في الدوحة. سواء كان تظليل سيارة أو منزل أو منشأة تجارية، نحن هنا لمساعدتك بدقة وعناية.'),
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
      title: tr('Contact Exotic Tint Qatar — Free Window Tint Estimate', 'تواصل مع إكزوتك تينت قطر — تقدير مجاني للتظليل'),
      description: tr(`Call ${C.site.phone} or WhatsApp us for a free flat-rate estimate. Window tinting and protection films across Qatar, 7 days a week.`, `اتصل على ${C.site.phone} أو راسلنا على واتساب لتقدير مجاني بسعر ثابت. تظليل وأفلام حماية في كل قطر، ٧ أيام في الأسبوع.`),
      image: 'frosted',
    },
    body
  );
}

function pageReviews(page) {
  const body = `
${pageHero({
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-ink">${icon('star', 'h-4 w-4', 2.2)}</span>${tr('Reviews', 'التقييمات')}`,
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
          <span class="grid h-12 w-12 place-items-center rounded-full bg-grad font-head font-extrabold text-ink">${r.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
          <span class="flex-1"><span class="block font-head font-bold text-ink">${r.name}</span><span class="block text-sm text-muted">${t(r.role)}</span></span>
          <span class="rounded-full border border-[#f3d7a6] bg-tint px-3 py-1 text-xs font-bold text-gold-700">${t(r.service)}</span>
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
  return layout(page, { title: tr('Client Reviews — Exotic Tint Qatar', 'آراء العملاء — إكزوتك تينت قطر'), description: tr('Read what drivers, homeowners and businesses in Qatar say about Exotic Tint Qatar.', 'اقرأ آراء السائقين وأصحاب المنازل والشركات في قطر عن إكزوتك تينت قطر.'), image: 'residential' }, body);
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
  chip: `<span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-ink">${icon('edit', 'h-4 w-4', 2.2)}</span>${tr('Blog', 'المدونة')}`,
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
  return layout(page, { title: tr('Blog — Window Tint & Protection Guides | Exotic Tint Qatar', 'المدونة — أدلة التظليل والحماية | إكزوتك تينت قطر'), description: tr('Guides on window tinting, nano ceramic film and marble protection in Qatar.', 'أدلة عن تظليل النوافذ وأفلام النانو سيراميك وحماية الرخام في قطر.'), image: 'blog-ceramic' }, body);
}

function renderBlocks(blocks) {
  let h2 = 0;
  return blocks
    .map((b) => {
      if (b.h) return `<h2 id="s${++h2}" class="mt-12 scroll-mt-32 font-head text-[1.7rem] font-extrabold leading-tight text-ink">${t(b.h)}</h2>`;
      if (b.p) return `<p class="mt-5 text-[1.08rem] leading-[1.85] text-ink-2/85">${t(b.p)}</p>`;
      if (b.list) return `<ul class="mt-5 space-y-3">${b.list.map((x) => `<li class="flex gap-3 text-[1.05rem] leading-relaxed text-ink-2/90"><span class="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tint text-gold-700">${icon('check', 'h-3.5 w-3.5', 3)}</span>${t(x)}</li>`).join('')}</ul>`;
      if (b.callout) return `<div class="mt-6 flex gap-4 rounded-2xl border border-[#f3d7a6] bg-tint p-5">${img3d('bulb', 'h-10 w-10 shrink-0')}<p class="font-semibold leading-relaxed text-ink">${t(b.callout)}</p></div>`;
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
        <span class="chip"><span class="grid h-7 w-7 place-items-center rounded-full bg-grad text-ink">${icon('edit', 'h-4 w-4', 2.2)}</span>${t(p.cat)}</span>
        <h1 class="mt-5 text-balance font-head text-[2.2rem] font-extrabold leading-[1.1] text-ink sm:text-[3rem]">${t(p.title)}</h1>
        <p class="mt-5 max-w-2xl text-lg leading-relaxed text-muted">${t(p.excerpt)}</p>
        <div class="mt-7 flex flex-wrap items-center gap-5 text-sm text-muted">
          <span class="flex items-center gap-2.5"><img src="/assets/img/logo-original.webp" alt="" class="h-10 w-10 rounded-full bg-white object-contain p-0.5 shadow"><b class="text-ink">${tr('Exotic Tint team', 'فريق إكزوتك تينت')}</b></span>
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
        <p class="mt-1 max-w-md text-ink/75">${tr('Contact Exotic Tint Qatar for a free consultation and flat-rate quote.', 'تواصل مع إكزوتك تينت قطر لاستشارة مجانية وعرض سعر ثابت.')}</p>
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
      jsonld: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: t(p.title), description: t(p.excerpt), datePublished: p.date, image: `${C.site.domain}/assets/img/${p.img}.webp`, author: { '@type': 'Organization', name: 'Exotic Tint Qatar' }, publisher: { '@type': 'Organization', name: 'Exotic Tint Qatar', logo: { '@type': 'ImageObject', url: `${C.site.domain}/assets/img/logo-original.webp` } } },
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
  fs.rmSync(path.join(DIST, 'assets', 'img', 'favicon.svg'), { force: true });
  // Old WordPress URL kept alive → points to the new commercial service page
  const to = '/service/commercial-window-tinting-services/';
  write(path.join(DIST, 'commercial-window-tinting', 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title><link rel="canonical" href="${C.site.domain}${to}"><meta http-equiv="refresh" content="0; url=${to}"><meta name="robots" content="noindex"></head><body><a href="${to}">Commercial Window Tinting</a></body></html>`);
  write(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${C.site.domain}/sitemap.xml\n`);
  const urls = PAGES.flatMap((p) => [`${C.site.domain}/${p.path}`, `${C.site.domain}/ar/${p.path}`]);
  write(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  L = 'en';
  write(
    path.join(DIST, '404.html'),
    layout({ key: '404', path: '' }, { title: 'Page not found — Exotic Tint Qatar', description: 'Page not found' }, pageHero({ chip: '404', title: 'This page has been <span class="text-grad">tinted out.</span>', text: 'The page you’re looking for doesn’t exist. <a class="font-semibold text-gold-700 underline" href="/">Go back home</a> · <a class="font-semibold text-gold-700 underline" href="/ar/">العودة للرئيسية</a>' }))
  );
  console.log(`Built ${count} pages (${LANGS.join(', ')}) → dist/`);
})();
