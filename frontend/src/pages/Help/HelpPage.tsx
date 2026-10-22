import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import AuthShell from '@/components/common/AuthShell';
import BrandLogo from '@/components/common/BrandLogo';
import LanguageChoice from '@/components/common/LanguageChoice';
import { Button } from '@/components/ui/button';
import { useServiceInformation } from './serviceInformation';
import '@/workspace.css';
import '@/workspace-refresh.css';
import './help.css';

type ServiceFacts = ReturnType<typeof useServiceInformation>;
function Panel({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return <section className="v5-help-panel" id={id}><header><h2>{title}</h2></header><div className="v5-help-pad">{children}</div></section>;
}
function SupportContact({ info }: { info: ServiceFacts }) {
  const { t } = useLanguage();
  return <div className="v5-service-contact" aria-busy={info.support.isFetching}>
    {info.support.isFetching ? <p role="status">{t('Loading support contact…')}</p> : null}
    {info.support.isError ? <div role="alert"><p>{t('Support contact could not be loaded.')}</p><Button variant="outline" onClick={() => void info.support.refetch()}>{t('Retry support contact')}</Button></div> : info.support.data && !info.support.isFetching ? info.support.data.email ? <><a className="v5-service-email" href={`mailto:${encodeURIComponent(info.support.data.email)}`}>{t('Open support email')}<bdi>{info.support.data.email}</bdi></a><p className="v5-service-note">{t('This mailbox is operator configured. Opening email does not confirm message delivery.')}</p></> : <p className="v5-service-notice" role="status">{t('Support contact is unavailable. No delivery channel has been qualified.')}</p> : null}
  </div>;
}
function PhotoGuidance() {
  const { t } = useLanguage();
  return <><p>{t('Keep people out of task photos, including mirror reflections. Evidence is available only through authorized access.')}</p><p>{t('Uploading a photo, submitting a task, a manager review and verified evidence are separate states. An upload alone does not verify a task.')}</p><p>{t('New automated photo processing is unavailable until privacy and identity qualification is complete. Existing results can still be reconciled. No AI accuracy or automatic redaction guarantee is offered.')}</p></>;
}
function AndroidInformation({ info }: { info: ServiceFacts }) {
  const { t } = useLanguage();
  return info.android ? <><a href={info.android} rel="noreferrer">{t('Open approved Android distribution')}</a><p>{t('Use only the distribution approved by your company. A download link does not confirm device qualification.')}</p></> : <p>{t('Approved Android distribution is unavailable. Ask your company owner for the qualified app.')}</p>;
}
export default function HelpPage() {
  const { t } = useLanguage();
  const info = useServiceInformation();
  const title = t('Help & service information');
  useEffect(() => { document.title = `${title} | Hygene Ops`; }, [title]);
  return <div className="workspace v5-help-page">
    <a className="v5-auth-skip" href="#help-content">{t('Skip to content')}</a>
    <header className="v5-help-topbar"><Link to="/login" className="v5-help-brand" aria-label={t('Hygene Ops sign in')}><BrandLogo /></Link><LanguageChoice /></header>
    <main id="help-content" className="v5-help-content" tabIndex={-1}>
      <div className="v5-help-heading"><h1>{title}</h1><p>{t('A clear next step when work or account access gets stuck.')}</p></div>
      <div className="v5-help-split"><div className="v5-help-stack">
        <Panel title={t('Contact Hygene Ops')} id="service-support"><p>{t('Use a customer account reference and describe the issue. Do not include passwords or workforce photos.')}</p><SupportContact info={info} /><p>{t('For a shift, task QR or staff access code, ask your assigned manager. Owners can use account recovery when delivery is configured.')}</p></Panel>
        <Panel title={t('Common questions')}><details><summary>{t('Why does a closed review not verify a task?')}</summary><p>{t('Review closure records a manager decision. Required photos, staff submission and verified completion stay separate.')}</p></details><details><summary>{t('What if a worker cannot upload?')}</summary><p>{t('Check the existing upload result before retrying. Field photos require internet; leaving may discard a temporary picture.')}</p></details></Panel>
        <Panel title={t('Photos and privacy')} id="service-photos"><PhotoGuidance /></Panel>
      </div><aside className="v5-help-stack" aria-label={t('Account and service help')}>
        <Panel title={t('Account recovery')}><p>{t('A company owner needs a verified recovery path. Workers should ask their assigned manager for access help.')}</p><Button asChild variant="outline"><Link to="/recover-owner-account">{t('Owner account recovery')}</Link></Button></Panel>
        <Panel title={t('Service information')} id="service-policies"><p>{t('Only approved configured documents are linked here. No refund, retention period or deletion promise is inferred.')}</p><Link className="v5-help-next" to="/service-information">{t('Review information')}<ArrowRight size={18} aria-hidden="true" /></Link></Panel>
        <Panel title={t('Android app')} id="service-android"><AndroidInformation info={info} /></Panel>
      </aside></div>
    </main>
  </div>;
}
export function ServiceInformationPage() {
  const { t } = useLanguage();
  const info = useServiceInformation();
  return <AuthShell title={t('Service information')} subtitle={t('Support, current photo behavior and approved customer information.')} footer={<Link to="/help">{t('Help & service information')}</Link>}>
    <div className="v5-information">
      <section aria-labelledby="service-policies-title" id="service-policies"><h2 id="service-policies-title">{t('Service and account closure')}</h2><p>{t('Only approved configured documents are linked here. No refund, retention period or deletion promise is inferred.')}</p><dl>{([{ key: 'terms', label: 'Service and billing terms' }, { key: 'privacy', label: 'Privacy information' }, { key: 'exit', label: 'Retention and account closure' }] as const).map(({ key, label }) => <div key={key}><dt>{t(label)}</dt><dd>{info[key] ? <a href={info[key]} rel="noreferrer">{t('Read approved document')}</a> : t('Approved document unavailable')}</dd></div>)}</dl>{!info.purchaseReady ? <p role="status">{t('New purchases are unavailable until approved customer policies and a support contact are available.')}</p> : <p>{t('Available documents do not confirm billing activation or production readiness.')}</p>}</section>
      <section aria-labelledby="service-photos-title" id="service-photos"><h2 id="service-photos-title">{t('Photos and privacy')}</h2><PhotoGuidance /></section>
      <section aria-labelledby="service-support-title" id="service-support"><h2 id="service-support-title">{t('Support contact')}</h2><SupportContact info={info} /></section>
      <section aria-labelledby="service-android-title" id="service-android"><h2 id="service-android-title">{t('Android app')}</h2><AndroidInformation info={info} /></section>
    </div>
  </AuthShell>;
}
