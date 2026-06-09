import { AttendanceStatus } from "@prisma/client";
import { prisma } from "../prisma/prisma.js";
import { getKarachiDayRange, resolveAttendanceWindow } from "./karachiTime.js";

const OPEN_ATTENDANCE_STATUSES: AttendanceStatus[] = [
  AttendanceStatus.ABSENT,
  AttendanceStatus.CHECKED_IN,
  AttendanceStatus.LATE,
];

export const syncTodaysOpenAttendanceWindow = async ({
  staffId,
  locationId,
  shiftStart,
  shiftEnd,
}: {
  staffId: number;
  locationId: number | null;
  shiftStart: Date | null;
  shiftEnd: Date | null;
}) => {


  if (!locationId || !shiftStart || !shiftEnd) {
    return;
  }

  const { start: today, end: tomorrow } = getKarachiDayRange();
  const { date, expectedStart, expectedEnd } = resolveAttendanceWindow({
    baseDate: today,
    shiftStart,
    shiftEnd,
  });

  const openStatusFilter = {
    in: OPEN_ATTENDANCE_STATUSES,
  };

  const existingForResolvedDate = await prisma.attendance.findUnique({
    where: {
      staffId_date: {
        staffId,
        date,
      },
    },
    select: {
      id: true,
      status: true,
      checkOutTime: true,
    },
  });

  if (existingForResolvedDate) {
    if (
      existingForResolvedDate.checkOutTime ||
      !OPEN_ATTENDANCE_STATUSES.includes(existingForResolvedDate.status)
    ) {
      return;
    }

    await prisma.attendance.update({
      where: { id: existingForResolvedDate.id },
      data: {
        locationId,
        expectedStart,
        expectedEnd,
        isLateCheckIn: false,
        lateMinutes: null,
      },
    });
    return;
  }

  const openAttendance = await prisma.attendance.findFirst({
    where: {
      staffId,
      date: { gte: today, lt: tomorrow },
      status: openStatusFilter,
      checkOutTime: null,
    },
    orderBy: { date: "asc" },
    select: { id: true },
  });

  if (!openAttendance) {
    return;
  }

  await prisma.attendance.update({
    where: { id: openAttendance.id },
    data: {
      locationId,
      date,
      expectedStart,
      expectedEnd,
      isLateCheckIn: false,
      lateMinutes: null,
    },
  });
};
