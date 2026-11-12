/* Every screen is a function of the prototype state S. */
const t = (s, v) => { let r = (S.lang === 'ur' && UR[s]) || s; if (v) for (const k in v) r = r.split('{' + k + '}').join(v[k]); return r; };
const ic = (n, s = 22, c = '') => `<svg class="ic ${c}" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const tm = x => `<bdi dir="ltr">${x}</bdi>`;
const win = (a, b) => `<bdi dir="ltr">${a} – ${b}</bdi>`;
const a = (n, v) => `data-a="${n}${v !== undefined ? ':' + v : ''}"`;
const ME = DATA.me;

const ST = {
  todo: { l: 'Not started', box: '' }, doing: { l: 'In progress', box: 'doing', p: 'b' },
  photos: { l: 'Photos needed', box: 'y', i: 'camera', p: 'yw' }, retake: { l: 'Retake photo', box: 'y', i: 'camera', p: 'y' },
  overdue: { l: 'Overdue', box: 'y', i: 'clock', p: 'y' }, sub: { l: 'Submitted', box: 'b', i: 'check', p: 'b' },
  rev: { l: 'Waiting for review', box: 'b', i: 'check', p: 'b' }, ver: { l: 'Verified', box: 'g', i: 'check-check', p: 'g' },
  exc: { l: 'Accepted with exceptions', box: 'g', i: 'check', p: 'g' }, missed: { l: 'Missed', box: 'r', i: 'x', p: 'r' },
};
const box = st => { const m = ST[st]; return `<span class="box ${m.box}">${m.i ? ic(m.i, 18) : ''}</span>`; };
const pill = st => { const m = ST[st]; return m.p ? `<span class="pill ${m.p}">${t(m.l)}</span>` : ''; };
const chev = () => ic('chevron-right', 20, 'flip chev');
const taskRow = (x, act) => `<button class="row" ${act}>${box(x.st)}<span class="body"><span class="t1">${x.area}</span><span class="meta">${pill(x.st)}<span>${win(x.from, x.to)}</span></span></span>${chev()}</button>`;
const isOpen = s => ['todo', 'doing', 'photos', 'retake', 'overdue'].includes(s);
const avatar = s => `<span class="avatar" style="width:${s}px;height:${s}px" aria-hidden="true">${ic('user-round', Math.round(s * .56))}</span>`;
const langPill = () => `<div class="langpill" role="group" aria-label="Language"><button class="${S.lang === 'en' ? 'on' : ''}" ${a('lang', 'en')}>English</button><button class="${S.lang === 'ur' ? 'on' : ''}" ${a('lang', 'ur')}>اردو</button></div>`;
const langSeg = () => `<div class="mini-seg" role="group" aria-label="Language"><button class="${S.lang === 'en' ? 'on' : ''}" ${a('lang', 'en')}>English</button><button class="${S.lang === 'ur' ? 'on' : ''}" ${a('lang', 'ur')}>اردو</button></div>`;
const appTop = title => `<div class="top"><button class="icb" ${a('back')} aria-label="${t('Back')}">${ic('arrow-left', 24, 'flip')}</button><h1>${title}</h1></div>`;
const go = (label, icon, act, cls = '') => `<button class="go ${cls}" ${act}>${icon ? ic(icon, 24) : ''}<span>${label}</span></button>`;
const banner = () => S.offline ? `<div class="banner" role="status">${ic('wifi-off', 20)}<div><strong>${t('Internet needed to continue')}</strong><span>${t('You are seeing the last saved information.')}</span></div></div>` : '';
function dock(cta, hint) {
  if (!cta) return '';
  if (S.offline) return `<div class="dock">${go(t('Internet needed to continue'), 'wifi-off', '', 'line')}</div>`;
  return `<div class="dock">${hint ? `<small>${hint}</small>` : ''}${go(cta.label, cta.icon, cta.act, cta.cls || '')}</div>`;
}

function tabs(cur) {
  const n = S.tasks.filter(x => isOpen(x.st)).length;
  const it = [['day', 'clock', 'My day'], ['tasks', 'list-checks', 'Tasks'], ['history', 'history', 'History'], ['profile', 'user-round', 'Profile']];
  return `<nav class="tabs">${it.map(([k, i, l]) => `<button class="tab ${k === cur ? 'on' : ''}" ${a('tab', k)} ${k === cur ? 'aria-current="page"' : ''}><span class="pip">${ic(i, 23)}</span>${t(l)}${k === 'tasks' && n ? `<span class="badge">${n}</span>` : ''}</button>`).join('')}</nav>`;
}

/* The one sentence and one button that drive the day */
function nowCard() {
  const place = 'Gulberg Plaza', tk = S.tasks, att = S.att;
  const bad = st => tk.find(x => x.st === st);
  const sc = { label: t('Start cleaning'), icon: 'qr-code' };
  switch (att) {
    case 'before': return { tone: 'blue', title: t('Check-in opens at {time}', { time: tm('8:45 AM') }), sub: t('Your shift starts at {time} at {place}.', { time: tm('9:00 AM'), place }) };
    case 'open': return { tone: 'blue', title: t('Check in to start your shift'), sub: t('Take a selfie at {place}. Keep location on.', { place }), cta: { label: t('Check in'), icon: 'camera', act: a('att', 'in') } };
    case 'late': return { tone: 'blue', title: t('You are late. Check in now.'), sub: t('Shift started at {time}. This check-in will be marked late.', { time: tm('9:00 AM') }), cta: { label: t('Check in late'), icon: 'camera', act: a('att', 'in') } };
    case 'out': return { tone: 'ok', title: t('Shift finished'), sub: t('In {in}. Out {out}. Thank you.', { in: tm('8:58 AM'), out: tm('5:04 PM') }) };
    case 'canOut': return { tone: 'blue', title: t('Time to check out'), sub: t('Take a fresh selfie to close your shift.'), cta: { label: t('Check out'), icon: 'log-out', act: a('att', 'out') } };
    case 'missed': return { tone: 'bad', title: t('Check-out is overdue'), sub: t('Your shift ended at {time}. This late check-out stays on your record.', { time: tm('5:00 PM') }), cta: { label: t('Complete check-out'), icon: 'log-out', act: a('att', 'out') } };
    case 'closed': return { tone: 'quiet', title: t('Shift time closed'), sub: t('This shift ended at {time} without a check-in. If this is wrong, tell your manager.', { time: tm('5:00 PM') }) };
    case 'noshift': return { tone: 'quiet', title: t('No shift loaded for today'), sub: t('Pull down to refresh. If it is still missing, ask your manager.') };
    case 'noloc': return { tone: 'quiet', title: t('No location assigned'), sub: t('Ask your manager to give you a location and shift.') };
  }
  if (S.photosOff && bad('doing')) return { tone: 'quiet', rail: 1, title: t('Task photos are unavailable'), sub: t('Results already received are kept. Ask your manager what to do next.') };
  let x;
  if ((x = bad('retake'))) return { tone: 'blue', rail: 1, title: t('Retake a photo: {area}', { area: x.area }), sub: t('One photo needs to be taken again.'), cta: { label: t('Retake photo'), icon: 'camera', act: a('open', x.id) } };
  if ((x = bad('overdue'))) return { tone: 'blue', rail: 1, title: t('Overdue: {area}', { area: x.area }), sub: t('This should have finished by {time}. Finish it now.', { time: tm(x.to) }), cta: { label: t('Take task photos'), icon: 'camera', act: a('open', x.id) } };
  if ((x = bad('doing') || bad('photos'))) return { tone: 'blue', rail: 1, title: t('Cleaning: {area}', { area: x.area }), sub: t('When it is clean, take the task photos.'), cta: { label: t('Take task photos'), icon: 'camera', act: a('open', x.id) } };
  if ((x = bad('todo'))) return { tone: 'blue', rail: 1, title: t('Next: {area}', { area: x.area }), sub: t('{title}. Finish by {time}.', { title: x.title, time: tm(x.to) }), cta: { ...sc, act: a('open', x.id) } };
  if (!tk.length) return { tone: 'blue', rail: 1, title: t('No tasks today'), sub: t('Your manager has not given you work for today.') };
  return { tone: 'blue', rail: 1, title: t('All work submitted'), sub: t('Check-out opens at {time}. Manager review may still be needed.', { time: tm('4:45 PM') }) };
}
const pct = () => { const m = S.now.match(/(\d+):(\d+) (AM|PM)/); let h = +m[1] % 12 + (m[3] === 'PM' ? 12 : 0); return Math.max(0, Math.min(100, ((h + m[2] / 60) - 9) / 8 * 100)); };
function rail() {
  const p = pct();
  return `<div class="rail" aria-label="${t('Shift')}"><div class="track"><div class="fill" style="width:${p}%"></div><div class="dot" style="inset-inline-start:${p}%"></div></div><div class="ends"><bdi dir="ltr">9:00 AM</bdi><bdi dir="ltr">5:00 PM</bdi></div></div>`;
}
const skyTick = '<svg class="tick" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 26l11 11L42 9"/></svg>';

function vDay() {
  if (S.loading) return { bar: 'blue', html: `<div class="scroll bg-w"><section class="sky"><div class="who"><span class="sk" style="width:44px;height:44px;border-radius:50%"></span><div class="hi"><div class="sk" style="height:15px;width:120px"></div><div class="sk" style="height:12px;width:90px;margin-top:8px"></div></div></div><div class="sk" style="height:32px;width:88%;margin-top:22px"></div><div class="sk" style="height:32px;width:60%;margin-top:10px"></div><div class="sk" style="height:15px;width:76%;margin-top:16px"></div></section><section class="sheet-main">${[1, 2, 3, 4].map(() => `<div class="row"><span class="skd" style="width:30px;height:30px"></span><div class="body"><div class="skd" style="height:15px;width:62%"></div><div class="skd" style="height:12px;width:40%;margin-top:9px"></div></div></div>`).join('')}</section></div>${tabs('day')}` };
  const n = nowCard();
  const open = S.tasks.filter(x => isOpen(x.st)).slice(0, 3);
  const doneN = S.tasks.filter(x => !isOpen(x.st)).length;
  const seg = S.tasks.map(x => `<i class="${['ver', 'exc'].includes(x.st) ? 'g' : ['rev', 'sub'].includes(x.st) ? 'b' : ['retake', 'overdue', 'photos'].includes(x.st) ? 'y' : x.st === 'doing' ? 'h' : ''}"></i>`).join('');
  const work = S.tasks.length ? `<section class="sheet-main"><div class="sec-head"><h2>${t("Today's work")}</h2><span>${t('{n} of {t} submitted', { n: doneN, t: S.tasks.length })}</span></div><div class="ticks" aria-hidden="true">${seg}</div>${open.map(x => taskRow(x, a('open', x.id))).join('')}<button class="more" ${a('tab', 'tasks')}>${t('See all tasks')}${ic('arrow-right', 18, 'flip')}</button></section>` : '<section class="sheet-main" style="min-height:40px"></section>';
  return {
    bar: n.tone, html: `${banner()}<div class="scroll bg-w"><section class="sky ${n.tone === 'blue' ? '' : n.tone}">${skyTick}<div class="who"><button ${a('tab', 'profile')} aria-label="${t('Profile')}">${avatar(44)}</button><div class="hi"><strong>${t('Salaam, {name}', { name: ME.first })}</strong><small>${t('Tuesday, 10 November')}</small></div>${langPill()}</div><h1 class="now-title">${n.title}</h1><p class="now-sub">${n.sub}</p>${n.rail ? rail() : ''}</section>${work}</div>${dock(n.cta)}${tabs('day')}`,
  };
}

function vTasks() {
  const g = (l, list) => list.length ? `<div class="dayhead"><b>${t(l)}</b></div>${list.map(x => taskRow(x, a('open', x.id))).join('')}` : '';
  const need = S.tasks.filter(x => ['retake', 'overdue', 'photos', 'doing'].includes(x.st)), todo = S.tasks.filter(x => x.st === 'todo'), done = S.tasks.filter(x => !isOpen(x.st));
  const notIn = ['before', 'open', 'late'].includes(S.att);
  return {
    bar: 'white', html: `${banner()}<div class="scroll bg-w"><h1 class="page-title">${t("Today's work")}</h1><p class="sub pad">${t('{n} of {t} submitted', { n: done.length, t: S.tasks.length })}</p>${notIn ? `<div class="pad" style="margin-top:12px"><div class="note y">${ic('camera', 22)}<div>${t('Check in before starting a task.')}</div></div></div>` : ''}${S.tasks.length ? g('Needs you', need) + g('To do', todo) + g('Done today', done) : empty('list-checks', 'No tasks today', 'Your manager has not given you work for today.')}</div>${notIn && S.att !== 'before' ? dock({ label: t('Check in'), icon: 'camera', act: a('att', 'in') }) : ''}${tabs('tasks')}`,
  };
}
const empty = (i, h, p) => `<div class="moment" style="padding-top:70px"><div class="pulse" style="width:88px;height:88px">${ic(i, 36)}</div><h2 class="big" style="font-size:22px">${t(h)}</h2><p class="sub">${t(p)}</p></div>`;
const task = id => S.tasks.find(x => x.id === +id);

function vTask(r) {
  const x = task(r.id), i = ['todo'].includes(x.st) ? 0 : x.st === 'doing' ? 1 : isOpen(x.st) ? 2 : 4;
  const steps = ['Scan QR', 'Clean', 'Photos', 'Submit'];
  const items = [['toilet', 'Toilet', '2 photos'], ['sink', 'Sink', '1 photo'], ['mirror', 'Mirror', '1 photo'], ['floor', 'Floor', '1 photo'], ['bin', 'Bin', '1 photo']];
  const fxIcon = { toilet: 'toilet', sink: 'bath', mirror: 'rectangle-vertical', floor: 'grid-2x2', bin: 'trash-2' };
  const notIn = ['before', 'open', 'late'].includes(S.att);
  const cta = !isOpen(x.st) ? null : notIn ? { label: t('Check in'), icon: 'camera', act: a('att', 'in') } : S.photosOff && x.st !== 'todo' ? null : x.st === 'todo' ? { label: t('Start cleaning'), icon: 'qr-code', act: a('scan', x.id + ',start') } : { label: t('Take task photos'), icon: 'camera', act: a('scan', x.id + ',photos') };
  return {
    bar: 'white', html: `${banner()}${appTop(t('Task {id}', { id: tm(x.id) }))}<div class="scroll bg-w"><div class="pad" style="padding-top:4px"><h2 class="big">${x.area}</h2><p class="sub">${x.title}</p><p class="sub" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px">${ic('clock', 18)}${win(x.from, x.to)} ${pill(x.st)}</p></div><div class="path">${steps.map((s, n) => `<div class="st ${n < i ? 'done' : n === i ? 'cur' : ''}"><span class="n">${n < i ? ic('check', 18) : n + 1}</span>${t(s)}</div>`).join('')}</div>${notIn ? `<div class="pad" style="margin-top:16px"><div class="note y">${ic('camera', 22)}<div>${t('Check in before starting a task.')}</div></div></div>` : ''}${S.photosOff && x.st !== 'todo' ? `<div class="pad" style="margin-top:16px"><div class="note r">${ic('circle-alert', 22)}<div><strong>${t('Task photos are unavailable')}</strong>${t('Results already received are kept. Ask your manager what to do next.')}</div></div></div>` : ''}${x.note ? `<h3 class="lab">${t('Note from your manager')}</h3><div class="pad"><div class="note b">${ic('message-circle-question-mark', 22)}<div dir="auto">${x.note}</div></div></div>` : ''}<h3 class="lab">${t('What to clean')}</h3>${items.map(([k, n, c]) => `<div class="fx"><span class="tile">${ic(fxIcon[k], 22)}</span><span class="body"><b>${t(n)}</b></span><span class="sub" style="margin:0;font-size:14.5px">${c.split(' ')[0]} ${t(c.split(' ')[1])}</span></div>`).join('')}<div style="height:18px"></div></div>${dock(cta)}`,
  };
}

