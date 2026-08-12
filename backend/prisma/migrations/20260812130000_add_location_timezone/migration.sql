-- Add per-location timezone (IANA name). Existing locations were created under
-- the old Karachi-time logic, so they default to Asia/Karachi, which keeps all
-- existing shift/attendance/task timestamps valid without rewriting them.

ALTER TABLE "Location" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi';
