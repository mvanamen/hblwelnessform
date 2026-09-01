const path = require('path');
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./src/db');
const { createSession, destroySession, currentUser, requireRole, cleanupExpiredSessions } = require('./src/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

const publicUser = (u) => ({
  id: u.id, role: u.role, name: u.name, email: u.email,
  coach_id: u.coach_id, active: !!u.active,
  must_change_password: !!u.must_change_password, created_at: u.created_at,
});

const tempPassword = () => 'HF-' + crypto.randomBytes(4).toString('hex');

const getProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?');
const getCheckins = db.prepare('SELECT * FROM checkins WHERE user_id = ? ORDER BY date ASC');

function memberSnapshot(member) {
  const profile = getProfile.get(member.id) || null;
  const checkins = getCheckins.all(member.id);
  return { user: publicUser(member), profile, checkins };
}

// ---------- Auth ----------

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim());
  const pw = String(password);
  if (!user || !user.active ||
      (!bcrypt.compareSync(pw, user.password_hash) && !bcrypt.compareSync(pw.trim(), user.password_hash))) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  createSession(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post('/api/logout', (req, res) => {
  destroySession(req, res);
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'not_logged_in' });
  res.json({ user: publicUser(user), profile: getProfile.get(user.id) || null });
});

app.post('/api/password', requireRole('admin', 'coach', 'member'), (req, res) => {
  const { current, next } = req.body || {};
  const nextPw = String(next || '').trim();
  if (nextPw.length < 8) {
    return res.status(400).json({ error: 'password_too_short' });
  }
  // Vergelijk ook met de getrimde variant: tijdelijke wachtwoorden worden vaak
  // geplakt met een spatie of regeleinde erachter.
  const cur = String(current || '');
  if (!bcrypt.compareSync(cur, req.user.password_hash) &&
      !bcrypt.compareSync(cur.trim(), req.user.password_hash)) {
    return res.status(400).json({ error: 'wrong_current_password' });
  }
  db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?')
    .run(bcrypt.hashSync(nextPw, 10), req.user.id);
  res.json({ ok: true });
});

// ---------- Deelnemer ----------

app.get('/api/member/dashboard', requireRole('member'), (req, res) => {
  const coach = req.user.coach_id
    ? db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.coach_id)
    : null;
  res.json({ ...memberSnapshot(req.user), coach });
});

app.put('/api/member/profile', requireRole('member'), (req, res) => {
  const b = req.body || {};
  db.prepare(`
    INSERT INTO profiles (user_id, birthdate, height_cm, start_weight, goal_weight, goal_text, activity_level, health_notes, completed, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      birthdate = excluded.birthdate, height_cm = excluded.height_cm,
      start_weight = excluded.start_weight, goal_weight = excluded.goal_weight,
      goal_text = excluded.goal_text, activity_level = excluded.activity_level,
      health_notes = excluded.health_notes, completed = 1, updated_at = excluded.updated_at
  `).run(req.user.id, b.birthdate || null, num(b.height_cm), num(b.start_weight),
         num(b.goal_weight), b.goal_text || null, b.activity_level || null, b.health_notes || null);
  res.json({ profile: getProfile.get(req.user.id) });
});

app.post('/api/member/checkins', requireRole('member'), (req, res) => {
  const b = req.body || {};
  const date = b.date || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'invalid_date' });
  const energy = intIn(b.energy, 1, 10);
  const mood = intIn(b.mood, 1, 5);
  db.prepare(`
    INSERT INTO checkins (user_id, date, weight, energy, sleep_hours, water_l, mood, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      weight = excluded.weight, energy = excluded.energy, sleep_hours = excluded.sleep_hours,
      water_l = excluded.water_l, mood = excluded.mood, notes = excluded.notes
  `).run(req.user.id, date, num(b.weight), energy, num(b.sleep_hours), num(b.water_l), mood, b.notes || null);
  res.json({ checkins: getCheckins.all(req.user.id) });
});

