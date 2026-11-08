import type { ReactNode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import authReducer from '@/store/slices/authSlice';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { LanguageContext } from '@/i18n/context';
import { translate } from '@/i18n/translations';
import SignUp from './SignUpPage';
const m=vi.hoisted(()=>({post:vi.fn()}));
vi.mock('@/api/client',()=>({client:{post:m.post}}));
const account={id:7,companyId:42,role:'ADMIN',name:'Fixture owner',email:'owner@example.invalid'};
const form={name:'Fixture owner',companyName:'Fixture company',email:'owner@example.invalid',password:'abcdef'};
function mount(){
 const store=configureStore({reducer:{auth:authReducer}});
 const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
 client.setQueryData(['old-owner'],{private:'old'});
 const view=render(<Provider store={store}><QueryClientProvider client={client}><LanguageProvider><MemoryRouter initialEntries={['/signup']}><Routes><Route path="/signup" element={<SignUp/>}/><Route path="/choose-plan" element={<h1>Choose plan destination</h1>}/><Route path="/login" element={<h1>Sign in destination</h1>}/></Routes></MemoryRouter></LanguageProvider></QueryClientProvider></Provider>);
 return {...view,store,client};
}
function fill(patch:Partial<typeof form>={}){
 const data={...form,...patch};
 for(const [label,key] of [['Full Name','name'],['Company Name','companyName'],['Email','email'],['Password','password']] as const)fireEvent.change(screen.getByLabelText(label),{target:{value:data[key]}});
}
function submit(){fireEvent.click(screen.getByRole('button',{name:'Create account & choose plan'}));}
beforeEach(()=>{vi.resetAllMocks();localStorage.clear();vi.stubEnv('VITE_SERVICE_POLICIES_APPROVED','false');m.post.mockResolvedValue({data:{data:{...account,sessionEstablished:true}}});});
afterEach(()=>{vi.unstubAllEnvs();localStorage.clear();document.documentElement.dir='ltr';});
it('renders account step and labeled/autocomplete fields with no unsupported help or payment controls',()=>{
 const {container}=mount();expect(screen.getByRole('heading',{name:'Create your workspace'})).toBeVisible();
 expect(screen.getByText('Create account').closest('li')).toHaveAttribute('aria-current','step');
 expect(screen.getByLabelText('Full Name')).toHaveAttribute('autocomplete','name');expect(screen.getByLabelText('Company Name')).toHaveAttribute('autocomplete','organization');
 expect(screen.getByLabelText('Email')).toHaveAttribute('dir','ltr');expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete','new-password');
 expect(screen.queryByText(/help|contact|support|faq/i)).not.toBeInTheDocument();expect(container.querySelector('a[href="#"],a[href^="mailto:"]')).toBeNull();
 expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();expect(screen.getByRole('link',{name:'Log in'})).toHaveAttribute('href','/login');
});
it('requires all four fields and connects inline errors to inputs',async()=>{
 mount();submit();await waitFor(()=>expect(screen.getAllByRole('alert')).toHaveLength(4));
 expect(m.post).not.toHaveBeenCalled();for(const label of ['Full Name','Company Name','Email','Password']){const input=screen.getByLabelText(label);expect(input).toHaveAttribute('aria-invalid','true');expect(document.getElementById(input.getAttribute('aria-describedby')!)).toBeVisible();}
});
it.each([{email:'not-an-email'},{password:'12345'},{name:'   '},{companyName:'   '}])('rejects invalid form case %# before signup',async(patch)=>{
 mount();fill(patch);submit();await screen.findByRole('alert');expect(m.post).not.toHaveBeenCalled();
});
it('preserves exact six-character minimum and real successful hook/session navigation',async()=>{
 const {store,client}=mount();fill();submit();await screen.findByRole('heading',{name:'Choose plan destination'});
 expect(m.post).toHaveBeenCalledWith('/manager/manager-signup',form,{withCredentials:true});expect(store.getState().auth.user?.id).toBe(7);expect(client.getQueryData(['old-owner'])).toBeUndefined();
});
it('blocks duplicate slow submissions without clearing the typed draft',async()=>{
 let resolve!:(value:unknown)=>void;m.post.mockReturnValue(new Promise(r=>{resolve=r;}));mount();fill();const button=screen.getByRole('button',{name:'Create account & choose plan'});fireEvent.click(button);fireEvent.click(button);
 await waitFor(()=>expect(screen.getByRole('button',{name:'Creating…'})).toBeDisabled());expect(m.post).toHaveBeenCalledOnce();expect(screen.getByLabelText('Email')).toHaveValue(form.email);
 await act(async()=>resolve({data:{data:{...account,sessionEstablished:true}}}));await screen.findByRole('heading',{name:'Choose plan destination'});expect(m.post).toHaveBeenCalledOnce();
});
it('server failure preserves draft and shows a safe retry without private errors',async()=>{
 m.post.mockRejectedValue({response:{status:500,data:{message:'private SQL credentials'}}});mount();fill();submit();
 expect(await screen.findByRole('alert')).toHaveTextContent('Account creation could not finish');expect(screen.queryByText('private SQL credentials')).not.toBeInTheDocument();
 for(const [label,value] of [['Full Name',form.name],['Company Name',form.companyName],['Email',form.email],['Password',form.password]])expect(screen.getByLabelText(label)).toHaveValue(value);
 expect(screen.getByRole('button',{name:'Create account & choose plan'})).toBeEnabled();
});
it('duplicate account shows its actionable server validation without a new identity',async()=>{
 m.post.mockRejectedValue({response:{status:409,data:{message:'Manager with this email already exists'}}});const {store}=mount();fill();submit();
 expect(await screen.findByRole('alert')).toHaveTextContent('Manager with this email already exists');expect(store.getState().auth.user).toBeNull();expect(screen.getByRole('link',{name:'Log in'})).toHaveAttribute('href','/login');
});
it('durable account with failed session offers sign-in instead of a second signup',async()=>{
 m.post.mockResolvedValue({data:{data:{...account,sessionEstablished:false}}});const {store,client}=mount();fill();submit();
 expect(await screen.findByRole('status')).toHaveTextContent('Account created. Sign in to continue.');expect(screen.queryByText('Create your account first. Your plan and payment come next.')).not.toBeInTheDocument();expect(store.getState().auth.user).toBeNull();expect(client.getQueryData(['currentUser'])).toBeUndefined();
 expect(screen.queryByRole('button',{name:'Create account & choose plan'})).not.toBeInTheDocument();fireEvent.click(screen.getByRole('link',{name:'Sign in'}));await screen.findByRole('heading',{name:'Sign in destination'});expect(m.post).toHaveBeenCalledOnce();
});
it('EN/UR changes keep form node and typed values and translate validation',async()=>{
 mount();fill({password:'12345'});const name=screen.getByLabelText('Full Name');fireEvent.click(screen.getByRole('button',{name:'اردو'}));
 expect(screen.getByLabelText('پورا نام')).toBe(name);expect(screen.getByLabelText('ای میل')).toHaveValue(form.email);expect(screen.getByLabelText('پاس ورڈ')).toHaveValue('12345');
 fireEvent.click(screen.getByRole('button',{name:'اکاؤنٹ بنائیں اور پلان چنیں'}));expect(await screen.findByRole('alert')).toHaveTextContent('کم از کم 6 حروف استعمال کریں');expect(m.post).not.toHaveBeenCalled();
});
it('a context language update preserves focused input without remounting',()=>{
 const store=configureStore({reducer:{auth:authReducer}});const client=new QueryClient();
 function Wrapper({language,children}:{language:'en'|'ur';children:ReactNode}){return <Provider store={store}><QueryClientProvider client={client}><MemoryRouter><LanguageContext.Provider value={{language,setLanguage:()=>{},t:(text,values)=>translate(text,language,values)}}>{children}</LanguageContext.Provider></MemoryRouter></QueryClientProvider></Provider>;}
 const child=<SignUp/>;const view=render(<Wrapper language="en">{child}</Wrapper>);const input=screen.getByLabelText('Full Name');act(()=>input.focus());
 view.rerender(<Wrapper language="ur">{child}</Wrapper>);expect(screen.getByLabelText('پورا نام')).toBe(input);expect(input).toHaveFocus();
});
