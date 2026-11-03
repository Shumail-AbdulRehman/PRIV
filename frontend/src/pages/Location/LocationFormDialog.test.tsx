import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {beforeEach,expect,it,vi} from 'vitest';
import {LanguageProvider} from '@/i18n/LanguageProvider';
import LocationFormDialog from './LocationFormDialog';
const m=vi.hoisted(()=>({create:vi.fn(),update:vi.fn()}));
vi.mock('./queries',()=>({useCreateLocation:()=>({mutateAsync:m.create}),useUpdateLocation:()=>({mutateAsync:m.update})}));
vi.mock('./LocationMapPicker',()=>({default:()=>null}));
function mount(){const changed=vi.fn(),saved=vi.fn();render(<LanguageProvider><LocationFormDialog open onOpenChange={changed} onSaved={saved}/></LanguageProvider>);return {changed,saved};}
function fill(){fireEvent.change(screen.getByLabelText('Location name'),{target:{value:'Synthetic saved site'}});fireEvent.change(screen.getByLabelText('Street address'),{target:{value:'Synthetic address'}});fireEvent.change(screen.getByLabelText('Latitude'),{target:{value:'31'}});fireEvent.change(screen.getByLabelText('Longitude'),{target:{value:'74'}});}
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();});
it('protects a pending location save from duplicate submit and Escape dismissal',async()=>{
 let finish!:()=>void;m.create.mockImplementation(()=>new Promise<void>(resolve=>{finish=resolve;}));const {changed,saved}=mount();fill();const form=screen.getByRole('button',{name:'Create location'}).closest('form')!;fireEvent.submit(form);await waitFor(()=>expect(m.create).toHaveBeenCalledTimes(1));fireEvent.submit(form);fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'});expect(changed).not.toHaveBeenCalled();expect(screen.getByRole('button',{name:'Saving...'})).toBeDisabled();finish();await waitFor(()=>expect(saved).toHaveBeenCalledTimes(1));expect(m.create).toHaveBeenCalledTimes(1);
});
it('keeps an unknown create outcome explicit and prevents a duplicate retry',async()=>{
 m.create.mockRejectedValue(new Error('private transport'));mount();fill();fireEvent.click(screen.getByRole('button',{name:'Create location'}));await screen.findByText('Location creation could not be confirmed. Close and check the location list before creating again.');expect(screen.getByRole('button',{name:'Create location'})).toBeDisabled();expect(screen.getByLabelText('Location name')).toHaveValue('Synthetic saved site');expect(screen.queryByText('private transport')).not.toBeInTheDocument();
});
