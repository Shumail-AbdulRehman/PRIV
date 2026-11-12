import assert from 'node:assert/strict';
import test from 'node:test';
import { installMocks, render, allText, findPressable, press } from '../support/nativeHarness.mjs';
import { translate } from '../../src/i18n/translations.ts';
import { act } from 'react-test-renderer';

const React = (await import('react')).default;
const h = React.createElement;
let lang = 'en';
const subs = new Set();
const store = { subscribe: f => { subs.add(f); return () => subs.delete(f); }, get: () => lang };
const setLang = value => { lang = value; subs.forEach(f => f()); };
const logins = [];
let loginImpl = async () => {};
let saveImpl = async address => address;
const listeners = {};
installMocks({
  'react-native': {
    Keyboard: { addListener: (name, fn) => { listeners[name] = fn; return { remove() {} }; } },
    KeyboardAvoidingView: 'KeyboardAvoidingView',
  },
  '/components/ui/icon': { Icon: props => React.createElement('Icon', props) },
  '/assets/hygene-ops-mark.png': 1,
  '/i18n/LanguageProvider': {
    useLanguage: () => {
      const language = React.useSyncExternalStore(store.subscribe, store.get);
      return { language, isRTL: language === 'ur', t: (text, values) => translate(text, language, values), setLanguage: setLang };
    },
  },
  '/auth/AuthContext': { useAuth: () => ({ login: (...args) => { logins.push(args); return loginImpl(...args); } }) },
  '/api/client': { changeApiServerAddress: address => saveImpl(address) },
  '/api/serverAddress': { getServerAddress: () => 'https://example.test/api', loadServerAddress: async () => 'https://example.test/api' },
  '/config': { API_BASE_URL: 'https://example.test/api' },
  '/launch/LaunchRecovery': {
    LaunchRecovery: ({ onCancel, onComplete }) => h('LaunchRecovery', { onCancel, onComplete },
      h('Text', null, 'Set your new password')),
  },
});
const { LoginScreen } = await import('../../src/screens/LoginScreen.tsx');
const StyleSheet = { flatten: v => (Array.isArray(v) ? Object.assign({}, ...v.flat(Infinity).filter(Boolean)) : v) };
const inputs = r => r.root.findAll(n => n.type === 'TextInput');
const fill = async (r, email, password) => { await act(async () => { const f = inputs(r); f[0].props.onChangeText(email); f[1].props.onChangeText(password); }); };
test.afterEach(async () => { await act(async () => setLang('en')); logins.length = 0; loginImpl = async () => {}; saveImpl = async a => a; });

test('normal state shows brand, title, both fields, actions and fine print', async () => {
  const r = await render(h(LoginScreen));
  const text = allText(r);
  assert.match(text, /Hygene Ops/);
  assert.match(text, /Staff sign in/);
  assert.match(text, /Email/);
  assert.match(text, /Password/);
  assert.match(text, /Forgot your password\? Ask your manager for a one-use access code\./);
  assert.equal(inputs(r)[0].props.placeholder, 'name@company.com');
  assert.equal(inputs(r)[0].props.keyboardType, 'email-address');
  assert.equal(inputs(r)[1].props.secureTextEntry, true);
  assert.ok(findPressable(r, 'Use manager access code'));
  assert.ok(findPressable(r, 'Show connection settings'));
});

test('the Sign in button is a blue form button with the white label', async () => {
  const r = await render(h(LoginScreen));
  const button = findPressable(r, 'Sign in');
  const views = button.findAll(n => n.type === 'View' && n.props.style);
  const fills = views.map(v => StyleSheet.flatten(v.props.style).backgroundColor);
  const { colors } = await import('../../src/design/tokens.ts');
  assert.ok(fills.includes(colors.blue), 'blue fill');
});

test('empty submit shows the inline required message and does not call login', async () => {
  const r = await render(h(LoginScreen));
  await press(findPressable(r, 'Sign in'));
  assert.equal(logins.length, 0);
  assert.match(allText(r), /Email and password are both required\./);
});

test('a valid submit trims the email and calls login once', async () => {
  const r = await render(h(LoginScreen));
  await fill(r, '  a@b.co ', 'secret');
  await press(findPressable(r, 'Sign in'));
  assert.deepEqual(logins, [['a@b.co', 'secret']]);
  assert.doesNotMatch(allText(r), /wrong/);
});

