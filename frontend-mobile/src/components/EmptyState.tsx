import { View } from "react-native";
import { Icon, type LucideIconName } from "./ui/icon";
import { Text } from "./ui/text";
import { Button } from "./ui/button";

type EmptyStateProps = {
  icon: LucideIconName;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View className="items-center justify-center rounded-xl border border-border bg-card p-6">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Icon name={icon} size={28} className="text-muted-foreground" />
      </View>
      <Text className="text-center text-lg font-semibold text-card-foreground">
        {title}
      </Text>
      <Text className="mt-1 text-center text-sm text-muted-foreground">
        {message}
      </Text>
      {action ? (
        <Button
          variant="outline"
          className="mt-4"
          onPress={action.onPress}
        >
          {action.label}
        </Button>
      ) : null}
    </View>
  );
}
