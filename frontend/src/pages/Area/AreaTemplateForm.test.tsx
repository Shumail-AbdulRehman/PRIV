import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { WorkspaceTheme } from '@/components/common/WorkspaceTheme';
import AreaTemplateForm from './AreaTemplateForm';
const m = vi.hoisted(() => ({ create: vi.fn(), area: vi.fn(), invalidate: vi.fn() }));
vi.mock('./api', () => ({ createArea: m.create, getArea: m.area, getAreas: vi.fn(), getMappingTemplates: vi.fn(), addItems: vi.fn(), archiveArea: vi.fn(), editArea: vi.fn(), editItem: vi.fn() }));
vi.mock('@/lib/invalidateWorkspace', () => ({ invalidateWorkspace: m.invalidate }));
function mount(language = 'en') { localStorage.setItem('hygene-ops.language', language); const close = vi.fn(), created = vi.fn(); render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><LanguageProvider><WorkspaceTheme.Provider value><AreaTemplateForm locationId={20} close={close} created={created} /></WorkspaceTheme.Provider></LanguageProvider></QueryClientProvider>); return { close, created }; }
beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); m.create.mockResolvedValue({ id: 70 }); m.invalidate.mockResolvedValue(undefined); });
it('creates through the actual saved-area contract with real fixture counts inside an accessible dialog', async () => {
  const { created } = mount(); expect(screen.getByRole('dialog', { name: 'Prepare area template' })).toBeInTheDocument(); const button = screen.getByRole('button', { name: 'Create area template' }); expect(button).toBeDisabled(); fireEvent.change(screen.getByLabelText('Area name'), { target: { value: ' Saved area ' } }); fireEvent.click(button);
  await waitFor(() => expect(created).toHaveBeenCalledWith(70)); expect(m.create).toHaveBeenCalledWith(20, { name: 'Saved area', roomType: 'WASHROOM', layoutInstructions: '', counts: [{ fixtureType: 'FLOOR', count: 1 }] });
});
it('requires valid fixture capacity and translates all built-in fields in Urdu', () => {
  mount('ur'); expect(screen.getByRole('dialog', { name: 'علاقے کا سانچہ تیار کریں' })).toBeInTheDocument(); fireEvent.change(screen.getByLabelText('علاقے کا نام'), { target: { value: 'User saved name' } }); fireEvent.change(screen.getByLabelText('بیسن'), { target: { value: '200' } });
  expect(screen.getByRole('alert')).toHaveTextContent('زیادہ سے زیادہ 200 فکسچر منتخب کریں۔'); expect(screen.getByRole('button', { name: 'علاقے کا سانچہ بنائیں' })).toBeDisabled(); expect(document.documentElement.dir).toBe('rtl'); expect(m.create).not.toHaveBeenCalled();
});
it('pending creation blocks duplicate submission and Escape dismissal', async () => {
  let finish!: (value: unknown) => void; m.create.mockImplementation(() => new Promise(resolve => { finish = resolve; })); const { close, created } = mount(); fireEvent.change(screen.getByLabelText('Area name'), { target: { value: 'Saved area' } }); fireEvent.click(screen.getByRole('button', { name: 'Create area template' })); expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled(); fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' }); expect(close).not.toHaveBeenCalled(); expect(m.create).toHaveBeenCalledTimes(1); finish({ id: 71 }); await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
});
it('lost creation response preserves the draft and prevents a blind duplicate retry', async () => {
  m.create.mockRejectedValue(new Error('private transport detail')); const { close, created } = mount(); fireEvent.change(screen.getByLabelText('Area name'), { target: { value: 'Uncertain area' } }); fireEvent.click(screen.getByRole('button', { name: 'Create area template' })); expect(await screen.findByRole('alert')).toHaveTextContent('Area creation could not be confirmed.'); expect(screen.getByLabelText('Area name')).toHaveValue('Uncertain area'); expect(screen.getByRole('button', { name: 'Create area template' })).toBeDisabled(); fireEvent.click(screen.getByRole('button', { name: 'Close and check areas' })); expect(close).toHaveBeenCalled(); expect(created).not.toHaveBeenCalled(); expect(m.create).toHaveBeenCalledTimes(1);
});
it('a definitive denied save keeps the draft and presents a translated error', async () => {
  m.create.mockRejectedValue({ response: { status: 403 } }); mount('ur'); fireEvent.change(screen.getByLabelText('علاقے کا نام'), { target: { value: 'Retained name' } }); fireEvent.click(screen.getByRole('button', { name: 'علاقے کا سانچہ بنائیں' })); expect(await screen.findByRole('alert')).toHaveTextContent('اس اقدام کی اجازت نہیں۔'); expect(screen.getByLabelText('علاقے کا نام')).toHaveValue('Retained name'); expect(screen.getByRole('button', { name: 'علاقے کا سانچہ بنائیں' })).toBeEnabled();
});
