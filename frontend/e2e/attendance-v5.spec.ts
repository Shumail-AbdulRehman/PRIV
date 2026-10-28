import { test, expect, enter, fixture, backend, sql } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { Page } from '@playwright/test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = join(root, 'docs/implementation/v5-attendance-evidence');
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
async function capture(page: Page, name: string) {
  await mkdir(out, { recursive: true }); await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  const dialog = page.getByRole('dialog').filter({ visible: true });
  if (await dialog.count()) await expect(dialog).toHaveCSS('opacity', '1');
  await page.screenshot({ path: join(out, name + '.png'), animations: 'disabled' });
}

test('V5 attendance register and context render actual records in desktop phone English Urdu', async ({ browser }) => {
  test.setTimeout(150000); const observations: unknown[] = [];
  for (const width of [1366, 390]) for (const lang of ['en', 'ur']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } }); const page = await context.newPage();
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await enter(page, '/attendance', 'ownerA', lang);
    await expect(page.getByText('E2E staff openShift', { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await capture(page, `app-attendance-${width}-${lang}`);
    const ref = await context.newPage(); await ref.goto('file://' + join(root, 'design/v5/attendance.html') + '?lang=' + lang);
    await capture(ref, `v5-attendance-${width}-${lang}`);
    await page.getByRole('button', { name: lang === 'ur' ? 'حاضری کا سیاق' : 'Attendance context', exact: true }).filter({ visible: true }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(lang === 'ur' ? 'اصل محفوظ حقائق' : 'Original captured facts', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('status')).toHaveCount(0);
    await capture(page, `app-context-${width}-${lang}`);
    await ref.goto('file://' + join(root, 'design/v5/attendance-case.html') + '?lang=' + lang); await capture(ref, `v5-context-${width}-${lang}`);
    await dialog.getByRole('button', { name: lang === 'ur' ? 'نوٹ درج کریں' : 'Record note', exact: true }).scrollIntoViewIfNeeded();
    await capture(page, `app-context-form-${width}-${lang}`);
    observations.push({ width, lang, route: '/attendance', overflow: false, errors: [...errors], source: 'Actual API and synthetic SQL; original record and attributable note stay separate. Dialog preserves existing app entry vs reference full-page.' });
    expect(errors).toEqual([]); await context.close();
  }
  await writeFile(join(out, 'render-results.json'), JSON.stringify(observations, null, 2));
});

test('attendance filters use scoped API and empty date results without admitting foreign locations', async ({ page }) => {
  await enter(page, '/attendance', 'managerA');
  await expect(page.locator('.attendance-v5')).toBeVisible();
  const location = page.getByRole('combobox', { name: 'Location', exact: true });
  await expect(location.locator(`option[value="${fixture.site.B}"]`)).toHaveCount(0);
  await location.selectOption(String(fixture.site.A));
  await page.getByLabel('From date', { exact: true }).fill('2090-01-01');
  await page.getByLabel('To date', { exact: true }).fill('2090-01-02');
  const loaded = page.waitForResponse(r => r.url().includes('/api/attendance') && r.request().method() === 'GET' && new URL(r.url()).searchParams.get('from') === '2090-01-01');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  const response = await loaded; expect(response.status()).toBe(200); expect(new URL(response.url()).searchParams.get('locationId')).toBe(String(fixture.site.A));
  await expect(page.locator('.attendance-register').getByText('E2E staff openShift', { exact: true })).toHaveCount(0);
  await expect(page.getByText('No attendance records found for the selected filters.', { exact: true })).toBeVisible();
  await capture(page, 'app-attendance-empty-1366-en');
  const denied = await page.request.get(backend + `/api/attendance?locationId=${fixture.site.foreign}`); expect(denied.status()).toBe(403);
});

test('attendance context actual note and acknowledgement preserve captured facts and history across reload', async ({ page }) => {
  const id = fixture.attendance.legacy;
  const before = await sql('SELECT "checkInTime","checkOutTime",status,"checkInImage" FROM "Attendance" WHERE id=$1', [id]);
  await enter(page, `/staff/${fixture.staff.legacy.id}?tab=attendance`);
  await page.getByRole('button', { name: 'Attendance context', exact: true }).filter({ visible: true }).first().click();
  const dialog = page.getByRole('dialog'); const reason = dialog.getByLabel('Reason (required)');
  await reason.fill('V5 immutable attendance context');
  await dialog.getByRole('button', { name: 'Record note', exact: true }).click();
  await expect(dialog.getByText('Context recorded. Original attendance is unchanged.')).toBeVisible();
  await capture(page, 'app-context-saved-1366-en');
  await dialog.getByRole('button', { name: 'Acknowledge note', exact: true }).last().click();
  await reason.fill('V5 attributable acknowledgement');
  await dialog.getByRole('button', { name: 'Record acknowledgement', exact: true }).click();
  await expect(dialog.getByText('V5 attributable acknowledgement', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Close', exact: true }).first().click(); await page.reload();
  await page.getByRole('button', { name: 'Attendance context', exact: true }).filter({ visible: true }).first().click();
  await expect(dialog.getByText('V5 immutable attendance context', { exact: true })).toBeVisible();
  await expect(dialog.getByText('V5 attributable acknowledgement', { exact: true })).toBeVisible();
  expect(await sql('SELECT "checkInTime","checkOutTime",status,"checkInImage" FROM "Attendance" WHERE id=$1', [id])).toEqual(before);
});

test('attendance context transport error retains draft and exact request retry records once', async ({ page }) => {
  await enter(page, `/staff/${fixture.staff.openShift.id}?tab=attendance`);
  await page.getByRole('button', { name: 'Attendance context', exact: true }).filter({ visible: true }).first().click();
  const dialog = page.getByRole('dialog'); const reason = dialog.getByLabel('Reason (required)');
  await expect(dialog.getByText('No context has been recorded.')).toBeVisible();
  await reason.fill('V5 draft through transport failure');
  await page.route('**/api/attendance/*/annotations', route => route.request().method() === 'POST' ? route.abort('failed') : route.continue());
  await dialog.getByRole('button', { name: 'Record note', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible(); await expect(reason).toHaveValue('V5 draft through transport failure');
  await capture(page, 'app-context-transport-draft-1366-en');
  await page.unroute('**/api/attendance/*/annotations'); await dialog.getByRole('button', { name: 'Retry same request', exact: true }).click();
  await expect(dialog.getByText('Context recorded. Original attendance is unchanged.')).toBeVisible();
  expect((await sql('SELECT COUNT(*)::int AS n FROM "AttendanceAnnotation" WHERE "attendanceId"=$1 AND reason=$2', [fixture.attendance.openShift, 'V5 draft through transport failure']))[0].n).toBe(1);
});
