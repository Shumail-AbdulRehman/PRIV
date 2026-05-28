export interface AttendanceLike {
  status: string;
  date?: string | Date | null;
  expectedStart?: string | Date | null;
  checkInTime?: string | Date | null;
  checkOutTime?: string | Date | null;
}

const KARACHI_TIMEZONE = "Asia/Karachi";

const karachiDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: KARACHI_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const getKarachiDayKey = (value: string | Date) =>
  karachiDayFormatter.format(new Date(value));

export const getAttendanceDisplayStatus = (
  attendance: AttendanceLike | null | undefined,
  referenceDate = new Date(),
) => {
  if (!attendance) return "ABSENT";

  const attendanceDate = attendance.date ?? attendance.expectedStart;

  const isSameKarachiDay =
    !!attendanceDate &&
    getKarachiDayKey(attendanceDate) === getKarachiDayKey(referenceDate);

  if (
    attendance.status === "ABSENT" &&
    isSameKarachiDay &&
    attendance.expectedStart &&
    !attendance.checkInTime &&
    !attendance.checkOutTime &&
    new Date(attendance.expectedStart) > referenceDate
  ) {
    return "SHIFT_NOT_STARTED";
  }

  return attendance.status;
};
