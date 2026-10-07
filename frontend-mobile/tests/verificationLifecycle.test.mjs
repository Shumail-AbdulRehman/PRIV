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
  } }, View: 'View', ScrollView: 'ScrollView', StyleSheet: { absoluteFill: {} },
  Platform: { OS: 'android' }, Linking: { openSettings: async () => {} } },
  camera: { CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
  queue: { getSession: async () => local, queueRows: async () => rows, saveSession: async value => { local = value; },
    queueAccount: () => '1_1', persistSpatialCheckpoint: async (_task, _session, checkpoint) => {
      local = { ...local, spatialCheckpoint: checkpoint };
    }, saveCapture: async (metadata, _bytes, checkpoint) => {
      rows.push({ id: metadata.clientCaptureId, slotId: metadata.slotId, sessionId: metadata.sessionId,
        metadata, state: 'SAVED' }); local = { ...local, spatialCheckpoint: checkpoint };
    }, saveIssue: async () => {}, removeRequest: async () => {}, unlockQueue: async () => {} },
  api: { verificationManifest: async () => manifest, resumeCapture: async () => local.session,
    installationId: async () => 'device', openCaptureSession: async () => {}, retakeSlots: async () => {} },
  spatial: { spatialTracking: native, SpatialCamera: 'SpatialCamera', unavailableSample: () => ({
    tracking: 'UNAVAILABLE', continuity: 'BROKEN', camera: null, worldPoint: null, nativeTimestampMs: null }) },
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
  '/verification/sync': '{syncEvidence:async()=>{}}',
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
    const { QrScannerScreen } = await import('../src/screens/QrScannerScreen.tsx');
    await flush(() => { renderer = create(React.createElement(QrScannerScreen, {
      route: { params: { taskId: 7, taskTitle: 'Test' } }, navigation: { goBack() {} },
    })); });
    await flush(() => new Promise(resolve => setTimeout(resolve, 400)));
    const scanner = renderer.root.findByType('CameraView');
    await flush(() => {
      scanner.props.onCameraReady();
      scanner.props.onBarcodeScanned({ data: 'test-qr' });
      scanner.props.onBarcodeScanned({ data: 'test-qr' });
    });
    assert.equal(scans, 1, 'Consecutive native QR callbacks must submit only one request');
    await flush(() => { globalThis.lifecycleMocks.rn.AppState.currentState = 'background'; for (const listener of listeners) listener('background'); });
    assert.equal(renderer.root.findAllByType('CameraView').length, 0, 'QR camera unmounts on background');
    await flush(() => { globalThis.lifecycleMocks.rn.AppState.currentState = 'active'; for (const listener of listeners) listener('active'); });
    await flush(() => new Promise(resolve => setTimeout(resolve, 400)));
    assert.equal(renderer.root.findAllByType('CameraView').length, 1, 'QR camera remounts on foreground');
  } finally {
    if (renderer) await flush(() => renderer.unmount());
    hook.deregister(); globalThis.setInterval = originalInterval; globalThis.clearInterval = originalClear;
    rmSync(directory, { recursive: true, force: true });
  }
});
