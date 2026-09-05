import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, StyleSheet, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions, type BarcodeType } from "expo-camera";
import { Button } from "../components/ui/button";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { Text } from "../components/ui/text";
import { Card, CardContent } from "../components/ui/card";
import { Icon } from "../components/ui/icon";
import { client } from "../api/client";
import { staffQueryKeys } from "../queries/staff";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "QrScanner">;

// Module-level constant: a new object every render makes expo-camera
// reconfigure the barcode pipeline repeatedly, which leaves the preview
// dark on many Android devices.
const BARCODE_SCANNER_SETTINGS: { barcodeTypes: BarcodeType[] } = { barcodeTypes: ["qr"] };

function SpinningLoader() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent"
      style={{ transform: [{ rotate }] }}
    />
  );
}

const extractQrToken = (raw: string) => {
  try {
    const url = new URL(raw);
    return url.searchParams.get("qrToken") || raw.trim();
  } catch {
    return raw.trim();
  }
};

export function QrScannerScreen({ navigation, route }: Props) {
  const queryClient = useQueryClient();
  const [permission, requestPermission] = useCameraPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanEnabled, setIsScanEnabled] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const isFocused = useIsFocused();

  // Stable handler reference for CameraView; the actual guard lives in a ref
  // so the prop never flips between a function and undefined (which makes
  // expo-camera tear down and rebuild the analyzer on some Android devices).
  const scanAllowedRef = useRef(true);
  scanAllowedRef.current = isScanEnabled && !isSubmitting;
  const cameraReadyRef = useRef(false);

  // Mount the camera only after the push transition has settled — mounting
  // the surface mid-animation is a common cause of a dark preview on Android.
  // On blur, unmount it so returning to this screen gets a fresh surface.
  useEffect(() => {
    if (!isFocused) {
      setIsCameraActive(false);
      cameraReadyRef.current = false;
      return;
    }
    if (!permission?.granted) {
      return;
    }
    const timer = setTimeout(() => setIsCameraActive(true), 350);
    return () => clearTimeout(timer);
  }, [isFocused, permission?.granted]);

  // Watchdog: if the camera surface never reports ready, force a remount.
  useEffect(() => {
    if (!isCameraActive) {
      return;
    }
    const timer = setTimeout(() => {
      if (!cameraReadyRef.current) {
        setCameraKey((key) => key + 1);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isCameraActive, cameraKey]);

  const handleScanned = async (rawValue: string) => {
    if (!scanAllowedRef.current || isSubmitting) {
      return;
    }

    try {
      setIsScanEnabled(false);
      setIsSubmitting(true);

      const endpoint = route.params.referenceImageId
        ? `/task-instance/${route.params.taskId}/area/${route.params.referenceImageId}/scan`
        : `/task-instance/${route.params.taskId}/start`;

      await client.post(endpoint, undefined, {
        params: {
          qrToken: extractQrToken(rawValue),
        },
      });
      await queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });

      const successTitle = route.params.referenceImageId
        ? "Area QR scanned"
        : "Task started";
      const successMessage = route.params.referenceImageId
        ? "You have 90 seconds to capture the photo for this area."
        : `${route.params.taskTitle} is now in progress.`;

      Alert.alert(successTitle, successMessage, [
        {
          text: "OK",
          onPress: () => {
            if (route.params.onScanSuccess) {
              route.params.onScanSuccess();
            }
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Start failed", error?.response?.data?.message ?? "Unable to start task.");
      setIsScanEnabled(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (!scanAllowedRef.current) {
        return;
      }
      void handleScanned(data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!permission) {
    return (
      <LoadingState
        fullScreen
        title="Opening camera"
        message="Checking camera access before the QR scanner starts."
      />
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <EmptyState
          icon="CameraOff"
          title="Camera access required"
          message="The mobile app uses your camera to scan the QR code attached to the task location or template."
          action={{
            label: "Allow Camera",
            onPress: () => void requestPermission(),
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {isCameraActive ? (
        <CameraView
          key={cameraKey}
          // NativeWind's babel plugin only maps className for react-native
          // core imports — on CameraView (expo-camera) className is silently
          // ignored, leaving the view at 0x0: preview black, scanning still
          // worked. Use an explicit style instead of className here.
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={BARCODE_SCANNER_SETTINGS}
          onBarcodeScanned={handleBarcodeScanned}
          enableTorch={isTorchOn}
          onCameraReady={() => {
            cameraReadyRef.current = true;
          }}
        />
      ) : (
        <View className="absolute inset-0 items-center justify-center">
          <SpinningLoader />
        </View>
      )}

      <View className="flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-sm border-0 bg-black/60">
          <CardContent className="flex-row items-center gap-3 p-4">
            {isSubmitting ? <SpinningLoader /> : null}
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white">{route.params.taskTitle}</Text>
              <Text className="text-xs text-white/70">
                Hold the QR code inside the frame below.
              </Text>
            </View>
          </CardContent>
        </Card>

        <View className="my-6 h-[260px] w-[260px]">
          {/* Dim everything OUTSIDE the scan frame — the frame area itself
              stays fully transparent so the camera preview is not darkened. */}
          <View className="absolute bottom-full left-[-1000px] right-[-1000px] h-[1000px] bg-black/45" />
          <View className="absolute top-full left-[-1000px] right-[-1000px] h-[1000px] bg-black/45" />
          <View className="absolute bottom-0 right-full top-0 w-[1000px] bg-black/45" />
          <View className="absolute bottom-0 left-full top-0 w-[1000px] bg-black/45" />
          <View className="absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 border-primary" />
          <View className="absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 border-primary" />
          <View className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-primary" />
          <View className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-primary" />
        </View>

        <View className="flex-row gap-3">
          <Button
            variant="outline"
            className="border-white/30 bg-black/40 text-white"
            onPress={() => setIsTorchOn((on) => !on)}
          >
            <View className="flex-row items-center gap-2">
              <Icon name="Flashlight" size={16} color="white" />
              <Text className="text-white">{isTorchOn ? "Torch Off" : "Torch On"}</Text>
            </View>
          </Button>

          {!isScanEnabled ? (
            <Button
              variant="outline"
              className="border-white/30 bg-black/40 text-white"
              onPress={() => setIsScanEnabled(true)}
            >
              Scan Again
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  );
}
