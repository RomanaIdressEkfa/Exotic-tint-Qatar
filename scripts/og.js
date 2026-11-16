// Social share images: every og:image used in dist/*.html -> 1200x630 JPG in dist/assets/img/og/
// (WhatsApp, Facebook and LinkedIn previews don't reliably show WebP.)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', 'dist');
const img = path.join(dist, 'assets', 'img');
const out = path.join(img, 'og');
fs.mkdirSync(out, { recursive: true });

const names = new Set();
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { if (f.name !== 'assets') walk(p); }
    else if (f.name.endsWith('.html')) {
      for (const m of fs.readFileSync(p, 'utf8').matchAll(/property="og:image" content="[^"]*\/og\/([^"/]+)\.jpg"/g)) names.add(m[1]);
    }
  }
})(dist);

(async () => {
  for (const n of names) {
    const src = path.join(img, n + '.webp');
    const dest = path.join(out, n + '.jpg');
    if (!fs.existsSync(src)) { console.warn('og: missing source', src); process.exitCode = 1; continue; }
    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs) continue;
    const { width, height } = await sharp(src).metadata();
    let pipe;
    if (width / height >= 1.5 && width >= 1000) {
      pipe = sharp(src).resize(1200, 630, { fit: 'cover' });
    } else {
      // Small or portrait photo: show it whole over a blurred, cropped copy instead of upscaling a crop
      const bg = await sharp(src).resize(1200, 630, { fit: 'cover' }).blur(28).modulate({ brightness: 0.9 }).toBuffer();
      const fg = await sharp(src).resize({ height: 630, width: 1200, fit: 'inside', withoutEnlargement: false }).toBuffer();
      pipe = sharp(bg).composite([{ input: fg, gravity: 'center' }]);
    }
    await pipe.flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
    console.log('og:', n + '.jpg');
  }
})();
