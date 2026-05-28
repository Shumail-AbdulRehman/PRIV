import { useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFormData } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/Button";
import { LoadingState } from "../components/LoadingState";
import { staffQueryKeys, useMyAttendanceQuery, useTodaysTasksQuery } from "../queries/staff";
import { cardCore, cardShell, colors, radius, shadow, typography } from "../theme";
import type { AttendanceRecord } from "../types";
import {
  getCheckInOpenAt,
  getLateDeadline,
  getMinimumCheckoutAt,
  getRecommendedCheckoutAt,
  getRelevantAttendanceRecord,
  hasOpenCheckout,
} from "../utils/attendance";
import {
  formatAttendanceStatus,
  formatClockTime,
  formatShortDate,
  formatTaskWindow,
} from "../utils/format";
import { createImagePart } from "../utils/upload";

type AttendanceActionMode = "check-in" | "check-out";

type AttendanceViewModel = {
  statusLabel: string;
  tone: "accent" | "success" | "warning" | "danger" | "neutral";
  title: string;
  message: string;
  facts: Array<{
    label: string;
    value: string;
  }>;
  action: null | {
    mode: AttendanceActionMode;
    label: string;
    disabled: boolean;
    helper?: string;
  };
};

type HomeScreenProps = {
  topInset: number;
  bottomInset: number;
  onOpenTasksTab: () => void;
};