app.delete('/api/member/checkins/:id', requireRole('member'), (req, res) => {
  db.prepare('DELETE FROM checkins WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ checkins: getCheckins.all(req.user.id) });
});

// ---------- Coach (admin mag ook overal bij) ----------

function coachMemberOr404(req, res) {
  const member = db.prepare(`SELECT * FROM users WHERE id = ? AND role = 'member'`).get(req.params.id);
  if (!member || (req.user.role === 'coach' && member.coach_id !== req.user.id)) {
    res.status(404).json({ error: 'member_not_found' });
    return null;
  }
  return member;
}

const memberListQuery = `
  SELECT u.id, u.name, u.email, u.active, u.coach_id, u.created_at,
    c.name AS coach_name,
    p.start_weight, p.goal_weight, p.completed AS profile_completed,
    (SELECT date FROM checkins WHERE user_id = u.id ORDER BY date DESC LIMIT 1) AS last_checkin,
    (SELECT weight FROM checkins WHERE user_id = u.id AND weight IS NOT NULL ORDER BY date DESC LIMIT 1) AS last_weight,
    (SELECT energy FROM checkins WHERE user_id = u.id AND energy IS NOT NULL ORDER BY date DESC LIMIT 1) AS last_energy,
    (SELECT COUNT(*) FROM checkins WHERE user_id = u.id) AS checkin_count
  FROM users u
  LEFT JOIN users c ON c.id = u.coach_id
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE u.role = 'member'`;

app.get('/api/coach/members', requireRole('coach'), (req, res) => {
  const rows = req.user.role === 'coach'
    ? db.prepare(memberListQuery + ' AND u.coach_id = ? ORDER BY u.name').all(req.user.id)
    : db.prepare(memberListQuery + ' ORDER BY u.name').all();
  res.json({ members: rows });
});

app.get('/api/coach/members/:id', requireRole('coach'), (req, res) => {
  const member = coachMemberOr404(req, res);
  if (!member) return;
  const notes = db.prepare(`
    SELECT n.*, u.name AS coach_name FROM coach_notes n JOIN users u ON u.id = n.coach_id
    WHERE n.member_id = ? ORDER BY n.created_at DESC
  `).all(member.id);
  res.json({ ...memberSnapshot(member), notes });
});

app.post('/api/coach/members', requireRole('coach'), (req, res) => {
  const { name, email } = req.body || {};
  const coachId = req.user.role === 'coach' ? req.user.id : (req.body.coach_id || null);
  const created = createUser(res, { role: 'member', name, email, coach_id: coachId });
  if (created) res.json(created);
});

app.post('/api/coach/members/:id/notes', requireRole('coach'), (req, res) => {
  const member = coachMemberOr404(req, res);
  if (!member) return;
  const text = String(req.body?.text || '').trim();
  if (!text) return res.status(400).json({ error: 'empty_note' });
  db.prepare('INSERT INTO coach_notes (member_id, coach_id, text) VALUES (?, ?, ?)')
    .run(member.id, req.user.id, text);
  const notes = db.prepare(`
    SELECT n.*, u.name AS coach_name FROM coach_notes n JOIN users u ON u.id = n.coach_id
    WHERE n.member_id = ? ORDER BY n.created_at DESC
  `).all(member.id);
  res.json({ notes });
});

app.post('/api/coach/members/:id/reset-password', requireRole('coach'), (req, res) => {
  const member = coachMemberOr404(req, res);
  if (!member) return;
  const password = tempPassword();
  db.prepare('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?')
    .run(bcrypt.hashSync(password, 10), member.id);
  res.json({ password });
});

// ---------- Admin ----------

app.get('/api/admin/overview', requireRole('admin'), (req, res) => {
  const count = (sql, ...args) => db.prepare(sql).get(...args).n;
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  res.json({
    members: count(`SELECT COUNT(*) n FROM users WHERE role='member' AND active=1`),
    coaches: count(`SELECT COUNT(*) n FROM users WHERE role='coach' AND active=1`),
    checkins_week: count(`SELECT COUNT(*) n FROM checkins WHERE date >= ?`, weekAgo),
    active_week: count(`SELECT COUNT(DISTINCT user_id) n FROM checkins WHERE date >= ?`, weekAgo),
    unassigned: count(`SELECT COUNT(*) n FROM users WHERE role='member' AND active=1 AND coach_id IS NULL`),
  });
});

app.get('/api/admin/users', requireRole('admin'), (req, res) => {
  const coaches = db.prepare(`
    SELECT u.id, u.name, u.email, u.active, u.created_at,
      (SELECT COUNT(*) FROM users m WHERE m.coach_id = u.id AND m.role='member') AS member_count
    FROM users u WHERE u.role = 'coach' ORDER BY u.name
  `).all();
  const members = db.prepare(memberListQuery + ' ORDER BY u.name').all();
  const admins = db.prepare(`SELECT id, name, email, active, created_at FROM users WHERE role='admin' ORDER BY name`).all();
  res.json({ coaches, members, admins });
});

app.post('/api/admin/users', requireRole('admin'), (req, res) => {
  const { role, name, email, coach_id } = req.body || {};
  if (!['coach', 'member', 'admin'].includes(role)) return res.status(400).json({ error: 'invalid_role' });
  const created = createUser(res, { role, name, email, coach_id: role === 'member' ? coach_id || null : null });
  if (created) res.json(created);
});

app.put('/api/admin/users/:id', requireRole('admin'), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'user_not_found' });
  const b = req.body || {};
  if (user.role === 'admin' && b.active === false && user.id === req.user.id) {
    return res.status(400).json({ error: 'cannot_deactivate_self' });
  }
  const name = b.name !== undefined ? String(b.name).trim() : user.name;
  const email = b.email !== undefined ? String(b.email).trim() : user.email;
  const active = b.active !== undefined ? (b.active ? 1 : 0) : user.active;
  let coachId = user.coach_id;
  if (b.coach_id !== undefined && user.role === 'member') coachId = b.coach_id || null;
  try {
    db.prepare('UPDATE users SET name = ?, email = ?, active = ?, coach_id = ? WHERE id = ?')
      .run(name, email, active, coachId, user.id);
  } catch (e) {
    return res.status(400).json({ error: 'email_in_use' });
  }
  if (!active) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
  res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)) });
});

app.post('/api/admin/users/:id/reset-password', requireRole('admin'), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'user_not_found' });
  const password = tempPassword();
  db.prepare('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?')
    .run(bcrypt.hashSync(password, 10), user.id);
  res.json({ password });
});

// ---------- Helpers ----------

function createUser(res, { role, name, email, coach_id }) {
  name = String(name || '').trim();
  email = String(email || '').trim();
  if (!name || !email || !email.includes('@')) {
    res.status(400).json({ error: 'name_email_required' });
    return null;
  }
  const password = tempPassword();
  try {
    const info = db.prepare(`
      INSERT INTO users (role, name, email, password_hash, coach_id, must_change_password)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(role, name, email, bcrypt.hashSync(password, 10), coach_id || null);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    return { user: publicUser(user), password };
  } catch (e) {
    res.status(400).json({ error: 'email_in_use' });
    return null;
  }
}

const num = (v) => (v === '' || v === null || v === undefined || isNaN(Number(v))) ? null : Number(v);
const intIn = (v, lo, hi) => {
  const n = num(v);
  return n === null ? null : Math.min(hi, Math.max(lo, Math.round(n)));
};

// SPA fallback
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HerbaForms draait op http://localhost:${PORT}`);
});
