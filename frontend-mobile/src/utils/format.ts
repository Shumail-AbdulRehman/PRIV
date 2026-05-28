const KARACHI_TIMEZONE = "Asia/Karachi";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: KARACHI_TIMEZONE,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: KARACHI_TIMEZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: KARACHI_TIMEZONE,
});

export const formatTaskWindow = (start: string, end: string) =>
  `${timeFormatter.format(new Date(start))} - ${timeFormatter.format(new Date(end))}`;

export const formatClockTime = (value: string | Date) =>
  timeFormatter.format(typeof value === "string" ? new Date(value) : value);

export const formatAttendanceStatus = (status: string) =>
  status.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (char) => char.toUpperCase());

export const formatShortDate = (value: string) =>
  dateFormatter.format(new Date(value));

export const formatShortDateTime = (value: string | Date) =>
  dateTimeFormatter.format(typeof value === "string" ? new Date(value) : value);