const buildAttendanceViewModel = ({
  record,
  hasAssignedLocation,
  now,
}: {
  record: AttendanceRecord | null;
  hasAssignedLocation: boolean;
  now: Date;
}): AttendanceViewModel => {
  if (!hasAssignedLocation) {
    return {
      statusLabel: "Not Assigned",
      tone: "neutral",
      title: "No location assigned",
      message: "Ask your manager to assign a location and shift before using mobile attendance.",
      facts: [],
      action: null,
    };
  }

  if (!record) {
    return {
      statusLabel: "No Shift",
      tone: "neutral",
      title: "No shift loaded for today",
      message:
        "There is no attendance record for today's Karachi shift yet. Pull to refresh in a moment or contact your manager if it stays missing.",
      facts: [],
      action: null,
    };
  }

  const checkInOpenAt = getCheckInOpenAt(record);
  const lateDeadline = getLateDeadline(record);
  const minimumCheckoutAt = getMinimumCheckoutAt(record);
  const recommendedCheckoutAt = getRecommendedCheckoutAt(record);
  const shiftEnd = new Date(record.expectedEnd);
  const shiftDate = formatShortDate(record.date);
  const locationName = record.location?.name ?? "Assigned location";
  const shiftWindow = `${shiftDate} • ${formatTaskWindow(record.expectedStart, record.expectedEnd)}`;

  if (record.checkOutTime || record.status === "CHECKED_OUT") {
    return {
      statusLabel: "Checked Out",
      tone: "success",
      title: "Shift completed",
      message: `You checked out at ${formatClockTime(record.checkOutTime ?? record.expectedEnd)}.`,
      facts: [
        { label: "Location", value: locationName },
        { label: "Shift", value: shiftWindow },
        record.checkInTime
          ? { label: "Checked In", value: formatClockTime(record.checkInTime) }
          : { label: "Checked In", value: "Not recorded" },
        { label: "Checked Out", value: formatClockTime(record.checkOutTime ?? record.expectedEnd) },
      ],
      action: null,
    };
  }

  if (record.status === "ABSENT") {
    const checkInHasOpened = now.getTime() >= checkInOpenAt.getTime();
    const shiftHasEnded = now.getTime() > shiftEnd.getTime();
    const isLate = now.getTime() > lateDeadline.getTime();

    if (checkInHasOpened && !shiftHasEnded) {

      return {
        statusLabel: isLate ? "Late Window" : "Check-In Open",
        tone: isLate ? "warning" : "accent",
        title: isLate ? "Late check-in is still allowed" : "Ready to check in",
        message: isLate
          ? `Your shift started at ${formatClockTime(record.expectedStart)}. You can still check in until ${formatClockTime(record.expectedEnd)}, but it will be marked late.`
          : `Your shift starts at ${formatClockTime(record.expectedStart)}. Capture a selfie and your current location to check in.`,
        facts: [
          { label: "Location", value: locationName },
          { label: "Shift", value: shiftWindow },
          { label: "Check-In Opens", value: formatClockTime(checkInOpenAt) },
          { label: "Late After", value: formatClockTime(lateDeadline) },
        ],
        action: {
          mode: "check-in",
          label: isLate ? "Check In Late" : "Check In",
          disabled: false,
          helper: `Shift ends at ${formatClockTime(record.expectedEnd)}.`,
        },
      };
    }

    if (!checkInHasOpened) {
      return {
        statusLabel: "Upcoming Shift",
        tone: "neutral",
        title: "Check-in has not opened yet",
        message: `Your shift starts at ${formatClockTime(record.expectedStart)}. Check-in opens at ${formatClockTime(checkInOpenAt)}.`,
        facts: [
          { label: "Location", value: locationName },
          { label: "Shift", value: shiftWindow },
          { label: "Check-In Opens", value: formatClockTime(checkInOpenAt) },
          { label: "Late After", value: formatClockTime(lateDeadline) },
        ],
        action: {
          mode: "check-in",
          label: "Check In Not Open Yet",
          disabled: true,
          helper: `Come back at ${formatClockTime(checkInOpenAt)} to start your shift.`,
        },
      };
    }

    return {
      statusLabel: "Shift Closed",
      tone: "danger",
      title: "Shift time closed",
      message: `You can check in late during the shift, but this shift ended at ${formatClockTime(record.expectedEnd)} without a check-in.`,
      facts: [
        { label: "Location", value: locationName },
        { label: "Shift", value: shiftWindow },
        { label: "Late After", value: formatClockTime(lateDeadline) },
        { label: "Shift Ended", value: formatClockTime(record.expectedEnd) },
      ],
      action: {
        mode: "check-in",
        label: "Shift Time Closed",
        disabled: true,
        helper: "If you were on shift and this is wrong, contact your manager.",
      },
    };
  }

  if (record.status === "MISSED_CHECKOUT") {
    return {
      statusLabel: "Missed Checkout",
      tone: "danger",
      title: "Checkout is overdue",
      message: `Your shift ended at ${formatClockTime(record.expectedEnd)} and still needs a checkout selfie.`,
      facts: [
        { label: "Location", value: locationName },
        { label: "Shift", value: shiftWindow },
        record.checkInTime
          ? { label: "Checked In", value: formatClockTime(record.checkInTime) }
          : { label: "Checked In", value: "Recorded" },
        { label: "Shift Ended", value: formatClockTime(record.expectedEnd) },
      ],
      action: {
        mode: "check-out",
        label: "Complete Check Out",
        disabled: false,
        helper: "This attendance will remain flagged as a missed checkout in backend history.",
      },
    };
  }

  if (hasOpenCheckout(record)) {
    const checkoutReady = now.getTime() >= recommendedCheckoutAt.getTime();

    return {
      statusLabel: formatAttendanceStatus(record.status),
      tone: record.status === "LATE" ? "warning" : "success",
      title: checkoutReady ? "Ready to check out" : "You are currently on shift",
      message: checkoutReady
        ? `Your shift ended at ${formatClockTime(record.expectedEnd)}. Capture a checkout selfie to close it now.`
        : `You checked in at ${formatClockTime(record.checkInTime ?? record.expectedStart)}. Your shift ends at ${formatClockTime(record.expectedEnd)}.`,
      facts: [
        { label: "Location", value: locationName },
        { label: "Shift", value: shiftWindow },
        record.checkInTime
          ? { label: "Checked In", value: formatClockTime(record.checkInTime) }
          : { label: "Checked In", value: "Recorded" },
        {
          label: "Check Out After",
          value: formatClockTime(recommendedCheckoutAt),
        },
      ],
      action: {
        mode: "check-out",
        label: checkoutReady ? "Check Out" : "Check Out Not Ready",
        disabled: !checkoutReady,
        helper: checkoutReady
          ? "Checkout requires a fresh selfie and your current location."
          : `Your shift ends at ${formatClockTime(record.expectedEnd)}.${minimumCheckoutAt ? ` Backend checkout is also blocked until ${formatClockTime(minimumCheckoutAt)}.` : ""}`,
      },
    };
  }

  return {
    statusLabel: formatAttendanceStatus(record.status),
    tone: "neutral",
    title: "Attendance record loaded",
    message: "Your latest shift record is available below.",
    facts: [
      { label: "Location", value: locationName },
      { label: "Shift", value: shiftWindow },
    ],
    action: null,
  };
};

