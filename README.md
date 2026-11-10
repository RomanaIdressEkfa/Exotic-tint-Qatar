# Exotic Tint Qatar — Website 2026

Static, bilingual (English / Arabic RTL) website built with **HTML + Tailwind CSS + vanilla JS**.

## Commands

```bash
npm install        # once
npm run dev        # build everything + start http://localhost:5173
npm run build      # rebuild HTML + CSS into dist/
npm run images     # re-optimise photos in src/raw → dist/assets/img (WebP)
```

## Where to edit

| What | File |
| --- | --- |
| All text (English + Arabic side by side) | `src/content.js` |
| Blog articles (English + Arabic) | `src/blog.js` |
| Page layouts & sections | `src/build.js` |
| Colours, fonts, animations | `tailwind.config.js` |
| Buttons, cards, form styles | `src/styles.css` |
| Interactions (menu, tint studio, slider, WhatsApp form) | `src/assets/js/main.js` |
| Photos (drop new JPG/PNG here, then `npm run images`) | `src/raw/` |
| Logo (`logo-original.png`) and 3D service icons | `src/raw/`, `src/raw3d/` |

## Deploy

Upload the contents of **`dist/`** to the web root. English lives at `/`, Arabic at `/ar/`.
URLs keep the old WordPress structure (`/about/`, `/service/<slug>/`, `/contact/`) so existing Google rankings carry over.
Old URLs `/reviews/`, `/blogs/` and the 3 blog-post URLs are rebuilt at the same addresses; `/commercial-window-tinting/` redirects to the commercial service page.


## GitHub Pages

Every push to `main` builds the site and publishes `dist/` via `.github/workflows/deploy.yml`
(Settings → Pages → Source: **GitHub Actions**). The build uses `BASE=/<repo-name>/` so links work at
`https://<user>.github.io/<repo-name>/`. For a custom domain or local dev, build without `BASE`.
