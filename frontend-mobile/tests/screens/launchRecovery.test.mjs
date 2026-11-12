import assert from 'node:assert/strict';
import test from 'node:test';
import { installMocks, setLanguage, render, allText, findPressable, press } from '../support/nativeHarness.mjs';
import { act } from 'react-test-renderer';

const React = (await import('react')).default;
const calls = [];
let failure = null;
let release = null;
globalThis.launchApiStub = {
  replaceOwnPassword: async (...args) => { calls.push(['own', ...args]); if (release) await new Promise(r => { release = r; }); if (failure) throw failure; },
  completeStaffHandoff: async (...args) => { calls.push(['handoff', ...args]); if (release) await new Promise(r => { release = r; }); if (failure) throw failure; },
};
installMocks({
  '/components/ui/icon': { Icon: props => React.createElement('Icon', props) },
  './launchApi': globalThis.launchApiStub,
});
const { LaunchRecovery } = await import('../../src/launch/LaunchRecovery.tsx');
const h = React.createElement;
const inputs = r => r.root.findAll(n => n.type === 'TextInput');
const code = 'a'.repeat(43);
async function fill(r, first = 'old-password', next = 'new-password', confirm = next) {
  await act(async () => { const f = inputs(r); f[0].props.onChangeText(first); f[1].props.onChangeText(next); f[2].props.onChangeText(confirm); });
}
test.afterEach(() => { setLanguage('en'); calls.length = 0; failure = null; release = null; });

test('handoff shows the heading, an access code field, the hint and both actions', async () => {
  const r = await render(h(LaunchRecovery, { handoff: true, onComplete() {}, onCancel() {} }));
  const text = allText(r);
  assert.match(text, /Set your new password/);
  assert.match(text, /Enter the code from your manager\./);
  assert.match(text, /Access code/);
  assert.match(text, /Use at least 8 characters\. You will sign in again on this phone\./);
  assert.ok(findPressable(r, 'Save new password'));
  assert.ok(findPressable(r, 'Back to sign in'));
  assert.equal(inputs(r).length, 3);
  assert.ok(inputs(r).every(i => i.props.secureTextEntry === true));
});

test('replacement shows its own heading and Cancel calls onCancel', async () => {
  let cancelled = 0;
  const r = await render(h(LaunchRecovery, { onComplete() {}, onCancel: () => { cancelled++; } }));
  assert.match(allText(r), /Replace your password/);
  assert.match(allText(r), /Current password/);
  await press(findPressable(r, 'Cancel'));
  assert.equal(cancelled, 1);
});

test('a short password shows the existing validation error and calls nothing', async () => {
  const r = await render(h(LaunchRecovery, { onComplete() {} }));
  await fill(r, 'old-password', 'short');
  await press(findPressable(r, 'Save new password'));
  assert.equal(calls.length, 0);
  assert.match(allText(r), /Enter your access details and matching passwords of at least 8 characters and at most 72 UTF-8 bytes\./);
});

test('a malformed handoff code and mismatched passwords never call the API', async () => {
  const r = await render(h(LaunchRecovery, { handoff: true, onComplete() {} }));
  await fill(r, 'bad');
  await press(findPressable(r, 'Save new password'));
  assert.match(allText(r), /one-use code/);
  await fill(r, code, 'new-password', 'other-password');
  await press(findPressable(r, 'Save new password'));
  assert.equal(calls.length, 0);
});

test('a valid handoff calls completeStaffHandoff once even if pressed twice, then onComplete and clears fields', async () => {
  let completed = 0;
  release = true;
  const r = await render(h(LaunchRecovery, { handoff: true, onComplete: () => { completed++; } }));
  await fill(r, code);
  await act(async () => { findPressable(r, 'Save new password').props.onPress(); findPressable(r, 'Save new password').props.onPress(); });
  assert.deepEqual(calls, [['handoff', code, 'new-password']]);
  assert.equal(findPressable(r, 'Save new password').props.accessibilityState.busy, true);
  await act(async () => { release(); });
  assert.equal(completed, 1);
  assert.ok(inputs(r).every(i => i.props.value === ''));
});

test('a 403 on replacement keeps the draft and shows the existing 403 message', async () => {
  failure = { response: { status: 403 } };
  const r = await render(h(LaunchRecovery, { onComplete() { assert.fail('no success'); } }));
  await fill(r);
  await press(findPressable(r, 'Save new password'));
  assert.deepEqual(calls, [['own', 'old-password', 'new-password']]);
  assert.equal(inputs(r)[0].props.value, 'old-password');
  assert.match(allText(r), /Current password is incorrect or your access changed/);
});

test('a failed handoff shows the code-not-confirmed message', async () => {
  failure = { response: { status: 400 } };
  const r = await render(h(LaunchRecovery, { handoff: true, onComplete() {} }));
  await fill(r, code);
  await press(findPressable(r, 'Save new password'));
  assert.match(allText(r), /Code not confirmed/);
});

test('Urdu renders the translated heading, translated actions and right-aligned LTR inputs', async () => {
  setLanguage('ur');
  const r = await render(h(LaunchRecovery, { handoff: true, onComplete() {}, onCancel() {} }));
  assert.match(allText(r), /اپنا نیا پاس ورڈ بنائیں/);
  assert.ok(findPressable(r, 'نیا پاس ورڈ محفوظ کریں'));
  assert.ok(findPressable(r, 'سائن ان پر واپس'));
  const { StyleSheet } = await import('react-native');
  for (const i of inputs(r)) { assert.equal(i.props.secureTextEntry, true); assert.notEqual(i.props.allowFontScaling, false, 'system text scaling stays enabled'); const s = StyleSheet.flatten(i.props.style); assert.equal(s.writingDirection, 'ltr'); assert.equal(s.textAlign, 'right'); }
});

test('replacement form blocks duplicate requests and clears secrets only after success', async () => {
  let completed = 0;
  release = true;
  const r = await render(h(LaunchRecovery, { onComplete: () => { completed++; } }));
  await fill(r);
  await act(async () => { findPressable(r, 'Save new password').props.onPress(); findPressable(r, 'Save new password').props.onPress(); });
  assert.deepEqual(calls, [['own', 'old-password', 'new-password']]);
  assert.equal(findPressable(r, 'Save new password').props.accessibilityState.busy, true);
  assert.equal(completed, 0);
  await act(async () => { release(); });
  assert.equal(completed, 1);
  assert.ok(inputs(r).every(i => i.props.value === ''));
});
