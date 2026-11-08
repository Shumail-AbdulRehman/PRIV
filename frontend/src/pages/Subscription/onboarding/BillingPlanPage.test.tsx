import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import BillingPlanPage from './BillingPlanPage';
const mocks = vi.hoisted(() => ({ user: { role: 'ADMIN', companyId: 42, id: 1 }, life: {} as Record<string, unknown>, catalog: {} as Record<string, unknown>, summary: {} as Record<string, unknown> }));
vi.mock('@/hooks/useAuth', () => ({ default: () => ({ user: mocks.user }) }));
vi.mock('../queries', () => ({ useBillingLifecycle: () => mocks.life, useBillingCatalog: () => mocks.catalog, useSubscription: () => mocks.summary }));
const life = () => ({ company: { id: 42, name: 'Fixture', plan: 'PRO', isActive: true, operationalStatus: 'ACTIVE' }, usage: { locations: 1, staff: 3, managers: 1 }, limits: { locations: 5, staff: 25, managers: 3 }, subscription: null, providerState: 'NOT_LINKED', billingConfigured: true, billingEnvironment: 'sandbox', ownerVerified: false, reconciliationRequired: false, checkoutAvailable: true, portalAvailable: false, checkoutReadiness: 'READY', workspaceAccessAllowed: false, checkoutResume: null });
const codes = ['STARTER', 'PRO', 'ADVANCED'];
const plans = codes.map((code, i) => ({ code, name: code === 'STARTER' ? 'Starter' : code === 'PRO' ? 'Pro' : 'Advanced', description: 'API definition', limits: { locations: i + 2, staff: i + 10, managers: i + 1 } }));
const entries = ['month', 'year'].flatMap(interval => codes.map((plan, i) => ({ plan, interval, priceId: `pri_${String.fromCharCode(97 + i).repeat(26)}${interval}`, productId: 'pro_' + 'a'.repeat(26), amount: interval === 'year' ? '12345' : '0', currencyCode: 'USD', trialPeriod: null })));
function Destination() { const loc = useLocation(); return <output>{loc.pathname + loc.search}</output>; }
function mount(path = '/choose-plan') { return render(<MemoryRouter initialEntries={[path]}><LanguageProvider><Routes><Route path="/choose-plan" element={<BillingPlanPage />} /><Route path="*" element={<Destination />} /></Routes></LanguageProvider></MemoryRouter>); }
beforeEach(() => {
 localStorage.clear(); mocks.user = { role: 'ADMIN', companyId: 42, id: 1 };
 const query = () => ({ isPending: false, isFetching: false, isError: false, error: null, refetch: vi.fn().mockResolvedValue({ isError: false }) });
 mocks.life = { ...query(), data: life(), dataOwner: { companyId: 42, ownerId: 1 } }; mocks.catalog = { ...query(), data: entries }; mocks.summary = { ...query(), data: { availablePlans: plans } };
});
it('uses all API capacities including the owner and a genuine zero price', () => {
 mount(); expect(screen.getAllByRole('radio')).toHaveLength(3);
 expect(screen.getByRole('radio', { name: /Starter.*Includes 2 locations.*Includes 10 staff seats.*Includes 1 manager seats.*Includes the company owner/ })).toBeChecked();
 expect(screen.getByRole('radio', { name: /Enterprise.*Includes 4 locations.*Includes 12 staff seats/ })).toBeVisible();
 expect(screen.getAllByText('US$0.00').length).toBeGreaterThan(0);
 expect(screen.getByText('The company owner uses one manager seat.')).toBeVisible();
 expect(screen.queryByRole('link', { name: /help|contact/i })).not.toBeInTheDocument();
});
it('carries yearly selection and discards untrusted URL values', () => {
 mount('/choose-plan?plan=BAD&interval=bad&transactionId=secret');
 fireEvent.click(screen.getByRole('button', { name: 'Yearly billing' })); fireEvent.click(screen.getByRole('radio', { name: /^Pro/ }));
 fireEvent.click(screen.getByRole('button', { name: 'Continue with selected plan' })); expect(screen.getByRole('status').textContent).toBe('/subscription/payment?plan=PRO&interval=year');
});
it('preserves native radio selection and keyboard focus through language change', () => {
 mount(); const pro = screen.getByRole('radio', { name: /^Pro/ }); fireEvent.click(pro); pro.focus(); expect(pro).toHaveFocus();
 fireEvent.click(screen.getByRole('button', { name: 'اردو' })); expect(screen.getAllByRole('radio')[1]).toBeChecked();
 fireEvent.click(screen.getByRole('button', { name: 'English' }));
 expect(pro).toBeChecked(); pro.focus(); expect(pro).toHaveFocus();
});
it.each(['loading', 'error', 'empty', 'missing'])('explains %s catalog and cannot buy a missing combination', (state) => {
 if (state === 'loading') mocks.catalog.isFetching = true;
 if (state === 'error') mocks.catalog.isError = true;
 if (state === 'empty') mocks.catalog.data = [];
 if (state === 'missing') mocks.catalog.data = entries.filter(row => row.interval === 'year');
 mount(); expect(screen.getByRole('button', { name: 'Continue with selected plan' })).toBeDisabled();
 expect(screen.getAllByRole(state === 'error' ? 'alert' : 'status').some(node => node.textContent)).toBe(true);
});
it('renders only actual available combinations and no guessed annual price', () => {
 mocks.catalog.data = [entries[0]]; mount(); expect(screen.getAllByRole('radio')).toHaveLength(1);
 fireEvent.click(screen.getByRole('button', { name: 'Yearly billing' })); expect(screen.queryByRole('radio')).not.toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Continue with selected plan' })).toBeDisabled();
});
it('retry announces availability and restores focus to selected radio', async () => {
 mocks.catalog.isError = true;
 const tree = () => <MemoryRouter initialEntries={['/choose-plan?plan=PRO']}><LanguageProvider><BillingPlanPage /></LanguageProvider></MemoryRouter>;
 const view = render(tree());
 (mocks.catalog.refetch as ReturnType<typeof vi.fn>).mockImplementation(async () => { mocks.catalog.isError = false; view.rerender(tree()); return { isError: false }; });
 fireEvent.click(screen.getByRole('button', { name: 'Refresh status' }));
 await waitFor(() => expect(screen.getByRole('radio', { name: /^Pro/ })).toHaveFocus());
 expect(screen.getByText('Plan prices are available.')).toBeVisible();
});
it.each([true, false])('explains reconciliation with catalog failure=%s without new purchase', (failed) => {
 mocks.life.data = { ...life(), reconciliationRequired: true, checkoutReadiness: 'RECONCILIATION_PENDING' }; mocks.catalog.isError = failed; mount();
 expect(screen.getByText(/We could not confirm the outcome/)).toBeVisible(); expect(screen.getByRole('button', { name: 'Check subscription status' })).toBeEnabled();
 expect(screen.getByRole('button', { name: 'Continue with selected plan' })).toBeDisabled();
});
it('keeps server-saved year plan despite a different URL selection', () => {
 mocks.life.data = { ...life(), checkoutResume: { plan: 'PRO', interval: 'year', transactionId: 'txn_' + 'b'.repeat(26) } }; mount('/choose-plan?plan=STARTER&interval=month');
 expect(screen.getByRole('button', { name: 'Continue with selected plan' })).toBeDisabled(); fireEvent.click(screen.getByRole('button', { name: 'Reopen existing checkout' }));
 expect(screen.getByRole('status').textContent).toBe('/subscription/payment?plan=PRO&interval=year');
});
it('denies non-owner without reading private plan hooks', () => { mocks.user.role = 'MANAGER'; mount(); expect(screen.queryByRole('radio')).not.toBeInTheDocument(); expect(screen.getByRole('alert')).toHaveTextContent('Only the company owner'); });
