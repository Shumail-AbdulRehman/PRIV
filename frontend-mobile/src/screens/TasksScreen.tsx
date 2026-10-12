import NetInfo from "@react-native-community/netinfo";
import { useLanguage } from "../i18n/LanguageProvider";
import { LanguageChoice } from "../components/LanguageChoice";
import {
  hasOpenCheckout,
  getRelevantAttendanceRecord,
} from "../utils/attendance";
import { Text } from "../components/ui/text";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { LoadingState } from "../components/LoadingState";
import { ScreenHeader } from "../components/ScreenHeader";
import { EmptyState } from "../components/EmptyState";
import { TaskCard } from "../components/TaskCard";
import { useMyAttendanceQuery, useTodaysTasksQuery } from "../queries/staff";
import type {
  RootStackParamList,
  StaffTabsParamList,
  TaskInstance,
} from "../types";

type TasksScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<StaffTabsParamList, "Tasks">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function TasksScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [online, setOnline] = useState(true);
  useEffect(
    () =>
      NetInfo.addEventListener((state) =>
        setOnline(
          state.isConnected !== false && state.isInternetReachable !== false,
        ),
      ),
    [],
  );
  const attendanceQuery = useMyAttendanceQuery(user?.id);
  const record = getRelevantAttendanceRecord(
    attendanceQuery.data ?? [],
    new Date(),
  );
  const checkedIn = !!record && hasOpenCheckout(record);
  const navigation = useNavigation<TasksScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const tasksQuery = useTodaysTasksQuery(user?.id);
  const tasks = [...(tasksQuery.data ?? [])].sort((a, b) =>
    a.status === "COMPLETED"
      ? 1
      : b.status === "COMPLETED"
        ? -1
        : Date.parse(a.shiftStart) - Date.parse(b.shiftStart),
  );
  const isInitialLoading = tasksQuery.isPending && !tasksQuery.data;
  const refreshing = tasksQuery.isRefetching;

  const pendingCount = tasks.filter((task) => task.status === "PENDING").length;
  const inProgressCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;

  useEffect(() => {
    const badgeCount = pendingCount + inProgressCount;
    navigation.setOptions({
      tabBarBadge: badgeCount > 0 ? badgeCount : undefined,
    });
  }, [pendingCount, inProgressCount, navigation]);

  const onRefresh = async () => {
    const result = await tasksQuery.refetch();

    if (result.error) {
      const apiError = result.error as any;
      Alert.alert(
        "Task refresh failed",
        apiError?.response?.data?.message ?? "Unable to load tasks.",
      );
    }
  };

  const handleStartTask = (task: TaskInstance) =>
    navigation.navigate("StartTask", { taskId: task.id });

  const handleCompleteTask = (task: TaskInstance) => {
    navigation.navigate("Verification", { taskId: task.id });
  };

  const subtitle = t("{pending} not started · {active} in progress", {
    pending: pendingCount,
    active: inProgressCount,
  });

  if (isInitialLoading && online) {
    return (
      <View
        className="flex-1 justify-center px-5"
        style={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <LoadingState fullScreen />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-4"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LanguageChoice />
      <ScreenHeader title={t("Today’s tasks")} subtitle={subtitle} />
      {!online ? <Text>{t("Internet needed to continue")}</Text> : null}
      {!checkedIn ? (
        <View className="gap-2 rounded-xl bg-accent p-4">
          <Text>{t("Check in before starting a task.")}</Text>
          <Button onPress={() => navigation.navigate("Shift")}>
            {t("Check in")}
          </Button>
        </View>
      ) : null}
      {tasksQuery.isError ? (
        <View className="gap-2">
          <Text>
            {t("Today could not load. Check your internet and try again.")}
          </Text>
          <Button variant="outline" onPress={() => void tasksQuery.refetch()}>
            {t("Try again")}
          </Button>
        </View>
      ) : null}

      {tasks.length ? (
        <View>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStart={
                task.status === "PENDING" && checkedIn
                  ? () => handleStartTask(task)
                  : undefined
              }
              onComplete={
                task.status === "IN_PROGRESS" ||
                (task.verificationVersion === 2 && task.status !== "PENDING")
                  ? () => handleCompleteTask(task)
                  : undefined
              }
            />
          ))}
        </View>
      ) : !tasksQuery.data && !online ? (
        <Text>{t("Today has not loaded yet. Reconnect and refresh.")}</Text>
      ) : !tasksQuery.isError ? (
        <EmptyState
          icon="ClipboardList"
          title="No tasks for today"
          message="Your manager has not assigned work for today."
        />
      ) : null}
    </ScrollView>
  );
}
