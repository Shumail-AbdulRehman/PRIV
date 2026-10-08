import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { attemptStatus, reportIssue, uploadCapture } from './api';
import { cleanUploadCache, pendingIssues, queueAccount, queueRows, removeIssue, updateQueue } from './queue';
import { reconciledState, retryOutcome } from './policy';
let inFlight:Promise<void>|null=null;
let reconciliation:Promise<void>|null=null;
let notify=()=>{};
const listeners=new Set<()=>void>();
function changed(){notify();for(const listener of listeners)listener();}
export function configureSyncListener(listener:()=>void) {notify=listener;}
export function subscribeEvidenceSync(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
/** Result polling has its own lock: a slow multipart upload must not hold up accepted photos. */
export function reconcileEvidence():Promise<void> {
  if(reconciliation)return reconciliation;
  const scope=queueAccount();if(!scope||AppState.currentState!=='active')return Promise.resolve();
  reconciliation=(async()=>{
    const network=await NetInfo.fetch();if(queueAccount()!==scope||network.isConnected===false||network.isInternetReachable===false)return;
    const rows=await queueRows();
    if(queueAccount()!==scope)return;
    for(let i=0;i<rows.length;i+=2){
      if(queueAccount()!==scope)return;
      await Promise.all(rows.slice(i,i+2).filter(r=>['SERVER_ACCEPTED','PROCESSING'].includes(r.state)&&r.attemptId).map(async row=>{
        try {
          const accepted=await attemptStatus(row.attemptId!,scope);
          if(queueAccount()!==scope)return;
          const next=reconciledState(row,accepted);
          const firstResult=next.state==='FINAL'&&!row.metadata.timings?.resultReceivedAt;
          await updateQueue(row.id,next.state,{attemptId:next.attemptId,...(firstResult?{timings:{resultReceivedAt:Date.now()}}:{})});
          if(firstResult&&typeof __DEV__!=='undefined'&&__DEV__)console.info('verification.mobile.result',{taskId:row.taskId,sessionId:row.sessionId,clientCaptureId:row.id,attemptId:accepted.id,state:accepted.state,resultReceivedAt:Date.now()});
        }catch{/* Saved authority and server acknowledgment survive; next poll resumes. */}
      }));
    }
  })().finally(()=>{reconciliation=null;changed();});return reconciliation;
}
export function syncEvidence():Promise<void> {
  // Always poll, even while the upload drain is busy.
  void reconcileEvidence().catch(()=>{});
  if(inFlight)return inFlight;
  const scope=queueAccount();if(!scope || AppState.currentState!=='active')return Promise.resolve();
  inFlight=(async()=>{
    const network=await NetInfo.fetch();if(queueAccount()!==scope||network.isConnected===false || network.isInternetReachable===false)return;
    // Refresh the pending list between bounded batches so newly saved captures do not wait for a new timer.
    const processed=new Set<string>();
    while(queueAccount()===scope){
      const pending=(await queueRows()).filter(r=>!processed.has(r.id)&&['SAVED','RETRY_WAIT','AUTH_REQUIRED'].includes(r.state)&&r.nextRetryAt<=Date.now()).slice(0,2);
      if(queueAccount()!==scope)return;
      if(!pending.length)break;
      await Promise.all(pending.map(async row=>{
        processed.add(row.id);
        try {
          const uploadStartedAt=Date.now();
          await updateQueue(row.id,'UPLOADING',{timings:{uploadStartedAt}});changed();
          const result=await uploadCapture({...row,metadata:{...row.metadata,timings:{...row.metadata.timings,uploadStartedAt}}},scope);
          if(queueAccount()!==scope)return;
          if (!result.id) throw new Error('Upload acknowledgment incomplete. Saved photo will retry.');
          const uploadAcceptedAt=Date.now();
          // Protected cloud storage and a durable server attempt permit local byte cleanup.
          await updateQueue(row.id,'SERVER_ACCEPTED',{attemptId:result.id,releaseBytes:true,timings:{uploadAcceptedAt}});
          if(typeof __DEV__!=='undefined'&&__DEV__)console.info('verification.mobile.upload',{taskId:row.taskId,sessionId:row.sessionId,clientCaptureId:row.id,attemptId:result.id,uploadStartedAt,uploadAcceptedAt,durationMs:uploadAcceptedAt-uploadStartedAt});
          void reconcileEvidence().catch(()=>{});
        } catch(error) {
          if(queueAccount()!==scope)return;
          const apiError=error as {response?:{status?:number;data?:{message?:string};headers?:Record<string,string>};message?:string};
          const outcome=retryOutcome(apiError.response?.status,row.retries,Date.now(),Number(apiError.response?.headers?.['retry-after'])||undefined);
          await updateQueue(row.id,outcome.state,{retry:true,error:apiError.response?.data?.message??apiError.message??'Upload will retry.',nextRetryAt:outcome.nextRetryAt});
        } finally {changed();}
      }));
    }
    for(const issue of await pendingIssues()) {
      if(queueAccount()!==scope)return;
      try{await reportIssue(issue.task_id,JSON.parse(issue.payload),scope);if(queueAccount()===scope)await removeIssue(issue.id);}catch{/* Durable report remains queued. */}
    }
  })().finally(()=>{inFlight=null;changed();void reconcileEvidence().catch(()=>{});});return inFlight;
}
export async function retrySavedUploads(taskId:number){
  for(const row of await queueRows(taskId))if(row.state==='RETRY_WAIT')await updateQueue(row.id,'SAVED',{nextRetryAt:0});
  void syncEvidence().catch(()=>{});
}
export function startEvidenceSync() {
  try{cleanUploadCache();}catch{/* Cache may not yet be initialized. */}
  const stopNetwork=NetInfo.addEventListener(state=>{if(state.isConnected)void syncEvidence().catch(()=>{});});
  const stopForeground=AppState.addEventListener('change',state=>{if(state==='active')void syncEvidence().catch(()=>{});});
  const timer=setInterval(()=>{void syncEvidence().catch(()=>{});},2500);
  void syncEvidence().catch(()=>{});
  return ()=>{stopNetwork();stopForeground.remove();clearInterval(timer);};
}