function qrSvg() {
  let c = ''; const sz = 21, on = (x, y) => { const f = (a, b) => x >= a && x < a + 7 && y >= b && y < b + 7; if (f(0, 0) || f(14, 0) || f(0, 14)) { const i = x < 7 ? x : x - 14, j = y < 7 ? y : y - 14; return i === 0 || i === 6 || j === 0 || j === 6 || (i > 1 && i < 5 && j > 1 && j < 5); } return (x * 7 + y * 13 + x * y) % 3 === 0; };
  for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) if (on(x, y)) c += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  return `<svg viewBox="0 0 21 21" fill="#fff" aria-hidden="true">${c}</svg>`;
}
function vScan(r) {
  const x = task(r.id);
  return {
    bar: 'dark', dark: 1, html: `<div class="cam" ${a('scanned')} role="button" aria-label="${t('Scan the task QR')}"><div class="camtop"><div class="row1"><button class="icbd" ${a('back')} aria-label="${t('Back')}">${ic('arrow-left', 24, 'flip')}</button><span style="flex:1"></span><button class="icbd ${S.torch ? 'on' : ''}" ${a('torch')} aria-label="${t('Light')}">${ic('flashlight', 22)}</button></div><h1 class="camtitle">${t(r.kind === 'photos' ? 'Scan the same QR' : 'Scan the task QR')}</h1><p class="camsub">${t('Find the code for {area}.', { area: x.area })}</p></div><div class="vf"><i></i><i></i><i></i><i></i>${qrSvg()}<div class="scanline"></div></div>${r.busy ? `<div class="busycard" role="status">${ic('loader-circle', 22, 'spin')}${t('Confirming…')}</div>` : ''}</div><div class="cambar"><div class="hint" style="margin:6px 0">${t('Hold the QR inside the frame. It scans by itself.')}</div></div>`,
  };
}

