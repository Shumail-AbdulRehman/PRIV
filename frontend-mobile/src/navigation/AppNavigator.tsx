import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import { LoadingState } from "../components/LoadingState";
import { StaffTabs } from "./StaffTabs";
import { CompleteTaskScreen } from "../screens/CompleteTaskScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { QrScannerScreen } from "../screens/QrScannerScreen";
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
          backgroundColor: "#FFFFFF",
        },
        headerTitleStyle: {
          color: "#18181B",
          fontWeight: "700",
        },
        headerTintColor: "#0F766E",
        contentStyle: {
          backgroundColor: "#FFFFFF",
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
