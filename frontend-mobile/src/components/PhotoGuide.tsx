import { View } from "react-native";
import { Icon, type LucideIconName } from "./ui/icon";
import { Text } from "./ui/text";
import { useLanguage } from "../i18n/LanguageProvider";
/** Illustration only; never a replacement for the snapshotted instruction. */
export function PhotoGuide({
  fixture,
  instruction,
}: {
  fixture?: string;
  instruction: string;
}) {
  const { t, isRTL } = useLanguage();
  const icons: Record<string, LucideIconName> = {
    TOILET: "Toilet",
    INDIAN_TOILET: "Toilet",
    WESTERN_TOILET: "Toilet",
    SINK: "Bath",
    MIRROR: "RectangleVertical",
    BIN: "Trash2",
    FLOOR: "Grid2X2",
  };
  return (
    <View
      style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        alignItems: "center",
        gap: 12,
      }}
      className="py-1"
    >
      <View
        className="items-center justify-center rounded-full bg-accent p-2"
        style={{ width: 48, minHeight: 48 }}
        accessible={false}
      >
        <Icon
          name={icons[fixture ?? ""] ?? "ScanLine"}
          size={24}
          className="text-primary"
        />
      </View>
      <Text className="flex-1 text-base leading-6 text-muted-foreground">
        {t(instruction)}
      </Text>
    </View>
  );
}
