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
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <LoadingState
        fullScreen
        title="Restoring session"
        message="Checking your saved sign-in and loading the staff workspace."
      />
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#FCFAF6",
        },
        headerTitleStyle: {
          color: "#10232D",
          fontWeight: "700",
        },
        headerTintColor: "#093F45",
        contentStyle: {
          backgroundColor: "#FCFAF6",
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
