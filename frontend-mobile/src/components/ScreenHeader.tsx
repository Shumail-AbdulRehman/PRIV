import { View } from "react-native";
import { Text } from "./ui/text";
import { cn } from "../lib/utils";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
};

export function ScreenHeader({ title, subtitle, right, className }: ScreenHeaderProps) {
  return (
    <View className={cn("flex-row items-start justify-between gap-4", className)}>
      <View className="flex-1">
        <Text className="text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}
