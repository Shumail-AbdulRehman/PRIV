import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { ServiceWorkspace } from './ServicePage';
import { platformRoutes } from './platformRoutes';
function ActualRoutes() { return useRoutes(platformRoutes); }
import type { Diagnostics, InquiryDetail } from './serviceApi';
const mock = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('./operatorSession', async original => ({ ...await original<typeof import('./operatorSession')>(), operatorRequest: mock.request }));
const id = '00000000-0000-4000-8000-000000000001';
let inquiry: InquiryDetail, diagnostics: Diagnostics;
function mount(path = '/platform/service', boundary = false, language = 'en') {
  localStorage.setItem('hygene-ops.language', language);
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><LanguageProvider><MemoryRouter initialEntries={[path]}>{boundary ? <ActualRoutes /> : <ServiceWorkspace />}</MemoryRouter></LanguageProvider></QueryClientProvider>);
}
const openInquiry = () => mount(`/platform/inquiries?view=inquiries&inquiry=${id}`);
function draft() {
  fireEvent.change(screen.getByLabelText('Handling status'), { target: { value: 'IN_PROGRESS' } });
  fireEvent.change(screen.getByLabelText('Ownership decision'), { target: { value: 'SELF' } });
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Review requested setup' } });
}
beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear();
  inquiry = { id, company: 'Synthetic prospect', requestedLocations: 7, requestedStaff: 35, createdAt: '2026-10-21T00:00:00Z', contactVerification: 'UNVERIFIED', contactName: 'Synthetic sender', contactEmail: 'sender@example.invalid', requirements: '<img src=x onerror=alert(1)> https://untrusted.invalid', handling: { version: 0, status: 'NEW', owner: null, updatedAt: null } };
  diagnostics = { observedAt: '2026-10-21T00:00:00Z', identityConfigured: false, supportContactAvailable: false, providerConnectivity: 'NOT_CHECKED', database: 'UNAVAILABLE', observations: null };
  mock.request.mockImplementation(async (path: string, options?: { method?: string; body?: { status: 'NEW' | 'IN_PROGRESS' | 'CLOSED'; ownership: string } }) => {
    if (options?.method === 'PATCH') {
      inquiry.handling = { version: 12, status: options.body!.status, owner: options.body!.ownership === 'SELF' ? { issuer: 'https://issuer.example.invalid', subject: 'named-operator' } : null, updatedAt: '2026-10-21T01:00:00Z' };
      return { data: { handling: structuredClone(inquiry.handling), changed: true } };
    }
    if (path.endsWith('/diagnostics')) return { data: diagnostics };
    if (path === '/support/contact') return { data: { available: false, email: null, channel: null, verification: 'UNAVAILABLE' } };
    if (path.includes('/audit?')) return { data: { items: [{ id: 12, companyId: 42, action: 'COMPANY_SUSPENDED', actorType: 'PLATFORM_OPERATOR', createdAt: inquiry.createdAt, staff: 'PRIVATE WORKFORCE', secret: 'PRIVATE TOKEN' }], nextCursor: '12' } };
    if (path.includes('/inquiries?')) return { data: { items: [{ ...inquiry, privateStaff: 'PRIVATE WORKFORCE' }], nextCursor: id } };
    return { data: structuredClone(inquiry) };
  });
});
it.each(['/platform/service', '/platform/audit', '/platform/inquiries'])('actual guarded route %s rejects tenant/storage role claims without requests', path => {
  localStorage.setItem('operator', JSON.stringify({ role: 'ADMIN', kind: 'PLATFORM_OPERATOR' })); mount(path, true);
  expect(screen.getByRole('heading', { name: 'Platform sign in' })).toBeInTheDocument(); expect(screen.queryByText('Service diagnostics')).not.toBeInTheDocument(); expect(mock.request).not.toHaveBeenCalled();
});
it('database unavailable and null timestamps do not become healthy or successful delivery', async () => {
  mount(); await screen.findByText('Database unavailable'); expect(screen.getByText('Not checked')).toBeInTheDocument(); expect(screen.getAllByText('Not observed')).toHaveLength(3);
  expect(screen.getByText('Support contact is unavailable. No delivery channel has been qualified.')).toBeInTheDocument(); expect(screen.queryByRole('link', { name: /Open support email/ })).not.toBeInTheDocument();
  const previous = mock.request.mock.calls.length; fireEvent.click(screen.getByRole('button', { name: 'Refresh observations' })); await waitFor(() => expect(mock.request.mock.calls.length).toBeGreaterThan(previous)); expect(mock.request).toHaveBeenCalledWith('/platform/service/diagnostics', expect.any(Object));
});
it('reachable reports the actual observation without claiming provider or browser readiness', async () => {
  diagnostics.database = 'REACHABLE'; diagnostics.identityConfigured = true; diagnostics.observations = { lastWebhookOccurredAt: '2026-10-21T00:00:00Z', lastWebhookProcessedAt: null, lastWorkerHeartbeatAt: null };
  mount(); await screen.findByText('Reachable at observation'); expect(screen.getByText('Configured; browser sign-in qualification is separate.')).toBeInTheDocument(); expect(screen.getAllByText('Not observed')).toHaveLength(2);
});
it.each([403, 503])('failed diagnostic %s is neither an empty result nor healthy; retry makes a request', async status => {
  mock.request.mockRejectedValue({ status, message: 'PRIVATE TOKEN' }); mount(); await screen.findAllByRole('alert'); expect(screen.queryByText('Reachable at observation')).not.toBeInTheDocument(); expect(screen.queryByText('PRIVATE TOKEN')).not.toBeInTheDocument();
  const previous = mock.request.mock.calls.length; fireEvent.click(screen.getByRole('button', { name: 'Retry' })); await waitFor(() => expect(mock.request.mock.calls.length).toBeGreaterThan(previous));
});
it('audit allows only bounded metadata filters and excludes unexpected private fields', async () => {
  mount('/platform/audit?view=audit'); await screen.findAllByText('Company suspended'); expect(screen.queryByText('PRIVATE WORKFORCE')).not.toBeInTheDocument(); expect(screen.queryByText('PRIVATE TOKEN')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Company ID'), { target: { value: '42' } }); fireEvent.change(screen.getByLabelText('Audit action'), { target: { value: 'INQUIRY_UPDATED' } }); fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  await waitFor(() => expect(mock.request).toHaveBeenCalledWith('/platform/service/audit?limit=25&companyId=42&action=INQUIRY_UPDATED', expect.any(Object)));
  fireEvent.click(await screen.findByRole('button', { name: 'Next page' })); await waitFor(() => expect(mock.request).toHaveBeenCalledWith('/platform/service/audit?limit=25&companyId=42&action=INQUIRY_UPDATED&after=12', expect.any(Object)));
});
it('inquiry search pages the existing queue, without listing submitted contacts or workforce', async () => {
  mount('/platform/inquiries?view=inquiries'); await screen.findAllByRole('link', { name: 'Synthetic prospect' }); expect(screen.queryByText('sender@example.invalid')).not.toBeInTheDocument(); expect(screen.queryByText('PRIVATE WORKFORCE')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search submitted companies'), { target: { value: 'Synthetic' } }); fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  await waitFor(() => expect(mock.request).toHaveBeenCalledWith('/platform/service/inquiries?limit=25&q=Synthetic', expect.any(Object)));
  fireEvent.click(await screen.findByRole('button', { name: 'Next page' })); await waitFor(() => expect(mock.request).toHaveBeenCalledWith(`/platform/service/inquiries?limit=25&q=Synthetic&after=${id}`, expect.any(Object)));
});
it('detail escapes untrusted submission text and saves accountable handling to the real API contract', async () => {
  openInquiry(); await screen.findByRole('heading', { name: 'Synthetic prospect' }); expect(screen.getByText(inquiry.requirements)).toBeInTheDocument(); expect(document.querySelector('img[src="x"]')).toBeNull(); expect(screen.queryByRole('link', { name: /untrusted/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save handling' })).toBeDisabled(); draft(); fireEvent.click(screen.getByRole('button', { name: 'Save handling' }));
  await screen.findByText('Handling saved. No message was sent and contact remains unverified.');
  expect(mock.request).toHaveBeenCalledWith(`/platform/service/inquiries/${id}`, { method: 'PATCH', body: { expectedVersion: 0, status: 'IN_PROGRESS', ownership: 'SELF', reason: 'Review requested setup' } });
  expect(screen.getByText('named-operator')).toBeInTheDocument(); expect(screen.getByText('Unverified')).toBeInTheDocument(); expect(screen.getByLabelText('Reason')).toHaveValue('');
});
it('stale conflict retains draft, requires real refresh, then saves explicitly with the new version', async () => {
  const normal = mock.request.getMockImplementation()!; let conflict = true;
  mock.request.mockImplementation(async (...args) => { if (args[1]?.method === 'PATCH' && conflict) { conflict = false; inquiry.handling.version = 9; inquiry.handling.status = 'CLOSED'; throw { status: 409 }; } return normal(...args); });
  openInquiry(); await screen.findByRole('heading', { name: 'Synthetic prospect' }); draft(); fireEvent.click(screen.getByRole('button', { name: 'Save handling' })); await screen.findByRole('alert');
  expect(screen.getByLabelText('Reason')).toHaveValue('Review requested setup'); expect(screen.getByLabelText('Handling status')).toHaveValue('IN_PROGRESS'); expect(screen.getByRole('button', { name: 'Save handling' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh inquiry' })); await waitFor(() => expect(screen.getByRole('button', { name: 'Save handling' })).toBeEnabled()); expect(screen.getByLabelText('Reason')).toHaveValue('Review requested setup');
  fireEvent.click(screen.getByRole('button', { name: 'Save handling' })); await screen.findByText('Handling saved. No message was sent and contact remains unverified.'); expect(mock.request).toHaveBeenCalledWith(expect.any(String), { method: 'PATCH', body: { expectedVersion: 9, status: 'IN_PROGRESS', ownership: 'SELF', reason: 'Review requested setup' } });
});
it('failed refresh preserves editable draft and does not automatically retry an uncertain mutation', async () => {
  const normal = mock.request.getMockImplementation()!; let failed = false;
  mock.request.mockImplementation(async (...args) => { if (args[1]?.method === 'PATCH') { failed = true; throw { status: 503 }; } if (failed) throw { status: 503 }; return normal(...args); });
  openInquiry(); await screen.findByLabelText('Reason'); draft(); fireEvent.click(screen.getByRole('button', { name: 'Save handling' })); await screen.findByRole('alert'); fireEvent.click(screen.getByRole('button', { name: 'Refresh inquiry' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh inquiry' })).toBeEnabled()); expect(screen.getByLabelText('Reason')).toHaveValue('Review requested setup'); expect(mock.request.mock.calls.filter(([, options]) => options?.method === 'PATCH')).toHaveLength(1); expect(screen.getByRole('button', { name: 'Save handling' })).toBeDisabled();
});
it('unassigned handling never sends a client-chosen operator identity', async () => {
  openInquiry(); await screen.findByLabelText('Reason'); draft(); fireEvent.change(screen.getByLabelText('Ownership decision'), { target: { value: 'UNASSIGNED' } }); fireEvent.click(screen.getByRole('button', { name: 'Save handling' })); await screen.findByText('Handling saved. No message was sent and contact remains unverified.');
  expect(mock.request).toHaveBeenCalledWith(expect.any(String), { method: 'PATCH', body: { expectedVersion: 0, status: 'IN_PROGRESS', ownership: 'UNASSIGNED', reason: 'Review requested setup' } });
});
it.each(['inquiries', 'audit'])('%s empty results have distinct feedback with no next page', async view => {
  mock.request.mockResolvedValue({ data: { items: [], nextCursor: null } }); mount(`/platform/service?view=${view}`); await screen.findByText(view === 'audit' ? 'No administrative activity matches these filters.' : 'No inquiries match these filters.'); expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
});
it('support handoff only links a configured contact and claims no delivery', async () => {
  const normal = mock.request.getMockImplementation()!; mock.request.mockImplementation(async (...args) => args[0] === '/support/contact' ? { data: { available: true, email: 'support@example.invalid', channel: 'EMAIL', verification: 'OPERATOR_CONFIGURED' } } : normal(...args));
  mount(); expect(await screen.findByRole('link', { name: /Open support email/ })).toHaveAttribute('href', 'mailto:support%40example.invalid'); expect(screen.getByText(/Opening email does not confirm message delivery/)).toBeInTheDocument();
});
it('Urdu workspace has translated labels and RTL', async () => { mount('/platform/service', false, 'ur'); await screen.findByText('ڈیٹابیس دستیاب نہیں'); expect(screen.getByRole('heading', { name: 'پلیٹ فارم کی سروس' })).toBeInTheDocument(); expect(document.documentElement.dir).toBe('rtl'); });

it.each([
 { available: true, email: 'support@example.invalid?bcc=other@example.invalid', channel: 'EMAIL', verification: 'OPERATOR_CONFIGURED' },
 { available: true, email: 'support@example.invalid', channel: 'EMAIL', verification: 'UNAVAILABLE' },
])('unqualified or malformed support contact never becomes an actionable handoff', async contact => {
 const normal = mock.request.getMockImplementation()!; mock.request.mockImplementation(async (...args) => args[0] === '/support/contact' ? { data: contact } : normal(...args)); mount(); await screen.findByText('Support contact is unavailable. No delivery channel has been qualified.'); expect(screen.queryByRole('link', { name: /Open support email/ })).not.toBeInTheDocument();
});
it.each([403, 404])('inquiry detail denial %s renders no fabricated or private contact details', async status => {
 mock.request.mockRejectedValue({ status }); openInquiry(); await screen.findByRole('alert'); expect(screen.queryByLabelText('Reason')).not.toBeInTheDocument(); expect(screen.queryByText('sender@example.invalid')).not.toBeInTheDocument();
});
it('rapid duplicate save clicks issue only one pending mutation', async () => {
 const normal = mock.request.getMockImplementation()!; let finish: (() => void) | undefined;
 mock.request.mockImplementation(async (...args) => { if (args[1]?.method === 'PATCH') await new Promise<void>(resolve => { finish = resolve; }); return normal(...args); });
 openInquiry(); await screen.findByLabelText('Reason'); draft(); const save = screen.getByRole('button', { name: 'Save handling' }); fireEvent.click(save); fireEvent.click(save); expect(mock.request.mock.calls.filter(([, options]) => options?.method === 'PATCH')).toHaveLength(1); finish!(); await screen.findByText('Handling saved. No message was sent and contact remains unverified.');
});
