import { useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DataTable from '@/components/common/DataTable';
import OperationStatus from '@/components/common/OperationStatus';
import { OperatorBoundary, OperatorShell } from './OperatorLogin';
import { operatorQueryScope } from './operatorSession';
import { getAudit, getDiagnostics, getInquiries, getInquiry, getSupportContact, saveInquiry, type HandlingStatus, type InquiryDetail } from './serviceApi';
import './service.css';

type View = 'diagnostics' | 'audit' | 'inquiries';
const statusLabel = { NEW: 'New', IN_PROGRESS: 'In progress', CLOSED: 'Closed' };
const actionLabel = { COMPANY_SUSPENDED: 'Company suspended', COMPANY_REACTIVATED: 'Company reactivated', INQUIRY_UPDATED: 'Inquiry handling updated' };
function statusCode(error: unknown) { const value = error as { status?: number; response?: { status?: number } } | null; return value?.response?.status ?? value?.status; }
function failure(error: unknown) { const status = statusCode(error); return status === 401 || status === 403 ? 'Platform access denied. Sign in with a provisioned operator account.' : status === 404 ? 'Inquiry not found.' : 'Service records are unavailable. Retry the scoped request.'; }
export default function ServicePage({ initialView = 'diagnostics' }: { initialView?: View }) { return <OperatorBoundary><ServiceWorkspace initialView={initialView} /></OperatorBoundary>; }
/** Protected route remains disabled until the actual browser identity adapter is qualified. */
export function ServiceWorkspace({ initialView = 'diagnostics' }: { initialView?: View }) {
  const { t, language } = useLanguage();
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const selected = params.get('view');
  const view: View = selected === 'audit' || selected === 'inquiries' || selected === 'diagnostics' ? selected : initialView;
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [company, setCompany] = useState(params.get('companyId') ?? '');
  const [action, setAction] = useState(params.get('action') ?? '');
  const id = params.get('inquiry');
  const diagnostics = useQuery({ queryKey: [...operatorQueryScope, 'diagnostics'], queryFn: ({ signal }) => getDiagnostics(signal), enabled: view === 'diagnostics', retry: false });
  const support = useQuery({ queryKey: [...operatorQueryScope, 'support-contact'], queryFn: ({ signal }) => getSupportContact(signal), enabled: view === 'diagnostics', retry: false });
  const audit = useQuery({ queryKey: [...operatorQueryScope, 'audit', params.toString()], queryFn: ({ signal }) => getAudit({ companyId: params.get('companyId') ?? undefined, action: params.get('action') ?? undefined, after: params.get('after') ?? undefined }, signal), enabled: view === 'audit', retry: false });
  const inquiries = useQuery({ queryKey: [...operatorQueryScope, 'inquiries', params.toString()], queryFn: ({ signal }) => getInquiries({ q: params.get('q') ?? undefined, after: params.get('after') ?? undefined }, signal), enabled: view === 'inquiries' && !id, retry: false });
  const detail = useQuery({ queryKey: [...operatorQueryScope, 'inquiry', id], queryFn: ({ signal }) => getInquiry(id!, signal), enabled: view === 'inquiries' && !!id, retry: false });
  const current = view === 'diagnostics' ? diagnostics : view === 'audit' ? audit : id ? detail : inquiries;
  const stamp = (value: string | null | undefined) => value && Number.isFinite(Date.parse(value)) ? <time dateTime={value}>{new Date(value).toLocaleString(language === 'ur' ? 'ur-PK' : 'en-PK')}</time> : t('Not observed');
  const page = view === 'audit' ? audit.data : inquiries.data;
  const supportEmail = support.data?.available && support.data.channel === 'EMAIL' && support.data.verification === 'OPERATOR_CONFIGURED' && support.data.email && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(support.data.email) && !/[\r\n?#]/.test(support.data.email) ? support.data.email : null;
  function filters(event: FormEvent) { event.preventDefault(); setParams(view === 'audit' ? { view, ...(company ? { companyId: company } : {}), ...(action ? { action } : {}) } : { view, ...(search.trim() ? { q: search.trim() } : {}) }); }
  return <OperatorShell title={t('Platform service')}><div className="platform-service-workspace ops-page">
    <nav className="platform-service-actions" aria-label={t('Platform navigation')}><Link to="/platform/companies">{t('Companies')}</Link><Link to="/platform/security">{t('Platform security')}</Link></nav>
    <div className="platform-service-actions" role="group" aria-label={t('Service sections')}>{(['diagnostics', 'audit', 'inquiries'] as const).map(value => <Button key={value} variant={view === value ? 'default' : 'outline'} aria-pressed={view === value} onClick={() => setParams({ view: value })}>{t({ diagnostics: 'Service diagnostics', audit: 'Administrative audit', inquiries: 'Customer inquiries' }[value])}</Button>)}</div>
    {current.isFetching ? <p role="status">{t('Loading service records…')}</p> : null}
    {current.isError ? <div role="alert"><p>{t(failure(current.error))}</p><Button onClick={() => void current.refetch()}>{t('Retry')}</Button></div> : null}
    {view === 'diagnostics' && diagnostics.data && !diagnostics.isError ? <section className="ops-panel ops-panel-body"><h2>{t('Observed service signals')}</h2>
      <p>{t('These observations do not prove overall health, provider delivery or production readiness.')}</p>
      <dl className="platform-service-facts"><div><dt>{t('Observed at')}</dt><dd>{stamp(diagnostics.data.observedAt)}</dd></div><div><dt>{t('Database query')}</dt><dd><OperationStatus state={diagnostics.data.database === 'UNAVAILABLE' ? 'MISSING' : undefined} label={diagnostics.data.database === 'REACHABLE' ? 'Reachable at observation' : 'Database unavailable'} /></dd></div><div><dt>{t('Identity configuration')}</dt><dd>{t(diagnostics.data.identityConfigured ? 'Configured; browser sign-in qualification is separate.' : 'Not configured')}</dd></div><div><dt>{t('Provider connectivity')}</dt><dd>{t('Not checked')}</dd></div><div><dt>{t('Last webhook occurred')}</dt><dd>{stamp(diagnostics.data.observations?.lastWebhookOccurredAt)}</dd></div><div><dt>{t('Last webhook processed')}</dt><dd>{stamp(diagnostics.data.observations?.lastWebhookProcessedAt)}</dd></div><div><dt>{t('Last worker heartbeat')}</dt><dd>{stamp(diagnostics.data.observations?.lastWorkerHeartbeatAt)}</dd></div></dl>
      <Button variant="outline" disabled={diagnostics.isFetching} onClick={() => void diagnostics.refetch()}>{t('Refresh observations')}</Button>
    </section> : null}
    {view === 'diagnostics' ? <section className="ops-panel ops-panel-body"><h2>{t('Support handoff')}</h2>{support.isFetching ? <p role="status">{t('Loading support contact…')}</p> : null}{support.isError ? <div role="alert"><p>{t('Support contact could not be loaded.')}</p><Button onClick={() => void support.refetch()}>{t('Retry support contact')}</Button></div> : support.data ? supportEmail ? <><p>{t('This mailbox is operator configured. Opening email does not confirm message delivery.')}</p><a href={`mailto:${encodeURIComponent(supportEmail)}`}>{t('Open support email')} · <bdi>{supportEmail}</bdi></a></> : <p>{t('Support contact is unavailable. No delivery channel has been qualified.')}</p> : null}</section> : null}
    {view === 'audit' ? <>
      <form className="platform-service-filters" onSubmit={filters}><label>{t('Company ID')}<Input inputMode="numeric" pattern="[1-9][0-9]{0,9}" maxLength={10} value={company} onChange={event => setCompany(event.target.value)} /></label><label>{t('Audit action')}<select value={action} onChange={event => setAction(event.target.value)}><option value="">{t('All actions')}</option>{Object.entries(actionLabel).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label><Button type="submit">{t('Apply filters')}</Button></form>
      {audit.data && !audit.isError ? <DataTable data={audit.data.items} rowKey={row => row.id} pageSize={25} emptyMessage={t('No administrative activity matches these filters.')} columns={[{ key: 'action', header: t('Audit action'), render: row => t(actionLabel[row.action]) }, { key: 'company', header: t('Company ID'), render: row => row.companyId ?? t('Platform inquiry') }, { key: 'actor', header: t('Actor type'), render: () => t('Platform operator') }, { key: 'time', header: t('Recorded at'), render: row => stamp(row.createdAt) }]} /> : null}
    </> : null}
    {view === 'inquiries' && !id ? <>
      <p>{t('Submitted contact details are unverified. Queue handling does not send a message or verify a customer.')}</p>
      <form className="platform-service-filters" onSubmit={filters}><label>{t('Search submitted companies')}<Input maxLength={100} value={search} onChange={event => setSearch(event.target.value)} /></label><Button type="submit">{t('Apply filters')}</Button></form>
      {inquiries.data && !inquiries.isError ? <DataTable data={inquiries.data.items} rowKey={row => row.id} pageSize={25} emptyMessage={t('No inquiries match these filters.')} columns={[{ key: 'company', header: t('Submitted company'), render: row => <Link to={`?${new URLSearchParams({ view: 'inquiries', inquiry: row.id })}`}>{row.company}</Link> }, { key: 'status', header: t('Handling status'), render: row => <OperationStatus state={row.handling.status} label={statusLabel[row.handling.status]} /> }, { key: 'locations', header: t('Requested locations'), render: row => row.requestedLocations }, { key: 'staff', header: t('Requested staff'), render: row => row.requestedStaff }, { key: 'owner', header: t('Assigned operator'), render: row => row.handling.owner ? <bdi>{row.handling.owner.subject}</bdi> : t('Unassigned') }]} /> : null}
    </> : null}
    {view === 'inquiries' && id ? <><Link to="?view=inquiries">{t('Back to inquiries')}</Link>{detail.data && !detail.isError ? <InquiryEditor key={id} inquiry={detail.data} refresh={async () => { try { const latest = await getInquiry(id); client.setQueryData([...operatorQueryScope, 'inquiry', id], latest); return latest; } catch { return undefined; } }} stamp={stamp} /> : null}</> : null}
    {view !== 'diagnostics' && !(view === 'inquiries' && id) && page && !current.isError ? <div className="platform-service-actions">{params.get('after') ? <Button variant="outline" onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.delete('after'); return next; })}>{t('First page')}</Button> : null}{page.nextCursor ? <Button variant="outline" onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.set('after', page.nextCursor!); return next; })}>{t('Next page')}</Button> : null}</div> : null}
  </div></OperatorShell>;
}

