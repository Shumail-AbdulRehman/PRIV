import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { LanguageContext } from '@/i18n/context';
import { translate } from '@/i18n/translations';
import { WorkspaceLink } from '@/components/marketing/MarketingCTA';
import { PaddlePricing } from './PaddlePricing';
import PricingPage from './PricingPage';

const mocks = vi.hoisted(() => ({
  user: null as null | { role: string },
  catalog: { data: [] as { plan: string; interval: string }[], isPending: false, isError: false },
  readCatalog: vi.fn(),
}));
vi.mock('@/hooks/useAuth', () => ({ default: () => ({ user: mocks.user, isAuthenticated: !!mocks.user }) }));
vi.mock('../Subscription/queries', () => ({ useBillingCatalog: () => { mocks.readCatalog(); return mocks.catalog; } }));

beforeEach(() => {
  mocks.user = null;
  mocks.catalog = { data: [], isPending: false, isError: false };
  mocks.readCatalog.mockClear();
});
function mount(props: Parameters<typeof PaddlePricing>[0] = {}, language: 'en' | 'ur' = 'en', page = false) {
  return render(<MemoryRouter><LanguageContext.Provider value={{ language, setLanguage: () => {}, t: (key, values) => translate(key, language, values) }}>{page ? <PricingPage /> : <PaddlePricing {...props} />}</LanguageContext.Provider></MemoryRouter>);
}

it.each(['month', 'year'] as const)('carries each public plan and the %s interval into signup', interval => {
  mount();
  if (interval === 'year') fireEvent.click(screen.getByRole('radio', { name: 'Yearly' }));
  for (const [name, code] of [['Starter', 'STARTER'], ['Pro', 'PRO']]) {
    expect(screen.getByRole('link', { name: `Choose ${name}` })).toHaveAttribute('href', `/signup?plan=${code}&interval=${interval}`);
  }
  expect(screen.getAllByRole('link')).toHaveLength(2);
  expect(mocks.readCatalog).not.toHaveBeenCalled();
});
it('updates both plan links when switching the interval back to monthly', () => {
  mount(); fireEvent.click(screen.getByRole('radio', { name: 'Yearly' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Monthly' }));
  expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  expect(screen.getAllByRole('link').every(link => link.getAttribute('href')?.endsWith('interval=month'))).toBe(true);
});
it('sends signed-in owners through the server next-step resolver', () => {
  mocks.user = { role: 'ADMIN' }; mount();
  expect(screen.getAllByRole('link')).toHaveLength(2);
  for (const link of screen.getAllByRole('link')) expect(link).toHaveAttribute('href', '/continue');
});
it.each(['MANAGER', 'STAFF'])('offers no purchase link to %s', role => {
  mocks.user = { role }; mount();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getAllByText('Only the company owner can view or change billing.')).toHaveLength(2);
  expect(mocks.readCatalog).not.toHaveBeenCalled();
});
it('respects the parent purchase restriction and message', () => {
  mocks.user = { role: 'ADMIN' }; mount({ subscribeDisabled: true, disabledMessage: 'Billing unavailable' });
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getAllByText('Billing unavailable')).toHaveLength(2);
  expect(mocks.readCatalog).not.toHaveBeenCalled();
});
it.each(['month', 'year'])('offers Enterprise self-serve only for a catalog-backed %s interval', interval => {
  mocks.user = { role: 'ADMIN' };
  mocks.catalog.data = [{ plan: 'ADVANCED', interval }];
  mount({ currentPlan: 'ADVANCED' });
  if (interval === 'year') fireEvent.click(screen.getByRole('radio', { name: 'Yearly' }));
  const enterprise = screen.getByRole('heading', { name: 'Enterprise' }).closest('article')!;
  expect(within(enterprise).getByRole('link')).toHaveAttribute('href', '/continue');
  expect(within(enterprise).getByText('Current capacity plan')).toBeVisible();
  fireEvent.click(screen.getByRole('radio', { name: interval === 'month' ? 'Yearly' : 'Monthly' }));
  expect(within(enterprise).queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Contact sales' })).toBeVisible();
});
it.each(['empty', 'pending', 'error'])('keeps the Enterprise inquiry for an %s catalog', state => {
  mocks.user = { role: 'ADMIN' };
  if (state !== 'empty') mocks.catalog.data = [{ plan: 'ADVANCED', interval: 'month' }];
  mocks.catalog.isPending = state === 'pending'; mocks.catalog.isError = state === 'error';
  mount();
  expect(screen.getByRole('button', { name: 'Contact sales' })).toBeVisible();
  expect(screen.getAllByRole('link')).toHaveLength(2);
});
it.each(['en', 'ur'] as const)('renders no promotional trial wording in %s', language => {
  const { container } = mount({}, language);
  expect(container.textContent).not.toMatch(/trial|آزمائشی\s+مدت|مفت\s+آزمائش/iu);
});
it('preserves the historical Trialing status translation', () => {
  expect(translate('Trialing', 'en')).toBe('Trialing');
  expect(translate('Trialing', 'ur')).toBe('آزمائشی مدت جاری');
});
it.each([false, true])('routes the marketing CTA with authenticated=%s', authenticated => {
  mocks.user = authenticated ? { role: 'ADMIN' } : null;
  render(<MemoryRouter><WorkspaceLink /></MemoryRouter>);
  expect(screen.getByRole('link')).toHaveAttribute('href', authenticated ? '/continue' : '/signup');
});

it.each([null, 'ADMIN', 'MANAGER', 'STAFF'])('keeps the full pricing page accurate for role=%s', role => {
  mocks.user = role ? { role } : null;
  mocks.catalog.data = [{ plan: 'ADVANCED', interval: 'month' }];
  const { container } = mount({}, 'en', true);
  expect(container.textContent).not.toMatch(/trial/iu);
  expect(screen.getByText(/Enterprise checkout is available in owner billing when the configured catalog includes it/)).toBeInTheDocument();
  if (!role) {
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: 'Choose Starter' })).toHaveAttribute('href', '/signup?plan=STARTER&interval=month');
    expect(screen.getByRole('link', { name: 'Choose Pro' })).toHaveAttribute('href', '/signup?plan=PRO&interval=month');
    expect(mocks.readCatalog).not.toHaveBeenCalled();
  } else {
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(role === 'ADMIN' ? 4 : 1);
    for (const link of links) expect(link).toHaveAttribute('href', '/continue');
    if (role !== 'ADMIN') {
      expect(screen.getAllByText('Only the company administrator can subscribe for this workspace.')).toHaveLength(2);
      expect(mocks.readCatalog).not.toHaveBeenCalled();
    }
  }
});
