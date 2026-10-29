import { photoAuthority, photoResultAction, reconcileSubmission } from "../../launch/recoveryPolicy";
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Image, Linking, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { File } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as Crypto from 'expo-crypto';
import NetInfo from '@react-native-community/netinfo';
import { captureClock, inspectStill } from '../../../modules/capture-quality';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage } from '../../i18n/LanguageProvider';
import { LanguageChoice } from '../../components/LanguageChoice';
import { PhotoGuide } from '../../components/PhotoGuide';
import { CaptureFrame, PhotoCaptureControls, PhotoStepProgress } from '../../components/PhotoCaptureControls';
import { Button } from '../../components/ui/button';
import { Text } from '../../components/ui/text';
import { captureAccount } from '../../verification/captureAccount';
import { activatePhoto, finishSubmission, findUploadedPhoto, installationId, openCaptureSession, uploadPhoto, verificationManifest } from '../../verification/api';
import { captureAllowed, checkedPhotoState, mergeManifest, nextSlot, objectSecondsRemaining } from '../../verification/policy';
import { qualityInstruction, reworkRequirements, slotInstruction } from '../../verification/capturePolicy';
import { requiredPhotoIds } from '../../verification/feedback';
import { VerificationProgress } from './VerificationProgress';
import { staffQueryKeys } from '../../queries/staff';
import type { CaptureMetadata, LocalSession, Manifest } from '../../verification/types';
import type { RootStackParamList } from '../../types';

type Props=NativeStackScreenProps<RootStackParamList,'Verification'>;
type Mode='prepare'|'scan'|'locating'|'capture'|'progress';
type PendingPhoto={metadata:CaptureMetadata;uri:string};
const scanSettings={barcodeTypes:['qr' as const]};
const messageFor=(error:unknown)=>error instanceof Error?error.message:'Could not finish. Please try again.';
const removeTemporary=(uri:string)=>{try{const file=new File(uri);if(file.exists)file.delete();}catch{/* Do not hide the upload result. */}};