function InquiryEditor({ inquiry, refresh, stamp }: { inquiry: InquiryDetail; refresh: () => Promise<InquiryDetail | undefined>; stamp: (value: string | null) => React.ReactNode }) {
  const { t } = useLanguage();
  const client = useQueryClient();
  const [status, setStatus] = useState<HandlingStatus>(inquiry.handling.status);
  // A deliberate ownership choice is required; never silently take someone else's queue item.
  const [ownership, setOwnership] = useState<'' | 'SELF' | 'UNASSIGNED'>('');
  const [version, setVersion] = useState(inquiry.handling.version);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const lock = useRef(false);
  async function save(event: FormEvent) {
    event.preventDefault(); if (lock.current || !reason.trim() || !ownership || needsRefresh) return;
    lock.current = true; setBusy(true); setError(''); setSaved(false);
    try {
      const result = await saveInquiry(inquiry.id, { status, ownership, expectedVersion: version, reason: reason.trim() });
      setVersion(result.handling.version); setReason(''); setSaved(true);
      await client.invalidateQueries({ queryKey: [...operatorQueryScope, 'inquiry', inquiry.id] });
      await client.invalidateQueries({ queryKey: [...operatorQueryScope, 'inquiries'] });
    } catch (cause) {
      setNeedsRefresh(true);
      setError(statusCode(cause) === 409 ? 'Inquiry handling changed. Refresh before saving. Your draft is kept.' : 'The update could not be confirmed. Refresh before retrying. Your draft is kept.');
    } finally { lock.current = false; setBusy(false); }
  }
  return <section className="ops-panel ops-panel-body"><h2>{inquiry.company}</h2><p>{t('Submitted contact details are unverified. Queue handling does not send a message or verify a customer.')}</p>
    <dl className="platform-service-facts"><div><dt>{t('Contact name')}</dt><dd>{inquiry.contactName}</dd></div><div><dt>{t('Submitted email')}</dt><dd><bdi>{inquiry.contactEmail}</bdi></dd></div><div><dt>{t('Contact verification')}</dt><dd>{t('Unverified')}</dd></div><div><dt>{t('Requested locations')}</dt><dd>{inquiry.requestedLocations}</dd></div><div><dt>{t('Requested staff')}</dt><dd>{inquiry.requestedStaff}</dd></div><div><dt>{t('Recorded handling status')}</dt><dd>{t(statusLabel[inquiry.handling.status])}</dd></div><div><dt>{t('Assigned operator')}</dt><dd>{inquiry.handling.owner ? <><bdi>{inquiry.handling.owner.subject}</bdi><br /><bdi>{inquiry.handling.owner.issuer}</bdi></> : t('Unassigned')}</dd></div><div><dt>{t('Handling updated at')}</dt><dd>{stamp(inquiry.handling.updatedAt)}</dd></div></dl>
    <h3>{t('Submitted requirements')}</h3><p className="platform-service-submission">{inquiry.requirements || t('Not provided')}</p>
    <form className="platform-service-edit" onSubmit={save}><h3>{t('Record inquiry handling')}</h3><label>{t('Handling status')}<select value={status} disabled={busy} onChange={event => setStatus(event.target.value as HandlingStatus)}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label><label>{t('Ownership decision')}<select required value={ownership} disabled={busy} onChange={event => setOwnership(event.target.value as typeof ownership)}><option value="">{t('Choose ownership')}</option><option value="SELF">{t('Assign to me')}</option><option value="UNASSIGNED">{t('Leave unassigned')}</option></select></label><label>{t('Reason')}<Input required maxLength={500} pattern="[^\x00-\x1F\x7F]+" value={reason} disabled={busy} onChange={event => setReason(event.target.value)} /></label>
      {error ? <div role="alert"><p>{t(error)}</p><Button type="button" variant="outline" disabled={busy} onClick={async () => { setBusy(true); try { const latest = await refresh(); if (latest) { setVersion(latest.handling.version); setNeedsRefresh(false); setError(''); } } finally { setBusy(false); } }}>{t('Refresh inquiry')}</Button></div> : null}
      {saved ? <p role="status">{t('Handling saved. No message was sent and contact remains unverified.')}</p> : null}
      <Button type="submit" disabled={busy || needsRefresh || !reason.trim() || !ownership}>{t(busy ? 'Saving…' : 'Save handling')}</Button>
    </form>
  </section>;
}
