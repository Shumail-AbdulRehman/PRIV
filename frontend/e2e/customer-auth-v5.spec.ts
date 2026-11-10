import { test, expect, fixture } from './fixtures';
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
test('S42 auth public screens use the flow shell in English and Urdu', async ({ page }) => {
  for (const width of [320, 390, 768, 1366, 1440]) for (const lang of ['en', 'ur']) {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(value => localStorage.setItem('hygene-ops.language', value), lang);
    for (const path of ['/login', '/signup', '/recover-owner-account', '/reset-owner-password', '/verify-owner-email']) {
      await page.goto(path); await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await expect(page.getByLabel('Account type', { exact: true })).toHaveCount(0);
    }
  }
});
test('S42 real rejected login permits a corrected retry', async ({ page }) => {
  await page.goto('/login'); await page.getByLabel('Email', { exact: true }).fill('no-account@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Email or password is incorrect.');
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('no-account@example.invalid');
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
});
test('S42-13 staff unified login reaches app handoff', async ({ page }) => {
  await page.goto('/login'); await page.getByLabel('Email', { exact: true }).fill(fixture.staff.transfer.email);
  await page.getByLabel('Password', { exact: true }).fill(fixture.password); await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your work is in the app' })).toBeVisible(); await page.reload();
  await expect(page.getByRole('heading', { name: 'Your work is in the app' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click(); await expect(page).toHaveURL(/login/);
});
test('S42 login pending prevents repeat submits', async ({ page }) => {
  let posts = 0;
  await page.route('**/api/common/login', async route => { posts++; await new Promise(resolve => setTimeout(resolve, 500)); await route.continue(); });
  await page.goto('/login'); await page.getByLabel('Email', { exact: true }).fill(fixture.users.ownerA.email);
  await page.getByLabel('Password', { exact: true }).fill(fixture.password); await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Signing in…', exact: true })).toBeDisabled();
  await expect(page).toHaveURL(/dashboard/); expect(posts).toBe(1);
});
