import { useState, type FormEvent, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { clearUser } from '@/store/slices/authSlice';
import { useLanguage } from '@/i18n/context';
import AuthShell from '@/components/common/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { changePassword, companySettings, completeOwnerLink, ownerStatus, requestRecovery, requestVerification, responseStatus, saveCompanySettings, type CompanySettings } from './api';
import { forgetOwnerLinkToken, ownerLinkToken } from './linkToken';
import '@/workspace.css';
import '@/workspace-refresh.css';
import './account.css';

function useSecurityCompletion() {
 const query = useQueryClient(), dispatch = useDispatch(), navigate = useNavigate();
 return () => {
  forgetOwnerLinkToken(); dispatch(clearUser()); query.clear();
  query.setQueryData(['currentUser'], null);
  navigate('/login', {replace: true, state: {securityCompleted: true}});
 };
}
function SecurityShell({title, description, children}: {title: string; description: string; children: ReactNode}) {
 const {t} = useLanguage();
 return <div className="workspace account-public"><AuthShell title={t(title)} subtitle={t(description)} footer={<Link to="/login">{t('Return to sign in')}</Link>}>{children}</AuthShell></div>;
}
function PasswordFields({current, submit, busy, label}: {current: boolean; submit: (currentPassword: string, newPassword: string) => Promise<void>; busy?: boolean; label: string}) {
 const {t} = useLanguage();
 const [pending, setPending] = useState(false), [error, setError] = useState('');
 async function save(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  const old = String(form.get('currentPassword') ?? ''), next = String(form.get('newPassword') ?? '');
  if ((current && !old) || next.length < 8 || new TextEncoder().encode(next).length > 72 || next !== form.get('confirmPassword')) {
   setError('Enter matching new passwords, at least 8 characters and at most 72 UTF-8 bytes.'); return;
  }
  setError(''); setPending(true);
  try { await submit(old, next); }
  catch (err) {
   const status = responseStatus(err);
   setError(status === 410 || (!current && (status === 400 || status === 403)) ? 'This link is invalid, expired or already used. Request a new link.' : status === 403 ? 'Your current password could not be verified, or access changed. Check it and try again.' : status === 400 ? 'Choose a different valid new password and try again.' : 'The password could not be changed. Check your connection and try again.');
  } finally {setPending(false);}
 }
 return <form className="account-form" onSubmit={save}>
  {current && <label>{t('Current password')}<Input name="currentPassword" type="password" dir="ltr" autoComplete="current-password" required maxLength={1024}/></label>}
  <label>{t('New password')}<Input name="newPassword" type="password" dir="ltr" autoComplete="new-password" required minLength={8} aria-describedby="password-help"/></label>
  <p id="password-help" className="account-help">{t('Use at least 8 characters and at most 72 UTF-8 bytes. Choose a different password.')}</p>
  <label>{t('Confirm new password')}<Input name="confirmPassword" type="password" dir="ltr" autoComplete="new-password" required minLength={8}/></label>
  {error && <p role="alert" className="account-error">{t(error)}</p>}
  <Button disabled={pending || busy} type="submit">{t(pending ? 'Saving password…' : label)}</Button>
 </form>;
}
export function OwnSecurityPage({forced = false}: {forced?: boolean}) {
 const {t} = useLanguage(), {isAuthenticated} = useAuth(); const complete = useSecurityCompletion();
 return <SecurityShell title={forced ? 'Replace your password' : 'Your account security'} description={forced ? 'Replace your password before continuing. This changes only your own credentials.' : 'Change your own password. You will need to sign in again on every device.'}>
  {!isAuthenticated && !forced ? <p role="alert">{t('Sign in to change your own password.')} <Link to="/login">{t('Sign in')}</Link></p> : <PasswordFields current label="Change password" submit={async (old, next) => {await changePassword(old, next); complete();}}/>}
  <p className="account-help"><Link to="/recover-owner-account">{t('Owner password recovery')}</Link></p>
 </SecurityShell>;
}
export function OwnerRecoveryPage() {
 const {t} = useLanguage(); const [pending, setPending] = useState(false), [receipt, setReceipt] = useState(false), [error, setError] = useState('');
 async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); const email = String(new FormData(event.currentTarget).get('email') ?? ''); setPending(true); setError('');
  try {await requestRecovery(email); setReceipt(true);}
  catch (err) {setError(responseStatus(err) === 503 ? 'Email recovery is unavailable. Contact your company owner or the configured support channel. Delivery has not been confirmed.' : responseStatus(err) === 429 ? 'Too many requests. Wait before trying again. Delivery has not been confirmed.' : 'The request could not be accepted. Check your connection and try again.');}
  finally {setPending(false);}
 }
 return <SecurityShell title="Recover your owner account" description="Recovery is for verified company owners. Managers and staff should ask their company owner about account access.">
  {receipt ? <div role="status"><h2>{t('Request accepted for processing')}</h2><p>{t('Delivery is not confirmed. If this is an eligible verified owner account, a recovery request may be processed. No account details are disclosed.')}</p><p>{t('Check your inbox and spam folder. If no link arrives, contact the configured support channel.')}</p></div> : <form onSubmit={submit} className="account-form"><label>{t('Owner email')}<Input name="email" type="email" dir="ltr" autoComplete="email" required maxLength={254}/></label>{error && <p role="alert" className="account-error">{t(error)}</p>}<Button type="submit" disabled={pending}>{t(pending ? 'Requesting recovery…' : 'Request recovery link')}</Button></form>}
 </SecurityShell>;
}
export function OwnerLinkPage({kind}: {kind: 'verify' | 'reset'}) {
 const {t} = useLanguage(); const [token] = useState(() => ownerLinkToken(kind === 'verify' ? '/verify-owner-email' : '/reset-owner-password'));
 const [pending, setPending] = useState(false), [error, setError] = useState(''); const complete = useSecurityCompletion();
 async function verify() {
  if (!token || pending) return; setPending(true); setError('');
  try {await completeOwnerLink('verify', token); complete();}
  catch (err) {setError([400,403,410].includes(responseStatus(err) ?? 0) ? 'This link is invalid, expired or already used. Request a new link.' : 'Verification could not finish. Check your connection and try again.');}
  finally {setPending(false);}
 }
 return <SecurityShell title={kind === 'verify' ? 'Verify owner email' : 'Reset owner password'} description="Opening this page does not use the link. Confirm below to continue. Completing this action requires signing in again.">
  {!token ? <div role="alert"><p>{t('This link is missing or invalid. Open the complete link from your email. Reloading removes the temporary link for your security.')}</p><Link to={kind === 'reset' ? '/recover-owner-account' : '/settings'}>{t(kind === 'reset' ? 'Request recovery link' : 'Open company settings')}</Link></div> : kind === 'reset' ? <PasswordFields current={false} label="Reset password" submit={async (_old, next) => {await completeOwnerLink('reset', token, next); complete();}}/> : <div className="account-form">{error && <p role="alert" className="account-error">{t(error)}</p>}<Button onClick={verify} disabled={pending}>{t(pending ? 'Verifying…' : 'Confirm owner email')}</Button></div>}
 </SecurityShell>;
}
function OrganizationForm({saved, update}: {saved: CompanySettings; update: (saved: CompanySettings) => void}) {
 const {t} = useLanguage(); const [pending, setPending] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');
 async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); const name = String(new FormData(event.currentTarget).get('name') ?? '').trim(); setPending(true); setMessage(''); setError('');
  try {const result = await saveCompanySettings(name, saved.accountVersion); update(result.company); setMessage('Company settings saved.');}
  catch (err) {setError(responseStatus(err) === 409 ? 'Company settings changed elsewhere. Your draft is kept. Reload saved settings before trying again.' : responseStatus(err) === 403 ? 'Company changes are restricted. Check your account access or plan activation.' : 'Company settings could not be saved. Your draft is kept. Try again.');}
  finally {setPending(false);}
 }
 return <form className="account-form" onSubmit={submit}><label>{t('Company name')}<Input name="name" defaultValue={saved.name} required minLength={2} maxLength={160}/></label><p className="account-help">{t('Saved company name: {name}', {name: saved.name})}</p>{error && <p role="alert" className="account-error">{t(error)}</p>}{message && <p role="status">{t(message)}</p>}<Button type="submit" disabled={pending}>{t(pending ? 'Saving…' : 'Save company name')}</Button></form>;
}
function OwnerVerification() {
 const {t} = useLanguage(); const {user} = useAuth(); const status = useQuery({queryKey:['ownerIdentity',user?.companyId,user?.role,user?.id],queryFn:ownerStatus,retry:false,staleTime:0});
 const [pending, setPending] = useState(false), [receipt, setReceipt] = useState(false), [error, setError] = useState('');
 async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); const password = String(new FormData(event.currentTarget).get('currentPassword') ?? ''); setPending(true); setError('');
  try {await requestVerification(password); setReceipt(true); (event.target as HTMLFormElement).reset();}
  catch (err) {setError(responseStatus(err) === 503 ? 'Verification delivery is unavailable. No delivery has been confirmed.' : responseStatus(err) === 403 ? 'Current owner credentials or verified enrollment are required. Check your password or contact the configured support channel.' : 'Verification could not be requested. Try again. Delivery has not been confirmed.');}
  finally {setPending(false);}
 }
 return <section className="account-section"><h2>{t('Owner email verification')}</h2>
  {status.isPending ? <p role="status">{t('Loading owner verification…')}</p> : status.isError ? <><p role="alert">{t('Owner verification status could not load.')}</p><Button variant="outline" onClick={() => status.refetch()}>{t('Retry')}</Button></> : status.data.emailVerified ? <p>{t('Owner email is verified.')}</p> : <>
   <p>{t('Owner email is not verified.')}</p>
   {status.data.bootstrapRequired ? <p>{t('This legacy account needs identity-verified enrollment through the configured support channel. Signing in does not verify an email.')}</p> : !status.data.deliveryConfigured ? <p>{t('Verification email delivery is unavailable. Contact the configured support channel.')}</p> : receipt ? <p role="status">{t('Request accepted for processing. Delivery is not confirmed. Check your inbox and spam folder.')}</p> : <form onSubmit={submit} className="account-form"><label>{t('Current password')}<Input name="currentPassword" type="password" dir="ltr" autoComplete="current-password" required maxLength={1024}/></label>{error && <p role="alert" className="account-error">{t(error)}</p>}<Button type="submit" variant="outline" disabled={pending}>{t(pending ? 'Requesting verification…' : 'Request verification link')}</Button></form>}
  </>}
 </section>;
}
export function CompanySettingsPage() {
 const {t} = useLanguage(), {user} = useAuth(); const query = useQueryClient();
 const settings = useQuery({queryKey:['companySettings', user?.companyId],queryFn:companySettings,enabled:user?.role === 'ADMIN',retry:false,staleTime:0});
 if (user?.role !== 'ADMIN') return <p role="alert">{t('Only the company owner can manage organization settings.')} <Link to="/account/security">{t('Your account security')}</Link></p>;
 return <div className="account-settings"><header><h1>{t('Organization settings')}</h1><p>{t('Manage your saved company name and owner email verification. Your personal security is separate.')}</p></header>
  <section className="account-section"><h2>{t('Company details')}</h2>
   {settings.isPending ? <p role="status">{t('Loading company settings…')}</p> : settings.isError ? <><p role="alert">{t(responseStatus(settings.error) === 403 ? 'Company settings are restricted. Your own account security remains available.' : 'Company settings could not load. Your saved records are unchanged.')}</p><Button variant="outline" onClick={() => settings.refetch()}>{t('Reload saved settings')}</Button></> : <OrganizationForm saved={settings.data} update={saved => query.setQueryData(['companySettings', user.companyId],saved)}/>}
   {settings.data && <Button className="account-reload" variant="ghost" onClick={() => settings.refetch()}>{t('Reload saved settings')}</Button>}
  </section><OwnerVerification key={`${user.companyId}:${user.role}:${user.id}`}/><section className="account-section"><h2>{t('Your account security')}</h2><p>{t('Own-password changes remain separate from company operations and billing access.')}</p><Link to="/account/security">{t('Change your password')}</Link></section>
 </div>;
}
