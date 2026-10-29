import { useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Building2, ClipboardList, Menu, RefreshCw, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DataTable from '@/components/common/DataTable';
import OperationStatus from '@/components/common/OperationStatus';
import PageHeader from '@/components/common/PageHeader';
import { OperatorBoundary, OperatorShell } from './OperatorLogin';
import { operatorQueryScope } from './operatorSession';
import { getAudit, getDiagnostics, getInquiries, getInquiry, getSupportContact, saveInquiry, type HandlingStatus, type InquiryDetail } from './serviceApi';
import './service.css';

type View = 'diagnostics' | 'audit' | 'inquiries';
const statusLabel = { NEW: 'New', IN_PROGRESS: 'In progress', CLOSED: 'Closed' };
const actionLabel = { COMPANY_SUSPENDED: 'Company suspended', COMPANY_REACTIVATED: 'Company reactivated', INQUIRY_UPDATED: 'Inquiry handling updated' };
const viewLabel = { diagnostics: 'Service diagnostics', audit: 'Administrative audit', inquiries: 'Customer inquiries' };
const viewDescription = { diagnostics: 'Inspect recorded service signals and find the next accountable step.', audit: 'Review recorded account and inquiry actions without opening workforce records.', inquiries: 'Review submitted requests and record an explicit handling decision.' };
function statusCode(error: unknown) { const value = error as { status?: number; response?: { status?: number } } | null; return value?.response?.status ?? value?.status; }
function failure(error: unknown) { const status = statusCode(error); return status === 401 || status === 403 ? 'Platform access denied. Sign in with a provisioned operator account.' : status === 404 ? 'Inquiry not found.' : 'Service records are unavailable. Retry the scoped request.'; }
export default function ServicePage({ initialView = 'diagnostics' }: { initialView?: View }) { return <OperatorBoundary><ServiceWorkspace initialView={initialView} /></OperatorBoundary>; }
/** Protected route remains disabled until the actual browser identity adapter is qualified. */
export function ServiceWorkspace({ initialView = 'diagnostics' }: { initialView?: View }) {
  const { t, language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [navigationOpen, setNavigationOpen] = useState(false);
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
  const detailDenied = detail.isError && [401, 403, 404].includes(statusCode(detail.error) ?? 0);
  const supportEmail = !support.isError && !support.isFetching && support.data?.available && support.data.channel === 'EMAIL' && support.data.verification === 'OPERATOR_CONFIGURED' && support.data.email && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(support.data.email) && !/[\r\n?#]/.test(support.data.email) ? support.data.email : null;
  function filters(event: FormEvent) { event.preventDefault(); setParams(view === 'audit' ? { view, ...(company ? { companyId: company } : {}), ...(action ? { action } : {}) } : { view, ...(search.trim() ? { q: search.trim() } : {}) }); }
  const navigation = [
    { href: '/platform/companies', label: 'Companies', icon: Building2, selected: false },
    { href: '/platform/service', label: 'Service diagnostics', icon: Activity, selected: view === 'diagnostics' },
    { href: '/platform/audit', label: 'Administrative audit', icon: ClipboardList, selected: view === 'audit' },
    { href: '/platform/inquiries', label: 'Customer inquiries', icon: ClipboardList, selected: view === 'inquiries' },
    { href: '/platform/security', label: 'Platform security', icon: ShieldCheck, selected: false },
  ];
  return <OperatorShell title={t('Platform service')}><div className="platform-service-workspace">
    <aside className="platform-service-sidebar">
      <div className="platform-service-context"><ShieldCheck size={20} aria-hidden="true" /><div><strong>Hygene Ops</strong><span>{t('Platform operations')}</span></div></div>
      <Button className="platform-service-menu" variant="outline" aria-expanded={navigationOpen} aria-controls="platform-service-navigation" onClick={() => setNavigationOpen(!navigationOpen)}><Menu size={18} aria-hidden="true" />{t('Platform navigation')}</Button>
      <nav id="platform-service-navigation" className={navigationOpen ? 'is-open' : ''} aria-label={t('Platform navigation')}>{navigation.map(item => <Link key={item.href} to={item.href} aria-current={item.selected ? 'page' : undefined} onClick={() => setNavigationOpen(false)}><item.icon size={18} aria-hidden="true" /><span>{t(item.label)}</span></Link>)}</nav>
      <p className="platform-service-boundary"><ShieldCheck size={16} aria-hidden="true" />{t('Account metadata only. No workforce records or photos.')}</p>
    </aside>
    <div className="platform-service-main ops-page">
    <PageHeader title={viewLabel[view]} subtitle={viewDescription[view]} action={view !== 'diagnostics' ? <Button variant="outline" disabled={current.isFetching} onClick={() => void current.refetch()}><RefreshCw size={16} aria-hidden="true" />{t('Refresh records')}</Button> : undefined} />
    <div className="platform-service-tabs" role="group" aria-label={t('Service sections')}>{(['diagnostics', 'audit', 'inquiries'] as const).map(value => <button key={value} type="button" aria-pressed={view === value} onClick={() => setParams({ view: value })}>{t(viewLabel[value])}</button>)}</div>
    {current.isFetching ? <div className="platform-service-loading" role="status"><span className="platform-service-skeleton" aria-hidden="true" />{t('Loading service records…')}</div> : null}
    {current.isError ? <div className="platform-service-feedback" role="alert"><p>{t(failure(current.error))}</p><Button variant="outline" disabled={current.isFetching} onClick={() => void current.refetch()}>{t('Retry')}</Button></div> : null}
    {view === 'diagnostics' ? <p className="platform-service-notice"><ShieldCheck size={18} aria-hidden="true" />{t('These observations do not prove overall health, provider delivery or production readiness.')}</p> : null}
    {view === 'diagnostics' ? <div className="platform-service-diagnostics">
    {diagnostics.data && !diagnostics.isError ? <section className="ops-panel platform-service-panel"><header className="platform-service-panel-heading"><h2>{t('Observed service signals')}</h2><Button variant="outline" disabled={diagnostics.isFetching} onClick={() => void diagnostics.refetch()}><RefreshCw size={16} aria-hidden="true" />{t('Refresh observations')}</Button></header><div className="platform-service-panel-body">
      <dl className="platform-service-facts"><div><dt>{t('Observed at')}</dt><dd>{stamp(diagnostics.data.observedAt)}</dd></div><div><dt>{t('Database query')}</dt><dd><OperationStatus state={diagnostics.data.database === 'UNAVAILABLE' ? 'MISSING' : undefined} label={diagnostics.data.database === 'REACHABLE' ? 'Reachable at observation' : 'Database unavailable'} /></dd></div><div><dt>{t('Identity configuration')}</dt><dd>{t(diagnostics.data.identityConfigured ? 'Configured; browser sign-in qualification is separate.' : 'Not configured')}</dd></div><div><dt>{t('Provider connectivity')}</dt><dd>{t('Not checked')}</dd></div><div><dt>{t('Last webhook occurred')}</dt><dd>{stamp(diagnostics.data.observations?.lastWebhookOccurredAt)}</dd></div><div><dt>{t('Last webhook processed')}</dt><dd>{stamp(diagnostics.data.observations?.lastWebhookProcessedAt)}</dd></div><div><dt>{t('Last worker heartbeat')}</dt><dd>{stamp(diagnostics.data.observations?.lastWorkerHeartbeatAt)}</dd></div></dl>
    </div></section> : !diagnostics.isError ? <div className="platform-service-placeholder" aria-hidden="true"><span /><span /><span /><span /></div> : null}
    <aside className="platform-service-stack">
      <section className="ops-panel platform-service-panel"><header className="platform-service-panel-heading"><h2>{t('Support handoff')}</h2></header><div className="platform-service-panel-body">{support.isFetching ? <p role="status">{t('Loading support contact…')}</p> : null}{support.isError ? <div role="alert"><p>{t('Support contact could not be loaded.')}</p><Button variant="outline" disabled={support.isFetching} onClick={() => void support.refetch()}>{t('Retry support contact')}</Button></div> : supportEmail ? <><p>{t('This mailbox is operator configured. Opening email does not confirm message delivery.')}</p><a className="platform-service-mail" href={`mailto:${encodeURIComponent(supportEmail)}`}>{t('Open support email')}<bdi>{supportEmail}</bdi></a></> : support.data && !support.isFetching ? <p>{t('Support contact is unavailable. No delivery channel has been qualified.')}</p> : null}{!support.isError ? <Button variant="outline" disabled={support.isFetching} onClick={() => void support.refetch()}>{t('Refresh support contact')}</Button> : null}</div></section>
      <section className="ops-panel platform-service-panel"><header className="platform-service-panel-heading"><h2>{t('Verification boundary')}</h2></header><div className="platform-service-panel-body"><p>{t('Use deployment and provider evidence before calling a service healthy.')}</p><Link to="/help">{t('Get help')}</Link></div></section>
    </aside></div> : null}
    {view === 'audit' ? <section className="ops-panel platform-service-register"><header className="platform-service-panel-heading"><h2>{t('Recent platform activity')}</h2></header>
      <form className="platform-service-filters" onSubmit={filters}><label>{t('Company ID')}<Input inputMode="numeric" pattern="[1-9][0-9]{0,9}" maxLength={10} value={company} onChange={event => setCompany(event.target.value)} /></label><label>{t('Audit action')}<select value={action} onChange={event => setAction(event.target.value)}><option value="">{t('All actions')}</option>{Object.entries(actionLabel).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label><Button type="submit">{t('Apply filters')}</Button></form>
      {audit.data && !audit.isError ? <DataTable data={audit.data.items} rowKey={row => row.id} pageSize={25} emptyMessage={t('No administrative activity matches these filters.')} columns={[{ key: 'action', header: t('Audit action'), render: row => t(actionLabel[row.action]) }, { key: 'company', header: t('Company ID'), render: row => row.companyId ?? t('Platform inquiry') }, { key: 'actor', header: t('Actor type'), render: () => t('Platform operator') }, { key: 'time', header: t('Recorded at'), render: row => stamp(row.createdAt) }]} /> : null}
    </section> : null}
    {view === 'inquiries' && !id ? <section className="ops-panel platform-service-register"><header className="platform-service-panel-heading"><h2>{t('Submitted requests')}</h2></header>
      <p className="platform-service-register-note">{t('Submitted contact details are unverified. Queue handling does not send a message or verify a customer.')}</p>
      <form className="platform-service-filters" onSubmit={filters}><label>{t('Search submitted companies')}<Input maxLength={100} value={search} onChange={event => setSearch(event.target.value)} /></label><Button type="submit">{t('Apply filters')}</Button></form>
      {inquiries.data && !inquiries.isError ? <DataTable data={inquiries.data.items} rowKey={row => row.id} pageSize={25} emptyMessage={t('No inquiries match these filters.')} columns={[{ key: 'company', header: t('Submitted company'), render: row => <Link to={`?${new URLSearchParams({ view: 'inquiries', inquiry: row.id })}`}>{row.company}</Link> }, { key: 'status', header: t('Handling status'), render: row => <OperationStatus state={row.handling.status} label={statusLabel[row.handling.status]} /> }, { key: 'locations', header: t('Requested locations'), render: row => row.requestedLocations }, { key: 'staff', header: t('Requested staff'), render: row => row.requestedStaff }, { key: 'owner', header: t('Assigned operator'), render: row => row.handling.owner ? <bdi>{row.handling.owner.subject}</bdi> : t('Unassigned') }]} /> : null}
    </section> : null}
    {view === 'inquiries' && id ? <><Link className="platform-service-back" to="?view=inquiries">{t('Back to inquiries')}</Link>{detail.data && !detailDenied ? <InquiryEditor key={id} inquiry={detail.data} stale={detail.isError} refreshing={detail.isFetching} refresh={async () => { try { const latest = await detail.refetch(); return latest.isError ? undefined : latest.data; } catch { return undefined; } }} stamp={stamp} /> : null}</> : null}
    {view !== 'diagnostics' && !(view === 'inquiries' && id) && page && !current.isError ? <div className="platform-service-pagination"><p>{t('This page contains up to 25 records.')}</p><div>{params.get('after') ? <Button variant="outline" onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.delete('after'); return next; })}>{t('First page')}</Button> : null}{page.nextCursor ? <Button variant="outline" onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.set('after', page.nextCursor!); return next; })}>{t('Next page')}</Button> : null}</div></div> : null}
  </div></div></OperatorShell>;
}

