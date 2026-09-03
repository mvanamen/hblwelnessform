# HerbaForms — notities voor Claude

**Lees dit eerst en scan alleen de bestanden die voor de taak relevant zijn —
niet de hele repo.**

## Project & architectuur

Voortgangsplatform voor een Herbalife-coach: deelnemers doen check-ins
(gewicht, energie, slaap, water, stemming) en zien een dashboard met
grafieken; coaches volgen hun deelnemers; admins beheren alles.

- **Stack:** Node.js (Express) + better-sqlite3, vanilla-JS SPA — bewust
  géén buildstap, framework of bundler (draait op een Raspberry Pi).
- **Deploy:** systemd-service `herbaforms` (poort 3000) + `cloudflared`
  (tunnel) → live op https://hblwellnessform.com. GitHub:
  mvanamen/hblwelnessform (push via SSH-alias `github-hblwelnessform`).
- Na wijzigingen aan `server.js`/`src/*`: `sudo systemctl restart herbaforms`.
  Statische bestanden (public/) hebben geen restart nodig, maar verhoog wel
  de cache-versie in `public/sw.js` (CACHE = 'hf-vN').

## Bestandenkaart (waar zit wat)

| Bestand | Functionaliteit |
|---|---|
| `server.js` | Álle API-routes: auth/login, wachtwoord(-reset), taal, uitnodigingslinks + registratie, member/coach/admin-endpoints, SPA-fallback |
| `src/db.js` | Schema, idempotente migraties (ALTER-checks), admin-seed. DB-pad instelbaar via env `DB_PATH` |
| `src/auth.js` | Sessies (httpOnly-cookie, sha256-token in db) + `requireRole()` — admin mag altijd overal bij |
| `src/mail.js` | Resend-integratie + tweetalige resetmail-template. Zonder `RESEND_API_KEY` logt hij de link i.p.v. mailen |
| `public/js/app.js` | De hele SPA: i18n-woordenboek `STR` (nl/en) + `t()`, hash-router `route()`, alle views, modals/toasts, iconen |
| `public/js/dock.js` | **GooeyDock** — mobiele bottom nav met spring-physics (stiffness 150, damping 13), SVG-notch + squash & stretch. Persistente component in `#dock-root`, gevoed vanuit `shell()`. Niet vervangen door een gewone tabbalk zonder overleg |
| `public/js/charts.js` | SVG-lijngrafieken (dataviz-conform: crosshair-tooltip, doellijn, taalbewust) |
| `public/css/app.css` | Design system: CSS-variabelen (licht/donker), shell-grid met named areas, magazine-layout (`.mag-*`), dock-stijlen |
| `public/index.html` | SPA-shell, PWA-links (manifest, iconen), SW-registratie |
| `public/sw.js` | Service worker: netwerk-eerst, API nooit gecachet. **Versie ophogen bij asset-wijzigingen** |
| `.env` | RESEND_API_KEY, MAIL_FROM, CLOUDFLARE_API_TOKEN (DNS-edit, zone hblwellnessform.com) — geladen door systemd |

## Conventies & patterns

- **i18n:** alle UI-teksten via `t('sleutel')` uit `STR` (nl + en, altijd
  beide bijwerken). Server geeft foutcodes (`invalid_credentials` e.d.);
  de client vertaalt via `err.*`-sleutels. Taalvoorkeur staat per gebruiker
  in `users.lang` en stuurt ook e-mailtaal.
- **Veiligheid:** alle usergegevens in templates door `esc()`; wachtwoorden
  bcrypt; tijdelijke wachtwoorden `HF-…` met verplichte wissel; sessies
  30 dagen. Rollen: `admin`/`coach`/`member`; een admin kan óók coach van
  deelnemers zijn (coach_id mag naar een admin wijzen).
- **Views:** renderen `root.innerHTML` na `shell()`; dashboards krijgen
  `root.classList.add('mag', 'mag-…')` voor de magazine-grid. Grafieken
  altijd opzoeken via `root.querySelector('#chart-…')` (niet document-breed).
- **Stijl:** NL-commentaar, geen frameworks, bestaande CSS-variabelen
  hergebruiken, breakpoints 768/1024 (+640 voor formulieren).
- **Testen zonder de live-db te raken:** tweede instantie met
  `DB_PATH=/tmp/demo.db PORT=3999 node server.js`, daarna proces + db
  opruimen. Live `data/herbaforms.db` bevat échte gebruikers — nooit
  wissen of testaccounts erin laten staan.
- Screenshots/PDF via Playwright (devDependency): Firefox voor screenshots,
  meegeleverde Chromium voor PDF's (systeem-Chromium crasht op deze Pi).
  **Nooit** `pkill -f "node server.js"` — er draait een vreemd node-proces
  van user `pi`; altijd op PID killen.

## Niet relevant voor de meeste taken (niet scannen)

- `node_modules/` — dependencies (gitignored)
- `data/` — live SQLite-database (gitignored; alleen aanraken met reden)
- `docs/` — handleiding-PDF + HTML-bron met screenshots (alleen relevant
  als de handleiding zelf moet worden bijgewerkt)
- `package-lock.json`, `.env`, logbestanden
- `public/img/handleiding` bestaat niet meer; app-iconen in `public/img/`
  zijn gegenereerd vanuit `public/img/logo.svg`
