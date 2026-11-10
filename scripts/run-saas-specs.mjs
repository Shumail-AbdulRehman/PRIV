#!/usr/bin/env node
// Runs specs-saas-onboarding with parallel `codex exec` workers.
// Each spec gets its own worktree. The runner, not the worker, commits, merges,
// verifies and updates status, so a worker cannot change files it does not own.
//
//   node scripts/run-saas-specs.mjs              run until nothing more can start
//   node scripts/run-saas-specs.mjs --dry-run    show what would start
//   node scripts/run-saas-specs.mjs --max=2      change how many run at once
//   node scripts/run-saas-specs.mjs --allow=16   run a spec normally held for approval
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPECS = path.join(ROOT, 'specs-saas-onboarding');
const PARENT = path.dirname(ROOT);
const LOGS = path.join(PARENT, 'spec-run-logs');
const BRANCH = 'saas-onboarding';
const WORKER_TIMEOUT_MS = 4 * 60 * 60 * 1000;

const arg = (name, fallback) => {
  const hit = process.argv.find(a => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  return hit.includes('=') ? hit.split('=')[1] : true;
};
const MAX = Number(arg('max', 3));
const DRY = arg('dry-run', false) === true;
const ALLOW = new Set(String(arg('allow', '')).split(',').filter(Boolean).map(Number));
// 14 and 16 touch real Paddle. 42 and 43 need an isolated database and real runs.
const HOLD = new Set([14, 16, 42, 43].filter(n => !ALLOW.has(n)));
// --only=14,16 runs just these specs. --build-only: approved specs build and unit-test, never call the live service.
const ONLY = new Set(String(arg('only', '')).split(',').filter(Boolean).map(Number));
const BUILD_ONLY = process.argv.includes('--build-only');
// These can edit the same shared test, so they never share a batch.
const SEPARATE = [[33, 38]];
const SAFE_ENV = { DATABASE_URL: 'postgresql://none:none@127.0.0.1:1/none', DOTENV_CONFIG_PATH: '/dev/null' };

const nn = n => String(n).padStart(2, '0');
const say = text => console.log(`[${new Date().toTimeString().slice(0, 8)}] ${text}`);
fs.mkdirSync(LOGS, { recursive: true });

function git(args, cwd = ROOT) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}\n${r.stderr || r.stdout}`);
  return r.stdout;
}
const gitOk = (args, cwd = ROOT) => spawnSync('git', args, { cwd, encoding: 'utf8' }).status === 0;

function readSpecs() {
  const specs = new Map();
  for (const file of fs.readdirSync(SPECS)) {
    const m = file.match(/^(\d{2})-.*\.md$/);
    if (!m) continue;
    const text = fs.readFileSync(path.join(SPECS, file), 'utf8');
    const line = key => (text.match(new RegExp(`^\\*\\*${key}:\\*\\* (.*)$`, 'm')) ?? [])[1] ?? '';
    specs.set(Number(m[1]), {
      num: Number(m[1]), file, title: text.match(/^# Spec \d+ — (.*)$/m)[1], status: line('Status').trim(),
      tier: line('Model').trim().split(' ')[0],
      deps: [...line('Depends on').matchAll(/\d+/g)].map(x => Number(x[0])),
      owns: [...line('Owns').matchAll(/`([^`]+)`/g)].map(x => x[1]),
    });
  }
  return specs;
}

function nextBatch(specs) {
  const ready = [...specs.values()].filter(s => s.status === 'Not started' && !HOLD.has(s.num) && (!ONLY.size || ONLY.has(s.num)) &&
    s.deps.every(d => specs.get(d)?.status === 'Done')).sort((a, b) => a.num - b.num);
  const batch = [];
  for (const spec of ready) {
    if (batch.length >= MAX) break;
    const clash = SEPARATE.some(g => g.includes(spec.num) && batch.some(b => g.includes(b.num)));
    if (!clash) batch.push(spec);
  }
  return batch;
}

