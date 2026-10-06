import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { client, uploadFormData } from '../api/client';
import type { ApiEnvelope } from '../types';
import type { CaptureSession, Manifest, QueueRow } from './types';
import { captureClock } from '../../modules/capture-quality';
import { materializeUpload, queueAccount } from './queue';
import { createImagePart } from '../utils/upload';
export const verificationManifest = async (taskId:number):Promise<Manifest> => (await client.get<ApiEnvelope<Manifest>>(`/task-instance/${taskId}/verification`)).data.data;
export async function installationId() { let id=await SecureStore.getItemAsync('hygene_device_id');if(!id){id=Crypto.randomUUID();await SecureStore.setItemAsync('hygene_device_id',id);}return id; }
export async function openCaptureSession(taskId:number,areaQr:string,previousSessionId?:string):Promise<CaptureSession> {
  const network=await NetInfo.fetch();if(network.isConnected===false || network.isInternetReachable===false)throw new Error('Connect to the internet to scan this room and start photos.');
  const permission=await Location.requestForegroundPermissionsAsync();if(!permission.granted)throw new Error('Allow location access in Settings to check this room.');
  let position=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
  if((position.coords.accuracy??Infinity)>50) position=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
  const clock=captureClock();
  const payload={requestId:Crypto.randomUUID(),areaQr,deviceId:await installationId(),clientBootId:clock.bootId,clientTime:new Date().toISOString(),location:{latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy??99999,sampledAt:new Date(position.timestamp).toISOString()}};
  const path=previousSessionId?`/capture-session/${previousSessionId}/renew`:`/task-instance/${taskId}/capture-sessions`;
  return (await client.post<ApiEnvelope<CaptureSession>>(path,payload)).data.data;
}
export async function resumeCapture(sessionId:string,localIds:string[]) { return (await client.post<ApiEnvelope<CaptureSession>>(`/capture-session/${sessionId}/resume`,{localPendingIds:localIds,clientBootId:captureClock().bootId,deviceId:await installationId()})).data.data; }
export async function retakeSlots(sessionId:string,requirements:{requirementId:string;expectedGeneration:number}[]):Promise<CaptureSession> {
  return (await client.post<ApiEnvelope<CaptureSession>>(`/capture-session/${sessionId}/retake-slots`,{requestId:Crypto.randomUUID(),requirements})).data.data;
}
export async function uploadCapture(row:QueueRow,scope:string) {
  if(queueAccount()!==scope)throw new Error('Account changed. Saved photos are locked.');
  const file=await materializeUpload(row.id);
  try {
    if(queueAccount()!==scope)throw new Error('Account changed. Saved photos are locked.');
    return (await uploadFormData<ApiEnvelope<{id:string;state:string}>>(`/capture-session/${row.sessionId}/attempts`,()=>{
      const form=new FormData();form.append('image',createImagePart(file.uri,`${row.id}.jpg`,'image/jpeg'));
      for(const [key,value] of Object.entries(row.metadata)) if(value!==undefined)form.append(key,typeof value==='object'?JSON.stringify(value):String(value));
      return form;
    },90_000)).data;
  } finally { if(file.exists)file.delete(); }
}
export async function commitManifest(row:QueueRow) { return client.post(`/capture-session/${row.sessionId}/attempts/manifest`,row.metadata); }
export async function attemptStatus(id:string) { return (await client.get<ApiEnvelope<{id:string;state:string}>>(`/verification-attempt/${id}`)).data.data; }
export async function reportIssue(taskId:number,payload:Record<string,unknown>) { return client.post(`/task-instance/${taskId}/verification-issues`,payload); }
