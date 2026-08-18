import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFormData } from "../api/client";
import { Button } from "../components/Button";
import { staffQueryKeys } from "../queries/staff";
import { cardCore, cardShell, colors, radius, shadow, typography } from "../theme";
import { createImagePart } from "../utils/upload";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CompleteTask">;

type CapturedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string;
  fileSize?: number | null;
};

const COMPLETE_TASK_TIMEOUT_MS = 120000;

export function CompleteTaskScreen({ navigation, route }: Props) {
  const queryClient = useQueryClient();
  const { taskId, taskTitle, referenceAreas } = route.params;
  const hasReferenceAreas = referenceAreas && referenceAreas.length > 0;

  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [areaPhotos, setAreaPhotos] = useState<Record<number, CapturedImage>>({});
  const [submitting, setSubmitting] = useState(false);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Photos required", "Allow photo library access to attach task proof images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImages(result.assets.slice(0, 5));
    }
  };

  const captureAreaPhoto = async (areaId: number) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Camera required", "Allow camera access to capture this area photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAreaPhotos((prev) => ({
        ...prev,
        [areaId]: {
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
        },
      }));
    }
  };

  const submitCompletion = async () => {
    try {
      setSubmitting(true);

      const formData = new FormData();

      if (hasReferenceAreas) {
        const sortedAreas = [...referenceAreas!].sort((a, b) => a.sortOrder - b.sortOrder);
        const missingAreas = sortedAreas.filter((area) => !areaPhotos[area.id]);

        if (missingAreas.length > 0) {
          Alert.alert(
            "Photos required",
            `Please capture a photo for: ${missingAreas.map((a) => a.name).join(", ")}`
          );
          return;
        }

        sortedAreas.forEach((area) => {
          const photo = areaPhotos[area.id];
          formData.append(
            "images",
            createImagePart(
              photo.uri,
              photo.fileName ?? `${area.name.replace(/\s+/g, "_")}.jpg`,
              photo.mimeType
            )
          );
          formData.append("areaNames", area.name);
        });
      } else {
        if (!selectedImages.length) {
          Alert.alert("Images required", "Select at least one proof image before completing the task.");
          return;
        }

        selectedImages.forEach((image, index) => {
          formData.append(
            "images",
            createImagePart(
              image.uri,
              image.fileName ?? `proof-${index + 1}.jpg`,
              image.mimeType
            )
          );
        });
      }

      await uploadFormData(
        `/task-instance/${taskId}/complete`,
        formData,
        COMPLETE_TASK_TIMEOUT_MS
      );
      await queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });

      Alert.alert("Task completed", `${taskTitle} was completed successfully.`, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      const responseData = error?.response?.data;
      const serverMessage = responseData?.message ?? "Unable to complete task.";
      const errors = responseData?.errors ?? [];

      const scoreLines = errors
        .map((e: { field?: string; message?: string; score?: number; threshold?: number }) => {
          if (e.score != null && e.threshold != null) {
            return `${e.message} (threshold: ${e.threshold})`;
          }
          return e.message;
        })
        .filter(Boolean)
        .join("\n");

      const fullMessage = scoreLines ? `${serverMessage}\n\n${scoreLines}` : serverMessage;

      Alert.alert("Completion failed", fullMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroShell}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Completion proof</Text>
          <Text style={styles.heading}>{taskTitle}</Text>
          <Text style={styles.copy}>
            {hasReferenceAreas
              ? "Capture a photo for each reference area. Camera-only capture is required to prevent cheating."
              : "Attach up to 5 clear images before marking this task complete."}
          </Text>
        </View>
      </View>

      {hasReferenceAreas ? (
        <View style={styles.panelShell}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Reference areas</Text>
            {referenceAreas!
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((area) => {
                const photo = areaPhotos[area.id];
                return (
                  <View key={area.id} style={styles.areaRow}>
                    <View style={styles.areaInfo}>
                      <Text style={styles.areaName}>{area.name}</Text>
                      {photo ? (
                        <Text style={styles.areaMeta}>
                          {photo.fileName ?? "Captured"} ·{" "}
                          {Math.round((photo.fileSize ?? 0) / 1024)} KB
                        </Text>
                      ) : (
                        <Text style={styles.areaPending}>Photo required</Text>
                      )}
                    </View>
                    {photo ? (
                      <Image source={{ uri: photo.uri }} style={styles.areaThumbnail} />
                    ) : null}
                    <Button
                      label={photo ? "Retake" : "Capture"}
                      onPress={() => void captureAreaPhoto(area.id)}
                      variant={photo ? "secondary" : "primary"}
                      style={styles.areaButton}
                    />
                  </View>
                );
              })}
          </View>
        </View>
      ) : (
        <View style={styles.panelShell}>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Selected images</Text>
              <Text style={styles.countBadge}>{selectedImages.length}/5</Text>
            </View>
            {selectedImages.length ? (
              selectedImages.map((image, index) => (
                <View key={image.uri} style={styles.imageRow}>
                  <View style={styles.imageIndex}>
                    <Text style={styles.imageIndexText}>{index + 1}</Text>
                  </View>
                  <Text numberOfLines={1} style={styles.imageName}>
                    {image.fileName ?? image.uri.split("/").pop() ?? "Selected image"}
                  </Text>
                  <Text style={styles.imageMeta}>{Math.round((image.fileSize ?? 0) / 1024)} KB</Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>No proof images selected yet.</Text>
            )}
          </View>
        </View>
      )}

      {!hasReferenceAreas && (
        <Button label="Choose Proof Images" onPress={() => void pickImages()} variant="secondary" />
      )}
      <Button label="Complete Task" onPress={() => void submitCompletion()} loading={submitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 16,
  },
  heroShell: {
    ...cardShell,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
    ...shadow.lifted,
  },
  hero: {
    borderRadius: radius.lg,
    padding: 22,
    backgroundColor: colors.forestDeep,
    gap: 10,
  },
  eyebrow: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.mint,
    color: colors.teal,
    ...typography.eyebrow,
  },
  heading: {
    ...typography.screenTitle,
    color: colors.white,
  },
  copy: {
    ...typography.body,
    color: "#c7ddd7",
  },
  panelShell: {
    ...cardShell,
    ...shadow.panel,
  },
  panel: {
    ...cardCore,
    padding: 18,
    gap: 12,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  panelTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  countBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: colors.mint,
    color: colors.teal,
    fontSize: 12,
    fontWeight: "900",
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  imageIndex: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
  },
  imageIndexText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
  imageName: {
    flex: 1,
    color: colors.ink,
    fontWeight: "800",
  },
  imageMeta: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  empty: {
    ...typography.body,
    color: colors.inkMuted,
  },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  areaInfo: {
    flex: 1,
    gap: 2,
  },
  areaName: {
    color: colors.ink,
    fontWeight: "800",
    fontSize: 14,
  },
  areaMeta: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  areaPending: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: "800",
  },
  areaThumbnail: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  areaButton: {
    minWidth: 88,
  },
});
