export const KARACHI_TIMEZONE = "Asia/Karachi";

const KARACHI_OFFSET_MS = 5 * 60 * 60 * 1000;

export const addUtcDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const getStartOfKarachiDay = (date: Date) => {
  const shifted = new Date(date.getTime() + KARACHI_OFFSET_MS);

  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
      0,
      0,
      0,
      0,
    ) - KARACHI_OFFSET_MS,
  );
};

export const getKarachiDayRange = (date: Date = new Date()) => {
  const start = getStartOfKarachiDay(date);
  return {
    start,
    end: addUtcDays(start, 1),
  };
};

const DATE_INPUT_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

const getKarachiDayStartFromParts = (year: number, monthIndex: number, day: number) => {
  const utcMidnight = Date.UTC(year, monthIndex, day, 0, 0, 0, 0);
  const date = new Date(utcMidnight - KARACHI_OFFSET_MS);

  const shifted = new Date(date.getTime() + KARACHI_OFFSET_MS);
  if (
    shifted.getUTCFullYear() !== year ||
    shifted.getUTCMonth() !== monthIndex ||
    shifted.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

export const getKarachiDayRangeFromDateInput = (value: string) => {
  const match = DATE_INPUT_REGEX.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  const start = getKarachiDayStartFromParts(year, monthIndex, day);
  if (!start) {
    return null;
  }

  return {
    start,
    end: addUtcDays(start, 1),
  };
};

export const getKarachiMonthRange = (year: number, monthIndex: number) => {
  if (monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  const start = getKarachiDayStartFromParts(year, monthIndex, 1);
  const end = getKarachiDayStartFromParts(
    monthIndex === 11 ? year + 1 : year,
    monthIndex === 11 ? 0 : monthIndex + 1,
    1
  );

  if (!start || !end) {
    return null;
  }

  return { start, end };
};

export const getUtcClockMinutes = (date: Date) =>
  date.getUTCHours() * 60 + date.getUTCMinutes();

export const withUtcClockOnBaseDate = (baseDate: Date, timeSource: Date) => {
  const result = new Date(baseDate);
  result.setUTCHours(
    timeSource.getUTCHours(),
    timeSource.getUTCMinutes(),
    timeSource.getUTCSeconds(),
    0,
  );

  // `baseDate` is the UTC instant for the start of a Karachi day, which is
  // often the previous UTC date at 19:00. Shift/task times arrive with the
  // intended local clock encoded in their UTC clock fields. If applying that
  // clock lands before the Karachi day start, move it forward to the same
  // Karachi day instead of the previous one.
  if (result.getTime() < baseDate.getTime()) {
    result.setUTCDate(result.getUTCDate() + 1);
  }

  return result;
};

export const resolveAttendanceWindow = ({
  baseDate,
  shiftStart,
  shiftEnd,
}: {
  baseDate: Date;
  shiftStart: Date;
  shiftEnd: Date;
}) => {
  const expectedStart = withUtcClockOnBaseDate(baseDate, shiftStart);
  const expectedEnd = withUtcClockOnBaseDate(baseDate, shiftEnd);

  if (expectedEnd <= expectedStart) {
    expectedEnd.setUTCDate(expectedEnd.getUTCDate() + 1);
  }

  return {
    date: new Date(baseDate),
    expectedStart,
    expectedEnd,
  };
};

export const getStartOfStoredUtcDateAsKarachiDay = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0) -
      KARACHI_OFFSET_MS,
  );
