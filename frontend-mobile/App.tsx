import { LanguageProvider, useLanguage } from "./src/i18n/LanguageProvider";
import * as Application from "expo-application";
import { configureNativeAppVersion } from "./src/api/client";
configureNativeAppVersion(Application.nativeApplicationVersion);
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/auth/AuthContext";
import { VerificationSync } from "./src/verification/VerificationSync";
import { AppNavigator } from "./src/navigation/AppNavigator";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FCFAF6",
    card: "#FCFAF6",
    text: "#10232D",
    border: "#E8E5DF",
    primary: "#093F45",
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

function LocalizedNavigation() {
  const { isRTL } = useLanguage();
  return (
    <NavigationContainer theme={navTheme} direction={isRTL ? "rtl" : "ltr"}>
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <VerificationSync />
            <LocalizedNavigation />
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
