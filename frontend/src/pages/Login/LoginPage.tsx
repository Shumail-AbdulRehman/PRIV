import {useForm} from 'react-hook-form';
import {useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {useLogin} from './queries';
import type {LoginForm} from './types';
import {useLanguage} from '@/i18n/context';
import AuthShell from '@/components/common/AuthShell';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {AlertCircle,ArrowRight,Eye,EyeOff} from 'lucide-react';
import cleaningTeam from '@/assets/auth-cleaning-team.webp';
import './login.css';

export default function Login() {
 const {t}=useLanguage(),location=useLocation();
 const {register,handleSubmit,reset,formState:{errors}}=useForm<LoginForm>({defaultValues:{role:'Manager'}});
 const [error,setError]=useState(''),[showPassword,setShowPassword]=useState(false);const login=useLogin();
 function submit(data:LoginForm){
  setError('');login.mutate(data,{onSuccess:()=>reset(),onError:(failure:unknown)=>{
   const status=(failure as {response?:{status?:number}}).response?.status;
   setError(status===400||status===401?'Email or password is incorrect.':status===429?'Too many sign-in attempts. Try again shortly.':status===403?'Sign-in is unavailable for this account. Contact your company owner.':'Sign-in could not finish. Check your connection and try again.');
  }});
 }
 return <AuthShell title={t('Welcome back')} subtitle={t('Sign in to your Hygene Ops workspace.')} aside={<aside className="login-intro" aria-label={t('About Hygene Ops')}>
  <div><h2>{t('Your team. Your day.')}<br/><span>{t('One workspace.')}</span></h2><p>{t('Manage locations, staff and daily operations.')}</p></div>
  <img src={cleaningTeam} width={1024} height={1536} alt="" decoding="async"/>
 </aside>} footer={<>
  <p>{t("Don't have an account?")} <Link to="/signup">{t('Sign up')}</Link></p>
  <p className="login-platform-link"><span>{t('Managing customer companies?')}</span><Link to="/platform/login">{t('Platform owner sign-in')}<ArrowRight size={15} aria-hidden="true"/></Link></p>
 </>}>
  {location.state?.securityCompleted&&<p role="status">{t('Security details updated. Sign in again to continue.')}</p>}
  <form onSubmit={handleSubmit(submit)} aria-busy={login.isPending}>
   <div><label htmlFor="role">{t('Account type')}</label><select id="role" {...register('role',{required:'Please select a role'})} disabled={login.isPending}><option value="Manager">{t('Owner or manager')}</option><option value="Staff">{t('Staff')}</option></select></div>
   <div><label htmlFor="email">{t('Email')}</label><Input id="email" type="email" dir="ltr" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email?'email-error':undefined} {...register('email',{required:'Email is required'})}/>{errors.email&&<p id="email-error" role="alert">{t(errors.email.message??'Email is required')}</p>}</div>
   <div><div className="login-password-label"><label htmlFor="password">{t('Password')}</label><Link to="/recover-owner-account">{t('Owner password recovery')}</Link></div><div className="login-password-control" dir="ltr"><Input id="password" type={showPassword?'text':'password'} dir="ltr" autoComplete="current-password" aria-invalid={!!errors.password} aria-describedby={errors.password?'password-error':undefined} {...register('password',{required:'Password is required'})}/><Button type="button" variant="ghost" className="login-password-toggle" aria-label={t(showPassword?'Hide password':'Show password')} aria-pressed={showPassword} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={18} aria-hidden="true"/>:<Eye size={18} aria-hidden="true"/>}</Button></div>{errors.password&&<p id="password-error" role="alert">{t(errors.password.message??'Password is required')}</p>}</div>
   {error&&<div className="login-error" role="alert"><AlertCircle size={18} aria-hidden="true"/><p>{t(error)}</p></div>}
   <Button type="submit" disabled={login.isPending}>{t(login.isPending?'Signing in…':'Sign in')}<ArrowRight size={17} aria-hidden="true"/></Button>
  </form>
 </AuthShell>;
}