export function VerificationScreen({route,navigation}:Props) {
  const {user}=useAuth(),{t,language}=useLanguage();
  const taskId=route.params.taskId,scope=user?`${user.companyId}_${user.id}`:null;
  const queryClient=useQueryClient(),insets=useSafeAreaInsets(),focused=useIsFocused();
  const [permission,requestPermission,getPermission]=useCameraPermissions();
  const [manifest,setManifest]=useState<Manifest|null>(null),[local,setLocal]=useState<LocalSession|null>(null);
  const [mode,setMode]=useState<Mode>('prepare'),[pending,setPending]=useState<PendingPhoto|null>(null);
  const pendingRef=useRef<PendingPhoto|null>(null);
  const [busy,setBusy]=useState(false),[busyLabel,setBusyLabel]=useState('Please wait…');
  const [message,setMessage]=useState(''),[refreshing,setRefreshing]=useState(false);
  const [online,setOnline]=useState(true),[foreground,setForeground]=useState(AppState.currentState==='active');
  const [cameraReady,setCameraReady]=useState(false),[cameraKey,setCameraKey]=useState(0),[torch,setTorch]=useState(false);
  const [lastUpdated,setLastUpdated]=useState<number|null>(null),[seconds,setSeconds]=useState<number|null>(null);
  const camera=useRef<CameraView>(null),mounted=useRef(true),inFlight=useRef(false),loading=useRef(false),activation=useRef<string|null>(null);
  const {width,height}=useWindowDimensions();
  const cameraHeight=Math.max(220,Math.min(420,(width-40)*1.25,height*.48));
  const valid=()=>mounted.current&&scope!==null&&captureAccount()===scope;
  const rememberPending=(photo:PendingPhoto|null)=>{pendingRef.current=photo;if(mounted.current)setPending(photo);};
  const authority=photoAuthority(manifest);
  const finished=!!manifest&&(!!manifest.staffSubmittedAt||manifest.task.status==='COMPLETED');
  const required=manifest?requiredPhotoIds(manifest):new Set<string>();
  const mandatory=manifest?.items.flatMap(i=>i.requirements).filter(r=>required.has(r.id))??[];
  const canSubmit=!pending&&!finished&&mandatory.length>0&&mandatory.every(r=>checkedPhotoState(r.state)&&(r.state==='WAIVED'||!!r.currentAttempt));
  const dirty=mandatory.some(r=>r.state==='CLEANING_REQUIRED'),retake=mandatory.some(r=>r.state==='RECAPTURE_REQUIRED');
  const slot=local?nextSlot(local,[]):undefined,heading=local&&slot?slotInstruction(local,slot):null;
  const slotActive=!!slot&&(!local?.session.sequentialChecks||!!slot.activatedAt);
  let allowed=false;try{allowed=!!local&&captureAllowed(local,captureClock())&&seconds!==0;}catch{/* Scan QR to establish the native clock. */}
  const load=useCallback(async()=>{
    if(loading.current)return null;loading.current=true;setRefreshing(true);
    try{
      const current=await verificationManifest(taskId);
      if(!mounted.current||captureAccount()!==scope)return null;
      setManifest(current);setLastUpdated(Date.now());setLocal(previous=>previous?mergeManifest(previous,current):null);return current;
    }finally{loading.current=false;if(mounted.current)setRefreshing(false);}
  },[taskId,scope]);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;if(pendingRef.current)removeTemporary(pendingRef.current.uri);pendingRef.current=null;};},[]);
  useEffect(()=>{if(focused)void load().catch(error=>{if(mounted.current)setMessage(messageFor(error));});},[load,focused]);
  useEffect(()=>NetInfo.addEventListener(state=>setOnline(state.isConnected!==false&&state.isInternetReachable!==false)),[]);
  useEffect(()=>{
    const listener=AppState.addEventListener('change',state=>{
      setForeground(state==='active');setCameraReady(false);
      if(state==='active'){
        // Settings can change OS permission, but never renew task authority.
        void Promise.all([getPermission(),load()]).catch(()=>{
          if(valid()){setMode('prepare');setMessage('Camera or task access could not be checked. Refresh results and try again.');}
        });
      }
    });
    return()=>listener.remove();
  },[getPermission,load]);
  useEffect(()=>{setCameraReady(false);},[mode,focused,cameraKey]);
  useEffect(()=>{
    const tick=()=>{try{setSeconds(local?objectSecondsRemaining(local,slot,captureClock()):null);}catch{setSeconds(0);}};
    tick();const timer=setInterval(tick,1000);return()=>clearInterval(timer);
  },[local,slot?.id,slot?.activatedAt]);
  useEffect(()=>{
    if(!authority.capture||!local||!slot||slotActive||pending||busy||mode!=='capture'||activation.current===slot.id)return;
    activation.current=slot.id;let live=true;
    void activatePhoto(local.session.id,slot.id).then(response=>{
      if(!live||!valid())return;
      setLocal(previous=>previous&&previous.session.id===local.session.id?{...previous,session:{...previous.session,...response,serverTime:previous.session.serverTime}}:previous);
    }).catch(error=>{if(live&&valid()){setMessage(messageFor(error));setMode('progress');}}).finally(()=>{activation.current=null;});
    return()=>{live=false;};
  },[local?.session.id,slot?.id,slotActive,pending,busy,mode,authority.capture]);
  async function action(work:()=>Promise<void>,label='Please wait…') {
    if(inFlight.current)return;inFlight.current=true;setBusy(true);setBusyLabel(label);setMessage('');
    try{await work();}catch(error){if(valid())setMessage(messageFor(error));}
    finally{inFlight.current=false;if(mounted.current)setBusy(false);}
  }
  async function beginPhotos(){await action(async()=>{
    const current=await load();
    if(!photoAuthority(current).capture)throw new Error('Task photos are unavailable. Your received results are kept. Ask your manager for help.');
    if(Platform.OS==='web')throw new Error('Open the installed staff app to scan the task QR and take photos.');
    if(!online)throw new Error('Internet needed to continue. Reconnect, then scan this task’s QR code.');
    const currentPermission=await getPermission();
    if(!valid())return;
    if(!currentPermission.granted&&currentPermission.canAskAgain===false){
      try{await Linking.openSettings();}catch{throw new Error('Open this app in your phone settings.');}
      return;
    }
    const result=currentPermission.granted?currentPermission:await requestPermission();
    if(!result.granted)throw new Error('Allow camera access in Settings to take task photos.');
    setMode('scan');
  });}
  async function scanned(qr:string){await action(async()=>{
    if(!photoAuthority(await load()).capture)throw new Error('Task photos are unavailable. Your received results are kept. Ask your manager for help.');
    if(!online)throw new Error('Internet needed to confirm the room. Reconnect, then scan this task’s QR code.');
    setMode('locating');
    const targets=manifest?.items.flatMap(i=>i.requirements).filter(r=>r.state==='CLEANING_REQUIRED').map(r=>({requirementId:r.id,expectedGeneration:r.decisionVersion}));
    const session=await openCaptureSession(taskId,qr,local?.session.id??manifest?.sessions?.find(s=>s.state==='ACTIVE'||s.state==='PAUSED')?.id,label=>{if(valid())setBusyLabel(label);},targets?.length?targets:undefined);
    const current=await verificationManifest(taskId),clock=captureClock();
    if(!valid())return;
    if(pendingRef.current){removeTemporary(pendingRef.current.uri);rememberPending(null);}
    setLocal({session,manifest:current,anchorElapsedMs:clock.elapsedMs,anchorBootId:clock.bootId,savedAt:Date.now(),paused:false});
    setManifest(current);setLastUpdated(Date.now());setMode('capture');
  });if(mounted.current)setMode(previous=>previous==='locating'?'scan':previous);}
  async function refreshAfterUpload(){
    // The manifest supplies current results and session state. Uploading does
    // not pause the session; the next activation returns fresh slot authority.
    await load();
    if(valid())setMode('progress');
  }
  async function sendPhoto(photo:PendingPhoto,checkFirst=false){
    if(!scope||!valid())throw new Error('Sign in again to upload photos.');
    if(!online)throw new Error('Upload failed. Reconnect, then tap Upload again.');
    setBusyLabel('Uploading and checking photo…');
    if(checkFirst){
      const existing=await findUploadedPhoto(photo.metadata.sessionId,photo.metadata.clientCaptureId,scope);
      if(photoResultAction(existing?.state)==='received'){
        removeTemporary(photo.uri);rememberPending(null);await refreshAfterUpload();return;
      }
      if(photoResultAction(existing?.state)==='checking'){
        setMessage('This photo is still being checked. Tap Check result shortly.');return;
      }
    }
    // Same-capture result lookup remains available even when new processing is unavailable.
    if(!photoAuthority(await load()).upload)throw new Error('Photo upload is unavailable. Check the result before retrying. Your received photos are kept.');
    await uploadPhoto(photo.metadata,photo.uri,scope);
    if(!valid()){removeTemporary(photo.uri);return;}
    removeTemporary(photo.uri);rememberPending(null);await refreshAfterUpload();
  }
  async function capture(){await action(async()=>{
    if(!authority.capture||!local||!slot||!slotActive||!allowed||!cameraReady||!focused||!foreground||pending||!scope)throw new Error('Scan this task’s QR code again to continue taking photos.');
    if(!online)throw new Error('Internet needed to upload. Reconnect before taking the photo.');
    const session=local,clock=captureClock();
    const photo=await camera.current?.takePictureAsync({quality:.9,skipProcessing:false});
    if(!photo)throw new Error('Camera did not save a photo. Try again.');
    let resized:string|undefined;
    try{
      if(!valid())return;
      const quality=await inspectStill(photo.uri),correction=qualityInstruction(quality);
      if(correction)throw new Error(correction);
      const result=await manipulateAsync(photo.uri,[quality.width>=quality.height?{resize:{width:1800}}:{resize:{height:1800}}],{compress:.85,format:SaveFormat.JPEG});resized=result.uri;
      const bytes=await new File(resized).bytes(),hash=await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256,bytes);
      if(!valid()||!captureAllowed(session,captureClock()))throw new Error('Photo window ended. Scan this task’s QR code again before taking another photo.');
      const metadata:CaptureMetadata={taskId,sessionId:session.session.id,slotId:slot.id,nonce:slot.nonce,clientCaptureId:Crypto.randomUUID(),sha256:Array.from(new Uint8Array(hash)).map(v=>v.toString(16).padStart(2,'0')).join(''),claimedCapturedAt:new Date(Date.parse(session.session.serverTime)+clock.elapsedMs-session.anchorElapsedMs).toISOString(),elapsedMs:clock.elapsedMs-session.anchorElapsedMs+Math.max(0,Date.parse(session.session.serverTime)-Date.parse(session.session.serverTimeAnchor??session.session.serverTime)),bootId:clock.bootId,deviceId:await installationId(),requirementId:slot.requirementId,qualityResult:quality};
      const next={metadata,uri:resized};rememberPending(next);resized=undefined;setMode('progress');
      try{await sendPhoto(next);}catch(error){if(valid())setMessage(`${t(messageFor(error))} ${t('Upload again to continue. If you close this screen, take a new photo.')}`);}
    }finally{removeTemporary(photo.uri);if(resized)removeTemporary(resized);}
  },'Preparing photo…');}
  async function checkResult(){await action(async()=>{
    if(!pending||!scope)return;
    const result=await findUploadedPhoto(pending.metadata.sessionId,pending.metadata.clientCaptureId,scope);
    if(photoResultAction(result?.state)==='received'){
      removeTemporary(pending.uri);rememberPending(null);await refreshAfterUpload();
    }else setMessage(result?.state==='SERVICE_FAILURE'?'Photo checking could not finish. Check availability before retrying this same photo.':result&&result.state!=='RESERVED'?'This photo is still being checked. Check again shortly.':'The photo has not finished uploading. Tap Upload again.');
  },'Checking photo result…');}
  async function submit(){await action(async()=>{await reconcileSubmission(()=>verificationManifest(taskId),()=>finishSubmission(taskId));await load();await queryClient.invalidateQueries({queryKey:staffQueryKeys.all});},'Submitting work…');}
  const cameraVisible=authority.capture&&!finished&&!pending&&focused&&foreground&&permission?.granted&&['scan','capture'].includes(mode);
  return <View style={{flex:1}} className="bg-background">
    <ScrollView contentContainerStyle={{padding:20,gap:20,paddingBottom:32}}>
      <LanguageChoice/>
      <View style={{gap:8}}><Text accessibilityRole="header" className="text-xl font-bold">{finished?'Work submitted':'Finish cleaning'}</Text><Text className="text-2xl font-bold">{manifest?.task.areaNameSnapshot??'Your assigned area'}</Text></View>
      {!online?<Text accessibilityLiveRegion="polite">Internet needed to upload. Reconnect, then tap Upload again.</Text>:null}
      {message?<View className="rounded-xl bg-accent p-4"><Text accessibilityLiveRegion="polite">{message}</Text></View>:null}
      {!manifest?<Button loading={refreshing} onPress={()=>void action(async()=>{await load();})}>Load task photos</Button>:null}
      {!finished&&!authority.capture?<View className="gap-3 rounded-xl border border-border p-5"><Text className="text-xl font-bold">Task photos are unavailable</Text><Text className="text-base leading-7">{authority.qualified?'Photo authority ended. Refresh results and ask your manager about the task window.':'Your received results are kept. Ask your manager for help. Refresh results to check availability.'}</Text></View>:null}
      {finished&&manifest?.staffSubmittedAt?<View className="gap-2 rounded-xl bg-accent p-5"><Text className="text-xl font-bold">Submission receipt</Text><Text>{t('Task {id}',{id:taskId})}</Text><Text>{new Date(manifest.staffSubmittedAt).toLocaleString(language==='ur'?'ur-PK':'en-PK',{timeZone:manifest.task.location?.timezone})}</Text>{manifest.task.location?.timezone?<Text>{manifest.task.location.timezone}</Text>:null}<Text>Your work has been submitted. Your manager may still need to review it.</Text></View>:null}
      {!finished&&authority.capture&&mode==='prepare'?<View style={{gap:16}}><Text className="text-xl font-bold">Ready to finish?</Text><Text>Complete every required photo. Scan the task QR to begin.</Text><Text>Keep people out of the photos, including mirror reflections.</Text><Button size="lg" disabled={!manifest||!online} onPress={()=>void beginPhotos()}>Scan QR to take photos</Button></View>:null}
      {mode==='locating'?<Text accessibilityLiveRegion="polite">{busyLabel}</Text>:null}
      {mode==='scan'?<Text className="text-xl font-bold">Scan the task QR</Text>:null}
      {mode==='capture'&&heading?<View style={{gap:8}}><PhotoStepProgress current={Math.max(1,(local?.session.slots.findIndex(s=>s.id===slot?.id)??0)+1)} total={Math.max(1,local?.session.slots.length??1)}/><Text className="text-3xl font-bold">{heading.title}</Text><PhotoGuide fixture={local?.manifest.items.find(i=>i.requirements.some(r=>r.id===slot?.requirementId))?.typeSnapshot} instruction={heading.view}/>{heading.hint?<Text>{heading.hint}</Text>:null}</View>:null}
      {cameraVisible?<View style={{width:'100%',height:cameraHeight,flexShrink:0,borderRadius:24,overflow:'hidden',backgroundColor:'#DDE5DE'}}><CameraView key={cameraKey} ref={camera} style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} onCameraReady={()=>setCameraReady(true)} onMountError={()=>{setCameraReady(false);setMessage('Camera could not open. Tap Restart camera.');}} barcodeScannerSettings={mode==='scan'?scanSettings:undefined} onBarcodeScanned={mode==='scan'?({data})=>{if(!inFlight.current&&focused&&foreground&&online)void scanned(data);}:undefined}/><CaptureFrame/></View>:null}
      {cameraVisible?<View style={{flexDirection:'row',gap:12}}><Button className="flex-1" variant="outline" onPress={()=>setTorch(value=>!value)}>{torch?'Torch off':'Torch on'}</Button><Button className="flex-1" variant="ghost" onPress={()=>setCameraKey(value=>value+1)}>Restart camera</Button></View>:null}
      {!finished&&authority.capture&&!permission?.granted?<Button variant="outline" loading={busy} disabled={!online} onPress={()=>void beginPhotos()}>{permission?.canAskAgain===false?'Open camera settings':'Allow camera'}</Button>:null}
      {mode==='capture'&&seconds!==null?<Text className="text-xl font-bold">{t('Time remaining: {time}',{time:`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`})}</Text>:null}
      {pending?<View style={{gap:12}}><Text className="text-xl font-bold">{busy?'Uploading and checking photo…':'Upload this photo again'}</Text><Image source={{uri:pending.uri}} style={{height:180,width:'100%',borderRadius:16}} resizeMode="contain"/><Text>This picture is temporary. If you close this screen, take it again.</Text><Button size="lg" loading={busy} disabled={!online||!authority.upload} onPress={()=>void action(async()=>{if(pending)await sendPhoto(pending,true);})}>Upload again</Button><Button variant="outline" disabled={busy||!online} onPress={()=>void checkResult()}>Check result</Button><Button variant="ghost" disabled={busy||!online||!authority.capture} onPress={()=>void beginPhotos()}>Scan task QR and take a new photo</Button></View>:null}
      {manifest&&(mode==='progress'||!authority.capture||finished)&&!pending?<VerificationProgress manifest={manifest} local={local} rows={[]} online={online} lastUpdated={lastUpdated}/>:null}
      {!finished&&authority.capture&&mode==='progress'&&!pending&&!canSubmit?<Button size="lg" disabled={!online||busy} onPress={()=>{if(slot&&allowed&&!dirty&&!retake)setMode('capture');else void beginPhotos();}}>{dirty?'Clean items, then scan QR':retake?'Scan task QR to retake photos':slot&&allowed?'Continue photos':'Scan task QR to continue photos'}</Button>:null}
      {!finished&&authority.capture&&mode==='capture'&&(!slot||!allowed)&&!busy?<Button size="lg" onPress={()=>void (slot?beginPhotos():action(async()=>{await load();setMode('progress');}))}>{slot?'Scan task QR to renew photo window':'View photo results'}</Button>:null}
      <Button variant="outline" loading={refreshing} disabled={busy||!online} onPress={()=>void action(async()=>{await load();})}>Refresh results</Button>
      <Button variant="ghost" disabled={busy} onPress={()=>navigation.goBack()}>Back to tasks</Button>
    </ScrollView>
    {canSubmit?<View style={{padding:16,paddingBottom:16+insets.bottom,flexShrink:0}} className="border-t border-border"><Text>Your work is ready to submit. Manager review may still be needed.</Text><Button size="lg" loading={busy} disabled={!online} onPress={()=>void submit()}>Submit work</Button></View>:null}
    {!finished&&authority.capture&&mode==='capture'&&slot&&allowed&&!pending?<View style={{padding:16,paddingBottom:16+insets.bottom,flexShrink:0}} className="border-t border-border"><PhotoCaptureControls disabled={!cameraReady||!slotActive||!online} busy={busy} label={busy?busyLabel:'Take photo'} onCapture={()=>void capture()}/></View>:null}
  </View>;
}
