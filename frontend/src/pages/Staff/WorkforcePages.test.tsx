import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import authReducer, { setUser, type AuthUser } from '@/store/slices/authSlice';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import StaffPage from './StaffPage';
import StaffCreateDialog from './StaffCreateDialog';
import StaffEditDialog from './StaffEditDialog';
import StaffDetailPage from './StaffDetailPage';
const m=vi.hoisted(()=>({edit:vi.fn(),create:vi.fn(),staff:{},locations:{},detail:{},detailArgs:vi.fn()}));
vi.mock('./queries',()=>({
 useGetStaff:()=>m.staff,
 useGetStaffDetails:(id:number,filters:unknown)=>{m.detailArgs(id,filters);return m.detail;},
 getStaffDetailsQueryOptions:()=>({queryKey:['staff','preview'],queryFn:async()=>null}),
 useEditStaff:()=>({mutateAsync:m.edit,isPending:false}),
 useCreateStaff:()=>({mutate:m.create,isPending:false,isError:false}),
}));
vi.mock('../Location/queries',()=>({useGetLocations:()=>m.locations}));
vi.mock('./StaffPerformanceIssues',()=>({default:()=>null}));
vi.mock('@/pages/Attendance/AttendanceContext',()=>({default:()=>null}));
vi.mock('@/components/common/ProtectedAttendancePhoto',()=>({default:()=>null}));
const person={id:7,name:'Fixture worker',email:'worker@example.invalid',phone:'123456789',isActive:true,locationId:20,shiftStart:'1970-01-01T04:00:00Z',shiftEnd:'1970-01-01T12:00:00Z'};
const site={id:20,name:'Assigned site',timezone:'Asia/Karachi',isActive:true};
function Path(){return <output aria-label="Current route">{useLocation().pathname+useLocation().search}</output>;}
function mount(node:React.ReactNode,role:AuthUser['role']='ADMIN',path='/staff',language='en'){
 localStorage.setItem('hygene-ops.language',language);
 const store=configureStore({reducer:{auth:authReducer}});
 store.dispatch(setUser({id:2,companyId:42,role,name:'Fixture owner',email:'issuer@example.invalid'}));
 const query=new QueryClient({defaultOptions:{queries:{retry:false}}});
 const tree=(child:React.ReactNode)=><Provider store={store}><QueryClientProvider client={query}><LanguageProvider><MemoryRouter initialEntries={[path]}>{child}<Path/></MemoryRouter></LanguageProvider></QueryClientProvider></Provider>;
 const view=render(tree(node));
 return {...view,store,rerenderNode:(child:React.ReactNode)=>view.rerender(tree(child))};
}
beforeEach(()=>{
 vi.clearAllMocks();localStorage.clear();m.edit.mockResolvedValue({});
 m.staff={isLoading:false,isError:false,data:{data:[person,{...person,id:8,name:'Unassigned worker',email:'unassigned@example.invalid',locationId:null}]}};
 m.locations={isPending:false,isError:false,data:{data:[site]}};
 m.detail={isLoading:false,isFetching:false,isError:false,data:{data:{...person,createdAt:'2026-10-01T00:00:00Z',role:'STAFF',location:site,periodLabel:'October 2026',taskStats:{totalTemplates:0,totalInstances:0,completed:0,pending:0,inProgress:0,missed:0},attendanceStats:{totalRecords:0,present:0,absent:0,late:0},taskTemplates:[],taskInstances:[],attendances:[]}}};
});
it('directory filters real assignments and search together, then clears the empty result',()=>{
 mount(<StaffPage/>);
 expect(screen.getByRole('heading',{name:'Your team'})).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Filter by location'),{target:{value:'unassigned'}});
 expect(screen.getAllByText('Unassigned worker').length).toBeGreaterThan(0);
 expect(screen.queryByText('Fixture worker')).not.toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Search team'),{target:{value:'No match'}});
 expect(screen.getByText('No team members match these filters.')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Clear filters'}));
 expect(screen.getByLabelText('Filter by location')).toHaveValue('all');
 expect(screen.getByLabelText('Search team')).toHaveValue('');
});
it('inline hire preserves the selected site and URL while cancelling creation',()=>{
 mount(<StaffPage/>,'ADMIN','/staff?locationId=20&create=1');
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(screen.getByRole('heading',{name:'Add team member'})).toBeInTheDocument();
 expect(screen.getByRole('combobox',{name:/^Location$/})).toHaveValue('20');
 fireEvent.click(screen.getByRole('button',{name:'Cancel'}));
 expect(screen.getByLabelText('Current route')).toHaveTextContent('locationId=20');
 expect(screen.getByLabelText('Current route')).not.toHaveTextContent('create');
});
it('assigned-site manager directory exposes staff actions without owner assignment navigation',()=>{
 mount(<StaffPage/>,'MANAGER');
 expect(screen.queryByRole('link',{name:'Manager assignments'})).not.toBeInTheDocument();
 expect(screen.queryByRole('link',{name:'Manage managers'})).not.toBeInTheDocument();
 expect(screen.getAllByRole('button',{name:'Staff access'}).length).toBeGreaterThan(0);
 expect(screen.queryByRole('option',{name:'Unassigned'})).not.toBeInTheDocument();
});
it('loading and failed site lookup never present fabricated empty or zero-count directory',()=>{
 m.locations={isPending:true};const view=mount(<StaffPage/>);
 expect(screen.queryByRole('term',{name:'Active staff'})).not.toBeInTheDocument();
 view.unmount();m.locations={isPending:false,isError:true,error:{response:{status:403}},refetch:vi.fn()};
 m.staff={...m.staff,refetch:vi.fn()};mount(<StaffPage/>);
 expect(screen.getByRole('alert')).toHaveTextContent('You do not have access');
 expect(screen.queryByText('No team members yet. Add your first team member to get started.')).not.toBeInTheDocument();
});
it('staff edit preserves draft on conflict and submits contact fields without unsafe site change',async()=>{
 m.edit.mockRejectedValueOnce({response:{status:409,data:{message:'private internal detail'}}});
 mount(<StaffEditDialog person={person} timezone={site.timezone} onClose={()=>{}}/>);
 fireEvent.change(screen.getByLabelText('Name'),{target:{value:'Edited worker'}});
 fireEvent.click(screen.getByRole('button',{name:'Save changes'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Your draft is kept');
 expect(screen.getByLabelText('Name')).toHaveValue('Edited worker');
 expect(screen.queryByText('private internal detail')).not.toBeInTheDocument();
 expect(m.edit).toHaveBeenCalledWith({id:7,data:{name:'Edited worker'}});
});
it('switching person clears old draft and a late save cannot close the new person form',async()=>{
 let finish!:(value:unknown)=>void;m.edit.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
 const saved=vi.fn(),close=vi.fn();
 const view=mount(<StaffEditDialog person={person} timezone={site.timezone} onClose={close} onSaved={saved}/>);
 fireEvent.change(screen.getByLabelText('Name'),{target:{value:'Old draft'}});
 fireEvent.click(screen.getByRole('button',{name:'Save changes'}));
 const next={...person,id:9,name:'Next worker'};
 view.rerenderNode(<StaffEditDialog person={next} timezone={site.timezone} onClose={close} onSaved={saved}/>);
 expect(screen.getByLabelText('Name')).toHaveValue('Next worker');
 await act(async()=>finish({}));
 expect(saved).not.toHaveBeenCalled();expect(close).not.toHaveBeenCalled();
 expect(m.edit).toHaveBeenCalledWith({id:7,data:{name:'Old draft'}});
});
it('switching principal clears staff edit draft and ignores old-principal feedback',async()=>{
 let finish!:(value:unknown)=>void;m.edit.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
 const saved=vi.fn(),close=vi.fn();const view=mount(<StaffEditDialog person={person} timezone={site.timezone} onClose={close} onSaved={saved}/>);
 fireEvent.change(screen.getByLabelText('Name'),{target:{value:'Prior account draft'}});
 fireEvent.click(screen.getByRole('button',{name:'Save changes'}));
 act(()=>view.store.dispatch(setUser({id:88,companyId:99,role:'ADMIN',name:'Different owner',email:'other@example.invalid'})));
 expect(screen.getByLabelText('Name')).toHaveValue(person.name);
 await act(async()=>finish({}));expect(saved).not.toHaveBeenCalled();expect(close).not.toHaveBeenCalled();
});
it('detail rejects invalid date range without replacing the applied API filters',()=>{
 mount(<Routes><Route path="/staff/:id" element={<StaffDetailPage/>}/></Routes>,'ADMIN','/staff/7?month=2026-10');
 fireEvent.change(screen.getByLabelText('From date'),{target:{value:'2026-10-20'}});
 fireEvent.change(screen.getByLabelText('To date'),{target:{value:'2026-10-10'}});
 fireEvent.click(screen.getByRole('button',{name:'Apply range'}));
 expect(screen.getByRole('alert')).toHaveTextContent('end date must be on or after');
 expect(m.detailArgs).toHaveBeenLastCalledWith(7,{month:'2026-10'});
 expect(screen.getByLabelText('Current route')).not.toHaveTextContent('dateFrom');
});
it('Urdu directory and detail sections translate while preserving user identity text',()=>{
 const view=mount(<StaffPage/>,'ADMIN','/staff','ur');
 expect(screen.getByRole('heading',{name:'آپ کی ٹیم'})).toBeInTheDocument();
 expect(screen.getByLabelText('ٹیم تلاش کریں')).toBeInTheDocument();
 view.unmount();mount(<Routes><Route path="/staff/:id" element={<StaffDetailPage/>}/></Routes>,'ADMIN','/staff/7?month=2026-10','ur');
 expect(screen.getByRole('heading',{name:person.name})).toBeInTheDocument();
 const sections=screen.getByRole('group',{name:'کارکن کے حصے'});
 expect(within(sections).getByRole('button',{name:'کام کی تاریخ'})).toBeInTheDocument();
 fireEvent.click(within(sections).getByRole('button',{name:'حاضری'}));
 expect(screen.getByText('اس دورانیے میں حاضری کا کوئی ریکارڈ نہیں۔')).toBeInTheDocument();
});

it('inline hiring changes scope without retaining a prior site password or draft',()=>{
 const onOpenChange=vi.fn();const view=mount(<StaffCreateDialog open inline location={site} locations={[site]} onOpenChange={onOpenChange}/>);
 fireEvent.change(screen.getByLabelText('Full Name'),{target:{value:'Old site draft'}});
 fireEvent.change(screen.getByLabelText('Password'),{target:{value:'private old draft'}});
 const next={...site,id:30,name:'New site'};
 view.rerenderNode(<StaffCreateDialog open inline location={next} locations={[site,next]} onOpenChange={onOpenChange}/>);
 expect(screen.getByLabelText('Full Name')).toHaveValue('');expect(screen.getByLabelText('Password')).toHaveValue('');
 expect(screen.getByRole('combobox',{name:/^Location$/})).toHaveValue('30');
 expect(m.create).not.toHaveBeenCalled();
});
it('cached directory refresh failure leaves an open accountable access draft intact',()=>{
 const view=mount(<StaffPage/>);fireEvent.click(screen.getAllByRole('button',{name:'Staff access'})[0]);
 fireEvent.change(screen.getByLabelText('Reason'),{target:{value:'Retained context draft'}});
 m.staff={...m.staff,isError:true,error:new Error('connection failed'),refetch:vi.fn()};
 view.rerenderNode(<StaffPage/>);
 expect(screen.getByRole('dialog')).toBeInTheDocument();expect(screen.getByLabelText('Reason')).toHaveValue('Retained context draft');
 expect(screen.getByText('Your team')).toBeInTheDocument();
});

it('scheduled task metric uses execution instances rather than cleaning schedule templates',()=>{
 Object.assign((m.detail as {data:{data:{taskStats:Record<string,number>}}}).data.data.taskStats,{totalTemplates:2,totalInstances:9,completed:3});
 mount(<Routes><Route path="/staff/:id" element={<StaffDetailPage/>}/></Routes>,'ADMIN','/staff/7?month=2026-10');
 const metric=screen.getByText('Scheduled tasks').closest('.stat-card') as HTMLElement;
 expect(within(metric).getByText('9')).toBeInTheDocument();expect(within(metric).queryByText('2')).not.toBeInTheDocument();
});
