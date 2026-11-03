import { useEffect, useRef, useState } from 'react';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEditStaff } from './queries';
import type { EditStaffInput } from './api';
import './workforce-v5.css';
export interface EditableStaff { id:number; name:string; email:string; phone?:string|null; shiftStart:string|null; shiftEnd:string|null; isActive:boolean }
type Props={person:EditableStaff;timezone:string;onClose:()=>void;onSaved?:()=>void};
const timeValue=(date:string|null,timezone:string)=>date?formatInTimeZone(new Date(date),timezone,'HH:mm'):'';
export default function StaffEditDialog(props:Props){
 const {user}=useAuth();
 return <ScopedStaffEditDialog key={`${user?.companyId}:${user?.role}:${user?.id}:${props.person.id}`} {...props}/>;
}
function ScopedStaffEditDialog({person,timezone,onClose,onSaved}:Props){
 const {t}=useLanguage();const edit=useEditStaff();const inFlight=useRef(false);const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const [error,setError]=useState('');
 const [form,setForm]=useState({name:person.name,email:person.email,phone:person.phone??'',shiftStart:timeValue(person.shiftStart,timezone),shiftEnd:timeValue(person.shiftEnd,timezone)});
 const save=async(event:React.FormEvent)=>{
  event.preventDefault();if(inFlight.current||!person.isActive)return;inFlight.current=true;setError('');
  const payload:EditStaffInput={};
  if(form.name.trim()!==person.name)payload.name=form.name.trim();
  if(form.email.trim()!==person.email)payload.email=form.email.trim();
  if(form.phone.trim()!==(person.phone??''))payload.phone=form.phone.trim();
  for(const field of ['shiftStart','shiftEnd'] as const)if(form[field]&&form[field]!==timeValue(person[field],timezone)){
   const date=formatInTimeZone(person[field]?new Date(person[field]!):new Date(),timezone,'yyyy-MM-dd');
   payload[field]=fromZonedTime(`${date}T${form[field]}:00`,timezone).toISOString();
  }
  try{if(Object.keys(payload).length)await edit.mutateAsync({id:person.id,data:payload});if(!mounted.current)return;onSaved?.();onClose();}
  catch(cause){if(!mounted.current)return;const status=(cause as {response?:{status?:number}}).response?.status;setError(status===409?'The record changed. Check the email and shift details before saving again. Your draft is kept.':status===403?'You do not have access to this action. Refresh your assigned sites.':status===400?'Check the contact and shift details. Existing schedules must fit the shift.':'The action could not be confirmed. Refresh the record before retrying. Your draft is kept.');}
  finally{inFlight.current=false;}
 };
 return <Dialog open onOpenChange={open=>{if(!open&&!edit.isPending&&!inFlight.current)onClose();}}><DialogContent className="workforce-dialog bg-card sm:max-w-xl" showCloseButton={!edit.isPending} onEscapeKeyDown={e=>{if(edit.isPending)e.preventDefault();}} onInteractOutside={e=>{if(edit.isPending)e.preventDefault();}}>
  <DialogTitle>{t('Edit team member')}</DialogTitle><DialogDescription>{person.name} · {t('Times use the assigned site’s timezone.')}</DialogDescription>
  <form className="workforce-form" onSubmit={save}><fieldset className="workforce-form-grid" disabled={edit.isPending}>
   {(['name','email','phone'] as const).map(field=><label key={field} htmlFor={`staff-edit-${field}`}>{t({name:'Name',email:'Email',phone:'Phone Number'}[field])}<Input id={`staff-edit-${field}`} type={field==='email'?'email':field==='phone'?'tel':'text'} dir={field==='name'?undefined:'ltr'} required={field!=='phone'} minLength={field==='name'?2:field==='phone'?7:undefined} maxLength={field==='phone'?20:undefined} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})}/></label>)}
   <p className="workforce-help">{t('Updating the login email ends existing staff sessions.')}</p>
   {(['shiftStart','shiftEnd'] as const).map(field=><label key={field} htmlFor={`staff-edit-${field}`}>{t(field==='shiftStart'?'Shift Start':'Shift End')}<Input id={`staff-edit-${field}`} type="time" dir="ltr" value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})}/></label>)}
  </fieldset><p className="workforce-help">{t('Use Staff access to transfer sites with a reason and open-shift checks.')}</p>{error?<p className="workforce-error" role="alert">{t(error)}</p>:null}<div className="workforce-form-actions"><Button type="button" variant="outline" disabled={edit.isPending} onClick={onClose}>{t('Cancel')}</Button><Button type="submit" disabled={edit.isPending||!person.isActive||!form.name.trim()||!form.email.trim()}>{t(edit.isPending?'Saving…':'Save changes')}</Button></div></form>
 </DialogContent></Dialog>;
}
