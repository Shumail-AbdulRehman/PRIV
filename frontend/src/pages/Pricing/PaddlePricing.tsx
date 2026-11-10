import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { ONBOARDING_ROUTES } from '../Onboarding/onboardingRoutes';
import { useBillingCatalog } from '../Subscription/queries';
import type { BillingInterval, PlanCode } from '../Subscription/types';
import { PLAN_COMPARISON, TIERS } from './tiers';
import EnterprisePlan, { type InquiryDefaults } from './EnterprisePlan';

const COLUMNS = ['Starter', 'Pro', 'Enterprise'] as const;

export function PaddlePricing({ currentPlan, subscribeDisabled = false, disabledMessage, fit = 1, inquiry }: {
  currentPlan?: PlanCode; subscribeDisabled?: boolean; disabledMessage?: string;
  /** Column highlighted as the size match: 0 Starter, 1 Pro, 2 Enterprise. */
  fit?: number; inquiry?: InquiryDefaults;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [interval, setInterval] = useState<BillingInterval>('month');
  // Phones show one plan at a time. A new size match replaces an earlier manual choice.
  const [chosen, setChosen] = useState({ column: fit, forFit: fit });
  const shown = chosen.forFit === fit ? chosen.column : fit;
  const cannotSubscribe = subscribeDisabled || !!user && user.role !== 'ADMIN';
  const state = (column: number) => [column === fit && 'is-fit', column === shown && 'is-view'].filter(Boolean).join(' ');

  return <div className="saas-pricing">
    <fieldset className="hx-interval">
      <legend className="sr-only">{t('Billing interval')}</legend>
      {(['month', 'year'] as const).map(value => <label key={value}>
        <input type="radio" name="public-pricing-interval" value={value} checked={interval === value} onChange={() => setInterval(value)} />
        <span>{t(value === 'month' ? 'Monthly' : 'Yearly')}</span>
      </label>)}
    </fieldset>
    <div className="hx-plan-tabs" role="group" aria-label="Show a plan">
      {COLUMNS.map((name, column) => <button key={name} type="button" aria-pressed={column === shown} onClick={() => setChosen({ column, forFit: fit })}>{name}</button>)}
    </div>
    <div className="hx-compare">
      <div className="hx-plan-heads">
        {TIERS.map((tier, column) => {
          const plan: PlanCode = tier.name === 'Starter' ? 'STARTER' : 'PRO';
          return <article key={plan} className={`hx-plan ${state(column)}`}>
            <div className="hx-plan-title"><h2>{tier.name}</h2>{currentPlan === plan ? <span>{t('Current capacity plan')}</span> : null}</div>
            <p>{tier.description}</p>
            {cannotSubscribe ? <p className="hx-plan-note">{t(disabledMessage ?? 'Only the company owner can view or change billing.')}</p> :
              <Link className="hx-btn hx-btn-line" to={user ? ONBOARDING_ROUTES.continue : `${ONBOARDING_ROUTES.signup}?${new URLSearchParams({ plan, interval })}`}>
                {t(user ? 'Continue to your workspace' : 'Choose {plan}', { plan: tier.name })}
              </Link>}
          </article>;
        })}
        {user?.role === 'ADMIN' && !cannotSubscribe
          ? <OwnerEnterprisePlan interval={interval} current={currentPlan === 'ADVANCED'} state={state(2)} inquiry={inquiry} />
          : <EnterprisePlan current={currentPlan === 'ADVANCED'} state={state(2)} inquiry={inquiry} />}
      </div>
      <table className="hx-table">
        <thead><tr><th scope="col">What’s included</th>{COLUMNS.map(name => <th key={name} scope="col">{name}</th>)}</tr></thead>
        <tbody>{PLAN_COMPARISON.map((row, rowIndex) => <tr key={row.name} className={rowIndex < 3 ? 'hx-cap' : undefined}>
          <th scope="row">{row.name}</th>
          {row.values.map((value, column) => <td key={column} className={state(column)}>
            {typeof value === 'boolean' ? (value ? <Check aria-label="Included" /> : <Minus aria-label="Not included" />) : value}
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <p className="hx-sample">{t('Prices are available from the configured catalog in owner billing. Final totals and taxes are shown at checkout. No payment starts on this page.')}</p>
  </div>;
}

// The catalog is private. Visitors retain the inquiry option until availability is known.
function OwnerEnterprisePlan({ interval, current, state, inquiry }: { interval: BillingInterval; current: boolean; state: string; inquiry?: InquiryDefaults }) {
  const catalog = useBillingCatalog();
  const { t } = useLanguage();
  if (catalog.isError || catalog.isPending || !catalog.data?.some(entry => entry.plan === 'ADVANCED' && entry.interval === interval)) {
    return <EnterprisePlan current={current} state={state} inquiry={inquiry} />;
  }
  return <article className={`hx-plan ${state}`}>
    <div className="hx-plan-title"><h2>Enterprise</h2>{current ? <span>{t('Current capacity plan')}</span> : null}</div>
    <p>{t('Enterprise is available in owner billing for the selected interval.')}</p>
    <Link className="hx-btn hx-btn-line" to={ONBOARDING_ROUTES.continue}>{t('Continue to your workspace')}</Link>
  </article>;
}
