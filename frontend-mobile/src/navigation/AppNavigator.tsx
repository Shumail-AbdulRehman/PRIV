import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import { LoadingState } from "../components/LoadingState";
import { StaffTabsScreen } from "./StaffTabsScreen";
import { CompleteTaskScreen } from "../screens/CompleteTaskScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { QrScannerScreen } from "../screens/QrScannerScreen";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
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
          backgroundColor: colors.canvas,
        },
        headerTitleStyle: {
          color: colors.ink,
          fontWeight: "900",
        },
        headerTintColor: colors.forest,
        contentStyle: {
          backgroundColor: colors.canvas,
        },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="StaffTabs"
            component={StaffTabsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="QrScanner" component={QrScannerScreen} options={{ title: "Scan Task QR" }} />
          <Stack.Screen
            name="CompleteTask"
            component={CompleteTaskScreen}
            options={{ title: "Complete Task" }}
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
