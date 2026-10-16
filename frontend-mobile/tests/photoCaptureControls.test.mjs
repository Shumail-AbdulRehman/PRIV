import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks, createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';

globalThis.React = React;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const directory = mkdtempSync(join(tmpdir(), 'priv-photo-controls-'));
const mocks = {
  'react-native': `{
    View:'View', Pressable:'Pressable', ActivityIndicator:'ActivityIndicator',
    StyleSheet:{create:styles=>styles, flatten:styles=>Object.assign({},...[styles].flat(Infinity))},
    Platform:{OS:'android'},
    Appearance:{getColorScheme:()=> 'light',addChangeListener:()=>({remove(){}})},
    AppState:{currentState:'active',addEventListener:()=>({remove(){}})},
    Dimensions:{get:()=>({width:360,height:800}),addEventListener:()=>({remove(){}})},
    AccessibilityInfo:{isReduceMotionEnabled:()=>Promise.resolve(false),addEventListener:()=>({remove(){}})}
  }`,
  '../i18n/LanguageProvider': '{useLanguage:()=>({t:text=>text})}',
  './ui/icon': '{Icon:"Icon"}',
  './ui/text': '{Text:"Text"}',
};
const urls = Object.fromEntries(Object.entries(mocks).map(([name, value], i) => {
  const path = join(directory, `${i}.cjs`);
  writeFileSync(path, `module.exports=${value};`);
  return [name, pathToFileURL(path).href];
}));
const hook = registerHooks({resolve(specifier, context, next) {
  return urls[specifier] ? {url:urls[specifier],shortCircuit:true} : next(specifier, context);
}});

test('native photo shutter stays circular through styling, pressing and loading', async () => {
  let renderer;
  try {
    const require = createRequire(import.meta.url);
    const native = require('react-native');
    const { interop } = require('react-native-css-interop/dist/runtime/native/native-interop.js');
    // Exercise the installed native styling runtime, not just raw JSX props.
    native.Pressable = props => interop('Pressable', [{source:'className',target:['style'],inlineProp:'style'}], props);
    const { PhotoCaptureControls } = await import('../src/components/PhotoCaptureControls.tsx');
    let captures = 0;
    const props = {disabled:false,busy:false,label:'Take photo',onCapture:()=>captures++};
    await act(async () => { renderer = create(React.createElement(PhotoCaptureControls, props)); });
    const shutter = () => renderer.root.findByType('Pressable');
    const assertBounds = () => {
      const style = native.StyleSheet.flatten(shutter().props.style);
      assert.equal(style.width,88);
      assert.equal(style.height,88);
      assert.equal(style.flexGrow,0);
      assert.equal(style.flexShrink,0);
      assert.equal(style.borderRadius,44);
      const face = shutter().findByType('View');
      assert.equal(face.props.style.width,74);
      assert.equal(face.props.style.height,74);
      assert.equal(face.props.style.flex,undefined);
      return style;
    };
    assert.equal(assertBounds().opacity,1);
    assert.equal(shutter().props.accessibilityLabel,'Take photo');
    await act(async () => { shutter().props.onPressIn(); });
    assert.equal(assertBounds().opacity,0.75);
    await act(async () => { shutter().props.onPress(); shutter().props.onPressOut(); });
    assert.equal(captures,1);
    assert.equal(assertBounds().opacity,1);
    await act(async () => { renderer.update(React.createElement(PhotoCaptureControls,{...props,busy:true})); });
    assertBounds();
    assert.equal(shutter().props.disabled,true);
    assert.equal(shutter().props.accessibilityState.busy,true);
    assert.equal(shutter().findAllByType('ActivityIndicator').length,1);
    await act(async () => { renderer.update(React.createElement(PhotoCaptureControls,{...props,disabled:true})); });
    assert.equal(assertBounds().opacity,0.45);
    assert.equal(shutter().props.disabled,true);
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    hook.deregister();
    rmSync(directory,{recursive:true,force:true});
  }
});