function ensureWorktree(spec) {
  const id = nn(spec.num), wt = path.join(PARENT, `wt-${id}`), branch = `onboarding-${id}`;
  if (!fs.existsSync(wt)) {
    const exists = gitOk(['rev-parse', '--verify', branch]);
    git(['worktree', 'add', wt, ...(exists ? [branch] : ['-b', branch, BRANCH])]);
  }
  for (const app of ['frontend', 'backend']) {
    const link = path.join(wt, app, 'node_modules');
    if (!fs.existsSync(link)) fs.symlinkSync(path.join(ROOT, app, 'node_modules'), link);
  }
  // Pick up everything merged since this worktree was made. Partial work stays.
  const dirty = git(['status', '--porcelain'], wt).split('\n').some(l => l && !isNoise(l.slice(3)));
  if (!dirty) git(['merge', '--no-edit', BRANCH], wt);
  return { wt, branch };
}

const isNoise = p => /(^|\/)node_modules\/?$/.test(p) || p.endsWith('.tsbuildinfo') || /(^|\/)dist\//.test(p);

function prompt(spec) {
  const approved = ALLOW.has(spec.num);
  return `Read docs/CURRENT_CONTEXT.md and specs-saas-onboarding/AGENT-GUIDE.md first.

Implement exactly specs-saas-onboarding/${spec.file} and nothing else. Other agents are working on other specs at the same time. If this folder already has partial work for this spec, continue it.

Rules for this run:
- Change only the files in this spec's Owns, plus the test-only exception in the guide.
- Do NOT run git commit, merge, push or any branch command. A runner commits for you.
- Do NOT change PROGRESS.md or this spec's Status line.
- Skip GitHub issues and pull requests.
- Add a dated Log to the spec with real test counts, and write its inventory fragment.
- Run every command in its Done when list. Tick a box only after it ran and passed.
- Never deploy, run migrations or print secrets.
${approved && spec.num === 43 ? '- HYGENE_E2E_DATABASE_URL is an isolated local PostgreSQL approved for this spec. Use it only for the end-to-end suite and use no other database. BILLING_LIFECYCLE_TEST_DATABASE_URL is a disposable database for the SQL integration test. Never read a .env file. Do NOT call real Paddle.\n- The three bugs from spec 42 were fixed outside the numbered set. Read specs-saas-onboarding/fixes/e2e-bug-fixes.md and include it in your checks.\n- For the clean install: in this folder only, delete the two symlinks frontend/node_modules and backend/node_modules (the links themselves, with rm and no -r, never their targets), then run npm ci in frontend and backend. Install Playwright browsers only if the suite says they are missing.\n- This overrides the spec on one point: do not add numbered follow-up specs or edit README.md or PROGRESS.md. List each finding under a Findings heading in the Log, with what it affects and a recommended fix or the reason to accept it, and treat that as its follow-up. Never change application code or tests. You may fold and remove files in specs-saas-onboarding/inventory/.\n- If the suite rewrites screenshots under docs/implementation, restore them with git checkout -- docs/implementation before finishing.\n- A real payment has not run. The Log must state that plainly. Finish with SPEC_RESULT: DONE when the checks are done and recorded, even if findings exist. Use BLOCKED only if a check could not be run at all.\n' : ''}${approved && spec.num === 42 ? '- The user approved an isolated local PostgreSQL for this spec. HYGENE_E2E_DATABASE_URL is the end-to-end bootstrap and BILLING_LIFECYCLE_TEST_DATABASE_URL is a disposable integration database. Use only those two. Migrations are allowed on them and on the children the suite creates, and nowhere else. Never read a .env file or connect to any other database.\n- Do NOT call real Paddle. The real 4242, 3DS and declined runs need a public webhook destination that does not exist yet. Leave that box unchecked with that reason. That alone is not a blocker.\n- This overrides the spec on one point: do not write new fix specs or edit README.md or PROGRESS.md. For each real application bug, mark the test fixme with a label FIX-n, and list FIX-n, the failing flow and the cause under an App bugs heading in the Log. Leave the fix-spec box unchecked. Never change application code. Finish with SPEC_RESULT: DONE when everything else passes.\n- A failure to start the suite that you cannot resolve is a blocker. Say exactly what failed.\n' : ''}${approved && BUILD_ONLY ? '- Build and unit-test this spec only. Do NOT call real Paddle, run the real script, or use any real database. The user\'s coordinator runs the real command afterwards. Leave every [requires: ...] box unchecked and say so in the Log. This is not a blocker: finish with SPEC_RESULT: DONE when everything else passes.\n' : approved && spec.num < 42 ? '- The user has approved real Paddle sandbox access for this spec, within exactly what the spec says. Reading any application database still needs separate approval: skip that step and say so.\n' : '- Never call real Paddle or use a real database. If this spec needs either, stop and report it as blocked.\n'}
End your final message with exactly one of these as its last line:
SPEC_RESULT: DONE
SPEC_RESULT: BLOCKED <one sentence saying why>`;
}

