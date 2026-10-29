import { test, expect, backend, enter, fixture, login, sql } from './fixtures';
import type { Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = join(root, 'docs/implementation/v5-billing-evidence');
test.use({ trace: 'off', screenshot: 'off', video: 'off' });

type Lifecycle = {
  company: { id: number; name: string; plan: string; operationalStatus: string; isActive: boolean };
  usage: Record<'locations' | 'staff' | 'managers', number>;
  limits: Record<'locations' | 'staff' | 'managers', number>;
  providerState: string;
  billingConfigured: boolean;
  checkoutAvailable: boolean;
  portalAvailable: boolean;
  reconciliationRequired: boolean;
  subscription: null | {
    status: string; periodStart: string | null; periodEnd: string | null;
    scheduledChangeAction: string | null; scheduledChangeAt: string | null; lastEventAt: string;
  };
};
const endpoint = backend + '/api/subscription/manage/lifecycle';
const heading = (lang: string) => lang === 'ur' ? 'آپ کی سبسکرپشن' : 'Your subscription';

async function lifecycle(page: Page): Promise<Lifecycle> {
  const response = await page.request.get(endpoint);
  expect(response.status()).toBe(200);
  return (await response.json()).data;
}

async function capture(page: Page, name: string) {
  await mkdir(out, { recursive: true });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  await page.screenshot({ animations: 'disabled', path: join(out, name + '.png') });
  await page.screenshot({ animations: 'disabled', path: join(out, name + '-full.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
}

test('billing saved lifecycle and capacity match SQL with paired V5 English Urdu desktop phone', async ({ browser }) => {
  test.setTimeout(120000);
  const observations = [];
  for (const width of [1366, 390]) for (const lang of ['en', 'ur']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    try {
      const page = await context.newPage();
      const errors: string[] = [], purchases: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => {
        if (request.method() === 'POST' && /\/subscription\/manage\/(checkout|managed-portal)/.test(request.url())) purchases.push(request.url());
      });
      await enter(page, '/subscription', 'ownerA', lang);
      await expect(page.getByRole('heading', { name: heading(lang), exact: true })).toBeVisible();
      const actual = await lifecycle(page);
      const [saved] = await sql('SELECT c.name,s.status,s."lastEventAt" FROM "Company" c JOIN "PaddleSubscription" s ON s.id=c."billingSubscriptionId" WHERE c.id=$1', [fixture.company.A]);
      expect(actual).toMatchObject({ company: { id: fixture.company.A, name: saved.name, isActive: true }, providerState: 'MIRRORED', billingConfigured: false, subscription: { status: saved.status } });
      for (const key of ['locations', 'staff', 'managers'] as const) await expect(page.locator('.billing-usage')).toContainText(`${actual.usage[key]} / ${actual.limits[key]}`);
      await expect(page.locator('.billing-facts')).toContainText(lang === 'ur' ? 'فعال' : 'Active');
      expect(await page.getByRole('button', { name: lang === 'ur' ? 'چیک آؤٹ کی طرف بڑھیں' : 'Continue to checkout', exact: true }).count()).toBe(0);
      await capture(page, `app-billing-${width}-${lang}`);
      const reference = await context.newPage();
      await reference.goto('file://' + join(root, 'design/v5/billing.html') + `?lang=${lang}`);
      await capture(reference, `v5-billing-${width}-${lang}`);
      expect(errors).toEqual([]);
      expect(purchases).toEqual([]);
      observations.push({ width, height: 900, lang, state: 'actual mirrored subscription with disabled provider actions', source: 'real React/API and migrated disposable synthetic PostgreSQL; immutable V5 reference', errors, purchases: purchases.length });
    } finally { await context.close(); }
  }
  await writeFile(join(out, 'billing-paired-results.json'), JSON.stringify(observations, null, 2));
});

test('billing provider periods scheduled changes and missing dates are real retained facts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await login(page.request);
  const [saved] = await sql('SELECT s.id,s.status,s."currentBillingPeriodStart",s."currentBillingPeriodEnd",s."scheduledChangeAction",s."scheduledChangeAt" FROM "PaddleSubscription" s JOIN "Company" c ON c."billingSubscriptionId"=s.id WHERE c.id=$1', [fixture.company.A]);
  try {
    for (const [status, label] of [['past_due', 'Past due'], ['paused', 'Paused'], ['canceled', 'Canceled'], ['trialing', 'Trialing']]) {
      await sql('UPDATE "PaddleSubscription" SET status=$2,"currentBillingPeriodStart"=NULL,"currentBillingPeriodEnd"=NULL,"scheduledChangeAction"=NULL,"scheduledChangeAt"=NULL WHERE id=$1', [saved.id, status]);
      await page.goto('/subscription');
      await expect(page.getByRole('heading', { name: heading('en'), exact: true })).toBeVisible();
      await expect(page.locator('.billing-facts')).toContainText(label);
      const actual = await lifecycle(page);
      expect(actual.subscription).toMatchObject({ status, periodStart: null, periodEnd: null });
      const facts = page.locator('.billing-facts');
      await expect(facts.locator('div').filter({ has: page.locator('dt', { hasText: 'Billing period starts' }) })).toContainText('Not available');
      await expect(facts.locator('div').filter({ has: page.locator('dt', { hasText: 'Billing period ends' }) })).toContainText('Not available');
      await capture(page, `app-billing-${status}-390-en`);
    }
    const scheduled = new Date(Date.now() + 86400000).toISOString();
    await sql('UPDATE "PaddleSubscription" SET status=\'active\',"currentBillingPeriodStart"=$2,"currentBillingPeriodEnd"=$3,"scheduledChangeAction"=\'cancel\',"scheduledChangeAt"=$4 WHERE id=$1', [saved.id, saved.currentBillingPeriodStart, saved.currentBillingPeriodEnd, scheduled]);
    await page.reload();
    await expect(page.locator('.billing-facts')).toContainText('cancel');
    await expect(page.locator(`time[datetime="${scheduled}"]`).first()).toBeVisible();
    expect((await lifecycle(page)).subscription?.scheduledChangeAt).toBe(scheduled);
    await capture(page, 'app-billing-scheduled-change-390-en');
  } finally {
    await sql('UPDATE "PaddleSubscription" SET status=$2,"currentBillingPeriodStart"=$3,"currentBillingPeriodEnd"=$4,"scheduledChangeAction"=$5,"scheduledChangeAt"=$6 WHERE id=$1', [saved.id, saved.status, saved.currentBillingPeriodStart, saved.currentBillingPeriodEnd, saved.scheduledChangeAction, saved.scheduledChangeAt]);
  }
});

test('new owner billing has honest empty catalog and checkout return never grants activation', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 900 });
  const signup = await page.request.post(backend + '/api/manager/manager-signup', { data: { name: 'Synthetic billing owner', companyName: 'Synthetic unlinked billing company', email: `billing-${randomUUID()}@example.invalid`, password: fixture.password } });
  expect(signup.status()).toBe(201);
  await page.goto('/subscription');
  await expect(page.getByRole('heading', { name: heading('en'), exact: true })).toBeVisible();
  const actual = await lifecycle(page);
  expect(actual).toMatchObject({ providerState: 'NOT_LINKED', subscription: null, billingConfigured: false, checkoutAvailable: false, usage: { locations: 0, staff: 0, managers: 1 } });
  await expect(page.getByText('No linked subscription record', { exact: true })).toBeVisible();
  await expect(page.getByText('Checkout is unavailable until the billing catalog and commercial terms are approved and configured.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to checkout', exact: true })).toHaveCount(0);
  await capture(page, 'app-billing-unlinked-390-en');
  await page.goto('/welcome');
  await expect(page).toHaveURL(/\/subscription\?activation=pending/);
  await expect(page.getByText('Activation is awaiting provider synchronization. Completing checkout does not confirm an active subscription. Do not pay again.', { exact: true })).toBeVisible();
  expect((await lifecycle(page)).subscription).toBeNull();
  await capture(page, 'app-billing-activation-pending-390-en');
  await page.addInitScript(() => localStorage.setItem('hygene-ops.language', 'ur'));
  await page.goto('/subscription');
  await expect(page.getByRole('heading', { name: heading('ur'), exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'چیک آؤٹ کی طرف بڑھیں', exact: true })).toHaveCount(0);
  await capture(page, 'app-billing-unlinked-390-ur');
  await page.goto('/welcome');
  await expect(page).toHaveURL(/\/subscription\?activation=pending/);
  await expect(page.locator('.billing-notice').first()).toBeVisible();
  expect((await lifecycle(page)).subscription).toBeNull();
  await capture(page, 'app-billing-activation-pending-390-ur');
});

