import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/context';
import LanguageChoice from '@/components/common/LanguageChoice';
import { Button } from '@/components/ui/button';
import { useServiceInformation } from './serviceInformation';
import '@/workspace.css';
import '@/workspace-refresh.css';
import './help.css';

export default function HelpPage() {
  const { t } = useLanguage();
  const info = useServiceInformation();
  return <article className="workspace service-information"><header><LanguageChoice /><h1>{t('Help & service information')}</h1><p>{t('Support, current photo behavior and approved customer information.')}</p></header>
    <nav aria-label={t('Information sections')}><a href="#service-support">{t('Support contact')}</a><a href="#service-photos">{t('Photos and privacy')}</a><a href="#service-policies">{t('Service and account closure')}</a><a href="#service-android">{t('Android app')}</a></nav>
    <section id="service-support" aria-labelledby="service-support-title"><h2 id="service-support-title">{t('Support contact')}</h2><p>{t('For a shift, task QR or staff access code, ask your assigned manager. Owners can use account recovery when delivery is configured.')}</p>
      {info.support.isFetching ? <p role="status">{t('Loading support contact…')}</p> : null}
      {info.support.isError ? <div role="alert"><p>{t('Support contact could not be loaded.')}</p><Button variant="outline" onClick={() => void info.support.refetch()}>{t('Retry support contact')}</Button></div> : info.support.data ? info.support.data.email ? <><a href={`mailto:${encodeURIComponent(info.support.data.email)}`}>{t('Open support email')} · <bdi>{info.support.data.email}</bdi></a><p>{t('This mailbox is operator configured. Opening email does not confirm message delivery.')}</p></> : <p>{t('Support contact is unavailable. No delivery channel has been qualified.')}</p> : null}
      <Link to="/recover-owner-account">{t('Owner account recovery')}</Link>
    </section>
    <section id="service-photos" aria-labelledby="service-photos-title"><h2 id="service-photos-title">{t('Photos and privacy')}</h2><p>{t('Keep people out of task photos, including mirror reflections. Evidence is available only through authorized access.')}</p><p>{t('Uploading a photo, submitting a task, a manager review and verified evidence are separate states. An upload alone does not verify a task.')}</p><p>{t('New automated photo processing is unavailable until privacy and identity qualification is complete. Existing results can still be reconciled. No AI accuracy or automatic redaction guarantee is offered.')}</p></section>
    <section id="service-policies" aria-labelledby="service-policies-title"><h2 id="service-policies-title">{t('Service and account closure')}</h2><p>{t('Only approved configured documents are linked here. No refund, retention period or deletion promise is inferred.')}</p>
      <dl>{([{ key: 'terms', label: 'Service and billing terms' }, { key: 'privacy', label: 'Privacy information' }, { key: 'exit', label: 'Retention and account closure' }] as const).map(({ key, label }) => <div key={key}><dt>{t(label)}</dt><dd>{info[key] ? <a href={info[key]} rel="noreferrer">{t('Read approved document')}</a> : t('Approved document unavailable')}</dd></div>)}</dl>
      {!info.purchaseReady ? <p role="status">{t('New purchases are unavailable until approved customer policies and a support contact are available.')}</p> : <p>{t('Available documents do not confirm billing activation or production readiness.')}</p>}
    </section>
    <section id="service-android" aria-labelledby="service-android-title"><h2 id="service-android-title">{t('Android app')}</h2>{info.android ? <><a href={info.android} rel="noreferrer">{t('Open approved Android distribution')}</a><p>{t('Use only the distribution approved by your company. A download link does not confirm device qualification.')}</p></> : <p>{t('Approved Android distribution is unavailable. Ask your company owner for the qualified app.')}</p>}</section>
  </article>;
}
