import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button } from "../components/Button";
import { LoadingState } from "../components/LoadingState";
import { client } from "../api/client";
import { staffQueryKeys } from "../queries/staff";
import { cardCore, cardShell, colors, radius, shadow, typography } from "../theme";
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
      <View style={styles.permissionScreen}>
        <View style={styles.permissionShell}>
          <View style={styles.permissionCard}>
            <Text style={styles.permissionEyebrow}>Camera permission</Text>
            <Text style={styles.permissionTitle}>Camera access is required</Text>
            <Text style={styles.permissionCopy}>
              The mobile app uses your camera to scan the QR code attached to the task location or template.
            </Text>
            <Button label="Allow Camera" onPress={() => void requestPermission()} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          isScanEnabled
            ? ({ data }) => {
                void handleScanned(data);
              }
            : undefined
        }
      />

      <View style={styles.overlay}>
        <View style={styles.copyPanel}>
          <Text style={styles.kicker}>Scan QR</Text>
          <Text style={styles.title}>{route.params.taskTitle}</Text>
          <Text style={styles.copy}>
            Hold the code inside the frame. The app will start the task as soon as the QR token matches.
          </Text>
        </View>

        <View style={styles.frameShell}>
          <View style={styles.frame} />
        </View>

        {!isScanEnabled ? (
          <Button label="Scan Again" onPress={() => setIsScanEnabled(true)} variant="secondary" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.black,
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: colors.canvas,
    padding: 24,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 16,
  },
  permissionShell: {
    ...cardShell,
    ...shadow.lifted,
  },
  permissionCard: {
    ...cardCore,
    padding: 22,
    gap: 14,
  },
  permissionEyebrow: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.mint,
    color: colors.teal,
    ...typography.eyebrow,
  },
  permissionTitle: {
    ...typography.screenTitle,
    color: colors.ink,
  },
  permissionCopy: {
    ...typography.body,
    color: colors.inkMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5, 7, 6, 0.46)",
    padding: 24,
    justifyContent: "center",
    gap: 16,
  },
  copyPanel: {
    borderRadius: radius.xl,
    padding: 18,
    backgroundColor: "rgba(5, 7, 6, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    gap: 10,
  },
  kicker: {
    color: colors.mint,
    ...typography.eyebrow,
  },
  title: {
    ...typography.screenTitle,
    color: colors.white,
  },
  copy: {
    ...typography.body,
    color: "#d4e8e2",
  },
  frameShell: {
    alignSelf: "center",
    width: 268,
    height: 268,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12,
  },
  frame: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: "transparent",
  },
});
