import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import authReducer, { setUser, type AuthUser } from '@/store/slices/authSlice';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import LocationsPage from './LocationsPage';
import LocationDetailPage from './LocationDetailPage';
import LocationOverview from './LocationOverview';
import type { UseQueryResult } from '@tanstack/react-query';
import type { OperationOverview } from '../Manager/operations';
const mocks=vi.hoisted(()=>({locations:{} as Record<string,unknown>,detail:{} as Record<string,unknown>,operations:{} as Record<string,unknown>,areas:{} as Record<string,unknown>}));
vi.mock('./queries',()=>({useGetLocations:()=>mocks.locations,useGetLocationById:()=>mocks.detail,useDeleteLocation:()=>({mutateAsync:vi.fn()}),useCreateLocation:()=>({}),useUpdateLocation:()=>({})}));
vi.mock('../Area/queries',()=>({useAreas:()=>mocks.areas}));
vi.mock('../Manager/operations',async importOriginal=>({...await importOriginal<typeof import('../Manager/operations')>(),useOperations:()=>mocks.operations}));
vi.mock('./LocationFormDialog',()=>({default:({open,onOpenChange}:{open:boolean;onOpenChange:(value:boolean)=>void})=>open?<div role="dialog" aria-label="Location editor"><button onClick={()=>onOpenChange(false)}>Cancel editor</button></div>:null}));
vi.mock('../Staff/StaffCreateDialog',()=>({default:()=>null}));
vi.mock('../Area/LocationAreasTab',()=>({default:()=> <p>Area editing boundary</p>}));
vi.mock('./components/LocationTemplatesTab',()=>({default:()=> <p>Schedule editing boundary</p>}));
vi.mock('./components/LocationScheduleTab',()=>({default:()=> <p>Week schedule boundary</p>}));
const site={id:20,name:'Persisted site',address:'Synthetic street',timezone:'Asia/Karachi',radiusMeters:150,latitude:'31.5',longitude:'74.3',isActive:true,status:'ACTIVE',_count:{staff:2,taskTemplates:3},staff:[],taskTemplates:[],taskInstances:[]};
const overview={metrics:{present:4,scheduled:6,totalStaff:7,totalTasks:11,submitted:3,reviewCount:2,verified:1,accepted:0},chart:{submitted:3,inProgress:2,notStarted:4,overdue:2},attention:[],comparison:[{location:site,present:4,scheduled:6,tasks:11,submitted:3,reviews:2}],locations:[site],selected:[site],days:[{locationId:20,localDate:'2026-10-28',timezone:'Asia/Karachi'}],asOf:'2026-10-28T10:30:00Z',date:'today',tasks:[]};
function Path(){return <output aria-label="Current route">{useLocation().pathname+useLocation().search}</output>;}
function mount(node:React.ReactNode,role:AuthUser['role']='ADMIN',path='/locations',language='en'){
 localStorage.setItem('hygene-ops.language',language);
 const store=configureStore({reducer:{auth:authReducer}});store.dispatch(setUser({id:2,companyId:42,role,name:'Fixture owner',email:'owner@example.invalid'}));
 const query=new QueryClient({defaultOptions:{queries:{retry:false}}});
 return render(<Provider store={store}><QueryClientProvider client={query}><LanguageProvider><MemoryRouter initialEntries={[path]}>{node}<Path/></MemoryRouter></LanguageProvider></QueryClientProvider></Provider>);
}
beforeEach(()=>{
 vi.clearAllMocks();localStorage.clear();
 mocks.locations={isPending:false,isError:false,data:{data:[site,{...site,id:21,name:'Archived fixture',isActive:false}]},refetch:vi.fn()};
 mocks.detail={isLoading:false,isFetching:false,isError:false,data:{data:{locationInfo:site,taskStats:[]}},refetch:vi.fn()};
 mocks.operations={isPending:false,isError:false,data:overview,refetch:vi.fn()};
 mocks.areas={isPending:false,isError:false,data:[{id:1,status:'ACTIVE'},{id:2,status:'ARCHIVED'}],refetch:vi.fn()};
});
it('register combines active/archive and search filters using saved records',()=>{
 mount(<LocationsPage/>);expect(screen.queryByText('Archived fixture')).not.toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Location status'),{target:{value:'inactive'}});expect(screen.getAllByText('Archived fixture').length).toBeGreaterThan(0);expect(screen.queryByText('Persisted site')).not.toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Search locations'),{target:{value:'not present'}});expect(screen.getByText('No locations match these filters.')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Clear filters'}));expect(screen.getByLabelText('Location status')).toHaveValue('active');expect(screen.getByLabelText('Search locations')).toHaveValue('');
});
it('create deep-link opens only for owners and cancelling retains unrelated query context',()=>{
 mount(<LocationsPage/>,'ADMIN','/locations?create=1&from=setup');expect(screen.getByRole('dialog',{name:'Location editor'})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Cancel editor'}));expect(screen.getByLabelText('Current route')).toHaveTextContent('from=setup');expect(screen.getByLabelText('Current route')).not.toHaveTextContent('create');
});
it('manager cannot open location mutation controls even from a create deep-link',()=>{
 mount(<LocationsPage/>,'MANAGER','/locations?create=1');expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Add location'})).not.toBeInTheDocument();
});
it('failed operational totals never render an all-clear review badge or invented zeros',()=>{
 mocks.operations={isError:true,error:new Error('offline'),refetch:vi.fn()};mount(<LocationsPage/>);expect(screen.getByText('Today’s attendance and task totals are unavailable.')).toBeInTheDocument();expect(screen.queryByText('No open reviews')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'Retry'})).toBeInTheDocument();
});
it('denied and loading location reads remain distinct from empty register',()=>{
 mocks.locations={isPending:true};const view=mount(<LocationsPage/>);expect(screen.queryByText('No locations yet. Add your first location to get started.')).not.toBeInTheDocument();view.unmount();mocks.locations={isError:true,error:{response:{status:403}},refetch:vi.fn()};mount(<LocationsPage/>);expect(screen.getByRole('alert')).toHaveTextContent('You do not have access');expect(screen.queryByText('Persisted site')).not.toBeInTheDocument();
});
it('overview uses actual scoped denominators and distinct submission/review counts',()=>{
 mount(<LocationOverview location={site} onTab={vi.fn()} overview={mocks.operations as UseQueryResult<OperationOverview,Error>}/>);
 const summary=screen.getByRole('region',{name:'Daily summary'});expect(summary).toHaveTextContent('Staff today6');expect(summary).toHaveTextContent('4 checked in · 2 not checked in');expect(summary).toHaveTextContent('Tasks submitted3 / 11');expect(summary).toHaveTextContent('Photo reviews2');expect(summary).toHaveTextContent('Area templates1');
 expect(screen.getByRole('link',{name:/Tasks submitted/})).toHaveAttribute('href','/today-status?locationId=20&date=today&tab=tasks');expect(screen.queryByText('Hassan Khan')).not.toBeInTheDocument();
});
it('area read failure stays unknown and preserves the existing navigation action',()=>{
 mocks.areas={isError:true,error:new Error('offline'),refetch:vi.fn()};const tabs=vi.fn();mount(<LocationOverview location={site} onTab={tabs} overview={mocks.operations as UseQueryResult<OperationOverview,Error>}/>);expect(screen.getByRole('button',{name:/Area templates/})).toHaveTextContent('—');fireEvent.click(screen.getByRole('button',{name:/Area templates/}));expect(tabs).toHaveBeenCalledWith('areas');expect(screen.getByRole('alert')).toBeInTheDocument();
});
it('detail retains URL-driven tabs and hides owner edit for managers',()=>{
 mount(<Routes><Route path="/locations/:id" element={<LocationDetailPage/>}/></Routes>,'MANAGER','/locations/20');expect(screen.queryByRole('button',{name:'Edit location'})).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Cleaning schedule',exact:true}));expect(screen.getByLabelText('Current route')).toHaveTextContent('tab=templates');expect(screen.getByText('Schedule editing boundary')).toBeInTheDocument();
});
it('detail opens the real owner location editor from the V5 heading',()=>{
 mount(<Routes><Route path="/locations/:id" element={<LocationDetailPage/>}/></Routes>,'ADMIN','/locations/20');fireEvent.click(screen.getByRole('button',{name:'Edit location',exact:true}));expect(screen.getByRole('dialog',{name:'Location editor'})).toBeInTheDocument();
});
it('Urdu overview translates operational facts without changing saved names or timezone',()=>{
 mount(<LocationOverview location={site} onTab={vi.fn()} overview={mocks.operations as UseQueryResult<OperationOverview,Error>}/>,'ADMIN','/locations/20','ur');expect(screen.getByRole('heading',{name:'آج اس مقام پر'})).toBeInTheDocument();expect(screen.getByText('4 کی حاضری درج · 2 کی حاضری درج نہیں')).toBeInTheDocument();expect(screen.getByText('Asia/Karachi')).toBeInTheDocument();expect(document.documentElement.dir).toBe('rtl');
});