test('billing preserves real over-capacity records and exposes no destructive workaround', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const before = await sql('SELECT (SELECT COUNT(*)::int FROM "Location" WHERE "companyId"=$1 AND "isActive") AS locations,(SELECT COUNT(*)::int FROM "Staff" WHERE "companyId"=$1 AND "isActive") AS staff,(SELECT COUNT(*)::int FROM "Manager" WHERE "companyId"=$1 AND "isActive") AS managers', [fixture.company.A]);
  await enter(page, '/subscription');
  await expect(page.getByRole('heading', { name: heading('en'), exact: true })).toBeVisible();
  const actual = await lifecycle(page);
  expect(actual.usage).toEqual(before[0]);
  expect(Object.keys(actual.usage).some(key => actual.usage[key as keyof typeof actual.usage] > actual.limits[key as keyof typeof actual.limits])).toBe(true);
  await expect(page.getByText('Over limit', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Existing records and history are preserved when a limit is exceeded. New capacity is checked by the server.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /delete|remove/i })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: heading('en'), exact: true })).toBeVisible();
  expect((await lifecycle(page)).usage).toEqual(before[0]);
  expect(await sql('SELECT (SELECT COUNT(*)::int FROM "Location" WHERE "companyId"=$1 AND "isActive") AS locations,(SELECT COUNT(*)::int FROM "Staff" WHERE "companyId"=$1 AND "isActive") AS staff,(SELECT COUNT(*)::int FROM "Manager" WHERE "companyId"=$1 AND "isActive") AS managers', [fixture.company.A])).toEqual(before);
  await capture(page, 'app-billing-over-capacity-390-en');
});

