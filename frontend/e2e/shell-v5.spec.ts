import { test, expect, enter, backend } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { Page } from '@playwright/test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = join(root, 'docs/implementation/v5-shell-evidence');
// Synthetic persisted identities, empty credential fields; never save auth state.
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
}

test('V5 shared owner and manager shell matches approved desktop phone English Urdu references', async ({ browser }) => {
  test.setTimeout(120000);
  await mkdir(out, { recursive: true });
  const observations: unknown[] = [];
  for (const who of ['ownerA', 'managerA']) for (const width of [1366, 390]) for (const lang of ['en', 'ur']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await enter(page, '/today-status', who, lang);
    await expect(page.getByRole('heading', { name: lang === 'en' ? 'Team attendance' : 'ٹیم کی حاضری' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.workspace-role strong')).toHaveText('E2E company A');
    await noOverflow(page);
    for (const button of await page.locator('.workspace-topbar .language-choice button').all()) {
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(width === 390 ? 48 : 44);
    }
    await expect(page.locator('.workspace-topbar')).toHaveCSS('min-height', '72px');
    expect((await page.locator('.workspace-topbar').boundingBox())!.height).toBeLessThanOrEqual(73);
    expect(await page.locator('html').getAttribute('dir')).toBe(lang === 'ur' ? 'rtl' : 'ltr');
    const role = who === 'ownerA' ? 'owner' : 'manager';
    const nav = page.getByRole('navigation', { name: lang === 'en' ? 'Workspace navigation' : 'ورک اسپیس نیویگیشن' });
    if (width === 1366) {
      await expect(nav.getByRole('link', { name: lang === 'en' ? 'Today' : 'آج', exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(nav.getByRole('link', { name: lang === 'en' ? 'Plan & billing' : 'پلان اور بلنگ', exact: true })).toHaveCount(who === 'ownerA' ? 1 : 0);
    }
    await page.screenshot({ path: join(out, `app-${role}-${width}-${lang}.png`), animations: 'disabled' });
    const reference = await context.newPage();
    await reference.goto('file://' + join(root, `design/v5/${who === 'ownerA' ? 'owner' : 'manager'}.html`) + '?lang=' + lang);
    await reference.evaluate(() => document.fonts.ready);
    await reference.screenshot({ path: join(out, `v5-${role}-${width}-${lang}.png`), animations: 'disabled' });
    await reference.close();
    if (width === 390) {
      const trigger = page.getByRole('button', { name: lang === 'en' ? 'Open navigation' : 'نیویگیشن کھولیں', exact: true });
      expect((await trigger.boundingBox())!.height).toBeGreaterThanOrEqual(48);
      expect((await trigger.boundingBox())!.width).toBeGreaterThanOrEqual(48);
      await trigger.focus(); await trigger.click();
      const menu = page.getByRole('dialog', { name: lang === 'en' ? 'Workspace menu' : 'ورک اسپیس مینو', exact: true });
      await expect(menu).toBeVisible();
      const box = await menu.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(-1); expect(box!.y).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1); expect(box!.height).toBeGreaterThanOrEqual(899);
      await expect(menu.getByRole('link', { name: lang === 'en' ? 'Plan & billing' : 'پلان اور بلنگ', exact: true })).toHaveCount(who === 'ownerA' ? 1 : 0);
      await page.screenshot({ path: join(out, `app-${role}-menu-${width}-${lang}.png`), animations: 'disabled' });
      await page.keyboard.press('Escape'); await expect(menu).toHaveCount(0); await expect(trigger).toBeFocused();
      await trigger.click();
      await menu.getByRole('link', { name: lang === 'en' ? 'Team' : 'ٹیم', exact: true }).click();
      await expect(page).toHaveURL(/\/staff$/); await expect(menu).toHaveCount(0);
      await noOverflow(page);
    }
    expect(errors).toEqual([]);
    observations.push({ role, width, lang, route: '/today-status', provenance: 'synthetic persisted SQL, actual matching API/React', overflow: false, errors, menu: width === 390 ? 'geometry, role links, Escape focus return and Team navigation passed' : 'desktop current-route sidebar passed' });
    await context.close();
  }
  await writeFile(join(out, 'render-results.json'), JSON.stringify(observations, null, 2));
});

test('shared shell preserves manager owner-route denial staff handoff localized dialogs and not-found recovery', async ({ browser }) => {
  test.setTimeout(90000); await mkdir(out, { recursive: true });
  for (const width of [1366, 390]) for (const lang of ['en', 'ur']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await enter(page, '/settings', 'managerA', lang);
    await expect(page).toHaveURL(/\/dashboard$/);
    expect((await page.request.get(backend + '/api/company/settings')).status()).toBe(403);
    await expect(page.locator('input[name=name]')).toHaveCount(0);
    await page.goto('/account/security');
    await expect(page.locator('input[name=currentPassword]')).toBeVisible();
    await noOverflow(page);
    await page.screenshot({ path: join(out, `app-manager-security-${width}-${lang}.png`), animations: 'disabled' });
    await enter(page, '/staff', 'transfer', lang);
    await expect(page.getByRole('heading', { name: lang === 'en' ? 'Your working day is in the app.' : 'آپ کا کام ایپ میں ہے۔' })).toBeVisible();
    await expect(page.locator('.workspace-sidebar')).toHaveCount(0);
    await expect(page.locator('a.v5-approved-download')).toHaveCount(0);
    expect((await page.locator('.v5-handoff-signout').boundingBox())!.height).toBeGreaterThanOrEqual(width === 390 ? 48 : 44);
    await page.screenshot({ path: join(out, `app-staff-handoff-${width}-${lang}.png`), animations: 'disabled' });
    await noOverflow(page);
    await enter(page, '/staff', 'ownerA', lang);
    await page.getByRole('button', { name: lang === 'en' ? 'Staff access' : 'عملے کی رسائی', exact: true }).first().click();
    const access = page.getByRole('dialog');
    await expect(access).toBeVisible();
    const close = access.getByRole('button', { name: lang === 'en' ? 'Close' : 'بند کریں', exact: true });
    await expect(close).toBeVisible();
    await expect(access).toHaveCSS('opacity', '1');
    await expect(access).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    // Wait for the entry zoom to finish before measuring the hit target.
    await expect.poll(async () => (await close.boundingBox())!.height).toBeGreaterThanOrEqual(width === 390 ? 48 : 44);
    await expect.poll(async () => (await close.boundingBox())!.width).toBeGreaterThanOrEqual(width === 390 ? 48 : 44);
    await page.screenshot({ path: join(out, `app-localized-dialog-${width}-${lang}.png`), animations: 'disabled' });
    await close.click(); await expect(access).toHaveCount(0);
    await enter(page, '/unavailable-shell-acceptance-address', 'ownerA', lang);
    await expect(page.getByRole('heading', { name: lang === 'en' ? 'Page not found' : 'صفحہ نہیں ملا', exact: true })).toBeVisible();
    const recovery = page.getByRole('link', { name: lang === 'en' ? 'Back to workspace' : 'ورک اسپیس میں واپس جائیں', exact: true });
    await expect(recovery).toHaveAttribute('href', '/dashboard');
    await page.screenshot({ path: join(out, `app-not-found-${width}-${lang}.png`), animations: 'disabled' });
    await noOverflow(page);
    await recovery.click(); await expect(page).toHaveURL(/\/dashboard$/);
    await context.close();
  }
});

test('labelled lazy-resource failure keeps route errors safe and reload recovers', async ({ browser }) => {
  test.setTimeout(90000); await mkdir(out, { recursive: true });
  for (const width of [1366, 390]) for (const lang of ['en', 'ur']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await enter(page, '/today-status', 'ownerA', lang);
    await expect(page.locator('.workspace-content h1')).toBeVisible();
    // Explicit frontend resource-failure seam; no HTTP/API response is replaced.
    await page.route('**/assets/ManagersPage-*.js', route => route.abort('failed'));
    await page.goto('/managers');
    await expect(page.getByRole('heading', { name: lang === 'en' ? 'This page is unavailable' : 'یہ صفحہ دستیاب نہیں', exact: true })).toBeVisible();
    await expect(page.getByRole('alert')).not.toContainText(/dynamically imported|\.js|127\.0\.0\.1|TypeError/);
    await noOverflow(page);
    await page.screenshot({ path: join(out, `app-lazy-resource-fault-${width}-${lang}.png`), animations: 'disabled' });
    await page.unroute('**/assets/ManagersPage-*.js');
    await page.getByRole('button', { name: lang === 'en' ? 'Reload page' : 'صفحہ دوبارہ لوڈ کریں', exact: true }).click();
    await expect(page.locator('.workspace-content h1')).toBeVisible();
    await expect(page.getByRole('heading', { name: lang === 'en' ? 'This page is unavailable' : 'یہ صفحہ دستیاب نہیں', exact: true })).toHaveCount(0);
    await context.close();
  }
});
