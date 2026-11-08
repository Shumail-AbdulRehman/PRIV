import { useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, CreditCard, LockKeyhole } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import LanguageChoice from '@/components/common/LanguageChoice';
import { useLanguage } from '@/i18n/context';
import { serviceInformation } from '@/pages/Help/serviceInformation';
import './billing-setup.css';

const setupSteps = [
  { id: 'account', label: 'Create account', description: 'Your owner details' },
  { id: 'plan', label: 'Choose a plan', description: 'Capacity for your team' },
  { id: 'payment', label: 'Payment', description: 'Secure checkout with Paddle' },
  { id: 'confirmation', label: 'Confirm subscription', description: 'Continue to your workspace' },
] as const;

export type BillingSetupStep = (typeof setupSteps)[number]['id'];

type LayoutSlots = {
  children: ReactNode;
  /** Optional screen-owned navigation and footer content. No pathname inference. */
  navigation?: ReactNode;
  footer?: ReactNode;
  /** Omit until the caller has validated the server/browser environment. */
  environment?: 'sandbox' | 'production';
};
export type BillingSetupLayoutProps = LayoutSlots & (
  | { variant?: 'setup'; currentStep: BillingSetupStep; completedSteps?: readonly BillingSetupStep[] }
  | { variant: 'settings'; currentStep?: never; completedSteps?: never }
);

/** Presentation only: callers retain identity, billing readiness and route decisions. */
export default function BillingSetupLayout(props: BillingSetupLayoutProps) {
  const { children, navigation, footer, environment, variant = 'setup' } = props;
  const { language, t } = useLanguage();
  const contentId = useId();
  const settings = variant === 'settings';
  const stepIndex = setupSteps.findIndex((step) => step.id === props.currentStep);
  const { terms, privacy } = serviceInformation(); // Validated public policy URLs; no request.
  const footerCopy = !settings && props.currentStep === 'account'
    ? 'Create your account first. Your plan and payment come next.'
    : 'Card details stay with Paddle.';

  return <div className="billing-onboarding" dir={language === 'ur' ? 'rtl' : 'ltr'} lang={language === 'ur' ? 'ur-PK' : 'en-PK'} data-variant={variant}>
    <a className="billing-skip" href={`#${contentId}`}>{t('Skip to content')}</a>
    <aside className="billing-rail">
      <div className="billing-brand"><BrandLogo /></div>
      <div className="billing-rail-body">
        <p className="billing-rail-title">{t(settings ? 'Account settings' : 'Workspace setup')}</p>
        {settings ? <nav className="billing-settings-navigation" aria-label={t('Account settings')}>
          <Link to="/subscription" aria-current="page"><CreditCard aria-hidden="true" />{t('Plan & billing')}</Link>
          <Link to="/account/security"><LockKeyhole aria-hidden="true" />{t('Account security')}</Link>
        </nav> : <nav aria-label={t('Workspace setup')}>
          <ol className="billing-steps">
            {setupSteps.map((step, index) => {
              const complete = props.completedSteps?.includes(step.id) ?? index < stepIndex;
              const current = step.id === props.currentStep;
              return <li key={step.id} aria-current={current ? 'step' : undefined} data-current={current || undefined} data-complete={complete || undefined}>
                <span className="billing-step-dot" aria-hidden="true">{complete ? <Check /> : <bdi dir="ltr">{index + 1}</bdi>}</span>
                <span className="billing-step-text"><strong>{t(step.label)}</strong><small>{t(step.description)}</small></span>
                {complete ? <span className="billing-visually-hidden">{t('Step completed')}</span> : null}
              </li>;
            })}
          </ol>
        </nav>}
      </div>
      <div className="billing-rail-bottom"><LockKeyhole aria-hidden="true" />{t(environment === 'sandbox' ? 'Test environment' : 'Secure checkout with Paddle')}</div>
    </aside>
    <div className="billing-main-wrap">
      <header className="billing-topbar">
        <span className="billing-topbar-title">{t(settings ? 'Company workspace' : 'Workspace setup')}</span>
        <div className="billing-top-actions">
          {environment === 'sandbox' ? <span className="billing-sandbox">{t('Sandbox · test cards only')}</span> : null}
          <LanguageChoice />
        </div>
      </header>
      <main className="billing-main" id={contentId} tabIndex={-1}>
        {navigation ? <div className="billing-screen-navigation">{navigation}</div> : null}
        {children}
      </main>
      <footer className="billing-footer">
        <div className="billing-footer-message"><LockKeyhole aria-hidden="true" />{footer ?? <span>{t(footerCopy)}</span>}</div>
        {terms || privacy ? <nav aria-label={t('Legal policies')}>
          {terms ? <a href={terms}>{t('Terms')}</a> : null}
          {privacy ? <a href={privacy}>{t('Privacy')}</a> : null}
        </nav> : null}
      </footer>
    </div>
  </div>;
}
