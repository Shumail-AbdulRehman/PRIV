import { View } from "react-native";
import { Text } from "./ui/text";

type FactRowProps = {
  label: string;
  value: string;
};

export function FactRow({ label, value }: FactRowProps) {
  return (
    <View className="flex-1 min-w-[45%]">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="mt-0.5 text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
