import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import authReducer, { setUser, type AuthUser } from '@/store/slices/authSlice';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import DashboardPage from './DashboardPage';
const m = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/api/client', () => ({ client: { get: m.get } }));
vi.mock('recharts', () => ({ ResponsiveContainer: () => null, ComposedChart: () => null, Area: () => null, Bar: () => null, BarChart: () => null, CartesianGrid: () => null, Line: () => null, Tooltip: () => null, XAxis: () => null, YAxis: () => null }));
const site = { id: 20, name: 'Synthetic site', timezone: 'Asia/Karachi' };
const counts = { scheduledShifts: 4, present: 3, late: 1, missing: 1, tasks: 8, submitted: 2, verified: 1, accepted: 0, inProgress: 1, overdue: 2, notStarted: 3, reviews: 2, attendanceRate: 75, submissionRate: 25 };
let saved: Record<string, unknown>;
function mount(role: AuthUser['role'] = 'ADMIN', language = 'en', path = '/dashboard') {
  localStorage.setItem('hygene-ops.language', language);
  const store = configureStore({ reducer: { auth: authReducer } });
  store.dispatch(setUser({ id: 7, role, name: 'Synthetic account', email: 'fixture@example.invalid', companyId: 42 }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const router = createMemoryRouter([{ path: '/dashboard', element: <DashboardPage /> }], { initialEntries: [path] });
  render(<Provider store={store}><QueryClientProvider client={client}><LanguageProvider><div className="workspace"><RouterProvider router={router} /></div></LanguageProvider></QueryClientProvider></Provider>);
  return router;
}
beforeEach(() => {
  localStorage.clear(); m.get.mockReset();
  saved = { asOf: '2026-10-28T03:00:00Z', locations: [site], selected: [site], days: [{ locationId: 20, localDate: '2026-10-28', timezone: site.timezone }], dateFrom: '2026-10-22', dateTo: '2026-10-28', period: 7, summary: { ...counts, previous: counts, attendanceChange: null, submissionChange: 5, totalLocations: 1, activeLocations: 1, totalStaff: 2 }, sites: [{ ...counts, location: site, staff: 2, today: { ...counts, status: 'ATTENTION' } }], series: [{ ...counts, date: '2026-10-28', offset: 0 }] };
  m.get.mockImplementation(async () => ({ data: { data: structuredClone(saved) } }));
});
it('uses persisted rates, totals, daily figures and exact site action links', async () => {
  mount(); await screen.findByRole('heading', { name: 'Needs attention today' });
  expect(m.get).toHaveBeenCalledWith('/manager/operations/performance', expect.objectContaining({ params: { date: 'today', period: '7' }, signal: expect.any(AbortSignal) }));
  const metrics = screen.getByRole('region', { name: 'Performance summary' });
  expect(within(metrics).getByText('75%')).toBeInTheDocument(); expect(within(metrics).getByText('25%')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View daily records: Synthetic site' })).toHaveAttribute('href', '/today-status?date=today&locationId=20');
  expect(screen.queryByText('1 verified')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('View daily figures')); expect(screen.getByText('3 / 4 (75%)')).toBeInTheDocument();
});
it('keeps period and location filters in the real API query', async () => {
  const router = mount('ADMIN', 'en', '/dashboard?locationId=20&date=2026-10-28'); await screen.findByRole('heading', { name: 'Needs attention today' });
  fireEvent.click(screen.getByRole('button', { name: 'Last 30 days' }));
  await waitFor(() => expect(m.get).toHaveBeenLastCalledWith('/manager/operations/performance', expect.objectContaining({ params: { locationId: '20', date: '2026-10-28', period: '30' } })));
  expect(router.state.location.search).toContain('locationId=20');
});
it('shows the manager historical report and scoped action links', async () => {
  mount('MANAGER', 'en', '/dashboard?locationId=20'); await screen.findByRole('heading', { name: 'Location overview' });
  expect(await screen.findByRole('heading', { name: 'Assigned-site actions' })).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Performance summary' })).not.toBeInTheDocument();
  expect(screen.queryByText('Manage locations')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Photo reviews/ })).toHaveAttribute('href', '/exceptions?locationId=20&period=all');
});
it('clears a no-match search without hiding the saved performance totals', async () => {
  mount(); await screen.findByText('Synthetic site', { selector: 'strong' });
  fireEvent.change(screen.getByRole('textbox', { name: 'Find a location' }), { target: { value: 'absent' } });
  expect(screen.getByText('No matching locations.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' })); expect(screen.getByText('Synthetic site', { selector: 'strong' })).toBeInTheDocument();
});
it('never describes an unavailable report as zero performance; real retry recovers', async () => {
  m.get.mockRejectedValue(new Error('Unavailable')); mount(); await screen.findByRole('alert');
  expect(screen.queryByRole('heading', { name: 'Needs attention today' })).not.toBeInTheDocument();
  m.get.mockImplementation(async () => ({ data: { data: saved } })); fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await screen.findByRole('heading', { name: 'Needs attention today' });
});
it('keeps empty assigned scope distinct and translates the actual manager view in Urdu', async () => {
  saved = { ...saved, sites: [] }; mount('MANAGER', 'ur'); await screen.findByRole('heading', { name: 'ابھی کوئی مقام تفویض نہیں' });
  expect(document.documentElement.dir).toBe('rtl'); expect(screen.queryByRole('link', { name: 'مقامات کا انتظام' })).not.toBeInTheDocument();
});
