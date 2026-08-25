import { useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFormData } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import { LoadingState } from "../components/LoadingState";
import { ScreenHeader } from "../components/ScreenHeader";
import { StatusBadge } from "../components/StatusBadge";
import { StatCard } from "../components/StatCard";
import { FactRow } from "../components/FactRow";
import { Card, CardContent } from "../components/ui/card";
import { Text } from "../components/ui/text";
import { Icon } from "../components/ui/icon";
import { staffQueryKeys, useMyAttendanceQuery, useTodaysTasksQuery } from "../queries/staff";
import type { AttendanceRecord, StaffTabsParamList } from "../types";
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

type NavigationProp = BottomTabNavigationProp<StaffTabsParamList, "Shift">;

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

const toneButtonVariantMap: Record<
  AttendanceViewModel["tone"],
  "default" | "outline" | "destructive" | "ghost"
> = {
  accent: "default",
  success: "default",
  warning: "outline",
  danger: "destructive",
  neutral: "ghost",
};

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const todaySubtitle = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export function HomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
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

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => void logout() },
    ]);
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
  const attendanceAction = attendanceView.action;
  const actionVariant = toneButtonVariantMap[attendanceView.tone];

  const previewTasks = tasks.slice(0, 3);
  const firstName = user?.name?.split(" ")[0] ?? user?.name ?? "Staff";

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
      <ScreenHeader
        title={`${greeting()}, ${firstName}`}
        subtitle={todaySubtitle()}
        right={
          <Button
            variant="ghost"
            size="icon"
            iconLeft="LogOut"
            onPress={handleSignOut}
            accessibilityLabel="Sign out"
          />
        }
      />

      <Card>
        <CardContent className="gap-3 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-card-foreground">Attendance</Text>
            <StatusBadge status={attendanceView.statusLabel} />
          </View>

          <Text className="text-xl font-bold text-card-foreground">
            {attendanceView.title}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {attendanceView.message}
          </Text>

          {attendanceView.facts.length ? (
            <View className="rounded-lg bg-secondary p-3">
              <View className="flex-row flex-wrap gap-y-3 gap-x-4">
                {attendanceView.facts.map((fact) => (
                  <FactRow key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </View>
            </View>
          ) : null}

          {attendanceAction ? (
            <View className="gap-2">
              <Button
                variant={actionVariant}
                loading={submittingMode === attendanceAction.mode}
                disabled={attendanceAction.disabled}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!attendanceAction.disabled) {
                    void handleAttendanceAction(attendanceAction.mode);
                  }
                }}
              >
                {attendanceAction.label}
              </Button>
              {attendanceAction.helper ? (
                <Text className="text-center text-xs text-muted-foreground">
                  {attendanceAction.helper}
                </Text>
              ) : null}
            </View>
          ) : null}
        </CardContent>
      </Card>

      <View className="flex-row gap-3">
        <StatCard label="Pending" value={pendingCount} icon="Clock" />
        <StatCard label="In Progress" value={inProgressCount} icon="Loader" />
        <StatCard label="Completed" value={completedCount} icon="CheckCircle2" />
      </View>

      <Card>
        <CardContent className="gap-3 p-4">
          <Text className="text-base font-semibold text-card-foreground">
            Today's tasks
          </Text>

          {previewTasks.length ? (
            <View className="gap-2">
              {previewTasks.map((task) => (
                <View
                  key={task.id}
                  className="flex-row items-center justify-between rounded-lg bg-secondary px-3 py-2"
                >
                  <Text
                    className="flex-1 text-sm font-medium text-secondary-foreground"
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  <StatusBadge status={task.status} />
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted-foreground">
              No tasks yet today.
            </Text>
          )}

          <Button
            variant="outline"
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Tasks");
            }}
          >
            View all tasks
          </Button>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