function runWorker(spec, wt) {
  const id = nn(spec.num), logFile = path.join(LOGS, `spec-${id}.log`), last = path.join(LOGS, `spec-${id}.result.txt`);
  fs.rmSync(last, { force: true });
  // Full access at the user's request. The file, secret and Paddle rules are in the prompt.
  const args = ['exec', '-C', wt, '--dangerously-bypass-approvals-and-sandbox',
    '-c', 'shell_environment_policy.inherit=all', '-c', `model_reasoning_effort="${spec.tier === 'Heavy' ? 'high' : 'medium'}"`, '--color', 'never', '-o', last, prompt(spec)];
  const out = fs.openSync(logFile, 'a');
  say(`Spec ${id} started: ${spec.title}`);
  return new Promise(resolve => {
    const child = spawn('codex', args, { cwd: wt, env: { ...process.env, ...SAFE_ENV }, stdio: ['ignore', out, out] });
    const timer = setTimeout(() => child.kill('SIGTERM'), WORKER_TIMEOUT_MS);
    child.on('close', code => {
      clearTimeout(timer); fs.closeSync(out);
      const text = fs.existsSync(last) ? fs.readFileSync(last, 'utf8').trim() : '';
      const verdict = text.split('\n').filter(Boolean).pop() ?? '';
      if (code === 0 && verdict.startsWith('SPEC_RESULT: DONE')) return resolve({ ok: true });
      resolve({ ok: false, why: verdict.startsWith('SPEC_RESULT: BLOCKED') ? verdict.replace('SPEC_RESULT: ', '') : `Worker exited with code ${code} and no result. See ${logFile}` });
    });
  });
}

/** Commit only allowed paths. Anything else stops this spec for a human to review. */
function commitWorker(spec, { wt, branch }) {
  const changed = git(['status', '--porcelain', '-uall'], wt).split('\n').filter(Boolean)
    .map(l => l.slice(3).split(' -> ').pop().replace(/^"|"$/g, '')).filter(p => !isNoise(p));
  const specPath = `specs-saas-onboarding/${spec.file}`;
  const allowed = p => spec.owns.includes(p) || p === specPath || (spec.num === 42 && p.startsWith('frontend/e2e/')) || (spec.num === 43 && p.startsWith('specs-saas-onboarding/') && !p.endsWith('PROGRESS.md') && !p.endsWith('README.md')) || /\.test\.(ts|tsx|mjs)$/.test(p);
  const bad = changed.filter(p => !allowed(p));
  if (bad.length) return { ok: false, why: `Changed files outside its Owns: ${bad.join(', ')}` };
  if (!changed.some(p => p !== specPath)) return { ok: false, why: 'Reported done but changed no code' };
  git(['add', '-A', '--', ...changed], wt);
  git(['commit', '-m', `feat(onboarding): spec ${nn(spec.num)} ${spec.title}`], wt);
  return { ok: true, branch };
}

function merge(spec, branch) {
  const r = spawnSync('git', ['merge', '--no-ff', '-m', `merge: onboarding spec ${nn(spec.num)}`, branch], { cwd: ROOT, encoding: 'utf8' });
  if (r.status === 0) return true;
  spawnSync('git', ['merge', '--abort'], { cwd: ROOT });
  return false;
}

