const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(process.env.DB_PATH || path.join(dataDir, 'herbaforms.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL CHECK (role IN ('admin','coach','member')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  coach_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  active INTEGER NOT NULL DEFAULT 1,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  birthdate TEXT,
  height_cm REAL,
  start_weight REAL,
  goal_weight REAL,
  goal_text TEXT,
  activity_level TEXT,
  health_notes TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight REAL,
  energy INTEGER CHECK (energy BETWEEN 1 AND 10),
  sleep_hours REAL,
  water_l REAL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS coach_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS coach_invites (
  token TEXT PRIMARY KEY,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_users_coach ON users(coach_id);
`);

// Migraties (idempotent).
const userCols = new Set(db.prepare(`PRAGMA table_info(users)`).all().map((c) => c.name));
if (!userCols.has('invite_token')) db.exec(`ALTER TABLE users ADD COLUMN invite_token TEXT`);
if (!userCols.has('lang')) db.exec(`ALTER TABLE users ADD COLUMN lang TEXT NOT NULL DEFAULT 'nl'`);
db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_invite ON users(invite_token)`);

// Voeg intake-kolommen toe als ze nog niet bestaan.
const profileCols = new Set(db.prepare(`PRAGMA table_info(profiles)`).all().map((c) => c.name));
const addCol = (name, type) => {
  if (!profileCols.has(name)) db.exec(`ALTER TABLE profiles ADD COLUMN ${name} ${type}`);
};
[
  ['first_name', 'TEXT'], ['surname', 'TEXT'], ['facebook_name', 'TEXT'],
  ['phone', 'TEXT'], ['whatsapp', 'TEXT'],
  ['street', 'TEXT'], ['house_number', 'TEXT'], ['zipcode', 'TEXT'],
  ['suburb', 'TEXT'], ['city', 'TEXT'], ['province', 'TEXT'], ['country', 'TEXT'],
  ['gender', 'TEXT'], ['waist_cm', 'REAL'], ['energy_level', 'INTEGER'],
  ['goal_type', 'TEXT'], ['reason', 'TEXT'], ['tried_before', 'TEXT'],
  ['meals_day', 'TEXT'], ['snacking', 'TEXT'], ['eat_out', 'TEXT'], ['water_daily', 'TEXT'],
  ['drinks', 'TEXT'], ['other_drink', 'TEXT'],
  ['tired_when', 'TEXT'], ['hungry_when', 'TEXT'], ['medication', 'TEXT'],
].forEach(([n, t]) => addCol(n, t));

// ---------- Multi-tenant (idempotent) ----------

// Tenants: elke aanbieder krijgt eigen branding; custom_domain is het
// toekomstpad voor eigen domeinen (nu al gebruikt voor host-resolutie).
db.exec(`
CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  custom_domain TEXT UNIQUE COLLATE NOCASE,
  logo_url TEXT,
  color_brand TEXT,
  color_brand_deep TEXT,
  color_accent TEXT,
  mail_from_name TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Tenant 1 = de bestaande omgeving; alle huidige data hoort daarbij.
if (!db.prepare('SELECT 1 FROM tenants LIMIT 1').get()) {
  db.prepare(`INSERT INTO tenants (id, slug, name, custom_domain, color_brand, mail_from_name)
              VALUES (1, 'hbl', 'HBL Wellness Forms', 'hblwellnessform.com', '#166534', 'HBL Wellness Forms')`).run();
}

// Users-rebuild: e-mail wordt uniek per tenant en de rol 'superadmin' komt erbij.
// FK's van andere tabellen verwijzen op tabelnaam, dus DROP+RENAME met
// foreign_keys uit is veilig; id's worden expliciet meegekopieerd zodat
// sessies en relaties geldig blijven. PRAGMA foreign_keys kan niet binnen
// een transactie, vandaar eromheen.
if (!userCols.has('tenant_id')) {
  db.pragma('foreign_keys = OFF');
  db.transaction(() => {
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER REFERENCES tenants(id),
        role TEXT NOT NULL CHECK (role IN ('superadmin','admin','coach','member')),
        name TEXT NOT NULL,
        email TEXT NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        coach_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        active INTEGER NOT NULL DEFAULT 1,
        must_change_password INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        invite_token TEXT,
        lang TEXT NOT NULL DEFAULT 'nl'
      );
      INSERT INTO users_new (id, tenant_id, role, name, email, password_hash, coach_id,
                             active, must_change_password, created_at, invite_token, lang)
        SELECT id, 1, role, name, email, password_hash, coach_id,
               active, must_change_password, created_at, invite_token, lang FROM users;
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
      CREATE UNIQUE INDEX idx_users_email_tenant ON users(tenant_id, email);
      CREATE UNIQUE INDEX idx_users_invite ON users(invite_token);
      CREATE INDEX idx_users_coach ON users(coach_id);
    `);
  })();
  db.pragma('foreign_keys = ON');
  const bad = db.prepare('PRAGMA foreign_key_check').all();
  if (bad.length) {
    throw new Error('foreign_key_check faalde na users-rebuild: ' + JSON.stringify(bad.slice(0, 3)));
  }
}

