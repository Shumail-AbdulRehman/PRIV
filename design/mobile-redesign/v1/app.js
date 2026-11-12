/* Prototype state and flows. Nothing here talks to a server. */
let S;
const fresh = (key = 'ready') => {
  const p = DATA.presets[key], set = DATA.sets[p.tasks];
  return { key, lang: S ? S.lang : 'en', offline: false, loading: false, att: p.att, now: p.now, photosOff: !!p.photosOff,
    tasks: set.map((st, i) => ({ ...DATA.base[i], st })), route: [{ n: 'day' }], sheet: null, toast: '', ph: {}, hv: 'tasks', hf: 'all', hm: 'nov', torch: false,
    nextAtt: 'normal', nextScan: 'ok', nextPhoto: 'ok', board: false, menu: false };
};
S = fresh();
const cur = () => S.route[S.route.length - 1];
const push = r => { S.route.push(r); S.sheet = null; };
const replace = r => { S.route[S.route.length - 1] = r; S.sheet = null; };
const home = n => { S.route = [{ n }]; S.sheet = null; };
const later = (ms, f) => setTimeout(() => { f(); draw(); }, ms);
let toastT;
const toast = m => { S.toast = m; clearTimeout(toastT); toastT = setTimeout(() => { S.toast = ''; draw(); }, 2200); };

function locate(mode) {
  const r = { n: 'locate', mode }; if (cur().n === 'locate') replace(r); else push(r); const id = r;
  later(1300, () => {
    if (cur() !== id) return;
    if (S.nextAtt === 'gps') S.sheet = { k: 'gps', mode }; else if (S.nextAtt === 'away') S.sheet = { k: 'away', mode }; else if (S.nextAtt === 'perm') S.sheet = { k: 'perm', mode };
    else replace({ n: 'selfie', mode });
  });
}
const nextIdx = () => DATA.photos.findIndex(p => !['ok', 'review', 'fail'].includes(S.ph[p.key]));
const A = {
  lang: v => { S.lang = v; }, tab: home, back: () => { if (S.route.length > 1) S.route.pop(); S.sheet = null; },
  go: n => push({ n }), open: id => {
    const x = S.tasks.find(y => y.id === +id);
    if (x.st === 'retake') { DATA.photos.forEach((p, i) => { S.ph[p.key] = i < 3 ? 'ok' : i === 3 ? 'retake' : 'need'; }); push({ n: 'photos', id: x.id }); } else if (x.st === 'photos') push({ n: 'photos', id: x.id }); else push({ n: 'task', id: x.id });
  },
  att: v => { if (S.offline) return; locate(v); }, retryGps: () => { const m = S.sheet.mode; S.nextAtt = 'normal'; locate(m); },
  gpsContinue: () => { const m = S.sheet.mode; replace({ n: 'selfie', mode: m }); }, cancelAtt: () => { S.route.pop(); S.sheet = null; },
  selfie: () => { const r = cur(); if (r.busy) return; r.busy = true; const late = S.att === 'late'; later(1100, () => { if (r.mode === 'out') S.att = 'out'; else { S.att = 'in'; } replace({ n: 'checked', mode: r.mode, late }); }); },
  finish: () => home('day'),
  scan: v => { const [id, kind] = v.split(','); push({ n: 'scan', id: +id, kind, auto: true }); autoscan(); },
  scanned: () => doScan(), torch: () => { S.torch = !S.torch; },
  capture: v => { const [id, i] = v.split(','); push({ n: 'capture', id: +id, i: +i }); },
  shoot: () => {
    const r = cur(); if (r.busy) return; r.busy = true; const p = DATA.photos[r.i], out = S.nextPhoto;
    later(1200, () => {
      r.busy = false; S.ph[p.key] = out;
      if (out === 'ok') { toast('Photo accepted'); nextShot(r); } else if (out === 'retake') S.sheet = { k: 'retake' }; else S.sheet = { k: out };
      S.nextPhoto = 'ok';
    });
  },
  afterResult: () => { const r = cur(); S.sheet = null; nextShot(r); },
  submit: id => { const x = S.tasks.find(y => y.id === +id); x.st = 'rev'; replace({ n: 'receipt', id: x.id }); },
  hv: v => { S.hv = v; }, hf: v => { S.hf = v; }, hm: v => { S.hm = v; }, htask: id => push({ n: 'htask', id: +id }),
  attday: i => { S.sheet = { k: 'attday', i: +i }; }, signout: () => { S.sheet = { k: 'signout' }; }, doSignout: () => { S.route = [{ n: 'login' }]; S.sheet = null; },
  closeSheet: () => { S.sheet = null; }, toast: m => toast(m), login: () => home('day'), code: () => push({ n: 'login', code: 1 }),
  preset: k => { const { lang, board } = S; const off = S.offline; S = fresh(k); S.lang = lang; S.offline = off; S.board = false; },
  screen: n => { S.board = false; S.sheet = null; if (['day', 'tasks', 'history', 'profile'].includes(n)) home(n); else if (n === 'login') S.route = [{ n: 'login' }]; else push({ n }); },
  offline: () => { S.offline = !S.offline; }, loading: () => { S.loading = !S.loading; }, board: () => { S.board = !S.board; }, menu: () => { S.menu = !S.menu; },
  nextAtt: v => { S.nextAtt = v; }, nextScan: v => { S.nextScan = v; }, nextPhoto: v => { S.nextPhoto = v; },
  shot: i => { BOARD[+i].set(); S.board = false; },
};
function nextShot(r) {
  const n = nextIdx(); const x = r.id;
  if (n === -1 || r.i === DATA.photos.length - 1) { replace({ n: 'photos', id: x }); return; }
  replace({ n: 'capture', id: x, i: n });
}
function autoscan() { const r = cur(); later(2400, () => { if (cur() === r && r.auto && !S.sheet) doScan(); }); }
function doScan() {
  const r = cur(); if (r.n !== 'scan' || r.busy) return;
  if (S.nextScan === 'wrong') { S.sheet = { k: 'wrongqr', id: r.id }; S.nextScan = 'ok'; r.auto = false; return; }
  r.busy = true; r.auto = false;
  later(800, () => {
    const x = S.tasks.find(y => y.id === r.id);
    if (r.kind === 'start') { x.st = 'doing'; replace({ n: 'cleaning', id: x.id }); }
    else { const i = Math.max(0, nextIdx()); replace({ n: 'capture', id: x.id, i }); }
  });
}

