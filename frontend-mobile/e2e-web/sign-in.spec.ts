import { at, button, expect, test, words } from './support/test';
import { fixture } from './support/api';

// Sign in, wrong password and the manager access code form (specs 22, 27, 28).

test.beforeEach(async ({ page, open }) => {
  await open({ signedIn: false, now: at('04:05') });
  await expect(page.getByRole('heading', { name: 'Staff sign in' })).toBeVisible();
});

test('empty fields: the error shows inline and nothing is sent', async ({ page, api }) => {
  await button(page, 'Sign in').click();
  await expect(page.getByText('Email and password are both required.')).toBeVisible();
  expect(api.callsTo('/staff/staff-login')).toHaveLength(0);
});

test('wrong password: the server message shows under the password, and the form stays', async ({ page, api }) => {
  api.on('POST', '/staff/staff-login', { status: 401, body: fixture('login-wrong-password') });
  await page.getByLabel('Email', { exact: true }).fill('staff@example.test');
  await page.getByLabel('Password', { exact: true }).fill('not-the-password');
  await button(page, 'Sign in').click();
  await expect(page.getByText('Invalid email or password')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Staff sign in' })).toBeVisible();
  expect(api.callsTo('/staff/staff-login', 'POST')[0].body).toEqual({ email: 'staff@example.test', password: 'not-the-password' });
});

test('right password: lands on My day', async ({ page, api }) => {
  await page.getByLabel('Email', { exact: true }).fill('staff@example.test');
  await page.getByLabel('Password', { exact: true }).fill('fixture-password');
  await page.getByLabel('Password', { exact: true }).press('Enter');
  await expect(page.getByTestId('day-header-title')).toHaveText(words('Check in to start your shift'));
  expect(api.callsTo('/common/get-current-user').length).toBeGreaterThan(0);
});

test('manager access code: the form opens and returns', async ({ page }) => {
  await button(page, 'Use manager access code').click();
  await expect(page.getByRole('heading', { name: 'Set your new password' })).toBeVisible();
  await expect(page.getByLabel('Access code')).toBeVisible();
  await expect(page.getByLabel('New password', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Confirm new password')).toBeVisible();
  await button(page, 'Save new password').click();
  await expect(page.getByText(/Enter your access details and matching passwords/)).toBeVisible();
  await button(page, 'Back to sign in').click();
  await expect(page.getByRole('heading', { name: 'Set your new password' })).toBeHidden();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  await expect(button(page, 'Sign in')).toBeVisible();
});

test('connection settings stay reachable', async ({ page }) => {
  await button(page, 'Show connection settings').click();
  await expect(page.getByTestId('server-address')).toHaveText('http://api.staff-e2e.test/api');
  await button(page, 'Hide connection settings').click();
  await expect(page.getByTestId('server-address')).toBeHidden();
});
