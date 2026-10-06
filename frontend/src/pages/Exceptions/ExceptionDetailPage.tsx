import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { invalidateWorkspace } from '@/lib/invalidateWorkspace';
import ProtectedEvidence from '../Verification/ProtectedEvidence';
import { exceptionStateLabel,plainReason,verificationLabel } from '../Verification/presentation';
import { useException } from './queries';
import { decideException,getException,readException } from './api';
import { actionConsequence,actionLabels,issueActions } from './actionPresentation';
import type { ExceptionAction,ExceptionDetail,VerificationIssue } from './types';
import type { EvidenceAttempt } from '../Verification/types';

function DecisionForm({detail,issue,onDone}:{detail:ExceptionDetail;issue:VerificationIssue;onDone:()=>Promise<void>}){
 const actions=issueActions(detail,issue);
 const [action,setAction]=useState<ExceptionAction>(actions[0]??'RESOLVE_ISSUE');
 const [reason,setReason]=useState('');const [note,setNote]=useState('');const [minutes,setMinutes]=useState(60);const [followUp,setFollowUp]=useState('');
 const context=[...new Map([...(issue.latestAttempt?.contextKey&&issue.latestAttempt.mediaAssetId?[issue.latestAttempt]:[]),...(detail.attempts?.filter(a=>a.contextKey&&a.mediaAssetId)??[])].map(a=>[a.id,a])).values()];
 const pendingDecision=useRef<{body:string;requestId:string}|null>(null);
 const [evidence,setEvidence]=useState(issue.latestAttempt?.mediaAssetId?issue.latestAttempt.id:context[0]?.id??'');
 const mutation=useMutation({mutationFn:()=>{const input={expectedVersion:detail.rowVersion,issueId:issue.id,...(issue.requirementId?{requirementId:issue.requirementId}:{}),action,reasonCode:reason,note,...(['ACCEPT_EVIDENCE','ACCEPT_CONTEXT'].includes(action)?{evidenceAttemptId:evidence}:{}),...(action==='EXTEND_WINDOW'?{extensionMinutes:minutes}:{}),...(detail.requiresFollowUp?{followUpTaskInstanceId:Number(followUp)}:{})};const body=JSON.stringify(input);if(pendingDecision.current?.body!==body)pendingDecision.current={body,requestId:crypto.randomUUID()};return decideException(detail.id,{...input,requestId:pendingDecision.current.requestId});},onSuccess:onDone});
 if(!actions.length)return null;
 const field='min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm';
 const conflict=(mutation.error as {response?:{status?:number}})?.response?.status===409;
 return <form className="mt-5 space-y-3 border-t border-border pt-5" onSubmit={e=>{e.preventDefault();mutation.mutate();}}>
 <label className="flex flex-col gap-1 text-sm">Decision<select aria-label="Decision" className={field} value={action} onChange={e=>setAction(e.target.value as ExceptionAction)}>{actions.map(a=><option key={a} value={a}>{actionLabels[a]}</option>)}</select></label>
 <p className="max-w-prose text-sm text-muted-foreground">{actionConsequence(action)}</p>
 {action==='ACCEPT_CONTEXT'?<label className="flex flex-col gap-1 text-sm">Reviewed room photo<select aria-label="Reviewed room photo" className={field} value={evidence} onChange={e=>setEvidence(e.target.value)}>{context.map(a=><option key={a.id} value={a.id}>{a.contextKey} · {new Date(a.createdAt).toLocaleString()}</option>)}</select></label>:null}
 {action==='EXTEND_WINDOW'?<label className="flex flex-col gap-1 text-sm">Minutes beyond original deadline<input aria-label="Minutes beyond original deadline" className={field} type="number" min="1" max={detail.policyBounds?.maxExtensionMinutes??120} value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></label>:null}
 {detail.requiresFollowUp?<label className="flex flex-col gap-1 text-sm">Completed follow-up task ID<input aria-label="Completed follow-up task ID" required className={field} type="number" min="1" value={followUp} onChange={e=>setFollowUp(e.target.value)}/><span className="text-muted-foreground">Use a completed task in this same room with fresh accepted replacement evidence.</span></label>:null}
 <label className="flex flex-col gap-1 text-sm">Reason<select aria-label="Reason" required className={field} value={reason} onChange={e=>setReason(e.target.value)}><option value="">Choose a reviewed reason</option>{['CLEAN','CANNOT_ASSESS','WRONG_ITEM','CLEANING_REQUIRED','DAMAGED','INACCESSIBLE','OCCUPIED','GPS_UNCERTAIN','CONTEXT_UNCERTAIN','IDENTITY_UNCERTAIN','SERVICE_FAILURE','PRIVACY_HOLD','MISSING_EVIDENCE','CLOCK_UNCERTAIN','DUPLICATE_EVIDENCE','STALE_ASSIGNMENT'].map(r=><option key={r} value={r}>{plainReason(r)}</option>)}</select></label>
 <label className="flex flex-col gap-1 text-sm">Decision note<textarea aria-label="Decision note" required maxLength={1000} rows={2} className={field} value={note} onChange={e=>setNote(e.target.value)} placeholder="Explain what you reviewed and why."/></label>
 {mutation.isError?<p role="alert" className="text-sm text-destructive">{conflict?'This case changed. Refresh it before deciding. Your note is kept.':(mutation.error as {response?:{data?:{message?:string}}}).response?.data?.message??'Decision failed. Try again.'}</p>:null}
 {conflict?<Button type="button" variant="outline" onClick={()=>void onDone()}>Refresh case</Button>:null}
 <Button disabled={mutation.isPending||!actions.includes(action)}>{mutation.isPending?'Saving decision…':actionLabels[action]}</Button>
 </form>;
}
function Attempt({attempt}:{attempt:EvidenceAttempt}){return <div className="space-y-2"><p className="text-sm">{plainReason(attempt.state)} · {new Date(attempt.createdAt).toLocaleString()} · {attempt.staff?.name??'Worker'}</p>{attempt.mediaAssetId?<ProtectedEvidence assetId={attempt.mediaAssetId} privacyState={attempt.privacyState??'SAFE'}/>:<p className="text-sm text-muted-foreground">Photo is unavailable until privacy checks allow review.</p>}</div>;}
export default function ExceptionDetailPage(){const id=Number(useParams().id);return <CaseDetail key={id} id={id}/>;}
function CaseDetail({id}:{id:number}){
 const query=useException(id);const client=useQueryClient();
 const [more,setMore]=useState<{attempts:EvidenceAttempt[];events:ExceptionDetail['events'];decisions:ExceptionDetail['decisions'];nextAttemptCursor?:string|null;nextEventCursor?:string|null;nextDecisionCursor?:string|null;loaded?:boolean}>({attempts:[],events:[],decisions:[]});
 const [historyError,setHistoryError]=useState('');const [readError,setReadError]=useState('');const [loadingHistory,setLoadingHistory]=useState(false);
 const detail=query.data;
 const readVersion=detail?.rowVersion;
 useEffect(()=>{if(readVersion===undefined)return;void readException(id).then(()=>{setReadError('');return client.invalidateQueries({queryKey:['exception-count']});}).catch(()=>setReadError('Read receipt could not be saved.'));},[id,readVersion,client]);
 const done=async()=>{await invalidateWorkspace(client);await query.refetch();};
 async function loadHistory(){if(!detail)return;setLoadingHistory(true);try{const page=await getException(id,{attemptCursor:(more.loaded?more.nextAttemptCursor:detail.nextAttemptCursor)??undefined,eventCursor:(more.loaded?more.nextEventCursor:detail.nextEventCursor)??undefined,decisionCursor:(more.loaded?more.nextDecisionCursor:detail.nextDecisionCursor)??undefined});setMore(old=>({loaded:true,attempts:[...old.attempts,...page.attempts??[]],events:[...old.events,...page.events],decisions:[...old.decisions,...page.decisions],nextAttemptCursor:page.nextAttemptCursor,nextEventCursor:page.nextEventCursor,nextDecisionCursor:page.nextDecisionCursor}));setHistoryError('');}catch{setHistoryError('Could not load older history.');}finally{setLoadingHistory(false);}}
 if(query.isPending)return <p role="status">Loading case…</p>;
 if(!detail)return <p role="alert">Case unavailable. Check your location access. <Button onClick={()=>void query.refetch()}>Retry</Button></p>;
 const attempts=[...new Map([...(detail.attempts??[]),...more.attempts].map(a=>[a.id,a])).values()];
 const events=[...new Map([...detail.events,...more.events].map(e=>[e.id,e])).values()];const decisions=[...new Map([...detail.decisions,...more.decisions].map(d=>[d.id,d])).values()];
 const timeline=[...decisions.map(d=>({key:`decision:${d.id}`,createdAt:d.createdAt,title:`${actionLabels[d.action as ExceptionAction]??plainReason(d.action)} · ${d.actorManager?.name??'Manager'}`,description:`${plainReason(d.reasonCode)}${d.note?`: ${d.note}`:''}`})),...events.map(e=>({key:`event:${e.id}`,createdAt:e.createdAt,title:plainReason(e.type),description:'System event'}))].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));

 return <div className="space-y-6"><Link to="/exceptions" className="text-sm text-primary">← Exception inbox</Link><PageHeader title={detail.area?.name??detail.task?.areaNameSnapshot??'Setup case'} subtitle={`${detail.task?.title??'Room setup'} · ${exceptionStateLabel(detail.state)} · Priority ${detail.priority}`}/>
 <div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-border py-4 text-sm"><span>{detail.location?.name}</span><span>Worker: {detail.task?.staff?.name??'Unassigned'}</span>{detail.task?.shiftEnd?<span>Original deadline: {new Date(detail.task.shiftEnd).toLocaleString(undefined,{timeZone:detail.location?.timezone})}</span>:null}{detail.taskInstanceId?<Link className="text-primary" to={`/verification/${detail.taskInstanceId}`}>Verification history</Link>:null}</div>
 {readError?<p role="alert">{readError} <Button variant="outline" onClick={()=>void readException(id).then(()=>setReadError(''))}>Mark read</Button></p>:null}
 {detail.requiresFollowUp?<p className="rounded-lg bg-muted p-4">This task is already complete. Resolve new concerns using fresh evidence from a completed follow-up task. Its original completion remains unchanged.</p>:null}
 {detail.kind==='SETUP'?<Button asChild variant="outline"><Link to={`/locations/${detail.locationId}`}>Review room setup</Link></Button>:null}
 <div className="space-y-8">{detail.issues.map(issue=><section className="rounded-xl border border-border bg-card p-5 sm:p-6" key={issue.id}><div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-semibold">{issue.requirement?.item?.nameSnapshot??'Room or task'}{issue.requirement?` · ${plainReason(issue.requirement.viewKey)}`:''}</h2><span className="text-sm">{exceptionStateLabel(issue.state)}</span></div><p className="mt-2 font-medium">{plainReason(issue.reasonCode)}</p><p className="mt-1 text-sm text-muted-foreground">{issue.recommendedAction}</p>
 <div className="mt-4 grid gap-5 md:grid-cols-2"><div><h3 className="mb-2 text-sm font-semibold">Latest evidence</h3>{issue.latestAttempt?<Attempt attempt={issue.latestAttempt}/>:<p className="text-sm text-muted-foreground">No reviewable image in this page of history.</p>}</div><div><h3 className="mb-2 text-sm font-semibold">Previous attempts</h3>{attempts.filter(a=>a.requirementId===issue.requirementId&&a.id!==issue.latestAttemptId).map(a=><details key={a.id} className="mb-2"><summary className="cursor-pointer text-sm">{new Date(a.createdAt).toLocaleString()} · {plainReason(a.state)}</summary><Attempt attempt={a}/></details>)}</div></div>
 {issue.state!=='RESOLVED'?<DecisionForm detail={detail} issue={issue} onDone={done}/>:null}</section>)}</div>
 {detail.task?<p className="text-sm">Current outcome: {verificationLabel(detail.task)}</p>:null}
 <section className="space-y-3"><h2 className="text-lg font-semibold">Decision and audit timeline</h2>{timeline.map(event=><div key={event.key} className="border-b border-border py-3"><p className="font-medium">{event.title}</p><p className="text-sm">{event.description}</p><time className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</time></div>)}</section>
 {historyError?<p role="alert">{historyError}</p>:null}{(more.loaded?more.nextAttemptCursor:detail.nextAttemptCursor)||(more.loaded?more.nextDecisionCursor:detail.nextDecisionCursor)||(more.loaded?more.nextEventCursor:detail.nextEventCursor)?<Button variant="outline" disabled={loadingHistory} onClick={()=>void loadHistory()}>Load more history</Button>:null}
 </div>;
}