test('billing unresolved reservation prevents another purchase and remains after refresh', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  let reservation: number | undefined;
  try {
    const [inserted] = await sql('INSERT INTO "AuditLog"("companyId","actorType","actorId","entityType","entityId",action,"newValue") VALUES($1,\'ADMIN\',$2,\'BILLING_OPERATION\',$1,\'CHECKOUT_RESERVED\',\'{"plan":"STARTER","interval":"month"}\'::jsonb) RETURNING id', [fixture.company.A, fixture.users.ownerA.id]);
    reservation = inserted.id;
    await enter(page, '/subscription');
    const warning = page.getByText('A billing request needs reconciliation. Do not start another purchase. Refresh status or contact your configured support channel.', { exact: true });
    await expect(warning).toBeVisible();
    expect((await lifecycle(page)).reconciliationRequired).toBe(true);
    await expect(page.getByRole('button', { name: 'Continue to checkout', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Refresh billing status', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Refresh billing status', exact: true })).toBeEnabled();
    await expect(warning).toBeVisible();
    expect(await sql('SELECT id FROM "AuditLog" WHERE id=$1', [reservation])).toHaveLength(1);
    await capture(page, 'app-billing-reconciliation-390-en');
  } finally { if (reservation) await sql('DELETE FROM "AuditLog" WHERE id=$1', [reservation]); }
});

