import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { InitializePaddleOptions, Paddle, PaddleEventData } from '@paddle/paddle-js';

const sdk = vi.hoisted(() => ({ initialize: vi.fn() }));
vi.mock('@paddle/paddle-js', async (importOriginal) => ({
  ...await importOriginal<typeof import('@paddle/paddle-js')>(),
  initializePaddle: sdk.initialize,
}));

const scriptSelector = 'script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]';
let paddle: Paddle;
const loadModule = () => import('./paddle');
const callback = () => (sdk.initialize.mock.calls.at(-1)![0] as InitializePaddleOptions).eventCallback!;

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_PADDLE_ENVIRONMENT', 'sandbox');
  vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN', 'test_public_fixture');
  paddle = { Initialized: true } as Paddle;
  window.PaddleBillingV1 = paddle;
  sdk.initialize.mockReset().mockResolvedValue(paddle);
});
afterEach(() => {
  vi.unstubAllEnvs();
  delete window.PaddleBillingV1;
  document.querySelectorAll(scriptSelector).forEach((script) => script.remove());
});

describe('configuration validation before SDK initialization', () => {
  it.each([
    ['', 'test_fixture', 'VITE_PADDLE_ENVIRONMENT is required'],
    ['  ', 'test_fixture', 'VITE_PADDLE_ENVIRONMENT is required'],
    [undefined, 'test_fixture', 'VITE_PADDLE_ENVIRONMENT is required'],
    ['Sandbox', 'test_fixture', 'must be either'],
    ['staging', 'test_fixture', 'must be either'],
    ['sandbox', '', 'VITE_PADDLE_CLIENT_TOKEN is required'],
    ['sandbox', undefined, 'VITE_PADDLE_CLIENT_TOKEN is required'],
    ['sandbox', 'live_fixture', 'beginning with test_'],
    ['sandbox', 'prefix_test_fixture', 'beginning with test_'],
    ['production', 'test_fixture', 'beginning with live_'],
    ['production', 'prefix_live_fixture', 'beginning with live_'],
  ])('rejects environment %s and token case %#', async (environment, token, message) => {
    vi.stubEnv('VITE_PADDLE_ENVIRONMENT', environment);
    vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN', token);
    const { getPaddle } = await loadModule();
    await expect(getPaddle()).rejects.toThrow(message);
    expect(sdk.initialize).not.toHaveBeenCalled();
    expect(document.querySelector(scriptSelector)).toBeNull();
  });

  it.each(['sandbox', 'production'])('accepts and trims valid %s configuration', async (environment) => {
    const token = environment === 'sandbox' ? 'test_public_fixture' : 'live_public_fixture';
    vi.stubEnv('VITE_PADDLE_ENVIRONMENT', ` ${environment} `);
    vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN', ` ${token} `);
    const { getPaddle } = await loadModule();
    expect(await getPaddle()).toBe(paddle);
    expect(sdk.initialize).toHaveBeenCalledWith({ environment, token, eventCallback: expect.any(Function) });
  });

  it('can recover from configuration failure on the next explicit call', async () => {
    vi.stubEnv('VITE_PADDLE_ENVIRONMENT', 'invalid');
    const { getPaddle } = await loadModule();
    await expect(getPaddle()).rejects.toThrow();
    vi.stubEnv('VITE_PADDLE_ENVIRONMENT', 'sandbox');
    expect(await getPaddle()).toBe(paddle);
  });
});

it('shares in-flight initialization and retains a successful singleton after cleanup', async () => {
  let resolve!: (value: Paddle) => void;
  sdk.initialize.mockReturnValue(new Promise<Paddle>((done) => { resolve = done; }));
  const { getPaddle, subscribePaddleEvents } = await loadModule();
  const unsubscribe = subscribePaddleEvents(vi.fn());
  const first = getPaddle();
  expect(getPaddle()).toBe(first);
  await Promise.resolve();
  expect(sdk.initialize).toHaveBeenCalledOnce();
  resolve(paddle);
  expect(await first).toBe(paddle);
  unsubscribe();
  vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN', '');
  expect(getPaddle()).toBe(first);
  expect(await getPaddle()).toBe(paddle);
  expect(sdk.initialize).toHaveBeenCalledOnce();
});

it.each(['reject', 'undefined', 'uninitialized'])('retries %s initialization only on an explicit call', async (failure) => {
  if (failure === 'reject') sdk.initialize.mockRejectedValueOnce(new Error('network failure'));
  else sdk.initialize.mockResolvedValueOnce(failure === 'undefined' ? undefined : { Initialized: false });
  const { getPaddle } = await loadModule();
  const first = getPaddle();
  expect(getPaddle()).toBe(first);
  await expect(first).rejects.toThrow();
  expect(sdk.initialize).toHaveBeenCalledOnce();
  const retry = getPaddle();
  expect(getPaddle()).toBe(retry);
  expect(await retry).toBe(paddle);
  expect(sdk.initialize).toHaveBeenCalledTimes(2);
});

