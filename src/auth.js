const crypto = require('crypto');
const db = require('./db');

const SESSION_COOKIE = 'hf_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dagen

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(hash(token), userId, Date.now() + SESSION_TTL_MS);
  const secure = res.req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
}

function destroySession(req, res) {
  const token = getToken(req);
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hash(token));
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function getToken(req) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === SESSION_COOKIE) return v.join('=');
  }
  return null;
}

function currentUser(req) {
  const token = getToken(req);
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1
  `).get(hash(token), Date.now());
  return row || null;
}

// Middleware: vereist ingelogde gebruiker met een van de gegeven rollen.
// Admin mag altijd overal bij.
function requireRole(...roles) {
  return (req, res, next) => {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: 'Niet ingelogd' });
    if (roles.length && user.role !== 'admin' && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Geen toegang' });
    }
    req.user = user;
    next();
  };
}

function cleanupExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
}

module.exports = { createSession, destroySession, currentUser, requireRole, cleanupExpiredSessions };