function vCleaning(r) {
  const x = task(r.id);
  return {
    bar: 'white', html: `${appTop(x.area)}<div class="scroll bg-w"><div class="moment" style="padding-top:34px;flex:none"><div class="badgeok">${ic('droplets', 48)}</div><h2 class="big">${t('Cleaning started')}</h2><p class="sub">${t('Started at {time}. Finish by {end}.', { time: tm(S.now), end: tm(x.to) })}</p></div><div class="pad"><div class="note b">${ic('qr-code', 22)}<div>${t('Clean everything on this list. Then scan the same QR to take photos.')}</div></div></div><h3 class="lab">${t('What to clean')}</h3>${[['toilet', 'Toilet'], ['bath', 'Sink'], ['rectangle-vertical', 'Mirror'], ['grid-2x2', 'Floor'], ['trash-2', 'Bin']].map(([i, n]) => `<div class="fx"><span class="tile">${ic(i, 22)}</span><span class="body"><b>${t(n)}</b></span></div>`).join('')}<div style="height:16px"></div></div>${dock({ label: t('Cleaning is finished'), icon: 'qr-code', act: a('scan', x.id + ',photos') })}`,
  };
}

function guide(fx) {
  const g = { sink: '<path d="M30 92h140l-14 46a22 22 0 0 1-21 16H65a22 22 0 0 1-21-16z"/><path d="M100 92V58a16 16 0 0 1 32 0"/><path d="M80 58h40"/>', toilet: '<rect x="52" y="24" width="96" height="46" rx="10"/><path d="M42 84h116c0 40-18 66-58 66S42 124 42 84z"/><path d="M78 150l-6 26h56l-6-26"/>', mirror: '<rect x="44" y="18" width="112" height="164" rx="14"/><path d="M70 58l26-26M84 92l52-52"/>', floor: '<path d="M60 40h80l46 130H14z"/><path d="M100 40v130M38 104h124M50 70h100"/>', bin: '<path d="M46 62h108l-10 110a12 12 0 0 1-12 10H68a12 12 0 0 1-12-10z"/><path d="M36 62h128M78 62V40h44v22"/>', door: '<rect x="50" y="16" width="100" height="170" rx="6"/><circle cx="130" cy="104" r="6"/>' }[fx];
  return `<div class="guide"><svg width="220" height="220" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="9 8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${g}</svg></div>`;
}
function vCapture(r) {
  const P = DATA.photos, p = P[r.i], segs = P.map((q, n) => `<i class="${S.ph[q.key] && S.ph[q.key] !== 'need' ? 'd' : n === r.i ? 'c' : ''}"></i>`).join('');
  return {
    bar: 'dark', dark: 1, html: `<div class="cam tiles">${guide(p.fx)}<div class="camtop"><div class="row1"><button class="icbd" ${a('back')} aria-label="${t('Back')}">${ic('x', 24)}</button><div class="segs" role="img" aria-label="${t('Photo {n} of {t}', { n: r.i + 1, t: P.length })}">${segs}</div><span class="timer" aria-label="${t('Time left')}">${ic('timer', 16)}04:32</span></div><h1 class="camtitle">${t(p.name)}: ${t(p.view)}</h1><p class="camsub">${t(p.ins)}</p></div>${r.busy ? `<div class="busycard" role="status">${ic('loader-circle', 22, 'spin')}${t('Uploading and checking photo…')}</div>` : ''}</div><div class="cambar"><div class="hint">${t('Keep people out of the photo, including in mirrors.')}</div><div class="shoot"><button class="icbd ${S.torch ? 'on' : ''}" ${a('torch')} aria-label="${t('Light')}">${ic('flashlight', 22)}</button><button class="shutter" ${a('shoot')} aria-label="${t('Take photo')}" ${r.busy ? 'aria-busy="true"' : ''}>${ic('camera', 30)}</button><span class="ghostspot"></span></div></div>`,
  };
}

