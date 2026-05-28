import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeScreen } from "../screens/HomeScreen";
import { TasksScreen } from "../screens/TasksScreen";
import { colors, radius, shadow } from "../theme";
import type { RootStackParamList, StaffTabId, TaskInstance } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "StaffTabs">;

const tabs: Array<{
  id: StaffTabId;
  label: string;
}> = [
  { id: "Shift", label: "Shift" },
  { id: "Tasks", label: "Tasks" },
];

export function StaffTabsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<StaffTabId>("Shift");

  const tabBarInset = Math.max(insets.bottom, 12);
  const contentBottomInset = tabBarInset + 112;

  const handleStartTask = (task: TaskInstance) => {
    navigation.navigate("QrScanner", {
      taskId: task.id,
      taskTitle: task.title,
    });
  };

  const handleCompleteTask = (task: TaskInstance) => {
    navigation.navigate("CompleteTask", {
      taskId: task.id,
      taskTitle: task.title,
    });
  };

  return (
    <View style={styles.shell}>
      <View style={styles.screenArea}>
        {activeTab === "Shift" ? (
          <HomeScreen
            bottomInset={contentBottomInset}
            onOpenTasksTab={() => setActiveTab("Tasks")}
            topInset={insets.top}
          />
        ) : (
          <TasksScreen
            bottomInset={contentBottomInset}
            onCompleteTask={handleCompleteTask}
            onStartTask={handleStartTask}
            topInset={insets.top}
          />
        )}
      </View>

      <View style={[styles.tabBarWrap, { paddingBottom: tabBarInset }]}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                onPress={() => setActiveTab(tab.id)}
                style={({ pressed }) => [
                  styles.tabButton,
                  isActive ? styles.tabButtonActive : null,
                  pressed ? styles.tabButtonPressed : null,
                ]}
              >
                <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  screenArea: {
    flex: 1,
  },
  tabBarWrap: {
    position: "absolute",
    right: 18,
    bottom: 0,
    left: 18,
  },
  tabBar: {
    flexDirection: "row",
    gap: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: colors.surface,
    padding: 10,
    ...shadow.lifted,
  },
  tabButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
  },
  tabButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  tabButtonActive: {
    backgroundColor: colors.forest,
  },
  tabLabel: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.white,
  },
});
