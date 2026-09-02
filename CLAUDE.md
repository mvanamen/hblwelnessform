# HerbaForms — notities voor Claude

Voortgangsplatform (Express + SQLite + vanilla-JS SPA, geen buildstap).
Draait als systemd-service `herbaforms` op poort 3000, live via Cloudflare
Tunnel op hblwellnessform.com. Zie README.md voor start en deploy.

- **Bottom nav is GooeyDock** (`public/js/dock.js` + stijlen in
  `public/css/app.css` onder "GooeyDock"): persistente component in
  `#dock-root` (index.html), gevoed vanuit `shell()` in `public/js/app.js`
  via `GooeyDock.update(items, activeIndex)`. Spring-physics (stiffness 150,
  damping 13), SVG-notch (diepte 26, halveBreedte 38) met snelheids-
  gekoppelde stretch/skew en squash & stretch op de bol. Respecteert
  `prefers-reduced-motion` en safe-area. Niet vervangen door een gewone
  tabbalk zonder overleg.
- Views renderen de tabbalk dus NIET meer zelf; alleen desktop-sidebar
  zit in de shell-template.
- Testen zonder de live-database te raken: start een tweede instantie met
  `DB_PATH=/tmp/demo.db PORT=3999 node server.js` en ruim die daarna op.
- Screenshots/PDF's maken met Playwright (devDependency); gebruik de
  meegeleverde Chromium voor PDF's (systeem-Chromium crasht op deze Pi).
