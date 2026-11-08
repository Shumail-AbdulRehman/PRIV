import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import BillingPaymentPage from './BillingPaymentPage';
const mocks = vi.hoisted(() => ({ checkout: {status:'idle',message:null,prepared:null,isBusy:false,openCheckout:vi.fn(),checkStatus:vi.fn()} as Record<string, unknown>, user: { role: 'ADMIN', companyId: 42, id: 1 }, life: {} as Record<string, unknown>, catalog: {} as Record<string, unknown>, summary: {} as Record<string, unknown> }));
vi.mock('@/hooks/useAuth', () => ({ default: () => ({ user: mocks.user }) }));
vi.mock('./useBillingCheckout', () => ({ useBillingCheckout: () => mocks.checkout }));
vi.mock('../queries', () => ({ useBillingLifecycle: () => mocks.life, useBillingCatalog: () => mocks.catalog, useSubscription: () => mocks.summary }));
const life = () => ({ company: { id: 42, name: 'Fixture', plan: 'PRO', isActive: true, operationalStatus: 'ACTIVE' }, usage: { locations: 1, staff: 3, managers: 1 }, limits: { locations: 5, staff: 25, managers: 3 }, subscription: null, providerState: 'NOT_LINKED', billingConfigured: true, billingEnvironment: 'sandbox', ownerVerified: false, reconciliationRequired: false, checkoutAvailable: true, portalAvailable: false, checkoutReadiness: 'READY', workspaceAccessAllowed: false, checkoutResume: null });
const codes = ['STARTER', 'PRO', 'ADVANCED'];
const plans = codes.map((code, i) => ({ code, name: code === 'STARTER' ? 'Starter' : code === 'PRO' ? 'Pro' : 'Advanced', description: 'API definition', limits: { locations: i + 2, staff: i + 10, managers: i + 1 } }));
const entries = ['month', 'year'].flatMap(interval => codes.map((plan, i) => ({ plan, interval, priceId: `pri_${String.fromCharCode(97 + i).repeat(26)}${interval}`, productId: 'pro_' + 'a'.repeat(26), amount: interval === 'year' ? '12345' : '0', currencyCode: 'USD', trialPeriod: null })));
function Destination() { const loc = useLocation(); return <output>{loc.pathname + loc.search}</output>; }
function mount(path = '/subscription/payment?plan=PRO&interval=year') { return render(<MemoryRouter initialEntries={[path]}><LanguageProvider><Routes><Route path="/subscription/payment" element={<BillingPaymentPage />} /><Route path="*" element={<Destination />} /></Routes></LanguageProvider></MemoryRouter>); }
beforeEach(() => {
 localStorage.clear(); vi.stubEnv('VITE_PADDLE_ENVIRONMENT','sandbox');vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN','test_public'); mocks.checkout={status:'idle',message:null,prepared:null,isBusy:false,openCheckout:vi.fn(),checkStatus:vi.fn()}; mocks.user = { role: 'ADMIN', companyId: 42, id: 1 };
 const query = () => ({ isPending: false, isFetching: false, isError: false, error: null, refetch: vi.fn().mockResolvedValue({ isError: false }) });
 mocks.life = { ...query(), data: life(), dataOwner: { companyId: 42, ownerId: 1 } }; mocks.catalog = { ...query(), data: entries }; mocks.summary = { ...query(), data: { availablePlans: plans } };
});


