import NetInfo from "@react-native-community/netinfo";
import { useLanguage } from "../i18n/LanguageProvider";
import { StaffBrand } from "../components/StaffBrand";
import { ListenButton } from "../components/ListenButton";
import { TaskCard } from "../components/TaskCard";
import { useEffect, useState } from "react";
import { Alert, Linking, RefreshControl, ScrollView, View } from "react-native";
import { useCameraPermissions } from "expo-camera";
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
import { Card, CardContent } from "../components/ui/card";
import { Text } from "../components/ui/text";
import { Icon } from "../components/ui/icon";
import {
  staffQueryKeys,
  useMyAttendanceQuery,
  useTodaysTasksQuery,
} from "../queries/staff";
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
import { AttendanceCamera } from "../components/AttendanceCamera";
import { currentLocation } from "../verification/location";

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
      message:
        "Ask your manager to assign a location and shift before using mobile attendance.",
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
        "Refresh to load your shift. If it is still missing, ask your manager.",
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
        {
          label: "Checked Out",
          value: formatClockTime(record.checkOutTime ?? record.expectedEnd),
        },
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
        helper: "This late checkout stays in your attendance history.",
      },
    };
  }

  if (hasOpenCheckout(record)) {
    const checkoutReady = now.getTime() >= recommendedCheckoutAt.getTime();

    return {
      statusLabel: formatAttendanceStatus(record.status),
      tone: record.status === "LATE" ? "warning" : "success",
      title: checkoutReady
        ? "Ready to check out"
        : "You are currently on shift",
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
          : `Your shift ends at ${formatClockTime(record.expectedEnd)}.${minimumCheckoutAt ? ` Check-out opens at ${formatClockTime(minimumCheckoutAt)}.` : ""}`,
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

export function HomeScreen() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [shiftDetails, setShiftDetails] = useState(false);
  const [notice, setNotice] = useState("");
  const [permissionNotice, setPermissionNotice] = useState(false);
  const [online, setOnline] = useState(true);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(
    () =>
      NetInfo.addEventListener((state) =>
        setOnline(
          state.isConnected !== false && state.isInternetReachable !== false,
        ),
      ),
    [],
  );
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [submittingMode, setSubmittingMode] =
    useState<AttendanceActionMode | null>(null);
  const [, requestCameraPermission] = useCameraPermissions();
  const [attendanceCapture, setAttendanceCapture] = useState<{
    mode: AttendanceActionMode;
    coords: Awaited<ReturnType<typeof currentLocation>>;
  } | null>(null);
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
      Alert.alert(
        "Refresh failed",
        apiError?.response?.data?.message ?? "Unable to refresh.",
      );
    }
  };

  const handleAttendanceAction = async (mode: AttendanceActionMode) => {
    try {
      setNotice("");
      setPermissionNotice(false);
      if (!online) {
        setNotice(t("Internet needed to continue"));
        return;
      }
      setSubmittingMode(mode);

      const cameraPermission = await requestCameraPermission();

      if (!cameraPermission.granted) {
        setPermissionNotice(true);
        setNotice(t("Allow camera access to capture an attendance image."));
        Alert.alert(
          t("Camera required"),
          t("Allow camera access to capture an attendance image."),
        );
        return;
      }

      const locationPermission =
        await Location.requestForegroundPermissionsAsync();

      if (!locationPermission.granted) {
        setPermissionNotice(true);
        setNotice(t("Allow location access to mark attendance."));
        Alert.alert(
          t("Location required"),
          t("Allow location access to mark attendance."),
        );
        return;
      }

      // Get a fresh, high-accuracy location BEFORE opening the camera.
      // Indoor GPS can be inaccurate; Highest accuracy reduces the chance
      // that a staff member is rejected while standing at the correct location.
      const coords = await currentLocation((next, failure) =>
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 1000,
            distanceInterval: 0,
          },
          next,
          failure,
        ),
      );

      const accuracyMeters = coords.coords.accuracy ?? 0;
      if (accuracyMeters > 50) {
        const shouldRetry = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Low location accuracy",
            `Your current GPS accuracy is ±${Math.round(accuracyMeters)} m. This can cause check-in to fail even if you are at the correct location. Try moving outdoors or closer to a window, then retry.`,
            [
              { text: "Continue anyway", onPress: () => resolve(false) },
              { text: "Retry", onPress: () => resolve(true), style: "cancel" },
            ],
          );
        });
        if (shouldRetry) {
          setSubmittingMode(null);
          return;
        }
      }

      setAttendanceCapture({ mode, coords });
    } catch (error: any) {
      const detail =
        error?.code === "ERR_NETWORK"
          ? t("Internet needed to continue")
          : (error?.response?.data?.message ??
            error?.message ??
            t("Unable to open attendance."));
      setNotice(detail);
      Alert.alert(t("Attendance failed"), detail);
    } finally {
      setSubmittingMode(null);
    }
  };

  const submitAttendanceSelfie = async (uri: string) => {
    if (!attendanceCapture) return;
    const { mode, coords } = attendanceCapture;
    try {
      const formData = new FormData();
      formData.append("latitude", String(coords.coords.latitude));
      formData.append("longitude", String(coords.coords.longitude));
      formData.append("accuracy", String(coords.coords.accuracy ?? 0));
      formData.append(
        "image",
        createImagePart(uri, `${mode}.jpg`, "image/jpeg"),
      );

      await uploadFormData(`/attendance/${mode}`, formData, 60000);
      setAttendanceCapture(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: staffQueryKeys.attendance(staffId),
        }),
        queryClient.invalidateQueries({
          queryKey: staffQueryKeys.tasksToday(staffId),
        }),
      ]);

      setNotice(
        t(mode === "check-in" ? "Check-in recorded." : "Check-out recorded."),
      );
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ??
          error?.message ??
          `Unable to ${mode.replace("-", " ")}.`,
      );
    }
  };

  const activeAttendance = getRelevantAttendanceRecord(attendanceRecords, now);
  const attendanceView = buildAttendanceViewModel({
    record: activeAttendance,
    hasAssignedLocation: Boolean(user?.locationId),
    now,
  });
  const completedCount = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;
  const attendanceAction = attendanceView.action;
  const actionVariant = toneButtonVariantMap[attendanceView.tone];

  const nextTask = [...tasks]
    .filter((task) =>
      ["PENDING", "IN_PROGRESS", "NOT_COMPLETED_INTIME"].includes(task.status),
    )
    .sort((a, b) =>
      a.status === "IN_PROGRESS"
        ? -1
        : b.status === "IN_PROGRESS"
          ? 1
          : Date.parse(a.shiftStart) - Date.parse(b.shiftStart),
    )[0];


  if (attendanceCapture)
    return (
      <AttendanceCamera
        mode={attendanceCapture.mode}
        onCapture={submitAttendanceSelfie}
        onCancel={() => setAttendanceCapture(null)}
      />
    );

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

  const checkedIn = !!activeAttendance && hasOpenCheckout(activeAttendance);
  const onShiftWaiting = checkedIn && !!attendanceAction?.disabled;
  const instruction = t(
    attendanceAction?.disabled
      ? "If you were on shift and this is wrong, contact your manager."
      : attendanceAction
        ? "Take a fresh selfie. Keep location turned on."
        : attendanceView.title,
  );
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 24,
        gap: 20,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StaffBrand />
      <ScreenHeader
        title={t("Today")}
        subtitle={new Intl.DateTimeFormat(
          language === "ur" ? "ur-PK" : "en-PK",
          { weekday: "long", day: "numeric", month: "long" },
        ).format(now)}
      />
      {!online ? (
        <View className="gap-2 rounded-xl bg-secondary p-4">
          <Text className="text-base font-semibold">
            {t("Internet needed to continue")}
          </Text>
          <Text className="text-base">
            {t("You are viewing the last loaded information.")}
          </Text>
        </View>
      ) : null}
      {notice ? (
        <View className="rounded-xl bg-accent p-4">
          <Text
            accessibilityLiveRegion="polite"
            className="text-base font-semibold"
          >
            {notice}
          </Text>
          {permissionNotice ? (
            <Button variant="ghost" onPress={() => void Linking.openSettings()}>
              {t("Open settings")}
            </Button>
          ) : null}
        </View>
      ) : null}
      {attendanceQuery.isError ? (
        <View className="gap-2 rounded-xl border border-border p-4">
          <Text accessibilityLiveRegion="polite">
            {t("Attendance could not load. Try again.")}
          </Text>
          <Button
            variant="outline"
            onPress={() => void attendanceQuery.refetch()}
          >
            {t("Try again")}
          </Button>
        </View>
      ) : null}
      <Card>
        <CardContent className="gap-4 p-5">
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              gap: 12,
              alignItems: "center",
            }}
          >
            <View className="rounded-full bg-accent p-3">
              <Icon
                name={checkedIn ? "CircleCheck" : "CalendarDays"}
                size={26}
                className="text-primary"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-muted-foreground">
                {t("My shift")}
              </Text>
              <Text className="mt-1 text-xl font-bold">
                {activeAttendance?.location?.name ??
                  t(user?.locationId ? "Location" : "No location assigned")}
              </Text>
            </View>
          </View>
          {activeAttendance ? (
            <Text
              style={{
                writingDirection: "ltr",
                textAlign: isRTL ? "right" : "left",
              }}
              className="text-lg font-semibold"
            >
              {formatTaskWindow(
                activeAttendance.expectedStart,
                activeAttendance.expectedEnd,
              )}
            </Text>
          ) : null}
          <Text className="text-xl font-bold">
            {t(onShiftWaiting ? "Checked in" : attendanceView.title)}
          </Text>
          {!onShiftWaiting?<Text className="text-base leading-6 text-muted-foreground">
            {onShiftWaiting
              ? t("Your attendance is recorded. Continue with your next task.")
              : language === "ur"
                ? checkedIn
                  ? `آپ کی حاضری درج ہے۔ ${attendanceAction?.disabled ? "روانگی کا وقت آنے تک اپنا کام جاری رکھیں۔" : "روانگی درج کرنے کے لیے اپنی تصویر لیں۔"}`
                  : attendanceAction?.disabled
                    ? "حاضری کا وقت چیک کریں۔ مسئلہ ہو تو منیجر سے پوچھیں۔"
                    : "حاضری کے لیے اپنی تصویر لیں۔ کیمرہ اور لوکیشن کی اجازت ضروری ہے۔"
                : attendanceView.message}
          </Text>:null}
          <Button variant="ghost" iconRight={shiftDetails ? "ChevronUp" : "ChevronDown"} aria-expanded={shiftDetails} accessibilityState={{expanded:shiftDetails}} onPress={()=>setShiftDetails(value=>!value)}>{t("Shift details")}</Button>
          {shiftDetails ? <View className="gap-3 border-t border-border pt-4">{attendanceView.facts.map(fact=><View key={fact.label} style={{flexDirection:isRTL?'row-reverse':'row',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><Text className="text-base text-muted-foreground">{t(fact.label)}</Text><Text className="text-base font-semibold">{fact.value}</Text></View>)}<ListenButton text={instruction}/></View> : null}
          {onShiftWaiting && activeAttendance ? (
            <Text className="text-base text-muted-foreground">
              {t("Check-out opens at {time}", {
                time: `\u2066${formatClockTime(getRecommendedCheckoutAt(activeAttendance))}\u2069`,
              })}
            </Text>
          ) : attendanceAction ? (
            <View className="gap-2">
              <Button
                size="lg"
                variant={actionVariant}
                iconLeft={attendanceAction.mode === "check-in" ? "LogIn" : "LogOut"}
                loading={submittingMode === attendanceAction.mode}
                disabled={
                  attendanceAction.disabled ||
                  !online ||
                  attendanceQuery.isError
                }
                onPress={() =>
                  void handleAttendanceAction(attendanceAction.mode)
                }
              >
                {t(attendanceAction.label)}
              </Button>
              {!online ? (
                <Text className="text-base text-muted-foreground">
                  {t("Internet needed to continue")}
                </Text>
              ) : attendanceAction.helper ? (
                <Text className="text-base leading-6 text-muted-foreground">
                  {language === "ur" && activeAttendance
                    ? attendanceAction.disabled &&
                      now.getTime() >
                        Date.parse(activeAttendance.expectedEnd) &&
                      attendanceAction.mode === "check-in"
                      ? t(
                          "If you were on shift and this is wrong, contact your manager.",
                        )
                      : attendanceAction.disabled
                        ? t(
                            attendanceAction.mode === "check-in"
                              ? "Check-in opens at {time}"
                              : "Check-out opens at {time}",
                            {
                              time: formatClockTime(
                                attendanceAction.mode === "check-in"
                                  ? getCheckInOpenAt(activeAttendance)
                                  : getRecommendedCheckoutAt(activeAttendance),
                              ),
                            },
                          )
                        : t("Take a fresh selfie. Keep location turned on.")
                    : attendanceAction.helper}
                </Text>
              ) : null}
            </View>
          ) : null}
        </CardContent>
      </Card>
      <View className="gap-3">
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text className="text-xl font-bold">{t("Today’s tasks")}</Text>
          <Text className="text-base text-muted-foreground">
            {t("{count} of {total} submitted", {
              count: completedCount,
              total: tasks.length,
            })}
          </Text>
        </View>
        {!tasksQuery.data && !online ? (
          <Text>{t("Today has not loaded yet. Reconnect and refresh.")}</Text>
        ) : tasksQuery.isError ? (
          <View className="gap-2">
            <Text>
              {t("Today could not load. Check your internet and try again.")}
            </Text>
            <Button variant="outline" onPress={() => void tasksQuery.refetch()}>
              {t("Try again")}
            </Button>
          </View>
        ) : nextTask ? (
          <>
            <TaskCard
              task={nextTask}
              onStart={
                checkedIn
                  ? () =>
                      navigation
                        .getParent()
                        ?.navigate("StartTask", { taskId: nextTask.id })
                  : undefined
              }
              onComplete={() =>
                navigation
                  .getParent()
                  ?.navigate("Verification", { taskId: nextTask.id })
              }
            />
            {!checkedIn ? (
              <Text className="text-base text-muted-foreground">
                {t("Check in")} · {t("Start cleaning")}
              </Text>
            ) : null}
          </>
        ) : (
          <View className="gap-2 rounded-xl bg-accent p-5">
            <Icon name="CircleCheck" size={26} className="text-primary" />
            <Text className="text-xl font-bold">
              {t(tasks.length ? "All done for today" : "No tasks for today")}
            </Text>
            <Text className="text-base text-muted-foreground">
              {t(
                tasks.length
                  ? "Your submitted work is kept in your task list."
                  : "Your manager has not assigned work for today.",
              )}
            </Text>
          </View>
        )}
        <Button
          variant="outline"
          iconRight="ArrowRight"
          onPress={() => navigation.navigate("Tasks")}
        >
          {t("View all tasks")}
        </Button>
      </View>
    </ScrollView>
  );
}
