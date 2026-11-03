import {configureStore} from '@reduxjs/toolkit';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,expect,it,vi} from 'vitest';
import authReducer,{setUser,type AuthUser} from '@/store/slices/authSlice';
import {LanguageProvider} from '@/i18n/LanguageProvider';
import SetupPage from './SetupPage';
import type {SetupReadiness,SetupSite} from './api';
const m=vi.hoisted(()=>({get:vi.fn()}));
vi.mock('@/api/client',()=>({client:{get:m.get}}));
let saved:SetupReadiness;
const site=(change:Partial<SetupSite>={}):SetupSite=>({id:20,name:'Synthetic Karachi site',timezone:'Asia/Karachi',setupReady:false,reasons:[],counts:{staffWithShift:0,activeAreas:0,readySchedules:0,tasksToday:0,unassignedTasksToday:0},...change});
const billing={ownerVerified:true,billingConfigured:true,company:{plan:'PRO'}};
function mount(role:AuthUser['role']='ADMIN',language='en',path='/setup') {
 localStorage.setItem('hygene-ops.language',language);
 const store=configureStore({reducer:{auth:authReducer}});store.dispatch(setUser({id:7,role,name:'Synthetic account',email:'fixture@example.invalid',companyId:42}));
 const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});
 return render(<Provider store={store}><QueryClientProvider client={client}><LanguageProvider><MemoryRouter initialEntries={[path]}><div className="workspace"><SetupPage/></div></MemoryRouter></LanguageProvider></QueryClientProvider></Provider>);
}
beforeEach(()=>{
 vi.clearAllMocks();localStorage.clear();saved={asOf:'2026-10-20T21:30:00Z',totalLocations:1,sites:[site()],nextCursor:null,calendar:'DAILY_INCLUDES_EVERY_DAY',access:{manageWork:true}};
 m.get.mockImplementation(async(url:string)=>({data:{success:true,data:url==='/location/readiness'?structuredClone(saved):billing}}));
});
it('derives the checklist from the scoped API, not browser checkboxes',async()=>{
 mount();await screen.findByText('1 of 4 configured');
 expect(screen.getAllByText('Not configured')).toHaveLength(3);expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
 expect(m.get).toHaveBeenCalledWith('/location/readiness',expect.objectContaining({params:{afterId:0,limit:20},signal:expect.any(AbortSignal)}));
 expect(screen.getByRole('link',{name:'Add area template'})).toHaveAttribute('href','/locations/20?tab=areas&newArea=1');
 expect(screen.getByRole('link',{name:'Open team and shifts'})).toHaveAttribute('href','/staff?locationId=20');
 expect(screen.getByRole('button',{name:'Add cleaning schedule'})).toBeDisabled();
 expect(screen.getByText(/21.*Oct.*2026/)).toBeInTheDocument();
});
it('returning after reload reads changed persistence and does not reset or manufacture progress',async()=>{
 const first=mount();await screen.findByText('1 of 4 configured');first.unmount();
 saved.sites=[site({setupReady:true,counts:{staffWithShift:2,activeAreas:1,readySchedules:1,tasksToday:0,unassignedTasksToday:0}})];
 mount();await screen.findByText('4 of 4 configured');
 expect(screen.getByRole('link',{name:'Review cleaning schedules'})).toHaveAttribute('href','/locations/20?tab=templates');
 expect(screen.getByText('Setup is configured for this location. Open Today to inspect its work.')).toBeInTheDocument();
 expect(screen.getByRole('progressbar')).toHaveAttribute('value','4');
});
it('refresh reloads the saved server facts without writing a checklist',async()=>{
 mount();await screen.findByText('1 of 4 configured');saved.sites=[site({counts:{staffWithShift:1,activeAreas:1,readySchedules:0,tasksToday:0,unassignedTasksToday:0}})];
 fireEvent.click(screen.getByRole('button',{name:'Refresh status'}));await screen.findByText('3 of 4 configured');
 expect(screen.getByRole('link',{name:'Add cleaning schedule'})).toHaveAttribute('href','/locations/20?tab=templates&newSchedule=1');
});
it('an empty owner scope stays incomplete and links to the actual location form',async()=>{
 saved.sites=[];saved.totalLocations=0;mount();await screen.findByText('No locations yet');
 expect(screen.getByText('0 of 4 configured')).toBeInTheDocument();expect(screen.getByRole('link',{name:'Add location'})).toHaveAttribute('href','/locations?create=1');
});
it('a manager empty scope requires owner assignment and never offers owner capacity or billing actions',async()=>{
 saved.sites=[];saved.totalLocations=0;mount('MANAGER');await screen.findByText('No assigned locations yet');
 expect(screen.getByRole('button',{name:'Add location'})).toBeDisabled();expect(screen.queryByRole('link',{name:'Plan & billing'})).not.toBeInTheDocument();
 expect(m.get.mock.calls.every(([url])=>url==='/location/readiness')).toBe(true);
});
it('loading, server denial and offline/service errors are distinct, without raw errors or fake zero progress',async()=>{
 m.get.mockImplementation(()=>new Promise(()=>undefined));const pending=mount();await screen.findByText('Loading setup status…');expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();pending.unmount();
 m.get.mockRejectedValue({response:{status:403,data:{message:'private driver text'}}});const denied=mount();await screen.findByRole('heading',{name:'Setup access is restricted'});expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();expect(screen.queryByText('private driver text')).not.toBeInTheDocument();denied.unmount();
 m.get.mockRejectedValue(new Error('private provider text'));mount();await screen.findByRole('heading',{name:'Setup status could not load'});expect(screen.getByText('Check your connection and refresh. Your saved setup has not changed.')).toBeInTheDocument();
});
it('server read-only permission wins over plan labels and verified contact',async()=>{
 saved.access.manageWork=false;mount();await screen.findByText('1 of 4 configured');
 expect(screen.getByRole('button',{name:'Add area template'})).toBeDisabled();expect(screen.queryByText('New work is available')).not.toBeInTheDocument();
 expect(screen.getByText('This workspace is read-only for new work. Review plan activation to add or change setup.')).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Open team and shifts'})).toBeInTheDocument();
});
it('missing account readiness does not pretend contact or billing is ready',async()=>{
 m.get.mockImplementation(async(url:string)=>{if(url.includes('/subscription'))throw new Error('Unavailable');return {data:{data:saved}};});
 mount();await screen.findByText('1 of 4 configured');await screen.findByText('Account readiness could not load. Setup progress is shown separately.');expect(screen.queryByText('Verified')).not.toBeInTheDocument();
});
it('changing the selected site changes only its own derived readiness; partial pagination stays explicit',async()=>{
 saved.totalLocations=30;saved.nextCursor=21;saved.sites.push(site({id:21,name:'Synthetic second site',counts:{staffWithShift:1,activeAreas:1,readySchedules:1,tasksToday:0,unassignedTasksToday:0}}));
 mount();await screen.findByText('1 of 4 configured');fireEvent.change(screen.getByLabelText('Setup for location'),{target:{value:'21'}});await screen.findByText('4 of 4 configured');expect(screen.getByText('Showing 2 of 30 locations')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'More locations'}));await waitFor(()=>expect(m.get).toHaveBeenCalledWith('/location/readiness',expect.objectContaining({params:{afterId:21,limit:20}})));
 expect(await screen.findByRole('button',{name:'First locations'})).toBeInTheDocument();
});
it('no-replacement guidance uses persisted unassigned counts and exact site filters',async()=>{
 saved.sites=[site({counts:{staffWithShift:0,activeAreas:1,readySchedules:0,tasksToday:3,unassignedTasksToday:2}})];
 mount();await screen.findByText('2 tasks have no assigned worker.');expect(screen.getByText('No staff shift is configured for this location. Add or update a shift before assigning work.')).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Review unassigned tasks'})).toHaveAttribute('href','/today-status?locationId=20&date=today&tab=tasks&status=unassigned');
});
it('Urdu/RTL translates setup, states and actions while retaining user site names and timezone',async()=>{
 mount('MANAGER','ur');await screen.findByText('4 میں سے 1 تیار');expect(document.documentElement.dir).toBe('rtl');expect(document.documentElement.lang).toBe('ur-PK');
 expect(screen.getByRole('heading',{name:'اپنے تفویض کردہ مقامات تیار کریں'})).toBeInTheDocument();expect(screen.getByRole('option',{name:'Synthetic Karachi site'})).toBeInTheDocument();expect(screen.getByText('Asia/Karachi')).toBeInTheDocument();expect(screen.getByRole('link',{name:'عملہ اور شفٹیں کھولیں'})).toBeInTheDocument();
});
it('staff cannot invoke owner/manager setup reads or mutate a browser checklist',()=>{
 mount('STAFF');expect(screen.getByRole('alert')).toHaveTextContent('Owner or assigned-site manager access is required.');expect(m.get).not.toHaveBeenCalled();
});

it('does not infer a billing problem while operational access is loading, missing or failed',async()=>{
 m.get.mockImplementation(async(url:string)=>url==='/location/readiness'?new Promise(()=>undefined):{data:{data:billing}});
 const pending=mount();await screen.findByText('Checking new-work access…');expect(screen.queryByText('Review plan activation')).not.toBeInTheDocument();expect(screen.getByRole('link',{name:'Plan & billing'})).toBeInTheDocument();pending.unmount();
 m.get.mockImplementation(async(url:string)=>{if(url==='/location/readiness')throw new Error('unavailable');return {data:{data:billing}};});
 const failed=mount();await screen.findByText('New-work access is unavailable');expect(screen.queryByText('Review plan activation')).not.toBeInTheDocument();failed.unmount();
 m.get.mockImplementation(async(url:string)=>({data:{data:url==='/location/readiness'?{...saved,access:undefined}:billing}}));
 mount();await screen.findByText('1 of 4 configured');expect(screen.getAllByText('New-work access is unavailable')).toHaveLength(2);expect(screen.getByRole('button',{name:'Add area template'})).toBeDisabled();
});
