import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Building2, MapPin, Menu, RefreshCw, ShieldCheck, UserRoundCog, Users } from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { OperatorBoundary, OperatorShell } from './OperatorLogin';
import { operatorQueryScope } from './operatorSession';
import { getCompanies, getCompany, setCompanyStatus, type CompanySummary } from './companyApi';
import './companies.css';

export default function CompaniesPage() {
  return <OperatorBoundary><CompanyWorkspace /></OperatorBoundary>;
}

/** Mounted by the real route only after the separate operator boundary permits it. */
export function CompanyWorkspace() {
  const { companyId } = useParams();
  return <CompanyContent key={companyId ?? 'list'} />;
}

function statusCode(error: unknown) {
  return (error as { response?: { status?: number }; status?: number } | null)?.response?.status
    ?? (error as { status?: number } | null)?.status;
}

function CompanyResources({ company, compact = false }: { company: CompanySummary; compact?: boolean }) {
  const { t, language } = useLanguage();
  const resources = [
    ['managers', 'Managers', UserRoundCog], ['staff', 'Staff', Users], ['locations', 'Locations', MapPin],
  ] as const;
  return <dl className={compact ? 'platform-company-size' : 'platform-company-resources'} aria-label={t('Active team and locations')}>
    {resources.map(([key, label, Icon]) => <div key={key}>
      <dt><Icon size={compact ? 14 : 19} aria-hidden="true" />{t(label)}</dt>
      <dd>{company.counts[key].toLocaleString(language === 'ur' ? 'ur-PK' : 'en-PK')}</dd>
    </div>)}
  </dl>;
}

function CompanyNavigation() {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const links = [
    ['/platform/companies', 'Companies', Building2],
    ['/platform/security', 'Platform security', ShieldCheck],
  ] as const;
  return <nav className="platform-company-nav" aria-label={t('Platform navigation')}>
    <div className="platform-company-nav-heading"><Building2 size={20} aria-hidden="true" /><div><strong>Hygene Ops</strong><span>{t('Platform operations')}</span></div></div>
    <Button className="platform-company-menu" variant="outline" aria-expanded={expanded} aria-controls="company-platform-links" onClick={() => setExpanded(!expanded)}><Menu size={17} aria-hidden="true" />{t('Platform navigation')}</Button>
    <div id="company-platform-links" className="platform-company-nav-links" data-expanded={expanded}>
      {links.map(([to, label, Icon]) => <Link key={to} to={to} aria-current={to === '/platform/companies' ? 'page' : undefined}><Icon size={18} aria-hidden="true" /><span>{t(label)}</span></Link>)}
    </div>
    <p className="platform-company-nav-note"><ShieldCheck size={17} aria-hidden="true" /><span>{t('Account metadata only. No workforce records or photos.')}</span></p>
  </nav>;
}

