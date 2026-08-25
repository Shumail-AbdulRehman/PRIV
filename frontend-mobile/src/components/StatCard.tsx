import { View } from "react-native";
import { Icon, type LucideIconName } from "./ui/icon";
import { Text } from "./ui/text";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIconName;
};

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View className="flex-1 rounded-xl border border-border bg-card p-4">
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-lg bg-accent">
        <Icon name={icon} size={20} className="text-accent-foreground" />
      </View>
      <Text className="text-2xl font-extrabold text-card-foreground">{value}</Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
