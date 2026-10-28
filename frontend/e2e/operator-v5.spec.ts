import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = join(root, 'docs/implementation/v5-operator-evidence');
test.use({ trace: 'off', screenshot: 'off', video: 'off' });

test('actual platform public boundaries match V5 in desktop phone English Urdu without tenant bootstrap', async ({ browser }) => {
  test.setTimeout(120000);
  await mkdir(out, { recursive: true });
  const observations: unknown[] = [];
  for (const width of [1366, 390]) for (const language of ['en', 'ur']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.addInitScript(value => localStorage.setItem('hygene-ops.language', value), language);
    const page = await context.newPage();
    const requests: string[] = [], errors: string[] = [];
    page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) requests.push(new URL(request.url()).pathname); });
    page.on('pageerror', error => errors.push(error.message));
    for (const view of ['login', 'security', 'callback']) {
      await page.goto('/platform/' + view + (view === 'callback' ? '?code=untrusted&state=untrusted#access_token=untrusted' : ''));
      await expect(page.locator('.operator-access h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await page.locator('html').getAttribute('dir')).toBe(language === 'ur' ? 'rtl' : 'ltr');
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
      await expect(page.locator('input, select')).toHaveCount(0);
      if (view === 'callback') {
        await expect(page.getByRole('alert')).toBeVisible();
        await expect(page).toHaveURL(/\/platform\/callback$/);
      } else {
        await expect(page.locator('.operator-provider-state button')).toBeDisabled();
      }
      for (const button of await page.locator('.operator-access button').all()) {
        expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(width === 390 ? 48 : 44);
      }
      await page.screenshot({ path: join(out, `app-${view}-${width}-${language}.png`), animations: 'disabled' });
      await page.screenshot({ path: join(out, `app-${view}-full-${width}-${language}.png`), fullPage: true, animations: 'disabled' });
      const reference = await context.newPage();
      await reference.goto('file://' + join(root, 'design/v5/' + (view === 'security' ? 'operator-security' : 'operator-login') + '.html') + '?lang=' + language);
      await reference.evaluate(() => document.fonts.ready);
      await reference.screenshot({ path: join(out, `v5-${view}-${width}-${language}.png`), animations: 'disabled' });
      await reference.close();
      if (view === 'security') {
        await page.getByRole('button', { name: language === 'ur' ? 'پلیٹ فارم کا سیشن صاف کریں' : 'Clear platform session', exact: true }).click();
        await expect(page.getByRole('status')).toContainText(language === 'ur' ? 'کمپنی کا سیشن برقرار ہے۔' : 'Your company session is unchanged.');
        await page.screenshot({ path: join(out, `app-security-cleared-${width}-${language}.png`), fullPage: true, animations: 'disabled' });
      }
      observations.push({ view, width, height: 900, language, overflow: false, apiRequests: [...requests], errors: [...errors], provenance: 'actual built React routes; no HTTP response replacement; provider intentionally unavailable' });
    }
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
    await context.close();
  }
  await writeFile(join(out, 'render-results.json'), JSON.stringify(observations, null, 2));
});

test('operator language navigation and direct protected paths preserve unavailable identity', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) requests.push(new URL(request.url()).pathname); });
  await page.goto('/platform/login');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#auth-content')).toBeFocused();
  await page.getByRole('button', { name: 'اردو', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1, name: 'پلیٹ فارم آپریٹر کا داخلہ' })).toBeVisible();
  for (const route of ['companies', 'companies/1', 'service', 'audit', 'inquiries', 'unknown']) {
    await page.goto('/platform/' + route);
    await expect(page.locator('.operator-access h1')).toHaveText('پلیٹ فارم آپریٹر کا داخلہ');
    await expect(page.locator('.operator-provider-state button')).toBeDisabled();
    await expect(page.locator('.platform-company-workspace, .platform-service-workspace')).toHaveCount(0);
  }
  expect(requests).toEqual([]);
  await context.close();
});
