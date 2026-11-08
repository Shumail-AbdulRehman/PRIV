import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { useBillingCatalog, useBillingLifecycle, useSubscription } from '../queries';
import { billingPlanDefinition, deriveBillingViewState } from './billingViewState';
import { formatBillingPrice } from './billingPrice';
import BillingSetupLayout from './BillingSetupLayout';
import type { BillingInterval, PlanCode } from '../types';

export default function BillingPlanPage() {
  const { user } = useAuth(); const { t } = useLanguage();
  if (user?.role !== 'ADMIN') return <BillingSetupLayout currentStep="plan"><h1>{t('Choose your plan')}</h1><p role="alert">{t('Only the company owner can view or change billing.')}</p><Link to="/login">{t('Sign in again')}</Link></BillingSetupLayout>;
  return <OwnerPlans key={`${user.companyId}:${user.id}`} companyId={user.companyId} ownerId={user.id} />;
}
function OwnerPlans({ companyId, ownerId }: { companyId: number; ownerId: number }) {
  const { t, language } = useLanguage(); const navigate = useNavigate(); const [params] = useSearchParams();
  const lifecycle = useBillingLifecycle(); const catalog = useBillingCatalog(); const summary = useSubscription();
  const [interval, setInterval] = useState<BillingInterval>(params.get('interval') === 'year' ? 'year' : 'month');
  const [selection, setSelection] = useState<PlanCode | null>(() => ['STARTER', 'PRO', 'ADVANCED'].includes(params.get('plan') ?? '') ? params.get('plan') as PlanCode : null);
  const [announcement, setAnnouncement] = useState('');
  const radios = useRef<HTMLFieldSetElement>(null), focusAfterRetry = useRef(false);
  const view = deriveBillingViewState({ owner: { companyId, ownerId }, dataOwner: lifecycle.dataOwner, data: lifecycle.data,
    read: lifecycle.isPending ? 'loading' : lifecycle.isError ? 'error' : lifecycle.isFetching ? 'stale' : 'fresh',
    httpStatus: (lifecycle.error as { response?: { status?: number } } | null)?.response?.status });
  const busy = lifecycle.isFetching || catalog.isFetching || summary.isFetching;
  const failed = lifecycle.isError || catalog.isError || summary.isError;
  const rows = (catalog.data ?? []).filter(entry => entry.interval === interval).flatMap(entry => {
    const plan = billingPlanDefinition(summary.data?.availablePlans ?? [], entry.plan);
    const price = formatBillingPrice(entry.amount, entry.currencyCode, entry.interval, language === 'ur' ? 'ur-PK' : 'en-PK');
    if (!plan || !price || Object.values(plan.limits).some(value => !Number.isSafeInteger(value) || value < 0)) return [];
    return [{ entry, plan, price }];
  });
  const selected = rows.find(row => row.plan.code === selection) ?? (selection === null ? rows[0] : undefined);
  const selectable = view.canChoosePlan && !busy && !failed;
  useEffect(() => {
    if (focusAfterRetry.current && !busy && !failed && selectable && announcement) {
      focusAfterRetry.current = false;
      radios.current?.querySelector<HTMLInputElement>('input:checked')?.focus();
    }
  }, [busy, failed, selectable, announcement]);
  const refresh = async () => {
    focusAfterRetry.current = true;
    const results = await Promise.all([lifecycle.refetch(), catalog.refetch(), summary.refetch()]);
    setAnnouncement(results.every(result => !result.isError) ? 'Plan prices are available.' : 'Prices are unavailable. Refresh to try again.');
  };
  const continueTo = (plan: PlanCode, cycle: BillingInterval) => navigate(`/subscription/payment?${new URLSearchParams({ plan, interval: cycle })}`);
  const sandbox = view.data?.billingEnvironment === 'sandbox' && import.meta.env.VITE_PADDLE_ENVIRONMENT === 'sandbox' && import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.startsWith('test_');
  return <BillingSetupLayout currentStep="plan" environment={sandbox ? 'sandbox' : undefined}>
    <style>{`
      .billing-onboarding .billing-interval { display:flex; gap:4px; padding:4px; width:fit-content; border:1px solid var(--billing-line); border-radius:var(--billing-radius); margin:28px auto; }
      .billing-onboarding .billing-interval button { border:0; box-shadow:none; color:var(--billing-muted); background:transparent; }
      .billing-onboarding .billing-interval button[aria-pressed=true] { background:var(--billing-wash);color:var(--billing-blue); }
      .billing-onboarding .billing-plan-option:has(input:focus-visible){outline:2px solid var(--billing-blue);outline-offset:4px;}
      .billing-onboarding .billing-plan-title {font-size:20px;}
      .billing-onboarding .billing-plan-price {font-size:34px;font-weight:600;overflow-wrap:anywhere;}
      .billing-onboarding .billing-capacities {list-style:none;padding:16px 0 0;border-top:1px solid var(--billing-line);display:grid;gap:12px;font-size:14px;}
      .billing-onboarding .billing-plan-pick {display:flex;justify-content:space-between;align-items:center;margin-top:auto;border-top:1px solid var(--billing-line);padding-top:16px;font-size:13px;}
      @media(max-width:760px){
        .billing-onboarding .billing-plan-option {display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:12px!important;padding:16px!important;}
        .billing-onboarding .billing-plan-description{grid-column:1;grid-row:2;}
        .billing-onboarding .billing-plan-money{grid-column:2;grid-row:1 / 3;text-align:end;}
        .billing-onboarding .billing-capacities{grid-column:1 / -1;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;font-size:12px;}
        .billing-onboarding .billing-plan-title{font-size:18px;}
        .billing-onboarding .billing-plan-price{font-size:24px;}
        .billing-onboarding .billing-plan-pick{display:none;}
        .billing-onboarding .billing-plan-options{grid-template-columns:1fr!important;}
      }
      @media(max-width:580px){.billing-onboarding .billing-plan-continue{width:100%;}}
    `}</style>
    <header style={{ textAlign: 'center', maxWidth: 750, marginInline: 'auto' }}><h1>{t('Choose your plan')}</h1><p style={{ marginBlockStart: 12, color: 'var(--billing-muted)' }}>{t('Choose the capacity your team needs.')}</p></header>
    {view.kind === 'resume' && view.resume ? <section aria-label={t('Selected plan')} style={{ marginBlockStart: 32 }}>
      <p>{t('Your prepared checkout is ready to reopen.')}</p><p><bdi>{view.resume.plan === 'ADVANCED' ? t('Enterprise') : view.resume.plan}</bdi> · {t(view.resume.interval === 'year' ? 'Yearly' : 'Monthly')}</p>
      <Button onClick={() => view.resume && continueTo(view.resume.plan, view.resume.interval)}>{t('Reopen existing checkout')}</Button>
    </section> : null}
    {!view.canChoosePlan && view.kind !== 'resume' ? <section role="status" style={{ marginBlockStart: 24 }}>
      <p>{t(view.kind === 'checking' ? 'Loading available plans…' : view.kind === 'uncertain' || view.kind === 'pending' ? 'We could not confirm the outcome. Check subscription status before trying another payment.' : 'Billing is temporarily unavailable. Refresh status to try again.')}</p>
      <Button variant="outline" disabled={busy} onClick={() => void refresh()}>{t('Check subscription status')}</Button>
      {view.kind === 'existing' || view.kind === 'confirmed' ? <Link to="/subscription">{t('Open Plan & billing')}</Link> : null}
    </section> : null}
    <div className="billing-interval" role="group" aria-label={t('Billing interval')}>
      {(['month', 'year'] as const).map(cycle => <Button key={cycle} variant={interval === cycle ? 'default' : 'outline'} aria-pressed={interval === cycle} disabled={view.kind === 'resume'} onClick={() => setInterval(cycle)}>{t(cycle === 'month' ? 'Monthly billing' : 'Yearly billing')}</Button>)}
    </div>
    {busy ? <p role="status" aria-busy="true">{t('Loading available plans…')}</p> : failed ? <div role="alert"><p>{t('Prices are unavailable. Refresh to try again.')}</p><Button variant="outline" onClick={() => void refresh()}>{t('Refresh status')}</Button></div> : !rows.length ? <div role="status"><p>{t('No plans are available for this billing interval.')}</p><Button variant="outline" onClick={() => void refresh()}>{t('Refresh status')}</Button></div> : null}
    <fieldset className="billing-plan-options" ref={radios} disabled={!selectable} aria-describedby="plan-owner-note" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 16, padding: 0, border: 0, minWidth: 0 }}>
      <legend className="billing-visually-hidden">{t('Choose a plan')}</legend>
      {rows.map(({ entry, plan, price }) => <label className="billing-plan-option" key={entry.priceId} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, minWidth: 0, border: `1px solid var(${selected?.plan.code === plan.code ? '--billing-blue' : '--billing-line'})`, borderRadius: 'var(--billing-radius)', background: selected?.plan.code === plan.code ? 'var(--billing-wash)' : 'var(--billing-paper)', cursor: selectable ? 'pointer' : 'default' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><input type="radio" name="billing-plan" value={plan.code} checked={selected?.plan.code === plan.code} onChange={() => setSelection(plan.code)} aria-label={`${t(plan.name)} · ${price.formatted} · ${t(interval === 'month' ? 'Monthly' : 'Yearly')} · ${t('Includes {count} locations', { count: plan.limits.locations })} · ${t('Includes {count} staff seats', { count: plan.limits.staff })} · ${t('Includes {count} manager seats', { count: plan.limits.managers })} · ${t('Includes the company owner')}`} /><strong className="billing-plan-title">{t(plan.name)}</strong></span>
        <p className="billing-plan-description" style={{ color: 'var(--billing-muted)', fontSize: 13 }}>{t(plan.description)}</p>
        <p className="billing-plan-money"><bdi dir="ltr" className="billing-plan-price">{price.formatted}</bdi><br />{t(interval === 'month' ? 'Monthly' : 'Yearly')}</p>
        <ul className="billing-capacities">
          {(['locations', 'staff', 'managers'] as const).map(resource => <li key={resource}>{t({ locations: 'Includes {count} locations', staff: 'Includes {count} staff seats', managers: 'Includes {count} manager seats' }[resource], { count: plan.limits[resource] })}</li>)}
        </ul>
        <span className="billing-plan-pick" aria-hidden="true">{t(selected?.plan.code === plan.code ? 'Selected plan' : 'Choose a plan')}{selected?.plan.code === plan.code ? <Check size={18}/> : null}</span>
        {entry.trialPeriod ? <p style={{ fontSize: 13 }}>{t('Provider trial')}: <bdi dir="ltr">{entry.trialPeriod.frequency}</bdi> {t(entry.trialPeriod.interval)}</p> : null}
      </label>)}
    </fieldset>
    <p id="plan-owner-note" style={{ color: 'var(--billing-muted)', marginBlockStart: 20, fontSize: 13 }}>{t('The company owner uses one manager seat.')}</p>
    <section aria-label={t('Selected plan')} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20, borderBlockStart: '1px solid var(--billing-line)', paddingBlockStart: 24, marginBlockStart: 28 }}>
      <div><h2>{t('Selected plan')}</h2><p>{selected ? <><bdi>{t(selected.plan.name)}</bdi> · <bdi dir="ltr">{selected.price.formatted}</bdi> · {t(interval === 'year' ? 'Yearly' : 'Monthly')}</> : t('No plans are available for this billing interval.')}</p></div>
      <Button className="billing-plan-continue" disabled={!selectable || !selected} onClick={() => selected && continueTo(selected.plan.code, interval)}>{t('Continue with selected plan')}</Button>
    </section>
    <p style={{ fontSize: 13, color: 'var(--billing-muted)', marginBlockStart: 20 }}>{t('Final total and taxes are shown by Paddle before confirmation.')}</p>
    <p role="status" aria-live="polite">{announcement ? t(announcement) : ''}</p>
  </BillingSetupLayout>;
}