const PS = { ok: ['Done', 'g', 'check'], need: ['Photo needed', '', ''], retake: ['Retake photo', 'y', 'camera'], clean: ['Needs cleaning', 'y', 'droplets'], review: ['Waiting for review', 'b', 'hourglass'], fail: ['Waiting for review', 'b', 'hourglass'], upload: ['Upload again', 'r', 'circle-alert'] };
const fxI = { door: 'door-open', toilet: 'toilet', sink: 'bath', mirror: 'rectangle-vertical', floor: 'grid-2x2', bin: 'trash-2' };
function vPhotos(r) {
  const x = task(r.id), P = DATA.photos, done = P.filter(p => ['ok', 'review', 'fail'].includes(S.ph[p.key])).length;
  const canSubmit = done === P.length;
  const first = P.findIndex(p => !['ok', 'review', 'fail'].includes(S.ph[p.key]));
  const st = S.ph[P[first]?.key];
  const cta = S.photosOff ? null : canSubmit ? { label: t('Submit work'), icon: 'check', act: a('submit', x.id) } : st === 'clean' ? { label: t('Clean, then scan QR'), icon: 'qr-code', act: a('scan', x.id + ',photos') } : st === 'retake' ? { label: t('Retake photo'), icon: 'camera', act: a('capture', x.id + ',' + first) } : st === 'upload' ? { label: t('Upload again'), icon: 'cloud-upload', act: a('capture', x.id + ',' + first) } : { label: t('Next photo'), icon: 'camera', act: a('capture', x.id + ',' + first) };
  return {
    bar: 'white', html: `${banner()}${appTop(t('Task photos'))}<div class="scroll"><div class="prog"><h2 class="big">${x.area}</h2><p class="sub">${t('{n} of {t} photos done', { n: done, t: P.length })}</p><div class="bar"><i style="width:${done / P.length * 100}%"></i></div></div>${S.photosOff ? `<div class="pad" style="margin-top:12px"><div class="note r">${ic('circle-alert', 22)}<div><strong>${t('Task photos are unavailable')}</strong>${t('Results already received are kept. Ask your manager what to do next.')}</div></div></div>` : ''}<div class="blk">${P.map((p, i) => { const s = S.ph[p.key] || 'need', m = PS[s]; return `<button class="fx" ${a('capture', x.id + ',' + i)}><span class="tile">${ic(fxI[p.fx], 22)}</span><span class="body"><b>${t(p.name)}</b><span class="s">${t(p.view)}</span></span><span class="pill ${m[1]}">${m[2] ? ic(m[2], 14) : ''}${t(m[0])}</span></button>`; }).join('')}</div><div style="height:14px"></div></div>${dock(cta, canSubmit ? t('Your work is ready to submit. Manager review may still be needed.') : '')}`,
  };
}

