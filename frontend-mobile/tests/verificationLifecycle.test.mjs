import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__DEV__ = true;
// tsx preserves Expo's JSX setting; Metro normally supplies this transform.
globalThis.React = React;
const directory = mkdtempSync(join(tmpdir(), 'hygene-lifecycle-'));
const sample = { tracking: 'GOOD', continuity: 'CONTINUOUS', nativeTimestampMs: 1000,
  camera: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, worldPoint: null };
const manifest = { spatialCaptureEnabled: true, task: { id: 7, title: 'Test', status: 'IN_PROGRESS',
  areaNameSnapshot: 'Room', shiftEnd: new Date().toISOString() }, items: [], sessions: [] };
let local = { session: { id: 'session', state: 'ACTIVE', serverTime: new Date().toISOString(),
  captureExpiresAt: new Date(Date.now() + 600000).toISOString(), slots: [1, 2, 3].map(sequence =>
    ({ id: `slot-${sequence}`, contextKey: `CONTEXT_${sequence}`, sequence, nonce: 'n' })) },
  manifest, anchorBootId: 'boot', anchorElapsedMs: 0, paused: false };
let rows = [], starts = 0, stops = 0, clock = 1000, availability = sample;
let scans = 0;
const listeners = new Set();
const intervals = new Set();
const originalInterval = globalThis.setInterval, originalClear = globalThis.clearInterval;
globalThis.setInterval = callback => { intervals.add(callback); return callback; };
globalThis.clearInterval = callback => intervals.delete(callback);
const native = {
  isSupported: async () => 'LIMITED_SPATIAL', start: async () => { starts++; },
  stop: async () => { stops++; }, interrupt: async () => { stops++; },
  getTrackingState: async () => availability,
  captureSpatialObservation: async () => ({ uri: 'test.jpg', sample }),
};
globalThis.lifecycleMocks = {
  rn: { AppState: { currentState: 'active', addEventListener: (_name, callback) => {
    listeners.add(callback); return { remove: () => listeners.delete(callback) };
  } }, View: 'View', ActivityIndicator:'ActivityIndicator', ScrollView: 'ScrollView', StyleSheet: { absoluteFill: {}, create:value=>value },
  Platform: { OS: 'android' }, Linking: { openSettings: async () => {} } },
  camera: { CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
  queue: { getSession: async () => local, queueRows: async () => rows, saveSession: async value => { local = value; },
    queueAccount: () => '1_1', persistSpatialCheckpoint: async (_task, _session, checkpoint) => {
      local = { ...local, spatialCheckpoint: checkpoint };
    }, saveCapture: async (metadata, _bytes, checkpoint) => {
      rows.push({ id: metadata.clientCaptureId, slotId: metadata.slotId, sessionId: metadata.sessionId,
        metadata, state: 'SAVED' }); local = { ...local, spatialCheckpoint: checkpoint };
    }, updateQueue: async()=>{}, saveIssue: async () => {}, removeRequest: async () => {}, unlockQueue: async () => {} },
  api: { verificationManifest: async () => manifest, resumeCapture: async () => local.session,
    installationId: async () => 'device', openCaptureSession: async () => {}, retakeSlots: async () => {} },
  spatial: { spatialTracking: native, SpatialCamera: 'SpatialCamera', unavailableSample: () => ({
    tracking: 'UNAVAILABLE', continuity: 'BROKEN', camera: null, worldPoint: null, nativeTimestampMs: null }) },
  category: { inspectLocalCategory: async (_uri,expectedCategory) => ({outcome:'MATCH',expectedCategory,predictedCategory:expectedCategory,score:.9,margin:.3,durationMs:20,modelVersion:'adapter-test',reason:'CATEGORY_MATCH'}) },
  quality: { captureClock: () => ({ bootId: 'boot', elapsedMs: clock++ }),
    inspectStill: async () => ({ width: 1800, height: 1200, luminance: 128, clipping: 0, laplacianVariance: 200 }) },
  fs: { File: class { constructor(uri) { this.uri = uri; } exists = false; bytes = async () => new Uint8Array([1]); } },
  crypto: { randomUUID: () => `uuid-${clock++}`, digest: async () => new Uint8Array([1]).buffer,
    CryptoDigestAlgorithm: { SHA256: 'SHA256' } },
};
globalThis.lifecycleMocks.rn.Alert = { alert() {} };
globalThis.lifecycleMocks.rn.Animated = { Value: class { interpolate() { return 0; } },
  loop: () => ({ start() {}, stop() {} }), timing: () => ({}), View: 'AnimatedView' };
const mocks = {
  'react-native': 'globalThis.lifecycleMocks.rn',
  'expo-camera': 'globalThis.lifecycleMocks.camera',
  'expo-file-system': 'globalThis.lifecycleMocks.fs',
  'expo-crypto': 'globalThis.lifecycleMocks.crypto',
  'expo-image-manipulator': '{manipulateAsync:async()=>({uri:"resized.jpg"}),SaveFormat:{JPEG:"jpeg"}}',
  'expo-haptics': '{notificationAsync:async()=>{},NotificationFeedbackType:{Success:1}}',
  '@react-native-community/netinfo': '{addEventListener:()=>()=>{}}',
  '@react-navigation/native': '{useIsFocused:()=>true}',
  '/components/ui/button': '{Button:"Button"}', '/components/ui/text': '{Text:"Text"}',
  '/components/ui/card': '{Card:"Card",CardContent:"CardContent"}',
  '/components/ui/icon': '{Icon:"Icon"}', '/components/EmptyState': '{EmptyState:"EmptyState"}',
  '/components/LoadingState': '{LoadingState:"LoadingState"}',
  '@tanstack/react-query': '{useQueryClient:()=>({invalidateQueries:async()=>{}})}',
  '/queries/staff': '{staffQueryKeys:{all:["staff"]}}',
  '/api/client': '{client:{post:async()=>{globalThis.lifecycleMocks.scanned();}}}',
  '/auth/AuthContext': '{useAuth:()=>({user:{companyId:1,id:1}})}',
  '/verification/queue': 'globalThis.lifecycleMocks.queue',
  '/verification/api': 'globalThis.lifecycleMocks.api',
  '/verification/localCategory': 'globalThis.lifecycleMocks.category',
  '/verification/sync': '{syncEvidence:async()=>{},subscribeEvidenceSync:()=>()=>{},retrySavedUploads:async()=>{}}',
  '/modules/spatial-tracking': 'globalThis.lifecycleMocks.spatial',
  '/modules/capture-quality': 'globalThis.lifecycleMocks.quality',
};
globalThis.lifecycleMocks.scanned = () => { scans++; };
const urls = Object.fromEntries(Object.entries(mocks).map(([name, expression], index) => {
  const file = join(directory, `${index}.cjs`); writeFileSync(file, `module.exports=${expression};`);
  return [name, pathToFileURL(file).href];
}));
const hook = registerHooks({ resolve(specifier, context, next) {
  const key = Object.keys(urls).find(name => specifier === name || name.startsWith('/') && specifier.endsWith(name));
  return key ? { url: urls[key], shortCircuit: true } : next(specifier, context);
} });
const flush = async work => act(async () => { await work?.(); await Promise.resolve(); });
const tick = () => flush(async () => { for (const callback of [...intervals]) await callback(); });
const click = (renderer, label) => flush(() => renderer.root.findAllByType('Button')
  .find(button => button.props.children === label).props.onPress());

test('guided spatial continuity, native fallback, and QR callbacks survive lifecycle changes', async () => {
  let renderer;
  try {
    const { VerificationScreen } = await import('../src/screens/verification/VerificationScreen.tsx');
    await flush(() => { renderer = create(React.createElement(VerificationScreen, {
      route: { params: { taskId: 7 } }, navigation: { goBack() {}, navigate() {} },
    })); });
    await click(renderer, 'Continue photos');
    assert.equal(starts, 1);
    availability = { tracking: 'UNAVAILABLE', continuity: 'BROKEN', camera: null, worldPoint: null, nativeTimestampMs: null };
    await tick();
    assert.equal(renderer.root.findAllByType('SpatialCamera').length, 1, 'Cold startup gets time to acquire its first frame');
    availability = sample;
    await tick();
    await click(renderer, 'Take photo');
    await tick();
    await click(renderer, 'Take photo');
    assert.equal(starts, 1, 'Saving and manifest polling must not recreate the world');
    assert.equal(rows.length, 2);
    assert.equal(rows[0].metadata.spatialEvidence.worldId, rows[1].metadata.spatialEvidence.worldId);
    assert.equal(rows[1].metadata.spatialEvidence.sequence, 2);
    await flush(() => { globalThis.lifecycleMocks.rn.AppState.currentState = 'background'; for (const listener of listeners) listener('background'); });
    assert.equal(renderer.root.findAllByType('SpatialCamera').length, 0);
    await flush(() => { globalThis.lifecycleMocks.rn.AppState.currentState = 'active'; for (const listener of listeners) listener('active'); });
    assert.equal(starts, 2, 'Foreground recovery must start even when interruption reset its state to idle');
    await tick();
    await click(renderer, 'Take photo');
    assert.equal(rows.length, 3);
    assert.notEqual(rows[2].metadata.spatialEvidence.worldId, rows[1].metadata.spatialEvidence.worldId);
    assert.equal(rows[2].metadata.spatialEvidence.continuity, 'BROKEN');
    assert.ok(stops > 0);
    await flush(() => renderer.unmount());
    renderer = undefined;
    rows = [];
    native.start = async () => { throw new Error('Spatial camera resolution is too low'); };
    await flush(() => { renderer = create(React.createElement(VerificationScreen, {
      route: { params: { taskId: 7 } }, navigation: { goBack() {}, navigate() {} },
    })); });
    await click(renderer, 'Continue photos');
    await flush(() => new Promise(resolve => setTimeout(resolve, 400)));
    assert.equal(renderer.root.findAllByType('SpatialCamera').length, 0);
    assert.equal(renderer.root.findAllByType('CameraView').length, 1, 'Native startup failure falls back to the ordinary camera');
    await flush(() => renderer.unmount());
    renderer = undefined;
    local = null;
    globalThis.lifecycleMocks.queue.getSession=async()=>local;
    globalThis.lifecycleMocks.api.openCaptureSession=async()=>{scans++;return {id:'qr-session',state:'ACTIVE',serverTime:new Date().toISOString(),presenceStatus:'ACCEPTABLE',slots:[]};};
    await flush(() => { renderer = create(React.createElement(VerificationScreen, {
      route: { params: { taskId: 7 } }, navigation: { goBack() {} },
    })); });
    await click(renderer, 'Room is empty, continue');
    await flush(() => new Promise(resolve => setTimeout(resolve, 400)));
    const scanner = renderer.root.findByType('CameraView');
    await flush(() => {
      scanner.props.onCameraReady();
      scanner.props.onBarcodeScanned({ data: 'room-qr' });
      scanner.props.onBarcodeScanned({ data: 'room-qr' });
    });
    assert.equal(scans, 1, 'Consecutive native QR callbacks must submit only one guided session request');
    // Restart scanning to test the actual camera's background/foreground behavior.
    await flush(()=>renderer.unmount());
    local=null;
    await flush(() => { renderer = create(React.createElement(VerificationScreen, {
      route: { params: { taskId: 7 } }, navigation: { goBack() {} },
    })); });
    await click(renderer, 'Room is empty, continue');
    await flush(() => new Promise(resolve => setTimeout(resolve, 400)));
    await flush(() => { globalThis.lifecycleMocks.rn.AppState.currentState = 'background'; for (const listener of listeners) listener('background'); });
    assert.equal(renderer.root.findAllByType('CameraView').length, 0, 'QR camera unmounts on background');
    await flush(() => { globalThis.lifecycleMocks.rn.AppState.currentState = 'active'; for (const listener of listeners) listener('active'); });
    await flush(() => new Promise(resolve => setTimeout(resolve, 400)));
    assert.equal(renderer.root.findAllByType('CameraView').length, 1, 'QR camera remounts on foreground');
    let rejectLocation;
    globalThis.lifecycleMocks.api.openCaptureSession=()=>new Promise((_resolve,reject)=>{rejectLocation=reject;});
    await flush(()=>{const scan=renderer.root.findByType('CameraView');scan.props.onCameraReady();scan.props.onBarcodeScanned({data:'new-scan'});});
    assert.ok(JSON.stringify(renderer.toJSON()).includes('Checking your location'));
    assert.equal(renderer.root.findAllByType('Button').some(button=>button.props.children==='Retry room and location check'),false,'A pending GPS lookup is not presented as an error');
    await flush(()=>rejectLocation(new Error('Location could not be found in 20 seconds. Turn on precise location.')));
    assert.ok(renderer.root.findAllByType('Button').some(button=>button.props.children==='Retry room and location check'));
    assert.ok(JSON.stringify(renderer.toJSON()).includes('Location could not be found'));
    await flush(()=>renderer.unmount());
    manifest.spatialCaptureEnabled=false;
    manifest.items=[{id:'fixture',nameSnapshot:'Sink 1',typeSnapshot:'SINK',identificationSnapshot:{},requirements:[{id:'r',state:'PROCESSING',instructionsSnapshot:'Show the basin'}]}];
    local={session:{id:'progress-session',state:'ACTIVE',serverTime:new Date().toISOString(),captureExpiresAt:new Date(Date.now()+600000).toISOString(),slots:[{id:'used-slot',requirementId:'r',generation:0}]},manifest,anchorBootId:'boot',anchorElapsedMs:0,paused:false};
    rows=[{id:'pending-photo',sessionId:'progress-session',slotId:'used-slot',state:'UPLOADING',metadata:{slotId:'used-slot'}}];
    await flush(()=>{renderer=create(React.createElement(VerificationScreen,{route:{params:{taskId:7}},navigation:{goBack(){}}}));});
    await click(renderer,'Retry saved uploads');
    manifest.items[0].requirements[0].state='RECAPTURE_REQUIRED';
    manifest.items[0].requirements[0].currentAttempt={instructions:'Show the entire basin.'};
    await tick();
    assert.ok(JSON.stringify(renderer.toJSON()).includes('Show the entire basin.'),'Polling exposes a server recapture result while another upload remains pending');
    assert.ok(renderer.root.findAllByType('Button').some(button=>button.props.children==='Retake affected views'&&!button.props.loading));
    await flush(()=>renderer.unmount());renderer=undefined;
    rows=[];manifest.spatialCaptureEnabled=true;
    manifest.items=[{id:'sink',nameSnapshot:'Sink 1',typeSnapshot:'SINK',identificationSnapshot:{},requirements:[{id:'r',state:'MISSING',instructionsSnapshot:'Show the basin',decisionVersion:0},{id:'r2',state:'MISSING',instructionsSnapshot:'Show the tap',decisionVersion:0}]}];
    local={session:{id:'category-session',state:'ACTIVE',serverTime:new Date().toISOString(),captureExpiresAt:new Date(Date.now()+600000).toISOString(),slots:[{id:'first',requirementId:'r',generation:0,sequence:1,nonce:'n'},{id:'second',requirementId:'r2',generation:0,sequence:2,nonce:'n'}]},manifest,anchorBootId:'boot',anchorElapsedMs:0,paused:false};
    native.start=async()=>{};availability=sample;
    await flush(()=>{renderer=create(React.createElement(VerificationScreen,{route:{params:{taskId:7}},navigation:{goBack(){}}}));});
    await click(renderer,'Continue photos');await tick();
    globalThis.lifecycleMocks.category.inspectLocalCategory=async()=>({outcome:'CLEAR_MISMATCH',expectedCategory:'SINK',predictedCategory:'TOILET'});
    await click(renderer,'Take photo');
    assert.equal(rows.length,0,'A local mismatch is never durably queued for upload');
    assert.ok(JSON.stringify(renderer.toJSON()).includes("doesn't look like a sink"));
    assert.ok(JSON.stringify(renderer.toJSON()).includes('Photo 1 of 2'),'Mismatch stays on the same view');
    globalThis.lifecycleMocks.category.inspectLocalCategory=async()=>({outcome:'UNCERTAIN',expectedCategory:'SINK',predictedCategory:null});
    await click(renderer,'Take photo');
    assert.equal(rows.length,0,'Uncertain does not automatically count as matched or queue');
    assert.ok(renderer.root.findAllByType('Button').some(button=>button.props.children==='Send for checking'));
    await click(renderer,'Retake photo');assert.equal(rows.length,0);
    await click(renderer,'Take photo');
    await click(renderer,'Room occupied — pause');
    assert.equal(rows.length,0,'Pausing discards an undecided uncertain capture without saving it');
    assert.ok(JSON.stringify(renderer.toJSON()).includes('This photo was not saved'));
    await click(renderer,'Continue photos');await tick();
    assert.equal(renderer.root.findAllByType('Button').some(button=>button.props.children==='Send for checking'),false,'An old uncertain photo cannot be committed after a pause');
    await click(renderer,'Take photo');
    await flush(()=>{globalThis.lifecycleMocks.rn.AppState.currentState='background';for(const listener of listeners)listener('background');});
    assert.equal(rows.length,0);assert.ok(JSON.stringify(renderer.toJSON()).includes('This photo was not saved'));
    await flush(()=>{globalThis.lifecycleMocks.rn.AppState.currentState='active';for(const listener of listeners)listener('active');});await tick();
    assert.equal(renderer.root.findAllByType('Button').some(button=>button.props.children==='Send for checking'),false,'Foreground does not resurrect undecided capture bytes');
    await click(renderer,'Take photo');await click(renderer,'Send for checking');
    assert.equal(rows.length,1);assert.equal(rows[0].metadata.localCategoryResult.outcome,'UNCERTAIN');
    assert.ok(JSON.stringify(renderer.toJSON()).includes('Photo 2 of 2'));
    const save=globalThis.lifecycleMocks.queue.saveCapture;let completeSave;
    globalThis.lifecycleMocks.queue.saveCapture=(...args)=>new Promise(resolve=>{completeSave=async()=>{await save(...args);resolve();};});
    globalThis.lifecycleMocks.category.inspectLocalCategory=async()=>({outcome:'MATCH',expectedCategory:'SINK',predictedCategory:'SINK'});
    await click(renderer,'Take photo');
    assert.equal(rows.length,1,'UI cannot advance before the encrypted save commits');
    assert.ok(JSON.stringify(renderer.toJSON()).includes('Photo 2 of 2'));
    await flush(()=>completeSave());assert.equal(rows.length,2);
    globalThis.lifecycleMocks.queue.saveCapture=save;
    await flush(()=>renderer.unmount());renderer=undefined;
    manifest.spatialCaptureEnabled=false;
    manifest.items[0].requirements[0].state='PASSED';manifest.items[0].requirements[1].state='CLEANING_REQUIRED';
    manifest.items[0].requirements[1].decisionVersion=3;
    manifest.items[0].requirements.push({id:'r3',state:'RECAPTURE_REQUIRED',instructionsSnapshot:'Show the drain clearly',decisionVersion:6,currentAttempt:{id:'old-session-wrong-view'}});
    rows=[];
    local={...local,session:{...local.session,id:'dirty-session',captureExpiresAt:new Date(Date.now()-1000).toISOString(),slots:[]}};
    let qrArgs,retakeCount=0;
    globalThis.lifecycleMocks.api.retakeSlots=async()=>{retakeCount++;};
    globalThis.lifecycleMocks.api.openCaptureSession=async(...args)=>{qrArgs=args;return{id:'rework-session',state:'ACTIVE',serverTime:new Date().toISOString(),captureExpiresAt:new Date(Date.now()+600000).toISOString(),presenceStatus:'ACCEPTABLE',slots:[{id:'target',requirementId:'r2',generation:4,sequence:1}]};};
    await flush(()=>{renderer=create(React.createElement(VerificationScreen,{route:{params:{taskId:7}},navigation:{goBack(){}}}));});
    await click(renderer,'Re-clean items, then scan QR');
    assert.equal(retakeCount,0,'Dirty rework never uses old session retake authority, including after expiry');
    await flush(()=>new Promise(resolve=>setTimeout(resolve,400)));
    await flush(()=>{const scan=renderer.root.findByType('CameraView');scan.props.onCameraReady();scan.props.onBarcodeScanned({data:'fresh-rework-qr'});});
    assert.equal(qrArgs[1],'fresh-rework-qr');assert.equal(qrArgs[2],undefined);
    assert.deepEqual(qrArgs[4],[{requirementId:'r2',expectedGeneration:3}],'Fresh authorization targets only dirty views');
    assert.equal(local.manifest.items[0].requirements[0].state,'PASSED','Passed task evidence survives the fresh session');
    assert.equal(local.manifest.items[0].requirements[1].state,'MISSING','New authority clears the stale dirty label for just the allocated target');
    assert.equal(local.manifest.items[0].requirements[2].state,'RECAPTURE_REQUIRED','Other failed views stay targeted for ordinary recapture');
    manifest.items[0].requirements[1].state='PASSED';manifest.items[0].requirements[1].decisionVersion=4;
    rows=[{id:'dirty-recapture',sessionId:'rework-session',slotId:'target',state:'FINAL',metadata:{slotId:'target'}}];
    await tick();
    let retakeArgs;
    globalThis.lifecycleMocks.api.retakeSlots=async(...args)=>{retakeArgs=args;return {slots:[{id:'wrong-view-retake',requirementId:'r3',generation:7,sequence:2,nonce:'new-nonce'}]};};
    await click(renderer,'Retake affected views');
    assert.equal(retakeArgs[0],'rework-session','An old failed view can be allocated into current fresh authority');
    assert.deepEqual(retakeArgs[1],[{requirementId:'r3',expectedGeneration:6}]);
    assert.equal(local.manifest.items[0].requirements[0].state,'PASSED');assert.equal(local.manifest.items[0].requirements[1].state,'PASSED');
    assert.equal(local.manifest.items[0].requirements[2].state,'MISSING');
    assert.ok(JSON.stringify(renderer.toJSON()).includes('Show the drain clearly'),'Mixed failure recovery returns to only the remaining view');
    await flush(()=>renderer.unmount());renderer=undefined;
    const {VerificationProgress}=await import('../src/screens/verification/VerificationProgress.tsx');
    const outcomes={task:{verificationState:'NEEDS_REVIEW'},sessions:[{id:'display',slots:[{id:'entrance-approved',contextKey:'ENTRANCE',generation:0,state:'PASSED'}]}],items:[{nameSnapshot:'Sink 1',requirements:[
      {id:'clean',state:'PASSED',currentAttempt:{cleanlinessOutcome:'CLEAN'}},
      {id:'dirty',state:'CLEANING_REQUIRED',currentAttempt:{cleanlinessOutcome:'DIRTY',instructions:'Clean around the basin.'}},
      {id:'uncertain',state:'RECAPTURE_REQUIRED',currentAttempt:{cleanlinessOutcome:'NEEDS_REVIEW',reviewReason:'CANNOT_ASSESS',instructions:'Show the whole tap.'}},
      {id:'gate',state:'REVIEW_REQUIRED',currentAttempt:{cleanlinessOutcome:'NEEDS_REVIEW',reviewReason:'AUTO_PASS_NOT_VALIDATED'}},
      {id:'accepted',state:'MANAGER_ACCEPTED',currentAttempt:{manualOutcome:'MANAGER_ACCEPTED'}},
      {id:'waived',state:'WAIVED'},
      {id:'failure',state:'REVIEW_REQUIRED',currentAttempt:{state:'SERVICE_FAILURE',reviewReason:'SERVICE_FAILURE'}},
    ]}]};
    await flush(()=>{renderer=create(React.createElement(VerificationProgress,{manifest:outcomes,local:null,rows:[],online:true,lastUpdated:Date.now()}));});
    const textContent=children=>Array.isArray(children)?children.map(textContent).join(''):typeof children==='string'||typeof children==='number'?String(children):'';
    const labels=()=>renderer.root.findAllByType('Text').map(node=>textContent(node.props.children));
    assert.ok(labels().includes('Clean'));assert.ok(labels().includes('Dirty'));assert.ok(labels().includes('Needs review'));
    assert.ok(labels().includes('Accepted'));assert.ok(labels().includes('Waived'));assert.ok(labels().includes('Passed'),'Entrance approval is not labeled Clean');
    assert.ok(labels().includes('1 Clean · 1 Dirty · 3 Needs review'),'Manual resolutions never inflate automated Clean count');
    assert.ok(labels().includes('Retake photo'));assert.ok(labels().includes('Re-clean, then scan QR'));
    assert.ok(JSON.stringify(renderer.toJSON()).includes('still being validated'));assert.ok(JSON.stringify(renderer.toJSON()).includes('do not need to clean or take another photo'));
    outcomes.task.completionOutcome='COMPLETED_WITH_EXCEPTIONS';
    await flush(()=>renderer.update(React.createElement(VerificationProgress,{manifest:outcomes,local:null,rows:[],online:true,lastUpdated:Date.now()})));
    assert.ok(labels().includes('Completed with exceptions'));assert.equal(labels().includes('Verified complete'),false);




  } finally {
    if (renderer) await flush(() => renderer.unmount());
    hook.deregister(); globalThis.setInterval = originalInterval; globalThis.clearInterval = originalClear;
    rmSync(directory, { recursive: true, force: true });
  }
});
