import { useLanguage } from "../i18n/LanguageProvider";
import { View } from "react-native";
import { Text } from "./ui/text";
import { cn } from "../lib/utils";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  right,
  className,
}: ScreenHeaderProps) {
  const { isRTL } = useLanguage();
  return (
    <View
      style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        flexWrap: "wrap",
        gap: 12,
      }}
      className={cn("items-start justify-between", className)}
    >
      <View className="flex-1">
        <Text className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-2 text-base text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}