function vReceipt(r) {
  const x = task(r.id), nxt = S.tasks.find(y => y.st === 'todo');
  return {
    bar: 'clear', clear: 1, html: `<div class="scroll"><div class="moment" style="min-height:100%"><div class="badgeok">${ic('check', 54)}</div><h1 class="big">${t('Work submitted')}</h1><p class="sub">${t('Submitted at {time}. Your manager may still review it.', { time: tm(S.now) })}</p><div class="facts"><div class="fact"><span>${t('Task {id}', { id: tm(x.id) })}</span><b>${x.area}</b></div><div class="fact"><span>${t('Photos received')}</span><b><bdi dir="ltr">7 / 7</bdi></b></div><div class="fact"><span>${t('Submitted')}</span><span class="pill b">${t('Yes')}</span></div><div class="fact"><span>${t('Verified')}</span><span class="pill">${t('Not yet')}</span></div></div></div></div><div class="dock" style="background:none;border:0">${nxt ? go(t('Next task'), 'arrow-right', a('finish'), '') : go(t('Back to my day'), 'arrow-right', a('finish'), '')}</div>`,
  };
}

function vLocate() {
  return { bar: 'clear', clear: 1, html: `<div class="top" style="background:none"><button class="icb" ${a('back')} aria-label="${t('Back')}">${ic('arrow-left', 24, 'flip')}</button></div><div class="moment"><div class="pulse">${ic('map-pin', 48)}</div><h1 class="big" role="status">${t('Finding your location…')}</h1><p class="sub">${t('Stay still for a moment.')}</p><p class="sub" style="font-weight:600;color:var(--ink);margin-top:14px" dir="auto">Gulberg Plaza, Lahore</p></div>` };
}
function vSelfie(r) {
  const out = r.mode === 'out';
  return { bar: 'dark', dark: 1, html: `<div class="cam"><div class="face">${ic('user-round', 190)}</div><div class="oval"></div><div class="camtop"><div class="row1"><button class="icbd" ${a('back')} aria-label="${t('Back')}">${ic('x', 24)}</button></div><h1 class="camtitle">${t(out ? 'Check-out selfie' : 'Check-in selfie')}</h1><p class="camsub">${t('Keep your face inside the circle.')}</p></div>${r.busy ? `<div class="busycard" role="status">${ic('loader-circle', 22, 'spin')}${t('Saving your attendance…')}</div>` : ''}</div><div class="cambar"><div class="shoot" style="justify-content:center"><button class="shutter" ${a('selfie')} aria-label="${t('Take selfie')}">${ic('camera', 30)}</button></div></div>` };
}
function vChecked(r) {
  const out = r.mode === 'out', late = S.att === 'late' || r.late;
  return { bar: 'clear', clear: 1, html: `<div class="scroll"><div class="moment" style="min-height:100%"><div class="badgeok ${out ? 'g' : ''}">${ic(out ? 'log-out' : 'check', 52)}</div><h1 class="big">${t(out ? 'Checked out' : 'Checked in')}</h1><p class="sub"><bdi dir="ltr">${S.now}</bdi></p><div style="margin-top:8px">${out ? '' : late ? `<span class="pill y">${t('Late')}</span>` : `<span class="pill g">${t('On time')}</span>`}</div><div class="facts"><div class="fact"><span>${t('Location')}</span><b dir="auto">Gulberg Plaza</b></div><div class="fact"><span>${t('Shift')}</span><b>${win('9:00 AM', '5:00 PM')}</b></div></div></div></div><div class="dock" style="background:none;border:0">${go(t(out ? 'Back to my day' : "See today's work"), 'arrow-right', a('finish'))}</div>` };
}