/* Board of every screen. Each entry prepares a state, then the phone is drawn. */
const mk = (k, f) => () => { const lang = S.lang; S = fresh(k); S.lang = lang; if (f) f(); };
const ID = 1041;
const phs = (o) => { DATA.photos.forEach((p, i) => { S.ph[p.key] = o(i); }); };
const BOARD = [
  { g: 'Sign in' }, { l: 'Sign in', set: mk('ready', () => { S.route = [{ n: 'login' }]; }) }, { l: 'Wrong password', set: mk('ready', () => { S.route = [{ n: 'login', err: 1 }]; }) }, { l: 'Manager access code', set: mk('ready', () => { S.route = [{ n: 'login', code: 1 }]; }) },
  { g: 'My day' }, ...Object.entries(DATA.presets).map(([k, p]) => ({ l: p.label, set: mk(k) })), { l: 'No internet', set: mk('next', () => { S.offline = true; }) }, { l: 'Loading', set: mk('next', () => { S.loading = true; }) },
  { g: 'Check in and check out' }, { l: 'Finding location', set: mk('ready', () => push({ n: 'locate', mode: 'in' })) }, { l: 'Weak GPS', set: mk('ready', () => { push({ n: 'locate', mode: 'in' }); S.sheet = { k: 'gps', mode: 'in' }; }) }, { l: 'Wrong place', set: mk('ready', () => { push({ n: 'locate', mode: 'in' }); S.sheet = { k: 'away', mode: 'in' }; }) }, { l: 'Camera not allowed', set: mk('ready', () => { push({ n: 'locate', mode: 'in' }); S.sheet = { k: 'perm', mode: 'in' }; }) }, { l: 'Selfie', set: mk('ready', () => push({ n: 'selfie', mode: 'in' })) }, { l: 'Saving attendance', set: mk('ready', () => push({ n: 'selfie', mode: 'in', busy: 1 })) }, { l: 'Checked in', set: mk('ready', () => push({ n: 'checked', mode: 'in' })) }, { l: 'Checked out', set: mk('out', () => push({ n: 'checked', mode: 'out' })) },
  { g: 'Doing a task' }, { l: 'Tasks', set: mk('retake', () => home('tasks')) }, { l: 'Tasks before check-in', set: mk('ready', () => home('tasks')) }, { l: 'Task details', set: mk('next', () => push({ n: 'task', id: 1042 })) }, { l: 'Scan the QR', set: mk('next', () => push({ n: 'scan', id: 1042, kind: 'start' })) }, { l: 'Wrong QR', set: mk('next', () => { push({ n: 'scan', id: 1042, kind: 'start' }); S.sheet = { k: 'wrongqr', id: 1042 }; }) }, { l: 'Cleaning', set: mk('cleaning', () => push({ n: 'cleaning', id: 1042 })) },
  { g: 'Task photos' }, { l: 'Guided photo', set: mk('cleaning', () => { phs(i => i < 3 ? 'ok' : 'need'); push({ n: 'capture', id: 1042, i: 3 }); }) }, { l: 'Uploading and checking', set: mk('cleaning', () => { phs(i => i < 3 ? 'ok' : 'need'); push({ n: 'capture', id: 1042, i: 3, busy: 1 }); }) }, ...[['retake', 'Retake needed'], ['clean', 'Needs cleaning'], ['review', 'Manager review'], ['fail', 'Check could not finish'], ['upload', 'Upload failed']].map(([k, l]) => ({ l, set: mk('cleaning', () => { phs(i => i < 3 ? 'ok' : 'need'); push({ n: 'capture', id: 1042, i: 3 }); S.sheet = { k }; }) })), { l: 'Photo progress', set: mk('cleaning', () => { phs(i => i < 2 ? 'ok' : i === 2 ? 'review' : i === 3 ? 'retake' : 'need'); push({ n: 'photos', id: 1042 }); }) }, { l: 'Photos unavailable', set: mk('unavailable', () => { phs(i => i < 2 ? 'ok' : 'need'); push({ n: 'photos', id: 1042 }); }) }, { l: 'Ready to submit', set: mk('cleaning', () => { phs(() => 'ok'); push({ n: 'photos', id: 1042 }); }) }, { l: 'Work submitted', set: mk('cleaning', () => push({ n: 'receipt', id: 1042 })) },
  { g: 'History (new)' }, { l: 'Task history', set: mk('next', () => home('history')) }, { l: 'Finished task', set: mk('next', () => { home('history'); push({ n: 'htask', id: 1995 }); }) }, { l: 'Waiting for review', set: mk('next', () => { home('history'); push({ n: 'htask', id: 1996 }); }) }, { l: 'Missed task', set: mk('next', () => { home('history'); push({ n: 'htask', id: 1980 }); }) }, { l: 'Attendance history', set: mk('next', () => { home('history'); S.hv = 'att'; }) }, { l: 'Attendance day', set: mk('next', () => { home('history'); S.hv = 'att'; S.sheet = { k: 'attday', i: 5 }; }) },
  { g: 'Profile (new)' }, { l: 'Profile', set: mk('next', () => home('profile')) }, { l: 'Task alerts', set: mk('next', () => { home('profile'); push({ n: 'alerts' }); }) }, { l: 'Help', set: mk('next', () => { home('profile'); push({ n: 'help' }); }) }, { l: 'Change password', set: mk('next', () => { home('profile'); push({ n: 'password' }); }) }, { l: 'Sign out', set: mk('next', () => { home('profile'); S.sheet = { k: 'signout' }; }) },
];

