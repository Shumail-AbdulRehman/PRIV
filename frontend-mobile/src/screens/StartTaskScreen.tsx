import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { client } from '../api/client';
import { startCleaning } from '../api/startCleaning';
import { useAuth } from '../auth/AuthContext';
import { staffQueryKeys } from '../queries/staff';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';
import { Icon } from '../components/ui/icon';
import { formatClockTime, formatTaskWindow } from '../utils/format';
import { verificationErrorMessage } from '../verification/errors';
import type { ApiEnvelope, RootStackParamList, TaskInstance } from '../types';

const scannerSettings = { barcodeTypes: ['qr' as const] };
type Props = NativeStackScreenProps<RootStackParamList, 'StartTask'>;

/** Starting records a room-marker event only. Finish owns its own QR/GPS session. */
export function StartTaskScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const taskId = route.params.taskId;
  const focused = useIsFocused();
  const cache = useQueryClient();
  const taskKey = ['staff', user?.id, 'task', taskId];
  const taskQuery = useQuery({
    queryKey: taskKey,
    queryFn: async () => (await client.get<ApiEnvelope<TaskInstance>>(`/task-instance/${taskId}`)).data.data,
    enabled: !!user,
    retry: false,
  });
  const [confirmed, setConfirmed] = useState<TaskInstance | null>(null);
  const task = confirmed ?? taskQuery.data;
  const [permission, requestPermission] = useCameraPermissions();
  const askedPermission = useRef(false);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [torch, setTorch] = useState(false);
  const [cameraMounted, setCameraMounted] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const ready = useRef(false);
  const inFlight = useRef(false);
  const alive = useRef(true);
  const active = useRef(false);
  const canStart = task?.status === 'PENDING' && task.verificationVersion === 2;
  const scanning = Platform.OS !== 'web' && !!user && canStart && focused && foreground && permission?.granted && !busy && !error;
  active.current = !!scanning;

  useEffect(() => {
    alive.current = true;
    const listener = AppState.addEventListener('change', state => {
      if (state !== 'active') { active.current = false; ready.current = false; }
      setForeground(state === 'active');
    });
    return () => { alive.current = false; active.current = false; listener.remove(); };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || !canStart || !focused || !permission || permission.granted || !permission.canAskAgain || askedPermission.current) return;
    askedPermission.current = true;
    void requestPermission().catch(() => { if (alive.current) setError('Camera permission could not be requested. Try again.'); });
  }, [canStart, focused, permission, requestPermission]);

  useEffect(() => {
    ready.current = false;
    setCameraMounted(false);
    if (!scanning) return;
    const timer = setTimeout(() => setCameraMounted(true), 350);
    return () => clearTimeout(timer);
  }, [scanning]);

  useEffect(() => {
    if (!cameraMounted || !scanning) return;
    const timer = setTimeout(() => { if (!ready.current) setError('Camera could not open. Restart the scanner.'); }, 4000);
    return () => clearTimeout(timer);
  }, [cameraMounted, cameraKey, scanning]);

  async function scan(areaQr: string) {
    if (!active.current || !ready.current || inFlight.current || !user) return;
    inFlight.current = true;
    active.current = false;
    setBusy(true);
    try {
      const started = await startCleaning(cache, staffQueryKeys.tasksToday(user.id), taskId, areaQr);
      const next = { ...task, ...started } as TaskInstance;
      cache.setQueryData(taskKey, next);
      if (alive.current) setConfirmed(next);
    } catch (failure) {
      if (alive.current) setError(verificationErrorMessage(failure));
    } finally {
      inFlight.current = false;
      if (alive.current) setBusy(false);
    }
  }

  function restart() { ready.current = false; setError(''); setCameraKey(key => key + 1); }
  const timeZone = task?.location?.timezone ?? task?.template?.location?.timezone;
  const started = task?.status === 'IN_PROGRESS';
  return <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 36 }}>
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Assigned area</Text>
      <Text className="text-3xl font-bold text-foreground">{task?.areaNameSnapshot ?? 'Your cleaning task'}</Text>
      <View className="flex-row items-center gap-2">
        <Icon name={started ? 'CircleCheck' : 'QrCode'} size={16} className={started ? 'text-success' : 'text-primary'} />
        <Text className="text-sm font-semibold text-muted-foreground" accessibilityLiveRegion="polite">
          {started ? 'In progress' : task?.status === 'PENDING' ? 'Scan to start' : task?.status.replaceAll('_', ' ') ?? 'Loading…'}
        </Text>
      </View>
    </View>
    {task ? <>
      <View className="gap-2 border-y border-border py-4">
        <Text className="text-lg font-semibold">{task.title}</Text>
        {task.template?.description ? <Text className="text-base leading-6 text-muted-foreground">{task.template.description}</Text> : null}
        <View className="flex-row items-center gap-2">
          <Icon name="Clock" size={16} className="text-muted-foreground" />
          <Text className="flex-1 text-sm text-muted-foreground">{formatTaskWindow(task.shiftStart, task.shiftEnd, timeZone)}</Text>
        </View>
      </View>
    </> : <Text>{taskQuery.isPending ? 'Loading assigned task…' : 'Task could not be loaded.'}</Text>}
    {taskQuery.isError && !confirmed ? <><Text accessibilityLiveRegion="polite">{verificationErrorMessage(taskQuery.error)}</Text><Button onPress={() => void taskQuery.refetch()}>Retry loading task</Button></> : null}
    {started ? <>
      <View className="gap-3 rounded-xl bg-accent p-5">
        <Icon name="CircleCheck" size={28} className="text-accent-foreground" />
        <Text className="text-xl font-bold text-accent-foreground">Ready to clean</Text>
        {task.startedAt ? <Text className="text-sm font-semibold text-accent-foreground">Started {formatClockTime(task.startedAt, timeZone)}</Text> : null}
        <Text className="text-base leading-6 text-accent-foreground">Clean the area. When you're done, finish your task to scan the area QR again and take the required photos.</Text>
      </View>
      <Button size="lg" iconRight="ArrowRight" onPress={() => navigation.replace('Verification', { taskId })}>Finish task</Button>
    </> : null}
    {canStart ? <>
      <View className="gap-1">
        <Text className="text-lg font-bold">Scan the area QR</Text>
        <Text className="text-base leading-6 text-muted-foreground">Use the room marker for {task.areaNameSnapshot ?? 'your assigned area'}. Your task starts after the area is confirmed.</Text>
      </View>
      {Platform.OS === 'web' ? <Text>Open the installed Hygene Ops Staff app to scan the area QR.</Text> : <>
        {!permission?.granted ? <View className="gap-4 rounded-xl bg-muted p-5">
          <Icon name="Camera" size={28} className="text-primary" />
          <Text className="text-base leading-6">Allow camera access to scan the room marker.</Text>
          <Button size="lg" onPress={() => {
          if (permission?.canAskAgain) void requestPermission().catch(() => setError('Camera permission could not be requested. Try again.'));
          else void Linking.openSettings();
        }}>{permission?.canAskAgain ? 'Allow camera' : 'Open camera settings'}</Button></View> : null}
        {permission?.granted && !error ? <View className="items-center justify-center bg-muted" style={{ width: '100%', aspectRatio: 1, maxHeight: 340, borderRadius: 16, overflow: 'hidden' }}>
          {scanning && cameraMounted ? <>
          <CameraView key={cameraKey} style={StyleSheet.absoluteFill} facing="back" enableTorch={torch}
            barcodeScannerSettings={scannerSettings} onCameraReady={() => { ready.current = true; }}
            onMountError={() => { ready.current = false; setError('Camera could not open. Restart the scanner.'); }}
            onBarcodeScanned={({ data }) => { void scan(data); }} />
          <View pointerEvents="none" style={{ position: 'absolute', inset: 36, borderWidth: 2, borderColor: 'white', borderRadius: 16 }} />
          </> : <View className="items-center gap-3 px-5">
            <Icon name={busy ? 'LoaderCircle' : 'Camera'} size={32} className="text-primary" />
            <Text className="text-center text-base font-semibold" accessibilityLiveRegion="polite">{busy ? 'Confirming area…' : foreground ? 'Opening camera…' : 'Scanner paused'}</Text>
          </View>}
        </View> : null}
        {error ? <View className="gap-3 rounded-xl border border-destructive p-4">
          <Text className="text-base font-semibold">Couldn't confirm the start</Text>
          <Text className="text-base leading-6" accessibilityLiveRegion="polite">{error}</Text>
          <Button size="lg" onPress={restart}>Scan again</Button>
        </View> : null}
        {scanning ? <>
          <Text className="text-center text-sm text-muted-foreground">Hold the QR inside the frame. It scans automatically.</Text>
          <View className="flex-row gap-3">
            <Button className="flex-1" variant="outline" iconLeft="Flashlight" onPress={() => setTorch(value => !value)}>{torch ? 'Torch off' : 'Torch on'}</Button>
            <Button className="flex-1" variant="ghost" iconLeft="RotateCcw" onPress={restart}>Restart scanner</Button>
          </View>
        </> : null}
      </>}
    </> : null}
    {task?.status === 'PENDING' && task.verificationVersion !== 2 ? <Text>This task needs area inventory setup. Ask your manager to repair or replace it.</Text> : null}
    <Button variant="ghost" size="lg" onPress={() => navigation.goBack()}>Back to tasks</Button>
  </ScrollView>;
}
