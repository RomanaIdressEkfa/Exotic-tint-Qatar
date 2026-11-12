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

(async () => {
  const raw = path.join(root, 'src', 'raw');
  for (const f of fs.readdirSync(raw)) {
    const name = path.parse(f).name;
    const src = path.join(raw, f);
    if (name === 'logo-light') {
      await sharp(src).trim({ background: '#ffffff', threshold: 40 }).resize({ height: 240 }).webp({ quality: 92 }).toFile(path.join(out, name + '.webp'));
    } else if (name === 'logo-dark') {
      const keyed = await keyBlack(src);
      await sharp(keyed).trim().resize({ height: 240 }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(out, name + '.webp'));
      // Favicon: the building + roof mark only
      const mark = await sharp(keyed).extract({ left: 600, top: 240, width: 700, height: 540 }).png().toBuffer();
      await sharp(mark).trim().resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'favicon.png'));
      await sharp(mark).trim().resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(out, 'logo-mark.webp'));
      await sharp(mark).trim().resize(180, 180, { fit: 'contain', background: '#12233D' }).png().toFile(path.join(out, 'apple-touch-icon.png'));
    } else {
      await sharp(src).resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(out, name + '.webp'));
    }
    console.log('✓', name);
  }
  const r3 = path.join(root, 'src', 'raw3d');
  for (const f of fs.readdirSync(r3)) {
    await sharp(path.join(r3, f)).resize(200).webp({ quality: 88 }).toFile(path.join(out, '3d', path.parse(f).name + '.webp'));
  }
  console.log('✓ 3d icons');
})();
