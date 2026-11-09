import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { ONBOARDING_ROUTES } from '../Onboarding/onboardingRoutes';
import { useBillingCatalog } from '../Subscription/queries';
import type { BillingInterval, PlanCode } from '../Subscription/types';
import { TIERS } from './tiers';
import EnterprisePlan from './EnterprisePlan';

export function PaddlePricing({ currentPlan, subscribeDisabled = false, disabledMessage }: {
  appearance?: 'default' | 'marketing'; currentPlan?: PlanCode; subscribeDisabled?: boolean; disabledMessage?: string;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [interval, setInterval] = useState<BillingInterval>('month');
  const cannotSubscribe = subscribeDisabled || !!user && user.role !== 'ADMIN';
  return <div className="saas-pricing">
    <p className="pricing-message" role="status">{t('Prices are available from the configured catalog in owner billing. Final totals and taxes are shown at checkout. No payment starts on this page.')}</p>
    <fieldset>
      <legend>{t('Billing interval')}</legend>
      {(['month', 'year'] as const).map(value => <label key={value}>
        <input type="radio" name="public-pricing-interval" value={value} checked={interval === value} onChange={() => setInterval(value)} />
        {t(value === 'month' ? 'Monthly' : 'Yearly')}
      </label>)}
    </fieldset>
    <div className="plan-grid">{TIERS.map(tier => {
      const plan: PlanCode = tier.name === 'Starter' ? 'STARTER' : 'PRO';
      return <article key={plan} className="saas-plan">
        <div className="plan-title"><h2>{tier.name}</h2>{currentPlan === plan ? <span>{t('Current capacity plan')}</span> : null}</div>
        <p>{tier.description}</p>
        <ul className="plan-features">{[...tier.capacity, ...tier.features].map(feature => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}</ul>
        {cannotSubscribe ? <p>{t(disabledMessage ?? 'Only the company owner can view or change billing.')}</p> :
          <Link className="marketing-button secondary-button" to={user ? ONBOARDING_ROUTES.continue : `${ONBOARDING_ROUTES.signup}?${new URLSearchParams({ plan, interval })}`}>
            {t(user ? 'Continue to your workspace' : 'Choose {plan}', { plan: tier.name })}
          </Link>}
      </article>;
    })}
      {user?.role === 'ADMIN' && !cannotSubscribe ? <OwnerEnterprisePlan interval={interval} current={currentPlan === 'ADVANCED'} /> : <EnterprisePlan current={currentPlan === 'ADVANCED'} />}
    </div>
  </div>;
}

// The catalog is private. Visitors retain the inquiry option until availability is known.
function OwnerEnterprisePlan({ interval, current }: { interval: BillingInterval; current: boolean }) {
  const catalog = useBillingCatalog();
  const { t } = useLanguage();
  if (catalog.isError || catalog.isPending || !catalog.data?.some(entry => entry.plan === 'ADVANCED' && entry.interval === interval)) {
    return <EnterprisePlan current={current} />;
  }
  return <article className="saas-plan enterprise-plan">
    <div className="plan-title"><h2>Enterprise</h2>{current ? <span>{t('Current capacity plan')}</span> : null}</div>
    <p>{t('Enterprise is available in owner billing for the selected interval.')}</p>
    <Link className="marketing-button secondary-button" to={ONBOARDING_ROUTES.continue}>{t('Continue to your workspace')}</Link>
  </article>;
}
