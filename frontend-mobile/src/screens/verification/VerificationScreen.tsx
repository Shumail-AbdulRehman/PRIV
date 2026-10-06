import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import { Button } from '../../components/ui/button';
import { Text } from '../../components/ui/text';
import { captureClock, inspectStill } from '../../../modules/capture-quality';
import { getSession, queueRows, saveCapture, saveIssue, saveSession, queueAccount, removeRequest } from '../../verification/queue';
import { installationId, openCaptureSession, resumeCapture, retakeSlots, verificationManifest } from '../../verification/api';
import { captureAllowed, mergeManifest, nextSlot } from '../../verification/policy';
import { captureProgress, qualityInstruction, reworkRequirements, slotInstruction } from '../../verification/capturePolicy';
import { syncEvidence } from '../../verification/sync';
import { formatClockTime } from '../../utils/format';
import type { LocalSession, Manifest, QueueRow } from '../../verification/types';
import type { RootStackParamList } from '../../types';

type Props=NativeStackScreenProps<RootStackParamList,'Verification'>;
type Mode='prepare'|'scan'|'capture'|'progress'|'problem';
const scanSettings={barcodeTypes:['qr' as const]};
const errorMessage=(error:unknown)=>{const e=error as {response?:{data?:{message?:string}};message?:string};return e.response?.data?.message??e.message??'Try again when connected.';};
export function VerificationScreen({route,navigation}:Props) {
  const taskId=route.params.taskId;
  const focused=useIsFocused();
  const [permission,requestPermission]=useCameraPermissions();
  const [local,setLocal]=useState<LocalSession|null>(null);
  const [manifest,setManifest]=useState<Manifest|null>(null);
  const [rows,setRows]=useState<QueueRow[]>([]);
  const [mode,setMode]=useState<Mode>('prepare');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [torch,setTorch]=useState(false);
  const [online,setOnline]=useState(true);
  const [foreground,setForeground]=useState(AppState.currentState==='active');
  const [cameraActive,setCameraActive]=useState(false);
  const [cameraKey,setCameraKey]=useState(0);
  const camera=useRef<CameraView>(null);
  const ready=useRef(false);
  const paused=useRef(false);
  const actionInFlight=useRef(false);
  const load=useCallback(async()=>{
    const stored=await getSession(taskId);
    const pending=await queueRows(taskId);
    setRows(pending);setLocal(stored);if(stored)setManifest(stored.manifest);
    try {
      const current=await verificationManifest(taskId);setManifest(current);
      if(stored){const next=mergeManifest(stored,current);await saveSession(next);setLocal(next);}
    }catch(error){
      const status=(error as {response?:{status?:number}}).response?.status;
      if(stored&&[403,404,410].includes(status??0)){const revoked={...stored,paused:true,session:{...stored.session,state:'REVOKED'}};await saveSession(revoked);setLocal(revoked);setMessage('Your task access changed. Saved photos are kept. Ask your manager.');}
      else if(!stored)setMessage(errorMessage(error));
    }
  },[taskId]);
  useEffect(()=>{let live=true;void load().then(()=>{if(live)setMode('prepare');}).catch(error=>setMessage(errorMessage(error)));const timer=setInterval(()=>{if(focused&&AppState.currentState==='active'&&!actionInFlight.current)void load().catch(()=>{});},2500);return()=>{live=false;clearInterval(timer);};},[load,focused]);
  useEffect(()=>NetInfo.addEventListener(state=>setOnline(state.isConnected!==false&&state.isInternetReachable!==false)),[]);
  useEffect(()=>{const listener=AppState.addEventListener('change',state=>setForeground(state==='active'));return()=>listener.remove();},[]);
  const slot=local?nextSlot(local,rows):undefined;
  let allowed=false;try{allowed=!!local&&captureAllowed(local,captureClock());}catch{/* Requires native build. */}
  const showCamera=focused&&foreground&&!paused.current&&permission?.granted&&(mode==='scan'||(mode==='capture'&&allowed&&!!slot));
  useEffect(()=>{ready.current=false;setCameraActive(false);if(!showCamera)return;const timer=setTimeout(()=>setCameraActive(true),350);return()=>clearTimeout(timer);},[showCamera]);
  useEffect(()=>{if(!cameraActive)return;const timer=setTimeout(()=>{if(!ready.current)setCameraKey(k=>k+1);},4000);return()=>clearTimeout(timer);},[cameraActive,cameraKey]);
  async function action(work:()=>Promise<void>){if(actionInFlight.current)return;actionInFlight.current=true;setBusy(true);setMessage('');try{await work();}catch(error){setMessage(errorMessage(error));}finally{actionInFlight.current=false;setBusy(false);}}
  async function continuePhotos(){await action(async()=>{
    if(Platform.OS==='web'||!queueAccount())throw new Error('Use a native Hygene Ops build to securely save verification photos.');
    const permitted=permission?.granted?permission:await requestPermission();if(!permitted.granted){setMessage(permitted.canAskAgain?'Allow camera access to take task photos.':'Camera access is blocked. Open settings to allow it.');setMode('problem');return;}
    paused.current=false;
    if(local&&captureAllowed({...local,paused:false},captureClock())){
      let next={...local,paused:false};
      if(online){const response=await resumeCapture(local.session.id,rows.filter(r=>r.state!=='FINAL').map(r=>r.id));next={...next,session:{...local.session,...response,serverTime:local.session.serverTime}};}
      await saveSession(next);setLocal(next);setMode('capture');
    }else if(!local&&online&&current?.sessions?.some(s=>['ACTIVE','PAUSED'].includes(s.state))){
      const serverSession=current.sessions.find(s=>['ACTIVE','PAUSED'].includes(s.state))!;
      const session=await resumeCapture(serverSession.id,[]);const anchor=captureClock();
      const next={session,manifest:current,anchorBootId:anchor.bootId,anchorElapsedMs:anchor.elapsedMs,savedAt:Date.now(),paused:false};
      await saveSession(next);setLocal(next);setMode(session.requiresRenewal?'scan':'capture');
    }else setMode('scan');
  });}
  async function scanned(data:string){await action(async()=>{
    setMode('problem');setMessage('Checking location…');
    const session=await openCaptureSession(taskId,data,local?.session.state==='REVOKED'?undefined:local?.session.id);
    const anchor=captureClock();
    const current=await verificationManifest(taskId);
    const next={session,manifest:current,anchorElapsedMs:anchor.elapsedMs,anchorBootId:anchor.bootId,savedAt:Date.now(),paused:paused.current};
    await saveSession(next);await removeRequest(`session:${taskId}`);setLocal(next);setManifest(current);setMessage(session.presenceStatus==='UNCERTAIN'?'Manager review needed. You can still take the required photos.':'');setMode(paused.current?'progress':'capture');
  });}
  async function capture(){await action(async()=>{
    if(!local||!slot||!allowed||!ready.current||paused.current)throw new Error('Scan the room again to continue photos.');
    const scope=queueAccount();
    const photo=await camera.current?.takePictureAsync({quality:.9,skipProcessing:false});
    if(!photo)throw new Error('Camera did not save a photo. Try again.');
    const clock=captureClock();
    let resized:File|undefined;const temporary=new File(photo.uri);
    try {
      if(paused.current||scope!==queueAccount())return;
      if(!captureAllowed(local,clock))throw new Error('Photo window ended. Scan the room to renew before retaking.');
      const quality=await inspectStill(photo.uri);const correction=qualityInstruction(quality);if(correction){setMessage(correction);return;}
      const result=await manipulateAsync(photo.uri,[quality.width>=quality.height?{resize:{width:1800}}:{resize:{height:1800}}],{compress:.85,format:SaveFormat.JPEG});resized=new File(result.uri);
      const bytes=await resized.bytes();const hash=await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256,bytes);const sha256=Array.from(new Uint8Array(hash)).map(v=>v.toString(16).padStart(2,'0')).join('');
      if(paused.current||scope!==queueAccount())return;
      await saveCapture({taskId,sessionId:local.session.id,slotId:slot.id,nonce:slot.nonce,clientCaptureId:Crypto.randomUUID(),sha256,claimedCapturedAt:new Date(Date.parse(local.session.serverTime)+clock.elapsedMs-local.anchorElapsedMs).toISOString(),elapsedMs:clock.elapsedMs-local.anchorElapsedMs+Math.max(0,Date.parse(local.session.serverTime)-Date.parse(local.session.serverTimeAnchor??local.session.serverTime)),bootId:clock.bootId,deviceId:await installationId()},bytes);
      // Navigation/progression occurs only after the SQLite transaction commits.
      const pending=await queueRows(taskId);setRows(pending);setMessage('Saved on this phone.');void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);void syncEvidence().catch(()=>{});
      if(!nextSlot(local,pending))setMode('progress');
    }finally{if(resized?.exists)resized.delete();if(temporary.exists)temporary.delete();}
  });}
  async function report(reasonCode:string,requestHelp=false){
    paused.current=true;setCameraActive(false);setMode('progress');
    try {
      if(local){const next={...local,paused:true};await saveSession(next);setLocal(next);}
      await saveIssue(taskId,{reasonCode,requestHelp,...(reasonCode!=='OCCUPIED'&&slot?.requirementId?{requirementId:slot.requirementId}:{})});
      setMessage(reasonCode==='OCCUPIED'?'Photos paused. Continue when the room is empty.':'Report saved. Your manager can review it when connected.');void syncEvidence().catch(()=>{});
    }catch(error){setMessage(errorMessage(error));}
  }
  async function rework(){await action(async()=>{
    if(!local)return;
    if(!allowed){setMode('scan');return;}
    const failed=reworkRequirements(local);
    const response=await retakeSlots(local.session.id,failed.map(({requirement})=>({requirementId:requirement.id,expectedGeneration:requirement.decisionVersion})),failedContexts.map(s=>({contextKey:s.contextKey!,expectedGeneration:s.generation})));
    const next={...local,paused:false,session:{...local.session,slots:[...local.session.slots.filter(s=>!response.slots.some(n=>n.requirementId?n.requirementId===s.requirementId:n.contextKey===s.contextKey)),...response.slots]}};
    await saveSession(next);paused.current=false;setLocal(next);setMode('capture');
  });}
  const current=manifest??local?.manifest;
  const progress=local?captureProgress(local,rows):null;
  const failedContexts=local?(current?.sessions?.find(s=>s.id===local.session.id)?.slots??[]).filter((s,index,all)=>!!s.contextKey&&['RECAPTURE_REQUIRED','REVIEW_REQUIRED','PRIVACY_HOLD'].includes(s.state)&&!all.some(other=>other.contextKey===s.contextKey&&other.generation>s.generation)):[];
  const heading=local&&slot?slotInstruction(local,slot):null;
  const completion=current?.task.completionOutcome;
  const finished=completion==='VERIFIED_COMPLETE'||completion==='COMPLETED_WITH_EXCEPTIONS';
  return <View className="flex-1 bg-background">
    <ScrollView contentContainerStyle={{padding:20,gap:16,paddingBottom:36}}>
      <Text className="text-2xl font-bold">{finished?(completion==='VERIFIED_COMPLETE'?'Verified complete':'Completed with exceptions'):current?.task.areaNameSnapshot??'Finish task'}</Text>
      {current?<Text>{current.task.title} · Due {formatClockTime(current.task.shiftEnd,current.task.location?.timezone)}</Text>:null}
      {!online?<Text accessibilityLiveRegion="polite">Offline. Saved photos upload when connected. Reopen this app to finish sending them.</Text>:null}
      {local?.session.presenceStatus==='UNCERTAIN'?<Text>Manager review needed for this room. You can still save the required photos.</Text>:null}
      {current?.deadlineWarning?<Text>Photo window ends in {Math.ceil(current.deadlineWarning.remainingSeconds/60)} minutes.</Text>:null}
      {message?<Text accessibilityLiveRegion="polite" className="text-base">{message}</Text>:null}
      {!finished&&mode==='prepare'?<>
        <Text className="text-lg">Make sure the room is empty and safe.</Text>
        <Text>{current?.items.length??0} items. We need camera and location access to check the room.</Text>
        <Button size="lg" loading={busy} onPress={()=>void continuePhotos()}>{local?'Continue photos':'Room is empty, continue'}</Button>
      </>:null}
      {!finished&&(mode==='scan'||mode==='problem')?<>
        <Text className="text-lg">Scan the code for {current?.task.areaNameSnapshot??'this room'}.</Text>
        <Text>Connect to open or renew your photo window. Saved photos are kept.</Text>
        {mode==='problem'?<Button size="lg" onPress={()=>{setMode('scan');setMessage('');}}>Retry room and location check</Button>:null}
        <Button variant="outline" size="lg" onPress={()=>void Linking.openSettings()}>Open settings</Button>
        <Button variant="outline" size="lg" onPress={()=>void report('GPS_UNCERTAIN',true)}>Ask manager</Button>
      </>:null}
      {!finished&&(mode==='capture'||mode==='scan')&&!permission?.granted?<Button size="lg" onPress={()=>void (permission?.canAskAgain?requestPermission():Linking.openSettings())}>{permission?.canAskAgain?'Allow camera':'Open settings to allow camera'}</Button>:null}
      {!finished&&mode==='capture'&&heading?<><Text className="text-xl font-bold">{heading.title}</Text><Text className="text-lg">{heading.view}</Text><Text>{heading.hint}</Text></>:null}
      {!finished&&showCamera&&cameraActive?<View style={{height:340,borderRadius:12,overflow:'hidden'}}><CameraView ref={camera} key={cameraKey} style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} onCameraReady={()=>{ready.current=true;}} onMountError={()=>{setMessage('Camera could not open. Tap restart camera.');ready.current=false;}} barcodeScannerSettings={mode==='scan'?scanSettings:undefined} onBarcodeScanned={mode==='scan'?({data})=>{if(!actionInFlight.current)void scanned(data);}:undefined}/><View pointerEvents="none" style={{position:'absolute',inset:24,borderWidth:2,borderColor:'white',borderRadius:12}}/></View>:null}
      {!finished&&(['capture','scan'].includes(mode))?<><Button size="lg" variant="outline" onPress={()=>setTorch(t=>!t)}>{torch?'Turn torch off':'Turn torch on'}</Button><Button size="lg" variant="outline" onPress={()=>{ready.current=false;setCameraKey(k=>k+1);}}>Restart camera</Button></>:null}
      {!finished&&mode==='capture'&&!allowed?<Button size="lg" onPress={()=>setMode('scan')}>Scan room to renew photo window</Button>:null}
      {progress?<View className="gap-2 border-y border-border py-4"><Text>{progress.saved} SAVED · {progress.uploading} UPLOADING</Text><Text>{progress.checking} CHECKING · {progress.passed} PASSED</Text><Text>Saved photos have not passed checks yet.</Text></View>:null}
      {!finished&&local&&(reworkRequirements(local).length||failedContexts.length)?<><Text className="text-lg font-bold">{progress?.passed??0} views passed. {reworkRequirements(local).length+failedContexts.length} need another photo.</Text>{failedContexts.map(s=><Text key={s.id}>{s.contextKey==='ENTRANCE'?'Show the entrance marker':'Show the empty room layout'}. Keep people out of the photo.</Text>)}{reworkRequirements(local).map(({item,requirement})=><View key={requirement.id} className="gap-1"><Text className="font-bold">{item.nameSnapshot}</Text><Text>{requirement.currentAttempt?.instructions??(requirement.state==='CLEANING_REQUIRED'?'Clean the affected surface, then take another photo.':'Show the whole required surface and retake.')}</Text></View>)}<Button size="lg" loading={busy} onPress={()=>void rework()}>Retake affected views</Button></>:null}
      {!finished&&current?.task.verificationState==='NEEDS_REVIEW'?<><Text className="text-lg font-bold">Manager review</Text><Text>Your manager has been notified in Hygene Ops.</Text>{current.caseSummary?.issues.map((issue,index)=><Text key={index}>{issue.recommendedAction}</Text>)}</>:null}
      {!finished&&mode==='progress'?<><Text>Checks continue after upload. Passed views stay passed.</Text>{local&&slot?<Button size="lg" onPress={()=>void continuePhotos()}>Continue photos</Button>:null}<Button size="lg" variant="outline" onPress={()=>void action(async()=>{await syncEvidence();await load();})}>Retry upload and checks</Button></>:null}
      {rows.filter(r=>r.state==='AUTH_REQUIRED').length?<Text>Sign in with this same account to upload your saved photos.</Text>:null}
      {rows.filter(r=>r.state==='BLOCKED').map(r=><Text key={r.id}>{r.lastError??'Photo needs manager help. It is still saved on this phone.'}</Text>)}
      {!finished?<>{!['capture','scan'].includes(mode)?<Button variant="outline" size="lg" onPress={()=>void report('OCCUPIED')}>Room occupied, pause photos</Button>:null}<Button variant="outline" size="lg" onPress={()=>void report('OCCUPIED',true)}>Room occupied, ask manager</Button>{mode==='capture'?<><Button variant="outline" size="lg" onPress={()=>void report('DAMAGED',true)}>Item damaged</Button><Button variant="outline" size="lg" onPress={()=>void report('INACCESSIBLE',true)}>Cannot access item</Button><Button variant="outline" size="lg" onPress={()=>void report('IDENTITY_UNCERTAIN',true)}>Cannot find this item</Button></>:null}</>:null}
      <Button variant="outline" size="lg" onPress={()=>navigation.goBack()}>Back to tasks</Button>
    </ScrollView>
    {!finished&&['capture','scan'].includes(mode)?<View className="gap-2 border-t border-border bg-background p-4">
      {mode==='capture'&&allowed&&slot?<Button size="lg" loading={busy} onPress={()=>void capture()}>Take photo</Button>:null}
      <Button variant="outline" size="lg" onPress={()=>void report('OCCUPIED')}>Room occupied, pause photos</Button>
    </View>:null}
  </View>;
}