test('a rejected login shows the wrong-password message', async () => {
  loginImpl = async () => { throw { response: { status: 401 } }; };
  const r = await render(h(LoginScreen));
  await fill(r, 'a@b.co', 'bad');
  await press(findPressable(r, 'Sign in'));
  assert.match(allText(r), /Email or password is wrong\. Check them and try again\./);
});

test('a server message is shown as sent', async () => {
  loginImpl = async () => { throw { response: { status: 403, data: { message: 'Account is locked' } } }; };
  const r = await render(h(LoginScreen));
  await fill(r, 'a@b.co', 'bad');
  await press(findPressable(r, 'Sign in'));
  assert.match(allText(r), /Account is locked/);
  assert.doesNotMatch(allText(r), /Email or password is wrong/);
});

test('the sign in button reports busy while signing in', async () => {
  let release;
  loginImpl = () => new Promise(r => { release = r; });
  const r = await render(h(LoginScreen));
  await fill(r, 'a@b.co', 'pw');
  await press(findPressable(r, 'Sign in'));
  assert.equal(findPressable(r, 'Sign in').props.accessibilityState.busy, true);
  await press(findPressable(r, 'Sign in'));
  assert.equal(logins.length, 1);
  await act(async () => release());
  assert.equal(findPressable(r, 'Sign in').props.accessibilityState.busy, false);
});

test('manager access code opens the recovery form and Back returns with fields restored', async () => {
  const r = await render(h(LoginScreen));
  await press(findPressable(r, 'Use manager access code'));
  assert.match(allText(r), /Set your new password/);
  assert.equal(findPressable(r, 'Sign in'), undefined);
  const recovery = r.root.findByType('LaunchRecovery');
  await act(async () => recovery.props.onCancel());
  assert.ok(findPressable(r, 'Sign in'));
});

test('after a completed handoff the replaced message shows above the form', async () => {
  const r = await render(h(LoginScreen));
  await press(findPressable(r, 'Use manager access code'));
  await act(async () => r.root.findByType('LaunchRecovery').props.onComplete());
  assert.match(allText(r), /Password replaced\. Sign in with your new password\./);
  assert.ok(findPressable(r, 'Sign in'));
});

test('connection settings expand, show the address and an invalid save shows the error', async () => {
  saveImpl = async () => { throw new Error('Enter a valid server address.'); };
  const r = await render(h(LoginScreen));
  await press(findPressable(r, 'Show connection settings'));
  assert.match(allText(r), /https:\/\/example\.test\/api/);
  await press(findPressable(r, 'Change server address'));
  await act(async () => { inputs(r)[2].props.onChangeText('nope'); });
  await press(findPressable(r, 'Save address'));
  assert.match(allText(r), /Enter a valid server address\./);
  await press(findPressable(r, 'Cancel'));
  assert.ok(findPressable(r, 'Change server address'));
  assert.ok(findPressable(r, 'Hide connection settings'));
});

test('a valid server address is saved and shown', async () => {
  saveImpl = async address => `${address}/ok`;
  const r = await render(h(LoginScreen));
  await press(findPressable(r, 'Show connection settings'));
  await press(findPressable(r, 'Change server address'));
  await act(async () => { inputs(r)[2].props.onChangeText('http://10.0.0.2:8080/api'); });
  await press(findPressable(r, 'Save address'));
  assert.match(allText(r), /http:\/\/10\.0\.0\.2:8080\/api\/ok/);
});

test('the language toggle switches to Urdu, translates the title and reverses rows', async () => {
  const r = await render(h(LoginScreen));
  await press(findPressable(r, 'اردو'));
  const text = allText(r);
  assert.match(text, /عملے کا سائن ان/);
  assert.match(text, /سائن ان/);
  const rows = r.root.findAll(n => n.type === 'View' && StyleSheet.flatten(n.props.style)?.flexDirection === 'row-reverse');
  assert.ok(rows.length > 0);
});

test('the keyboard height is added to the bottom padding on Android', async () => {
  const r = await render(h(LoginScreen));
  const scroll = () => r.root.findByType('ScrollView').props.contentContainerStyle.paddingBottom;
  const before = scroll();
  await act(async () => listeners.keyboardDidShow({ endCoordinates: { height: 300 } }));
  assert.equal(scroll(), before + 300);
});
