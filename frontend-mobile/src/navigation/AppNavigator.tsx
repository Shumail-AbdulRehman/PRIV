import { v5Colors } from '../theme';
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LaunchRecovery } from "../launch/LaunchRecovery";
import { Button } from "../components/ui/button";
import { SpatialDiagnosticScreen } from "../screens/verification/SpatialDiagnosticScreen";
import { VerificationScreen } from "../screens/verification/VerificationScreen";
import { StartTaskScreen } from "../screens/StartTaskScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import { LoadingState } from "../components/LoadingState";
import { StaffTabs } from "./StaffTabs";
import { LoginScreen } from "../screens/LoginScreen";
import type { RootStackParamList } from "../types";

import { useLanguage } from "../i18n/LanguageProvider";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { user, isBootstrapping, passwordChangeRequired, logout } = useAuth();

  if (isBootstrapping) {
    return (
      <LoadingState
        fullScreen
        title="Restoring session"
        message="Checking your saved sign-in and loading the staff workspace."
      />
    );
  }

  if (user && passwordChangeRequired) return <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,paddingTop:insets.top+24,paddingBottom:insets.bottom+24,gap:24}}>
    <LaunchRecovery onComplete={async () => { await logout().catch(() => {}); }} />
    <Button variant="outline" onPress={() => void logout().catch(() => {})}>{t('Sign out')}</Button>
  </ScrollView></KeyboardAvoidingView>;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: v5Colors.surface,
        },
        headerTitleStyle: {
          color: v5Colors.ink,
          fontWeight: "700",
        },
        headerTintColor: v5Colors.primary,
        contentStyle: {
          backgroundColor: v5Colors.surface,
        },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="StaffTabs"
            component={StaffTabs}
            options={{ headerShown: false }}
          />

          {__DEV__ ? (
            <Stack.Screen
              name="SpatialDiagnostic"
              component={SpatialDiagnosticScreen}
              options={{ title: "Spatial diagnostic" }}
            />
          ) : null}
          <Stack.Screen
            name="Verification"
            initialParams={{requirePhotoQr:true}}
            component={VerificationScreen}
            options={{ title: t("Task photos") }}
          />
          <Stack.Screen
            name="StartTask"
            component={StartTaskScreen}
            options={{ title: t("Start cleaning") }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Staff Login", headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
