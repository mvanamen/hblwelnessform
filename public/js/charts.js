/* HerbaForms — lichtgewicht SVG-lijngrafiek met crosshair-tooltip. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  function el(name, attrs) {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function fmtDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]}`;
  }
  function fmtDateLong(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }
  function fmtVal(v, decimals) {
    return v.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  }

  // nette y-ticks (max ~4)
  function ticks(min, max) {
    const span = max - min || 1;
    const rawStep = span / 3;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    let step = mag;
    for (const m of [1, 2, 2.5, 5, 10]) { if (rawStep <= m * mag) { step = m * mag; break; } }
    const out = [];
    for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) out.push(+t.toFixed(6));
    return out;
  }

  function lineChart(container, opts) {
    const { points, colorVar, unit = '', name = '', goal = null, decimals = 1, yMin = null, yMax = null } = opts;
    container.classList.add('chart-box');
    container.textContent = '';

    if (!points || points.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="big-emoji">📈</div>';
      const p = document.createElement('p');
      p.textContent = 'Nog geen metingen — vul je eerste check-in in.';
      empty.appendChild(p);
      container.appendChild(empty);
      return;
    }

    const draw = () => {
      container.querySelectorAll('svg, .chart-tooltip').forEach((n) => n.remove());

      const W = Math.max(280, container.clientWidth || 320);
      const H = 240;
      const pad = { t: 18, r: 16, b: 30, l: 40 };
      const iw = W - pad.l - pad.r;
      const ih = H - pad.t - pad.b;

      const xs = points.map((p) => new Date(p.date + 'T12:00:00').getTime());
      const ys = points.map((p) => p.value);
      let lo = Math.min(...ys), hi = Math.max(...ys);
      if (goal != null) { lo = Math.min(lo, goal); hi = Math.max(hi, goal); }
      const padY = (hi - lo) * 0.15 || Math.max(1, Math.abs(hi) * 0.05);
      lo -= padY; hi += padY;
      if (yMin != null) lo = yMin;
      if (yMax != null) hi = yMax;

      const x0 = Math.min(...xs), x1 = Math.max(...xs);
      const X = (t) => xs.length === 1 ? pad.l + iw / 2 : pad.l + ((t - x0) / (x1 - x0)) * iw;
      const Y = (v) => pad.t + ih - ((v - lo) / (hi - lo)) * ih;

      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img' });
      const title = document.createElementNS(NS, 'title');
      title.textContent = name;
      svg.appendChild(title);

      // gridlines + y-labels
      for (const t of ticks(lo, hi)) {
        const y = Y(t);
        svg.appendChild(el('line', { x1: pad.l, x2: W - pad.r, y1: y, y2: y, stroke: 'var(--chart-grid)', 'stroke-width': 1 }));
        const lbl = el('text', { x: pad.l - 8, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' });
        lbl.textContent = fmtVal(t, decimals);
        svg.appendChild(lbl);
      }

      // x-labels: eerste, midden, laatste
      const idxs = points.length <= 3 ? points.map((_, i) => i)
        : [0, Math.round((points.length - 1) / 2), points.length - 1];
      for (const i of [...new Set(idxs)]) {
        const lbl = el('text', {
          x: X(xs[i]), y: H - 8, 'text-anchor': i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle',
          'font-size': 11, fill: 'var(--ink-3)',
        });
        lbl.textContent = fmtDate(points[i].date);
        svg.appendChild(lbl);
      }

      // doellijn
      if (goal != null) {
        const gy = Y(goal);
        svg.appendChild(el('line', { x1: pad.l, x2: W - pad.r, y1: gy, y2: gy, stroke: 'var(--chart-axis)', 'stroke-width': 1.5 }));
        const gl = el('text', { x: W - pad.r, y: gy - 5, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 650, fill: 'var(--ink-2)' });
        gl.textContent = `doel ${fmtVal(goal, decimals)}`;
        svg.appendChild(gl);
      }

      const color = `var(${colorVar})`;

      if (points.length > 1) {
        const linePath = points.map((p, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(p.value).toFixed(1)}`).join('');
        // area-wash 10%
        const area = `${linePath}L${X(xs[xs.length - 1]).toFixed(1)},${(pad.t + ih).toFixed(1)}L${X(xs[0]).toFixed(1)},${(pad.t + ih).toFixed(1)}Z`;
        svg.appendChild(el('path', { d: area, fill: color, opacity: 0.1 }));
        svg.appendChild(el('path', {
          d: linePath, fill: 'none', stroke: color, 'stroke-width': 2,
          'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        }));
      }

      // eindmarker: 8px dot met surface-ring
      const last = points[points.length - 1];
      const ex = X(xs[xs.length - 1]), ey = Y(last.value);
      svg.appendChild(el('circle', { cx: ex, cy: ey, r: 6, fill: 'var(--surface)' }));
      svg.appendChild(el('circle', { cx: ex, cy: ey, r: 4, fill: color }));

      // direct eindlabel (in tekstinkt, niet de serieskleur)
      const endLbl = el('text', {
        x: Math.min(ex, W - pad.r - 4), y: Math.max(12, ey - 10),
        'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: 'var(--ink)',
      });
      endLbl.textContent = `${fmtVal(last.value, decimals)}${unit ? ' ' + unit : ''}`;
      svg.appendChild(endLbl);

      // ------- hover-laag: crosshair + tooltip -------
      const cross = el('line', { y1: pad.t, y2: pad.t + ih, stroke: 'var(--chart-axis)', 'stroke-width': 1, visibility: 'hidden' });
      svg.appendChild(cross);
      const hoverRing = el('circle', { r: 6, fill: 'var(--surface)', visibility: 'hidden' });
      const hoverDot = el('circle', { r: 4, fill: color, visibility: 'hidden' });
      svg.appendChild(hoverRing);
      svg.appendChild(hoverDot);

      const tip = document.createElement('div');
      tip.className = 'chart-tooltip';
      const tipDate = document.createElement('div'); tipDate.className = 'tt-date';
      const tipRow = document.createElement('div'); tipRow.className = 'tt-row';
      const tipKey = document.createElement('span'); tipKey.className = 'tt-key'; tipKey.style.background = color;
      const tipVal = document.createElement('span'); tipVal.className = 'tt-val';
      const tipName = document.createElement('span'); tipName.className = 'tt-name'; tipName.textContent = name;
      tipRow.append(tipKey, tipVal, tipName);
      tip.append(tipDate, tipRow);
      container.appendChild(tip);

      const hit = el('rect', { x: 0, y: 0, width: W, height: H, fill: 'transparent' });
      svg.appendChild(hit);

      const show = (i) => {
        const px = X(xs[i]), py = Y(points[i].value);
        cross.setAttribute('x1', px); cross.setAttribute('x2', px);
        cross.setAttribute('visibility', 'visible');
        hoverRing.setAttribute('cx', px); hoverRing.setAttribute('cy', py); hoverRing.setAttribute('visibility', 'visible');
        hoverDot.setAttribute('cx', px); hoverDot.setAttribute('cy', py); hoverDot.setAttribute('visibility', 'visible');
        tipDate.textContent = fmtDateLong(points[i].date);
        tipVal.textContent = `${fmtVal(points[i].value, decimals)}${unit ? ' ' + unit : ''}`;
        tip.classList.add('show');
        const rect = container.getBoundingClientRect();
        const scale = rect.width / W;
        let left = px * scale + 12;
        if (left + tip.offsetWidth > rect.width - 8) left = px * scale - tip.offsetWidth - 12;
        tip.style.left = `${Math.max(4, left)}px`;
        tip.style.top = `${Math.max(0, py * scale - tip.offsetHeight - 6)}px`;
      };
      const hide = () => {
        for (const n of [cross, hoverRing, hoverDot]) n.setAttribute('visibility', 'hidden');
        tip.classList.remove('show');
      };

      const nearest = (clientX) => {
        const rect = svg.getBoundingClientRect();
        const mx = ((clientX - rect.left) / rect.width) * W;
        let best = 0, bd = Infinity;
        for (let i = 0; i < xs.length; i++) {
          const d = Math.abs(X(xs[i]) - mx);
          if (d < bd) { bd = d; best = i; }
        }
        return best;
      };
      hit.addEventListener('pointermove', (e) => show(nearest(e.clientX)));
      hit.addEventListener('pointerleave', hide);

      // toetsenbord: pijltjes door de punten
      svg.setAttribute('tabindex', '0');
      let ki = points.length - 1;
      svg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { ki = Math.max(0, ki - 1); show(ki); e.preventDefault(); }
        if (e.key === 'ArrowRight') { ki = Math.min(points.length - 1, ki + 1); show(ki); e.preventDefault(); }
        if (e.key === 'Escape') hide();
      });
      svg.addEventListener('blur', hide);

      container.appendChild(svg);
    };

    draw();
    if (window.ResizeObserver) {
      let w = container.clientWidth;
      const ro = new ResizeObserver(() => {
        if (container.clientWidth !== w && container.isConnected) { w = container.clientWidth; draw(); }
        if (!container.isConnected) ro.disconnect();
      });
      ro.observe(container);
    }
  }

  window.HFCharts = { lineChart, fmtDate, fmtDateLong };
})();
