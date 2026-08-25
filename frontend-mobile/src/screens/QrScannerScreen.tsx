import { useState } from "react";
import { Alert, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
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

  const handleScanned = async (rawValue: string) => {
    if (!isScanEnabled || isSubmitting) {
      return;
    }

    try {
      setIsScanEnabled(false);
      setIsSubmitting(true);

      await client.post(
        `/task-instance/${route.params.taskId}/start`,
        undefined,
        {
          params: {
            qrToken: extractQrToken(rawValue),
          },
        }
      );
      await queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });

      Alert.alert("Task started", `${route.params.taskTitle} is now in progress.`, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Start failed", error?.response?.data?.message ?? "Unable to start task.");
      setIsScanEnabled(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <CameraView
        className="absolute inset-0"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          isScanEnabled
            ? ({ data }) => {
                void handleScanned(data);
              }
            : undefined
        }
      />

      <View className="flex-1 items-center justify-center bg-black/45 p-6">
        <Card className="w-full max-w-sm border-0 bg-black/60">
          <CardContent className="flex-row items-center gap-3 p-4">
            {isSubmitting ? (
              <View className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : null}
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white">{route.params.taskTitle}</Text>
              <Text className="text-xs text-white/70">
                Hold the QR code inside the frame below.
              </Text>
            </View>
          </CardContent>
        </Card>

        <View className="my-6 h-[260px] w-[260px]">
          <View className="absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 border-primary" />
          <View className="absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 border-primary" />
          <View className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-primary" />
          <View className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-primary" />
        </View>

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
  );
}
