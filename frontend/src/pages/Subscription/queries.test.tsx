import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { useBillingLifecycle } from './queries';

const m = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/hooks/useAuth', () => ({ default: () => ({ user: { role: 'ADMIN', companyId: 42, id: 7 } }) }));
vi.mock('@/api/client', () => ({ client: { get: m.get } }));
afterEach(() => { vi.useRealTimers(); vi.resetAllMocks(); });

it('keeps checking an early transaction placeholder until the full subscription event arrives', async () => {
  vi.useFakeTimers();
  let status = 'unknown';
  m.get.mockImplementation(async () => ({ data: { data: { providerState: 'MIRRORED', reconciliationRequired: false, subscription: { status } } } }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const hook = renderHook(() => useBillingLifecycle({ poll: true }), {
    wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  try {
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(m.get).toHaveBeenCalledTimes(1);
    expect(hook.result.current.data?.subscription?.status).toBe('unknown');
    status = 'trialing';
    await act(async () => { await vi.advanceTimersByTimeAsync(5001); });
    expect(m.get).toHaveBeenCalledTimes(2);
    expect(hook.result.current.data?.subscription?.status).toBe('trialing');
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(m.get).toHaveBeenCalledTimes(2);
  } finally { hook.unmount(); client.clear(); }
});
