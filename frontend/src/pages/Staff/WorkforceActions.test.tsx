import {configureStore} from '@reduxjs/toolkit';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {beforeEach,expect,it,vi} from 'vitest';
import authReducer,{setUser,type AuthUser} from '@/store/slices/authSlice';
import {LanguageProvider} from '@/i18n/LanguageProvider';
import WorkforceActions from './WorkforceActions';
import ManagerFormDialog from '../Managers/ManagerFormDialog';
import StaffCreateDialog from './StaffCreateDialog';
const m=vi.hoisted(()=>({post:vi.fn(),create:vi.fn(),managerCreate:vi.fn(),managerUpdate:vi.fn()}));
vi.mock('@/api/client',()=>({client:{post:m.post}}));
vi.mock('./queries',()=>({useCreateStaff:()=>({mutate:m.create,isPending:false,isError:false})}));
vi.mock('../Managers/queries',()=>({useCreateManager:()=>({mutateAsync:m.managerCreate,isPending:false}),useUpdateManager:()=>({mutateAsync:m.managerUpdate,isPending:false})}));
const worker={id:7,name:'Synthetic worker',isActive:true,locationId:20};
const sites=[{id:20,name:'Assigned source',timezone:'UTC'},{id:30,name:'Assigned destination',timezone:'UTC'},{id:40,name:'Inactive site',isActive:false,timezone:'UTC'}];
function mount(page:React.ReactNode,role:AuthUser['role']='ADMIN',language='en'){
 localStorage.setItem('hygene-ops.language',language);
 const store=configureStore({reducer:{auth:authReducer}});store.dispatch(setUser({id:2,role,name:'Synthetic issuer',email:'issuer@example.invalid',companyId:42}));
 const query=new QueryClient({defaultOptions:{queries:{retry:false}}});
 const view=render(<Provider store={store}><QueryClientProvider client={query}><LanguageProvider>{page}</LanguageProvider></QueryClientProvider></Provider>);
 return {...view,query,store};
}
function start(action='deactivate'){
 fireEvent.click(screen.getByRole('button',{name:'Staff access'}));
 fireEvent.change(screen.getByLabelText('Action'),{target:{value:action}});
 fireEvent.change(screen.getByLabelText('Reason'),{target:{value:'Synthetic reason'}});
}
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();sessionStorage.clear();m.post.mockResolvedValue({data:{data:{id:7,historyPreserved:true}}});m.managerUpdate.mockResolvedValue({});});
it('staff and managers outside assigned source cannot perform access actions',()=>{
 const a=mount(<WorkforceActions person={worker} locations={sites}/>,'STAFF');expect(screen.queryByRole('button')).not.toBeInTheDocument();a.unmount();
 mount(<WorkforceActions person={worker} locations={[sites[1]]}/>,'MANAGER');expect(screen.queryByRole('button')).not.toBeInTheDocument();expect(m.post).not.toHaveBeenCalled();
});
it('manager cannot reset owner or manager access',()=>{
 const a=mount(<WorkforceActions person={{...worker,role:'ADMIN'}} locations={sites}/>);expect(screen.queryByRole('button')).not.toBeInTheDocument();a.unmount();
 mount(<WorkforceActions person={worker} entity="manager"/>,'MANAGER');expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
it('manager transfer selector includes only provided active assigned destinations',()=>{
 mount(<WorkforceActions person={worker} locations={sites}/>,'MANAGER');start('transfer');
 expect(screen.getByRole('option',{name:'Assigned destination'})).toBeInTheDocument();expect(screen.queryByRole('option',{name:'Inactive site'})).not.toBeInTheDocument();expect(screen.queryByRole('option',{name:'Assigned source'})).not.toBeInTheDocument();
});
it('transfer sends actual source compare-and-set and reason, clears protected details',async()=>{
 const {query}=mount(<WorkforceActions person={worker} locations={sites}/>);query.setQueryData(['staff','details',7],{private:true});start('transfer');fireEvent.change(screen.getByLabelText('Destination site'),{target:{value:'30'}});fireEvent.click(screen.getByRole('button',{name:'Confirm access change'}));
 await screen.findByRole('status');expect(m.post).toHaveBeenCalledWith('/workforce/staff/7/transfer/30',{reason:'Synthetic reason',expectedLocationId:20});expect(query.getQueryData(['staff','details',7])).toBeUndefined();
});
it('open-shift conflict keeps transfer draft and has no false success',async()=>{
 m.post.mockRejectedValue({response:{status:409,data:{message:'private internal'}}});mount(<WorkforceActions person={worker} locations={sites}/>);start('transfer');fireEvent.change(screen.getByLabelText('Destination site'),{target:{value:'30'}});fireEvent.click(screen.getByRole('button',{name:'Confirm access change'}));await screen.findByRole('alert');expect(screen.getByLabelText('Reason')).toHaveValue('Synthetic reason');expect(screen.getByLabelText('Destination site')).toHaveValue('30');expect(screen.getByRole('alert')).toHaveTextContent('shift is open');expect(screen.getByRole('button',{name:'Confirm access change'})).toBeEnabled();expect(screen.queryByText('private internal')).not.toBeInTheDocument();expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
it.each([['deactivate','/workforce/staff/7/deactivate'],['archive','/staff/7/archive']])('%s preserves history with reasoned API',async(action,path)=>{
 mount(<WorkforceActions person={worker} locations={sites}/>);start(action);fireEvent.click(screen.getByRole('button',{name:'Confirm access change'}));await screen.findByRole('status');expect(m.post).toHaveBeenCalledWith(path,{reason:'Synthetic reason'});
});
it.each([403,429,500])('sanitizes mutation errors %s and retains reason',async(status)=>{
 m.post.mockRejectedValue({response:{status,data:{message:'private secret'}}});mount(<WorkforceActions person={worker} locations={sites}/>);start();fireEvent.click(screen.getByRole('button',{name:'Confirm access change'}));await screen.findByRole('alert');expect(screen.getByLabelText('Reason')).toHaveValue('Synthetic reason');expect(screen.queryByText('private secret')).not.toBeInTheDocument();
});
it('one-use credentials are never persisted or cached and closing clears display',async()=>{
 const code='synthetic-private-code';m.post.mockResolvedValue({data:{data:{token:code,expiresAt:'2026-10-22T00:00:00Z'}}});const {query}=mount(<WorkforceActions person={worker} locations={sites}/>);start('handoff');fireEvent.change(screen.getByLabelText('Your current password'),{target:{value:'issuer password'}});fireEvent.click(screen.getByRole('button',{name:'Confirm access change'}));expect(await screen.findByLabelText('One-use recovery code')).toHaveValue(code);expect(m.post).toHaveBeenCalledWith('/common/security/staff/7/handoff',{reason:'Synthetic reason',currentPassword:'issuer password'});expect(JSON.stringify(query.getQueryCache().getAll())).not.toContain(code);expect(query.getMutationCache().getAll()).toHaveLength(0);expect(JSON.stringify({...localStorage,...sessionStorage})).not.toContain(code);fireEvent.click(screen.getByRole('button',{name:'Close and clear code'}));expect(screen.queryByLabelText('One-use recovery code')).not.toBeInTheDocument();
});
it('principal switch clears code and ignores late old-principal issuance display',async()=>{
 let resolve!:(value:unknown)=>void;m.post.mockReturnValue(new Promise(r=>{resolve=r;}));const {store}=mount(<WorkforceActions person={worker} locations={sites}/>);start('handoff');fireEvent.change(screen.getByLabelText('Your current password'),{target:{value:'old password'}});fireEvent.click(screen.getByRole('button',{name:'Confirm access change'}));act(()=>store.dispatch(setUser({id:99,role:'ADMIN',name:'Other account',email:'other@example.invalid',companyId:55})));await act(async()=>resolve({data:{data:{token:'private late code',expiresAt:'2026-10-22T00:00:00Z'}}}));expect(screen.queryByLabelText('One-use recovery code')).not.toBeInTheDocument();
});
it('busy confirmation prevents duplicate requests and closing while pending',async()=>{
 m.post.mockReturnValue(new Promise(()=>{}));mount(<WorkforceActions person={worker} locations={sites}/>);start();const button=screen.getByRole('button',{name:'Confirm access change'});fireEvent.click(button);fireEvent.click(button);expect(m.post).toHaveBeenCalledTimes(1);expect(screen.getByRole('button',{name:'Saving…'})).toBeDisabled();expect(screen.getByRole('button',{name:'Cancel'})).toBeDisabled();
});
it('manager handover explicitly releases before assigning and never issues manager reset',async()=>{
 mount(<WorkforceActions person={worker} entity="manager"/>);fireEvent.click(screen.getByRole('button',{name:'Manage access'}));expect(screen.getByText(/After the sites are released/)).toBeInTheDocument();expect(screen.queryByRole('option',{name:'Issue one-use recovery code'})).not.toBeInTheDocument();fireEvent.change(screen.getByLabelText('Reason'),{target:{value:'Synthetic handover'}});fireEvent.click(screen.getByRole('button',{name:'Confirm access change'}));await screen.findByRole('status');expect(m.post).toHaveBeenCalledWith('/workforce/manager/7/deactivate',{reason:'Synthetic handover'});
});
it('inactive account offers no restore or mutation',()=>{mount(<WorkforceActions person={{...worker,isActive:false}} locations={sites}/>);expect(screen.queryByRole('button')).not.toBeInTheDocument();expect(screen.getByText('Archived / inactive')).toBeInTheDocument();});
it('Urdu workflow translates action, reason, confirmation and conflict',async()=>{m.post.mockRejectedValue({response:{status:409}});mount(<WorkforceActions person={worker} locations={sites}/>,'MANAGER','ur');fireEvent.click(screen.getByRole('button',{name:'عملے کی رسائی'}));fireEvent.change(screen.getByLabelText('وجہ'),{target:{value:'وجہ'}});fireEvent.click(screen.getByRole('button',{name:'رسائی کی تبدیلی کی تصدیق کریں'}));expect(await screen.findByRole('alert')).toHaveTextContent('مسودہ محفوظ ہے');});
it('manager hire requires an assigned site and never submits unassigned staff',async()=>{
 mount(<StaffCreateDialog open onOpenChange={()=>{}} locations={sites}/>,'MANAGER');fireEvent.change(screen.getByLabelText('Full Name'),{target:{value:'Synthetic hire'}});fireEvent.change(screen.getByLabelText('Email'),{target:{value:'hire@example.invalid'}});fireEvent.change(screen.getByLabelText('Phone Number'),{target:{value:'123456789'}});fireEvent.change(screen.getByLabelText('Password'),{target:{value:'synthetic password'}});fireEvent.change(screen.getByLabelText('Shift Start'),{target:{value:'09:00'}});fireEvent.change(screen.getByLabelText('Shift End'),{target:{value:'17:00'}});fireEvent.click(screen.getByRole('button',{name:'Create staff'}));await screen.findByRole('alert');expect(m.create).not.toHaveBeenCalled();fireEvent.change(screen.getByLabelText('Location'),{target:{value:'20'}});fireEvent.click(screen.getByRole('button',{name:'Create staff'}));await waitFor(()=>expect(m.create).toHaveBeenCalledTimes(1));expect(m.create.mock.calls[0][0].locationId).toBe(20);
});
it('replacement manager edit saves site assignment without password replacement',async()=>{
 mount(<ManagerFormDialog open onOpenChange={()=>{}} locations={sites} manager={{id:8,name:'Replacement manager',createdAt:'2026-10-21T00:00:00Z',email:'replacement@example.invalid',isActive:true,locations:[{id:20,name:"Assigned source",isActive:true}]}}/>);expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();fireEvent.click(screen.getByLabelText(/Assigned destination/));fireEvent.click(screen.getByRole('button',{name:'Save changes'}));await waitFor(()=>expect(m.managerUpdate).toHaveBeenCalledTimes(1));expect(m.managerUpdate.mock.calls[0][0]).toEqual({id:8,data:{name:'Replacement manager',email:'replacement@example.invalid',locationIds:[20,30]}});
});
