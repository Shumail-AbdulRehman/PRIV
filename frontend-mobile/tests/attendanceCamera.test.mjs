import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';

globalThis.React = React;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const directory = mkdtempSync(join(tmpdir(), 'priv-attendance-camera-'));
const mocks = {
  'react-native': '{View:"View",BackHandler:{addEventListener:()=>({remove(){}})}}',
  'expo-camera': '{CameraView:"CameraView"}',
  '@react-navigation/native': '{useIsFocused:()=>true}',
  'react-native-safe-area-context': '{useSafeAreaInsets:()=>({top:0,bottom:0})}',
  './ui/button': '{Button:"Button"}', './ui/text': '{Text:"Text"}',
};
const urls = Object.fromEntries(Object.entries(mocks).map(([name, value], i) => {
  const path = join(directory, `${i}.cjs`);
  writeFileSync(path, `module.exports=${value};`);
  return [name, pathToFileURL(path).href];
}));
const hook = registerHooks({ resolve(specifier, context, next) {
  return urls[specifier] ? {url: urls[specifier], shortCircuit: true} : next(specifier, context);
} });
test('attendance uses its front camera, guards duplicate captures and retries failed uploads', async () => {
  let renderer, pictures = 0, uploads = 0, release;
  try {
    const { AttendanceCamera } = await import('../src/components/AttendanceCamera.tsx');
    await act(async () => {
      renderer = create(React.createElement(AttendanceCamera, {
        mode: 'check-in', onCancel() {}, onCapture: async uri => {
          assert.equal(uri, 'selfie.jpg'); uploads++;
          if (uploads === 1) await new Promise((_resolve, reject) => { release = reject; });
        },
      }), {createNodeMock: node => node.type === 'CameraView' ? {
        takePictureAsync: async () => { pictures++; return {uri:'selfie.jpg'}; },
      } : null});
    });
    const camera = renderer.root.findByType('CameraView');
    assert.equal(camera.props.facing, 'front');
    const take = () => renderer.root.findAllByType('Button').find(b => b.props.children === 'Take selfie');
    await act(async () => { take().props.onPress(); });
    assert.equal(pictures, 0, 'wait for camera readiness');
    assert.equal(take().props.disabled,true);assert.ok(JSON.stringify(renderer.toJSON()).includes('Opening camera…'));
    await act(async () => { camera.props.onCameraReady(); take().props.onPress(); take().props.onPress(); });
    assert.equal(pictures, 1); assert.equal(uploads, 1);
    assert.equal(take().props.loading, true);
    await act(async () => { release(new Error('Upload failed. Retry your selfie.')); });
    assert.ok(JSON.stringify(renderer.toJSON()).includes('Upload failed. Retry your selfie.'));
    assert.equal(take().props.loading, false);
    await act(async () => { take().props.onPress(); });
    assert.equal(pictures, 2); assert.equal(uploads, 2);
    assert.equal(JSON.stringify(renderer.toJSON()).includes('Upload failed.'), false);
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    hook.deregister(); rmSync(directory, {recursive:true, force:true});
  }
});