it('shows selected yearly recurring amount and API capacities without inventing due today',()=>{
 mount(); expect(screen.getByText('Pro')).toBeVisible(); expect(screen.getByText('US$123.45')).toBeVisible();
 expect(screen.getByText(/· Yearly/)).toBeVisible();expect(screen.getByText('Includes 3 locations')).toBeVisible();expect(screen.getByText('Includes 11 staff seats')).toBeVisible();expect(screen.getByText('Includes 2 manager seats')).toBeVisible();
 expect(screen.queryByText(/due today/i)).not.toBeInTheDocument();expect(screen.getByText('Taxes and the final amount are confirmed by Paddle.')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Open secure checkout'}));expect(mocks.checkout.openCheckout).toHaveBeenCalledWith({plan:'PRO',interval:'year'});
 expect(screen.queryByRole('textbox')).not.toBeInTheDocument();expect(screen.queryByRole('link',{name:/help|contact/i})).not.toBeInTheDocument();
});
it.each(['browser-production','server-production','bad-token'])('never shows test card in %s',state=>{
 if(state==='browser-production')vi.stubEnv('VITE_PADDLE_ENVIRONMENT','production');if(state==='server-production')mocks.life.data={...life(),billingEnvironment:'production'};if(state==='bad-token')vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN','live_public');mount();expect(screen.queryByText('4242 4242 4242 4242')).not.toBeInTheDocument();
});
it('shows sandbox guidance before the card action',()=>{mount();expect(screen.getByText('4242 4242 4242 4242')).toBeVisible();expect(screen.getByText('Use a future expiry date and any three-digit security code.')).toBeVisible();});
it.each(['stale','missing','unknown','foreign','failed'])('disables checkout for %s data',state=>{
 if(state==='stale')mocks.life.isFetching=true;if(state==='missing')mocks.catalog.data=[];if(state==='unknown')mocks.life.data={...life(),checkoutReadiness:'UNKNOWN'};if(state==='foreign')mocks.life.dataOwner={companyId:99,ownerId:1};if(state==='failed')mocks.catalog.isError=true;
 mount();expect(screen.getByRole('button',{name:'Open secure checkout'})).toBeDisabled();
});
it('restores exact server draft instead of URL selection and has no change-plan action',()=>{
 mocks.life.data={...life(),checkoutResume:{plan:'PRO',interval:'year',transactionId:'txn_'+'a'.repeat(26)}};mount('/subscription/payment?plan=STARTER&interval=month');
 expect(screen.getByText('Pro')).toBeVisible();expect(screen.getByText(/· Yearly/)).toBeVisible();expect(screen.queryByRole('link',{name:'Change plan'})).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Reopen secure checkout'}));expect(mocks.checkout.openCheckout).toHaveBeenCalledWith({plan:'PRO',interval:'year'});
});
it('closed checkout retains prepared selection and reopens the same controller draft',()=>{
 mocks.checkout={...mocks.checkout,status:'reopenable',prepared:{plan:'PRO',interval:'year',transactionId:'txn_'+'a'.repeat(26)}};mocks.life.data={...life(),checkoutResume:mocks.checkout.prepared};mount();expect(screen.getByText('Your prepared checkout is ready to reopen.')).toBeVisible();expect(screen.queryByRole('link',{name:'Change plan'})).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'Reopen secure checkout'})).toBeEnabled();
});
it.each(['uncertain','open','loading'])('cannot submit again while %s',status=>{mocks.checkout.status=status;mocks.checkout.isBusy=status==='loading';mount();expect(screen.getByRole('button',{name:status==='loading'?'Opening secure checkout…':'Open secure checkout'})).toBeDisabled();if(status!=='loading')expect(screen.queryByRole('link',{name:'Change plan'})).not.toBeInTheDocument();});
it('invalid URL cannot invent a selection',()=>{mount('/subscription/payment?plan=BAD&interval=year');expect(screen.getByRole('button',{name:'Open secure checkout'})).toBeDisabled();});
it('completion signal goes to confirmation, never the workspace',()=>{mocks.checkout.status='pending';mount();expect(screen.getByRole('status')).toHaveTextContent('/subscription/activation');});
it('preserves summary through Urdu switch',()=>{mount();fireEvent.click(screen.getByRole('button',{name:'اردو'}));expect(screen.getByText(/· سالانہ/)).toBeVisible();expect(screen.getByRole('button',{name:'محفوظ چیک آؤٹ کھولیں'})).toBeEnabled();});

it('returns focus to the reopen action after the provider overlay closes',()=>{mocks.checkout.status='open';const tree=()=> <MemoryRouter initialEntries={['/subscription/payment?plan=PRO&interval=year']}><LanguageProvider><BillingPaymentPage/></LanguageProvider></MemoryRouter>;const view=render(tree());mocks.checkout.status='reopenable';mocks.checkout.prepared={plan:'PRO',interval:'year',transactionId:'txn_'+'a'.repeat(26)};mocks.life.data={...life(),checkoutResume:mocks.checkout.prepared};view.rerender(tree());expect(screen.getByRole('button',{name:'Reopen secure checkout'})).toHaveFocus();});
