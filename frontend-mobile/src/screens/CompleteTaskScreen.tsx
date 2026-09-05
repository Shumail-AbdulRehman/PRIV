import { useState } from "react";
import { Alert, Image, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFormData } from "../api/client";
import { client } from "../api/client";
import { Button } from "../components/ui/button";
import { staffQueryKeys } from "../queries/staff";
import { Card, CardContent } from "../components/ui/card";
import { Text } from "../components/ui/text";
import { Icon } from "../components/ui/icon";
import { createImagePart } from "../utils/upload";
import type { AreaUploadResult, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CompleteTask">;

type AreaState = {
  status: "pending" | "scanned" | "uploading" | "uploaded" | "timeout";
  photoUrl?: string;
};

const AREA_UPLOAD_TIMEOUT_MS = 120000;

export function CompleteTaskScreen({ navigation, route }: Props) {
  const queryClient = useQueryClient();
  const { taskId, taskTitle, referenceAreas } = route.params;
  const hasReferenceAreas = referenceAreas && referenceAreas.length > 0;

  const [areaStates, setAreaStates] = useState<Record<number, AreaState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [areaErrors, setAreaErrors] = useState<Record<number, string>>({});

  const sortedAreas = hasReferenceAreas
    ? [...referenceAreas!].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const completedAreaCount = sortedAreas.filter(
    (area) => areaStates[area.id]?.status === "uploaded"
  ).length;
  const allAreasUploaded = completedAreaCount === sortedAreas.length;

  const scanAreaQr = (areaId: number) => {
    navigation.navigate("QrScanner", {
      taskId,
      taskTitle,
      referenceImageId: areaId,
      onScanSuccess: () => {
        setAreaStates((prev) => ({
          ...prev,
          [areaId]: { status: "scanned" },
        }));
        setAreaErrors((prev) => {
          const next = { ...prev };
          delete next[areaId];
          return next;
        });
        void captureAreaPhoto(areaId);
      },
    });
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
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    await uploadAreaPhoto(areaId, result.assets[0]);
  };

  const uploadAreaPhoto = async (
    areaId: number,
    asset: ImagePicker.ImagePickerAsset
  ) => {
    setAreaStates((prev) => ({
      ...prev,
      [areaId]: { status: "uploading" },
    }));

    try {
      const formData = new FormData();
      formData.append(
        "photo",
        createImagePart(
          asset.uri,
          asset.fileName ?? `area-${areaId}.jpg`,
          asset.mimeType
        )
      );

      const response = await uploadFormData<{
        data: AreaUploadResult;
      }>(
        `/task-instance/${taskId}/area/${areaId}/upload`,
        formData,
        AREA_UPLOAD_TIMEOUT_MS
      );

      if (response.data.areaMatchStatus === "blocked") {
        setAreaStates((prev) => ({
          ...prev,
          [areaId]: { status: "scanned" },
        }));
        Alert.alert(
          "Area doesn't match",
          "This photo does not appear to match the expected area. Please make sure you are photographing the correct area and try again."
        );
        return;
      }

      setAreaStates((prev) => ({
        ...prev,
        [areaId]: {
          status: "uploaded",
          photoUrl: response.data.photoUrl,
        },
      }));
      setAreaErrors((prev) => {
        const next = { ...prev };
        delete next[areaId];
        return next;
      });
    } catch (error: any) {
      if (error?.response?.status === 503) {
        setAreaStates((prev) => ({
          ...prev,
          [areaId]: { status: "scanned" },
        }));
        Alert.alert(
          "Verification unavailable",
          "Photo verification is temporarily unavailable. Please try again."
        );
        return;
      }

      const message = error?.response?.data?.message ?? "Upload failed";
      const isTimeout = message.toLowerCase().includes("time exceeded");

      if (isTimeout) {
        setAreaStates((prev) => ({
          ...prev,
          [areaId]: { status: "timeout" },
        }));
      } else {
        setAreaStates((prev) => ({
          ...prev,
          [areaId]: { status: "scanned" },
        }));
      }

      setAreaErrors((prev) => ({ ...prev, [areaId]: message }));
    }
  };

  const submitCompletion = async () => {
    try {
      setSubmitting(true);
      setAreaErrors({});

      await client.post(`/task-instance/${taskId}/complete`);
      await queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });

      Alert.alert("Task completed", `${taskTitle} was completed successfully.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Unable to complete task.";
      Alert.alert("Completion failed", message);
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
              ? "Scan the QR code for each area, then capture the photo within 90 seconds."
              : "Attach up to 5 clear images before marking this task complete."}
          </Text>
        </CardContent>
      </Card>

      {hasReferenceAreas ? (
        <View className="gap-3">
          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">
              {completedAreaCount} of {sortedAreas.length} areas uploaded
            </Text>
            <View className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <View
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${sortedAreas.length ? (completedAreaCount / sortedAreas.length) * 100 : 0}%`,
                }}
              />
            </View>
          </View>

          {sortedAreas.map((area) => {
            const state = areaStates[area.id];
            const error = areaErrors[area.id];

            return (
              <Card key={area.id}>
                <CardContent className="p-4">
                  <View className="flex-row items-center gap-3">
                    {state?.status === "uploaded" ? (
                      <Icon name="CheckCircle2" size={20} className="text-primary" />
                    ) : state?.status === "timeout" ? (
                      <Icon name="AlertCircle" size={20} className="text-destructive" />
                    ) : (
                      <Icon name="Circle" size={20} className="text-muted-foreground" />
                    )}
                    <Text className="flex-1 font-semibold text-card-foreground">
                      {area.name}
                    </Text>
                    {state?.photoUrl ? (
                      <Image
                        source={{ uri: state.photoUrl }}
                        className="h-14 w-14 rounded-lg bg-secondary"
                      />
                    ) : null}
                  </View>

                  {area.imageUrl ? (
                    <View className="mt-3 flex-row items-center gap-3 rounded-lg bg-secondary p-2">
                      <Image
                        source={{ uri: area.imageUrl }}
                        className="h-16 w-16 rounded-md bg-muted"
                        resizeMode="cover"
                      />
                      <View className="flex-1">
                        <Text className="text-xs font-semibold text-secondary-foreground">
                          Reference photo
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          Match this angle when photographing the area.
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {state?.status === "uploaded" ? (
                    <Text className="mt-2 text-sm text-primary">Photo uploaded</Text>
                  ) : state?.status === "uploading" ? (
                    <Button loading disabled size="sm" className="mt-3">
                      Uploading photo…
                    </Button>
                  ) : (
                    <Button
                      variant={state?.status === "timeout" ? "destructive" : "default"}
                      size="sm"
                      className="mt-3"
                      onPress={() => void scanAreaQr(area.id)}
                    >
                      {state?.status === "timeout"
                        ? "Time expired — re-scan QR"
                        : state?.status === "scanned"
                        ? "Capture photo"
                        : "Scan QR to capture"}
                    </Button>
                  )}

                  {error ? (
                    <Text className="mt-2 text-sm text-destructive">{error}</Text>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}

          <Button
            loading={submitting}
            disabled={!allAreasUploaded}
            onPress={() => void submitCompletion()}
          >
            Complete task
          </Button>
        </View>
      ) : (
        <LegacyGalleryCompletion
          taskId={taskId}
          taskTitle={taskTitle}
          onCompleted={() => navigation.goBack()}
        />
      )}
    </ScrollView>
  );
}

function LegacyGalleryCompletion({
  taskId,
  taskTitle,
  onCompleted,
}: {
  taskId: number;
  taskTitle: string;
  onCompleted: () => void;
}) {
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
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

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submitCompletion = async () => {
    try {
      setSubmitting(true);

      if (!selectedImages.length) {
        Alert.alert("Images required", "Select at least one proof image before completing the task.");
        return;
      }

      const formData = new FormData();
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

      await uploadFormData(`/task-instance/${taskId}/complete`, formData, 120000);
      await queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });

      Alert.alert("Task completed", `${taskTitle} was completed successfully.`, [
        { text: "OK", onPress: onCompleted },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Unable to complete task.";
      Alert.alert("Completion failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="gap-3">
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

      <Button
        loading={submitting}
        disabled={selectedImages.length === 0}
        onPress={() => void submitCompletion()}
      >
        Complete Task
      </Button>
    </View>
  );
}
