import {useRef,useState} from 'react';
import {Link,useBeforeUnload,useBlocker} from 'react-router-dom';
import {useMutation} from '@tanstack/react-query';
import {ArrowRight,CheckCircle2,ClipboardList} from 'lucide-react';
import {useOnline} from '@/hooks/useOnline';
import {useLanguage} from '@/i18n/context';
import {Button} from '@/components/ui/button';
import {closeException} from './api';
import type {ExceptionDetail,ReviewClosureAction,PerformanceCategory} from './types';
import {performanceCategoryLabels} from './performancePresentation';
import {localTime} from '../Manager/operations';
export default function DecisionForm({detail,onDone,nextReviewHref}:{detail:ExceptionDetail;onDone:(message?:string)=>Promise<void>;nextReviewHref?:string}){
 const {t,language}=useLanguage(),online=useOnline();
 const actions=detail.closureActions??[];
 const staffOptions=detail.performanceStaffOptions??[];
 const [action,setAction]=useState<ReviewClosureAction|''>(actions.includes('RESOLVE_REVIEW')?'RESOLVE_REVIEW':'');
 const [note,setNote]=useState(''),[category,setCategory]=useState<PerformanceCategory|''>('');
 const [staffId,setStaffId]=useState(staffOptions.length===1?String(staffOptions[0].id):'');
 const [conflictVersion,setConflictVersion]=useState<number|null>(null);
 const stale=conflictVersion!==null && conflictVersion===detail.rowVersion;
 const pending=useRef<{body:string;requestId:string}|null>(null),saving=useRef(false);
 const mutation=useMutation({mutationFn:async()=>{
  if(!online||!action||!actions.includes(action))throw new Error(t('Refresh this review before choosing an action.'));
  const input={expectedVersion:detail.rowVersion,action,note:note.trim(),...(action==='RECORD_PERFORMANCE_ISSUE'?{staffId:Number(staffId),category:category as PerformanceCategory}:{})};
  const body=JSON.stringify(input);if(pending.current?.body!==body)pending.current={body,requestId:crypto.randomUUID()};
  return closeException(detail.id,{...input,requestId:pending.current.requestId});
 },onError:(error:{response?:{status?:number}})=>{if(error.response?.status===409)setConflictVersion(detail.rowVersion);},onSettled:()=>{saving.current=false;},onSuccess:async()=>{
  setNote('');
  await onDone(action==='RECORD_PERFORMANCE_ISSUE'?'Staff performance issue recorded. This task review is now closed.':'Review resolved. This task is no longer in the active exception queue.');
  setAction('');setCategory('');
 }});
 const blocker=useBlocker(({currentLocation,nextLocation})=>!!note&&!mutation.isPending&&reviewNavigationKey(currentLocation)!==reviewNavigationKey(nextLocation));
 useBeforeUnload(event=>{if(note)event.preventDefault();});
 if(detail.state==='RESOLVED') {
  const closure=detail.decisions.find(decision=>['RESOLVE_REVIEW','RECORD_PERFORMANCE_ISSUE'].includes(decision.action));
  const timezone=detail.location?.timezone??'Asia/Karachi';
  return <section className="v5-saved-decision" aria-label={t('Decision recorded')}>
   <span className="v5-saved-decision-state"><CheckCircle2 size={17} aria-hidden="true"/>{t('Review handled')}</span>
   <h3>{t('Decision recorded')}</h3>
   <p>{t('This review is closed. Task verification remains as recorded.')}</p>
   {closure?<>
    <p role="status" className="v5-saved-decision-result">{t(closure.action==='RECORD_PERFORMANCE_ISSUE'?'Staff performance issue recorded':'Resolution recorded')}</p>
    <dl><div><dt>{t('Manager reviewed')}</dt><dd><bdi>{closure.actorManager?.name??t('Manager name unavailable')}</bdi></dd></div>
    <div><dt>{t('Recorded at')}</dt><dd><time dateTime={closure.createdAt}><bdi>{localTime(closure.createdAt,timezone,language,true)}</bdi> (<bdi>{timezone}</bdi>)</time></dd></div></dl>
    <div className="v5-saved-decision-note"><h4>{t('Saved note')}</h4><p><bdi>{closure.note??t('Decision note unavailable')}</bdi></p></div>
   </>:<p role="status">{t('Review closed; decision details unavailable')}</p>}
   {nextReviewHref&&<Button asChild><Link to={nextReviewHref}>{t('Next pending review')}<ArrowRight size={16} aria-hidden="true"/></Link></Button>}
  </section>;
 }
 if(detail.kind==='SETUP')return <p role="status">{t('Complete the room setup before reviewing task photos. No staff decision is available for this setup record.')}</p>;
 if(!actions.length)return <p role="status">{t('Review decisions could not be loaded. Refresh the page to continue.')}</p>;
 const performance=action==='RECORD_PERFORMANCE_ISSUE';
 const conflict=stale||(mutation.error as {response?:{status?:number}})?.response?.status===409;
 const field='min-h-12 w-full rounded-lg border border-border bg-background px-3 py-3 text-base';
 return <div className="ops-decision-actions ops-review-closure">
  {blocker.state==='blocked'&&<div role="alert" className="operations-notice"><p>{t('You have an unsaved note. Stay to save it or leave this review.')}</p><Button type="button" onClick={()=>blocker.reset()}>{t('Stay here')}</Button><Button type="button" variant="outline" onClick={()=>blocker.proceed()}>{t('Leave review')}</Button></div>}
  <h3>{t('Your decision')}</h3>
  <p className="text-sm text-muted-foreground">{t('Choose one outcome for the whole task review. It stays in exceptions until you save a decision.')}</p>
  <div className="ops-review-outcomes">
   {actions.includes('RESOLVE_REVIEW')&&<button type="button" className="ops-review-outcome" aria-label={t('Resolve review')} aria-pressed={action==='RESOLVE_REVIEW'} onClick={()=>{setAction('RESOLVE_REVIEW');mutation.reset();}} disabled={mutation.isPending}><CheckCircle2 size={20}/><span><strong>{t('Resolve review')}</strong><small>{t('Close this review without recording a staff performance issue.')}</small></span></button>}
   {actions.includes('RECORD_PERFORMANCE_ISSUE')&&<button type="button" className="ops-review-outcome" aria-label={t('Record staff performance issue')} aria-pressed={performance} onClick={()=>{setAction('RECORD_PERFORMANCE_ISSUE');mutation.reset();}} disabled={mutation.isPending}><ClipboardList size={20}/><span><strong>{t('Record staff performance issue')}</strong><small>{t('Save a staff KPI issue and close this review.')}</small></span></button>}
  </div>
  {!actions.includes('RECORD_PERFORMANCE_ISSUE')&&<p className="text-sm text-muted-foreground">{t(detail.performanceIssueRecorded?'A performance issue has already been recorded for this task.':'A performance issue needs a staff member assigned to this task.')}</p>}
  {action&&<form className="ops-review-closure-form space-y-4" onSubmit={event=>{event.preventDefault();if(stale||!online||saving.current||mutation.isPending||!note.trim())return;saving.current=true;mutation.mutate();}}>
   <h4 className="font-semibold">{t(performance?'Record staff performance issue and close':'Resolve this task review')}</h4>
   {performance&&<>
    <label className="grid gap-2 text-sm font-medium">{t('Staff member')}<select aria-label={t('Staff member')} required className={field} value={staffId} onChange={event=>setStaffId(event.target.value)}><option value="">{t('Choose responsible staff member')}</option>{staffOptions.map(staff=><option key={staff.id} value={staff.id}>{staff.name}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-medium">{t('Performance category')}<select aria-label={t('Performance category')} required className={field} value={category} onChange={event=>setCategory(event.target.value as PerformanceCategory)}><option value="">{t('Choose a category')}</option>{Object.entries(performanceCategoryLabels).map(([key,label])=><option value={key} key={key}>{t(label)}</option>)}</select></label>
    <p className="text-sm text-muted-foreground">{t('Record a performance issue only after checking the circumstances. A photo-check failure does not automatically count against staff.')}</p>
   </>}
   <label className="grid gap-2 text-sm font-medium">{t(performance?'Performance note':'Resolution note')}<textarea aria-label={t(performance?'Performance note':'Resolution note')} required maxLength={1000} rows={3} className={field} value={note} onChange={event=>setNote(event.target.value)} placeholder={t(performance?'Describe the staff performance concern and what you checked.':'Explain why this review can be closed.')}/></label>
   <p className="text-sm text-muted-foreground">{t('This closes the review. Existing photos and task completion records stay as recorded.')}</p>
   {mutation.isError&&<p role="alert" className="text-sm text-destructive">{conflict?t('This review changed. Refresh before saving. Your note is kept.'):(mutation.error as {response?:{data?:{message?:string}}}).response?.data?.message??t('Could not save your decision. Check your connection and try again.')}</p>}
   <div className="flex flex-wrap gap-3">{conflict&&<Button type="button" variant="outline" onClick={()=>void onDone()}>{t('Refresh review')}</Button>}<Button type="submit" disabled={stale||!online||mutation.isPending||!note.trim()||!actions.includes(action)||(performance&&(!staffId||!category))}>{t(mutation.isPending?'Saving decision…':performance?'Record issue and close review':'Confirm resolution')}</Button><Button type="button" variant="ghost" disabled={mutation.isPending} onClick={()=>{setAction('');mutation.reset();}}>{t('Cancel')}</Button></div>
  </form>}
 </div>;
}

// Inspecting another view of the same review keeps its decision draft. Leaving the
// review or changing queue filters still asks the reviewer to keep or discard it.
function reviewNavigationKey(location:{pathname:string;search:string}) {
 const params=new URLSearchParams(location.search);params.delete('requirementId');params.delete('issueId');params.sort();
 return location.pathname+'?'+params;
}