function CompanyContent() {
  const { t, language } = useLanguage();
  const { companyId } = useParams();
  const [params, setParams] = useSearchParams();
  const client = useQueryClient();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [tab, setTab] = useState('account');
  const [target, setTarget] = useState<'ACTIVE' | 'SUSPENDED'>('SUSPENDED');
  const [open, setOpen] = useState(false), [reason, setReason] = useState('');
  const [version, setVersion] = useState(0), [busy, setBusy] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState('');
  const lock = useRef(false);
  const numericId = companyId && /^[1-9]\d*$/.test(companyId) ? Number(companyId) : null;
  const id = numericId && Number.isSafeInteger(numericId) ? numericId : null;
  const list = useQuery({
    queryKey: [...operatorQueryScope, 'companies', params.toString()],
    queryFn: ({ signal }) => getCompanies({ q: params.get('q') ?? undefined, status: params.get('status') ?? undefined, after: params.get('after') ?? undefined }, signal),
    enabled: !companyId, retry: false,
  });
  const detail = useQuery({ queryKey: [...operatorQueryScope, 'company', id], queryFn: ({ signal }) => getCompany(id!, signal), enabled: !!id, retry: false });
  const denied = statusCode(detail.error) === 401 || statusCode(detail.error) === 403;
  const current = detail.data?.company.id === id && !denied ? detail.data : undefined;
  const activeQuery = companyId ? detail : list;
  const rows = list.data && !list.isError ? list.data.items : undefined;
  const fail = (cause: unknown) => {
    const code = statusCode(cause);
    return code === 403 || code === 401 ? 'Platform access denied. Sign in with a provisioned operator account.'
      : code === 404 ? 'Company account not found.' : 'Company records are unavailable. Retry the scoped request.';
  };
  const stamp = (value: string | null | undefined, dateOnly = false) => value && Number.isFinite(Date.parse(value))
    ? <time dateTime={value}>{dateOnly ? new Date(value).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-PK') : new Date(value).toLocaleString(language === 'ur' ? 'ur-PK' : 'en-PK')}</time>
    : t('Not available');
  const badge = (value: CompanySummary) => <span className="platform-company-badge" data-state={!value.isActive ? 'inactive' : value.operationalStatus.toLowerCase()}>{t(!value.isActive ? 'Inactive' : value.operationalStatus === 'ACTIVE' ? 'Active' : 'Suspended')}</span>;
  const facts = (items: Array<[string, ReactNode]>) => <dl className="platform-company-facts">{items.map(([label, value]) => <div key={label}><dt>{t(label)}</dt><dd>{value}</dd></div>)}</dl>;

  function beginStatusChange() {
    if (!current || detail.isError || detail.isFetching) return;
    setSaved('');
    if (!needsRefresh) {
      setError(''); setVersion(current.company.accountVersion);
      setTarget(current.company.operationalStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
    }
    setOpen(true);
  }
  async function refreshCompany() {
    if (lock.current || busy) return;
    setBusy(true);
    try {
      const result = await detail.refetch();
      if (!result.isError && result.data?.company.id === id) {
        setVersion(result.data.company.accountVersion); setNeedsRefresh(false); setError('');
      }
    } finally { setBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !current || !reason.trim() || needsRefresh || detail.isFetching || detail.isError) return;
    lock.current = true; setBusy(true); setError(''); setSaved('');
    try {
      await setCompanyStatus(current.company.id, { operationalStatus: target, expectedVersion: version, reason: reason.trim() });
      setOpen(false); setReason(''); setNeedsRefresh(false); setSaved('Company status saved. Billing entitlement is unchanged.');
      await client.invalidateQueries({ queryKey: operatorQueryScope });
    } catch (cause) {
      setNeedsRefresh(true);
      setError(statusCode(cause) === 409 ? 'The company changed or needs legacy account review. Refresh before saving. Your reason is kept.'
        : 'The status change could not be confirmed. Refresh the account before retrying. Your reason is kept.');
    } finally { lock.current = false; setBusy(false); }
  }

  const refresh = <Button variant="outline" disabled={activeQuery.isFetching || busy} onClick={() => void activeQuery.refetch()}><RefreshCw size={16} aria-hidden="true" />{t('Refresh')}</Button>;
  const accountContent = current ? <div className="platform-company-split">
    <div className="platform-company-stack">
      <section className="platform-company-panel"><header><h2>{t('Company profile')}</h2><p>{t('Registered account metadata from the platform record.')}</p></header><div className="platform-company-panel-body">{facts([
        ['Registered company', <bdi>{current.company.name}</bdi>], ['Customer ID', <bdi>{current.company.id}</bdi>],
        ['Registered on', stamp(current.company.createdAt, true)], ['Last account update', stamp(current.company.updatedAt)],
      ])}</div></section>
      <section className="platform-company-panel"><header><h2>{t('Account access')}</h2><p>{t('Operational access is separate from billing entitlement.')}</p></header><div className="platform-company-panel-body">{facts([
        ['Operational status', badge(current.company)], ['Operational reads', t(current.operationalReadAllowed ? 'Allowed' : 'Restricted')],
        ['Suspended at', stamp(current.company.suspendedAt)], ['Suspension reason', current.company.suspensionReason ?? t('Not recorded')],
      ])}<p className="platform-company-notice">{t('Suspension restricts company operations. Reactivation does not grant paid entitlement or change billing. Historical records are preserved.')}</p>
        {!current.company.isActive ? <p role="status" className="platform-company-warning">{t('This inactive legacy account requires review before reactivation.')}</p> : null}
        <Button disabled={busy || detail.isFetching || detail.isError || (!current.company.isActive && current.company.operationalStatus === 'SUSPENDED')} variant="outline" onClick={beginStatusChange}><ShieldCheck size={16} aria-hidden="true" />{t(needsRefresh ? 'Review pending status change' : current.company.operationalStatus === 'ACTIVE' ? 'Suspend company' : 'Reactivate company')}</Button>
      </div></section>
    </div>
    <aside className="platform-company-stack">
      <section className="platform-company-panel"><header><h2>{t('Account context')}</h2><p>{t('Only recorded account facts are shown.')}</p></header><div className="platform-company-panel-body">{facts([
        ['Capacity plan', <bdi>{current.company.plan}</bdi>], ['Account version', <bdi>{current.company.accountVersion}</bdi>], ['Billing integration', t(current.billingConfigured ? 'Configured' : 'Not configured')],
      ])}</div></section>
    </aside>
  </div> : null;

  return <OperatorShell title={t('Platform companies')}><div className="platform-company-workspace">
    <CompanyNavigation />
    <div className="platform-company-main">
      {companyId ? <Link className="platform-company-back" to="/platform/companies"><ArrowLeft size={16} aria-hidden="true" />{t('All companies')}</Link> : null}
      <PageHeader title={companyId ? current?.company.name ?? 'Company account' : 'Customer companies'} subtitle={companyId ? 'Customer account, commercial access and administrative history.' : 'Understand each account and the next action it needs.'} action={refresh} />
      {saved ? <p role="status" className="platform-company-success">{t(saved)}</p> : null}
      {companyId && !id ? <p role="alert" className="platform-company-state">{t('Company account not found.')}</p> : null}
      {activeQuery.isFetching ? <p role="status" className="platform-company-loading">{t('Loading company records…')}</p> : null}
      {activeQuery.isError ? <div role="alert" className="platform-company-state"><h2>{t('Company records need attention')}</h2><p>{t(fail(activeQuery.error))}</p>{current ? <p>{t('Showing the last saved account record. Refresh before making changes.')}</p> : null}<Button variant="outline" disabled={activeQuery.isFetching || busy} onClick={() => void activeQuery.refetch()}>{t('Retry')}</Button></div> : null}
      {detail.data && !current && !denied && id ? <p role="alert" className="platform-company-state">{t('Company records do not match this account. Refresh before continuing.')}</p> : null}
      {!companyId ? <>
        {rows ? <section className="platform-company-metrics" aria-label={t('Companies on this page')}>
          {[
            ['Companies on this page', rows.length], ['Active on this page', rows.filter(row => row.isActive && row.operationalStatus === 'ACTIVE').length],
            ['Suspended on this page', rows.filter(row => row.operationalStatus === 'SUSPENDED').length], ['Inactive on this page', rows.filter(row => !row.isActive).length],
          ].map(([label, count]) => <div key={label}><span>{t(String(label))}</span><strong><bdi>{count}</bdi></strong></div>)}
        </section> : null}
        <section className="platform-company-panel platform-company-register" aria-label={t('Company register')}>
          <form className="platform-company-filters" onSubmit={event => { event.preventDefault(); setParams({ ...(search.trim() ? { q: search.trim() } : {}), ...(status ? { status } : {}) }); }}>
            <label>{t('Search companies')}<Input maxLength={100} value={search} placeholder={t('Company name')} onChange={event => setSearch(event.target.value)} /></label>
            <label>{t('Operational status')}<select value={status} onChange={event => setStatus(event.target.value)}><option value="">{t('All statuses')}</option><option value="ACTIVE">{t('Active')}</option><option value="SUSPENDED">{t('Suspended')}</option></select></label>
            <Button type="submit">{t('Apply filters')}</Button><Button type="button" variant="ghost" disabled={!search && !status && !params.toString()} onClick={() => { setSearch(''); setStatus(''); setParams({}); }}>{t('Clear filters')}</Button>
          </form>
          {rows ? <>
            <DataTable data={rows} rowKey={row => row.id} emptyMessage={t('No companies match these filters.')} mobileRender={row => <div className="platform-company-mobile-record"><div><Link to={`/platform/companies/${row.id}`}><bdi>{row.name}</bdi></Link>{badge(row)}</div><p>{t('Capacity plan')}: <bdi>{row.plan}</bdi></p><CompanyResources company={row} compact /><p>{t('Registered on')} {stamp(row.createdAt, true)}</p><Link className="platform-company-action" to={`/platform/companies/${row.id}`}>{t('Open account')}<ArrowRight size={16} aria-hidden="true" /></Link></div>} columns={[
              { key: 'name', header: t('Company'), render: row => <div className="platform-company-record-name"><Link to={`/platform/companies/${row.id}`}><bdi>{row.name}</bdi></Link><small>{t('Registered on')} {stamp(row.createdAt, true)}</small></div> },
              { key: 'resources', header: t('Active team and locations'), render: row => <CompanyResources company={row} compact /> },
              { key: 'status', header: t('Operational status'), render: badge }, { key: 'plan', header: t('Capacity plan'), render: row => <bdi>{row.plan}</bdi> },
              { key: 'actions', header: t('Account'), render: row => <Link className="platform-company-action" to={`/platform/companies/${row.id}`}>{t('Open account')}<ArrowRight size={16} aria-hidden="true" /></Link> },
            ]} />
            <footer className="platform-company-pagination"><p>{t('{count} companies on this page', { count: rows.length })}</p><div>{params.get('after') ? <Button variant="outline" disabled={list.isFetching} onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.delete('after'); return next; })}>{t('First page')}</Button> : null}{list.data?.nextCursor ? <Button variant="outline" disabled={list.isFetching} onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.set('after', list.data.nextCursor!); return next; })}>{t('Next page')}</Button> : null}</div></footer>
          </> : !list.isError && list.isPending ? <div className="platform-company-placeholder" aria-hidden="true"><span /><span /><span /></div> : null}
        </section>
        <p className="platform-company-footnote"><ShieldCheck size={16} aria-hidden="true" />{t('Team and location counts include active records only. Managers exclude the company owner.')}</p>
      </> : current ? <>
        <div className="platform-company-detail-heading">{badge(current.company)}<span>{t('Customer ID')} <bdi>{current.company.id}</bdi></span></div>
        <section className="platform-company-overview" aria-label={t('Company overview')}>
          <div className="platform-company-overview-heading"><h2>{t('Active team and locations')}</h2><p>{t('Active records only. Managers exclude the company owner.')}</p></div>
          <CompanyResources company={current.company} />
        </section>
        <div className="platform-company-tabs" role="group" aria-label={t('Company sections')}>{[['account', 'Account'], ['billing', 'Billing'], ['activity', 'Activity']].map(([value, label]) => <Button key={value} variant="ghost" aria-pressed={tab === value} onClick={() => setTab(value)}>{t(label)}</Button>)}</div>
        {tab === 'account' ? accountContent : tab === 'billing' ? <section className="platform-company-panel"><header><h2>{t('Mirrored billing metadata')}</h2><p>{t('Provider facts are read-only and do not change commercial access.')}</p></header><div className="platform-company-panel-body">{facts([
          ['Provider state', <bdi>{current.providerState}</bdi>], ['Provider subscription status', <bdi>{current.subscription?.status ?? t('Not available')}</bdi>],
          ['Billing period starts', stamp(current.subscription?.periodStart)], ['Billing period ends', stamp(current.subscription?.periodEnd)], ['Last provider event', stamp(current.subscription?.lastEventAt)],
          ['Scheduled change', <><bdi>{current.subscription?.scheduledChangeAction ?? t('Not recorded')}</bdi> · {stamp(current.subscription?.scheduledChangeAt)}</>],
        ])}<p className="platform-company-notice">{t('Metadata does not authorize payment overrides, impersonation or tenant workforce access.')}</p></div></section> : <section className="platform-company-panel"><header><h2>{t('Administrative activity')}</h2><p>{t('Recorded platform status changes for this account.')}</p></header><div className="platform-company-panel-body">{current.activity.length ? <ol className="platform-company-timeline">{current.activity.map(item => <li key={item.id}><strong>{t(item.action === 'COMPANY_SUSPENDED' ? 'Company suspended' : item.action === 'COMPANY_REACTIVATED' ? 'Company reactivated' : item.action)}</strong><p>{item.reason ?? t('Not recorded')}</p><small>{stamp(item.createdAt)}</small></li>)}</ol> : <p className="platform-company-empty">{t('No platform status changes recorded.')}</p>}</div></section>}
        <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}><DialogContent className="workspace platform-company-dialog" showCloseButton={!busy} onInteractOutside={event => { if (busy) event.preventDefault(); }} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}>
          <DialogTitle>{t(target === 'SUSPENDED' ? 'Confirm suspension' : 'Confirm reactivation')}</DialogTitle>
          <DialogDescription><bdi>{current.company.name}</bdi> · {t('This changes operational access only. It does not mark the company paid or delete its records.')}</DialogDescription>
          <form className="platform-company-confirmation" onSubmit={save}>
            <label>{t('Reason')}<Input required maxLength={500} pattern="[^\x00-\x1F\x7F]+" value={reason} disabled={busy} onChange={event => setReason(event.target.value)} /></label>
            {error ? <p role="alert" className="platform-company-warning">{t(error)}</p> : null}
            <div className="platform-company-dialog-actions"><Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>{t('Cancel')}</Button>{needsRefresh ? <Button type="button" variant="outline" disabled={busy || detail.isFetching} onClick={() => void refreshCompany()}>{t('Refresh company')}</Button> : null}<Button type="submit" disabled={busy || needsRefresh || detail.isFetching || detail.isError || !reason.trim()}>{t(busy ? 'Saving…' : 'Confirm status change')}</Button></div>
          </form>
        </DialogContent></Dialog>
      </> : null}
    </div>
  </div></OperatorShell>;
}

export type { CompanySummary };
