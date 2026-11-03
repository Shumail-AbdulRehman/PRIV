import { test, expect } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
const out = join(root, 'docs/implementation/v5-help-evidence');
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
test('V5 public help and information render real support facts at desktop/phone English/Urdu sizes', async ({ browser }) => {
  test.setTimeout(120000);
  await mkdir(out, { recursive: true });
  const results: unknown[] = [];
  for (const width of [1366, 390]) for (const lang of ['en', 'ur']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.addInitScript(value => localStorage.setItem('hygene-ops.language', value), lang);
    const page = await context.newPage();
    const errors: string[] = [], apiRequests: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(`${request.method()} ${new URL(request.url()).pathname}`); });
    for (const [name, path] of [['help', '/help'], ['information', '/service-information']]) {
      const contact = page.waitForResponse(response => response.url().endsWith('/api/support/contact'));
      await page.goto(path);
      expect((await contact).status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByText(lang === 'ur' ? 'مدد کا رابطہ دستیاب نہیں۔ پیغام پہنچانے کے کسی ذریعے کی جانچ مکمل نہیں ہوئی۔' : 'Support contact is unavailable. No delivery channel has been qualified.')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(out, `app-${name}-${width}-${lang}.png`), fullPage: true });
      const geometry = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, dir: document.documentElement.dir, h1Font: getComputedStyle(document.querySelector('h1')!).fontFamily, h1Size: getComputedStyle(document.querySelector('h1')!).fontSize }));
      expect(geometry.overflow).toBe(false); expect(geometry.dir).toBe(lang === 'ur' ? 'rtl' : 'ltr'); expect(errors).toEqual([]);
      expect(apiRequests.every(request => request === 'GET /api/support/contact')).toBe(true);
      await expect(page.locator('.marketing-site')).toHaveCount(0);
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
      results.push({ name, path, width, lang, ...geometry, errors: [...errors], apiRequests: [...apiRequests] });
      const reference = await context.newPage();
      await reference.goto('file://' + join(root, `design/v5/${name}.html`) + `?lang=${lang}`);
      await reference.evaluate(() => document.fonts.ready);
      await reference.screenshot({ path: join(out, `v5-${name}-${width}-${lang}.png`), fullPage: true });
      await reference.close();
      errors.length = 0; apiRequests.length = 0;
    }
    await page.goto('/help');
    const question = page.locator('details').first();
    await question.locator('summary').click(); await expect(question).toHaveAttribute('open', '');
    await expect(question.locator('p')).toBeVisible();
    await page.screenshot({ path: join(out, `app-help-faq-${width}-${lang}.png`), fullPage: true });
    await page.getByRole('link', { name: lang === 'ur' ? 'معلومات دیکھیں' : 'Review information', exact: true }).click();
    await expect(page).toHaveURL(/service-information$/);
    await page.getByRole('link', { name: lang === 'ur' ? 'مدد اور سروس کی معلومات' : 'Help & service information', exact: true }).click();
    await expect(page).toHaveURL(/help$/);
    await page.getByRole('link', { name: lang === 'ur' ? 'مالک کا اکاؤنٹ بحال کریں' : 'Owner account recovery', exact: true }).click();
    await expect(page).toHaveURL(/recover-owner-account$/);
    await expect(page.locator('input[name=email]')).toBeVisible();
    await context.close();
  }
  await writeFile(join(out, 'render-results.json'), JSON.stringify(results, null, 2));
});
test('public support loading and failed-network retry remain honest and usable', async ({ page }) => {
  await mkdir(out, { recursive: true });
  await page.setViewportSize({ width: 390, height: 900 });
  // Delays and forwards the real public response, rather than replacing API facts.
  await page.route('**/api/support/contact', async route => { await new Promise(resolve => setTimeout(resolve, 1000)); await route.continue(); });
  await page.goto('/help');
  await expect(page.getByRole('status')).toHaveText('Loading support contact…');
  await page.screenshot({ path: join(out, 'app-help-loading-390-en.png'), fullPage: true });
  await expect(page.getByRole('status')).toContainText('Support contact is unavailable.');
  await page.unroute('**/api/support/contact');
  // Explicit network fault only; this capture is not a backend outage qualification.
  await page.route('**/api/support/contact', route => route.abort('failed'));
  await page.reload(); await expect(page.getByRole('alert')).toContainText('Support contact could not be loaded.');
  await page.screenshot({ path: join(out, 'app-help-network-error-390-en.png'), fullPage: true });
  await page.unroute('**/api/support/contact');
  const response = page.waitForResponse(value => value.url().endsWith('/api/support/contact'));
  await page.getByRole('button', { name: 'Retry support contact' }).click(); expect((await response).status()).toBe(200);
  await expect(page.getByRole('status')).toContainText('Support contact is unavailable.');
});
