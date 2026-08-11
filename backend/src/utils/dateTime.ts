// UTC-based date/time helpers.
// All day boundaries, shift times, and attendance windows are interpreted as UTC.

export const addUtcDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const getStartOfUtcDay = (date: Date) => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
};

export const getUtcDayRange = (date: Date = new Date()) => {
  const start = getStartOfUtcDay(date);
  return {
    start,
    end: addUtcDays(start, 1),
  };
};

const DATE_INPUT_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

export const getUtcDayRangeFromDateInput = (value: string) => {
  const match = DATE_INPUT_REGEX.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
    return null;
  }

  const start = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0));
  if (
    start.getUTCFullYear() !== year ||
    start.getUTCMonth() !== monthIndex ||
    start.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    start,
    end: addUtcDays(start, 1),
  };
};

export const getUtcMonthRange = (year: number, monthIndex: number) => {
  if (monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const end = new Date(
    Date.UTC(
      monthIndex === 11 ? year + 1 : year,
      monthIndex === 11 ? 0 : monthIndex + 1,
      1,
      0,
      0,
      0,
      0,
    ),
  );

  return { start, end };
};

export const getUtcClockMinutes = (date: Date) =>
  date.getUTCHours() * 60 + date.getUTCMinutes();

export const withUtcClockOnBaseDate = (baseDate: Date, timeSource: Date) => {
  return new Date(
    Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate(),
      timeSource.getUTCHours(),
      timeSource.getUTCMinutes(),
      timeSource.getUTCSeconds(),
      0,
    ),
  );
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

export const getStartOfStoredUtcDateAsUtcDay = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0),
  );
