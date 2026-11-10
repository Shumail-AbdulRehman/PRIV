import { pathToFileURL } from 'node:url';
import { getPaddleCatalog } from '../backend/src/config/paddle.ts';

const credential = value => value.trim().length >= 32 && !/changeme|placeholder|your[_-]|example/i.test(value.trim());
const paymentLink = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.hash && !url.search;
  } catch { return false; }
};

/** Offline syntax checks only. Results contain fixed names/statuses, never input values.
 * Importing the shared catalog validator does not initialize the Paddle client.
 */
export function checkBillingFlow(env = process.env) {
  const checks = [
    ['PADDLE_ENVIRONMENT', value => value === 'sandbox'],
    ['VITE_PADDLE_ENVIRONMENT', value => value === 'sandbox'],
    ['VITE_PADDLE_CLIENT_TOKEN', value => value.trim().startsWith('test_') && value.trim().length > 5],
    ['PADDLE_BILLING_ENABLED', value => value === 'true'],
    ['PADDLE_API_KEY', credential],
    ['PADDLE_PRICE_CATALOG_JSON', () => {
      try { return getPaddleCatalog(env).length > 0; } catch { return false; }
    }],
    ['PADDLE_WEBHOOK_SECRET', credential],
    ['PADDLE_CHECKOUT_URL', paymentLink],
    ['TRUST_PROXY_HOPS', value => /^(0|[1-9]\d*)$/.test(value) && Number.isSafeInteger(Number(value))],
  ];
  return checks.map(([name, valid]) => {
    const value = env[name];
    const present = typeof value === 'string' && value.trim().length > 0;
    return { name, status: !present ? 'MISSING' : valid(value) ? 'VALID' : 'INVALID' };
  });
}

export function main(env = process.env, output = console.log) {
  const results = checkBillingFlow(env);
  for (const { name, status } of results) output(`${name}: ${status}`);
  return results.every(result => result.status === 'VALID') ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
