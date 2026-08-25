import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { TasksScreen } from "../screens/TasksScreen";
import { Icon } from "../components/ui/icon";
import type { StaffTabsParamList } from "../types";

const Tab = createBottomTabNavigator<StaffTabsParamList>();

export function StaffTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0F766E",
        tabBarInactiveTintColor: "#71717A",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E4E4E7",
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="Shift"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="Clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="ListChecks" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
