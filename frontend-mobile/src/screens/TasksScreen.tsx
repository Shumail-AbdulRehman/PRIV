import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { LoadingState } from "../components/LoadingState";
import { TaskCard } from "../components/TaskCard";
import { useTodaysTasksQuery } from "../queries/staff";
import { cardCore, cardShell, colors, shadow, typography } from "../theme";
import type { TaskInstance } from "../types";

type TasksScreenProps = {
  topInset: number;
  bottomInset: number;
  onStartTask: (task: TaskInstance) => void;
  onCompleteTask: (task: TaskInstance) => void;
};

export function TasksScreen({
  topInset,
  bottomInset,
  onStartTask,
  onCompleteTask,
}: TasksScreenProps) {
  const { user } = useAuth();
  const tasksQuery = useTodaysTasksQuery(user?.id);
  const tasks = tasksQuery.data ?? [];
  const isInitialLoading = tasksQuery.isPending && !tasksQuery.data;
  const refreshing = tasksQuery.isRefetching;

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

  if (isInitialLoading) {
    return (
      <View
        style={[
          styles.loadingWrap,
          {
            paddingTop: topInset + 20,
            paddingBottom: bottomInset,
          },
        ]}
      >
        <LoadingState
          title="Loading tasks"
          message="Pulling today’s assigned work from the backend."
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topInset + 20,
          paddingBottom: bottomInset,
        },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.heroShell}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Task queue</Text>
          <Text style={styles.heading}>Today's assigned work</Text>
          <Text style={styles.copy}>
            Scan the matching QR code to start pending work, then attach proof images before closing it.
          </Text>
        </View>
      </View>

      {tasks.length ? (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStart={task.status === "PENDING" ? () => onStartTask(task) : undefined}
            onComplete={task.status === "IN_PROGRESS" ? () => onCompleteTask(task) : undefined}
          />
        ))
      ) : (
        <View style={styles.emptyShell}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks for today</Text>
            <Text style={styles.emptyCopy}>
              Your manager has not assigned any active task instances for this shift.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    gap: 16,
  },
  loadingWrap: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  heroShell: {
    ...cardShell,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
    ...shadow.lifted,
  },
  hero: {
    borderRadius: 26,
    padding: 22,
    backgroundColor: colors.forestDeep,
    gap: 10,
  },
  eyebrow: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.mint,
    color: colors.teal,
    ...typography.eyebrow,
  },
  heading: {
    ...typography.screenTitle,
    color: colors.white,
  },
  copy: {
    ...typography.body,
    color: "#c7ddd7",
  },
  emptyShell: {
    ...cardShell,
    ...shadow.panel,
  },
  emptyState: {
    ...cardCore,
    padding: 22,
    gap: 8,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  emptyCopy: {
    ...typography.body,
    color: colors.inkMuted,
  },
});
