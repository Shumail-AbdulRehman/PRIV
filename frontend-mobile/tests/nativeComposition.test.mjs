import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';
import { translate } from '../src/i18n/translations.ts';

globalThis.React = React;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let language = 'en', calls = [], release, logoutCount = 0;
globalThis.nativeComposition = {
  language: () => ({ language, isRTL: language === 'ur', t: text => translate(text, language) }),
  auth: () => ({ user: { id: 2, companyId: 7, name: 'Synthetic staff', email: 'staff@example.invalid' }, logout: async () => { logoutCount++; } }),
  register: async (...args) => { calls.push(args); return new Promise((resolve, reject) => { release = { resolve, reject }; }); },
};
const mocks = {
  'react-native': '{View:"View",ScrollView:"ScrollView",Text:"NativeText",Platform:{OS:"android"},StyleSheet:{flatten:value=>Array.isArray(value)?Object.assign({},...value):value},Linking:{openSettings:async()=>{}},Alert:{alert(){}}}',
  'react-native-safe-area-context': '{useSafeAreaInsets:()=>({top:0,bottom:0})}',
  '/i18n/LanguageProvider': '{useLanguage:globalThis.nativeComposition.language}',
  '/auth/AuthContext': '{useAuth:globalThis.nativeComposition.auth}',
  '/notifications/native': '{registerPhoneAlerts:globalThis.nativeComposition.register}',
  '/launch/LaunchRecovery': '{LaunchRecovery:"LaunchRecovery"}',
  '/components/ui/button': '{Button:"Button"}',
  '/components/StaffBrand': '{StaffBrand:"StaffBrand"}',
  '/components/ScreenHeader': '{ScreenHeader:"ScreenHeader"}',
};
const directory = mkdtempSync(join(tmpdir(), 'native-v5-composition-'));
const urls = Object.fromEntries(Object.entries(mocks).map(([name, expression], index) => {
  const path = join(directory, index + '.cjs'); writeFileSync(path, `module.exports=${expression};`);
  return [name, pathToFileURL(path).href];
}));
const hook = registerHooks({ resolve(specifier, context, next) {
  const plain = specifier.replace(/\.tsx?$/, '');
  const key = Object.keys(urls).find(name => specifier === name || name.startsWith('/') && plain.endsWith(name));
  return key ? { url: urls[key], shortCircuit: true } : next(specifier, context);
} });
const { HelpScreen } = await import('../src/screens/HelpScreen.tsx');
const { Text } = await import('../src/components/ui/text.tsx');
const { NativeFontsReady } = await import('../src/fonts.ts');
const button = (renderer, text) => renderer.root.findAllByType('Button').find(node => node.props.children === translate(text, language));
const renderedText = renderer => JSON.stringify(renderer.toJSON());
async function mount(node, ready = true) {
  let renderer;
  await act(async () => { renderer = create(React.createElement(NativeFontsReady.Provider, { value: ready }, node)); });
  return renderer;
}
async function close(renderer) { await act(async () => renderer.unmount()); }

test('phone alerts remain unknown until checked and an in-flight registration cannot be duplicated', async () => {
  language = 'en'; calls = []; const renderer = await mount(React.createElement(HelpScreen));
  try {
    assert.match(renderedText(renderer), /Alert registration has not been checked/);
    await act(async () => { button(renderer, 'Retry phone alerts').props.onPress(); button(renderer, 'Retry phone alerts').props.onPress(); });
    assert.deepEqual(calls, [['7_2', 'en', true]]);
    assert.equal(button(renderer, 'Retry phone alerts').props.disabled, true);
    await act(async () => release.resolve('denied'));
    assert.match(renderedText(renderer), /Phone alerts are denied/);
    assert.doesNotMatch(renderedText(renderer), /Alert registration has not been checked/);
    assert.equal(button(renderer, 'Retry phone alerts').props.disabled, false);
  } finally { await close(renderer); }
});

test('failed alert registration has an actionable retry and never claims delivery', async () => {
  language = 'en'; calls = []; const renderer = await mount(React.createElement(HelpScreen), false);
  try {
    await act(async () => { button(renderer, 'Retry phone alerts').props.onPress(); });
    await act(async () => release.reject(new Error('Synthetic unavailable registration')));
    assert.match(renderedText(renderer), /Phone alerts could not be confirmed/);
    await act(async () => { button(renderer, 'Retry phone alerts').props.onPress(); });
    await act(async () => release.resolve('enabled'));
    assert.equal(calls.length, 2);
    assert.match(renderedText(renderer), /Phone alerts registered/);
    assert.match(renderedText(renderer), /Registration does not confirm an alert was delivered/);
  } finally { await close(renderer); }
});

test('account password handoff remains explicit and completion signs out without alert registration', async () => {
  language = 'en'; calls = []; logoutCount = 0;
  const renderer = await mount(React.createElement(HelpScreen));
  try {
    assert.equal(renderer.root.findAllByType('LaunchRecovery').length, 0);
    await act(async () => button(renderer, 'Replace your password').props.onPress());
    await act(async () => renderer.root.findByType('LaunchRecovery').props.onComplete());
    assert.equal(logoutCount, 1); assert.equal(calls.length, 0);
  } finally { await close(renderer); }
});

test('Urdu help keeps account identifiers LTR and uses the current language for registration', async () => {
  language = 'ur'; calls = []; const renderer = await mount(React.createElement(HelpScreen));
  try {
    assert.match(renderedText(renderer), /کام کی اطلاعات/);
    const email = renderer.root.findAllByType('NativeText').find(node => node.props.children === 'staff@example.invalid');
    assert.equal(email.props.style.at(-1).writingDirection, 'ltr');
    await act(async () => { button(renderer, 'Retry phone alerts').props.onPress(); });
    await act(async () => release.resolve('unavailable'));
    assert.deepEqual(calls, [['7_2', 'ur', true]]);
  } finally { await close(renderer); language = 'en'; }
});

test('loaded type follows language and emphasis while system scaling and font-failure fallback remain usable', async () => {
  language = 'en'; const node = React.createElement(Text, { className: 'text-xl font-semibold' }, 'Your shift');
  const renderer = await mount(node);
  try {
    let text = renderer.root.findByType('NativeText');
    assert.equal(text.props.style[0].fontFamily, 'HygeneInterSemiBold');
    assert.notEqual(text.props.allowFontScaling, false);
    language = 'ur';
    await act(async () => renderer.update(React.createElement(NativeFontsReady.Provider, { value: true }, React.createElement(Text, { className: 'text-xl font-semibold' }, 'Your shift'))));
    text = renderer.root.findByType('NativeText');
    assert.equal(text.props.style[0].fontFamily, 'HygeneArabicBold');
    assert.equal(text.props.children, 'آپ کی شفٹ');
    await act(async () => renderer.update(React.createElement(NativeFontsReady.Provider, { value: true }, React.createElement(Text, { className: 'font-semibold' }, 'Hygene Ops'))));
    assert.equal(renderer.root.findByType('NativeText').props.style[0].fontFamily, 'HygeneInterSemiBold');
    await act(async () => renderer.update(React.createElement(NativeFontsReady.Provider, { value: false }, React.createElement(Text, null, 'Your shift'))));
    assert.equal(renderer.root.findByType('NativeText').props.style[0].fontFamily, 'sans-serif');
  } finally { await close(renderer); language = 'en'; }
});

test.after(() => { hook.deregister(); rmSync(directory, { recursive: true, force: true }); });
