import { View, ActivityIndicator } from "react-native";
import { Text } from "../../components/ui/text";
import { Icon } from "../../components/ui/icon";
import { useLanguage } from "../../i18n/LanguageProvider";
import { photoStatuses } from "../../verification/presentation";
import { checkedPhotoState } from "../../verification/policy";
import { photoFeedback, requiredPhotoIds, photoCorrection } from "../../verification/feedback";
import type {
  LocalSession,
  Manifest,
  QueueRow,
} from "../../verification/types";
export function VerificationProgress({
  manifest,
  local,
  rows,
  online,
  lastUpdated,
}: {
  manifest: Manifest;
  local: LocalSession | null;
  rows: QueueRow[];
  online: boolean;
  lastUpdated: number | null;
}) {
  const { t, isRTL } = useLanguage();
  const required = requiredPhotoIds(manifest);
  const photos = photoStatuses(manifest, local, rows).filter(
    (p) => required.has(p.key) || p.key === "ENTRANCE" || p.key === "LAYOUT",
  );
  const finished =
    manifest.task.status === "COMPLETED" ||
    !!manifest.staffSubmittedAt ||
    !!manifest.task.completionOutcome;
  const received = photos.filter((p) =>
    [
      "SERVER_ACCEPTED",
      "PROCESSING",
      "PASSED",
      "MANAGER_ACCEPTED",
      "RECAPTURE_REQUIRED",
      "CLEANING_REQUIRED",
      "REVIEW_REQUIRED",
      "PRIVACY_HOLD",
      "SERVICE_FAILURE",
    ].includes(p.state),
  ).length;
  const requested = photos.filter((p) => p.state !== "WAIVED").length;
  const attention = photos.some((p) =>
    ["RECAPTURE_REQUIRED", "CLEANING_REQUIRED"].includes(p.state),
  );
  const uploading = photos.some((p) => p.state === "UPLOADING");
  const checking = photos.some((p) =>
    ["SERVER_ACCEPTED", "PROCESSING"].includes(p.state),
  );
  const saved = photos.some((p) =>
    ["SAVED", "RETRY_WAIT", "AUTH_REQUIRED", "BLOCKED"].includes(p.state),
  );
  const allChecked =
    photos.length > 0 && photos.every((p) => checkedPhotoState(p.state));
  const title = finished
    ? "Work submitted"
    : attention
      ? "Photo needs attention"
      : uploading
        ? "Photo uploading"
        : checking
          ? "Photo received and being checked"
          : saved
            ? "Photo saved on this phone"
            : allChecked
              ? "Ready to submit"
              : "Photo needed";
  return (
    <View className="gap-5">
      <View className="gap-3 rounded-2xl bg-accent p-5">
        <Icon
          name={finished ? "CircleCheck" : attention ? "CircleAlert" : "Camera"}
          size={32}
          className="text-primary"
        />
        <Text accessibilityLiveRegion="polite" className="text-2xl font-bold">
          {t(title)}
        </Text>
        <Text className="text-base leading-7">
          {t(
            finished
              ? "Your work has been submitted. Your manager may still need to review it."
              : !online
                ? "Saved photos stay on this phone. Reconnect and keep the app open to upload."
                : allChecked
                  ? "Your work is ready to submit. Manager review may still be needed."
                  : uploading || checking
                    ? "Keep the app open while the current photo uploads and is checked."
                    : "Follow the photo guide to finish your task.",
          )}
        </Text>
        {!finished ? (
          <Text className="text-base font-semibold">
            {t("{count} photos received", { count: received })} / {requested}
          </Text>
        ) : null}
      </View>
      {!finished ? (
        <View className="rounded-2xl border border-border bg-card px-5">
          {photos.map((photo, index) => {
            const feedback = photoFeedback(photo.state);
            return (
              <View
                key={photo.key}
                style={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: 12,
                  alignItems: "flex-start",
                  paddingVertical: 18,
                  borderTopWidth: index ? 1 : 0,
                  borderColor: "#D9E3DE",
                }}
              >
                {feedback.kind === "sending" ? (
                  <ActivityIndicator color="#11675B" />
                ) : (
                  <Icon
                    name={
                      feedback.kind === "done"
                        ? "CircleCheck"
                        : feedback.kind === "action"
                          ? "CircleAlert"
                          : feedback.kind === "review"
                            ? "Clock"
                            : "Camera"
                    }
                    size={22}
                    className="text-primary"
                  />
                )}
                <View className="flex-1 gap-2">
                  <Text className="text-lg font-semibold">{photo.title}</Text>
                  <Text className="text-base">{t(feedback.label)}</Text>
                  {feedback.detail ? (
                    <Text className="text-base text-muted-foreground">
                      {t(feedback.detail)}
                    </Text>
                  ) : null}
                  {feedback.kind === "action" && photo.detail ? (
                    <Text className="text-base leading-7">{photoCorrection(photo.detail, t)}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
      {!finished && lastUpdated ? (
        <Text className="text-sm text-muted-foreground">
          {t("Results updated")} ·{" "}
          {new Date(lastUpdated).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      ) : null}
    </View>
  );
}
