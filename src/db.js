const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'herbaforms.db'));
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

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_users_coach ON users(coach_id);
`);

// Migraties: voeg intake-kolommen toe als ze nog niet bestaan (idempotent).
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

// Seed a first admin account so the owner can log in and set everything up.
const hasAdmin = db.prepare(`SELECT 1 FROM users WHERE role = 'admin' LIMIT 1`).get();
if (!hasAdmin) {
  const password = 'Welkom123!';
  db.prepare(`INSERT INTO users (role, name, email, password_hash, must_change_password)
              VALUES ('admin', 'Hoofdbeheerder', 'admin@herbaforms.nl', ?, 1)`)
    .run(bcrypt.hashSync(password, 10));
  console.log('----------------------------------------------------------');
  console.log('Eerste admin-account aangemaakt:');
  console.log('  E-mail:     admin@herbaforms.nl');
  console.log(`  Wachtwoord: ${password}  (moet bij eerste login gewijzigd worden)`);
  console.log('----------------------------------------------------------');
}

module.exports = db;
