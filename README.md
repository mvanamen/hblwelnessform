# HerbaForms 🌿

Persoonlijk voortgangsplatform voor coaches en deelnemers. Deelnemers vullen
check-ins in (gewicht, energie, slaap, water, stemming) en zien hun voortgang
in een persoonlijk dashboard. Coaches volgen hun eigen deelnemers, de
hoofdbeheerder beheert alles.

Werkt op laptop, tablet en mobiel (responsive, met licht + donker thema).

## Starten

```bash
npm install     # eenmalig
npm start       # server op http://localhost:3000
```

Bij de allereerste start wordt automatisch een admin-account aangemaakt:

- **E-mail:** `admin@herbaforms.nl`
- **Wachtwoord:** `Welkom123!` (moet direct bij de eerste login gewijzigd worden)

## De drie rollen

| Rol | Kan |
|---|---|
| **Deelnemer** | Profiel/intake invullen, check-ins doen, eigen dashboard met grafieken en historie bekijken |
| **Coach** | Eigen deelnemers zien (met status-signalering wie lang niet ingecheckt heeft), detaildashboard per deelnemer, coachnotities, nieuwe deelnemers aanmaken, wachtwoorden resetten |
| **Admin** | Alles van coach + coaches beheren, deelnemers aan coaches koppelen, accounts (de)activeren, community-overzicht |

Accounts worden aangemaakt door een coach of de admin; er is bewust géén open
registratie. Bij het aanmaken verschijnt een tijdelijk wachtwoord dat je deelt
met de nieuwe gebruiker — die moet het bij de eerste login wijzigen.

## Techniek

- **Backend:** Node.js + Express, SQLite (`data/herbaforms.db`) — geen externe
  database nodig, draait prima op een Raspberry Pi.
- **Frontend:** vanilla JS single-page app, geen buildstap.
- **Auth:** sessiecookies (httpOnly), wachtwoorden gehasht met bcrypt.
- Backup maken = het bestand `data/herbaforms.db` kopiëren (server even stoppen
  of `sqlite3 data/herbaforms.db ".backup backup.db"` gebruiken).

## Automatisch starten bij opstarten (Raspberry Pi)

Maak `/etc/systemd/system/herbaforms.service`:

```ini
[Unit]
Description=HerbaForms
After=network.target

[Service]
WorkingDirectory=/home/maikelvanamen/herbaforms
ExecStart=/home/maikelvanamen/.nvm/versions/node/v20.20.2/bin/node server.js
Restart=on-failure
User=maikelvanamen

[Install]
WantedBy=multi-user.target
```

Daarna: `sudo systemctl enable --now herbaforms`

## Online zetten

De app luistert op poort 3000 (aanpasbaar via `PORT=…`). Voor gebruik buiten
het thuisnetwerk: zet er een reverse proxy met HTTPS voor (bijv. Caddy of
nginx + Let's Encrypt) of gebruik een tunnel zoals Cloudflare Tunnel of
Tailscale. Zet hem niet zonder HTTPS open op internet.
