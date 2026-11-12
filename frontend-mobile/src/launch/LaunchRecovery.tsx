import { useRef, useState } from 'react';
import { View } from 'react-native';
import { ActionButton } from '../design/ActionButton';
import { Field } from '../design/Field';
import { StaffText } from '../design/StaffText';
import { useLanguage } from '../i18n/LanguageProvider';
import { validReplacementPassword } from './recoveryPolicy';
import { completeStaffHandoff, replaceOwnPassword } from './launchApi';

export function LaunchRecovery({ handoff = false, onComplete, onCancel }: {
  handoff?: boolean; onComplete: () => Promise<void> | void; onCancel?: () => void;
}) {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(''), [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const inFlight = useRef(false);
  async function save() {
    if (inFlight.current) return;
    setError('');
    if (!current || !validReplacementPassword(password) || password !== confirmation) {
      setError(t('Enter your access details and matching passwords of at least 8 characters and at most 72 UTF-8 bytes.')); return;
    }
    if (handoff && !/^[A-Za-z0-9_-]{43}$/.test(current.trim())) {
      setError(t('Enter the one-use code given directly by your manager.')); return;
    }
    inFlight.current = true; setBusy(true);
    try {
      if (handoff) await completeStaffHandoff(current, password);
      else await replaceOwnPassword(current, password);
      setCurrent(''); setPassword(''); setConfirmation('');
      await onComplete();
    } catch (failure) {
      const status = (failure as {response?:{status?:number}})?.response?.status;
      setError(t(handoff
        ? 'Code not confirmed. It may be expired or already used. Ask your manager for help; do not keep retrying a used code.'
        : status === 403 ? 'Current password is incorrect or your access changed. Check it and try again.'
        : 'Password change is not confirmed. Try signing in with your new password before retrying.'));
    } finally { inFlight.current = false; setBusy(false); }
  }
  return <View style={{ gap: 16 }}>
    <View accessibilityRole="header">
      <StaffText role="headline">{handoff ? 'Set your new password' : 'Replace your password'}</StaffText>
    </View>
    <StaffText role="body" color="muted">{handoff
      ? 'Enter the code from your manager.'
      : 'Enter your current password and a different new password. You will sign in again after saving.'}</StaffText>
    <Field label={handoff ? 'Access code' : 'Current password'} kind={handoff ? 'code' : 'password'} value={current} onChangeText={setCurrent} editable={!busy} />
    <Field label="New password" kind="password" value={password} onChangeText={setPassword} editable={!busy} maxLength={128} />
    <Field label="Confirm new password" kind="password" value={confirmation} onChangeText={setConfirmation} editable={!busy} maxLength={128} error={error || null} />
    <StaffText role="label" color="muted">Use at least 8 characters. You will sign in again on this phone.</StaffText>
    <ActionButton kind="form" label="Save new password" busy={busy} onPress={() => void save()} />
    {handoff || onCancel ? <ActionButton kind="ghost" label={handoff ? 'Back to sign in' : 'Cancel'} onPress={() => { if (!busy) onCancel?.(); }} /> : null}
  </View>;
}
