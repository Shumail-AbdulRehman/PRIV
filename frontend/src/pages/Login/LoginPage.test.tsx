import type {ReactNode} from 'react';
import {configureStore} from '@reduxjs/toolkit';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {beforeEach,it,expect,vi} from 'vitest';
import authReducer,{setUser,type AuthUser} from '@/store/slices/authSlice';
import {LanguageProvider} from '@/i18n/LanguageProvider';
import {GuestRoute} from '@/App';
import Login from './LoginPage';
import SignUp from '../Signup/SignUpPage';
const api=vi.hoisted(()=>({get:vi.fn(),post:vi.fn()}));
vi.mock('@/api/client',()=>({client:api}));
const owner:AuthUser={id:4,role:'ADMIN',companyId:20,name:'Synthetic owner',email:'synthetic@example.invalid'};
function mount(content:ReactNode,{language='en',path='/login',user}:{language?:string;path?:string;user?:AuthUser}={}){
 localStorage.setItem('hygene-ops.language',language);
 const store=configureStore({reducer:{auth:authReducer}});if(user)store.dispatch(setUser(user));
 const query=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});query.setQueryData(['previous-tenant'],{private:true});
 const view=render(<Provider store={store}><QueryClientProvider client={query}><LanguageProvider><MemoryRouter initialEntries={[path]}><Routes><Route path={path} element={content}/><Route path="/subscription" element={<h1>Billing destination</h1>}/><Route path="/dashboard" element={<h1>Workspace destination</h1>}/></Routes></MemoryRouter></LanguageProvider></QueryClientProvider></Provider>);
 return {...view,store,query};
}
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();api.post.mockResolvedValue({data:{data:owner}});});
it.each(['Manager','Staff'] as const)('keeps real %s sign-in payload, cache clearing and authenticated identity',async role=>{
 const user={...owner,role:role==='Staff'?'STAFF':'ADMIN'};api.post.mockResolvedValue({data:{data:user}});const {store,query}=mount(<Login/>);
 fireEvent.change(screen.getByLabelText('Account type'),{target:{value:role}});fireEvent.change(screen.getByLabelText('Email'),{target:{value:owner.email}});fireEvent.change(screen.getByLabelText('Password'),{target:{value:'Synthetic test password'}});fireEvent.click(screen.getByRole('button',{name:'Sign in'}));
 await waitFor(()=>expect(store.getState().auth.user?.role).toBe(user.role));
 expect(api.post).toHaveBeenCalledWith(role==='Staff'?'/staff/staff-login':'/manager/manager-login',{email:owner.email,password:'Synthetic test password'},{withCredentials:true});
 expect(query.getQueryData(['previous-tenant'])).toBeUndefined();expect(query.getQueryData(['currentUser'])).toEqual(user);
});
it('rejects empty fields before contacting authentication and exposes linked errors',async()=>{
 mount(<Login/>);fireEvent.click(screen.getByRole('button',{name:'Sign in'}));await screen.findByText('Email is required');expect(api.post).not.toHaveBeenCalled();expect(screen.getByLabelText('Email')).toHaveAttribute('aria-describedby','email-error');expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid','true');
});
it('keeps credentials available for correction and renders a translated denial without raw server details',async()=>{
 api.post.mockRejectedValue({response:{status:401,data:{message:'Private authentication diagnostic'}}});const {store}=mount(<Login/>,{language:'ur'});
 fireEvent.change(screen.getByLabelText('ای میل'),{target:{value:owner.email}});fireEvent.change(screen.getByLabelText('پاس ورڈ'),{target:{value:'Synthetic wrong password'}});fireEvent.click(screen.getByRole('button',{name:'لاگ ان کریں'}));
 await screen.findByText('ای میل یا پاس ورڈ درست نہیں۔');expect(screen.getByLabelText('پاس ورڈ')).toHaveValue('Synthetic wrong password');expect(screen.getByLabelText('ای میل')).toHaveAttribute('dir','ltr');expect(document.documentElement.dir).toBe('rtl');expect(screen.queryByText('Private authentication diagnostic')).not.toBeInTheDocument();expect(store.getState().auth.user).toBeNull();
});
it.each([['/signup','ADMIN','Billing destination'],['/signup','MANAGER','Workspace destination'],['/login','ADMIN','Workspace destination']] as const)('routes authenticated %s/%s consistently',async(path,role,destination)=>{
 mount(<GuestRoute><Login/></GuestRoute>,{path,user:{...owner,role}});expect(await screen.findByRole('heading',{name:destination})).toBeInTheDocument();
});
it('keeps registration session-delivery failure unauthenticated with an accurate receipt',async()=>{
 api.post.mockResolvedValue({data:{data:{...owner,sessionEstablished:false}}});const {store}=mount(<SignUp/>,{path:'/signup'});
 for(const [label,value]of [['Full Name','Synthetic owner'],['Company Name','Synthetic company'],['Email',owner.email],['Password','Synthetic password']])fireEvent.change(screen.getByLabelText(label),{target:{value}});
 fireEvent.click(screen.getByRole('button',{name:'Create account & choose plan'}));await screen.findByText('Account created. Sign in to continue.');expect(store.getState().auth.user).toBeNull();expect(screen.queryByRole('heading',{name:'Billing destination'})).not.toBeInTheDocument();expect(screen.getByRole('link',{name:'Sign in'})).toHaveAttribute('href','/login');
});
it('translates registration fields and validation using the shared public shell',async()=>{
 mount(<SignUp/>,{language:'ur',path:'/signup'});expect(screen.getByRole('heading',{name:'اپنا ورک اسپیس بنائیں'})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'اکاؤنٹ بنائیں اور پلان چنیں'}));await screen.findByText('نام ضروری ہے');expect(screen.getByLabelText('پورا نام')).toHaveAttribute('aria-invalid','true');expect(screen.getByRole('link',{name:'Hygene Ops میں سائن ان کریں'})).toHaveAttribute('href','/login');expect(screen.getAllByRole('group',{name:'زبان'})).toHaveLength(1);
});

