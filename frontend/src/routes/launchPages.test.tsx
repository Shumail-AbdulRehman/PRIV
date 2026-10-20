import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authReducer, { setUser, type AuthUser } from '../store/slices/authSlice';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { ProtectedRoute } from '../App';
import DashboardLayout from '../components/layout/DashboardLayout';
import { workspaceRoutes } from './workspaceRoutes';
import { PlatformUnavailable, WorkspaceAudience, WorkspaceRouteError } from './launchPages';
const m = vi.hoisted(() => ({ logout: { mutate: vi.fn(), isPending: false, isError: false } }));
vi.mock('../queries/auth', () => ({ useLogout: () => m.logout, useGetCurrentUser: vi.fn() }));
vi.mock('../pages/Exceptions/queries', () => ({ useExceptionCount: () => ({ data: { total: 2 } }) }));
vi.mock('../pages/Dashboard/DashboardPage.tsx', () => ({ default: () => <h1>Operational dashboard fixture</h1> }));
vi.mock('../pages/Subscription/SubscriptionPage.tsx', () => ({ default: () => <h1>Billing details fixture</h1> }));
vi.mock('../pages/Managers/ManagersPage.tsx', () => ({ default: () => <h1>Manager accounts fixture</h1> }));
function mount(role: AuthUser['role'] | null = 'ADMIN', path = '/dashboard', language = 'en') {
  localStorage.setItem('hygene-ops.language', language);
  const store = configureStore({ reducer: { auth: authReducer } });
  if (role) store.dispatch(setUser({ id: 7, role, name: 'Synthetic workspace account', email: 'fixture@example.invalid', companyId: 42 }));
  const router = createMemoryRouter([
    { path: '/', element: <ProtectedRoute><WorkspaceAudience><DashboardLayout /></WorkspaceAudience></ProtectedRoute>, children: workspaceRoutes, errorElement: <WorkspaceRouteError /> },
    { path: '/platform/*', element: <PlatformUnavailable /> },
    { path: '/login', element: <h1>Sign in fixture</h1> },
    { path: '/broken', loader: () => { throw new Error('private-exception-detail'); }, element: <p>Should not render</p>, errorElement: <WorkspaceRouteError /> },
  ], { initialEntries: [path] });
  render(<Provider store={store}><LanguageProvider><RouterProvider router={router} /></LanguageProvider></Provider>);
  return router;
}
beforeEach(() => {
  vi.clearAllMocks(); m.logout.isPending = false; m.logout.isError = false;
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  localStorage.clear(); document.documentElement.dir = 'ltr';
});
describe('approved workspace shell and actual route role guards', () => {
  it('shows owner navigation with real routes and an accessible current page', async () => {
    mount();
    await screen.findByRole('heading', { name: 'Operational dashboard fixture' });
    const nav = screen.getByRole('navigation', { name: 'Workspace navigation' });
    expect(within(nav).getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Plan & billing' })).toHaveAttribute('href', '/subscription');
    expect(within(nav).getByRole('link', { name: 'Managers' })).toHaveAttribute('href', '/managers');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#workspace-content');
    expect(document.title).toBe('Overview · Hygene Ops');
  });
  it('preserves manager operational navigation without owner billing or manager administration links', async () => {
    mount('MANAGER');
    await screen.findByRole('heading', { name: 'Operational dashboard fixture' });
    const nav = screen.getByRole('navigation', { name: 'Workspace navigation' });
    expect(within(nav).getByRole('link', { name: 'Team' })).toHaveAttribute('href', '/staff');
    expect(within(nav).queryByRole('link', { name: 'Plan & billing' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Managers' })).not.toBeInTheDocument();
  });
  it.each(['/subscription', '/managers', '/settings'])('denies manager direct navigation to %s', async path => {
    const router = mount('MANAGER', path);
    await screen.findByRole('heading', { name: 'Operational dashboard fixture' });
    expect(router.state.location.pathname).toBe('/dashboard');
  });
  it('routes the owner to the existing billing page', async () => {
    mount('ADMIN', '/subscription');
    await screen.findByRole('heading', { name: 'Billing details fixture' });
  });
  it('renders truthful settings unavailable state without fake save controls', async () => {
    mount('ADMIN', '/settings');
    expect(await screen.findByRole('heading', { name: 'Company settings are unavailable' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });
  it.each(['/dashboard', '/attendance', '/staff', '/subscription', '/managers'])('hands staff web access at %s to Android without mounting operational pages', async path => {
    mount('STAFF', path);
    expect(await screen.findByRole('heading', { name: 'Use the Android app' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Workspace navigation' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });
  it('restores unauthenticated users to sign in', async () => {
    const router = mount(null);
    expect(await screen.findByRole('heading', { name: 'Sign in fixture' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });
  it('does not promote a tenant ADMIN to platform operator', async () => {
    mount('ADMIN', '/platform/companies');
    expect(await screen.findByRole('heading', { name: 'Platform access is unavailable' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Workspace navigation' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});

describe('navigation language, focus and feedback', () => {
  it('switches the shared shell to complete Urdu navigation and RTL', async () => {
    mount();
    await screen.findByRole('heading', { name: 'Operational dashboard fixture' });
    fireEvent.click(screen.getByRole('button', { name: 'اردو' }));
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
    expect(document.documentElement.lang).toBe('ur-PK');
    expect(screen.getByRole('navigation', { name: 'ورک اسپیس نیویگیشن' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'پلان اور بلنگ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'نیویگیشن کھولیں' })).toBeInTheDocument();
  });
  it('restores a saved Urdu preference for staff handoff', async () => {
    mount('STAFF', '/dashboard', 'ur');
    expect(await screen.findByRole('heading', { name: 'اینڈرائیڈ ایپ استعمال کریں' })).toBeInTheDocument();
    expect(document.documentElement.dir).toBe('rtl');
  });
  it('opens a named mobile navigation dialog and returns keyboard focus on close at 390px', async () => {
    vi.stubGlobal('innerWidth', 390);
    mount(); await screen.findByRole('heading', { name: 'Operational dashboard fixture' });
    const trigger = screen.getByRole('button', { name: 'Open navigation' });
    trigger.focus(); expect(trigger).toHaveFocus(); fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Workspace menu' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('navigation', { name: 'Workspace navigation' })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close navigation' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus(); expect(trigger).toHaveAttribute('aria-expanded', 'false');
    vi.unstubAllGlobals();
  });
  it('closes the dialog on Escape without losing focus', async () => {
    mount(); await screen.findByRole('heading', { name: 'Operational dashboard fixture' });
    const trigger = screen.getByRole('button', { name: 'Open navigation' });
    fireEvent.click(trigger); await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
  it('uses the real logout hook and exposes a retryable failure without hiding navigation', async () => {
    m.logout.isError = true; mount(); await screen.findByRole('heading', { name: 'Operational dashboard fixture' });
    expect(screen.getByRole('alert')).toHaveTextContent('Sign out failed. Try again.');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' })); expect(m.logout.mutate).toHaveBeenCalledOnce();
  });
  it('disables duplicate logout while pending', async () => {
    m.logout.isPending = true; mount('STAFF');
    expect(await screen.findByRole('button', { name: 'Signing out…' })).toBeDisabled();
  });
  it('renders a safe not-found page with a recovery link', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mount('ADMIN', '/unknown-address');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to workspace' })).toHaveAttribute('href', '/dashboard');
  });
  it('shows recoverable route errors without exposing raw details', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mount('ADMIN', '/broken');
    expect(await screen.findByRole('heading', { name: 'This page is unavailable' })).toBeInTheDocument();
    expect(screen.queryByText('private-exception-detail')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Back to workspace' })).toHaveAttribute('href', '/dashboard');
  });
});
