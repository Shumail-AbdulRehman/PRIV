// Scoped Spec38 visual verification, not the integrated Spec40 suite.
// Run with backend/node_modules/.bin/tsx from this dependency-complete checkout.
// Both compiled sites and their public Express route run on private loopback ports.
// Configured .invalid contacts/links are fixtures, never release qualification.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const runtime = join(root, '../visual-runtime');
const out = fileURLToPath(new URL('./spec38-final/', import.meta.url));
const backendRequire = createRequire(join(root, 'backend/package.json'));
const frontendRequire = createRequire(join(root, 'frontend/package.json'));
const fixture = {
  VITE_SERVICE_POLICIES_APPROVED: 'true',
  VITE_SERVICE_POLICY_ORIGIN: 'https://policies.example.invalid',
  VITE_SERVICE_TERMS_URL: 'https://policies.example.invalid/terms',
  VITE_SERVICE_PRIVACY_URL: 'https://policies.example.invalid/privacy',
  VITE_SERVICE_EXIT_URL: 'https://policies.example.invalid/exit',
  VITE_ANDROID_DISTRIBUTION_APPROVED: 'true',
  VITE_ANDROID_DOWNLOAD_ORIGIN: 'https://distribution.example.invalid',
  VITE_ANDROID_DOWNLOAD_URL: 'https://distribution.example.invalid/staff.apk',
};

