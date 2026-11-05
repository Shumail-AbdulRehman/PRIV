import { test, expect, fixture, sql } from './fixtures';

test.use({ trace: 'off', screenshot: 'off', video: 'off' });

test('new owner recovers a stale billing chunk, selects a sandbox plan and waits for activation', async ({ page }) => {
  const email = 'sandbox-browser-owner@example.invalid';
  const transactionId = 'txn_' + 'a'.repeat(26);
  let staleChunks = 0, requests = 0;
  let awaiting = false, activated = false;
  // Exercise the actual Vite preload-error event with a missing route chunk.
  await page.route(/\/assets\/SubscriptionPage-[^/]+\.js$/, async route => {
    if (staleChunks++ === 0) await route.fulfill({ status: 404, contentType: 'text/plain', body: 'Old deployment asset' });
    else await route.continue();
  });
  await page.goto('/signup');
  await page.getByLabel('Full Name', { exact: true }).fill('Sandbox browser owner');
  await page.getByLabel('Company Name', { exact: true }).fill('Sandbox browser workspace');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(fixture.password);
  await page.getByRole('button', { name: /Create account/i }).click();
  await expect(page.getByRole('heading', { name: 'Choose your plan', exact: true })).toBeVisible();
  expect(staleChunks).toBeGreaterThanOrEqual(2);
  expect(await page.evaluate(() => sessionStorage.getItem('hygene-ops.module-recovery-at'))).toBeTruthy();
  await expect(page.getByText('This page is unavailable', { exact: true })).toHaveCount(0);
  const [owner] = await sql('SELECT id,"companyId","emailVerifiedAt" FROM "Manager" WHERE email=$1', [email]);
  expect(owner.emailVerifiedAt).toBeNull();

  // Only the browser/provider boundary is simulated here. The separate SQL
  // integration test proves server reservation, ownership and webhook changes.
  await page.route('**/subscription/manage/lifecycle', async route => {
    const response = await route.fetch();
    const payload = await response.json();
    payload.data = { ...payload.data, billingConfigured: true, billingEnvironment: 'sandbox',
      ownerVerified: false, checkoutAvailable: !activated, onboardingRequired: !activated,
      providerState: activated ? 'MIRRORED' : awaiting ? 'AWAITING_PROVIDER' : 'NOT_LINKED',
      subscription: activated ? { status: 'active', plan: 'PRO', catalogQualified: true } : null };
    await route.fulfill({ response, json: payload });
  });
  await page.route('**/subscription/manage/catalog', route => route.fulfill({ json: { data: [
    { plan: 'PRO', interval: 'month', priceId: 'pri_' + 'b'.repeat(26), productId: 'pro_fixture', amount: '4000', currencyCode: 'USD', trialPeriod: null },
    { plan: 'PRO', interval: 'year', priceId: 'pri_' + 'c'.repeat(26), productId: 'pro_fixture', amount: '40000', currencyCode: 'USD', trialPeriod: null },
  ] } }));
  await page.route('**/subscription/manage/checkout', async route => {
    requests++;
    expect(route.request().postDataJSON()).toEqual({ plan: 'PRO', interval: 'year' });
    awaiting = true;
    await route.fulfill({ json: { data: { transactionId, reused: false } } });
  });
  // The official wrapper initializes this stub instead of contacting Paddle.
  await page.route('https://cdn.paddle.com/**', route => route.fulfill({ contentType: 'application/javascript', body: `
    window.PaddleBillingV1 = {
      Environment: { set(value) { window.testPaddleEnvironment = value; } },
      Initialize(options) { window.testPaddleToken = options.token; },
      Checkout: { open(options) { window.testPaddleCheckout = options; } }
    };
  ` }));
  await page.getByRole('button', { name: 'Refresh billing status', exact: true }).click();
  await expect(page.getByText(/Sandbox payments: use a Paddle test card/)).toBeVisible();
  await expect(page.getByText(/Verify your owner email/)).toHaveCount(0);
  const yearly = page.locator('.billing-offers > div').filter({ has: page.getByRole('heading', { name: 'PRO · Yearly' }) });
  await expect(yearly.getByRole('button', { name: 'Continue to checkout' })).toBeEnabled();
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
    await page.screenshot({ path: `/tmp/priv-onboarding-sandbox-${width}.png`, fullPage: true });
  }
  await yearly.getByRole('button', { name: 'Continue to checkout' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { testPaddleCheckout?: unknown }).testPaddleCheckout)).toEqual({
    transactionId, settings: { displayMode: 'overlay', theme: 'light', successUrl: new URL('/welcome', page.url()).href },
  });
  expect(requests).toBe(1);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/subscription$/);
  await expect(page.getByText(/Activation is awaiting provider synchronization/)).toBeVisible();
  await page.goto('/welcome');
  await expect(page).toHaveURL(/\/subscription\?activation=pending$/);
  await expect(page.getByText(/Activation is awaiting provider synchronization/)).toBeVisible();
  activated = true;
  await page.getByRole('button', { name: 'Refresh billing status', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(requests).toBe(1);
  // Dashboard mounting can refetch the lifecycle. Finish that intercepted
  // request before Playwright tears down the page and its request context.
  await page.unrouteAll({ behavior: 'wait' });
});
