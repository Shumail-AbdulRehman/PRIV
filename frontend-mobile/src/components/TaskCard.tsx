import { StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { cardCore, cardShell, colors, radius, shadow, typography } from "../theme";
import { formatTaskWindow } from "../utils/format";
import type { TaskInstance } from "../types";

type TaskCardProps = {
  task: TaskInstance;
  onStart?: () => void;
  onComplete?: () => void;
};

export function TaskCard({ task, onStart, onComplete }: TaskCardProps) {
  const statusTone = statusStyles[task.status] ?? statusStyles.PENDING;

  return (
    <View style={styles.cardShell}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.subtitle}>
              {task.template?.location?.name ?? "Assigned location"}
            </Text>
          </View>

          <View style={[styles.badge, statusTone.badge]}>
            <Text style={[styles.badgeText, statusTone.label]}>{task.status}</Text>
          </View>
        </View>

        <View style={styles.windowPanel}>
          <Text style={styles.windowLabel}>Window</Text>
          <Text style={styles.window}>{formatTaskWindow(task.shiftStart, task.shiftEnd)}</Text>
        </View>

        {task.status === "PENDING" && onStart ? (
          <Button label="Scan QR To Start" onPress={onStart} style={styles.button} />
        ) : null}

        {task.status === "IN_PROGRESS" && onComplete ? (
          <Button
            label="Upload Proof And Complete"
            onPress={onComplete}
            variant="secondary"
            style={styles.button}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    ...cardShell,
    ...shadow.panel,
  },
  card: {
    ...cardCore,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  windowPanel: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  windowLabel: {
    ...typography.eyebrow,
    color: colors.inkSoft,
    fontSize: 10,
  },
  window: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    ...typography.eyebrow,
    fontSize: 10,
  },
  button: {
    marginTop: 2,
  },
});

const statusStyles = {
  PENDING: StyleSheet.create({
    badge: { backgroundColor: colors.amber },
    label: { color: colors.amberDeep },
  }),
  IN_PROGRESS: StyleSheet.create({
    badge: { backgroundColor: colors.mint },
    label: { color: colors.teal },
  }),
  COMPLETED: StyleSheet.create({
    badge: { backgroundColor: colors.sage },
    label: { color: "#355f1c" },
  }),
  MISSED: StyleSheet.create({
    badge: { backgroundColor: colors.dangerSoft },
    label: { color: colors.danger },
  }),
  CANCELLED: StyleSheet.create({
    badge: { backgroundColor: colors.canvasDeep },
    label: { color: colors.inkMuted },
  }),
  NOT_COMPLETED_INTIME: StyleSheet.create({
    badge: { backgroundColor: "#f2ddcc" },
    label: { color: colors.clay },
  }),
};
