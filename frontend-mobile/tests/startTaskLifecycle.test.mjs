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
globalThis.React = React;
const directory = mkdtempSync(join(tmpdir(), 'hygene-start-'));
const listeners = new Set();
const calls = [], navigation = [];
let resolveStart, rejectStart;
const task = { id: 7, title: 'Morning clean', areaNameSnapshot: 'East washroom',
  status: 'PENDING', verificationVersion: 2, shiftStart: new Date().toISOString(),
  shiftEnd: new Date(Date.now() + 3600000).toISOString(), location: { timezone: 'UTC' } };
const cache = { setQueryData() {} };
globalThis.startMocks = {
  rn: { AppState: { currentState: 'active', addEventListener: (_name, listener) => {
    listeners.add(listener); return { remove: () => listeners.delete(listener) };
  } }, View: 'View', ScrollView: 'ScrollView', StyleSheet: { absoluteFill: {} },
  Platform: { OS: 'android' }, Linking: { openSettings: async () => {} } },
  query: { useQuery: () => ({ data: task }), useQueryClient: () => cache },
  start: { startCleaning: async (_cache, _key, taskId, areaQr) => {
    calls.push({ taskId, areaQr });
    return new Promise((resolve, reject) => { resolveStart = resolve; rejectStart = reject; });
  } },
};
const mocks = {
  'react-native': 'globalThis.startMocks.rn',
  'expo-camera': '{CameraView:"CameraView",useCameraPermissions:()=>[{granted:true},async()=>({granted:true})]}',
  '@react-navigation/native': '{useIsFocused:()=>true}',
  '@tanstack/react-query': 'globalThis.startMocks.query',
  '/components/ui/button': '{Button:"Button"}', '/components/ui/text': '{Text:"Text"}',
  '/components/ui/icon': '{Icon:"Icon"}',
  '/api/client': '{client:{get:async()=>{throw new Error("Unexpected network call")}}}',
  '/api/startCleaning': 'globalThis.startMocks.start',
  '/auth/AuthContext': '{useAuth:()=>({user:{companyId:1,id:1}})}',
  '/queries/staff': '{staffQueryKeys:{tasksToday:id=>["staff",id,"today"]}}',
};
const urls = Object.fromEntries(Object.entries(mocks).map(([name, expression], index) => {
  const file = join(directory, `${index}.cjs`); writeFileSync(file, `module.exports=${expression};`);
  return [name, pathToFileURL(file).href];
}));
const hook = registerHooks({ resolve(specifier, context, next) {
  const key = Object.keys(urls).find(name => specifier === name || name.startsWith('/') && specifier.endsWith(name));
  return key ? { url: urls[key], shortCircuit: true } : next(specifier, context);
} });
const flush = async work => act(async () => { await work?.(); await Promise.resolve(); });
const cameraDelay = () => flush(() => new Promise(resolve => setTimeout(resolve, 400)));
const click = (renderer, label) => flush(() => renderer.root.findAllByType('Button')
  .find(button => button.props.children === label).props.onPress());

test('start scanner rejects duplicate/background callbacks, retries wrong QR, and keeps cleaning separate from finish', async () => {
  let renderer;
  try {
    const { StartTaskScreen } = await import('../src/screens/StartTaskScreen.tsx');
    await flush(() => { renderer = create(React.createElement(StartTaskScreen, {
      route: { params: { taskId: 7 } }, navigation: { goBack() {}, replace: (...args) => navigation.push(args) },
    })); });
    await cameraDelay();
    const stale = renderer.root.findByType('CameraView').props;
    await flush(() => {
      stale.onCameraReady();
      for (const listener of listeners) listener('background');
      stale.onBarcodeScanned({ data: 'background-qr' });
    });
    assert.equal(calls.length, 0);
    assert.equal(renderer.root.findAllByType('CameraView').length, 0);
    await flush(() => { for (const listener of listeners) listener('active'); });
    await cameraDelay();
    const scanner = renderer.root.findByType('CameraView').props;
    await flush(() => {
      scanner.onCameraReady();
      scanner.onBarcodeScanned({ data: 'wrong-qr' });
      scanner.onBarcodeScanned({ data: 'wrong-qr' });
    });
    assert.equal(calls.length, 1);
    await flush(() => rejectStart({ response: { data: { message: 'This is not the assigned area.' } } }));
    assert.equal(renderer.root.findAllByType('CameraView').length, 0);
    assert.ok(JSON.stringify(renderer.toJSON()).includes('This is not the assigned area.'));
    assert.equal(navigation.length, 0);
    await click(renderer, 'Scan again');
    await cameraDelay();
    await flush(() => {
      const retry = renderer.root.findByType('CameraView').props;
      retry.onCameraReady(); retry.onBarcodeScanned({ data: 'correct-area-qr' });
    });
    assert.deepEqual(calls[1], { taskId: 7, areaQr: 'correct-area-qr' });
    await flush(() => resolveStart({ ...task, status: 'IN_PROGRESS', startedAt: new Date().toISOString() }));
    assert.equal(renderer.root.findAllByType('CameraView').length, 0);
    assert.ok(JSON.stringify(renderer.toJSON()).includes('In progress'));
    assert.equal(navigation.length, 0, 'Starting must leave the worker in the cleaning period');
    await click(renderer, 'Finish task');
    assert.deepEqual(navigation, [['Verification', { taskId: 7 }]], 'Finish receives no start QR/session authority');
  } finally {
    if (renderer) await flush(() => renderer.unmount());
    hook.deregister(); rmSync(directory, { recursive: true, force: true });
  }
});