/* History */
function vHistory() {
  const isTasks = S.hv === 'tasks';
  const seg = `<div class="tabs2" role="tablist"><button role="tab" aria-selected="${isTasks}" class="${isTasks ? 'on' : ''}" ${a('hv', 'tasks')}>${t('Tasks')}</button><button role="tab" aria-selected="${!isTasks}" class="${!isTasks ? 'on' : ''}" ${a('hv', 'att')}>${t('Attendance')}</button></div>`;
  const m = S.hm === 'oct' ? DATA.oct : DATA.nov;
  const mon = `<div class="month"><button ${S.hm === 'oct' ? 'disabled' : a('hm', 'oct')} aria-label="${t('Previous month')}">${ic('chevron-left', 24, 'flip')}</button><b>${t(m.title)}</b><button ${S.hm === 'nov' ? 'disabled' : a('hm', 'nov')} aria-label="${t('Next month')}">${ic('chevron-right', 24, 'flip')}</button></div>`;
  let body;
  if (isTasks) {
    const F = { all: () => 1, ver: x => ['ver', 'exc'].includes(x.st), rev: x => x.st === 'rev', missed: x => x.st === 'missed' }[S.hf];
    const days = DATA.history.map(d => ({ ...d, items: d.items.filter(F) })).filter(d => d.items.length);
    const chips = [['all', 'All'], ['ver', 'Verified'], ['rev', 'Waiting'], ['missed', 'Missed']];
    body = `${mon}<div class="stack" aria-hidden="true"><i style="flex:31;background:var(--ok)"></i><i style="flex:7;background:var(--blue)"></i><i style="flex:4;background:var(--bad)"></i></div><div class="legend"><span><i style="background:var(--ok)"></i>${t('Verified')} <b>31</b></span><span><i style="background:var(--blue)"></i>${t('Waiting')} <b>7</b></span><span><i style="background:var(--bad)"></i>${t('Missed')} <b>4</b></span></div><div class="chips">${chips.map(([k, l]) => `<button class="chip ${S.hf === k ? 'on' : ''}" aria-pressed="${S.hf === k}" ${a('hf', k)}>${t(l)}</button>`).join('')}</div><div class="bg-w" style="padding-bottom:6px">${days.length ? days.map(d => `<div class="dayhead"><b>${t(d.day)}</b><span dir="auto">${d.date}</span></div>${d.items.map(x => taskRow(x, a('htask', x.id))).join('')}`).join('') + `<button class="more" ${a('toast', 'Load earlier tasks')}>${t('Load earlier tasks')}</button>` : empty('history', 'Nothing here yet', 'Try another filter.')}</div>`;
  } else {
    const heads = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="h">${t(d)}</div>`).join('');
    const cells = '<div></div>'.repeat(m.lead) + m.days.map((s, i) => `<div class="d ${s}">${i + 1}</div>`).join('') + (S.hm === 'nov' ? Array.from({ length: 20 }, (_, i) => `<div class="d future">${i + 11}</div>`).join('') : '');
    const lg = [['var(--blue-wash)', 'On time', S.hm === 'nov' ? 7 : 22], ['var(--yellow)', 'Late', S.hm === 'nov' ? 1 : 2], ['var(--bad-wash)', 'Absent', S.hm === 'nov' ? 0 : 1], ['var(--warn-wash)', 'Missed check-out', S.hm === 'nov' ? 0 : 1]];
    body = `${mon}<div class="cal">${heads}${cells}</div><div class="legend" style="padding-top:6px">${lg.map(([c, l, n]) => `<span><i style="background:${c};box-shadow:inset 0 0 0 1px rgba(20,28,48,.14)"></i>${t(l)} <b>${n}</b></span>`).join('')}</div><div class="bg-w" style="padding:6px 0">${DATA.attendance.map((d, i) => `<button class="att" ${a('attday', i)}><span class="body"><b>${t(d.day)}</b><span class="s" dir="auto">${d.date}</span></span><span class="s" style="text-align:end;font-size:14.5px;color:var(--muted)">${tm(d.in)}${d.out ? ` – ${tm(d.out)}` : ''}</span>${d.st === 'late' ? `<span class="pill y">${t('Late')}</span>` : `<span class="pill g">${t('On time')}</span>`}</button>`).join('')}</div>`;
  }
  return { bar: 'canvas', html: `${banner()}<div class="scroll"><h1 class="page-title">${t('History')}</h1>${seg}${body}</div>${tabs('history')}` };
}
const allHist = () => DATA.history.flatMap(d => d.items.map(x => ({ ...x, day: d.day, date: d.date })));
function vHTask(r) {
  const x = allHist().find(y => y.id === +r.id), closed = ['ver', 'exc'].includes(x.st), miss = x.st === 'missed';
  const step = (ok, i, l, v) => `<div class="tl"><span class="box ${ok ? 'b' : 'n'}">${ic(ok ? i : 'minus', 15)}</span><div class="body"><b>${t(l)}</b><span class="s">${v}</span></div></div>`;
  const yn = (v, pc = 'g') => v ? `<span class="pill ${pc}">${t('Yes')}</span>` : `<span class="pill">${t('Not yet')}</span>`;
  return {
    bar: 'white', html: `${appTop(t('Task details'))}<div class="scroll bg-w"><div class="pad" style="padding-top:4px"><h2 class="big">${x.area}</h2><p class="sub">${x.title}</p><p class="sub" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px">${pill(x.st)} <span dir="auto">${t(x.day)}, ${x.date}</span></p></div><h3 class="lab">${t('What happened')}</h3><div class="timeline">${step(1, 'clock', 'Scheduled', win(x.from, x.to))}${step(!!x.started, 'qr-code', 'Started', x.started ? tm(x.started) : t('Not recorded'))}${step(!miss, 'camera', 'Photos received', tm(x.photos))}${step(!!x.sent, 'check', 'Submitted', x.sent ? tm(x.sent) : t('Not done'))}</div><h3 class="lab" style="margin-top:6px">${t('Status')}</h3><div class="states"><div class="fact"><span>${t('Submitted')}</span>${miss ? `<span class="pill r">${t('Not done')}</span>` : yn(1, 'b')}</div><div class="fact"><span>${t('Verified')}</span>${x.st === 'ver' ? `<span class="pill g">${t('Verified')}</span>` : x.st === 'exc' ? `<span class="pill g">${t('Accepted with exceptions')}</span>` : `<span class="pill">${t('Not yet')}</span>`}</div><div class="fact"><span>${t('Review closed')}</span>${closed ? yn(1) : `<span class="pill">${t('Not yet')}</span>`}</div></div><p class="sub pad" style="font-size:15px;margin:14px 0 22px">${t('Submitted means you finished. Verified means your manager or the check confirmed it.')}</p></div>`,
  };
}

