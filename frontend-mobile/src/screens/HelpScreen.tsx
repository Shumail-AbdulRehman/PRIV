import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../i18n/LanguageProvider";
import { Text } from "../components/ui/text";
import { Button } from "../components/ui/button";
import { LanguageChoice } from "../components/LanguageChoice";
import { ScreenHeader } from "../components/ScreenHeader";
export function HelpScreen() {
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  async function signOut() {
    Alert.alert(t("Sign out"), t("Sign out"), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("Sign out"),
        style: "destructive",
        onPress: () => void logout(),
      },
    ]);
  }
  const help = t("Check in, complete your cleaning tasks, and upload every required photo.");
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 24,
        gap: 24,
      }}
    >
      <ScreenHeader title={t("Help & account")} />
      <LanguageChoice />
      <View className="gap-3 rounded-2xl border border-border bg-card p-5">
        <Text className="text-xl font-bold">{t("Your workflow")}</Text>
        <Text className="text-base leading-7">{help}</Text>

      </View>
      <View className="gap-3">
        <Text className="text-base font-semibold">{t("Your account")}</Text>
        <Text className="text-xl font-bold">{user?.name}</Text>
        <Text
          style={{
            writingDirection: "ltr",
            textAlign: isRTL ? "right" : "left",
          }}
          className="text-base text-muted-foreground"
        >
          {user?.email}
        </Text>
        <Button
          variant="outline"
          iconLeft="LogOut"
          onPress={() => void signOut()}
        >
          {t("Sign out")}
        </Button>
      </View>
    </ScrollView>
  );
}
