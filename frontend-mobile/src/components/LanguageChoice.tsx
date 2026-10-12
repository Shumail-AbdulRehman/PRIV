import { View } from "react-native";
import { Button } from "./ui/button";
import { useLanguage } from "../i18n/LanguageProvider";
export function LanguageChoice() {
  const { language, setLanguage, isRTL } = useLanguage();
  return (
    <View
      style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: 4,
        alignSelf: isRTL ? "flex-end" : "flex-start",
      }}
      accessibilityLabel="Language / زبان"
    >
      <Button
        variant={language === "en" ? "secondary" : "ghost"}
        accessibilityState={{ selected: language === "en" }}
        onPress={() => setLanguage("en")}
      >
        English
      </Button>
      <Button
        variant={language === "ur" ? "secondary" : "ghost"}
        accessibilityState={{ selected: language === "ur" }}
        onPress={() => setLanguage("ur")}
      >
        اردو
      </Button>
    </View>
  );
}
