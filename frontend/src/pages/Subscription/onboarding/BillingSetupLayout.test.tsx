import { useEffect, useState, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { LanguageContext, useLanguage } from '@/i18n/context';
import { translate } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BillingSetupLayout, { type BillingSetupLayoutProps, type BillingSetupStep } from './BillingSetupLayout';

function renderLayout(props: BillingSetupLayoutProps) {
  return render(<MemoryRouter><LanguageProvider><BillingSetupLayout {...props} /></LanguageProvider></MemoryRouter>);
}
beforeEach(() => {
  localStorage.clear();
  vi.stubEnv('VITE_SERVICE_POLICIES_APPROVED', 'false');
  vi.stubEnv('VITE_SERVICE_POLICY_ORIGIN', '');
  vi.stubEnv('VITE_SERVICE_TERMS_URL', '');
  vi.stubEnv('VITE_SERVICE_PRIVACY_URL', '');
});
afterEach(() => {
  vi.unstubAllEnvs();
  localStorage.clear();
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = 'en';
});

describe('setup progress', () => {
  it.each<BillingSetupStep>(['account', 'plan', 'payment', 'confirmation'])('exposes one current %s step with prior steps completed', (step) => {
    renderLayout({ currentStep: step, environment: 'sandbox', children: <h1>Screen content</h1> });
    const progress = screen.getByRole('navigation', { name: 'Workspace setup' });
    const steps = within(progress).getAllByRole('listitem');
    const index = ['account', 'plan', 'payment', 'confirmation'].indexOf(step);
    expect(steps).toHaveLength(4);
    expect(steps[index]).toHaveAttribute('aria-current', 'step');
    expect(progress.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    expect(within(progress).queryAllByText('Step completed')).toHaveLength(index);
    expect(within(progress).getByText('Create account')).toBeVisible();
    expect(within(progress).getByText('Confirm subscription')).toBeVisible();
    expect(screen.getByText('Sandbox · test cards only')).toBeVisible();
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
    const target = screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href')!.slice(1);
    expect(document.getElementById(target)).toBe(screen.getByRole('main'));
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('uses explicit completion facts instead of assuming every earlier step completed', () => {
    renderLayout({ currentStep: 'confirmation', completedSteps: ['account', 'plan'], children: <h1>Checking</h1> });
    const steps = within(screen.getByRole('navigation', { name: 'Workspace setup' })).getAllByRole('listitem');
    expect(steps[2]).not.toHaveAttribute('data-complete');
    expect(steps[3]).toHaveAttribute('aria-current', 'step');
    expect(steps[3]).not.toHaveAttribute('data-complete');
  });
});

it('renders settings navigation without unfinished setup progress or operational links', () => {
  renderLayout({ variant: 'settings', children: <h1>Your subscription</h1> });
  expect(screen.queryByRole('navigation', { name: 'Workspace setup' })).not.toBeInTheDocument();
  const nav = screen.getByRole('navigation', { name: 'Account settings' });
  expect(within(nav).getByRole('link', { name: 'Plan & billing' })).toHaveAttribute('aria-current', 'page');
  expect(within(nav).getByRole('link', { name: 'Account security' })).toHaveAttribute('href', '/account/security');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /dashboard|overview|today/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/test environment|sandbox/i)).not.toBeInTheDocument();
});

it('composes navigation/content/footer slots and the shared primitives', () => {
  renderLayout({
    currentStep: 'account',
    navigation: <a href="/login">Sign in</a>,
    footer: <span>Screen-owned footer</span>,
    children: <><h1>Create an account</h1><Input aria-label="Company" /><Button>Continue</Button></>,
  });
  expect(within(screen.getByRole('main')).getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  expect(screen.getByRole('textbox', { name: 'Company' })).toHaveAttribute('data-slot', 'input');
  expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('data-slot', 'button');
  expect(within(screen.getByRole('contentinfo')).getByText('Screen-owned footer')).toBeVisible();
  expect(screen.queryByText('Card details stay with Paddle.')).not.toBeInTheDocument();
});

it('uses account-specific disclosure until the plan/payment steps', () => {
  renderLayout({ currentStep: 'account', children: <h1>Account</h1> });
  expect(screen.getByText('Create your account first. Your plan and payment come next.')).toBeVisible();
  expect(screen.queryByText('Sandbox · test cards only')).not.toBeInTheDocument();
});

it.each(['setup', 'settings'] as const)('renders no support controls, placeholders or unconfigured policies in %s', (variant) => {
  const props: BillingSetupLayoutProps = variant === 'settings'
    ? { variant, children: <h1>Billing</h1> }
    : { variant, currentStep: 'plan', environment: 'sandbox', children: <h1>Plans</h1> };
  const { container } = renderLayout(props);
  expect(screen.queryByText(/help|contact|support|faq|preview/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /terms|privacy/i })).not.toBeInTheDocument();
  expect(container.querySelector('a[href="#"], a[href^="mailto:"], a[href="/help"]')).toBeNull();
});

it('renders only explicitly approved real policy destinations', () => {
  vi.stubEnv('VITE_SERVICE_POLICIES_APPROVED', 'true');
  vi.stubEnv('VITE_SERVICE_POLICY_ORIGIN', 'https://policies.example.test');
  vi.stubEnv('VITE_SERVICE_TERMS_URL', 'https://policies.example.test/terms');
  vi.stubEnv('VITE_SERVICE_PRIVACY_URL', 'https://policies.example.test/privacy');
  renderLayout({ currentStep: 'plan', children: <h1>Plans</h1> });
  const nav = screen.getByRole('navigation', { name: 'Legal policies' });
  expect(within(nav).getByRole('link', { name: 'Terms' })).toHaveAttribute('href', 'https://policies.example.test/terms');
  expect(within(nav).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', 'https://policies.example.test/privacy');
});

it.each(['#', 'javascript:alert(1)', 'https://other.example.test/privacy', 'https://policies.example.test/'])('omits unsafe/unapproved policy %s', (url) => {
  vi.stubEnv('VITE_SERVICE_POLICIES_APPROVED', 'true');
  vi.stubEnv('VITE_SERVICE_POLICY_ORIGIN', 'https://policies.example.test');
  vi.stubEnv('VITE_SERVICE_PRIVACY_URL', url);
  renderLayout({ currentStep: 'plan', children: <h1>Plans</h1> });
  expect(screen.queryByRole('navigation', { name: 'Legal policies' })).not.toBeInTheDocument();
});

it('switches EN/UR with the existing provider while retaining child identity and draft', () => {
  const mounted = vi.fn();
  function Draft() {
    const [value, setValue] = useState('');
    const { t } = useLanguage();
    useEffect(() => { mounted(); }, []);
    return <><h1>{t('Choose your plan')}</h1><Input aria-label="Company" value={value} onChange={(event) => setValue(event.target.value)} /></>;
  }
  const { container } = renderLayout({ currentStep: 'plan', environment: 'sandbox', children: <Draft /> });
  const input = screen.getByRole('textbox', { name: 'Company' });
  fireEvent.change(input, { target: { value: 'My company' } });
  fireEvent.click(screen.getByRole('button', { name: 'اردو' }));
  expect(document.documentElement).toHaveAttribute('dir', 'rtl');
  expect(container.querySelector('.billing-onboarding')).toHaveAttribute('lang', 'ur-PK');
  expect(screen.getByRole('navigation', { name: 'ورک اسپیس کی تیاری' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'اپنا پلان منتخب کریں' })).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Company' })).toBe(input);
  expect(input).toHaveValue('My company');
  expect(screen.getByRole('button', { name: 'اردو' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(document.documentElement).toHaveAttribute('dir', 'ltr');
  expect(input).toHaveValue('My company');
  expect(mounted).toHaveBeenCalledOnce();
});

it('preserves focused input across a language-context update without remounting', () => {
  function Wrapper({ children, language }: { children: ReactNode; language: 'en' | 'ur' }) {
    return <MemoryRouter><LanguageContext.Provider value={{ language, setLanguage: () => {}, t: (text, values) => translate(text, language, values) }}>{children}</LanguageContext.Provider></MemoryRouter>;
  }
  const content = <BillingSetupLayout currentStep="payment"><h1>Payment</h1><Input aria-label="Draft" /></BillingSetupLayout>;
  const result = render(<Wrapper language="en">{content}</Wrapper>);
  const input = screen.getByRole('textbox', { name: 'Draft' });
  act(() => input.focus());
  result.rerender(<Wrapper language="ur">{content}</Wrapper>);
  expect(screen.getByRole('textbox', { name: 'Draft' })).toBe(input);
  expect(input).toHaveFocus();
});
