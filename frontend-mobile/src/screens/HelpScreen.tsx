import { useState } from "react";
import { Linking } from "react-native";
import { LaunchRecovery } from "../launch/LaunchRecovery";
import { registerPhoneAlerts } from "../notifications/native";
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
  const { t, isRTL, language } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [pushNotice, setPushNotice] = useState('');
  const [pushBusy, setPushBusy] = useState(false);
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
        <Text accessibilityRole="header" className="text-xl font-bold">{t('Permissions & help')}</Text>
        <Text className="text-base leading-7">{t('Camera and location are required for attendance. Task photos also require current server authority. Turning on permissions does not renew expired authority.')}</Text>
        <Text className="text-base leading-7">{t('Ask your assigned manager about your shift, task QR or an access code.')}</Text>
        <Button variant="outline" onPress={() => void Linking.openSettings().catch(() => setPushNotice(t('Open this app in your phone settings.')))}>{t('Open settings')}</Button>
        <Button variant="outline" loading={pushBusy} disabled={pushBusy || !user} onPress={async () => {
          if (!user || pushBusy) return; setPushBusy(true);
          try { const state = await registerPhoneAlerts(`${user.companyId}_${user.id}`, language, true);
            setPushNotice(t(state === 'enabled' ? 'Phone alerts registered.' : state === 'denied' ? 'Phone alerts are denied. Open settings to allow them.' : state === 'unavailable' ? 'Phone alerts are unavailable on this device or app configuration.' : 'Phone alerts could not be confirmed. Check your connection and retry.'));
          } finally { setPushBusy(false); }
        }}>{t('Retry phone alerts')}</Button>
        {pushNotice ? <Text accessibilityLiveRegion="polite" className="text-base">{pushNotice}</Text> : null}
      </View>
      {editing ? <LaunchRecovery onCancel={() => setEditing(false)} onComplete={async () => {await logout().catch(() => {});}} /> : <Button variant="outline" onPress={() => setEditing(true)}>{t('Replace your password')}</Button>}
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
