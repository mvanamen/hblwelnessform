/* GooeyDock — geanimeerde bottom-dock met spring-physics en gooey morph.
   Zelfstandige component: GooeyDock.update(items, activeIndex) / .hide()
   items: [{ href, label, icon (svg-string), badge? }]
   Physics en vormconstantes conform het dock-liquid-prototype (variant 02):
   spring stiffness 150, damping 13; notch depth 26, halfWidth 38. */
(function () {
  'use strict';

  const STIFFNESS = 150;   // spring
  const DAMPING = 13;
  const DEPTH = 26;        // notch-diepte
  const HALF_W = 38;       // notch-halveBreedte in rust
  const TOP = 30;          // ruimte boven de balk voor de bol
  const BAR = 58;          // hoogte tab-rij
  const BUBBLE = 46;

  const root = document.getElementById('dock-root');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  let items = [];
  let active = 0;          // index waar de bol naartoe wil
  let pos = 0, vel = 0;    // physics-toestand (px)
  let target = 0, startPos = 0;
  let raf = null, lastT = 0;
  let centers = [];        // x-middens per tab
  let sig = '';            // items-handtekening voor rebuild-detectie
  let barPath, barEdge, bubble, bubbleIcon, itemRow, svg;
  let pendingIconIdx = null;

  function build() {
    root.innerHTML = `
      <svg class="dock-bar" aria-hidden="true"><path class="dock-fill"/><path class="dock-edge"/></svg>
      <div class="dock-items"></div>
      <div class="dock-bubble"><span class="dock-bubble-icon"></span></div>
      <div class="dock-safe"></div>`;
    svg = root.querySelector('.dock-bar');
    barPath = root.querySelector('.dock-fill');
    barEdge = root.querySelector('.dock-edge');
    bubble = root.querySelector('.dock-bubble');
    bubbleIcon = root.querySelector('.dock-bubble-icon');
    itemRow = root.querySelector('.dock-items');
    itemRow.innerHTML = items.map((it, i) => `
      <a href="${it.href}" data-i="${i}">
        <span class="dock-ic">${it.icon}${it.badge ? '<i class="dock-badge"></i>' : ''}</span>
        <span class="dock-lb">${it.label}</span>
      </a>`).join('');
    measure();
  }

  function measure() {
    const w = root.clientWidth;
    const h = TOP + BAR;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    centers = [...itemRow.children].map((a) => a.offsetLeft + a.offsetWidth / 2);
  }

  // notch-pad: verbreedt (stretch) en trekt scheef (skew) op basis van snelheid
  function notchPath(x, v) {
    const w = root.clientWidth, h = TOP + BAR;
    const stretch = Math.min(Math.abs(v) * 0.045, 34);
    const sk = Math.max(-18, Math.min(18, v * 0.022));
    const hw = HALF_W + stretch;
    const top = `M0 ${TOP} L${(x - hw).toFixed(1)} ${TOP}
      C ${(x - hw * 0.45 + sk).toFixed(1)} ${TOP}, ${(x - hw * 0.5 + sk).toFixed(1)} ${TOP + DEPTH}, ${(x + sk * 0.5).toFixed(1)} ${TOP + DEPTH}
      C ${(x + hw * 0.5 + sk).toFixed(1)} ${TOP + DEPTH}, ${(x + hw * 0.45 + sk).toFixed(1)} ${TOP}, ${(x + hw).toFixed(1)} ${TOP}
      L${w} ${TOP}`;
    barPath.setAttribute('d', `${top} L${w} ${h} L0 ${h} Z`);
    barEdge.setAttribute('d', top);
  }

  function render() {
    notchPath(pos, vel);
    // squash & stretch van de bol, gekoppeld aan snelheid; dip iets mee omlaag
    const sx = 1 + Math.min(Math.abs(vel) * 0.00045, 0.32);
    const sy = 1 - Math.min(Math.abs(vel) * 0.00038, 0.26);
    const dipY = Math.min(Math.abs(vel) * 0.004, 4);
    bubble.style.transform =
      `translate(${(pos - BUBBLE / 2).toFixed(1)}px, ${(TOP - BUBBLE / 2 + 2 + dipY).toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    // icoon wisselt halverwege de beweging met een scale-in
    if (pendingIconIdx != null && Math.abs(target - pos) <= Math.abs(target - startPos) / 2) {
      setBubbleIcon(pendingIconIdx, true);
      pendingIconIdx = null;
    }
  }

  function setBubbleIcon(i, animate) {
    bubbleIcon.innerHTML = items[i] ? items[i].icon : '';
    bubbleIcon.classList.remove('swap');
    if (animate) { void bubbleIcon.offsetWidth; bubbleIcon.classList.add('swap'); }
  }

  function tick(t) {
    const dt = Math.min((t - lastT) / 1000, 1 / 30);
    lastT = t;
    const a = STIFFNESS * (target - pos) - DAMPING * vel;
    vel += a * dt;
    pos += vel * dt;
    if (Math.abs(vel) < 4 && Math.abs(target - pos) < 0.5) {
      pos = target; vel = 0;
      render();
      raf = null;
      return;
    }
    render();
    raf = requestAnimationFrame(tick);
  }

  function goTo(i, instant) {
    target = centers[i] ?? pos;
    if (instant || reduceMotion.matches) {
      pos = target; vel = 0; pendingIconIdx = null;
      setBubbleIcon(i, false);
      render();
      return;
    }
    startPos = pos;
    pendingIconIdx = i;
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); }
  }

  function paintActive() {
    [...itemRow.children].forEach((a, i) => a.classList.toggle('on', i === active));
  }

  function update(newItems, activeIndex, activeColorless) {
    const newSig = JSON.stringify(newItems.map((it) => [it.href, it.label, !!it.badge]));
    const rebuilt = newSig !== sig;
    items = newItems; sig = newSig;
    root.classList.add('on');
    if (rebuilt) {
      build();
      active = Math.max(0, activeIndex);
      goTo(active, true);
      paintActive();
      return;
    }
    measure();
    if (activeIndex >= 0 && activeIndex !== active) {
      active = activeIndex;
      paintActive();
      goTo(active, false);
    } else if (activeIndex >= 0) {
      goTo(active, true);   // her-uitlijnen (bv. na resize)
    }
  }

  function hide() { root.classList.remove('on'); }

  addEventListener('resize', () => {
    if (!root.classList.contains('on') || !itemRow) return;
    measure();
    goTo(active, true);
  });

  window.GooeyDock = { update, hide };
})();