/* Profile */
function vProfile() {
  const meter = (l, n, d) => `<div class="meter"><div class="l"><span>${t(l)}</span><b>${t('{n} of {t}', { n, t: d })}</b></div><div class="t"><i style="width:${n / d * 100}%"></i></div></div>`;
  const line = (i, s, v, end = '', act = '') => { const tag = act ? 'button' : 'div'; return `<${tag} class="line" ${act}>${ic(i, 22, 'lead')}<span class="body"><small>${t(s)}</small><b>${v}</b></span>${end}</${tag}>`; };
  const nav = (i, l, end = '', act = '') => `<button class="line" ${act}>${ic(i, 22, 'lead')}<span class="body"><b>${t(l)}</b></span>${end}${chev()}</button>`;
  return {
    bar: 'white', html: `${banner()}<div class="scroll"><div class="prof">${avatar(76)}<div style="min-width:0"><h2 dir="auto">${ME.name}</h2><p class="sub" style="margin-top:0">${t('Cleaning staff')}</p><p class="sub" style="margin-top:0;font-size:15px" dir="auto">${ME.company}</p></div></div>
    <div class="blk" style="margin-top:10px"><h3 class="lab" style="margin:10px 0 2px">${t('This month')}</h3>${meter('Shifts attended', 8, 9)}${meter('Arrived on time', 7, 8)}${meter('Tasks submitted', 38, 42)}<button class="more" ${a('tab', 'history')}>${t('History')}${ic('arrow-right', 18, 'flip')}</button></div>
    <div class="blk"><h3 class="lab" style="margin:10px 0 2px">${t('My work')}</h3>${line('map-pin', 'Assigned location', `<span dir="auto">${ME.location}</span>`)}${line('clock', 'Usual shift', win(ME.shift[0], ME.shift[1]))}${line('user-round', 'Manager', `<span dir="auto">${ME.manager}</span>`, `<a class="callbtn" ${a('toast', 'Call')}>${ic('phone', 17)}${t('Call')}</a>`)}</div>
    <div class="blk"><h3 class="lab" style="margin:10px 0 2px">${t('My details')}</h3>${line('phone', 'Phone', tm(ME.phone))}${line('mail', 'Email', tm(ME.email))}${line('badge-check', 'Staff number', tm(ME.id))}${line('calendar-days', 'Joined', t(ME.since))}<p class="sub pad" style="font-size:14.5px;padding-bottom:10px">${t('Ask your manager to change these.')}</p></div>
    <div class="blk"><h3 class="lab" style="margin:10px 0 2px">${t('Settings and help')}</h3><div class="line">${ic('languages', 22, 'lead')}<span class="body"><b>${t('Language')}</b></span>${langSeg()}</div>${nav('bell', 'Task alerts', `<span class="pill g">${t('On')}</span>`, a('go', 'alerts'))}${nav('lock-keyhole', 'Change password', '', a('go', 'password'))}${nav('circle-question-mark', 'Help', '', a('go', 'help'))}<button class="line" ${a('signout')} style="color:var(--bad)">${ic('log-out', 22)}<span class="body"><b>${t('Sign out')}</b></span></button></div>
    <div class="foot">${t('Version {v}', { v: tm('2.0.0') })}</div></div>${tabs('profile')}`,
  };
}
function vAlerts() {
  const perm = (i, l) => `<div class="line">${ic(i, 22, 'lead')}<span class="body"><b>${t(l)}</b></span><span class="pill g">${t('Allowed')}</span></div>`;
  return { bar: 'white', html: `${appTop(t('Task alerts'))}<div class="scroll"><div class="prog" style="padding-top:2px"><div class="note b">${ic('bell', 22)}<div><strong>${t('Phone alerts registered.')}</strong>${t('Registered does not prove every alert will arrive. Your work always stays in this app.')}</div></div></div><div class="blk"><h3 class="lab" style="margin:10px 0 2px">${t('Permissions')}</h3>${perm('camera', 'Camera')}${perm('map-pin', 'Location')}</div><div style="padding:16px;display:grid;gap:8px">${go(t('Retry phone alerts'), 'refresh-cw', a('toast', 'Phone alerts registered.'), 'line')}${go(t('Open settings'), 'settings', a('toast', 'Open settings'), 'ghost')}</div></div>` };
}
function vHelp() {
  const q = [['How to check in', 'Go to your location. Tap the yellow button. Take a selfie.'], ['How to finish a task', 'Scan the QR. Clean. Scan the same QR. Take every photo. Submit.'], ['The QR will not scan', 'Turn on the light and hold the phone steady. If it still fails, ask your manager.'], ['I forgot my password', 'Ask your manager for a one-use access code.']];
  return { bar: 'white', html: `${appTop(t('Help'))}<div class="scroll bg-w">${q.map(([h, p]) => `<div class="faq"><b>${t(h)}</b><p>${t(p)}</p></div>`).join('')}<div class="pad" style="margin-top:14px"><div class="note b">${ic('user-round', 22)}<div>${t('Ask your manager about your shift, task QR or an access code.')}<div style="margin-top:10px"><a class="callbtn" style="display:inline-flex;background:#fff" ${a('toast', 'Call')}>${ic('phone', 17)}${t('Call')} ${ME.manager}</a></div></div></div></div></div>` };
}
const field = (l, type, ph = '', end = '', cls = '') => `<label class="field ${cls}"><span>${t(l)}</span><div class="box-in"><input type="${type}" placeholder="${ph}" dir="ltr">${end}</div></label>`;
function vPassword() {
  return { bar: 'white', html: `${appTop(t('Change password'))}<div class="login" style="padding-top:10px">${field('Current password', 'password')}${field('New password', 'password')}${field('Confirm new password', 'password')}<p class="sub" style="font-size:15px">${t('Use at least 8 characters. You will sign in again on this phone.')}</p><div class="spacer"></div>${go(t('Save new password'), '', a('back'), 'blue')}</div>` };
}
function vLogin(r) {
  const logo = `<div class="logo"><span class="l"><img src="../assets/mark.svg" alt="">Hygene&nbsp;<span>Ops</span></span>${langSeg()}</div>`;
  if (r.code) return { bar: 'white', html: `<div class="login">${logo}<h1 class="big">${t('Set your new password')}</h1>${field('Access code', 'text')}${field('New password', 'password')}${field('Confirm new password', 'password')}<p class="sub" style="font-size:15px">${t('Enter the code from your manager.')}</p><div class="spacer"></div>${go(t('Save new password'), '', a('login'), 'blue')}${go(t('Back to sign in'), '', a('back'), 'ghost')}</div>` };
  return { bar: 'white', html: `<div class="login">${logo}<h1 class="big">${t('Staff sign in')}</h1>${field('Email', 'email', 'name@company.com', '', r.err ? 'err' : '')}${field('Password', 'password', '', `<button aria-label="${t('Show password')}" style="width:44px;height:44px;display:grid;place-items:center;color:var(--muted)">${ic('eye', 22)}</button>`, r.err ? 'err' : '')}${r.err ? `<p class="err-t" role="alert">${ic('circle-alert', 18)}${t('Email or password is wrong. Check them and try again.')}</p>` : ''}<div class="spacer"></div>${go(t('Sign in'), '', a('login'), 'blue')}${go(t('Use manager access code'), '', a('code'), 'ghost')}<p class="fine">${t('Forgot your password? Ask your manager for a one-use access code.')}</p></div>` };
}

