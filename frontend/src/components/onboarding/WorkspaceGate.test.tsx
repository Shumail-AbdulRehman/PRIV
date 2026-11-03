import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import authReducer, { setUser, type AuthUser } from '@/store/slices/authSlice';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import type { BillingLifecycle } from '@/pages/Subscription/types';
import WorkspaceGate from './WorkspaceGate';

const boundary = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/api/client', () => ({ client: { get: boundary.get } }));
let lifecycle: BillingLifecycle;
function mount({ path = '/dashboard', role = 'ADMIN', language = 'en' }: { path?: string; role?: AuthUser['role']; language?: string } = {}) {
  localStorage.setItem('hygene-ops.language', language);
  const store = configureStore({ reducer: { auth: authReducer } });
  store.dispatch(setUser({ id: 7, companyId: 42, role, name: 'Test owner', email: 'owner@example.invalid' }));
  const query = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return { ...render(<Provider store={store}><QueryClientProvider client={query}><LanguageProvider><MemoryRouter initialEntries={[path]}><WorkspaceGate><h1>Operational records</h1></WorkspaceGate></MemoryRouter></LanguageProvider></QueryClientProvider></Provider>), query };
}
beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear();
  lifecycle = { company: { id: 42, name: 'Test company', plan: 'PRO', isActive: true, operationalStatus: 'SUSPENDED' }, usage: { locations: 4, staff: 28, managers: 2 }, limits: { locations: 5, staff: 25, managers: 3 }, subscription: null, reconciliationRequired: false, billingConfigured: false, ownerVerified: false, providerState: 'NOT_LINKED', portalAvailable: false, checkoutAvailable: false };
  boundary.get.mockImplementation(async () => ({ data: { data: structuredClone(lifecycle) } }));
});
it('renders actual suspended-owner recovery without mounting operational children', async () => {
  mount(); await screen.findByRole('heading', { name: 'Account access needs attention' });
  expect(screen.queryByText('Operational records')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Payment does not remove an administrative suspension');
  for (const [name, href] of [['Open Plan & billing', '/subscription'], ['Your account security', '/account/security'], ['Get help', '/help']]) expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
});
it.each(['/subscription', '/settings', '/settings/security'])('keeps safe destination %s independent of operational check', path => {
  mount({ path }); expect(screen.getByText('Operational records')).toBeInTheDocument(); expect(boundary.get).not.toHaveBeenCalled();
});
it.each(['MANAGER', 'STAFF'] as const)('does not request owner billing for %s', role => {
  mount({ role }); expect(screen.getByText('Operational records')).toBeInTheDocument(); expect(boundary.get).not.toHaveBeenCalled();
});
it('permits active unpaid read-only operations without inventing subscription policy', async () => {
  lifecycle.company.operationalStatus = 'ACTIVE'; mount(); await screen.findByText('Operational records');
  expect(screen.queryByText('Company operations are suspended')).not.toBeInTheDocument();
});
it('uses actual inactive company state even when its legacy operational status is active', async () => {
  lifecycle.company.isActive = false; lifecycle.company.operationalStatus = 'ACTIVE';
  mount(); await screen.findByRole('heading', { name: 'Account access needs attention' });
  expect(screen.queryByText('Operational records')).not.toBeInTheDocument();
});
it('an explicit authorization denial supersedes a previously active snapshot', async () => {
  lifecycle.company.operationalStatus = 'ACTIVE'; const { query } = mount();
  await screen.findByText('Operational records');
  boundary.get.mockRejectedValue({ response: { status: 403 } });
  await act(async () => { await query.refetchQueries(); });
  expect(await screen.findByRole('alert')).toHaveTextContent('Refresh workspace access');
  expect(screen.queryByText('Operational records')).not.toBeInTheDocument();
});
it('does not trust another company lifecycle or expose its operational subtree', async () => {
  lifecycle.company.id = 99; mount(); expect(await screen.findByRole('alert')).toHaveTextContent('do not match'); expect(screen.queryByText('Operational records')).not.toBeInTheDocument();
});
it('distinguishes an unavailable check and explicitly retries real lifecycle state', async () => {
  boundary.get.mockRejectedValue(new Error('private provider detail')); mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('Billing, security and help remain available');
  expect(screen.queryByText('private provider detail')).not.toBeInTheDocument();
  lifecycle.company.operationalStatus = 'ACTIVE'; boundary.get.mockResolvedValue({ data: { data: lifecycle } });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh workspace access' })); await screen.findByText('Operational records');
});
it('shows pending access without asserting suspension or mounting operational data', () => {
  boundary.get.mockReturnValue(new Promise(() => {})); mount(); expect(screen.getByRole('status')).toHaveTextContent('Checking workspace access'); expect(screen.queryByText('Operational records')).not.toBeInTheDocument();
});