if (process.argv[2] === '--serve') {
  // Never import dotenv from a directory holding a configured application .env.
  process.chdir(runtime);
  assert.equal(process.env.DATABASE_URL, 'postgresql://spec38_fixture@127.0.0.1:65432/spec38_nonexistent');
  const express = backendRequire('express');
  const { customerSupportRouter } = await import(pathToFileURL(join(root, 'backend/src/routes/platformSupport.route.ts')).href);
  const app = express();
  app.use('/api/support', (req, res, next) => {
    res.setHeader('X-Visual-Fixture-Cookie-Present', String(!!req.headers.cookie));
    next();
  }, customerSupportRouter);
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Not a public support route' }));
  app.use(express.static(process.argv[3]));
  app.use((_req, res) => res.sendFile('index.html', { root: process.argv[3] }));
  const server = app.listen(0, '127.0.0.1', () => process.send({ port: server.address().port }));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
} else {
  await mkdir(runtime, { recursive: true });
  await mkdir(out, { recursive: true });
  const { build } = await import(frontendRequire.resolve('vite'));
  const { chromium, expect } = frontendRequire('@playwright/test');
  const source = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const diff = execFileSync('git', ['diff', '--', 'frontend/src/pages/Help', 'frontend/src/i18n/serviceTranslations.ts'], { cwd: root });
  const observations = [], images = [], api = [];
  const servers = [];
  let browser;
  const capture = async (page, name) => {
    await page.evaluate(() => document.fonts.ready);
    const path = join(out, name + '.png');
    await page.screenshot({ path, fullPage: true });
    const bytes = await readFile(path);
    images.push({ name: name + '.png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), sha256: createHash('sha256').update(bytes).digest('hex') });
  };
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    // Babel's existing compiler preset resolves from cwd as well as Vite root.
    process.chdir(join(root, 'frontend'));
    for (const mode of ['unavailable', 'configured-fixture']) {
      for (const key of Object.keys(process.env)) if (key.startsWith('VITE_')) delete process.env[key];
      if (mode === 'configured-fixture') Object.assign(process.env, fixture);
      const buildDir = join(runtime, mode);
      await build({ root: join(root, 'frontend'), configFile: join(root, 'frontend/vite.config.ts'), envDir: false, build: { outDir: buildDir, emptyOutDir: true } });
      const child = spawn(process.execPath, [backendRequire.resolve('tsx/cli'), fileURLToPath(import.meta.url), '--serve', buildDir], {
        cwd: runtime, stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
        env: { PATH: process.env.PATH, NODE_ENV: 'test', DATABASE_URL: 'postgresql://spec38_fixture@127.0.0.1:65432/spec38_nonexistent',
          SUPPORT_CONTACT_VERIFIED: mode === 'configured-fixture' ? 'true' : 'false',
          SUPPORT_CONTACT_EMAIL: mode === 'configured-fixture' ? 'support@example.invalid' : '' },
      });
      servers.push(child);
      const ready = await Promise.race([once(child, 'message'), once(child, 'exit').then(() => { throw new Error('Private public-route server exited before readiness'); })]);
      const origin = `http://127.0.0.1:${ready[0].port}`;
      const response = await fetch(origin + '/api/support/contact');
      assert.equal(response.status, 200);assert.equal(response.headers.get('cache-control'), 'private, no-store');
      const data = (await response.json()).data;
      assert.equal(data.available, mode === 'configured-fixture');
      assert.equal((await fetch(origin + '/api/support/diagnostics')).status, 404);
      api.push({ mode, origin, mount: 'actual customerSupportRouter + getSupportContact; isolated public surface only', data, cacheControl: 'private, no-store', diagnostics: 404, sql: 'not used', externalMail: 'not attempted' });
      for (const width of [1366, 390]) for (const language of ['en', 'ur']) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        await context.addInitScript(lang => localStorage.setItem('hygene-ops.language', lang), language);
        await context.addCookies([{ name: 'visual-public-context', value: 'synthetic', url: origin }]);
        await context.route('**/*', route => {
          const url = new URL(route.request().url());
          return ['file:', 'data:', 'blob:'].includes(url.protocol) || url.origin === origin ? route.continue() : route.abort('blockedbyclient');
        });
        const page = await context.newPage();
        const errors = [], requests = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('request', request => { const path = new URL(request.url()).pathname; if (path.startsWith('/api/')) requests.push(request.method() + ' ' + path); });
        for (const [name, path] of [['help', '/help'], ['information', '/service-information']]) {
          const contact = page.waitForResponse(value => new URL(value.url()).pathname === '/api/support/contact');
          await page.goto(origin + path);
          assert.equal((await contact).headers()['x-visual-fixture-cookie-present'], 'false');
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          if (mode === 'configured-fixture') await expect(page.locator('a[href^="mailto:"]')).toHaveCount(1);
          else await expect(page.getByText(language === 'ur' ? 'مدد کا رابطہ دستیاب نہیں۔ پیغام پہنچانے کے کسی ذریعے کی جانچ مکمل نہیں ہوئی۔' : 'Support contact is unavailable. No delivery channel has been qualified.')).toBeVisible();
          const geometry = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, dir: document.documentElement.dir, headingFont: getComputedStyle(document.querySelector('h1')).fontFamily, languageTargets: [...document.querySelectorAll('.language-choice button')].map(element => element.getBoundingClientRect().height) }));
          assert.equal(geometry.overflow, false);assert.equal(geometry.dir, language === 'ur' ? 'rtl' : 'ltr');
          assert.deepEqual(errors, []);assert(requests.every(request => request === 'GET /api/support/contact'));
          assert(geometry.languageTargets.every(height => height >= (width === 390 ? 48 : 44)));
          await expect(page.locator('.marketing-site')).toHaveCount(0);
          if (name === 'information' && mode === 'configured-fixture') {
            for (const label of language === 'ur' ? ['سروس اور بلنگ کی شرائط', 'رازداری کی معلومات', 'ریکارڈ محفوظ رکھنا اور اکاؤنٹ بند کرنا'] : ['Service and billing terms', 'Privacy information', 'Retention and account closure']) {
              await expect(page.getByRole('link', { name: `${language === 'ur' ? 'منظور شدہ دستاویز پڑھیں' : 'Read approved document'}: ${label}` })).toBeVisible();
            }
          }
          await capture(page, `app-${mode}-${name}-${width}-${language}`);
          if (mode === 'unavailable') {
            const reference = await context.newPage();
            await reference.goto(pathToFileURL(join(root, `design/v5/${name}.html`)).href + `?lang=${language}`);
            await capture(reference, `v5-${name}-${width}-${language}`);await reference.close();
          }
          observations.push({ mode, name, path, width, height: 900, language, ...geometry, errors: [...errors], apiRequests: [...requests], qualification: mode === 'configured-fixture' ? 'synthetic configuration; not legal/mail/device approval' : 'actual configured-unavailable public route' });
        }
        await page.goto(origin + '/help');
        await page.locator('details summary').first().click();
        await expect(page.locator('details').first()).toHaveAttribute('open', '');
        if (mode === 'unavailable') await capture(page, `app-faq-${width}-${language}`);
        await page.getByRole('link', { name: language === 'ur' ? 'معلومات دیکھیں' : 'Review information', exact: true }).click();
        await expect(page).toHaveURL(origin + '/service-information');
        await expect(page.getByRole('main')).toBeFocused();assert.equal(await page.evaluate(() => scrollY), 0);
        await page.getByRole('link', { name: language === 'ur' ? 'مدد اور سروس کی معلومات' : 'Help & service information', exact: true }).click();
        await expect(page.getByRole('main')).toBeFocused();assert.equal(await page.evaluate(() => scrollY), 0);
        await page.getByRole('link', { name: language === 'ur' ? 'مالک کا اکاؤنٹ بحال کریں' : 'Owner account recovery', exact: true }).click();
        await expect(page).toHaveURL(origin + '/recover-owner-account');
        await expect(page.locator('input[name=email]')).toBeVisible();
        await page.goto(origin + '/help#service-android');
        await expect(page.locator('#service-android')).toBeFocused();
        await expect(page.locator('#service-android')).toBeInViewport();
        // A fresh context has no stale cache; the second navigation below tests
        // cached available contact suppression when the original API cannot load.
        if (mode === 'configured-fixture' && width === 390) {
          await page.goto(origin + '/help');await expect(page.locator('a[href^="mailto:"]')).toHaveCount(1);
          let release;const pause = new Promise(resolve => { release = resolve; });
          await page.route('**/api/support/contact', async route => { await pause; await route.continue(); });
          await page.getByRole('link', { name: language === 'ur' ? 'معلومات دیکھیں' : 'Review information', exact: true }).click();
          await expect(page.getByText(language === 'ur' ? 'مدد کا رابطہ لوڈ ہو رہا ہے…' : 'Loading support contact…')).toBeVisible();
          await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
          await capture(page, `app-loading-${language}`);
          release();await expect(page.locator('a[href^="mailto:"]')).toHaveCount(1);await page.unroute('**/api/support/contact');
          await page.route('**/api/support/contact', route => route.abort('failed'));
          await page.getByRole('link', { name: language === 'ur' ? 'مدد اور سروس کی معلومات' : 'Help & service information', exact: true }).click();
          await expect(page.getByRole('alert')).toBeVisible();await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
          await capture(page, `app-stale-network-error-${language}`);
          await page.unroute('**/api/support/contact');
          await page.getByRole('button', { name: language === 'ur' ? 'مدد کا رابطہ دوبارہ لوڈ کریں' : 'Retry support contact', exact: true }).click();
          await expect(page.locator('a[href^="mailto:"]')).toHaveCount(1);
          await capture(page, `app-retry-${language}`);
          observations.push({ mode, width, language, state: 'delayed original response, stale-contact transport abort, actual route retry', qualification: 'explicit network fault; not provider outage proof' });
        }
        assert.deepEqual(errors, []);await context.close();
      }
    }
    const manifest = { source, changedSourceSha256: createHash('sha256').update(diff).digest('hex'), provenance: 'Actual compiled React + actual public Express router/service on isolated loopback. Configured .invalid facts are synthetic. No database, email send, external fetch, signed Android or production qualification.', api, observations, images };
    await writeFile(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log(JSON.stringify({ observations: observations.length, pngs: images.length, result: 'passed', output: out }));
  } finally {
    await browser?.close();
    for (const child of servers) { if (child.exitCode === null) { const stopped = once(child, 'exit');child.kill('SIGTERM');await stopped; } }
  }
}
