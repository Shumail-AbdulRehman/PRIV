import { useState } from "react";
import { Alert, Image, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFormData } from "../api/client";
import { Button } from "../components/ui/button";
import { staffQueryKeys } from "../queries/staff";
import { Card, CardContent } from "../components/ui/card";
import { Text } from "../components/ui/text";
import { Icon } from "../components/ui/icon";
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
  const [areaErrors, setAreaErrors] = useState<Record<string, string>>({});

  const sortedAreas = hasReferenceAreas
    ? [...referenceAreas!].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const capturedAreaCount = sortedAreas.filter((area) => areaPhotos[area.id]).length;
  const allAreasCaptured = capturedAreaCount === sortedAreas.length;

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
      setAreaErrors({});
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
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
      setAreaErrors((prev) => {
        const next = { ...prev };
        const area = sortedAreas.find((a) => a.id === areaId);
        if (area) {
          delete next[area.name];
        }
        return next;
      });
    }
  };

  const submitCompletion = async () => {
    try {
      setSubmitting(true);
      setAreaErrors({});

      const formData = new FormData();

      if (hasReferenceAreas) {
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

      const nextAreaErrors: Record<string, string> = {};
      errors.forEach(
        (e: { field?: string; message?: string; score?: number; threshold?: number }) => {
          if (e.field && e.message) {
            nextAreaErrors[e.field] = e.score != null && e.threshold != null
              ? `${e.message} (threshold: ${e.threshold})`
              : e.message;
          }
        }
      );
      setAreaErrors(nextAreaErrors);

      Alert.alert("Completion failed", fullMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-4 pb-8"
    >
      <Card>
        <CardContent className="gap-1 p-4">
          <Text className="text-base font-semibold text-card-foreground">{taskTitle}</Text>
          <Text className="text-sm text-muted-foreground">
            {hasReferenceAreas
              ? "Capture a photo for each reference area. Camera-only capture is required to prevent cheating."
              : "Attach up to 5 clear images before marking this task complete."}
          </Text>
        </CardContent>
      </Card>

      {hasReferenceAreas ? (
        <View className="gap-3">
          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">
              {capturedAreaCount} of {sortedAreas.length} areas captured
            </Text>
            <View className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <View
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${sortedAreas.length ? (capturedAreaCount / sortedAreas.length) * 100 : 0}%`,
                }}
              />
            </View>
          </View>

          {sortedAreas.map((area) => {
            const photo = areaPhotos[area.id];
            const error = areaErrors[area.name];

            return (
              <Card key={area.id}>
                <CardContent className="p-4">
                  <View className="flex-row items-center gap-3">
                    {photo ? (
                      <Icon name="CheckCircle2" size={20} className="text-primary" />
                    ) : (
                      <Icon name="Circle" size={20} className="text-muted-foreground" />
                    )}
                    <Text className="flex-1 font-semibold text-card-foreground">
                      {area.name}
                    </Text>
                    {photo ? (
                      <Image
                        source={{ uri: photo.uri }}
                        className="h-14 w-14 rounded-lg bg-secondary"
                      />
                    ) : null}
                    <Button
                      variant={photo ? "outline" : "default"}
                      size="sm"
                      onPress={() => void captureAreaPhoto(area.id)}
                    >
                      {photo ? "Retake" : "Capture"}
                    </Button>
                  </View>
                  {error ? (
                    <Text className="mt-2 text-sm text-destructive">{error}</Text>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </View>
      ) : (
        <Card>
          <CardContent className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-card-foreground">
                Selected images
              </Text>
              <View className="rounded-full bg-secondary px-2.5 py-1">
                <Text className="text-xs font-semibold text-secondary-foreground">
                  {selectedImages.length}/5
                </Text>
              </View>
            </View>

            {selectedImages.length ? (
              <View className="gap-2">
                {selectedImages.map((image, index) => (
                  <View
                    key={image.uri}
                    className="flex-row items-center gap-3 rounded-lg bg-secondary p-2"
                  >
                    <Image
                      source={{ uri: image.uri }}
                      className="h-10 w-10 rounded-md bg-muted"
                    />
                    <Text
                      className="flex-1 text-sm font-medium text-secondary-foreground"
                      numberOfLines={1}
                    >
                      {image.fileName ?? image.uri.split("/").pop() ?? "Selected image"}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {Math.round((image.fileSize ?? 0) / 1024)} KB
                    </Text>
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={() => removeImage(index)}
                      accessibilityLabel="Remove image"
                    >
                      <Icon name="X" size={16} className="text-destructive" />
                    </Button>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-muted-foreground">
                No proof images selected yet.
              </Text>
            )}

            <Button
              variant="outline"
              className="border-dashed"
              onPress={() => void pickImages()}
              iconLeft="ImagePlus"
            >
              Choose Proof Images
            </Button>
          </CardContent>
        </Card>
      )}

      <Button
        loading={submitting}
        disabled={hasReferenceAreas ? !allAreasCaptured : selectedImages.length === 0}
        onPress={() => void submitCompletion()}
      >
        Complete Task
      </Button>
    </ScrollView>
  );
}
