import { v5Colors } from '../theme';
import { HelpScreen } from "../screens/HelpScreen";
import { useLanguage } from "../i18n/LanguageProvider";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { TasksScreen } from "../screens/TasksScreen";
import { Icon } from "../components/ui/icon";
import type { StaffTabsParamList } from "../types";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator<StaffTabsParamList>();

export function StaffTabs() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: v5Colors.primary,
        tabBarInactiveTintColor: v5Colors.muted,
        tabBarLabelStyle: { fontSize: 14, fontWeight: "600" },
        tabBarAllowFontScaling: true,
        tabBarStyle: {
          backgroundColor: v5Colors.surface,
          minHeight: 76 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom),
          borderTopColor: v5Colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="Shift"
        component={HomeScreen}
        options={{
          title: t("My day"),
          tabBarIcon: ({ color, size }) => (
            <Icon name="Clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          title: t("Tasks"),
          tabBarIcon: ({ color, size }) => (
            <Icon name="ListChecks" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: t("Help & account"),
          tabBarIcon: ({ color, size }) => (
            <Icon name="CircleHelp" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
