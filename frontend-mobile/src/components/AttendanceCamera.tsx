import { ListenButton } from "./ListenButton";
import { useLanguage } from "../i18n/LanguageProvider";
import { useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './ui/button';
import { Text } from './ui/text';

/** Uses the app's camera directly; no external Android image-picker activity. */
export function AttendanceCamera({ mode, onCapture, onCancel }: {
  mode: 'check-in' | 'check-out';
  onCapture: (uri: string) => Promise<void>;
  onCancel: () => void;
}) {
  const {t}=useLanguage();
  const camera = useRef<CameraView>(null);
  const ready = useRef(false);
  const taking = useRef(false);
  const [cameraReady,setCameraReady]=useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!taking.current) onCancel();
      return true;
    });
    return () => listener.remove();
  }, [onCancel]);
  const capture = async () => {
    if (taking.current || !ready.current || !focused) return;
    taking.current = true; setBusy(true); setError('');
    try {
      const photo = await camera.current?.takePictureAsync({ quality: 0.7 });
      if (!photo?.uri) throw new Error('The camera did not save a selfie. Please try again.');
      await onCapture(photo.uri);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not take your selfie. Try again.');
    } finally { taking.current = false; setBusy(false); }
  };
  return <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
    <View className="gap-2 px-5 py-4">
      <Text className="text-2xl font-bold">{mode === 'check-in' ? 'Check-in selfie' : 'Check-out selfie'}</Text>
      <Text className="text-base text-muted-foreground">Keep your face inside the frame, then take your selfie.</Text>
      <ListenButton text={t("Keep your face inside the frame, then take your selfie.")}/>
    </View>
    <View className="flex-1 overflow-hidden">
      {focused ? <CameraView ref={camera} style={{ flex: 1 }} facing="front" mode="picture"
        onCameraReady={() => { ready.current = true;setCameraReady(true); }}
        onMountError={() => { ready.current = false;setCameraReady(false); setError('The camera could not open. Go back and try again.'); }} /> : null}
    </View>
    <View className="gap-3 px-5 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
      {!cameraReady&&!error?<Text accessibilityLiveRegion="polite">{t("Opening camera…")}</Text>:null}
      {error ? <Text accessibilityLiveRegion="polite" className="text-base text-destructive">{error}</Text> : null}
      <Button size="lg" iconLeft="Camera" disabled={!cameraReady} loading={busy} onPress={() => void capture()}>Take selfie</Button>
      <Button variant="outline" disabled={busy} onPress={onCancel}>Cancel</Button>
    </View>
  </View>;
}
