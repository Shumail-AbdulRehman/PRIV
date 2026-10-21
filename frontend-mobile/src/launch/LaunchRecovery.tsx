import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Text } from '../components/ui/text';
import { useLanguage } from '../i18n/LanguageProvider';
import { validReplacementPassword } from './recoveryPolicy';
import { completeStaffHandoff, replaceOwnPassword } from './launchApi';

export function LaunchRecovery({ handoff = false, onComplete, onCancel }: {
  handoff?: boolean; onComplete: () => Promise<void> | void; onCancel?: () => void;
}) {
  const { t, isRTL } = useLanguage();
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
  const fieldStyle = { writingDirection: 'ltr' as const, textAlign: isRTL ? 'right' as const : 'left' as const };
  return <View className="gap-4">
    <Text accessibilityRole="header" className="text-2xl font-bold">{t(handoff ? 'Use manager access code' : 'Replace your password')}</Text>
    <Text className="text-base leading-7 text-muted-foreground">{t(handoff
      ? 'Ask your assigned manager for a one-use access code. Choose your own password here, then sign in. No staff email inbox is required.'
      : 'Enter your current password and a different new password. You will sign in again after saving.')}</Text>
    <View className="gap-2">
      <Text className="text-base font-semibold">{t(handoff ? 'One-use access code' : 'Current password')}</Text>
      <Input accessibilityLabel={t(handoff ? 'One-use access code' : 'Current password')} value={current} onChangeText={setCurrent} autoCapitalize="none" autoCorrect={false} secureTextEntry style={fieldStyle} editable={!busy} />
    </View>
    <View className="gap-2">
      <Text className="text-base font-semibold">{t('New password')}</Text>
      <Input accessibilityLabel={t('New password')} value={password} onChangeText={setPassword} autoCapitalize="none" secureTextEntry style={fieldStyle} editable={!busy} maxLength={128} />
    </View>
    <View className="gap-2">
      <Text className="text-base font-semibold">{t('Confirm new password')}</Text>
      <Input accessibilityLabel={t('Confirm new password')} value={confirmation} onChangeText={setConfirmation} autoCapitalize="none" secureTextEntry style={fieldStyle} editable={!busy} maxLength={128} />
    </View>
    {error ? <Text accessibilityLiveRegion="polite" className="text-base text-destructive">{error}</Text> : null}
    <Button loading={busy} disabled={busy} onPress={() => void save()}>{t('Save password and sign in')}</Button>
    {onCancel ? <Button variant="outline" disabled={busy} onPress={onCancel}>{t('Cancel')}</Button> : null}
  </View>;
}
