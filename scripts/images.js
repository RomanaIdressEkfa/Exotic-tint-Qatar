// Optimise source images -> dist/assets/img (WebP)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'dist', 'assets', 'img');
fs.mkdirSync(path.join(out, '3d'), { recursive: true });

// Turn the black background of the dark logo into transparency (alpha = brightness)
async function keyBlack(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const m = Math.max(data[i], data[i + 1], data[i + 2]);
    const a = Math.min(255, Math.max(0, (m - 18) * 3));
    const k = a ? 255 / a : 0;
    px[j] = Math.min(255, data[i] * k);
    px[j + 1] = Math.min(255, data[i + 1] * k);
    px[j + 2] = Math.min(255, data[i + 2] * k);
    px[j + 3] = a;
  }
  return sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

// Recolour the logo to the site palette: sky-blue/cyan -> Royal Blue #0878E8 (shading kept),
// optional dark-grey lettering -> Deep Navy #071D38. Silver/white parts are untouched.
async function brandRecolor(input, navyText) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d) h = max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
    let H = h, S = sat, Lt = l, change = false;
    if (sat > 0.3 && h > 170 && h < 235) { H = h + (211 - 197); S = Math.min(1, sat * 1.05); Lt = l * 0.9; change = true; }
    else if (navyText && sat < 0.2 && l < 0.45) { // dark grey lettering -> deep navy
      const t = l / 0.45; // keep anti-aliasing: darker grey -> fuller navy
      const nr = 7 + (data[i] - 7) * t * 0.5, ng = 29 + (data[i + 1] - 29) * t * 0.5, nb = 56 + (data[i + 2] - 56) * t * 0.5;
      data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
      continue;
    }
    if (!change) continue;
    const c = (1 - Math.abs(2 * Lt - 1)) * S, x = c * (1 - Math.abs(((H / 60) % 2) - 1)), m = Lt - c / 2;
    const [r1, g1, b1] = H < 60 ? [c, x, 0] : H < 120 ? [x, c, 0] : H < 180 ? [0, c, x] : H < 240 ? [0, x, c] : H < 300 ? [x, 0, c] : [c, 0, x];
    data[i] = Math.round((r1 + m) * 255); data[i + 1] = Math.round((g1 + m) * 255); data[i + 2] = Math.round((b1 + m) * 255);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

// Turn the white background of the light logo into transparency.
// Only near-white pixels connected to the image edge are removed (flood fill), so the silver
// buildings and white window details inside the logo stay solid. Edges get soft alpha.
async function keyWhite(input) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  const light = (i) => Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
  const sat = (i) => Math.max(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) - light(i);
  const isBg = (i) => light(i) > 228 && sat(i) < 22;
  const bg = new Uint8Array(N), stack = [];
  for (let x = 0; x < W; x++) { stack.push(x, (H - 1) * W + x); }
  for (let y = 0; y < H; y++) { stack.push(y * W, y * W + W - 1); }
  while (stack.length) {
    const i = stack.pop();
    if (bg[i] || !isBg(i)) continue;
    bg[i] = 1;
    const x = i % W, y = (i / W) | 0;
    if (x > 0) stack.push(i - 1); if (x < W - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - W); if (y < H - 1) stack.push(i + W);
  }
  const px = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    let a = 255;
    if (bg[i]) a = 0;
    else {
      // anti-aliased rim: a light pixel touching the background becomes partly transparent
      const x = i % W, y = (i / W) | 0;
      const nb = (x > 0 && bg[i - 1]) || (x < W - 1 && bg[i + 1]) || (y > 0 && bg[i - W]) || (y < H - 1 && bg[i + W]);
      if (nb) a = Math.max(0, Math.min(255, Math.round((255 - light(i)) * 3.2)));
    }
    let r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    if (a > 0 && a < 255) { // un-premultiply from white so edges don't keep a white halo
      const k = a / 255;
      r = Math.max(0, Math.min(255, (r - 255 * (1 - k)) / k));
      g = Math.max(0, Math.min(255, (g - 255 * (1 - k)) / k));
      b = Math.max(0, Math.min(255, (b - 255 * (1 - k)) / k));
    }
    px[i * 4] = r; px[i * 4 + 1] = g; px[i * 4 + 2] = b; px[i * 4 + 3] = a;
  }
  return sharp(px, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

(async () => {
  const raw = path.join(root, 'src', 'raw');
  for (const f of fs.readdirSync(raw)) {
    const name = path.parse(f).name;
    const src = path.join(raw, f);
    if (name === 'logo-light') {
      const flat = await sharp(await brandRecolor(src, true)).flatten({ background: '#ffffff' }).png().toBuffer();
      await sharp(await keyWhite(flat)).trim().resize({ height: 240 }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(out, name + '.webp'));
    } else if (name === 'logo-dark') {
      const keyed = await brandRecolor(await keyBlack(src), false);
      await sharp(keyed).trim().resize({ height: 240 }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(out, name + '.webp'));
      // Favicon: the building + roof mark only
      const mark = await sharp(keyed).extract({ left: 600, top: 240, width: 700, height: 540 }).png().toBuffer();
      await sharp(mark).trim().resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'favicon.png'));
      await sharp(mark).trim().resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(out, 'logo-mark.webp'));
      await sharp(mark).trim().resize(180, 180, { fit: 'contain', background: '#071D38' }).png().toFile(path.join(out, 'apple-touch-icon.png'));
    } else {
      await sharp(src).resize({ width: 1800, withoutEnlargement: true }).sharpen({ sigma: 0.7 }).webp({ quality: 88, smartSubsample: true }).toFile(path.join(out, name + '.webp'));
      if (name.startsWith('pf-')) await sharp(src).rotate().resize({ width: 720, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(out, name + '-sm.webp'));
    }
    console.log('✓', name);
  }
  const r3 = path.join(root, 'src', 'raw3d');
  for (const f of fs.readdirSync(r3)) {
    await sharp(path.join(r3, f)).resize(200).webp({ quality: 88 }).toFile(path.join(out, '3d', path.parse(f).name + '.webp'));
  }
  console.log('✓ 3d icons');
})();
