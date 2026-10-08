import { verificationTaskLabel } from '../verification/taskPresentation';
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Card, CardContent } from "./ui/card";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";
import { formatTaskWindow, formatClockTime } from "../utils/format";
import type { TaskInstance } from "../types";

type TaskCardProps = {
  task: TaskInstance;
  onStart?: () => void;
  onComplete?: () => void;
  starting?: boolean;
};

export function TaskCard({ task, onStart, onComplete, starting = false }: TaskCardProps) {
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
                {task.areaNameSnapshot??task.template?.location?.name ?? "Assigned location"}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center gap-1.5">
              <Icon name="Clock" size={14} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {formatTaskWindow(task.shiftStart, task.shiftEnd,task.location?.timezone??task.template?.location?.timezone)}
              </Text>
            </View>
          </View>
          <Text className="text-sm font-semibold">{verificationTaskLabel(task)}</Text>
        </View>
        {task.template?.description ? <Text className="mt-3 text-sm">{task.template.description}</Text> : null}
        {task.startedAt ? <Text className="mt-2 text-sm text-muted-foreground">Started {formatClockTime(task.startedAt, task.location?.timezone ?? task.template?.location?.timezone)}</Text> : null}

        {task.status === "PENDING" && onStart ? (
          <Button
            className="mt-4"
            iconLeft="Play"
            onPress={handlePress(onStart)}
            loading={starting}
          >
            {starting ? 'Starting cleaning…' : 'Start cleaning'}
          </Button>
        ) : null}
        {(task.status === "IN_PROGRESS" || task.verificationVersion===2) && onComplete ? (
          <Button
            className="mt-4"
            variant="outline"
            iconLeft="Camera"
            onPress={handlePress(onComplete)}
          >
            {verificationTaskLabel(task,true)}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