it('reveals and hides the existing password without submitting or changing credentials',()=>{
 mount(<Login/>);const password=screen.getByLabelText('Password');
 fireEvent.change(password,{target:{value:'Synthetic test password'}});
 expect(password).toHaveAttribute('type','password');
 fireEvent.click(screen.getByRole('button',{name:'Show password'}));
 expect(password).toHaveAttribute('type','text');expect(password).toHaveValue('Synthetic test password');
 expect(screen.getByRole('button',{name:'Hide password'})).toHaveAttribute('aria-pressed','true');
 fireEvent.click(screen.getByRole('button',{name:'Hide password'}));
 expect(password).toHaveAttribute('type','password');expect(api.post).not.toHaveBeenCalled();
 expect(screen.getByRole('link',{name:'Platform owner sign-in'})).toHaveAttribute('href','/platform/login');
 expect(screen.getByRole('link',{name:'Owner password recovery'})).toHaveAttribute('href','/recover-owner-account');
 expect(screen.getAllByRole('group',{name:'Language'})).toHaveLength(1);
});

it('translates the split login, platform link and password visibility for Urdu',()=>{
 mount(<Login/>,{language:'ur'});
 expect(screen.getByRole('heading',{name:'خوش آمدید'})).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'پلیٹ فارم مالک کا داخلہ'})).toHaveAttribute('href','/platform/login');
 fireEvent.click(screen.getByRole('button',{name:'پاس ورڈ دکھائیں'}));
 expect(screen.getByLabelText('پاس ورڈ')).toHaveAttribute('type','text');
 expect(screen.getByRole('button',{name:'پاس ورڈ چھپائیں'})).toBeInTheDocument();
 expect(document.documentElement.dir).toBe('rtl');
});
