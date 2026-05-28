import {
  getStartOfKarachiDay,
  getUtcClockMinutes,
  withUtcClockOnBaseDate,
} from "../utils/karachiTime.js";

type ShiftWindowInput = {
  baseDate: Date;
  taskShiftStart: Date;
  taskShiftEnd: Date;
  staffShiftStart?: Date | null;
  staffShiftEnd?: Date | null;
};

export const resolveTaskInstanceWindow = ({
  baseDate,
  taskShiftStart,
  taskShiftEnd,
  staffShiftStart,
  staffShiftEnd,
}: ShiftWindowInput) => {
  const taskStartMin = getUtcClockMinutes(taskShiftStart);
  const taskEndMin = getUtcClockMinutes(taskShiftEnd);

  const resolvedShiftStart = withUtcClockOnBaseDate(baseDate, taskShiftStart);

  if (staffShiftStart && staffShiftEnd) {
    const staffStartMin = getUtcClockMinutes(staffShiftStart);
    const staffEndMin = getUtcClockMinutes(staffShiftEnd);
    const isOvernightStaffShift = staffEndMin < staffStartMin;

    if (isOvernightStaffShift && taskStartMin < staffEndMin) {
      resolvedShiftStart.setUTCDate(resolvedShiftStart.getUTCDate() + 1);
    }
  }

  const resolvedShiftEnd = withUtcClockOnBaseDate(resolvedShiftStart, taskShiftEnd);

  if (taskEndMin <= taskStartMin) {
    resolvedShiftEnd.setUTCDate(resolvedShiftEnd.getUTCDate() + 1);
  } else if (resolvedShiftEnd < resolvedShiftStart) {
    resolvedShiftEnd.setUTCDate(resolvedShiftEnd.getUTCDate() + 1);
  }

  return {
    date: getStartOfKarachiDay(resolvedShiftStart),
    shiftStart: resolvedShiftStart,
    shiftEnd: resolvedShiftEnd,
  };
};
