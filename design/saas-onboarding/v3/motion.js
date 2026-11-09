/* Prototype motion wiring only. The application rebuilds these from the motion table. */
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = null, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };

  function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function enter(section) {
    restart(section, 'enter');
  }
  function segment() {
    const seg = document.querySelector('.segment'); if (!seg) return;
    let thumb = seg.querySelector('.segment-thumb');
    if (!thumb) { thumb = document.createElement('span'); thumb.className = 'segment-thumb'; thumb.setAttribute('aria-hidden', 'true'); seg.prepend(thumb); }
    const on = seg.querySelector('[aria-pressed=true]');
    if (!on || !on.offsetWidth) return;
    const rtl = document.documentElement.dir === 'rtl';
    const left = rtl ? -(seg.clientWidth - on.offsetLeft - on.offsetWidth) : on.offsetLeft;
    thumb.style.width = on.offsetWidth + 'px'; thumb.style.transform = `translateX(${left}px)`;
  }
  function padTicks() {
    const rows = $$('[data-screen=login] .pad-rows li[data-done]');
    if (reduce()) { rows.forEach(r => r.classList.remove('pending')); return; }
    rows.forEach(r => r.classList.add('pending'));
    rows.forEach((r, i) => later(() => r.classList.remove('pending'), 420 + i * 190));
  }
  function frame(state) {
    const f = document.querySelector('.paddle-fixture');
    if (f && state !== 'loading') restart(f, 'reveal-frame');
  }
  function confirmRun(state) {
    if (state !== 'waiting') return;
    const rows = $$('[data-screen=confirm] .progress-list li');
    rows.forEach((r, i) => { r.toggleAttribute('data-done', i === 0); r.toggleAttribute('data-now', i === 1); });
    later(() => { rows[1].removeAttribute('data-now'); rows[1].setAttribute('data-done', ''); rows[2].setAttribute('data-now', ''); }, 1500);
    later(() => { rows[2].removeAttribute('data-now'); rows[2].setAttribute('data-done', ''); }, 2700);
    later(() => window.PROTO.go('ready'), 3300);
  }
  function stamp() {
    const s = document.querySelector('[data-screen=ready]');
    let st = s.querySelector('.stamp');
    if (!st) { st = document.createElement('div'); st.className = 'stamp'; st.setAttribute('aria-hidden', 'true'); st.innerHTML = '<svg viewBox="0 0 40 40"><path d="M9 21l8 8 15-17"/></svg>'; s.prepend(st); }
    const p = st.querySelector('path'); p.style.animation = 'none'; void p.getBoundingClientRect(); p.style.animation = '';
    restart(st, 'go');
  }

  window.onScreenChange = function (screen, state) {
    const moved = screen !== last;
    clear();
    const sheet = document.querySelector('.sheet'), section = document.querySelector(`[data-screen="${screen}"]`);
    if (moved) { if (screen === 'ready') stamp(); restart(sheet, 'sheet-in'); enter(section); }
    if (screen === 'login' && moved) padTicks();
    if (screen === 'payment') frame(state);
    if (screen === 'confirm') confirmRun(state);
    last = screen;
    requestAnimationFrame(segment);
  };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-lang]')) requestAnimationFrame(segment);
    if (e.target.closest('[data-interval]') || e.target.closest('.plan')) {
      requestAnimationFrame(segment);
      $$('[data-price], [data-selected-price], [data-selected-per]').forEach(el => { if (el.offsetParent) restart(el, 'swap'); });
    }
  });
  addEventListener('resize', segment);
})();
