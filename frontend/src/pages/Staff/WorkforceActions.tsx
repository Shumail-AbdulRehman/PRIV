import { useId, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/client';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { invalidateWorkspace } from '@/lib/invalidateWorkspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import './workforce-v5.css';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Action = 'deactivate' | 'archive' | 'transfer' | 'handoff';
export interface WorkforceRecord { id: number; name: string; isActive: boolean; locationId?: number | null; role?: string }
export interface WorkforceSite { id: number; name: string; isActive?: boolean }
type Props = { person: WorkforceRecord; locations?: WorkforceSite[]; entity?: 'staff' | 'manager' };
export default function WorkforceActions(props: Props) {
 const { user } = useAuth();
 const identity=`${user?.companyId}:${user?.role}:${user?.id}:${props.person.id}:${props.entity??'staff'}`;
 return <DraftWorkforceActions key={identity} {...props}/>;
}
function DraftWorkforceActions(props:Props){
 const [open,setOpen]=useState(false);const [action,setAction]=useState<Action>('deactivate');const [reason,setReason]=useState('');const [destination,setDestination]=useState('');
 // Draft survives a scope refresh; secrets remain bound to the exact scope.
 const scope=`${props.person.locationId}:${props.person.isActive}:${props.locations?.map(site=>`${site.id}:${site.isActive}`).join(',')}`;
 return <ScopedWorkforceActions key={scope} {...props} open={open} setOpen={setOpen} action={action} setAction={setAction} reason={reason} setReason={setReason} destination={destination} setDestination={setDestination}/>;
}
type DraftProps=Props&{open:boolean;setOpen:(value:boolean)=>void;action:Action;setAction:(value:Action)=>void;reason:string;setReason:(value:string)=>void;destination:string;setDestination:(value:string)=>void};
function ScopedWorkforceActions({person,locations=[],entity='staff',open,setOpen,action,setAction,reason,setReason,destination,setDestination}:DraftProps){
 const {user}=useAuth();const {t,language}=useLanguage();const qc=useQueryClient();const inFlight=useRef(false);const reasonId=useId();
 const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [refreshing,setRefreshing]=useState(false);
 const [error,setError]=useState('');const [saved,setSaved]=useState(false);const [handoff,setHandoff]=useState<{token:string;expiresAt:string}|null>(null);
 const permitted=user?.role==='ADMIN'||(user?.role==='MANAGER'&&entity==='staff'&&person.locationId!=null&&locations.some(l=>l.id===person.locationId));
 if(!permitted || person.role==='ADMIN')return null;
 const sites=locations.filter(l=>l.isActive!==false&&l.id!==person.locationId);
 const close=()=>{if(busy||refreshing)return;setOpen(false);setHandoff(null);setPassword('');setReason('');setError('');setDestination('');setAction('deactivate');};
 const refresh=async()=>{
  if(busy||refreshing)return;setRefreshing(true);
  try{await Promise.all([qc.refetchQueries({queryKey:['staff'],type:'active'},{throwOnError:true}),qc.refetchQueries({queryKey:['getLocations'],type:'active'},{throwOnError:true}),qc.refetchQueries({queryKey:['getManagers'],type:'active'},{throwOnError:true})]);setError('Access context refreshed. Review the selected action and your draft before confirming.');}
  catch{setError('The record could not be refreshed. Your draft is kept. Try again when connected.');}
  finally{setRefreshing(false);}
 };
 const save=async(e:React.FormEvent)=>{
  e.preventDefault();if(inFlight.current||!reason.trim()||!person.isActive)return;
  if(action==='transfer'&&!sites.some(l=>String(l.id)===destination))return;
  inFlight.current=true;setBusy(true);setError('');
  try {
   if(action==='handoff') {
    // Direct request: credentials never enter Query/Mutation caches or browser storage.
    const response=await client.post(`/common/security/staff/${person.id}/handoff`,{reason:reason.trim(),currentPassword:password});
    setHandoff(response.data.data);
   } else if(action==='transfer') {
    await client.post(`/workforce/staff/${person.id}/transfer/${destination}`,{reason:reason.trim(),expectedLocationId:person.locationId??null});
   } else if(action==='archive') {
    await client.post(`/${entity}/${person.id}/archive`,{reason:reason.trim()});
   } else await client.post(`/workforce/${entity}/${person.id}/deactivate`,{reason:reason.trim()});
   setSaved(true);
   // Recovery updates credentials, but refreshing the detail parent here could
   // unmount this one-time display before its recipient can read it.
   if(action!=='handoff') {
    qc.removeQueries({queryKey:['staff','details',person.id]});
    qc.removeQueries({queryKey:['attendance']});
    void invalidateWorkspace(qc);
   }
   if(action!=='handoff'){setOpen(false);setReason('');setDestination('');}
  } catch(cause) {
   const status=(cause as {response?:{status?:number}})?.response?.status;
   setError(status===409?'The record changed or a shift is open. Finish checkout, refresh the record, then try again. Your draft is kept.':status===403?'You do not have access to this action. Refresh your assigned sites.':status===429?'Too many recovery requests. Try again later.':status===400?'Check the reason and your current password.': 'The action could not be confirmed. Refresh the record before retrying. Your draft is kept.');
  } finally {inFlight.current=false;setPassword('');setBusy(false);}
 };
 return <span onClick={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()} className="inline-flex flex-wrap items-center gap-2">
  {person.isActive?<Button variant="outline" className="min-h-12!" onClick={()=>{setSaved(false);setOpen(true);}}>{t(entity==='manager'?'Manage access':'Staff access')}</Button>:<span>{t('Archived / inactive')}</span>}
  {saved&&!open?<span role="status">{t('Access change saved. History preserved.')}</span>:null}
  <Dialog open={open} onOpenChange={value=>{if(!value)close();}}>
   <DialogContent className="workforce-dialog bg-card max-h-[90dvh] overflow-y-auto" showCloseButton={!busy&&!refreshing} onEscapeKeyDown={e=>{if(busy||refreshing)e.preventDefault();}} onInteractOutside={e=>{if(busy||refreshing)e.preventDefault();}}>
    <DialogTitle>{t(entity==='manager'?'Manager access':'Staff access')} · {person.name}</DialogTitle>
    <DialogDescription>{t('Attendance, tasks and evidence are preserved. Access changes revoke existing sessions. No general restore is available.')}</DialogDescription>
    {handoff?<div className="space-y-4">
     <p role="status">{t('One-use recovery code created. Share it directly with this staff member. It sets a new password; it is not a login password.')}</p>
     <label className="block">{t('One-use recovery code')}<Input className="min-h-12!" dir="ltr" autoComplete="off" readOnly value={handoff.token}/></label>
     <p>{t('Expires at')}: {new Date(handoff.expiresAt).toLocaleString(language==='ur'?'ur-PK':'en-PK')}</p>
     <p>{t('Closing this dialog clears the code. It cannot be displayed again.')}</p>
     <Button className="min-h-12!" onClick={close}>{t('Close and clear code')}</Button>
    </div>:<form onSubmit={save} className="workforce-form">
     <label className="block">{t('Action')}<select className="w-full min-h-12! rounded-lg border border-border bg-background px-3" value={action} disabled={busy} onChange={e=>{setAction(e.target.value as Action);setPassword('');setError('');}}>
      <option value="deactivate">{t(entity==='manager'?'Deactivate and release sites':'Deactivate access')}</option>
      <option value="archive">{t('Archive and preserve history')}</option>
      {entity==='staff'?<><option value="transfer" disabled={!sites.length}>{t('Transfer site')}</option><option value="handoff">{t('Issue one-use recovery code')}</option></>:null}
     </select></label>
     {entity==='manager'?<p>{t('For a handover, deactivate this manager first. After the sites are released, edit the active replacement manager and assign those sites. The previous manager loses access immediately.')}</p>:null}
     {action==='transfer'?<><label className="block">{t('Destination site')}<select className="w-full min-h-12! rounded-lg border border-border bg-background px-3" required value={destination} disabled={busy} onChange={e=>setDestination(e.target.value)}><option value="">{t('Select assigned site')}</option>{sites.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label><p>{t('An open shift must be checked out first. Recorded attendance stays at its original site; incomplete assignments are released.')}</p></>:null}
     <div className="workforce-field"><label htmlFor={reasonId}>{t('Reason')}</label><Textarea id={reasonId} rows={3} required maxLength={1000} value={reason} disabled={busy||refreshing} onChange={e=>setReason(e.target.value)}/></div>
     {action==='handoff'?<label className="block">{t('Your current password')}<Input className="min-h-12!" type="password" dir="ltr" autoComplete="current-password" required value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/></label>:null}
     {error?<div className="workforce-error"><p role="alert">{t(error)}</p><Button type="button" variant="outline" disabled={busy||refreshing} onClick={()=>void refresh()}>{t(refreshing?'Refreshing…':'Refresh access context')}</Button></div>:null}
     <div className="workforce-form-actions"><Button type="button" variant="outline" className="min-h-12!" disabled={busy||refreshing} onClick={close}>{t('Cancel')}</Button><Button className="min-h-12!" type="submit" disabled={busy||refreshing||!person.isActive||!reason.trim()||(action==='transfer'&&!destination)||(action==='handoff'&&!password)}>{t(busy?'Saving…':'Confirm access change')}</Button></div>
    </form>}
   </DialogContent>
  </Dialog>
 </span>;
}
