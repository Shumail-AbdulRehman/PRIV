import { useState, type ReactNode } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { client } from '@/api/client';
import authReducer, { setUser, type AuthUser } from '@/store/slices/authSlice';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { translate } from '@/i18n/translations';
import StaffCreateDialog from './StaffCreateDialog';
import StaffEditDialog, { type EditableStaff } from './StaffEditDialog';

const site = { id: 20, name: 'Saved site', timezone: 'Asia/Karachi' };
const otherSite = { id: 30, name: 'Another saved site', timezone: 'America/New_York' };
const person = { id: 7, name: 'Saved worker', email: 'worker@example.invalid', phone: '03001234567', isActive: true, locationId: 20, location: site, shiftStart: '1970-01-01T04:00:00Z', shiftEnd: '1970-01-01T12:00:00Z' };
const requests: { url?: string; method?: string; data: Record<string, unknown> }[] = [];
const originalAdapter = client.defaults.adapter;
let failure: { status: number; code?: string } | undefined;
let hold = false;
let release: (() => void) | undefined;
function CurrentPath() { return <output aria-label="Current route">{useLocation().pathname}</output>; }
function mount(node: ReactNode, role: AuthUser['role'] = 'ADMIN', language: 'en' | 'ur' = 'en') {
  localStorage.setItem('hygene-ops.language', language);
  const store = configureStore({ reducer: { auth: authReducer } });
  store.dispatch(setUser({ id: 2, companyId: 42, role, name: 'Saved owner', email: 'owner@example.invalid' }));
  const query = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const tree = (child: ReactNode) => <Provider store={store}><QueryClientProvider client={query}><LanguageProvider><MemoryRouter initialEntries={['/staff']}><div className="workspace">{child}<CurrentPath /></div></MemoryRouter></LanguageProvider></QueryClientProvider></Provider>;
  const view = render(tree(node));
  return { ...view, store, query, rerenderNode: (child: ReactNode) => view.rerender(tree(child)) };
}
function create(props: Partial<React.ComponentProps<typeof StaffCreateDialog>> = {}, role: AuthUser['role'] = 'ADMIN') {
  const changed = vi.fn(), saved = vi.fn();
  const view = mount(<StaffCreateDialog open locations={[site, otherSite]} onOpenChange={changed} onSaved={saved} {...props} />, role);
  return { ...view, changed, saved };
}
function edit(record: EditableStaff = person) {
  const close = vi.fn(), saved = vi.fn();
  return { ...mount(<StaffEditDialog person={record} timezone={site.timezone} onClose={close} onSaved={saved} />), close, saved };
}
function field(label: string, value: string) { fireEvent.change(screen.getByLabelText(label), { target: { value } }); }
function fill() {
  field('Full Name', 'New worker'); field('Email', 'new@example.invalid'); field('Phone Number', '03007654321'); field('Password', 'synthetic password'); field('Shift Start', '22:00'); field('Shift End', '06:00');
}
function submit(label = 'Create staff') { fireEvent.click(screen.getByRole('button', { name: label })); }
function forceSubmit(label: string) { fireEvent.submit((screen.getByRole('button', { name: label }) as HTMLButtonElement).form!); }
beforeEach(() => {
  localStorage.clear(); requests.length = 0; failure = undefined; hold = false; release = undefined;
  client.defaults.adapter = async config => {
    requests.push({ url: config.url, method: config.method, data: JSON.parse(config.data || '{}') });
    if (hold) await new Promise<void>(resolve => { release = resolve; });
    if (failure) throw { config, response: { status: failure.status, data: { message: 'Private backend detail', errors: [{ code: failure.code }] } } };
    return { config, data: { data: { id: 7 } }, status: 200, statusText: 'OK', headers: {} };
  };
});
afterEach(() => { client.defaults.adapter = originalAdapter; });