function shell() {
  const pick = (act, v, l, on) => `<button class="pick ${on ? 'on' : ''}" data-a="${act}:${v}">${l}</button>`;
  const r = cur();
  const seg = (act, cur_, o) => `<div class="seg">${o.map(([v, l]) => `<button class="${cur_ === v ? 'on' : ''}" data-a="${act}:${v}">${l}</button>`).join('')}</div>`;
  return `<aside class="shell ${S.menu ? 'open' : ''}"><div class="shell-brand"><img src="../assets/mark.svg" alt=""><h1>Staff app design</h1></div><p>Tap inside the phone. It works like the real app.</p>
  <h2>Language</h2>${seg('lang', S.lang, [['en', 'English'], ['ur', 'اردو']])}
  <h2>View</h2>${seg('board', S.board ? 'all' : 'one', [['one', 'One phone'], ['all', 'All screens']]).replace(/data-a="board:one"/, S.board ? 'data-a="board"' : '').replace(/data-a="board:all"/, S.board ? '' : 'data-a="board"')}
  <h2>Go to</h2>${[['day', 'My day'], ['tasks', 'Tasks'], ['history', 'History'], ['profile', 'Profile'], ['login', 'Sign in']].map(([v, l]) => pick('screen', v, l, r.n === v && !S.board)).join('')}
  <h2>Moment in the day</h2>${Object.entries(DATA.presets).map(([k, p]) => pick('preset', k, p.label, S.key === k)).join('')}
  <h2>Try a problem</h2><label class="toggle"><input type="checkbox" ${S.offline ? 'checked' : ''} data-a="offline"> No internet</label>
  <p style="margin:6px 0 4px">Next check-in</p>${seg('nextAtt', S.nextAtt, [['normal', 'Works'], ['gps', 'Weak'], ['away', 'Far'], ['perm', 'No cam']])}
  <p style="margin:10px 0 4px">Next QR scan</p>${seg('nextScan', S.nextScan, [['ok', 'Correct'], ['wrong', 'Wrong QR']])}
  <p style="margin:10px 0 4px">Next photo</p>${seg('nextPhoto', S.nextPhoto, [['ok', 'Good'], ['retake', 'Retake'], ['clean', 'Dirty']])}<div style="height:6px"></div>${seg('nextPhoto', S.nextPhoto, [['review', 'Review'], ['fail', 'Check fail'], ['upload', 'No upload']])}
  </aside><button class="menubtn" data-a="menu">Design menu</button>`;
}
function board() {
  const save = S;
  let html = '', i = 0;
  BOARD.forEach((b, n) => {
    if (b.g) { html += `<h2 class="boardhead">${b.g}</h2>`; return; }
    S = { ...fresh(save.key), lang: save.lang }; b.set();
    html += `<button class="card" data-a="shot:${n}"><div class="mini">${phone()}</div>${b.l}</button>`; i++;
  });
  S = save;
  return `<div class="board">${html}</div>`;
}
function draw() {
  const scrollEl = document.querySelector('.phone .scroll'), key = document.querySelector('.phone .screen')?.dataset.key, y = scrollEl ? scrollEl.scrollTop : 0;
  const shellY = document.querySelector('.shell')?.scrollTop || 0, pageY = window.scrollY;
  document.getElementById('stage').innerHTML = shell() + (S.board ? board() : `<main class="stagebox">${phone()}</main>`);
  document.documentElement.lang = S.lang;
  const sh = document.querySelector('.shell'); if (sh) sh.scrollTop = shellY;
  if (S.board) window.scrollTo(0, pageY);
  const ns = document.querySelector('.phone .scroll'); if (ns && key === document.querySelector('.phone .screen')?.dataset.key) ns.scrollTop = y;
}
document.addEventListener('click', e => {
  const stop = e.target.closest('[data-stop]'), el = e.target.closest('[data-a]');
  if (!el) return;
  if (stop && !stop.contains(el)) return;
  if (stop && el.classList.contains('scrim')) return;
  const [n, ...rest] = el.dataset.a.split(':'); const v = rest.join(':');
  if (A[n]) { A[n](v); draw(); }
});
(function init() {
  const q = new URLSearchParams(location.search);
  if (q.get('lang')) S.lang = q.get('lang');
  if (q.get('shot')) { const b = BOARD.filter(x => !x.g).find(x => x.l === q.get('shot')); if (b) b.set(); }
  if (q.get('board')) S.board = true;
  draw();
})();
