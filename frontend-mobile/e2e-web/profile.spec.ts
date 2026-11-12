import { at, button, expect, tab, test, words } from './support/test';
import { fixture, ok } from './support/api';

// Profile: details, settings rows and sign out (specs 37, 48); Task alerts, Help and Change password
// open from it and return (specs 38, 39, 40); This month and My work sections (specs 44, 51).

async function openProfile({ page, open }: { page: import('@playwright/test').Page; open: (o?: { now?: string }) => Promise<void> }) {
  await open({ now: at('06:00') });
  await tab(page, 'Profile').click();
  await expect(page.getByRole('heading', { name: 'My details' })).toBeVisible();
}

test.describe('profile', () => {
  test.beforeEach(openProfile);

  test('details and settings rows', async ({ page }) => {
    await expect(page.getByText(words('Sana Test')).first()).toBeVisible();
    await expect(page.getByText('Cleaning staff')).toBeVisible();
    await expect(page.getByText(words('Example Cleaning Co'))).toBeVisible();
    await expect(page.getByText(words('+92 300 0000000'))).toBeVisible();
    await expect(page.getByText(words('staff@example.test'))).toBeVisible();
    await expect(page.getByText(words('41'))).toBeVisible();
    await expect(page.getByText('March 2026')).toBeVisible();
    await expect(page.getByText('Ask your manager to change these.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Settings and help' })).toBeVisible();
    for (const name of ['Task alerts', 'Change password', 'Help', 'Sign out']) await expect(button(page, name)).toBeVisible();
    await expect(page.getByRole('tab', { name: 'English' }).last()).toBeVisible();
  });

  test('sign out: Cancel keeps the session', async ({ page, api }) => {
    await button(page, 'Sign out').click();
    await expect(page.getByText('Sign out of this phone?')).toBeVisible();
    await expect(page.getByText('You will need your email and password to sign in again.')).toBeVisible();
    await button(page, 'Cancel').click();
    await expect(page.getByText('Sign out of this phone?')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'My details' })).toBeVisible();
    expect(api.callsTo('/common/logout')).toHaveLength(0);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Staff sign in' })).toHaveCount(0);
    await expect(page.getByTestId('day-header-title')).toBeVisible();
  });

  test('sign out: confirm revokes the session and shows sign in', async ({ page, api }) => {
    await button(page, 'Sign out').click();
    await button(page, 'Sign out').click();
    await expect(page.getByRole('heading', { name: 'Staff sign in' })).toBeVisible();
    expect(api.callsTo('/common/logout', 'POST')).toHaveLength(1);
    expect(api.callsTo('/common/logout')[0].body).toEqual({ refreshToken: 'e2e-fixture-refresh' });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Staff sign in' })).toBeVisible();
  });

  test('Task alerts opens from Profile and returns', async ({ page }) => {
    await button(page, 'Task alerts').click();
    await expect(page.getByText('Permissions', { exact: true })).toBeVisible();
    await expect(button(page, 'Retry phone alerts')).toBeVisible();
    await expect(button(page, 'Open settings')).toBeVisible();
    await button(page, 'Back').click();
    await expect(page.getByText('Permissions', { exact: true })).toBeHidden();
    await expect(page.getByRole('heading', { name: 'My details' })).toBeVisible();
  });

  test('Help opens from Profile and returns', async ({ page }) => {
    await button(page, 'Help').click();
    for (const question of ['How to check in', 'How to finish a task', 'The QR will not scan', 'I forgot my password', 'Permissions']) {
      await expect(page.getByRole('heading', { name: question, exact: true })).toBeVisible();
    }
    await button(page, 'Back').click();
    await expect(page.getByRole('heading', { name: 'How to check in' })).toBeHidden();
    await expect(page.getByRole('heading', { name: 'My details' })).toBeVisible();
  });

  test('Change password opens from Profile and returns', async ({ page }) => {
    await button(page, 'Change password').click();
    await expect(page.getByRole('heading', { name: 'Replace your password' })).toBeVisible();
    await expect(page.getByLabel('Current password')).toBeVisible();
    await expect(page.getByLabel('New password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm new password')).toBeVisible();
    await button(page, 'Back').click();
    await expect(page.getByRole('heading', { name: 'Replace your password' })).toBeHidden();
    await expect(page.getByRole('heading', { name: 'My details' })).toBeVisible();
  });

  test('This month shows named totals; My work has no call button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'This month' })).toBeVisible();
    await expect(page.getByText('Shifts attended')).toBeVisible();
    await expect(page.getByText(words('7 of 8 scheduled'))).toBeVisible();
    await expect(page.getByText('Arrived on time')).toBeVisible();
    await expect(page.getByText(words('6 of 7 attended'))).toBeVisible();
    await expect(page.getByText('Tasks submitted')).toBeVisible();
    await expect(page.getByText(words('18 of 20'))).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My work' })).toBeVisible();
    await expect(page.getByText('Assigned location')).toBeVisible();
    await expect(page.getByText(words('Head Office')).first()).toBeVisible();
    await expect(page.getByText(words('1 Example Road'))).toBeVisible();
    await expect(page.getByText('Usual shift')).toBeVisible();
    await expect(page.getByText(words('9:00 AM – 5:00 PM'))).toBeVisible();
    await expect(page.getByText(words('Imran Example'))).toBeVisible();
    await expect(page.getByRole('button', { name: /call|phone/i })).toHaveCount(0);
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await button(page, 'See my history').click();
    await expect(page.getByRole('button', { name: 'Previous month' }).filter({ visible: true }).first()).toBeVisible();
  });
});

// App bug E2E-2 (fix spec to be numbered by the lead; already noted in PROGRESS for spec 53):
// "Joined" takes the UTC month of createdAt, so a join early on 1 March in Karachi reads February.
test('Joined uses the month in the staff member\'s own time zone', async ({ page, api, open }) => {
  const me = fixture('profile-me') as { data: Record<string, unknown> };
  api.on('GET', '/staff/profile/me', ok({ ...me.data, createdAt: '2026-02-28T20:00:00.000Z' }));
  await openProfile({ page, open });
  await expect(page.getByText('March 2026')).toBeVisible();
});

