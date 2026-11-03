import { beforeEach, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setUser, type AuthUser } from '@/store/slices/authSlice';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { platformRoutes } from './platformRoutes';
import { OperatorBoundary } from './OperatorLogin';
import { clearOperatorSession, operatorQueryScope, operatorRequest, operatorSessionStatus, OperatorUnavailableError } from './operatorSession';

function mount(path = '/platform/login', language = 'en', role?: AuthUser['role']) {
  localStorage.setItem('hygene-ops.language', language);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const store = configureStore({ reducer: { auth: authReducer } });
  if (role) store.dispatch(setUser({ id: 7, role, name: 'Synthetic person', email: 'fixture@example.invalid', companyId: 42 }));
  const router = createMemoryRouter(platformRoutes, { initialEntries: [path] });
  const view = render(<Provider store={store}><QueryClientProvider client={queryClient}><LanguageProvider><RouterProvider router={router} /></LanguageProvider></QueryClientProvider></Provider>);
  return { ...view, router, store, queryClient };
}
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

it('missing qualified provider shows a disabled action with an explanation and no registration/password form', () => {
  mount();
  expect(screen.getByRole('heading', { name: 'Platform operator sign-in', level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue with identity provider' })).toBeDisabled();
  expect(screen.getByText('Platform sign in is not configured. Contact your platform administrator for access.')).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /register|signup|password/i })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Company sign in' })).toHaveAttribute('href', '/login');
});

for (const role of ['ADMIN', 'MANAGER', 'STAFF'] as const) {
  it(`never promotes a tenant ${role} to an operator, including direct platform URLs`, () => {
    const { store } = mount('/platform/companies', 'en', role);
    expect(screen.getByRole('button', { name: 'Continue with identity provider' })).toBeDisabled();
    expect(store.getState().auth.user?.role).toBe(role);
    expect(operatorSessionStatus.status).toBe('unavailable');
    expect(screen.getByText('Named operator account and multi-factor authentication are required.')).toBeInTheDocument();
  });
}

it('ignores browser storage claims, bearer strings and role flags; no token is restored', () => {
  localStorage.setItem('operator', JSON.stringify({ role: 'ADMIN', kind: 'PLATFORM_OPERATOR', acr: 'mfa', accessToken: 'synthetic.untrusted.token' }));
  sessionStorage.setItem('operator-access-token', 'synthetic.untrusted.token');
  mount('/platform/security');
  expect(screen.getByRole('heading', { name: 'No platform session' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open security provider' })).toBeDisabled();
});

for (const response of ['?code=untrusted&state=wrong&nonce=wrong', '?code=untrusted&state=matching-looking', '#access_token=synthetic.untrusted.token&state=untrusted', '?error=access_denied']) {
  it(`rejects unsolicited callback ${response.startsWith('#') ? 'fragment' : response.includes('error') ? 'error' : 'state/nonce'} without a platform session`, async () => {
    const { router } = mount(`/platform/callback${response}`);
    await screen.findByRole('heading', { name: 'Sign-in response rejected' });
    expect(router.state.location.pathname).toBe('/platform/callback');
    expect(router.state.location.search).toBe('');
    expect(router.state.location.hash).toBe('');
    expect(screen.getByText(/No platform session was created/)).toBeInTheDocument();
    expect(operatorSessionStatus.status).toBe('unavailable');
    expect(localStorage.getItem('operator-access-token')).toBeNull();
  });
}

it('the dedicated request boundary never uses tenant cookies, refresh, tokens or the network', async () => {
  const request = vi.spyOn(globalThis, 'fetch');
  await expect(operatorRequest('/platform/companies')).rejects.toBeInstanceOf(OperatorUnavailableError);
  await expect(operatorRequest('/platform/service/leads', { method: 'POST', body: { fixture: true } })).rejects.toMatchObject({ code: 'OPERATOR_SIGN_IN_UNAVAILABLE' });
  expect(request).not.toHaveBeenCalled();
});

it('local session cleanup removes only operator cache, leaving tenant identity and cached operations intact', async () => {
  const { queryClient, store } = mount('/platform/security', 'en', 'ADMIN');
  queryClient.setQueryData([...operatorQueryScope, 'companies'], { fixture: true });
  queryClient.setQueryData(['tenant', 'locations'], { kept: true });
  fireEvent.click(screen.getByRole('button', { name: 'Clear platform session' }));
  await screen.findByRole('status');
  expect(queryClient.getQueryData([...operatorQueryScope, 'companies'])).toBeUndefined();
  expect(queryClient.getQueryData(['tenant', 'locations'])).toEqual({ kept: true });
  expect(store.getState().auth.user?.role).toBe('ADMIN');
  expect(screen.getByRole('status')).toHaveTextContent('This does not sign you out of an identity provider.');
});

it('cleanup cancels pending operator reads before removing sensitive cache entries', async () => {
  const queryClient = new QueryClient();
  let cancelled = false;
  const pending = queryClient.fetchQuery({ queryKey: [...operatorQueryScope, 'pending'], queryFn: ({ signal }) => new Promise<never>((_, reject) => {
    signal.addEventListener('abort', () => { cancelled = true; reject(new Error('cancelled')); });
  }) }).catch(() => undefined);
  await clearOperatorSession(queryClient);
  await pending;
  expect(cancelled).toBe(true);
  expect(queryClient.getQueryCache().findAll({ queryKey: operatorQueryScope })).toHaveLength(0);
});

it('a rejected callback clears cached operator records while preserving the company session', async () => {
  const { router, queryClient, store } = mount('/platform/security', 'en', 'ADMIN');
  queryClient.setQueryData([...operatorQueryScope, 'companies'], { restricted: true });
  queryClient.setQueryData(['tenant', 'locations'], { kept: true });
  await act(async () => { await router.navigate('/platform/callback?code=untrusted&state=untrusted#id_token=untrusted'); });
  expect(await screen.findByRole('alert')).toHaveTextContent('No platform session was created.');
  await waitFor(() => expect(queryClient.getQueryCache().findAll({ queryKey: operatorQueryScope })).toHaveLength(0));
  expect(queryClient.getQueryData(['tenant', 'locations'])).toEqual({ kept: true });
  expect(store.getState().auth.user?.role).toBe('ADMIN');
  expect(router.state.location.search).toBe('');
  expect(router.state.location.hash).toBe('');
});

it('an unsolicited callback never follows an external return destination or exchanges its code', async () => {
  const request = vi.spyOn(globalThis, 'fetch');
  const { router } = mount('/platform/callback?code=untrusted&state=untrusted&returnTo=https%3A%2F%2Funtrusted.example.invalid%2F');
  expect(await screen.findByRole('alert')).toHaveTextContent('Sign-in response rejected');
  expect(router.state.location.pathname).toBe('/platform/callback');
  expect(router.state.location.search).toBe('');
  expect(screen.getByRole('link', { name: 'Return to platform sign in' })).toHaveAttribute('href', '/platform/login');
  expect(request).not.toHaveBeenCalled();
});

it('a late operator response cannot restore data after local cleanup even if transport ignores abort', async () => {
  const queryClient = new QueryClient();
  let finish!: (value: { restricted: boolean }) => void;
  const pending = queryClient.fetchQuery({
    queryKey: [...operatorQueryScope, 'late'],
    queryFn: () => new Promise<{ restricted: boolean }>(resolve => { finish = resolve; }),
  }).catch(() => undefined);
  await clearOperatorSession(queryClient);
  finish({ restricted: true });
  await pending;
  expect(queryClient.getQueryCache().findAll({ queryKey: operatorQueryScope })).toHaveLength(0);
});

it('failed operator cancellation still removes only the operator cache and reports failure', async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData([...operatorQueryScope, 'companies'], { restricted: true });
  queryClient.setQueryData(['tenant', 'locations'], { kept: true });
  vi.spyOn(queryClient, 'cancelQueries').mockRejectedValueOnce(new Error('synthetic cancellation failure'));
  await expect(clearOperatorSession(queryClient)).rejects.toThrow('synthetic cancellation failure');
  expect(queryClient.getQueryCache().findAll({ queryKey: operatorQueryScope })).toHaveLength(0);
  expect(queryClient.getQueryData(['tenant', 'locations'])).toEqual({ kept: true });
});

it('cleanup failures stay explicit and retryable without reporting success', async () => {
  const { queryClient } = mount('/platform/security');
  vi.spyOn(queryClient, 'cancelQueries').mockRejectedValueOnce(new Error('synthetic cleanup failure'));
  fireEvent.click(screen.getByRole('button', { name: 'Clear platform session' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Platform data could not be fully cleared.');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear platform session' }));
  await screen.findByRole('status');
});

it('cleanup announces pending work, prevents repeated submission, and preserves company data', async () => {
  const { queryClient } = mount('/platform/security');
  queryClient.setQueryData(['tenant', 'locations'], { kept: true });
  let finish!: () => void;
  const cancellation = vi.spyOn(queryClient, 'cancelQueries').mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  fireEvent.click(screen.getByRole('button', { name: 'Clear platform session' }));
  const pending = screen.getByRole('button', { name: 'Clearing…' });
  expect(pending).toBeDisabled();
  expect(pending).toHaveAttribute('aria-busy', 'true');
  fireEvent.click(pending);
  expect(cancellation).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  finish();
  await screen.findByRole('status');
  expect(screen.getByRole('button', { name: 'Clear platform session' })).toBeEnabled();
  expect(queryClient.getQueryData(['tenant', 'locations'])).toEqual({ kept: true });
});

it('public security and callback render complete Urdu guidance without provider controls', async () => {
  const view = mount('/platform/security', 'ur');
  expect(screen.getByRole('heading', { level: 1, name: 'پلیٹ فارم کی سیکیورٹی' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'سیکیورٹی فراہم کنندہ کھولیں' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'پلیٹ فارم کا سیشن صاف کریں' }));
  expect(await screen.findByRole('status')).toHaveTextContent('کمپنی کا سیشن برقرار ہے۔');
  view.unmount();
  mount('/platform/callback?code=untrusted&state=untrusted#access_token=untrusted', 'ur');
  expect(await screen.findByRole('alert')).toHaveTextContent('پلیٹ فارم کا کوئی سیشن نہیں بنا۔');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

it('complete Urdu interface follows persisted RTL language and switches without enabling access', async () => {
  mount('/platform/login', 'ur');
  expect(screen.getByRole('heading', { name: 'پلیٹ فارم آپریٹر کا داخلہ' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'شناخت فراہم کنندہ کے ذریعے جاری رکھیں' })).toBeDisabled();
  await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(screen.getByRole('heading', { name: 'Platform operator sign-in' })).toBeInTheDocument();
  expect(document.documentElement.dir).toBe('ltr');
});

it('the operator boundary never mounts protected children without a qualified provider session', () => {
  const queryClient = new QueryClient();
  const router = createMemoryRouter([{ path: '*', element: <OperatorBoundary><div>Restricted platform records</div></OperatorBoundary> }]);
  render(<QueryClientProvider client={queryClient}><LanguageProvider><RouterProvider router={router} /></LanguageProvider></QueryClientProvider>);
  expect(screen.queryByText('Restricted platform records')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Platform operator sign-in' })).toBeInTheDocument();
});
