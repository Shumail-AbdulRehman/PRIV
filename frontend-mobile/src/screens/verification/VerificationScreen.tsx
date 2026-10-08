import {spatialTracking,SpatialCamera,unavailableSample,type SpatialCapability} from '../../../modules/spatial-tracking';
import {beginSpatialWorld,breakSpatialContinuity,observationForCapture,spatialCaptureHint} from '../../verification/spatialSession';
import type {SpatialCheckpoint} from '../../verification/spatialTypes';
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
import { inspectLocalCategory } from '../../verification/localCategory';
import { captureClock, inspectStill } from '../../../modules/capture-quality';
import { getSession, queueRows, saveCapture, saveIssue, saveSession, queueAccount, removeRequest, unlockQueue, persistSpatialCheckpoint, updateQueue } from '../../verification/queue';
import { useAuth } from '../../auth/AuthContext';
import { installationId, openCaptureSession, resumeCapture, retakeSlots, verificationManifest } from '../../verification/api';
import { captureAllowed, mergeManifest, nextSlot } from '../../verification/policy';
import { captureProgress, qualityInstruction, reworkRequirements, slotInstruction, manifestForAllocatedSlots } from '../../verification/capturePolicy';
import { syncEvidence, subscribeEvidenceSync, retrySavedUploads } from '../../verification/sync';
import { VerificationProgress } from './VerificationProgress';
import { Icon } from '../../components/ui/icon';
import { formatClockTime } from '../../utils/format';
import type { LocalSession, Manifest, QueueRow } from '../../verification/types';
import type { RootStackParamList } from '../../types';
import { verificationErrorMessage } from '../../verification/errors';

