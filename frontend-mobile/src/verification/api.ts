import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { client, uploadFormData, accountRequest } from '../api/client';
import type { ApiEnvelope } from '../types';
import type { CaptureSession, Manifest, QueueRow } from './types';
import { captureClock } from '../../modules/capture-quality';
import { materializeUpload, queueAccount, getRequest, saveRequest, removeRequest } from './queue';
import { createImagePart } from '../utils/upload';
import { currentLocation } from './location';
type ManifestResponse = Omit<Manifest,'items'|'session'> & {items:Array<{id:number;name:string;mandatory:boolean;state:string;itemCodeSnapshot:string;typeSnapshot:string;orderSnapshot:number;identificationSnapshot:Manifest['items'][number]['identificationSnapshot'];requirements:Array<{id:string;viewKey:string;instructions:string;mandatory:boolean;state:Manifest['items'][number]['requirements'][number]['state'];decisionVersion:number;currentAttempt?:Manifest['items'][number]['requirements'][number]['currentAttempt']}>}>};
export const verificationManifest = async (taskId:number):Promise<Manifest> => {
 const data=(await client.get<ApiEnvelope<ManifestResponse>>(`/task-instance/${taskId}/verification`)).data.data;
 return {...data,session:null,items:data.items.map(i=>({...i,id:String(i.id),nameSnapshot:i.name,requirements:i.requirements.map(r=>({...r,instructionsSnapshot:r.instructions}))}))};
};
export async function installationId() { let id=await SecureStore.getItemAsync('hygene_device_id');if(!id){id=Crypto.randomUUID();await SecureStore.setItemAsync('hygene_device_id',id);}return id; }
export async function openCaptureSession(taskId:number,areaQr:string,previousSessionId?:string,onProgress?:(message:string)=>void,reworkRequirements?:{requirementId:string;expectedGeneration:number}[]):Promise<CaptureSession> {
  const scope=queueAccount();
  if(!scope)throw new Error('Sign in again to continue your task photos.');
  const assertAccount=()=>{if(!scope||queueAccount()!==scope)throw new Error('Account changed. Sign in again to continue.');};
  assertAccount();
  const network=await NetInfo.fetch();if(network.isConnected===false || network.isInternetReachable===false)throw new Error('Connect to the internet to scan this room and start photos.');
  const clock=captureClock();const requestKey=`${reworkRequirements?'rework':'session'}:${taskId}`;
  const pending=await getRequest(requestKey);
  if(pending&&pending.body.clientBootId===clock.bootId&&pending.body.areaQr===areaQr&&JSON.stringify(pending.body.requirements??null)===JSON.stringify(reworkRequirements??null)){
    onProgress?.('Recovering your photo session…');
    try{return (await client.post<ApiEnvelope<CaptureSession>>(pending.path,pending.body,accountRequest(scope))).data.data;}catch(error){assertAccount();if((error as {response?:{status?:number}}).response?.status)await removeRequest(requestKey);throw error;}
  }
  const permission=await Location.requestForegroundPermissionsAsync();if(!permission.granted)throw new Error('Allow location access in Settings to check this room.');
  assertAccount();
  if(!await Location.hasServicesEnabledAsync())throw new Error('Location services are off. Turn on location in Settings, then scan again.');
  onProgress?.('Checking your location…');
  const position=await currentLocation((next,error)=>Location.watchPositionAsync({accuracy:Location.Accuracy.High,timeInterval:1000,distanceInterval:0},next,error));
  assertAccount();
  const payload={...(reworkRequirements?{requirements:reworkRequirements}:{}),requestId:Crypto.randomUUID(),areaQr,deviceId:await installationId(),clientBootId:clock.bootId,clientTime:new Date().toISOString(),location:{latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy??99999,sampledAt:new Date(position.timestamp).toISOString()}};
  const path=reworkRequirements?`/task-instance/${taskId}/capture-sessions/rework`:previousSessionId?`/capture-session/${previousSessionId}/renew`:`/task-instance/${taskId}/capture-sessions`;
  await saveRequest(requestKey,{path,body:payload});
  assertAccount();onProgress?.('Opening your photo session…');
  try{return (await client.post<ApiEnvelope<CaptureSession>>(path,payload,accountRequest(scope))).data.data;}catch(error){assertAccount();if((error as {response?:{status?:number}}).response?.status)await removeRequest(requestKey);throw error;}
}
export async function resumeCapture(sessionId:string,localIds:string[]) { const scope=queueAccount();if(!scope)throw new Error('Sign in again to continue.');return (await client.post<ApiEnvelope<CaptureSession>>(`/capture-session/${sessionId}/resume`,{pendingCaptureIds:localIds,clientBootId:captureClock().bootId,deviceId:await installationId()},accountRequest(scope))).data.data; }
export async function retakeSlots(sessionId:string,requirements:{requirementId:string;expectedGeneration:number}[],contexts:{contextKey:string;expectedGeneration:number}[]=[]):Promise<CaptureSession> {
  const scope=queueAccount();if(!scope)throw new Error('Sign in again to continue.');
  const slots = (await client.post<ApiEnvelope<CaptureSession['slots']>>(`/capture-session/${sessionId}/retake-slots`,{deviceId:await installationId(),requirements,contexts},accountRequest(scope))).data.data; return {slots} as CaptureSession;
}
export async function uploadCapture(row:QueueRow,scope:string) {
  if(queueAccount()!==scope)throw new Error('Account changed. Saved photos are locked.');
  const file=await materializeUpload(row.id);
  try {
    if(queueAccount()!==scope)throw new Error('Account changed. Saved photos are locked.');
    const acknowledgment=(await uploadFormData<ApiEnvelope<{attemptId:string;assetId:string;state:string}>>(`/capture-session/${row.sessionId}/attempts`,()=>{
      const form=new FormData();form.append('photo',createImagePart(file.uri,`${row.id}.jpg`,'image/jpeg'));
      for(const key of ['clientCaptureId','slotId','nonce','sha256','claimedCapturedAt','elapsedMs','bootId','deviceId'] as const) form.append(key,String(row.metadata[key]));
      if(row.metadata.timings)form.append('clientDiagnostics',JSON.stringify({...row.metadata.timings,localCategory:row.metadata.localCategoryResult}));
      if(row.metadata.spatialEvidence)form.append('spatialEvidence',JSON.stringify(row.metadata.spatialEvidence));
      return form;
    },90_000,()=>queueAccount()===scope)).data;
    if(!acknowledgment.attemptId||!acknowledgment.assetId)throw new Error('Upload acknowledgment incomplete. Your photo is still saved.');
    return {id:acknowledgment.attemptId,state:acknowledgment.state};
  } finally { if(file.exists)file.delete(); }
}
export async function commitManifest(row:QueueRow) { const {clientCaptureId,slotId,nonce,sha256,claimedCapturedAt,elapsedMs,bootId,deviceId,spatialEvidence}=row.metadata; return client.post(`/capture-session/${row.sessionId}/attempts/manifest`,{clientCaptureId,slotId,nonce,sha256,claimedCapturedAt,elapsedMs,bootId,deviceId,...(spatialEvidence?{spatialEvidence}:{})}); }
export async function attemptStatus(id:string,scope?:string) { return (await client.get<ApiEnvelope<{id:string;state:string}>>(`/verification-attempt/${id}`,scope?accountRequest(scope):undefined)).data.data; }
export async function reportIssue(taskId:number,payload:Record<string,unknown>,scope?:string) { return client.post(`/task-instance/${taskId}/verification-issues`,payload,scope?accountRequest(scope):undefined); }