function InquiryEditor({ inquiry, stale, refreshing, refresh, stamp }: { inquiry: InquiryDetail; stale: boolean; refreshing: boolean; refresh: () => Promise<InquiryDetail | undefined>; stamp: (value: string | null) => React.ReactNode }) {
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
    event.preventDefault(); if (lock.current || !reason.trim() || !ownership || needsRefresh || stale || refreshing) return;
    lock.current = true; setBusy(true); setError(''); setSaved(false);
    try {
      const result = await saveInquiry(inquiry.id, { status, ownership, expectedVersion: version, reason: reason.trim() });
      setVersion(result.handling.version); setReason(''); setSaved(true);
      client.setQueryData([...operatorQueryScope, 'inquiry', inquiry.id], { ...inquiry, handling: result.handling });
      await client.invalidateQueries({ queryKey: [...operatorQueryScope, 'inquiry', inquiry.id] });
      await client.invalidateQueries({ queryKey: [...operatorQueryScope, 'inquiries'] });
    } catch (cause) {
      setNeedsRefresh(true);
      setError(statusCode(cause) === 409 ? 'Inquiry handling changed. Refresh before saving. Your draft is kept.' : 'The update could not be confirmed. Refresh before retrying. Your draft is kept.');
    } finally { lock.current = false; setBusy(false); }
  }
  return <div className="platform-service-inquiry"><section className="ops-panel platform-service-panel"><header className="platform-service-panel-heading"><h2>{inquiry.company}</h2></header><div className="platform-service-panel-body"><p>{t('Submitted contact details are unverified. Queue handling does not send a message or verify a customer.')}</p>
    {stale ? <p className="platform-service-stale" role="status">{t('These inquiry details could not be refreshed. Your draft is kept; refresh before saving.')}</p> : null}
    <dl className="platform-service-facts"><div><dt>{t('Contact name')}</dt><dd>{inquiry.contactName}</dd></div><div><dt>{t('Submitted email')}</dt><dd><bdi>{inquiry.contactEmail}</bdi></dd></div><div><dt>{t('Contact verification')}</dt><dd>{t('Unverified')}</dd></div><div><dt>{t('Requested locations')}</dt><dd>{inquiry.requestedLocations}</dd></div><div><dt>{t('Requested staff')}</dt><dd>{inquiry.requestedStaff}</dd></div><div><dt>{t('Recorded handling status')}</dt><dd>{t(statusLabel[inquiry.handling.status])}</dd></div><div><dt>{t('Assigned operator')}</dt><dd>{inquiry.handling.owner ? <><bdi>{inquiry.handling.owner.subject}</bdi><br /><bdi>{inquiry.handling.owner.issuer}</bdi></> : t('Unassigned')}</dd></div><div><dt>{t('Handling updated at')}</dt><dd>{stamp(inquiry.handling.updatedAt)}</dd></div></dl>
    <h3 className="platform-service-requirements-heading">{t('Submitted requirements')}</h3><p className="platform-service-submission">{inquiry.requirements || t('Not provided')}</p>
    </div></section><section className="ops-panel platform-service-panel"><header className="platform-service-panel-heading"><h2>{t('Record inquiry handling')}</h2></header><div className="platform-service-panel-body">
    <form className="platform-service-edit" onSubmit={save}><label>{t('Handling status')}<select value={status} disabled={busy} onChange={event => setStatus(event.target.value as HandlingStatus)}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label><label>{t('Ownership decision')}<select required value={ownership} disabled={busy} onChange={event => setOwnership(event.target.value as typeof ownership)}><option value="">{t('Choose ownership')}</option><option value="SELF">{t('Assign to me')}</option><option value="UNASSIGNED">{t('Leave unassigned')}</option></select></label><label>{t('Reason')}<Input required maxLength={500} pattern="[^\x00-\x1F\x7F]+" value={reason} disabled={busy} onChange={event => setReason(event.target.value)} /></label>
      <p className="platform-service-form-note">{t('This records queue handling only. No customer message is sent.')}</p>
      {error ? <div className="platform-service-form-error" role="alert"><p>{t(error)}</p><Button type="button" variant="outline" disabled={busy || refreshing} onClick={async () => { setBusy(true); try { const latest = await refresh(); if (latest) { setVersion(latest.handling.version); setNeedsRefresh(false); setError(''); } } finally { setBusy(false); } }}>{t('Refresh inquiry')}</Button></div> : null}
      {saved ? <p className="platform-service-save-result" role="status">{t('Handling saved. No message was sent and contact remains unverified.')}</p> : null}
      <Button type="submit" disabled={busy || needsRefresh || stale || refreshing || !reason.trim() || !ownership}>{t(busy ? 'Saving…' : 'Save handling')}</Button>
    </form></div></section>
  </div>;
}