it('retries failed CDN downloads and missing globals with the installed SDK loader', async () => {
  delete window.PaddleBillingV1;
  const realSdk = await vi.importActual<typeof import('@paddle/paddle-js')>('@paddle/paddle-js');
  sdk.initialize.mockImplementation(realSdk.initializePaddle);
  const { getPaddle } = await loadModule();
  for (const failureEvent of ['error', 'load']) {
    const first = getPaddle();
    expect(getPaddle()).toBe(first);
    const failedScript = document.querySelector(scriptSelector)!;
    failedScript.dispatchEvent(new Event(failureEvent));
    await expect(first).rejects.toThrow('could not be loaded');
    expect(failedScript.isConnected).toBe(false);
    expect(sdk.initialize).not.toHaveBeenCalled();
  }
  const retry = getPaddle();
  expect(getPaddle()).toBe(retry);
  const script = document.querySelector(scriptSelector)!;
  expect(document.querySelectorAll(scriptSelector)).toHaveLength(1);
  const initialize = vi.fn(() => { paddle.Initialized = true; });
  paddle = { Initialized: false, Environment: { set: vi.fn() }, Initialize: initialize } as unknown as Paddle;
  window.PaddleBillingV1 = paddle;
  script.dispatchEvent(new Event('load'));
  expect(await retry).toBe(paddle);
  expect(sdk.initialize).toHaveBeenCalledOnce();
  expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ eventCallback: expect.any(Function) }));
});

it('fans out installed closed/completed events once and stops on unsubscribe', async () => {
  const { getPaddle, subscribePaddleEvents, CheckoutEventNames } = await loadModule();
  const first = vi.fn();
  const second = vi.fn();
  const unsubscribeFirst = subscribePaddleEvents(first);
  expect(sdk.initialize).not.toHaveBeenCalled();
  await getPaddle();
  const unsubscribeSecond = subscribePaddleEvents(second);
  for (const name of [CheckoutEventNames.CHECKOUT_CLOSED, CheckoutEventNames.CHECKOUT_COMPLETED]) {
    const event: PaddleEventData = { name };
    callback()(event);
    expect(first).toHaveBeenLastCalledWith(event);
    expect(second).toHaveBeenLastCalledWith(event);
  }
  expect(first).toHaveBeenCalledTimes(2);
  expect(second).toHaveBeenCalledTimes(2);
  unsubscribeFirst();
  unsubscribeFirst();
  callback()({});
  expect(first).toHaveBeenCalledTimes(2);
  expect(second).toHaveBeenCalledTimes(3);
  unsubscribeSecond();
  callback()({});
  expect(second).toHaveBeenCalledTimes(3);
  expect(sdk.initialize).toHaveBeenCalledOnce();
});

it('gives duplicate listener registrations independent cleanup', async () => {
  const { getPaddle, subscribePaddleEvents } = await loadModule();
  const listener = vi.fn();
  const unsubscribe = subscribePaddleEvents(listener);
  const unsubscribeOther = subscribePaddleEvents(listener);
  await getPaddle();
  unsubscribe();
  callback()({});
  expect(listener).toHaveBeenCalledOnce();
  unsubscribeOther();
  callback()({});
  expect(listener).toHaveBeenCalledOnce();
});

it('isolates throwing consumers and honors cleanup during delivery', async () => {
  const { getPaddle, subscribePaddleEvents } = await loadModule();
  const late = vi.fn();
  let unsubscribeRemoved = () => {};
  let unsubscribeLate = () => {};
  const unsubscribeFirst = subscribePaddleEvents(() => {
    unsubscribeRemoved();
    unsubscribeLate = subscribePaddleEvents(late);
    throw new Error('consumer failure');
  });
  const removed = vi.fn();
  unsubscribeRemoved = subscribePaddleEvents(removed);
  const remaining = vi.fn();
  const unsubscribeRemaining = subscribePaddleEvents(remaining);
  await getPaddle();
  expect(() => callback()({})).not.toThrow();
  expect(removed).not.toHaveBeenCalled();
  expect(late).not.toHaveBeenCalled();
  expect(remaining).toHaveBeenCalledOnce();
  unsubscribeFirst();
  callback()({});
  expect(late).toHaveBeenCalledOnce();
  unsubscribeLate();
  unsubscribeRemaining();
});
