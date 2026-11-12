import assert from 'node:assert/strict';
import test from 'node:test';
import { installMocks, setLanguage, render, allText, findPressable, press, navigationCalls, resetCalls } from '../support/nativeHarness.mjs';
import { act } from 'react-test-renderer';

const React = (await import('react')).default;
const h = React.createElement;
const replaceCalls = [];
const logoutCalls = [];
let replaceFailure = null;
installMocks({
  'react-native': { KeyboardAvoidingView: 'KeyboardAvoidingView' },
  '/components/ui/icon': { Icon: props => React.createElement('Icon', props) },
  './launchApi': {
    replaceOwnPassword: async (...args) => { replaceCalls.push(args); if (replaceFailure) throw replaceFailure; },
    completeStaffHandoff: async () => { throw new Error('handoff is not used on this screen'); },
  },
  '/auth/AuthContext': {
    useAuth: () => ({
      user: { id: 2, companyId: 7, name: 'Synthetic staff', email: 'staff@example.invalid' },
      logout: async () => { logoutCalls.push(1); },
    }),
  },
});
const { ChangePasswordScreen } = await import('../../src/screens/profile/ChangePasswordScreen.tsx');
const { StyleSheet } = await import('react-native');

const inputs = r => r.root.findAll(n => n.type === 'TextInput');
const settle = () => act(async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); });
const current = 'old-password';
const next = 'new-password';

async function fill(r) {
  await act(async () => {
    const f = inputs(r);
    f[0].props.onChangeText(current);
    f[1].props.onChangeText(next);
    f[2].props.onChangeText(next);
  });
}

test.afterEach(() => {
  setLanguage('en'); resetCalls();
  replaceCalls.length = 0; logoutCalls.length = 0; replaceFailure = null;
});

test('English: the title renders and the replacement form has no access code field', async () => {
  const r = await render(h(ChangePasswordScreen));
  const text = allText(r);
  assert.match(text, /Change password/);
  assert.match(text, /Replace your password/);
  assert.match(text, /Current password/);
  assert.match(text, /New password/);
  assert.match(text, /Confirm new password/);
  assert.doesNotMatch(text, /Access code/);
  assert.doesNotMatch(text, /Set your new password/);
  assert.equal(inputs(r).length, 3);
  assert.ok(findPressable(r, 'Save new password'));
});

test('completing the change calls logout exactly once and does not navigate', async () => {
  const r = await render(h(ChangePasswordScreen));
  await fill(r);
  await press(findPressable(r, 'Save new password'));
  await settle();
  assert.deepEqual(replaceCalls, [[current, next]]);
  assert.equal(logoutCalls.length, 1);
  assert.deepEqual(navigationCalls(), []);
});

test('a failed change keeps the person signed in and shows the error', async () => {
  replaceFailure = Object.assign(new Error('wrong'), { response: { status: 403 } });
  const r = await render(h(ChangePasswordScreen));
  await fill(r);
  await press(findPressable(r, 'Save new password'));
  await settle();
  assert.equal(logoutCalls.length, 0);
  assert.match(allText(r), /Current password is incorrect or your access changed\. Check it and try again\./);
});

test('Cancel calls navigation.goBack once and does not sign out', async () => {
  const r = await render(h(ChangePasswordScreen));
  await press(findPressable(r, 'Cancel'));
  assert.deepEqual(navigationCalls().map(c => c.name), ['goBack']);
  assert.equal(logoutCalls.length, 0);
});

test('Back in the top bar calls navigation.goBack once', async () => {
  const r = await render(h(ChangePasswordScreen));
  await press(findPressable(r, 'Back'));
  assert.deepEqual(navigationCalls().map(c => c.name), ['goBack']);
});

test('Urdu: the title and save label translate and the top bar runs right to left', async () => {
  setLanguage('ur');
  const r = await render(h(ChangePasswordScreen));
  const text = allText(r);
  assert.match(text, /پاس ورڈ بدلیں/);
  assert.match(text, /نیا پاس ورڈ محفوظ کریں/);
  const bar = r.root.findAll(n => n.type === 'View' && StyleSheet.flatten(n.props.style)?.height === 56)[0];
  assert.equal(StyleSheet.flatten(bar.props.style).flexDirection, 'row-reverse');
});