type Props=NativeStackScreenProps<RootStackParamList,'Verification'>;
type Mode='prepare'|'scan'|'locating'|'capture'|'progress'|'problem';
const scanSettings={barcodeTypes:['qr' as const]};
const errorMessage=verificationErrorMessage;
export function VerificationScreen({route,navigation}:Props) {
  const {user}=useAuth();
  const taskId=route.params.taskId;
  const focused=useIsFocused();
  const [permission,requestPermission]=useCameraPermissions();
  const [local,setLocal]=useState<LocalSession|null>(null);
  const [manifest,setManifest]=useState<Manifest|null>(null);
  const [rows,setRows]=useState<QueueRow[]>([]);
  const [mode,setMode]=useState<Mode>('prepare');
  const [message,setMessage]=useState('');
  const [loadError,setLoadError]=useState('');
  const [storageError,setStorageError]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Please wait…');
  const [helpOpen,setHelpOpen]=useState(false);
  const [pendingCategory,setPendingCategory]=useState<null|{commit:()=>Promise<void>}>(null);
  const pendingCategoryRef=useRef<null|{commit:()=>Promise<void>}>(null);
  const reworkTargets=useRef<{requirementId:string;expectedGeneration:number}[]|undefined>(undefined);
  const latestLocal=useRef(local);latestLocal.current=local;
  const [lastUpdated,setLastUpdated]=useState<number|null>(null);
  const [refreshing,setRefreshing]=useState(false);
  const loading=useRef(false);
  const mounted=useRef(true);
  const mutation=useRef(0);
  const scope=queueAccount();
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;pendingCategoryRef.current=null;};},[]);
  const [torch,setTorch]=useState(false);
  const [online,setOnline]=useState(true);
  const [foreground,setForeground]=useState(AppState.currentState==='active');
  const [cameraActive,setCameraActive]=useState(false);
  const [cameraKey,setCameraKey]=useState(0);
  const camera=useRef<CameraView>(null);
  const [spatialMode,setSpatialMode]=useState<'idle'|'starting'|'active'|'fallback'>('idle');
  const [spatialHint,setSpatialHint]=useState('');
  const capability=useRef<SpatialCapability>('NO_SPATIAL');
  const spatialStartedAt=useRef(0);
  const spatialHadFrame=useRef(false);
  const checkpoint=useRef<SpatialCheckpoint|undefined>(undefined);
  const spatialSession=useRef<string|null>(null);
  const interruptSpatial=useCallback((reason:string)=>{
    ready.current=false;
    if(checkpoint.current&&spatialSession.current){
      checkpoint.current=breakSpatialContinuity(checkpoint.current,reason);
      void persistSpatialCheckpoint(taskId,spatialSession.current,checkpoint.current).catch(()=>{});
    }
    void spatialTracking.interrupt().catch(()=>{});setSpatialMode('idle');
  },[taskId]);

  const ready=useRef(false);
  const paused=useRef(false);
  const actionInFlight=useRef(false);
  const load=useCallback(async()=>{
    if(loading.current)return;
    loading.current=true;setRefreshing(true);
    const version=mutation.current;
    const valid=()=>mounted.current&&version===mutation.current&&queueAccount()===scope;
    try {
    let stored:LocalSession|null=null;
    try {
      stored=await getSession(taskId);
      const pending=await queueRows(taskId);
      captureClock();
      if(!valid())return;
      setStorageError(null);setRows(pending);setLocal(stored);if(stored)setManifest(stored.manifest);
    }catch(error){if(valid())setStorageError(errorMessage(error));}
    if(!valid())return;
    try {
      const current=await verificationManifest(taskId);if(!valid())return;setManifest(current);setLoadError('');setLastUpdated(Date.now());
      if(stored){const next=mergeManifest(stored,current);await saveSession(next);setLocal(next);}
    }catch(error){
      if(!valid())return;
      const status=(error as {response?:{status?:number}}).response?.status;
      if(stored&&[403,404,410].includes(status??0)){const revoked={...stored,paused:true,session:{...stored.session,state:'REVOKED'}};await saveSession(revoked);setLocal(revoked);setMessage('Your task access changed. Saved photos are kept. Ask your manager.');}
      else setLoadError(errorMessage(error));
    }
    }finally{loading.current=false;if(mounted.current)setRefreshing(false);}
  },[taskId,scope]);
  useEffect(()=>{let live=true;void load().then(()=>{if(live&&!actionInFlight.current)setMode(value=>value==='prepare'?'prepare':value);}).catch(error=>setMessage(errorMessage(error)));const timer=setInterval(()=>{if(focused&&AppState.currentState==='active'&&!actionInFlight.current)void load().catch(()=>{});},2500);return()=>{live=false;clearInterval(timer);};},[load,focused]);
  useEffect(()=>subscribeEvidenceSync(()=>{void queueRows(taskId).then(pending=>{if(mounted.current&&queueAccount()===scope)setRows(pending);}).catch(()=>{});}),[taskId,scope]);
  useEffect(()=>NetInfo.addEventListener(state=>setOnline(state.isConnected!==false&&state.isInternetReachable!==false)),[]);
  useEffect(()=>{const listener=AppState.addEventListener('change',state=>{setForeground(state==='active');if(state!=='active'){if(pendingCategoryRef.current)setMessage('This photo was not saved. Take it again when you continue.');pendingCategoryRef.current=null;setPendingCategory(null);interruptSpatial('BACKGROUND');}});return()=>listener.remove();},[interruptSpatial]);
  const slot=local?nextSlot(local,rows):undefined;
  let allowed=false;try{allowed=!!local&&captureAllowed(local,captureClock());}catch{/* Requires native build. */}
  const showCamera=!storageError&&focused&&foreground&&!paused.current&&permission?.granted&&(mode==='scan'||(mode==='capture'&&allowed&&!!slot&&(!local?.manifest.spatialCaptureEnabled||spatialMode==='fallback')));
  useEffect(()=>{ready.current=false;setCameraActive(false);if(!showCamera)return;const timer=setTimeout(()=>setCameraActive(true),350);return()=>clearTimeout(timer);},[showCamera]);
  useEffect(()=>{if(!cameraActive)return;const timer=setTimeout(()=>{if(!ready.current)setMessage('Camera has not opened. Tap Restart camera or check camera access in Settings.');},4000);return()=>clearTimeout(timer);},[cameraActive,cameraKey]);
  useEffect(()=>{
    if(!focused||!foreground||!permission?.granted||paused.current||storageError||!allowed||!slot||mode!=='capture'||!local?.manifest.spatialCaptureEnabled){interruptSpatial(!permission?.granted?'PERMISSION_CHANGED':'NAVIGATION');return;}
    let live=true;setSpatialMode('starting');
    const capturedLocal=local;
    void (async()=>{
      const elapsed=captureClock().elapsedMs-capturedLocal.anchorElapsedMs+Math.max(0,Date.parse(capturedLocal.session.serverTime)-Date.parse(capturedLocal.session.serverTimeAnchor??capturedLocal.session.serverTime));
      checkpoint.current=beginSpatialWorld(Crypto.randomUUID(),elapsed,capturedLocal.spatialCheckpoint??checkpoint.current,spatialSession.current&&spatialSession.current!==capturedLocal.session.id?'SESSION_RENEWED':'RESTART');
      spatialSession.current=capturedLocal.session.id;
      await persistSpatialCheckpoint(taskId,capturedLocal.session.id,checkpoint.current);
      if(!live)return;
      capability.current=await spatialTracking.isSupported();
      if(!live)return;
      if(capability.current==='NO_SPATIAL'){setSpatialMode('fallback');return;}
      try{await spatialTracking.start();if(live){spatialStartedAt.current=Date.now();spatialHadFrame.current=false;setSpatialMode('active');}else await spatialTracking.stop();}
      catch{checkpoint.current=breakSpatialContinuity(checkpoint.current,'NATIVE_FAILURE');await persistSpatialCheckpoint(taskId,capturedLocal.session.id,checkpoint.current);if(live)setSpatialMode('fallback');}
    })().catch(error=>{if(live){if(checkpoint.current){checkpoint.current=breakSpatialContinuity(checkpoint.current,'NATIVE_FAILURE');void persistSpatialCheckpoint(taskId,capturedLocal.session.id,checkpoint.current).catch(()=>{});}capability.current='NO_SPATIAL';setMessage(errorMessage(error));setSpatialMode('fallback');}});
    return()=>{live=false;interruptSpatial('NAVIGATION');};
  },[focused,foreground,permission?.granted,mode,local?.session.id,local?.manifest.spatialCaptureEnabled,cameraKey,taskId,interruptSpatial,allowed,!!slot,storageError]);
  useEffect(()=>{
    if(spatialMode!=='active')return;
    let live=true;
    const timer=setInterval(()=>{void spatialTracking.getTrackingState().then(sample=>{
      if(!live)return;ready.current=sample.nativeTimestampMs!==null;
      if(sample.tracking==='UNAVAILABLE'&&!spatialHadFrame.current&&Date.now()-spatialStartedAt.current<4000)return;
      if(sample.nativeTimestampMs!==null)spatialHadFrame.current=true;
      if(sample.continuity==='BROKEN'&&checkpoint.current){checkpoint.current=breakSpatialContinuity(checkpoint.current,'TRACKING_LOST');if(spatialSession.current)void persistSpatialCheckpoint(taskId,spatialSession.current,checkpoint.current).catch(()=>{});}
      if(sample.tracking==='UNAVAILABLE'){interruptSpatial('NATIVE_FAILURE');setSpatialMode('fallback');setSpatialHint("We couldn't confirm that this is a different item. Take a wider photo showing the surrounding area.");return;}
      setSpatialHint(spatialCaptureHint(checkpoint.current?.continuity==='BROKEN'?{...sample,continuity:'BROKEN'}:sample));
    }).catch(()=>{if(live){interruptSpatial('NATIVE_FAILURE');setSpatialMode('fallback');}});},1000);
    return()=>{live=false;clearInterval(timer);};
  },[spatialMode,interruptSpatial,taskId]);
  useEffect(()=>()=>{interruptSpatial('NAVIGATION');},[interruptSpatial]);
  useEffect(()=>{if(!focused||queueAccount()!==scope){if(pendingCategoryRef.current)setMessage('This photo was not saved. Take it again when you continue.');pendingCategoryRef.current=null;setPendingCategory(null);}},[focused,scope]);
  async function action(work:()=>Promise<void>,label='Please wait…'){if(actionInFlight.current)return;actionInFlight.current=true;mutation.current++;setBusy(true);setBusyLabel(label);setMessage('');try{await work();}catch(error){if(mounted.current){setMessage(errorMessage(error));setMode(value=>value==='locating'?'problem':value);}}finally{actionInFlight.current=false;if(mounted.current)setBusy(false);}}
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
  async function retryStorage(){await action(async()=>{
    if(!user)throw new Error('Sign in with the same account to open saved photos.');
    try {
      await unlockQueue(user);captureClock();setStorageError(null);
      await load();setMode('prepare');
    }catch(error){setStorageError(errorMessage(error));}
  });}
  async function scanned(data:string){await action(async()=>{
    setMode('locating');setBusyLabel('Checking your location…');
    const targets=reworkTargets.current;
    const session=await openCaptureSession(taskId,data,targets?undefined:local?.session.state==='REVOKED'?undefined:local?.session.id,setBusyLabel,targets);
    if(!mounted.current||queueAccount()!==scope)return;
    const anchor=captureClock();
    // Persist new session authority before an optional manifest refresh can fail.
    const previousManifest=manifest??local?.manifest;
    const current=previousManifest?manifestForAllocatedSlots(previousManifest,session.slots):undefined;
    if(!current)throw new Error('Reload the task before starting photos.');
    const next={session,manifest:current,anchorElapsedMs:anchor.elapsedMs,anchorBootId:anchor.bootId,savedAt:Date.now(),paused:paused.current};
    await saveSession(next);await removeRequest(`${targets?'rework':'session'}:${taskId}`);reworkTargets.current=undefined;setLocal(next);setManifest(current);setMessage(session.presenceStatus==='UNCERTAIN'?'Manager review needed. You can still take the required photos.':'');setMode(paused.current?'progress':'capture');
  });}
  async function capture(){await action(async()=>{
    setBusyLabel('Saving photo…');
    if(!local||!slot||!allowed||!ready.current||paused.current)throw new Error('Scan the room again to continue photos.');
    const scope=queueAccount();
    const clock=captureClock();
    const capturedAt=Date.now();
    const capturedScope=queueAccount();
    const spatialPhoto=spatialMode==='active'?await spatialTracking.captureSpatialObservation():null;
    const photo=spatialPhoto??await camera.current?.takePictureAsync({quality:.9,skipProcessing:false});
    if(!photo)throw new Error('Camera did not save a photo. Try again.');
    let resized:File|undefined;const temporary=new File(photo.uri);
    try {
      if(!mounted.current||AppState.currentState!=='active'||paused.current||scope!==queueAccount())return;
      if(!captureAllowed(local,clock))throw new Error('Photo window ended. Scan the room to renew before retaking.');
      const quality=await inspectStill(photo.uri);const correction=qualityInstruction(quality);if(correction){setMessage(correction);return;}
      const result=await manipulateAsync(photo.uri,[quality.width>=quality.height?{resize:{width:1800}}:{resize:{height:1800}}],{compress:.85,format:SaveFormat.JPEG});resized=new File(result.uri);
      const expected=local.manifest.items.find(item=>item.requirements.some(requirement=>requirement.id===slot.requirementId))?.typeSnapshot;
      setBusyLabel('Checking your photo…');
      const category=expected?await inspectLocalCategory(result.uri,expected):undefined;
      if(!mounted.current||AppState.currentState!=='active'||scope!==queueAccount()||paused.current)return;
      if(category?.outcome==='CLEAR_MISMATCH'){
        const name=({SINK:'sink',TOILET:'toilet',MIRROR:'mirror',FLOOR:'floor',BIN:'bin'} as Record<string,string>)[expected!]??'item';
        setMessage(`This doesn't look like a ${name}. Point the camera at the ${name} and try again.`);return;
      }
      const bytes=await resized.bytes();const hash=await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256,bytes);const sha256=Array.from(new Uint8Array(hash)).map(v=>v.toString(16).padStart(2,'0')).join('');
      if(!mounted.current||AppState.currentState!=='active'||paused.current||scope!==queueAccount())return;
      let spatialCapture:ReturnType<typeof observationForCapture>|undefined;
      if(local.manifest.spatialCaptureEnabled&&checkpoint.current){
        const previous=rows.map(r=>r.metadata.spatialEvidence).filter(o=>o?.sessionId===local.session.id).at(-1);
        spatialCapture=observationForCapture(checkpoint.current,spatialPhoto?.sample??unavailableSample(),{sessionId:local.session.id,requirementId:slot.requirementId??null,contextKey:slot.contextKey??null,elapsedMs:clock.elapsedMs-local.anchorElapsedMs+Math.max(0,Date.parse(local.session.serverTime)-Date.parse(local.session.serverTimeAnchor??local.session.serverTime)),capability:capability.current},previous);
      }
      const metadata={...(spatialCapture?{spatialEvidence:spatialCapture.evidence}:{}),taskId,sessionId:local.session.id,slotId:slot.id,nonce:slot.nonce,clientCaptureId:Crypto.randomUUID(),sha256,claimedCapturedAt:new Date(Date.parse(local.session.serverTime)+clock.elapsedMs-local.anchorElapsedMs).toISOString(),elapsedMs:clock.elapsedMs-local.anchorElapsedMs+Math.max(0,Date.parse(local.session.serverTime)-Date.parse(local.session.serverTimeAnchor??local.session.serverTime)),bootId:clock.bootId,deviceId:await installationId(),timings:{capturedAt},requirementId:slot.requirementId??null,viewKey:local.manifest.items.flatMap(item=>item.requirements).find(requirement=>requirement.id===slot.requirementId)?.viewKey,qualityResult:quality,...(category?{localCategoryResult:category}:{})};
      const commit=async()=>{
        const active=latestLocal.current;
        if(!mounted.current||AppState.currentState!=='active'||paused.current||queueAccount()!==capturedScope||active?.session.id!==local.session.id)throw new Error('Photo was not saved. Return to this room and take it again.');
        if(!captureAllowed(active,captureClock()))throw new Error('Photo window ended. Scan the room again before taking another photo.');
        setBusyLabel('Saving photo…');
        await saveCapture(metadata,bytes,spatialCapture?.checkpoint);
        if(spatialCapture)checkpoint.current=spatialCapture.checkpoint;
        // UI advancement is permitted only after the encrypted SQLite transaction commits.
        const pending=await queueRows(taskId);
        if(!mounted.current||queueAccount()!==capturedScope)return;
        setRows(pending);setMessage(slot.requirementId?'Saved. Move to the next item when its name appears.':'Saved on this phone.');
        if(__DEV__)console.info('verification.mobile.saved',{taskId,sessionId:local.session.id,clientCaptureId:metadata.clientCaptureId,capturedAt,durableSavedAt:Date.now(),categoryOutcome:category?.outcome??'CONTEXT'});
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);void syncEvidence().catch(()=>{});
        if(!nextSlot(local,pending)){interruptSpatial('NAVIGATION');setMode('progress');}
      };
      if(category?.outcome==='UNCERTAIN'){
        const choice={commit};pendingCategoryRef.current=choice;setPendingCategory(choice);
        setMessage("We couldn't confirm the item in this photo. Retake a clearer photo, or send this photo for the server to check.");
      }else await commit();
    }finally{if(resized?.exists)resized.delete();if(temporary.exists)temporary.delete();}
  });}
  async function report(reasonCode:string,requestHelp=false){
    if(actionInFlight.current)return;
    mutation.current++;setHelpOpen(false);
    const discardedUncertain=!!pendingCategoryRef.current;pendingCategoryRef.current=null;setPendingCategory(null);
    paused.current=true;interruptSpatial(reasonCode==='OCCUPIED'?'OCCUPIED':'NAVIGATION');setCameraActive(false);setMode('progress');
    try {
      if(local){const next={...local,paused:true};await saveSession(next);setLocal(next);}
      await saveIssue(taskId,{reasonCode,requestHelp,...(reasonCode!=='OCCUPIED'&&slot?.requirementId?{requirementId:slot.requirementId}:{})});
      setMessage(reasonCode==='OCCUPIED'?(discardedUncertain?'Photos paused. This photo was not saved. Take it again when the room is empty.':'Photos paused. Continue when the room is empty.'):(discardedUncertain?'Report saved. This photo was not saved. Your earlier saved photos are kept.':'Report saved. Your manager can review it when connected.'));void syncEvidence().catch(()=>{});
    }catch(error){setMessage(errorMessage(error));}
  }
  async function rework(){await action(async()=>{
    if(!local)return;
    const failed=reworkRequirements(local);
    const dirty=failed.filter(({requirement})=>requirement.state==='CLEANING_REQUIRED');
    if(dirty.length){
      reworkTargets.current=dirty.map(({requirement})=>({requirementId:requirement.id,expectedGeneration:requirement.decisionVersion}));
      paused.current=false;interruptSpatial('SESSION_RENEWED');setMode('scan');
      setMessage('Clean the listed items, then scan the area QR again. Passed photos are kept.');return;
    }
    if(!allowed){paused.current=false;setMode('scan');return;}
    const response=await retakeSlots(local.session.id,failed.map(({requirement})=>({requirementId:requirement.id,expectedGeneration:requirement.decisionVersion})),failedContexts.map(s=>({contextKey:s.contextKey!,expectedGeneration:s.generation})));
    const next={...local,paused:false,manifest:manifestForAllocatedSlots(local.manifest,response.slots),session:{...local.session,slots:[...local.session.slots.filter(s=>!response.slots.some(n=>n.requirementId?n.requirementId===s.requirementId:n.contextKey===s.contextKey)),...response.slots]}};
    await saveSession(next);paused.current=false;setLocal(next);setManifest(next.manifest);setMode('capture');
  });}
  const current=manifest??local?.manifest;
  const progress=local?captureProgress(local,rows):null;
  const failedContexts=local?(current?.sessions?.find(s=>s.id===local.session.id)?.slots??[]).filter((s,index,all)=>!!s.contextKey&&['RECAPTURE_REQUIRED','CLEANING_REQUIRED'].includes(s.state)&&!all.some(other=>other.contextKey===s.contextKey&&other.generation>s.generation)):[];
  const heading=local&&slot?slotInstruction(local,slot):null;
  const completion=current?.task.completionOutcome;
  const finished=completion==='VERIFIED_COMPLETE'||completion==='COMPLETED_WITH_EXCEPTIONS';
  useEffect(()=>{if(local&&!slot&&mode==='capture'&&!busy)setMode('progress');},[local?.session.id,!!slot,mode,busy]);
  const hasDirty=!!local&&reworkRequirements(local).some(({requirement})=>requirement.state==='CLEANING_REQUIRED');
  const hasRework=!!local&&(reworkRequirements(local).length>0||failedContexts.length>0);
  const hasPendingUpload=rows.some(row=>['SAVED','RETRY_WAIT','UPLOADING'].includes(row.state));
  const showProgress=!!current&&(mode==='progress'||finished||(mode==='prepare'&&!!local&&!slot));
  useEffect(()=>{
    if(!showProgress||queueAccount()!==scope)return;
    const shownAttemptIds=new Set([...(current?.items.flatMap(item=>item.requirements).filter(r=>['PASSED','RECAPTURE_REQUIRED','CLEANING_REQUIRED','REVIEW_REQUIRED','PRIVACY_HOLD','SERVICE_FAILURE','MANAGER_ACCEPTED','WAIVED'].includes(r.state)).map(r=>r.currentAttempt?.id)??[]),...(current?.sessions?.flatMap(s=>s.slots).filter(s=>['PASSED','RECAPTURE_REQUIRED','CLEANING_REQUIRED','REVIEW_REQUIRED','PRIVACY_HOLD','SERVICE_FAILURE'].includes(s.state)).map(s=>s.attemptId)??[])]);
    for(const row of rows.filter(r=>r.state==='FINAL'&&!r.metadata.timings?.resultShownAt&&!!r.attemptId&&shownAttemptIds.has(r.attemptId))){
      const resultShownAt=Date.now();
      void updateQueue(row.id,'FINAL',{attemptId:row.attemptId??undefined,timings:{resultShownAt}}).then(()=>{
        if(mounted.current&&queueAccount()===scope&&__DEV__)console.info('verification.mobile.display',{taskId,sessionId:row.sessionId,clientCaptureId:row.id,attemptId:row.attemptId,resultShownAt});
      }).catch(()=>{});
    }
  },[showProgress,current,rows,scope,taskId]);
  async function refreshProgress(){
    void retrySavedUploads(taskId).catch(error=>setMessage(errorMessage(error)));
    await load();
  }
  return <View className="flex-1 bg-background">
    <ScrollView contentContainerStyle={{padding:20,gap:20,paddingBottom:32}}>
      <View className="gap-2 border-b border-border pb-4">
        <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{finished?'Task result':'Finish cleaning'}</Text>
        <Text className="text-2xl font-bold">{current?.task.areaNameSnapshot??'Your assigned area'}</Text>
        {current?<Text className="text-sm text-muted-foreground">{current.task.title} · Due {formatClockTime(current.task.shiftEnd,current.task.location?.timezone)}</Text>:null}
        <View className="mt-2 flex-row gap-4">
          {['Confirm room','Take photos','See results'].map((step,index)=><Text key={step} className={`text-xs font-semibold ${index===(showProgress?2:mode==='capture'?1:0)?'text-primary':'text-muted-foreground'}`}>{index+1}  {step}</Text>)}
        </View>
      </View>
      {!online?<View className="rounded-xl bg-muted p-4"><Text className="text-base font-semibold">You're offline</Text><Text className="mt-1 text-sm leading-5">Saved photos stay on this phone. Uploads resume when you reconnect and open the app.</Text></View>:null}
      {message?<View className="rounded-xl bg-accent p-4"><Text accessibilityLiveRegion="polite" className="text-base leading-6">{message}</Text></View>:null}
      {loadError?<View className="gap-2 rounded-xl border border-border p-4"><Text className="font-semibold">Couldn't refresh results</Text><Text className="text-sm leading-5">{loadError}</Text><Button variant="outline" loading={refreshing} onPress={()=>void load()}>Refresh results</Button></View>:null}
      {!finished&&storageError?<View className="gap-4">
        <Text className="text-xl font-bold">Saved photos couldn't open</Text>
        <Text className="text-base leading-6">{storageError}</Text>
        <Text className="text-sm text-muted-foreground">Keep the app data to preserve your photos. Retry, or ask your manager for help.</Text>
        <Button size="lg" loading={busy} onPress={()=>void retryStorage()}>Retry photo storage</Button>
      </View>:null}
      {!finished&&!storageError&&!showProgress&&mode==='prepare'?<>
        <View className="gap-3 rounded-2xl bg-accent p-5">
          <Icon name="Camera" size={30} className="text-primary"/>
          <Text className="text-2xl font-bold text-accent-foreground">{local?'Continue your photos':'Ready to finish?'}</Text>
          <Text className="text-base leading-6 text-accent-foreground">Make sure the room is empty and safe, including mirror reflections.</Text>
          <Text className="text-sm font-semibold text-accent-foreground">{current?`${current.items.length} items · ${local?.session.requiredContextKeys?.length??local?.session.slots.filter(s=>s.contextKey).length??1} room photo${(local?.session.requiredContextKeys?.length??1)>1?'s':''}`:'Loading required inventory…'}</Text>
        </View>
        <Text className="text-base leading-6 text-muted-foreground">{local?'Your saved photos are kept. Continue with the remaining views.':'Scan the area QR again, confirm your location, then follow the photo guide.'}</Text>
        <Button size="lg" iconRight="ArrowRight" loading={busy} disabled={!current&&!local} onPress={()=>void continuePhotos()}>{local?'Continue photos':'Room is empty, continue'}</Button>
        {!current?<Button variant="outline" loading={refreshing} onPress={()=>void load()}>Retry loading task</Button>:null}
      </>:null}
      {!finished&&!storageError&&mode==='locating'?<View className="gap-4 rounded-2xl bg-accent p-5">
        <Icon name="MapPin" size={32} className="text-primary"/>
        <Text className="text-xl font-bold" accessibilityLiveRegion="polite">{busyLabel}</Text>
        <Text className="text-base leading-6 text-muted-foreground">Keep location turned on. Finding your position can take up to 20 seconds; opening the photo session may take a little longer.</Text>
        <Button size="lg" loading>Confirming room</Button>
      </View>:null}
      {!finished&&!storageError&&mode==='problem'?<View className="gap-4">
        <Text className="text-xl font-bold">Room check needs another try</Text>
        <Text className="text-base leading-6 text-muted-foreground">Check your camera and precise location permissions. Your saved photos are kept.</Text>
        <Button size="lg" disabled={busy} onPress={()=>{paused.current=false;setMode('scan');setMessage('');}}>Retry room and location check</Button>
        <Button variant="outline" onPress={()=>void Linking.openSettings()}>Open settings</Button>
      </View>:null}
      {!finished&&!storageError&&mode==='scan'?<View className="gap-2">
        <Text className="text-xl font-bold">Scan the area QR</Text>
        <Text className="text-base leading-6 text-muted-foreground">Point your camera at the marker for {current?.task.areaNameSnapshot??'this room'}. It scans automatically.</Text>
      </View>:null}
      {!finished&&!storageError&&(mode==='capture'||mode==='scan')&&!permission?.granted?<Button size="lg" onPress={()=>void (permission?.canAskAgain?requestPermission():Linking.openSettings())}>{permission?.canAskAgain?'Allow camera':'Open camera settings'}</Button>:null}
      {!finished&&!storageError&&mode==='capture'&&heading?<View className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-widest text-primary">Next photo</Text>
        <Text className="text-2xl font-bold">{heading.title}</Text>
        <Text className="text-base leading-6">{heading.view}</Text>
        {heading.progress?<Text className="text-sm font-semibold text-primary">{heading.progress}</Text>:null}
        {heading.hint?<Text className="text-sm leading-5 text-muted-foreground">{heading.hint}</Text>:null}
      </View>:null}
      {!finished&&!storageError&&focused&&foreground&&!paused.current&&spatialMode==='active'?<View style={{height:340,borderRadius:20,overflow:'hidden'}}><SpatialCamera style={StyleSheet.absoluteFill}/><View pointerEvents="none" style={{position:'absolute',left:'45%',top:'45%',width:'10%',height:'10%',borderWidth:2,borderColor:'white'}}/></View>:null}
      {!finished&&!storageError&&showCamera&&cameraActive?<View style={{height:320,borderRadius:20,overflow:'hidden'}}><CameraView ref={camera} key={cameraKey} style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} onCameraReady={()=>{ready.current=true;}} onMountError={()=>{setMessage('Camera could not open. Tap restart camera.');ready.current=false;}} barcodeScannerSettings={mode==='scan'?scanSettings:undefined} onBarcodeScanned={mode==='scan'?({data})=>{if(mounted.current&&AppState.currentState==='active'&&focused&&foreground&&ready.current&&!paused.current&&!actionInFlight.current)void scanned(data);}:undefined}/><View pointerEvents="none" style={{position:'absolute',inset:32,borderWidth:2,borderColor:'white',borderRadius:16}}/></View>:null}
      {!finished&&spatialMode!=='active'&&['capture','scan'].includes(mode)&&permission?.granted?<View className="flex-row gap-3"><Button className="flex-1" variant="outline" iconLeft="Flashlight" onPress={()=>setTorch(t=>!t)}>{torch?'Torch off':'Torch on'}</Button><Button className="flex-1" variant="ghost" onPress={()=>{interruptSpatial('CAMERA_RESTART');ready.current=false;setCameraKey(k=>k+1);}}>Restart camera</Button></View>:null}
      {spatialHint&&mode==='capture'?<Text accessibilityLiveRegion="polite" className="text-sm leading-5 text-muted-foreground">{spatialHint}</Text>:null}
      {local?.session.presenceStatus==='UNCERTAIN'&&mode==='capture'?<Text className="text-sm text-muted-foreground">You can continue taking photos. Your manager will review the room location.</Text>:null}
      {!finished&&current?.deadlineWarning?<Text className="text-sm text-warning">Photo window ends in {Math.ceil(current.deadlineWarning.remainingSeconds/60)} minutes. Saved photos are kept.</Text>:null}
      {!finished&&!storageError&&mode==='capture'&&!allowed?<Button size="lg" onPress={()=>{paused.current=false;setMode('scan');}}>Scan room to renew photo window</Button>:null}
      {showProgress&&current?<>
        <VerificationProgress manifest={current} local={local} rows={rows} online={online} lastUpdated={lastUpdated}/>
        {!finished?<Button size="lg" loading={refreshing} variant="outline" onPress={()=>void refreshProgress()}>{hasPendingUpload?'Retry saved uploads':'Refresh results'}</Button>:null}
        {!finished?<Text className="text-center text-sm leading-5 text-muted-foreground">You can return to your tasks. Keep the app open while photos are uploading.</Text>:null}
      </>:null}
      {!finished&&mode==='capture'&&progress?<Text className="text-center text-sm text-muted-foreground">{rows.length} photos saved · Uploads run while you continue</Text>:null}
      {!finished&&!storageError&&mode!=='locating'?<>
        <Button variant="ghost" disabled={busy} accessibilityState={{expanded:helpOpen}} onPress={()=>setHelpOpen(value=>!value)}>{helpOpen?'Close help':'Having trouble?'}</Button>
        {helpOpen?<View className="gap-3 rounded-2xl border border-border p-4">
          <Text className="text-base font-semibold">Get help with this task</Text>
          <Text className="text-sm leading-5 text-muted-foreground">Pause if someone enters the room. Ask your manager when you cannot continue.</Text>
          <Button variant="outline" onPress={()=>void report('OCCUPIED')}>Room occupied, pause photos</Button>
          <Button variant="outline" onPress={()=>void report('OCCUPIED',true)}>Room occupied, ask manager</Button>
          <Button variant="outline" onPress={()=>void report('GPS_UNCERTAIN',true)}>Location problem, ask manager</Button>
          {mode==='capture'?<><Button variant="outline" onPress={()=>void report('DAMAGED',true)}>Item damaged</Button><Button variant="outline" onPress={()=>void report('INACCESSIBLE',true)}>Cannot access item</Button><Button variant="outline" onPress={()=>void report('IDENTITY_UNCERTAIN',true)}>Cannot find this item</Button></>:null}
        </View>:null}
      </>:null}
      <Button variant={finished?'default':'ghost'} size="lg" onPress={()=>navigation.goBack()}>Back to tasks</Button>
      {__DEV__&&mode==='prepare'?<Button variant="ghost" onPress={()=>navigation.navigate('SpatialDiagnostic')}>Open spatial diagnostic</Button>:null}
    </ScrollView>
    {!finished&&!storageError&&showProgress&&(hasRework||!!slot)?<View className="border-t border-border bg-background p-4"><Button size="lg" loading={busy} iconLeft="Camera" onPress={()=>void (hasRework?rework():continuePhotos())}>{hasDirty?'Re-clean items, then scan QR':hasRework?'Retake affected views':'Continue photos'}</Button></View>:null}
    {!finished&&!storageError&&['capture','scan'].includes(mode)?<View className="gap-2 border-t border-border bg-background p-4">
      {mode==='capture'&&pendingCategory?<View className="gap-3"><Button size="lg" disabled={busy} onPress={()=>{pendingCategoryRef.current=null;setPendingCategory(null);setMessage('Point the camera at the whole item and try again.');}}>Retake photo</Button><Button variant="outline" loading={busy} onPress={()=>void action(async()=>{const choice=pendingCategoryRef.current;pendingCategoryRef.current=null;setPendingCategory(null);if(choice)await choice.commit();})}>Send for checking</Button></View>:null}
      {mode==='capture'&&!pendingCategory&&allowed&&slot?<Button size="lg" iconLeft="Camera" loading={busy} onPress={()=>void capture()}>{busy?busyLabel:'Take photo'}</Button>:null}
      <Button variant="ghost" disabled={busy} onPress={()=>void report('OCCUPIED')}>Room occupied — pause</Button>
    </View>:null}
  </View>;
}