function verify(label) {
  const log = path.join(LOGS, `verify-${label}.log`);
  fs.writeFileSync(log, '');
  const steps = [['backend', 'npx tsc --noEmit -p tsconfig.json'], ['backend', 'npm test'], ['backend', 'npm run build'],
    ['frontend', 'npx tsc -b --noEmit'], ['frontend', 'npm run lint'], ['frontend', 'npm test'], ['frontend', 'npm run build']];
  for (const [dir, cmd] of steps) {
    const fd = fs.openSync(log, 'a');
    fs.writeSync(fd, `\n=== ${dir}: ${cmd}\n`);
    const r = spawnSync('sh', ['-c', cmd], { cwd: path.join(ROOT, dir), env: { ...process.env, ...SAFE_ENV }, stdio: ['ignore', fd, fd] });
    fs.closeSync(fd);
    if (r.status !== 0) return { ok: false, why: `${dir}: ${cmd} failed. See ${log}` };
  }
  return { ok: true };
}

function setStatus(spec, status, note) {
  const file = path.join(SPECS, spec.file);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^\*\*Status:\*\* .*$/m, `**Status:** ${status}`));
  const tracker = path.join(SPECS, 'PROGRESS.md');
  const lines = fs.readFileSync(tracker, 'utf8').split('\n').map(line => {
    if (!line.startsWith(`| ${nn(spec.num)} |`)) return line;
    const cells = line.split('|');
    cells[3] = ` ${status} `; cells[7] = ` ${note} `;
    return cells.join('|');
  });
  fs.writeFileSync(tracker, lines.join('\n'));
}

function record(specs, status, note) {
  for (const s of specs) setStatus(s, status, note);
  git(['add', 'specs-saas-onboarding']);
  git(['commit', '-m', `chore(onboarding): mark specs ${specs.map(s => nn(s.num)).join(', ')} ${status}`]);
}

function preflight() {
  if (git(['branch', '--show-current']).trim() !== BRANCH) throw new Error(`Switch to ${BRANCH} first.`);
  if (!gitOk(['diff', '--quiet']) || !gitOk(['diff', '--cached', '--quiet'])) throw new Error('Tracked files have uncommitted changes in the main folder. Commit them first.');
}

function report(stopReason) {
  const specs = readSpecs(), all = [...specs.values()], by = s => all.filter(x => x.status === s).map(x => nn(x.num)).join(' ') || 'none';
  const held = all.filter(x => x.status === 'Not started' && HOLD.has(x.num)).map(x => nn(x.num)).join(' ') || 'none';
  const text = `Stopped: ${stopReason}\nDone: ${by('Done')}\nBlocked: ${by('Blocked')}\nHeld for approval: ${held}\nLogs: ${LOGS}\n`;
  console.log(`\n${text}`);
  fs.writeFileSync(path.join(LOGS, 'STATUS.txt'), text);
}

async function main() {
  preflight();
  for (let round = 1; ; round++) {
    const specs = readSpecs(), batch = nextBatch(specs);
    if (!batch.length) return report('nothing else can start');
    if (DRY) { console.log('Would start:', batch.map(s => `${nn(s.num)} ${s.title}`).join(' | ')); return; }
    const jobs = batch.map(spec => ({ spec, ...ensureWorktree(spec) }));
    const results = await Promise.all(jobs.map(j => runWorker(j.spec, j.wt)));

    const merged = [], problems = [];
    jobs.forEach((job, i) => {
      const id = nn(job.spec.num);
      if (!results[i].ok) return problems.push(`Spec ${id}: ${results[i].why}`);
      const done = commitWorker(job.spec, job);
      if (!done.ok) return problems.push(`Spec ${id}: ${done.why}`);
      if (!merge(job.spec, job.branch)) return problems.push(`Spec ${id}: merge conflict. Branch ${job.branch} kept.`);
      say(`Spec ${id} merged`);
      merged.push(job);
    });

    if (merged.length) {
      say(`Verifying ${merged.map(j => nn(j.spec.num)).join(', ')}`);
      const check = verify(`round-${round}-${merged.map(j => nn(j.spec.num)).join('-')}`);
      if (!check.ok) {
        record(merged.map(j => j.spec), 'Blocked', 'Merged but shared verification failed');
        return report(`verification failed. ${check.why}`);
      }
      record(merged.map(j => j.spec), 'Done', 'Run by the spec runner; see spec Log');
      for (const job of merged) {
        git(['worktree', 'remove', '--force', job.wt]);
        git(['branch', '-d', job.branch]);
      }
      say('Verified and marked Done');
    }
    if (problems.length) return report(problems.join(' | '));
  }
}

main().catch(error => { report(`runner error: ${error.message}`); process.exit(1); });