for (const lang of ['en', 'ur']) test(`billing actual request loading failure retained refresh and retry remain honest ${lang}`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const refresh = lang === 'ur' ? 'بلنگ کی حالت تازہ کریں' : 'Refresh billing status';
  const error = lang === 'ur' ? 'بلنگ کا ریکارڈ نہیں کھل سکا۔ اکاؤنٹ کی سکیورٹی دستیاب ہے۔ دوبارہ کوشش کے لیے تازہ کریں۔' : 'Billing records could not be loaded. Your account security remains available. Refresh to try again.';
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/subscription/manage/lifecycle', async route => { await held; await route.continue(); });
  try {
    await enter(page, '/subscription', 'ownerA', lang);
    await expect(page.getByText(lang === 'ur' ? 'بلنگ کا ریکارڈ کھل رہا ہے…' : 'Loading billing records…', { exact: true })).toBeVisible();
    await capture(page, `app-billing-loading-390-${lang}`);
  } finally { release(); }
  await expect(page.getByRole('heading', { name: heading(lang), exact: true })).toBeVisible();
  await page.unroute('**/api/subscription/manage/lifecycle');
  await page.route('**/api/subscription/manage/lifecycle', route => route.abort('failed'));
  await page.getByRole('button', { name: refresh, exact: true }).click();
  await expect(page.getByText(lang === 'ur' ? 'پہلے حاصل شدہ بلنگ کا ریکارڈ دکھایا جا رہا ہے۔ کسی اقدام سے پہلے تازہ کریں۔' : 'Showing previously loaded billing records. Refresh before taking any action.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: heading(lang), exact: true })).toBeVisible();
  await capture(page, `app-billing-retained-refresh-error-390-${lang}`);
  await page.reload();
  await expect(page.getByText(error, { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: heading(lang), exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: lang === 'ur' ? 'آپ کے اکاؤنٹ کی سکیورٹی' : 'Your account security', exact: true })).toBeVisible();
  await capture(page, `app-billing-initial-error-390-${lang}`);
  await page.unroute('**/api/subscription/manage/lifecycle');
  await page.getByRole('button', { name: refresh, exact: true }).click();
  await expect(page.getByRole('heading', { name: heading(lang), exact: true })).toBeVisible();
});

test('billing API remains owner-scoped and manager cannot purchase or reach another tenant', async ({ page, browser }) => {
  await enter(page, '/subscription', 'ownerB');
  const own = await page.request.get(endpoint + '?companyId=' + fixture.company.A);
  expect(own.status()).toBe(200);
  expect((await own.json()).data.company.id).toBe(fixture.company.B);
  expect((await page.request.get(backend + '/api/subscription/manage/catalog')).status()).toBe(503);
  expect((await page.request.post(backend + '/api/subscription/manage/checkout', { data: { plan: 'STARTER', interval: 'month' } })).status()).toBe(503);
  expect((await page.request.post(backend + '/api/subscription/manage/managed-portal', { data: {} })).status()).toBe(503);
  await expect(page.getByRole('heading', { name: heading('en'), exact: true })).toBeVisible();
  const denied = await browser.newContext();
  try {
    await login(denied.request, 'managerA');
    for (const path of ['lifecycle', 'catalog']) expect((await denied.request.get(backend + '/api/subscription/manage/' + path)).status()).toBe(403);
    expect((await denied.request.post(backend + '/api/subscription/manage/checkout', { data: { plan: 'STARTER', interval: 'month' } })).status()).toBe(403);
    expect((await denied.request.post(backend + '/api/subscription/manage/managed-portal', { data: {} })).status()).toBe(403);
    const managerPage = await denied.newPage();
    await managerPage.goto('/subscription');
    await expect(managerPage).toHaveURL(/\/dashboard/);
    await expect(managerPage.getByRole('heading', { name: 'Plan & billing', exact: true })).toHaveCount(0);
  } finally { await denied.close(); }
});

test('active unpaid owner retains operational reads while the server denies new work', async ({ page }) => {
  const [saved] = await sql('SELECT "billingCustomerId","billingSubscriptionId","operationalStatus" FROM "Company" WHERE id=$1', [fixture.company.A]);
  try {
    await sql('UPDATE "Company" SET "billingCustomerId"=NULL,"billingSubscriptionId"=NULL,"operationalStatus"=\'ACTIVE\' WHERE id=$1', [fixture.company.A]);
    await enter(page, '/dashboard');
    await expect(page.getByRole('heading', { name: 'Company performance', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Account access needs attention', exact: true })).toHaveCount(0);
    expect((await page.request.get(backend + '/api/manager/operations/performance?period=7')).status()).toBe(200);
    const denied = await page.request.post(backend + `/api/location/${fixture.site.A}/areas`, { data: { name: 'Denied unpaid billing fixture', roomType: 'WASHROOM', counts: [] } });
    expect(denied.status()).toBe(403);
    expect(JSON.stringify(await denied.json())).toContain('SUBSCRIPTION_REQUIRED');
  } finally {
    await sql('UPDATE "Company" SET "billingCustomerId"=$2,"billingSubscriptionId"=$3,"operationalStatus"=$4 WHERE id=$1', [fixture.company.A, saved.billingCustomerId, saved.billingSubscriptionId, saved.operationalStatus]);
  }
});

test('suspended owner sees real V5 account access and retains safe billing security support destinations', async ({ browser }) => {
  test.setTimeout(120000);
  const [saved] = await sql('SELECT "operationalStatus" FROM "Company" WHERE id=$1', [fixture.company.A]);
  const observations = [];
  try {
    for (const width of [1366, 390]) for (const lang of ['en', 'ur']) {
      await sql('UPDATE "Company" SET "operationalStatus"=\'ACTIVE\' WHERE id=$1', [fixture.company.A]);
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      try {
        const page = await context.newPage(), errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await enter(page, '/subscription', 'ownerA', lang);
        await expect(page.getByRole('heading', { name: heading(lang), exact: true })).toBeVisible();
        await sql('UPDATE "Company" SET "operationalStatus"=\'SUSPENDED\' WHERE id=$1', [fixture.company.A]);
        await page.goto('/dashboard');
        await expect(page.getByRole('heading', { name: lang === 'ur' ? 'اکاؤنٹ کی رسائی پر توجہ درکار ہے' : 'Account access needs attention', exact: true })).toBeVisible();
        expect((await lifecycle(page)).company.operationalStatus).toBe('SUSPENDED');
        await expect(page.locator('.owner-access-actions').getByRole('link', { name: lang === 'ur' ? 'پلان اور بلنگ کھولیں' : 'Open Plan & billing', exact: true })).toBeInViewport({ ratio: 1 });
        expect((await page.request.get(backend + '/api/manager/operations/performance?period=7')).status()).toBe(403);
        await capture(page, `app-access-${width}-${lang}`);
        const reference = await context.newPage();
        await reference.goto('file://' + join(root, 'design/v5/access.html') + `?lang=${lang}`);
        await capture(reference, `v5-access-${width}-${lang}`);
        await page.goto('/subscription');
        await expect(page.getByRole('heading', { name: heading(lang), exact: true })).toBeVisible();
        await expect(page.getByText(lang === 'ur' ? 'کمپنی کے کام معطل ہیں۔ مالک کی بلنگ اور اکاؤنٹ سکیورٹی دستیاب ہے۔ ادائیگی سے انتظامی معطلی ختم نہیں ہوتی۔' : 'Company operations are suspended. Owner billing and account security remain available. Payment does not remove an administrative suspension.', { exact: true })).toBeVisible();
        await capture(page, `app-billing-suspended-${width}-${lang}`);
        await page.goto('/account/security');
        await expect(page.getByLabel(lang === 'ur' ? 'موجودہ پاس ورڈ' : 'Current password', { exact: true })).toBeVisible();
        await page.goto('/help');
        await expect(page.getByRole('heading', { name: lang === 'ur' ? 'مدد اور سروس کی معلومات' : 'Help & service information', exact: true })).toBeVisible();
        expect(errors).toEqual([]);
        observations.push({ width, height: 900, lang, state: 'server SUSPENDED; actual operations403 and owner lifecycle/security/support reachable', source: 'temporary disposable synthetic SQL mutation restored in finally; no provider operation', errors });
      } finally { await context.close(); }
    }
  } finally { await sql('UPDATE "Company" SET "operationalStatus"=$2 WHERE id=$1', [fixture.company.A, saved.operationalStatus]); }
  await writeFile(join(out, 'access-paired-results.json'), JSON.stringify(observations, null, 2));
});

test('legacy inactive company cannot appear operational while owner recovery remains reachable', async ({ browser }) => {
  test.setTimeout(60000);
  const [saved] = await sql('SELECT "isActive","operationalStatus" FROM "Company" WHERE id=$1', [fixture.company.A]);
  try {
    for (const lang of ['en', 'ur']) {
      await sql('UPDATE "Company" SET "isActive"=true,"operationalStatus"=\'ACTIVE\' WHERE id=$1', [fixture.company.A]);
      const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
      try {
        const page = await context.newPage();
        await enter(page, '/subscription', 'ownerA', lang);
        await expect(page.getByRole('heading', { name: heading(lang), exact: true })).toBeVisible();
        await sql('UPDATE "Company" SET "isActive"=false WHERE id=$1', [fixture.company.A]);
        await page.goto('/dashboard');
        await expect(page.getByRole('heading', { name: lang === 'ur' ? 'اکاؤنٹ کی رسائی پر توجہ درکار ہے' : 'Account access needs attention', exact: true })).toBeVisible();
        expect((await lifecycle(page)).company).toMatchObject({ isActive: false, operationalStatus: 'ACTIVE' });
        expect((await page.request.get(backend + '/api/manager/operations/performance?period=7')).status()).toBe(403);
        await capture(page, `app-access-inactive-390-${lang}`);
        await page.goto('/subscription');
        await expect(page.getByRole('heading', { name: heading(lang), exact: true })).toBeVisible();
        await page.goto('/account/security');
        await expect(page.getByLabel(lang === 'ur' ? 'موجودہ پاس ورڈ' : 'Current password', { exact: true })).toBeVisible();
      } finally { await context.close(); }
    }
  } finally {
    await sql('UPDATE "Company" SET "isActive"=$2,"operationalStatus"=$3 WHERE id=$1', [fixture.company.A, saved.isActive, saved.operationalStatus]);
  }
});

for (const lang of ['en', 'ur']) test(`owner access pending request failure and recovery retain safe destinations ${lang}`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/subscription/manage/lifecycle', async route => { await held; await route.continue(); });
  try {
    await enter(page, '/dashboard', 'ownerA', lang);
    await expect(page.getByRole('heading', { name: lang === 'ur' ? 'ورک اسپیس کی رسائی جانچی جا رہی ہے…' : 'Checking workspace access…', exact: true })).toBeVisible();
    await capture(page, `app-access-loading-390-${lang}`);
  } finally { release(); }
  await expect(page.getByRole('heading', { name: lang === 'ur' ? 'کمپنی کی کارکردگی' : 'Company performance', exact: true })).toBeVisible();
  await page.unroute('**/api/subscription/manage/lifecycle');
  await page.route('**/api/subscription/manage/lifecycle', route => route.abort('failed'));
  await page.reload();
  await expect(page.getByRole('heading', { name: lang === 'ur' ? 'ورک اسپیس کی رسائی نہیں جانچی جا سکی' : 'Workspace access could not be checked', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: lang === 'ur' ? 'پلان اور بلنگ کھولیں' : 'Open Plan & billing', exact: true })).toHaveAttribute('href', '/subscription');
  await expect(page.getByRole('link', { name: lang === 'ur' ? 'آپ کے اکاؤنٹ کی سکیورٹی' : 'Your account security', exact: true })).toHaveAttribute('href', '/account/security');
  await capture(page, `app-access-error-390-${lang}`);
  await page.unroute('**/api/subscription/manage/lifecycle');
  await page.getByRole('button', { name: lang === 'ur' ? 'ورک اسپیس کی رسائی تازہ کریں' : 'Refresh workspace access', exact: true }).click();
  await expect(page.getByRole('heading', { name: lang === 'ur' ? 'کمپنی کی کارکردگی' : 'Company performance', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
