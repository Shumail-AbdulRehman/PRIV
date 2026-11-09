/* Prototype behaviour only. Never copy this into the application. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const PRICES = { STARTER: { month: 19, year: 190 }, PRO: { month: 49, year: 490 }, ADVANCED: { month: 149, year: 1490 } };
  const CAPS = { STARTER: [1, 3, 1], PRO: [5, 25, 3], ADVANCED: [20, 200, 20] };
  const NAMES = { STARTER: 'Starter', PRO: 'Pro', ADVANCED: 'Enterprise' };
  const SCREENS = {
    login: ['default', 'error', 'limited', 'outage'], signup: ['default', 'duplicate', 'outage', 'session'],
    plan: ['default', 'loading', 'error'], payment: ['loaded', 'loading', 'declined', 'failed', 'processing', 'offline', 'resumed'],
    confirm: ['waiting', 'slow', 'timeout'], ready: ['default'], recovery: ['checking', 'unavailable', 'conflict', 'restricted'],
  };
  const SIZE = { login: 'split', signup: 'split', plan: 'mid', payment: 'wide' };
  const STACK = { plan: 1, payment: 2, recovery: 2, confirm: 3, ready: 3 };
  const WIDTH = { login: '--sheet-split', signup: '--sheet-split', plan: '--sheet-mid', payment: '--sheet-wide' };
  const STEP = { signup: 0, plan: 1, payment: 2, recovery: 2, confirm: 3, ready: 4 };
  const ORDER = ['account', 'plan', 'payment', 'workspace'];
  const app = { screen: 'login', state: 'default', plan: 'PRO', interval: 'month', lang: 'en' };
  const t = k => (app.lang === 'ur' && window.UR[k]) || k;
  const money = n => '$' + n.toFixed(2);

  function translate() {
    document.documentElement.lang = app.lang === 'ur' ? 'ur' : 'en';
    document.documentElement.dir = app.lang === 'ur' ? 'rtl' : 'ltr';
    $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
    $$('[data-t-label]').forEach(el => el.setAttribute('aria-label', t(el.dataset.tLabel)));
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === app.lang)));
  }
  function money_() {
    $$('.plan').forEach(row => {
      const code = row.dataset.plan;
      $('[data-price]', row).textContent = money(PRICES[code][app.interval]);
      $('[data-per]', row).textContent = t(app.interval === 'month' ? 'per month' : 'per year');
      $('input', row).checked = code === app.plan;
    });
    $$('[data-interval]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.interval === app.interval)));
    $$('[data-selected-plan]').forEach(e => e.textContent = t(NAMES[app.plan]));
    $$('[data-selected-price]').forEach(e => e.textContent = money(PRICES[app.plan][app.interval]));
    $$('[data-selected-per]').forEach(e => e.textContent = t(app.interval === 'month' ? 'per month' : 'per year'));
    $$('[data-selected-interval]').forEach(e => e.textContent = t(app.interval === 'month' ? 'Billed monthly' : 'Billed yearly'));
    const [l, s, m] = CAPS[app.plan];
    $$('[data-r-loc]').forEach(e => e.textContent = l); $$('[data-r-staff]').forEach(e => e.textContent = s); $$('[data-r-mgr]').forEach(e => e.textContent = m);
  }
  function render() {
    $$('[data-screen]').forEach(s => { s.hidden = s.dataset.screen !== app.screen; });
    const sheet = $('.sheet');
    if (SIZE[app.screen]) sheet.dataset.size = SIZE[app.screen]; else delete sheet.dataset.size;
    const stack = $('.stack'); stack.dataset.depth = STACK[app.screen] || 0; stack.style.setProperty('--stack-width', `var(${WIDTH[app.screen] || '--sheet-narrow'})`);
    $$('[data-only]').forEach(el => { el.hidden = !el.dataset.only.split(' ').includes(app.screen); });
    const here = $(`[data-screen="${app.screen}"]`);
    $$('[data-state-show]', here).forEach(el => { el.hidden = !el.dataset.stateShow.split(' ').includes(app.state); });
    $$('[data-state-hide]', here).forEach(el => { el.hidden = el.dataset.stateHide.split(' ').includes(app.state); });
    const idx = STEP[app.screen];
    $$('.steps li').forEach(li => {
      const i = ORDER.indexOf(li.dataset.step);
      li.toggleAttribute('data-done', i < idx); li.toggleAttribute('data-now', i === idx);
      if (i === idx) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    const rS = $('#r-screen'), rT = $('#r-state');
    rS.value = app.screen;
    rT.innerHTML = SCREENS[app.screen].map(v => `<option>${v}</option>`).join('');
    rT.value = app.state;
    translate(); money_();
  }
  function go(screen, state) {
    if (!SCREENS[screen]) return;
    app.screen = screen; app.state = state || SCREENS[screen][0];
    if (location.hash !== '#' + screen) history.replaceState(null, '', '#' + screen);
    render();
    window.scrollTo(0, 0);
    if (window.onScreenChange) window.onScreenChange(screen, app.state);
  }
  window.PROTO = { go, app };

  $('#r-screen').innerHTML = Object.keys(SCREENS).map(k => `<option>${k}</option>`).join('');
  $('#r-screen').addEventListener('change', e => go(e.target.value));
  $('#r-state').addEventListener('change', e => { app.state = e.target.value; render(); if (window.onScreenChange) window.onScreenChange(app.screen, app.state); });
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => { app.lang = b.dataset.lang; render(); }));
  $$('[data-interval]').forEach(b => b.addEventListener('click', () => { app.interval = b.dataset.interval; money_(); }));
  $$('.plan input').forEach(i => i.addEventListener('change', () => { app.plan = i.value; money_(); }));
  $$('[data-reveal]').forEach(b => b.addEventListener('click', () => {
    const input = b.parentElement.querySelector('input'), show = input.type === 'password';
    input.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', String(show));
    b.dataset.t = show ? 'Hide' : 'Show'; b.textContent = t(b.dataset.t);
  }));
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch (e) { /* preview */ }
    b.dataset.t = 'Copied'; b.textContent = t('Copied');
    setTimeout(() => { b.dataset.t = 'Copy'; b.textContent = t('Copy'); }, 1500);
  }));
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => go(b.dataset.goto)));
  $$('[data-set-state]').forEach(b => b.addEventListener('click', () => { app.state = b.dataset.setState; render(); }));
  $$('[data-pay]').forEach(b => b.addEventListener('click', () => go('confirm', 'waiting')));
  $$('form[data-next]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    $$('.err', f).forEach(x => x.remove());
    let bad = null;
    $$('input', f).forEach(i => {
      i.removeAttribute('aria-invalid');
      const empty = !i.value.trim(), mail = i.type === 'email' && i.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value), short = i.minLength > 0 && i.value && i.value.length < i.minLength;
      if (empty || mail || short) {
        i.setAttribute('aria-invalid', 'true');
        const p = document.createElement('p'); p.className = 'err';
        p.textContent = t(empty ? 'This field is required.' : mail ? 'Enter a valid email address.' : 'Use at least 8 characters.');
        (i.closest('.field')).append(p); bad = bad || i;
      }
    });
    if (bad) { bad.focus(); return; }
    go(f.dataset.next);
  }));
  window.addEventListener('hashchange', () => go(location.hash.slice(1)));
  go(SCREENS[location.hash.slice(1)] ? location.hash.slice(1) : 'login');
})();
