import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { attemptStatus, reportIssue, uploadCapture } from './api';
import { cleanUploadCache, pendingIssues, queueAccount, queueRows, removeIssue, updateQueue } from './queue';
import { reconciledState, retryOutcome } from './policy';
let inFlight:Promise<void>|null=null;
let notify=()=>{};
export function configureSyncListener(listener:()=>void) {notify=listener;}
export function syncEvidence():Promise<void> {
  if(inFlight)return inFlight;
  const scope=queueAccount();if(!scope || AppState.currentState!=='active')return Promise.resolve();
  inFlight=(async()=>{
    const network=await NetInfo.fetch();if(network.isConnected===false || network.isInternetReachable===false)return;
    const rows=await queueRows();
    const pending=rows.filter(r=>['SAVED','RETRY_WAIT','AUTH_REQUIRED'].includes(r.state)&&r.nextRetryAt<=Date.now());
    for(let i=0;i<pending.length;i+=2) {
      if(queueAccount()!==scope)return;
      await Promise.all(pending.slice(i,i+2).map(async row=>{
        try {
          await updateQueue(row.id,'UPLOADING');notify();
          const result=await uploadCapture(row,scope);
          if(queueAccount()!==scope)return;
          // Durable server record + protected Cloudinary acknowledgment permits local-byte cleanup.
          await updateQueue(row.id,'SERVER_ACCEPTED',{attemptId:result.id,releaseBytes:true});
        } catch(error) {
          if(queueAccount()!==scope)return;
          const apiError=error as {response?:{status?:number;data?:{message?:string};headers?:Record<string,string>};message?:string};
          const outcome=retryOutcome(apiError.response?.status,row.retries,Date.now(),Number(apiError.response?.headers?.['retry-after'])||undefined);
          await updateQueue(row.id,outcome.state,{retry:true,error:apiError.response?.data?.message??apiError.message??'Upload will retry.',nextRetryAt:outcome.nextRetryAt});
        } finally {notify();}
      }));
    }
    for(const row of rows.filter(r=>['SERVER_ACCEPTED','PROCESSING'].includes(r.state)&&r.attemptId)) {
      if(queueAccount()!==scope)return;
      try {const next=reconciledState(row,await attemptStatus(row.attemptId!));await updateQueue(row.id,next.state,{attemptId:next.attemptId});}catch{/* Next foreground/poll resumes. */}
    }
    for(const issue of await pendingIssues()) {
      if(queueAccount()!==scope)return;
      try{await reportIssue(issue.task_id,JSON.parse(issue.payload));await removeIssue(issue.id);}catch{/* Durable report remains queued. */}
    }
  })().finally(()=>{inFlight=null;notify();});return inFlight;
}
export function startEvidenceSync() {
  try{cleanUploadCache();}catch{/* Cache may not yet be initialized. */}
  const stopNetwork=NetInfo.addEventListener(state=>{if(state.isConnected)void syncEvidence().catch(()=>{});});
  const stopForeground=AppState.addEventListener('change',state=>{if(state==='active')void syncEvidence().catch(()=>{});});
  const timer=setInterval(()=>{void syncEvidence().catch(()=>{});},5000);
  void syncEvidence().catch(()=>{});
  return ()=>{stopNetwork();stopForeground.remove();clearInterval(timer);};
}