it('names both dialogs and keeps the footer submit associated with its form', () => {
  const first = create();
  expect(screen.getByRole('dialog', { name: 'Add team member' })).toHaveAccessibleDescription('Set up a real staff account and its working shift.');
  expect((screen.getByRole('button', { name: 'Create staff' }) as HTMLButtonElement).form).toBeInTheDocument();
  first.unmount(); edit();
  expect(screen.getByRole('dialog', { name: 'Edit team member' })).toHaveAccessibleDescription('Times use the assigned site’s timezone.');
  expect((screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement).form).toBeInTheDocument();
});
it('blocks an empty create with six associated errors and focuses the name', async () => {
  create(); submit();
  expect(await screen.findAllByRole('alert')).toHaveLength(6);
  for (const label of ['Full Name', 'Email', 'Phone Number', 'Password', 'Shift Start', 'Shift End']) {
    expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(label)).toHaveAccessibleDescription();
  }
  expect(screen.getByLabelText('Full Name')).toHaveFocus(); expect(requests).toHaveLength(0);
});
it.each([
  ['Full Name', 'A', 'Name must be at least 2 characters'],
  ['Phone Number', '123456', 'Phone number must be at least 7 characters'],
  ['Phone Number', '1'.repeat(21), 'Phone number must be at most 20 characters'],
  ['Password', 'short', 'Use at least 8 characters'],
])('preserves %s validation for %s', async (label, value, message) => {
  create(); fill(); field(label, value); submit(); expect(await screen.findByRole('alert')).toHaveTextContent(message); expect(requests).toHaveLength(0);
});
it('preserves native email validity before create', () => {
  create(); fill(); field('Email', 'invalid-email'); submit(); expect(screen.getByLabelText('Email')).toBeInvalid(); expect(requests).toHaveLength(0);
});
it('keeps owner unassigned hires, trimming and the original UTC payload', async () => {
  const view = create(); fill(); field('Full Name', '  New worker  '); field('Phone Number', ' 03007654321 '); submit();
  await waitFor(() => expect(view.saved).toHaveBeenCalledOnce());
  expect(requests).toEqual([{ url: '/staff/create-staff', method: 'post', data: { name: 'New worker', email: 'new@example.invalid', phone: '03007654321', password: 'synthetic password', shiftStart: '1970-01-01T22:00:00.000Z', shiftEnd: '1970-01-01T06:00:00.000Z' } }]);
  expect(view.changed).toHaveBeenCalledWith(false); expect(screen.getByLabelText('Password')).toHaveValue('');
});
it('uses the fixed location and its timezone without allowing changes', async () => {
  const view = create({ location: site }); fill();
  expect(screen.getByRole('combobox', { name: 'Location' })).toBeDisabled(); expect(screen.getByLabelText('Location')).toHaveValue('20');
  submit(); await waitFor(() => expect(view.saved).toHaveBeenCalledOnce());
  expect(requests[0].data).toMatchObject({ locationId: 20, shiftStart: '1970-01-01T17:00:00.000Z', shiftEnd: '1970-01-01T01:00:00.000Z' });
});
it('uses SelectMenu to save the selected location timezone', async () => {
  const view = create(); fill(); fireEvent.keyDown(screen.getByRole('button', { name: 'Location (optional): No location' }), { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('menuitemradio', { name: otherSite.name })); submit();
  await waitFor(() => expect(view.saved).toHaveBeenCalledOnce()); expect(requests[0].data).toMatchObject({ locationId: 30, shiftStart: '1970-01-02T03:00:00.000Z', shiftEnd: '1970-01-01T11:00:00.000Z' });
});
it('requires managers to select an assigned site before hiring', async () => {
  const view = create({ locations: [site] }, 'MANAGER'); fill(); submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('Select assigned site'); expect(requests).toHaveLength(0);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Location: Select assigned site' }), { key: 'ArrowDown' });
  expect(screen.queryByRole('menuitemradio', { name: otherSite.name })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('menuitemradio', { name: site.name })); submit(); await waitFor(() => expect(view.saved).toHaveBeenCalledOnce()); expect(requests[0].data.locationId).toBe(20);
});
it('rejects a manager fixed-location hire outside the assigned locations', async () => {
  create({ locations: [site], location: otherSite }, 'MANAGER'); fill(); submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('Select assigned site');
  expect(screen.getByLabelText('Location')).toHaveAccessibleDescription('Select assigned site');
  expect(requests).toHaveLength(0);
});
it('allows a manager fixed-location hire inside the assigned locations', async () => {
  const view = create({ locations: [site], location: site }, 'MANAGER'); fill(); submit();
  await waitFor(() => expect(view.saved).toHaveBeenCalledOnce());
  expect(requests[0].data).toMatchObject({ locationId: 20, shiftStart: '1970-01-01T17:00:00.000Z', shiftEnd: '1970-01-01T01:00:00.000Z' });
});
it('keeps an empty manager scope blocked without inventing a location', async () => {
  create({ locations: [] }, 'MANAGER'); fill(); submit(); expect(await screen.findByRole('alert')).toHaveTextContent('Select assigned site'); expect(requests).toHaveLength(0);
});
it('keeps inline mode without a dialog and resets on Cancel', async () => {
  const changed = vi.fn(); const view = create({ inline: true, location: site, onOpenChange: changed }); fill();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(screen.getByRole('region', { name: 'Add team member' })).toBeInTheDocument();
  submit('Cancel'); expect(changed).toHaveBeenCalledWith(false);
  view.rerenderNode(<StaffCreateDialog open inline location={site} onOpenChange={changed} />);
  await waitFor(() => expect(screen.getByLabelText('Password')).toHaveValue('')); expect(requests).toHaveLength(0);
});
it.each(['CAPACITY_REACHED', 'SUBSCRIPTION_REQUIRED'])('retains the create draft and server %s guidance', async code => {
  failure = { status: 403, code }; create(); fill(); submit();
  expect(await screen.findByRole('alert')).toHaveTextContent(code === 'CAPACITY_REACHED' ? 'capacity has been reached' : 'active subscription is required');
  expect(screen.getByLabelText('Full Name')).toHaveValue('New worker'); expect(screen.queryByText('Private backend detail')).not.toBeInTheDocument();
});
it.each([403, 409, 503])('preserves a create draft after HTTP %i and allows a deliberate retry', async status => {
  failure = { status }; create({ inline: true }); fill(); submit(); await screen.findByRole('alert');
  expect(screen.getByLabelText('Phone Number')).toHaveValue('03007654321'); expect(screen.queryByText('Private backend detail')).not.toBeInTheDocument();
  failure = undefined; submit(); await waitFor(() => expect(requests).toHaveLength(2));
});
it('protects a pending create from duplicate submits and every dismissal', async () => {
  hold = true; const view = create(); fill(); submit(); await waitFor(() => expect(release).toBeDefined());
  expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled(); expect(screen.getByLabelText('Full Name')).toBeDisabled();
  forceSubmit('Creating...'); fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' }); submit('Close'); submit('Cancel');
  expect(requests).toHaveLength(1); expect(view.changed).not.toHaveBeenCalled();
  await act(async () => release!()); await waitFor(() => expect(view.saved).toHaveBeenCalledOnce());
});
it('shows the edit session warning, read-only location and existing Staff access destination', () => {
  const view = edit(); expect(screen.getByText('Updating the login email ends existing staff sessions.')).toBeVisible();
  expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Updating the login email ends existing staff sessions.');
  expect(screen.getByLabelText('Location')).toHaveValue(site.name); expect(screen.getByLabelText('Location')).toHaveAttribute('readonly');
  expect(screen.getByRole('link', { name: 'Staff access' })).toHaveAttribute('href', '/staff/7');
  fireEvent.click(screen.getByRole('link', { name: 'Staff access' })); expect(view.close).toHaveBeenCalledOnce(); expect(screen.getByLabelText('Current route')).toHaveTextContent('/staff/7');
});
it('uses a saved location ID when the caller supplies no name, and Unassigned for no location', () => {
  const view = edit({ ...person, location: undefined }); expect(screen.getByLabelText('Location')).toHaveValue('#20'); view.unmount();
  edit({ ...person, location: null, locationId: null }); expect(screen.getByLabelText('Location')).toHaveValue('Unassigned');
});
it.each(['Name', 'Email'])('blocks edit when required %s is empty', label => {
  edit(); field(label, ''); expect(screen.getByLabelText(label)).toBeInvalid(); expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled(); forceSubmit('Save changes'); expect(requests).toHaveLength(0);
});
it('retains native edit email and phone constraints', () => {
  edit(); field('Email', 'invalid-email'); submit('Save changes'); expect(screen.getByLabelText('Email')).toBeInvalid(); expect(requests).toHaveLength(0);
  expect(screen.getByLabelText('Name')).toHaveAttribute('minlength', '2'); expect(screen.getByLabelText('Phone Number')).toHaveAttribute('minlength', '7'); expect(screen.getByLabelText('Phone Number')).toHaveAttribute('maxlength', '20');
});
it('submits only changed edit fields, preserving shift dates and timezone conversion', async () => {
  const view = edit(); field('Name', '  Changed worker  '); field('Email', 'updated@example.invalid'); field('Phone Number', ''); field('Shift Start', '22:00'); field('Shift End', '06:00'); submit('Save changes');
  await waitFor(() => expect(view.saved).toHaveBeenCalledOnce()); expect(requests).toEqual([{ url: '/staff/7', method: 'patch', data: { name: 'Changed worker', email: 'updated@example.invalid', phone: '', shiftStart: '1970-01-01T17:00:00.000Z', shiftEnd: '1970-01-01T01:00:00.000Z' } }]); expect(view.close).toHaveBeenCalledOnce();
});
it('does not mutate an unchanged edit or clear saved shifts when optional clocks are blank', async () => {
  const view = edit(); field('Shift Start', ''); field('Shift End', ''); submit('Save changes'); await waitFor(() => expect(view.saved).toHaveBeenCalledOnce()); expect(requests).toHaveLength(0);
});
it('cannot edit an inactive account even with a synthetic form submission', async () => {
  edit({ ...person, isActive: false }); field('Name', 'Changed worker'); expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled(); forceSubmit('Save changes'); await act(async () => {}); expect(requests).toHaveLength(0);
});
it.each([400, 403, 409, 503])('keeps edit drafts and safe guidance after HTTP %i', async status => {
  failure = { status }; edit(); field('Name', 'Changed worker'); submit('Save changes');
  expect(await screen.findByRole('alert')).not.toHaveTextContent('Private backend detail'); expect(screen.getByLabelText('Name')).toHaveValue('Changed worker');
  if (status === 409) expect(screen.getByRole('alert')).toHaveTextContent('record changed');
});
it('protects pending edit and Staff access navigation without changing its payload', async () => {
  hold = true; const view = edit(); field('Name', 'Changed worker'); submit('Save changes'); await waitFor(() => expect(release).toBeDefined());
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled(); expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  forceSubmit('Saving…'); fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' }); submit('Close'); fireEvent.click(screen.getByRole('link', { name: 'Staff access' }));
  expect(screen.getByLabelText('Current route')).toHaveTextContent('/staff'); expect(view.close).not.toHaveBeenCalled(); expect(requests).toHaveLength(1);
  await act(async () => release!()); await waitFor(() => expect(view.saved).toHaveBeenCalledOnce());
});
it('preserves a create draft through hide/reopen, then resets secrets on location or principal change', async () => {
  const changed = vi.fn(); const view = create({ onOpenChange: changed }); fill();
  view.rerenderNode(<StaffCreateDialog open={false} locations={[site]} onOpenChange={changed} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); view.rerenderNode(<StaffCreateDialog open locations={[site]} onOpenChange={changed} />);
  expect(screen.getByLabelText('Full Name')).toHaveValue('New worker');
  view.rerenderNode(<StaffCreateDialog open location={site} locations={[site]} onOpenChange={changed} />); expect(screen.getByLabelText('Password')).toHaveValue('');
  field('Password', 'prior draft'); act(() => view.store.dispatch(setUser({ id: 88, companyId: 99, role: 'ADMIN', name: 'Another owner', email: 'other@example.invalid' })));
  expect(screen.getByLabelText('Password')).toHaveValue('');
});
it('restores opener focus on Escape and supports keyboard focus containment', async () => {
  function Harness() { const [open, setOpen] = useState(false); return <><button onClick={() => setOpen(true)}>Open hire</button><StaffCreateDialog open={open} locations={[site]} onOpenChange={setOpen} /></>; }
  mount(<Harness />); const opener = screen.getByRole('button', { name: 'Open hire' }); opener.focus(); fireEvent.click(opener);
  const dialog = screen.getByRole('dialog', { name: 'Add team member' }); expect(within(dialog).getByRole('heading')).toHaveFocus();
  fireEvent.keyDown(dialog, { key: 'Escape' }); await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument()); await waitFor(() => expect(opener).toHaveFocus());
});
it('translates and scopes Urdu panels while preserving record data', () => {
  mount(<StaffEditDialog person={person} timezone={site.timezone} onClose={() => {}} />, 'ADMIN', 'ur');
  const dialog = screen.getByRole('dialog', { name: translate('Edit team member', 'ur') }); expect(dialog).toHaveAttribute('dir', 'rtl');
  expect(screen.getByLabelText(translate('Name', 'ur'))).toHaveValue(person.name); expect(screen.getByLabelText(translate('Location', 'ur'))).toHaveValue(site.name);
  expect(screen.getByLabelText(translate('Email', 'ur'))).toHaveAttribute('dir', 'ltr'); expect(screen.getByText(translate('Updating the login email ends existing staff sessions.', 'ur'))).toBeVisible();
});
