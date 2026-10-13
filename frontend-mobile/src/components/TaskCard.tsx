import { taskCardStatus } from "../utils/taskStatus";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Card, CardContent } from "./ui/card";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";
import { useLanguage } from "../i18n/LanguageProvider";
import { formatTaskWindow } from "../utils/format";
import type { TaskInstance } from "../types";
export function TaskCard({
  task,
  onStart,
  onComplete,
  starting = false,
}: {
  task: TaskInstance;
  onStart?: () => void;
  onComplete?: () => void;
  starting?: boolean;
}) {
  const { t, isRTL } = useLanguage();
  const submitted = task.status === "COMPLETED" || !!task.completionOutcome;
  const pending = task.status === "PENDING";
  const callback = pending ? onStart : submitted ? undefined : onComplete;
  const status = taskCardStatus(task);
  return (
    <Card className="mb-2">
      <CardContent className="gap-3 p-4">
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <View className="rounded-full bg-accent p-3">
            <Icon
              name={submitted ? "CircleCheck" : "DoorOpen"}
              size={22}
              className="text-primary"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-lg font-bold">
              {task.areaNameSnapshot ?? task.title}
            </Text>
            {task.areaNameSnapshot ? (
              <Text className="mt-1 text-base text-muted-foreground">
                {task.title}
              </Text>
            ) : null}
          </View>
        </View>
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: 8,
            alignItems: "center",
          }}
        >
          <Icon name="Clock" size={18} className="text-muted-foreground" />
          <Text
            style={{
              writingDirection: "ltr",
              textAlign: isRTL ? "right" : "left",
            }}
            className="flex-1 text-base text-muted-foreground"
          >
            {formatTaskWindow(
              task.shiftStart,
              task.shiftEnd,
              task.location?.timezone ?? task.template?.location?.timezone,
            )}
          </Text>
        </View>
        <Text className="self-start rounded-full bg-accent px-3 py-1 text-sm font-semibold text-primary">
          {t(status)}
        </Text>
        {callback ? (
          <Button
            size="lg"
            iconLeft={pending ? "QrCode" : "Camera"}
            loading={starting}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              callback();
            }}
          >
            {t(pending ? "Start cleaning" : "Take task photos")}
          </Button>
        ) : null}
        {task.template?.description ? (
          <Text className="text-base text-muted-foreground">
            {task.template.description}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