export function HomeScreen({
  topInset,
  bottomInset,
  onOpenTasksTab,
}: HomeScreenProps) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [submittingMode, setSubmittingMode] = useState<AttendanceActionMode | null>(null);
  const staffId = user?.id;
  const attendanceQuery = useMyAttendanceQuery(staffId);
  const tasksQuery = useTodaysTasksQuery(staffId);
  const attendanceRecords = attendanceQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const isInitialLoading =
    (attendanceQuery.isPending && !attendanceQuery.data) ||
    (tasksQuery.isPending && !tasksQuery.data);
  const refreshing = attendanceQuery.isRefetching || tasksQuery.isRefetching;

  const onRefresh = async () => {
    const [attendanceResult, tasksResult] = await Promise.all([
      attendanceQuery.refetch(),
      tasksQuery.refetch(),
    ]);
    const error = attendanceResult.error ?? tasksResult.error;

    if (error) {
      const apiError = error as any;
      Alert.alert("Refresh failed", apiError?.response?.data?.message ?? "Unable to refresh.");
    }
  };

  const handleAttendanceAction = async (mode: AttendanceActionMode) => {
    try {
      setSubmittingMode(mode);

      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (!cameraPermission.granted) {
        Alert.alert("Camera required", "Allow camera access to capture an attendance image.");
        return;
      }

      const locationPermission = await Location.requestForegroundPermissionsAsync();

      if (!locationPermission.granted) {
        Alert.alert("Location required", "Allow location access to mark attendance.");
        return;
      }

      const imageResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });

      if (imageResult.canceled || !imageResult.assets[0]) {
        return;
      }

      const coords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const image = imageResult.assets[0];
      const formData = new FormData();
      formData.append("latitude", String(coords.coords.latitude));
      formData.append("longitude", String(coords.coords.longitude));
      formData.append(
        "image",
        createImagePart(image.uri, image.fileName ?? `${mode}.jpg`, image.mimeType)
      );

      await uploadFormData(`/attendance/${mode}`, formData);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffQueryKeys.attendance(staffId) }),
        queryClient.invalidateQueries({ queryKey: staffQueryKeys.tasksToday(staffId) }),
      ]);

      Alert.alert(
        "Success",
        mode === "check-in" ? "Checked in successfully." : "Checked out successfully."
      );
    } catch (error: any) {
      Alert.alert(
        "Attendance failed",
        error?.response?.data?.message ?? error?.message ?? `Unable to ${mode.replace("-", " ")}.`
      );
    } finally {
      setSubmittingMode(null);
    }
  };

  const now = new Date();
  const activeAttendance = getRelevantAttendanceRecord(attendanceRecords, now);
  const attendanceView = buildAttendanceViewModel({
    record: activeAttendance,
    hasAssignedLocation: Boolean(user?.locationId),
    now,
  });
  const pendingCount = tasks.filter((task) => task.status === "PENDING").length;
  const inProgressCount = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;
  const toneStyles = toneStyleMap[attendanceView.tone];
  const attendanceAction = attendanceView.action;

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
          title="Loading shift"
          message="Fetching today’s attendance record and task summary."
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
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Shift control</Text>
            <Text style={styles.title}>{user?.name ?? "Staff"}</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>
          </View>

          <Button label="Sign Out" onPress={logout} variant="ghost" />
        </View>
      </View>

      <View style={styles.panelShell}>
        <View style={styles.panel}>
          <View style={styles.attendanceHeader}>
            <Text style={styles.panelTitle}>Attendance</Text>
            <View style={[styles.statusBadge, toneStyles.badge]}>
              <Text style={[styles.statusBadgeText, toneStyles.badgeText]}>
                {attendanceView.statusLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.attendanceTitle}>{attendanceView.title}</Text>
          <Text style={styles.panelText}>{attendanceView.message}</Text>

          {attendanceView.facts.length ? (
            <View style={styles.factGrid}>
              {attendanceView.facts.map((fact) => (
                <View key={fact.label} style={styles.factCard}>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                  <Text style={styles.factValue}>{fact.value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {attendanceAction ? (
            <View style={[styles.actionBlock, toneStyles.actionBlock]}>
              <Button
                disabled={attendanceAction.disabled}
                label={attendanceAction.label}
                loading={submittingMode === attendanceAction.mode}
                onPress={() => {
                  if (!attendanceAction.disabled) {
                    void handleAttendanceAction(attendanceAction.mode);
                  }
                }}
              />
              {attendanceAction.helper ? (
                <Text style={styles.actionHelper}>{attendanceAction.helper}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statPending]}>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, styles.statProgress]}>
          <Text style={styles.statNumber}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={[styles.statCard, styles.statCompleted]}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.panelShell}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Today's tasks</Text>
          <Text style={styles.panelText}>
            Start QR-based work and upload proof images for anything still in progress.
          </Text>
          <Button label="Open Tasks Tab" onPress={onOpenTasksTab} variant="secondary" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    gap: 18,
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
    borderRadius: radius.lg,
    padding: 22,
    backgroundColor: colors.forestDeep,
    justifyContent: "space-between",
    gap: 18,
  },
  heroCopy: {
    gap: 6,
  },
  eyebrow: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.mint,
    color: colors.teal,
    ...typography.eyebrow,
  },
  title: {
    ...typography.title,
    color: colors.white,
  },
  subtitle: {
    color: "#cbe0d8",
    fontSize: 14,
    fontWeight: "700",
  },
  panelShell: {
    ...cardShell,
    ...shadow.panel,
  },
  panel: {
    ...cardCore,
    padding: 18,
    gap: 14,
  },
  attendanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  panelTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  attendanceTitle: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: colors.ink,
  },
  panelText: {
    ...typography.body,
    color: colors.inkMuted,
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusBadgeText: {
    ...typography.eyebrow,
    fontSize: 10,
  },
  factGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  factCard: {
    minWidth: "47%",
    flexGrow: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  factLabel: {
    ...typography.eyebrow,
    color: colors.inkSoft,
    fontSize: 10,
  },
  factValue: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
  },
  actionBlock: {
    borderRadius: radius.lg,
    padding: 14,
    gap: 10,
  },
  actionHelper: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 16,
    minHeight: 104,
    justifyContent: "space-between",
    ...shadow.panel,
  },
  statPending: {
    backgroundColor: colors.teal,
  },
  statProgress: {
    backgroundColor: colors.clay,
  },
  statCompleted: {
    backgroundColor: "#4f6c38",
  },
  statNumber: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  statLabel: {
    color: "rgba(255,255,255,0.78)",
    marginTop: 4,
    fontWeight: "900",
    fontSize: 12,
    lineHeight: 16,
  },
});

const toneStyleMap = {
  accent: StyleSheet.create({
    badge: {
      backgroundColor: colors.mint,
    },
    badgeText: {
      color: colors.teal,
    },
    actionBlock: {
      backgroundColor: "#edf7f4",
    },
  }),
  success: StyleSheet.create({
    badge: {
      backgroundColor: colors.sage,
    },
    badgeText: {
      color: "#355f1c",
    },
    actionBlock: {
      backgroundColor: "#eff5e8",
    },
  }),
  warning: StyleSheet.create({
    badge: {
      backgroundColor: colors.amber,
    },
    badgeText: {
      color: colors.amberDeep,
    },
    actionBlock: {
      backgroundColor: "#fcf4df",
    },
  }),
  danger: StyleSheet.create({
    badge: {
      backgroundColor: colors.dangerSoft,
    },
    badgeText: {
      color: colors.danger,
    },
    actionBlock: {
      backgroundColor: "#fbedeb",
    },
  }),
  neutral: StyleSheet.create({
    badge: {
      backgroundColor: colors.canvasDeep,
    },
    badgeText: {
      color: colors.inkMuted,
    },
    actionBlock: {
      backgroundColor: "#f6efe4",
    },
  }),
};
