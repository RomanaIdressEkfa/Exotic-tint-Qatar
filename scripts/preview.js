// Local preview for Laragon/Apache: copies dist/ to preview/ with links prefixed
// so the site works at http://localhost/<folder>/preview/ (dist/ stays untouched for deploy).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const src = path.join(root, 'dist');
const out = path.join(root, 'preview');
const BASE = process.env.BASE || `/${path.basename(root)}/preview/`;
function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) { copy(a, b); continue; }
    if (e.name.endsWith('.html')) {
      const html = fs.readFileSync(a, 'utf8')
        .replace(/(href|src|action|srcset|content)="\/(?!\/)/g, `$1="${BASE}`)
        .replace(/url=\/(?!\/)/g, `url=${BASE}`);
      fs.writeFileSync(b, html);
    } else fs.copyFileSync(a, b);
  }
}
copy(src, out);
fs.writeFileSync(path.join(out, '.htaccess'), `ErrorDocument 404 ${BASE}404.html\nDirectoryIndex index.html\n`);
console.log(`Preview ready → http://localhost${BASE}`);
