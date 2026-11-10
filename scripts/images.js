// Optimise source images -> dist/assets/img (WebP)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'dist', 'assets', 'img');
fs.mkdirSync(path.join(out, '3d'), { recursive: true });
(async () => {
  const raw = path.join(root, 'src', 'raw');
  for (const f of fs.readdirSync(raw)) {
    const name = path.parse(f).name;
    if (name.startsWith('logo')) {
      // Trim empty margins so the shield sits tight in the navbar
      await sharp(path.join(raw, f)).trim().resize({ height: 240 }).webp({ quality: 92 }).toFile(path.join(out, name + '.webp'));
      await sharp(path.join(raw, f)).trim().resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'favicon.png'));
    } else {
      await sharp(path.join(raw, f)).resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(out, name + '.webp'));
    }
    console.log('✓', name);
  }
  const r3 = path.join(root, 'src', 'raw3d');
  for (const f of fs.readdirSync(r3)) {
    await sharp(path.join(r3, f)).resize(200).webp({ quality: 88 }).toFile(path.join(out, '3d', path.parse(f).name + '.webp'));
  }
  console.log('✓ 3d icons');
})();
