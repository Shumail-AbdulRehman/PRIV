import { useEffect } from "react";
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
import { useTodaysTasksQuery } from "../queries/staff";
import type { RootStackParamList, StaffTabsParamList, TaskInstance } from "../types";

type TasksScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<StaffTabsParamList, "Tasks">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function TasksScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<TasksScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const tasksQuery = useTodaysTasksQuery(user?.id);
  const tasks = tasksQuery.data ?? [];
  const isInitialLoading = tasksQuery.isPending && !tasksQuery.data;
  const refreshing = tasksQuery.isRefetching;

  const pendingCount = tasks.filter((task) => task.status === "PENDING").length;
  const inProgressCount = tasks.filter((task) => task.status === "IN_PROGRESS").length;

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
        apiError?.response?.data?.message ?? "Unable to load tasks."
      );
    }
  };

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
      referenceAreas: task.referenceImages?.length
        ? task.referenceImages.map((ref) => ({
            id: ref.id,
            name: ref.name,
            sortOrder: ref.sortOrder ?? 0,
          }))
        : undefined,
    });
  };

  const subtitle = `${pendingCount} pending · ${inProgressCount} in progress`;

  if (isInitialLoading) {
    return (
      <View
        className="flex-1 justify-center px-5"
        style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <ScreenHeader title="Today's Tasks" subtitle={subtitle} />

      {tasks.length ? (
        <View>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStart={task.status === "PENDING" ? () => handleStartTask(task) : undefined}
              onComplete={
                task.status === "IN_PROGRESS" ? () => handleCompleteTask(task) : undefined
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="ClipboardList"
          title="No tasks for today"
          message="Your manager has not assigned any active task instances for this shift."
        />
      )}
    </ScrollView>
  );
}