// Sessies: superadmin kan tijdelijk "als beheerder" in een tenant stappen.
const sessCols = new Set(db.prepare(`PRAGMA table_info(sessions)`).all().map((c) => c.name));
if (!sessCols.has('acting_tenant_id')) db.exec(`ALTER TABLE sessions ADD COLUMN acting_tenant_id INTEGER`);

// Coach-invites dragen hun tenant zelf (de maker kan een acting superadmin zijn).
const ciCols = new Set(db.prepare(`PRAGMA table_info(coach_invites)`).all().map((c) => c.name));
if (!ciCols.has('tenant_id')) {
  db.exec(`ALTER TABLE coach_invites ADD COLUMN tenant_id INTEGER REFERENCES tenants(id)`);
  db.exec(`UPDATE coach_invites
           SET tenant_id = COALESCE((SELECT u.tenant_id FROM users u WHERE u.id = created_by), 1)
           WHERE tenant_id IS NULL`);
}

// Seed a first admin account so the owner can log in and set everything up.
const hasAdmin = db.prepare(`SELECT 1 FROM users WHERE role = 'admin' AND tenant_id = 1 LIMIT 1`).get();
if (!hasAdmin) {
  const password = 'Welkom123!';
  db.prepare(`INSERT INTO users (tenant_id, role, name, email, password_hash, must_change_password)
              VALUES (1, 'admin', 'Hoofdbeheerder', 'admin@herbaforms.nl', ?, 1)`)
    .run(bcrypt.hashSync(password, 10));
  console.log('----------------------------------------------------------');
  console.log('Eerste admin-account aangemaakt:');
  console.log('  E-mail:     admin@herbaforms.nl');
  console.log(`  Wachtwoord: ${password}  (moet bij eerste login gewijzigd worden)`);
  console.log('----------------------------------------------------------');
}

// Superadmin (platformeigenaar): staat boven de tenants (tenant_id NULL).
// Willekeurig tijdelijk wachtwoord — te vinden in de systemd-journal.
const hasSuper = db.prepare(`SELECT 1 FROM users WHERE role = 'superadmin' LIMIT 1`).get();
if (!hasSuper) {
  const password = 'HF-' + crypto.randomBytes(4).toString('hex');
  db.prepare(`INSERT INTO users (tenant_id, role, name, email, password_hash, must_change_password)
              VALUES (NULL, 'superadmin', 'Maikel van Amen', 'maikelvanamen@gmail.com', ?, 1)`)
    .run(bcrypt.hashSync(password, 10));
  console.log('----------------------------------------------------------');
  console.log('Superadmin-account aangemaakt:');
  console.log('  E-mail:     maikelvanamen@gmail.com');
  console.log(`  Wachtwoord: ${password}  (moet bij eerste login gewijzigd worden)`);
  console.log('----------------------------------------------------------');
}

module.exports = db;
