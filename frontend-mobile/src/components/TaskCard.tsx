import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Card, CardContent } from "./ui/card";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";
import { StatusBadge } from "./StatusBadge";
import { formatTaskWindow } from "../utils/format";
import type { TaskInstance } from "../types";

type TaskCardProps = {
  task: TaskInstance;
  onStart?: () => void;
  onComplete?: () => void;
};

export function TaskCard({ task, onStart, onComplete }: TaskCardProps) {
  const handlePress = (callback?: () => void) => {
    return () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      callback?.();
    };
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-base font-bold text-card-foreground">
              {task.title}
            </Text>
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <Icon name="MapPin" size={14} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {task.template?.location?.name ?? "Assigned location"}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center gap-1.5">
              <Icon name="Clock" size={14} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {formatTaskWindow(task.shiftStart, task.shiftEnd)}
              </Text>
            </View>
          </View>
          <StatusBadge status={task.status} />
        </View>

        {task.status === "PENDING" && onStart ? (
          <Button
            className="mt-4"
            iconLeft="QrCode"
            onPress={handlePress(onStart)}
          >
            Scan QR to Start
          </Button>
        ) : null}
        {task.status === "IN_PROGRESS" && onComplete ? (
          <Button
            className="mt-4"
            variant="outline"
            iconLeft="Camera"
            onPress={handlePress(onComplete)}
          >
            Upload Proof & Complete
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
