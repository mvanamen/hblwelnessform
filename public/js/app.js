/* HerbaForms — SPA (vanilla JS, hash-router) */
(function () {
  'use strict';

  const $app = document.getElementById('app');
  const state = { user: null, profile: null };

  // ---------- thema ----------
  function applyTheme() {
    const t = localStorage.getItem('hf-theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }
  function cycleTheme() {
    const cur = localStorage.getItem('hf-theme');
    const next = cur === 'dark' ? 'light' : cur === 'light' ? null : 'dark';
    if (next) localStorage.setItem('hf-theme', next); else localStorage.removeItem('hf-theme');
    applyTheme();
    toast(next === 'dark' ? 'Donker thema' : next === 'light' ? 'Licht thema' : 'Thema volgt systeem');
  }
  applyTheme();

  // ---------- helpers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const fmtNum = (v, d = 1) => v == null ? '—' :
    Number(v).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: d });

  const fmtDate = (iso) => iso ? HFCharts.fmtDateLong(iso.slice(0, 10)) : '—';
  const today = () => new Date().toISOString().slice(0, 10);
  const daysAgo = (iso) => iso ? Math.floor((Date.now() - new Date(iso + 'T12:00:00')) / 864e5) : null;

  const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  async function api(path, opts = {}) {
    const res = await fetch('/api' + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && path !== '/login' && path !== '/me') {
        state.user = null; location.hash = '#/login'; route();
      }
      throw new Error(data.error || 'Er ging iets mis');
    }
    return data;
  }

  function toast(msg, isError = false) {
    const root = document.getElementById('toast-root');
    const t = document.createElement('div');
    t.className = 'toast' + (isError ? ' error' : '');
    t.textContent = msg;
    root.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2600);
    setTimeout(() => t.remove(), 3000);
  }

  function modal(html) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-backdrop"><div class="modal">${html}</div></div>`;
    const backdrop = root.firstElementChild;
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', escClose);
    return backdrop.firstElementChild;
  }
  function escClose(e) { if (e.key === 'Escape') closeModal(); }
  function closeModal() {
    document.getElementById('modal-root').innerHTML = '';
    document.removeEventListener('keydown', escClose);
  }

  function confirmModal(title, text, confirmLabel = 'Verwijderen') {
    return new Promise((resolve) => {
      const m = modal(`
        <h3>${esc(title)}</h3>
        <p style="color:var(--ink-2)">${esc(text)}</p>
        <div class="modal-actions">
          <button class="btn ghost" data-x="no">Annuleren</button>
          <button class="btn danger" data-x="yes">${esc(confirmLabel)}</button>
        </div>`);
      m.querySelector('[data-x="no"]').onclick = () => { closeModal(); resolve(false); };
      m.querySelector('[data-x="yes"]').onclick = () => { closeModal(); resolve(true); };
    });
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast('Gekopieerd naar klembord'); }
    catch { toast('Kopiëren niet gelukt — noteer het handmatig', true); }
  }

  function passwordRevealHTML(password) {
    return `
      <div class="password-reveal">
        <code>${esc(password)}</code>
        <p>Tijdelijk wachtwoord — deel dit veilig. Bij de eerste login moet het gewijzigd worden.</p>
      </div>
      <button class="btn ghost" data-copy>Kopieer wachtwoord</button>`;
  }

  // ---------- iconen ----------
  const I = {
    home: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    plus: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
    clock: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    user: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    users: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1.2-3.4 3.7-5 6.5-5s5.3 1.6 6.5 5"/><circle cx="17" cy="9" r="3"/><path d="M16.5 15.5c2.3.3 4.2 1.8 5 4.5"/></svg>',
    chart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V4"/><path d="M4 20h16"/><path d="m7 14 4-5 3 3 5-7"/></svg>',
    gear: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1"/></svg>',
    out: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
    moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13A8.5 8.5 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>',
    leaf: '<svg width="20" height="20" viewBox="0 0 32 32"><path d="M16 25c-5-2-8-6-8-11 0-3 2-6 5-7 4-1 8 1 10 5-3-1-6 0-8 2s-3 5-2 8c.8 1.6 2 2.6 3 3z" fill="#17240a"/></svg>',
  };
  const logoHTML = `<div class="logo"><div class="logo-mark">${I.leaf}</div><div class="logo-name">Herba<span>Forms</span></div></div>`;

  // ---------- navigatie per rol ----------
  function navItems() {
    const r = state.user.role;
    if (r === 'member') return [
      { href: '#/', label: 'Overzicht', icon: I.home },
      { href: '#/checkin', label: 'Check-in', icon: I.plus },
      { href: '#/historie', label: 'Historie', icon: I.clock },
      { href: '#/profiel', label: 'Profiel', icon: I.user },
    ];
    if (r === 'coach') return [
      { href: '#/', label: 'Deelnemers', icon: I.users },
      { href: '#/instellingen', label: 'Instellingen', icon: I.gear },
    ];
    return [
      { href: '#/', label: 'Overzicht', icon: I.chart },
      { href: '#/deelnemers', label: 'Deelnemers', icon: I.users },
      { href: '#/coaches', label: 'Coaches', icon: I.user },
      { href: '#/instellingen', label: 'Instellingen', icon: I.gear },
    ];
  }

  function shell(contentHTML) {
    const items = navItems();
    const cur = location.hash || '#/';
    const link = (n, cls) =>
      `<a href="${n.href}" class="${cls}${cur === n.href ? ' active' : ''}">${n.icon}<span>${n.label}</span></a>`;
    $app.innerHTML = `
      <div class="shell">
        <aside class="sidebar">
          ${logoHTML}
          <nav class="nav">${items.map((n) => link(n, '')).join('')}</nav>
          <div class="sidebar-footer">
            <div class="user-chip">
              <div class="avatar">${esc(initials(state.user.name))}</div>
              <div><b>${esc(state.user.name)}</b><small>${roleLabel(state.user.role)}</small></div>
            </div>
            <div class="sidebar-actions">
              <button class="icon-btn" data-theme-toggle title="Thema wisselen">${I.moon}</button>
              <button class="icon-btn" data-logout>${I.out} Uitloggen</button>
            </div>
          </div>
        </aside>
        <div>
          <header class="topbar">
            ${logoHTML}
            <div class="topbar-actions">
              <button class="icon-btn" data-theme-toggle title="Thema">${I.moon}</button>
              <button class="icon-btn" data-logout title="Uitloggen">${I.out}</button>
            </div>
          </header>
          <main class="main"><div class="main-inner">${contentHTML}</div></main>
          <nav class="tabbar">${items.map((n) => link(n, '')).join('')}</nav>
        </div>
      </div>`;
    $app.querySelectorAll('[data-logout]').forEach((b) => b.onclick = logout);
    $app.querySelectorAll('[data-theme-toggle]').forEach((b) => b.onclick = cycleTheme);
    return $app.querySelector('.main-inner');
  }

  const roleLabel = (r) => ({ admin: 'Beheerder', coach: 'Coach', member: 'Deelnemer' }[r] || r);

  async function logout() {
    await api('/logout', { method: 'POST' }).catch(() => {});
    state.user = null; state.profile = null;
    location.hash = '#/login';
    route();
  }

  // ---------- statistiek-helpers ----------
  function weightSeries(checkins) {
    return checkins.filter((c) => c.weight != null).map((c) => ({ date: c.date, value: c.weight }));
  }
  function energySeries(checkins) {
    return checkins.filter((c) => c.energy != null).map((c) => ({ date: c.date, value: c.energy }));
  }
  function memberStats(profile, checkins) {
    const w = weightSeries(checkins);
    const current = w.length ? w[w.length - 1].value : null;
    const start = profile?.start_weight ?? (w.length ? w[0].value : null);
    const goal = profile?.goal_weight ?? null;
    const delta = current != null && start != null ? current - start : null;
    const cutoff = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
    const recent = checkins.filter((c) => c.date >= cutoff && c.energy != null);
    const energyAvg = recent.length ? recent.reduce((s, c) => s + c.energy, 0) / recent.length : null;
    let progress = null;
    if (start != null && goal != null && current != null && Math.abs(start - goal) > 0.01) {
      progress = Math.max(0, Math.min(100, ((start - current) / (start - goal)) * 100));
    }
    return { current, start, goal, delta, energyAvg, progress, count: checkins.length };
  }

  function deltaHTML(delta, { goodWhenDown = true, unit = 'kg', d = 1 } = {}) {
    if (delta == null || Math.abs(delta) < 0.001) return '<span class="tile-delta flat">± 0</span>';
    const down = delta < 0;
    const good = goodWhenDown ? down : !down;
    const arrow = down ? '▾' : '▴';
    return `<span class="tile-delta ${good ? 'good' : 'bad'}">${arrow} ${fmtNum(Math.abs(delta), d)} ${unit}</span>`;
  }

  const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

  // ============================================================
  // Views
  // ============================================================

  function loginView(err = '') {
    $app.innerHTML = `
      <div class="login-wrap">
        <div class="login-card">
          <div class="login-brand">
            <div class="logo-mark">${I.leaf}</div>
            <h1>Herba<span style="color:var(--brand)">Forms</span></h1>
            <p>Jouw voortgang, samen met je coach.</p>
          </div>
          ${err ? `<div class="form-error">${esc(err)}</div>` : ''}
          <form id="login-form" class="field-stack" style="display:flex;flex-direction:column;gap:14px">
            <div class="field"><label>E-mailadres</label>
              <input class="input" name="email" type="email" required autocomplete="email" placeholder="jij@voorbeeld.nl"></div>
            <div class="field"><label>Wachtwoord</label>
              <input class="input" name="password" type="password" required autocomplete="current-password" placeholder="••••••••"></div>
            <button class="btn big" type="submit">Inloggen</button>
          </form>
        </div>
      </div>`;
    document.getElementById('login-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        const { user } = await api('/login', { method: 'POST', body: { email: f.get('email'), password: f.get('password') } });
        state.user = user;
        if (location.hash && location.hash !== '#/') location.hash = '#/';
        else route();
      } catch (err) { loginView(err.message); }
    };
  }

  function forcePasswordView() {
    $app.innerHTML = `
      <div class="login-wrap">
        <div class="login-card">
          <div class="login-brand">
            <div class="logo-mark">${I.leaf}</div>
            <h1>Nieuw wachtwoord</h1>
            <p>Welkom ${esc(state.user.name)}! Kies eerst een eigen wachtwoord om verder te gaan.</p>
          </div>
          <div id="pw-err"></div>
          <form id="pw-form" style="display:flex;flex-direction:column;gap:14px">
            <div class="field"><label>Huidig (tijdelijk) wachtwoord</label>
              <input class="input" name="current" type="password" required autocomplete="current-password"></div>
            <div class="field"><label>Nieuw wachtwoord</label>
              <input class="input" name="next" type="password" required minlength="8" autocomplete="new-password">
              <span class="hint">Minimaal 8 tekens.</span></div>
            <button class="btn big" type="submit">Opslaan en doorgaan</button>
          </form>
        </div>
      </div>`;
    document.getElementById('pw-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        await api('/password', { method: 'POST', body: { current: f.get('current'), next: f.get('next') } });
        state.user.must_change_password = false;
        toast('Wachtwoord ingesteld — welkom!');
        route();
      } catch (err) {
        document.getElementById('pw-err').innerHTML = `<div class="form-error">${esc(err.message)}</div>`;
      }
    };
  }

  // ---------- Deelnemer ----------

  async function memberHome() {
    const root = shell('<div class="skeleton">Laden…</div>');
    const data = await api('/member/dashboard');
    state.profile = data.profile;
    const { profile, checkins, coach } = data;
    const s = memberStats(profile, checkins);
    const hour = new Date().getHours();
    const greet = hour < 6 ? 'Goedenacht' : hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond';
    const first = state.user.name.split(' ')[0];

    const intakePrompt = (!profile || !profile.completed) ? `
      <div class="card" style="border-color:var(--accent);background:var(--accent-soft)">
        <div class="card-head" style="margin-bottom:8px"><div>
          <div class="card-title">Maak je profiel compleet</div>
          <div class="card-sub">Vul je startgewicht en doel in, dan kunnen we je voortgang laten zien.</div>
        </div></div>
        <a class="btn" href="#/profiel">Profiel invullen</a>
      </div>` : '';

    const progressCard = s.progress != null ? `
      <div class="card">
        <div class="card-head" style="margin-bottom:10px"><div>
          <div class="card-title">Op weg naar je doel</div>
          <div class="card-sub">Van ${fmtNum(s.start)} naar ${fmtNum(s.goal)} kg</div>
        </div><b style="font-size:18px">${Math.round(s.progress)}%</b></div>
        <div class="progress-track"><div class="progress-fill" style="width:${s.progress}%"></div></div>
      </div>` : '';

    const recent = checkins.slice(-3).reverse();

    root.innerHTML = `
      <div class="page-head"><div>
        <h1>${greet}, ${esc(first)} 👋</h1>
        <p class="sub">${s.count ? `Je hebt ${s.count} check-in${s.count === 1 ? '' : 's'} gedaan. Blijf zo doorgaan!` : 'Tijd voor je eerste check-in!'}</p>
      </div><a class="btn" href="#/checkin">+ Nieuwe check-in</a></div>
      ${intakePrompt}
      <div class="tile-row">
        <div class="tile"><span class="tile-label">Huidig gewicht</span>
          <span class="tile-value">${fmtNum(s.current)}<small>kg</small></span>
          ${s.delta != null ? deltaHTML(s.delta, { goodWhenDown: s.goal == null || s.goal < s.start }) : ''}</div>
        <div class="tile"><span class="tile-label">Nog te gaan</span>
          <span class="tile-value">${s.goal != null && s.current != null ? fmtNum(Math.abs(s.current - s.goal)) + '<small>kg</small>' : '—'}</span></div>
        <div class="tile"><span class="tile-label">Energie (14 dagen)</span>
          <span class="tile-value">${s.energyAvg != null ? fmtNum(s.energyAvg, 1) + '<small>/10</small>' : '—'}</span></div>
        <div class="tile"><span class="tile-label">Check-ins</span>
          <span class="tile-value">${s.count}</span></div>
      </div>
      ${progressCard}
      <div class="grid-2">
        <div class="card"><div class="card-head"><div>
          <div class="card-title">Gewicht</div><div class="card-sub">in kilogram</div></div></div>
          <div id="chart-weight"></div></div>
        <div class="card"><div class="card-head"><div>
          <div class="card-title">Energie</div><div class="card-sub">score van 1 tot 10</div></div></div>
          <div id="chart-energy"></div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-head"><div><div class="card-title">Laatste check-ins</div></div>
            <a href="#/historie" style="font-size:13.5px;font-weight:650">Alles bekijken</a></div>
          ${recent.length ? `<div class="list">${recent.map((c) => `
            <div class="list-item">
              <div><b style="font-size:14px">${fmtDate(c.date)}</b>
                <small style="display:block;color:var(--ink-3)">${c.mood ? MOODS[c.mood - 1] + ' · ' : ''}${c.energy != null ? 'energie ' + c.energy + '/10' : ''}</small></div>
              <b>${c.weight != null ? fmtNum(c.weight) + ' kg' : '—'}</b>
            </div>`).join('')}</div>`
          : '<div class="empty"><p>Nog geen check-ins.</p></div>'}
        </div>
        <div class="card">
          <div class="card-head"><div><div class="card-title">Jouw coach</div></div></div>
          ${coach ? `<div class="person-row">
              <div class="avatar">${esc(initials(coach.name))}</div>
              <div class="who"><b>${esc(coach.name)}</b><small>${esc(coach.email)}</small></div>
            </div>
            <p style="color:var(--ink-2);font-size:13.5px;margin-top:12px">Vragen over je voortgang? Neem gerust contact op.</p>`
          : '<div class="empty"><p>Er is nog geen coach aan je gekoppeld.</p></div>'}
        </div>
      </div>`;

    HFCharts.lineChart(root.querySelector('#chart-weight'), {
      points: weightSeries(checkins), colorVar: '--series-weight', unit: 'kg',
      name: 'Gewicht', goal: s.goal, decimals: 1,
    });
    HFCharts.lineChart(root.querySelector('#chart-energy'), {
      points: energySeries(checkins), colorVar: '--series-energy', unit: '/10',
      name: 'Energie', decimals: 0, yMin: 0, yMax: 11,
    });
  }

  async function checkinView() {
    const root = shell('');
    let energy = null, mood = null;
    root.innerHTML = `
      <div class="page-head"><div><h1>Check-in</h1>
        <p class="sub">Vul in hoe het vandaag met je gaat. Alleen datum is verplicht — de rest mag leeg.</p></div></div>
      <form id="ci-form" class="card" style="display:flex;flex-direction:column;gap:18px">
        <div class="form-grid">
          <div class="field"><label>Datum</label>
            <input class="input" type="date" name="date" value="${today()}" max="${today()}" required></div>
          <div class="field"><label>Gewicht (kg)</label>
            <input class="input" type="number" name="weight" step="0.1" min="20" max="400" inputmode="decimal" placeholder="bijv. 82,5"></div>
          <div class="field full"><label>Energie vandaag</label>
            <div class="chips" data-energy>${Array.from({ length: 10 }, (_, i) =>
              `<button type="button" class="chip" data-v="${i + 1}">${i + 1}</button>`).join('')}</div>
            <span class="hint">1 = uitgeput · 10 = bruisend van de energie</span></div>
          <div class="field full"><label>Stemming</label>
            <div class="chips" data-mood>${MOODS.map((m, i) =>
              `<button type="button" class="chip emoji" data-v="${i + 1}">${m}</button>`).join('')}</div></div>
          <div class="field"><label>Slaap (uren)</label>
            <input class="input" type="number" name="sleep_hours" step="0.5" min="0" max="24" inputmode="decimal" placeholder="bijv. 7,5"></div>
          <div class="field"><label>Water (liter)</label>
            <input class="input" type="number" name="water_l" step="0.1" min="0" max="15" inputmode="decimal" placeholder="bijv. 2"></div>
          <div class="field full"><label>Notities</label>
            <textarea class="input" name="notes" placeholder="Hoe ging het vandaag? Bijzonderheden?"></textarea></div>
        </div>
        <button class="btn big" type="submit">Check-in opslaan</button>
      </form>`;

    const bindChips = (sel, set) => {
      root.querySelectorAll(`${sel} .chip`).forEach((c) => c.onclick = () => {
        const on = c.classList.contains('on');
        root.querySelectorAll(`${sel} .chip`).forEach((x) => x.classList.remove('on'));
        if (!on) { c.classList.add('on'); set(Number(c.dataset.v)); } else set(null);
      });
    };
    bindChips('[data-energy]', (v) => energy = v);
    bindChips('[data-mood]', (v) => mood = v);

    document.getElementById('ci-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        await api('/member/checkins', { method: 'POST', body: {
          date: f.get('date'), weight: f.get('weight'), energy, mood,
          sleep_hours: f.get('sleep_hours'), water_l: f.get('water_l'), notes: f.get('notes'),
        }});
        toast('Check-in opgeslagen 💪');
        location.hash = '#/';
      } catch (err) { toast(err.message, true); }
    };
  }

  function checkinTable(checkins, { withDelete = false } = {}) {
    if (!checkins.length) return '<div class="empty"><div class="big-emoji">🗓️</div><p>Nog geen check-ins.</p></div>';
    const rows = [...checkins].reverse().map((c) => `
      <tr>
        <td><b>${fmtDate(c.date)}</b></td>
        <td class="num">${c.weight != null ? fmtNum(c.weight) + ' kg' : '—'}</td>
        <td class="num">${c.energy != null ? c.energy + '/10' : '—'}</td>
        <td class="num">${c.sleep_hours != null ? fmtNum(c.sleep_hours) + ' u' : '—'}</td>
        <td class="num">${c.water_l != null ? fmtNum(c.water_l) + ' L' : '—'}</td>
        <td>${c.mood ? MOODS[c.mood - 1] : '—'}</td>
        <td style="white-space:normal;max-width:260px;color:var(--ink-2)">${esc(c.notes || '')}</td>
        ${withDelete ? `<td><button class="btn danger small" data-del="${c.id}">Verwijder</button></td>` : ''}
      </tr>`).join('');
    return `<div class="table-wrap"><table class="table">
      <thead><tr><th>Datum</th><th class="num">Gewicht</th><th class="num">Energie</th>
      <th class="num">Slaap</th><th class="num">Water</th><th>Humeur</th><th>Notities</th>${withDelete ? '<th></th>' : ''}</tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  async function historyView() {
    const root = shell('<div class="skeleton">Laden…</div>');
    const data = await api('/member/dashboard');
    const render = (checkins) => {
      root.innerHTML = `
        <div class="page-head"><div><h1>Historie</h1>
          <p class="sub">Al je check-ins op een rij.</p></div>
          <a class="btn" href="#/checkin">+ Nieuwe check-in</a></div>
        <div class="card">${checkinTable(checkins, { withDelete: true })}</div>`;
      root.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
        if (!await confirmModal('Check-in verwijderen', 'Weet je zeker dat je deze check-in wilt verwijderen?')) return;
        try {
          const res = await api(`/member/checkins/${b.dataset.del}`, { method: 'DELETE' });
          toast('Check-in verwijderd');
          render(res.checkins);
        } catch (err) { toast(err.message, true); }
      });
    };
    render(data.checkins);
  }

  async function profileView() {
    const root = shell('<div class="skeleton">Laden…</div>');
    const { profile } = await api('/me');
    const p = profile || {};
    root.innerHTML = `
      <div class="page-head"><div><h1>Mijn profiel</h1>
        <p class="sub">Deze gegevens gebruikt je coach om je goed te begeleiden.</p></div></div>
      <form id="pr-form" class="card" style="display:flex;flex-direction:column;gap:18px">
        <div class="form-grid">
          <div class="field"><label>Geboortedatum</label>
            <input class="input" type="date" name="birthdate" value="${esc(p.birthdate || '')}" max="${today()}"></div>
          <div class="field"><label>Lengte (cm)</label>
            <input class="input" type="number" name="height_cm" step="0.5" min="100" max="250" value="${p.height_cm ?? ''}" inputmode="decimal"></div>
          <div class="field"><label>Startgewicht (kg)</label>
            <input class="input" type="number" name="start_weight" step="0.1" min="20" max="400" value="${p.start_weight ?? ''}" inputmode="decimal"></div>
          <div class="field"><label>Doelgewicht (kg)</label>
            <input class="input" type="number" name="goal_weight" step="0.1" min="20" max="400" value="${p.goal_weight ?? ''}" inputmode="decimal"></div>
          <div class="field"><label>Hoe actief ben je?</label>
            <select class="input" name="activity_level">
              ${['', 'Weinig actief', 'Licht actief', 'Gemiddeld actief', 'Erg actief', 'Topsporter']
                .map((o) => `<option value="${o}"${p.activity_level === o ? ' selected' : ''}>${o || 'Maak een keuze'}</option>`).join('')}
            </select></div>
          <div class="field"><label>Wat is je doel?</label>
            <input class="input" name="goal_text" value="${esc(p.goal_text || '')}" placeholder="bijv. fitter worden, afvallen…"></div>
          <div class="field full"><label>Gezondheid & bijzonderheden</label>
            <textarea class="input" name="health_notes" placeholder="Allergieën, blessures, medicatie… (optioneel)">${esc(p.health_notes || '')}</textarea></div>
        </div>
        <button class="btn big" type="submit">Profiel opslaan</button>
      </form>
      <div class="card">
        <div class="card-head"><div><div class="card-title">Wachtwoord wijzigen</div></div></div>
        ${passwordFormHTML()}
      </div>`;
    document.getElementById('pr-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const body = {};
      for (const [k, v] of f.entries()) body[k] = v;
      try {
        const res = await api('/member/profile', { method: 'PUT', body });
        state.profile = res.profile;
        toast('Profiel opgeslagen ✔');
        location.hash = '#/';
      } catch (err) { toast(err.message, true); }
    };
    bindPasswordForm(root);
  }

  function passwordFormHTML() {
    return `
      <form data-pwform class="form-grid">
        <div class="field"><label>Huidig wachtwoord</label>
          <input class="input" name="current" type="password" required autocomplete="current-password"></div>
        <div class="field"><label>Nieuw wachtwoord</label>
          <input class="input" name="next" type="password" required minlength="8" autocomplete="new-password"></div>
        <div class="full"><button class="btn ghost" type="submit">Wachtwoord wijzigen</button></div>
      </form>`;
  }
  function bindPasswordForm(root) {
    const form = root.querySelector('[data-pwform]');
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(form);
      try {
        await api('/password', { method: 'POST', body: { current: f.get('current'), next: f.get('next') } });
        toast('Wachtwoord gewijzigd ✔');
        form.reset();
      } catch (err) { toast(err.message, true); }
    };
  }

  // ---------- Coach ----------

  function memberBadge(m) {
    const d = daysAgo(m.last_checkin);
    if (d == null) return '<span class="badge">nog geen check-in</span>';
    if (d <= 7) return '<span class="badge good">actief</span>';
    if (d <= 14) return `<span class="badge warn">${d} dgn stil</span>`;
    return `<span class="badge bad">${d} dgn stil</span>`;
  }

  async function coachHome() {
    const root = shell('<div class="skeleton">Laden…</div>');
    const { members } = await api('/coach/members');
    const render = (filter = '') => {
      const list = members.filter((m) =>
        (m.name + ' ' + m.email).toLowerCase().includes(filter.toLowerCase()));
      root.innerHTML = `
        <div class="page-head"><div><h1>Mijn deelnemers</h1>
          <p class="sub">${members.length} deelnemer${members.length === 1 ? '' : 's'} gekoppeld aan jou.</p></div>
          <button class="btn" data-new>+ Nieuwe deelnemer</button></div>
        <div class="card">
          <input class="input" data-search placeholder="Zoek op naam of e-mail…" value="${esc(filter)}" style="margin-bottom:14px">
          ${list.length ? `<div class="table-wrap"><table class="table">
            <thead><tr><th>Deelnemer</th><th>Status</th><th>Laatste check-in</th>
            <th class="num">Gewicht</th><th class="num">Energie</th><th class="num">Check-ins</th></tr></thead>
            <tbody>${list.map((m) => `
              <tr class="clickable" data-open="${m.id}">
                <td><div class="person-row"><div class="avatar">${esc(initials(m.name))}</div>
                  <div class="who"><b>${esc(m.name)}</b><small>${esc(m.email)}</small></div></div></td>
                <td>${m.active ? memberBadge(m) : '<span class="badge bad">inactief</span>'}</td>
                <td>${m.last_checkin ? fmtDate(m.last_checkin) : '—'}</td>
                <td class="num">${m.last_weight != null ? fmtNum(m.last_weight) + ' kg' : '—'}</td>
                <td class="num">${m.last_energy != null ? m.last_energy + '/10' : '—'}</td>
                <td class="num">${m.checkin_count}</td>
              </tr>`).join('')}</tbody></table></div>`
          : '<div class="empty"><div class="big-emoji">🌱</div><p>Nog geen deelnemers. Voeg je eerste deelnemer toe!</p></div>'}
        </div>`;
      const search = root.querySelector('[data-search]');
      search.oninput = () => { const v = search.value; render(v); root.querySelector('[data-search]').focus();
        const s = root.querySelector('[data-search]'); s.setSelectionRange(v.length, v.length); };
      root.querySelectorAll('[data-open]').forEach((tr) => tr.onclick = () => {
        location.hash = '#/deelnemer/' + tr.dataset.open;
      });
      root.querySelector('[data-new]').onclick = () => newMemberModal();
    };
    render();
  }

  function newMemberModal(coaches = null, onDone = null) {
    const coachSelect = coaches ? `
      <div class="field"><label>Koppel aan coach</label>
        <select class="input" name="coach_id"><option value="">— Geen coach —</option>
        ${coaches.filter((c) => c.active).map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>` : '';
    const m = modal(`
      <h3>Nieuwe deelnemer</h3>
      <form data-f style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><label>Naam</label><input class="input" name="name" required placeholder="Voor- en achternaam"></div>
        <div class="field"><label>E-mailadres</label><input class="input" name="email" type="email" required placeholder="deelnemer@voorbeeld.nl"></div>
        ${coachSelect}
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-x>Annuleren</button>
          <button class="btn" type="submit">Account aanmaken</button>
        </div>
      </form>`);
    m.querySelector('[data-x]').onclick = closeModal;
    m.querySelector('[data-f]').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        const body = { name: f.get('name'), email: f.get('email') };
        if (coaches) body.coach_id = f.get('coach_id') || null;
        const res = await api('/coach/members', { method: 'POST', body });
        m.innerHTML = `
          <h3>Account aangemaakt 🎉</h3>
          <p style="color:var(--ink-2)">${esc(res.user.name)} kan nu inloggen met <b>${esc(res.user.email)}</b> en dit tijdelijke wachtwoord:</p>
          ${passwordRevealHTML(res.password)}
          <div class="modal-actions"><button class="btn" data-done>Klaar</button></div>`;
        m.querySelector('[data-copy]').onclick = () => copyText(res.password);
        m.querySelector('[data-done]').onclick = () => { closeModal(); (onDone || route)(); };
      } catch (err) { toast(err.message, true); }
    };
  }

  async function memberDetailView(id) {
    const root = shell('<div class="skeleton">Laden…</div>');
    let data;
    try { data = await api('/coach/members/' + id); }
    catch (err) {
      root.innerHTML = `<div class="card"><div class="empty"><p>${esc(err.message)}</p></div></div>`;
      return;
    }
    const { user, profile, checkins, notes } = data;
    const s = memberStats(profile, checkins);
    const backHref = state.user.role === 'admin' ? '#/deelnemers' : '#/';

    root.innerHTML = `
      <div class="page-head">
        <div>
          <a href="${backHref}" style="font-size:13.5px;font-weight:650">← Terug naar overzicht</a>
          <h1 style="margin-top:6px">${esc(user.name)}</h1>
          <p class="sub">${esc(user.email)} · lid sinds ${fmtDate(user.created_at)}</p>
        </div>
        <button class="btn ghost" data-resetpw>Reset wachtwoord</button>
      </div>
      <div class="tile-row">
        <div class="tile"><span class="tile-label">Huidig gewicht</span>
          <span class="tile-value">${fmtNum(s.current)}<small>kg</small></span>
          ${s.delta != null ? deltaHTML(s.delta, { goodWhenDown: s.goal == null || s.goal < s.start }) : ''}</div>
        <div class="tile"><span class="tile-label">Doelgewicht</span>
          <span class="tile-value">${fmtNum(s.goal)}<small>kg</small></span></div>
        <div class="tile"><span class="tile-label">Energie (14 dgn)</span>
          <span class="tile-value">${s.energyAvg != null ? fmtNum(s.energyAvg, 1) + '<small>/10</small>' : '—'}</span></div>
        <div class="tile"><span class="tile-label">Laatste check-in</span>
          <span class="tile-value" style="font-size:18px;padding-top:6px">${checkins.length ? fmtDate(checkins[checkins.length - 1].date) : '—'}</span></div>
      </div>
      <div class="grid-2">
        <div class="card"><div class="card-head"><div>
          <div class="card-title">Gewicht</div><div class="card-sub">in kilogram</div></div></div>
          <div id="chart-weight"></div></div>
        <div class="card"><div class="card-head"><div>
          <div class="card-title">Energie</div><div class="card-sub">score van 1 tot 10</div></div></div>
          <div id="chart-energy"></div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-head"><div><div class="card-title">Intake</div></div></div>
          ${profile && profile.completed ? `<div class="list">
            ${[['Geboortedatum', profile.birthdate ? fmtDate(profile.birthdate) : '—'],
               ['Lengte', profile.height_cm ? fmtNum(profile.height_cm, 1) + ' cm' : '—'],
               ['Startgewicht', profile.start_weight ? fmtNum(profile.start_weight) + ' kg' : '—'],
               ['Doelgewicht', profile.goal_weight ? fmtNum(profile.goal_weight) + ' kg' : '—'],
               ['Activiteit', profile.activity_level || '—'],
               ['Doel', profile.goal_text || '—'],
               ['Gezondheid', profile.health_notes || '—']]
              .map(([k, v]) => `<div class="list-item"><small style="color:var(--ink-3);font-weight:650">${k}</small>
                <span style="text-align:right;white-space:normal">${esc(v)}</span></div>`).join('')}
          </div>` : '<div class="empty"><p>Intake is nog niet ingevuld.</p></div>'}
        </div>
        <div class="card">
          <div class="card-head"><div><div class="card-title">Coachnotities</div>
            <div class="card-sub">Alleen zichtbaar voor coaches</div></div></div>
          <form data-notef style="display:flex;gap:8px;margin-bottom:10px">
            <input class="input" name="text" placeholder="Nieuwe notitie…" required>
            <button class="btn" type="submit">+</button>
          </form>
          <div data-notes>${notesHTML(notes)}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">Alle check-ins</div></div></div>
        ${checkinTable(checkins)}
      </div>`;

    HFCharts.lineChart(root.querySelector('#chart-weight'), {
      points: weightSeries(checkins), colorVar: '--series-weight', unit: 'kg', name: 'Gewicht', goal: s.goal, decimals: 1,
    });
    HFCharts.lineChart(root.querySelector('#chart-energy'), {
      points: energySeries(checkins), colorVar: '--series-energy', unit: '/10', name: 'Energie', decimals: 0, yMin: 0, yMax: 11,
    });

    root.querySelector('[data-notef]').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        const res = await api(`/coach/members/${id}/notes`, { method: 'POST', body: { text: f.get('text') } });
        e.target.reset();
        root.querySelector('[data-notes]').innerHTML = notesHTML(res.notes);
      } catch (err) { toast(err.message, true); }
    };

    root.querySelector('[data-resetpw]').onclick = async () => {
      if (!await confirmModal('Wachtwoord resetten', `${user.name} krijgt een nieuw tijdelijk wachtwoord en moet dit bij de volgende login wijzigen.`, 'Resetten')) return;
      try {
        const res = await api(`/coach/members/${id}/reset-password`, { method: 'POST' });
        const m = modal(`
          <h3>Nieuw tijdelijk wachtwoord</h3>
          ${passwordRevealHTML(res.password)}
          <div class="modal-actions"><button class="btn" data-done>Klaar</button></div>`);
        m.querySelector('[data-copy]').onclick = () => copyText(res.password);
        m.querySelector('[data-done]').onclick = closeModal;
      } catch (err) { toast(err.message, true); }
    };
  }

  function notesHTML(notes) {
    if (!notes.length) return '<p style="color:var(--ink-3);font-size:13.5px">Nog geen notities.</p>';
    return notes.map((n) => `
      <div class="note-item">
        <div style="white-space:pre-wrap">${esc(n.text)}</div>
        <div class="note-meta">${esc(n.coach_name)} · ${fmtDate(n.created_at)}</div>
      </div>`).join('');
  }

  // ---------- Admin ----------

  async function adminHome() {
    const root = shell('<div class="skeleton">Laden…</div>');
    const [o, u] = await Promise.all([api('/admin/overview'), api('/admin/users')]);
    const silent = u.members.filter((m) => m.active && (daysAgo(m.last_checkin) == null || daysAgo(m.last_checkin) > 7));
    root.innerHTML = `
      <div class="page-head"><div><h1>Overzicht</h1>
        <p class="sub">Zo staat je community ervoor.</p></div></div>
      <div class="tile-row">
        <div class="tile"><span class="tile-label">Actieve deelnemers</span><span class="tile-value">${o.members}</span></div>
        <div class="tile"><span class="tile-label">Coaches</span><span class="tile-value">${o.coaches}</span></div>
        <div class="tile"><span class="tile-label">Check-ins deze week</span><span class="tile-value">${o.checkins_week}</span></div>
        <div class="tile"><span class="tile-label">Actief deze week</span><span class="tile-value">${o.active_week}<small>van ${o.members}</small></span></div>
      </div>
      ${o.unassigned ? `<div class="card" style="border-color:var(--warn-text)">
        <b>⚠️ ${o.unassigned} deelnemer${o.unassigned === 1 ? ' heeft' : 's hebben'} nog geen coach.</b>
        <p style="color:var(--ink-2);font-size:14px;margin-top:4px">Koppel ze via <a href="#/deelnemers">Deelnemers</a>.</p>
      </div>` : ''}
      <div class="card">
        <div class="card-head"><div><div class="card-title">Aandacht nodig</div>
          <div class="card-sub">Deelnemers zonder check-in in de afgelopen 7 dagen</div></div></div>
        ${silent.length ? `<div class="list">${silent.slice(0, 8).map((m) => `
          <div class="list-item">
            <div class="person-row"><div class="avatar">${esc(initials(m.name))}</div>
              <div class="who"><b>${esc(m.name)}</b><small>${m.coach_name ? 'coach: ' + esc(m.coach_name) : 'geen coach'}</small></div></div>
            <div style="display:flex;align-items:center;gap:10px">${memberBadge(m)}
              <a class="btn ghost small" href="#/deelnemer/${m.id}">Bekijk</a></div>
          </div>`).join('')}</div>`
        : '<div class="empty"><div class="big-emoji">🎉</div><p>Iedereen heeft recent ingecheckt!</p></div>'}
      </div>`;
  }

  async function adminMembersView() {
    const root = shell('<div class="skeleton">Laden…</div>');
    const u = await api('/admin/users');
    const render = (filter = '') => {
      const list = u.members.filter((m) =>
        (m.name + ' ' + m.email + ' ' + (m.coach_name || '')).toLowerCase().includes(filter.toLowerCase()));
      root.innerHTML = `
        <div class="page-head"><div><h1>Deelnemers</h1>
          <p class="sub">${u.members.length} deelnemers in totaal.</p></div>
          <button class="btn" data-new>+ Nieuwe deelnemer</button></div>
        <div class="card">
          <input class="input" data-search placeholder="Zoek op naam, e-mail of coach…" value="${esc(filter)}" style="margin-bottom:14px">
          ${list.length ? `<div class="table-wrap"><table class="table">
            <thead><tr><th>Deelnemer</th><th>Coach</th><th>Status</th><th>Laatste check-in</th><th></th></tr></thead>
            <tbody>${list.map((m) => `
              <tr>
                <td><div class="person-row"><div class="avatar">${esc(initials(m.name))}</div>
                  <div class="who"><b>${esc(m.name)}</b><small>${esc(m.email)}</small></div></div></td>
                <td>${m.coach_name ? esc(m.coach_name) : '<span class="badge warn">geen coach</span>'}</td>
                <td>${m.active ? memberBadge(m) : '<span class="badge bad">inactief</span>'}</td>
                <td>${m.last_checkin ? fmtDate(m.last_checkin) : '—'}</td>
                <td style="text-align:right">
                  <a class="btn ghost small" href="#/deelnemer/${m.id}">Bekijk</a>
                  <button class="btn ghost small" data-edit="${m.id}">Bewerk</button>
                </td>
              </tr>`).join('')}</tbody></table></div>`
          : '<div class="empty"><p>Geen deelnemers gevonden.</p></div>'}
        </div>`;
      const search = root.querySelector('[data-search]');
      search.oninput = () => { const v = search.value; render(v);
        const s = root.querySelector('[data-search]'); s.focus(); s.setSelectionRange(v.length, v.length); };
      root.querySelector('[data-new]').onclick = () => newMemberModal(u.coaches, adminMembersView);
      root.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => {
        const m = u.members.find((x) => x.id == b.dataset.edit);
        editUserModal(m, 'member', u.coaches, adminMembersView);
      });
    };
    render();
  }

  async function adminCoachesView() {
    const root = shell('<div class="skeleton">Laden…</div>');
    const u = await api('/admin/users');
    root.innerHTML = `
      <div class="page-head"><div><h1>Coaches</h1>
        <p class="sub">${u.coaches.length} coach${u.coaches.length === 1 ? '' : 'es'}.</p></div>
        <button class="btn" data-new>+ Nieuwe coach</button></div>
      <div class="card">
        ${u.coaches.length ? `<div class="table-wrap"><table class="table">
          <thead><tr><th>Coach</th><th class="num">Deelnemers</th><th>Status</th><th></th></tr></thead>
          <tbody>${u.coaches.map((c) => `
            <tr>
              <td><div class="person-row"><div class="avatar">${esc(initials(c.name))}</div>
                <div class="who"><b>${esc(c.name)}</b><small>${esc(c.email)}</small></div></div></td>
              <td class="num">${c.member_count}</td>
              <td>${c.active ? '<span class="badge good">actief</span>' : '<span class="badge bad">inactief</span>'}</td>
              <td style="text-align:right">
                <button class="btn ghost small" data-edit="${c.id}">Bewerk</button>
                <button class="btn ghost small" data-pw="${c.id}">Reset wachtwoord</button>
              </td>
            </tr>`).join('')}</tbody></table></div>`
        : '<div class="empty"><div class="big-emoji">🧑‍🏫</div><p>Nog geen coaches. Maak de eerste aan!</p></div>'}
      </div>`;
    root.querySelector('[data-new]').onclick = () => {
      const m = modal(`
        <h3>Nieuwe coach</h3>
        <form data-f style="display:flex;flex-direction:column;gap:14px">
          <div class="field"><label>Naam</label><input class="input" name="name" required></div>
          <div class="field"><label>E-mailadres</label><input class="input" name="email" type="email" required></div>
          <div class="modal-actions">
            <button class="btn ghost" type="button" data-x>Annuleren</button>
            <button class="btn" type="submit">Account aanmaken</button>
          </div>
        </form>`);
      m.querySelector('[data-x]').onclick = closeModal;
      m.querySelector('[data-f]').onsubmit = async (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        try {
          const res = await api('/admin/users', { method: 'POST', body: { role: 'coach', name: f.get('name'), email: f.get('email') } });
          m.innerHTML = `
            <h3>Coach aangemaakt 🎉</h3>
            <p style="color:var(--ink-2)">${esc(res.user.name)} kan inloggen met <b>${esc(res.user.email)}</b>:</p>
            ${passwordRevealHTML(res.password)}
            <div class="modal-actions"><button class="btn" data-done>Klaar</button></div>`;
          m.querySelector('[data-copy]').onclick = () => copyText(res.password);
          m.querySelector('[data-done]').onclick = () => { closeModal(); adminCoachesView(); };
        } catch (err) { toast(err.message, true); }
      };
    };
    root.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => {
      const c = u.coaches.find((x) => x.id == b.dataset.edit);
      editUserModal(c, 'coach', null, adminCoachesView);
    });
    root.querySelectorAll('[data-pw]').forEach((b) => b.onclick = async () => {
      try {
        const res = await api(`/admin/users/${b.dataset.pw}/reset-password`, { method: 'POST' });
        const m = modal(`
          <h3>Nieuw tijdelijk wachtwoord</h3>
          ${passwordRevealHTML(res.password)}
          <div class="modal-actions"><button class="btn" data-done>Klaar</button></div>`);
        m.querySelector('[data-copy]').onclick = () => copyText(res.password);
        m.querySelector('[data-done]').onclick = closeModal;
      } catch (err) { toast(err.message, true); }
    });
  }

  function editUserModal(user, role, coaches, onDone) {
    const coachSelect = role === 'member' && coaches ? `
      <div class="field"><label>Coach</label>
        <select class="input" name="coach_id"><option value="">— Geen coach —</option>
        ${coaches.map((c) => `<option value="${c.id}"${user.coach_id === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>` : '';
    const m = modal(`
      <h3>${esc(user.name)} bewerken</h3>
      <form data-f style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><label>Naam</label><input class="input" name="name" required value="${esc(user.name)}"></div>
        <div class="field"><label>E-mailadres</label><input class="input" name="email" type="email" required value="${esc(user.email)}"></div>
        ${coachSelect}
        <div class="field"><label>Status</label>
          <select class="input" name="active">
            <option value="1"${user.active ? ' selected' : ''}>Actief</option>
            <option value="0"${!user.active ? ' selected' : ''}>Inactief (kan niet inloggen)</option>
          </select></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-x>Annuleren</button>
          <button class="btn" type="submit">Opslaan</button>
        </div>
      </form>`);
    m.querySelector('[data-x]').onclick = closeModal;
    m.querySelector('[data-f]').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const body = { name: f.get('name'), email: f.get('email'), active: f.get('active') === '1' };
      if (role === 'member' && coaches) body.coach_id = f.get('coach_id') ? Number(f.get('coach_id')) : null;
      try {
        await api('/admin/users/' + user.id, { method: 'PUT', body });
        toast('Opgeslagen ✔');
        closeModal();
        onDone();
      } catch (err) { toast(err.message, true); }
    };
  }

  async function settingsView() {
    const root = shell('');
    root.innerHTML = `
      <div class="page-head"><div><h1>Instellingen</h1></div></div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">Wachtwoord wijzigen</div></div></div>
        ${passwordFormHTML()}
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">Weergave</div></div></div>
        <button class="btn ghost" data-th>Thema wisselen (licht / donker / systeem)</button>
      </div>`;
    bindPasswordForm(root);
    root.querySelector('[data-th]').onclick = cycleTheme;
  }

  // ============================================================
  // Router
  // ============================================================

  async function route() {
    closeModal();
    if (!state.user) { loginView(); return; }
    if (state.user.must_change_password) { forcePasswordView(); return; }

    const hash = location.hash || '#/';
    const detail = hash.match(/^#\/deelnemer\/(\d+)$/);
    const r = state.user.role;

    try {
      if (detail && (r === 'coach' || r === 'admin')) return await memberDetailView(detail[1]);
      if (r === 'member') {
        if (hash === '#/checkin') return await checkinView();
        if (hash === '#/historie') return await historyView();
        if (hash === '#/profiel') return await profileView();
        return await memberHome();
      }
      if (r === 'coach') {
        if (hash === '#/instellingen') return await settingsView();
        return await coachHome();
      }
      // admin
      if (hash === '#/deelnemers') return await adminMembersView();
      if (hash === '#/coaches') return await adminCoachesView();
      if (hash === '#/instellingen') return await settingsView();
      return await adminHome();
    } catch (err) {
      if (state.user) toast(err.message, true);
    }
  }

  async function boot() {
    try {
      const { user, profile } = await api('/me');
      state.user = user; state.profile = profile;
    } catch { state.user = null; }
    route();
  }

  window.addEventListener('hashchange', route);
  boot();
})();