/* Bottom sheets */
function sheetHtml() {
  const s = S.sheet; if (!s) return '';
  const wrap = (cls, g, h, p, acts) => `<div class="scrim" ${a('closeSheet')}><div class="bsheet" role="dialog" aria-modal="true" aria-label="${h}" data-stop><div class="grab"></div><div class="hd"><span class="glyph ${cls}">${ic(g, 26)}</span><div><h2>${h}</h2><p>${p}</p></div></div><div class="acts">${acts}</div></div></div>`;
  switch (s.k) {
    case 'gps': return wrap('', 'map-pin', t('GPS signal is weak'), t('Accuracy is ±{m} m. Move near a window or outdoors, then try again.', { m: tm('86') }), go(t('Try again'), 'refresh-cw', a('retryGps')) + go(t('Continue anyway'), '', a('gpsContinue'), 'ghost'));
    case 'away': return wrap('r', 'map-pin', t('You are not at {place}', { place: 'Gulberg Plaza' }), t('Go to your assigned location, then try again.'), go(t('Try again'), 'refresh-cw', a('retryGps')) + go(t('Cancel'), '', a('cancelAtt'), 'ghost'));
    case 'perm': return wrap('b', 'camera', t('Camera is needed'), t('Allow camera and location in phone settings to mark attendance.'), go(t('Open settings'), 'settings', a('cancelAtt')) + go(t('Cancel'), '', a('cancelAtt'), 'ghost'));
    case 'wrongqr': return wrap('r', 'qr-code', t('This QR is for another task'), t('Find the code for {area}, then scan again.', { area: task(s.id).area }), go(t('Scan again'), 'qr-code', a('closeSheet')));
    case 'retake': return wrap('', 'camera', t('Take this photo again'), t('The whole sink is not in the picture. Step back and show the basin and the tap.'), go(t('Retake photo'), 'camera', a('closeSheet')));
    case 'clean': return wrap('', 'droplets', t('This still needs cleaning'), t('Clean this again. Then scan the task QR to take a new photo.'), go(t('Clean, then scan QR'), 'qr-code', a('afterResult')));
    case 'review': return wrap('b', 'hourglass', t('Waiting for manager review'), t('Your photo is kept. Continue with the next photo.'), go(t('Next photo'), 'camera', a('afterResult')));
    case 'fail': return wrap('b', 'info', t('Photo check could not finish'), t('This does not mean it is dirty. Your photo is kept for your manager.'), go(t('Next photo'), 'camera', a('afterResult')));
    case 'upload': return wrap('r', 'cloud-upload', t('Photo did not upload'), t('Check your internet and upload again. If you close this screen, take a new photo.'), go(t('Upload again'), 'cloud-upload', a('closeSheet')));
    case 'attday': { const d = DATA.attendance[s.i]; return `<div class="scrim" ${a('closeSheet')}><div class="bsheet" role="dialog" aria-modal="true" aria-label="${t(d.day)}" data-stop><div class="grab"></div><h2>${t(d.day)}, <span dir="auto">${d.date}</span></h2><div style="margin-top:6px">${d.st === 'late' ? `<span class="pill y">${t('Late by {n} min', { n: d.lateBy })}</span>` : `<span class="pill g">${t('On time')}</span>`}</div><div class="states" style="margin:14px 0 0"><div class="fact"><span>${t('In')}</span><b>${tm(d.in)}</b></div><div class="fact"><span>${t('Out')}</span><b>${d.out ? tm(d.out) : t('Still on shift')}</b></div><div class="fact"><span>${t('Shift')}</span><b>${win('9:00 AM', '5:00 PM')}</b></div><div class="fact"><span>${t('Location')}</span><b dir="auto">Gulberg Plaza</b></div></div><div class="acts">${go(t('Close'), '', a('closeSheet'), 'line')}</div></div></div>`; }
    case 'signout': return `<div class="dialog"><div role="alertdialog" aria-modal="true" aria-label="${t('Sign out of this phone?')}"><h2>${t('Sign out of this phone?')}</h2><p>${t('You will need your email and password to sign in again.')}</p><div class="acts"><button ${a('closeSheet')}>${t('Cancel')}</button><button class="d" ${a('doSignout')}>${t('Sign out')}</button></div></div></div>`;
  }
  return '';
}

const VIEWS = { login: vLogin, day: vDay, tasks: vTasks, history: vHistory, profile: vProfile, task: vTask, scan: vScan, cleaning: vCleaning, capture: vCapture, photos: vPhotos, receipt: vReceipt, locate: vLocate, selfie: vSelfie, checked: vChecked, htask: vHTask, alerts: vAlerts, help: vHelp, password: vPassword };

function phone() {
  const r = S.route[S.route.length - 1], v = VIEWS[r.n](r);
  const bar = v.bar === 'clear' || v.bar === 'canvas' ? '' : 't-' + v.bar, light = ['blue', 'quiet', 'bad', 'ok'].includes(v.bar) ? 'light' : '';
  const hasTabs = ['day', 'tasks', 'history', 'profile'].includes(r.n);
  return `<div class="phone" dir="${S.lang === 'ur' ? 'rtl' : 'ltr'}" lang="${S.lang}"><div class="sbar ${bar} ${light}"><span>${S.now.replace(/ (AM|PM)/, '')}</span><span class="r"><span class="bat"></span></span></div><div class="screen" data-key="${r.n}">${v.html}${sheetHtml()}${S.toast ? `<div class="snack" role="status">${ic('check', 20)}${t(S.toast)}</div>` : ''}</div><div class="gesture ${v.dark ? 'dark' : v.clear || (r.n === 'history' && 0) ? 'clear' : ''}"><i></i></div></div>`;
}
