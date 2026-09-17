export interface StaffStatusEntry {
  localDate: string;
  staff: {
    id: number;
    name: string;
    email: string;
    locationId: number | null;
    shiftStart: string | null;
    shiftEnd: string | null;
    location: { id: number; name: string; timezone: string } | null;
  };
  attendance: {
    status: string;
    expectedStart: string;
    expectedEnd: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    lateMinutes: number | null;
  } | null;
  attendanceDisplayStatus: string;
  attentionCount: number;
  tasks: Array<{
    id: number;
    title: string;
    status: string;
    shiftStart: string;
    shiftEnd: string;
    isLate: boolean;
    isCurrentlyLate?: boolean;
    lateMinutes: number | null;
    displayLateMinutes?: number | null;
  }>;
  taskCounts: {
    pending: number;
    inProgress: number;
    completed: number;
    missed: number;
    notCompletedInTime: number;
    cancelled: number;
    late: number;
    total: number;
  };
  flags: {
    isAbsent: boolean;
    isPresent: boolean;
    isLateAttendance: boolean;
    isShiftNotStarted: boolean;
    hasPendingTasks: boolean;
    hasInProgressTasks: boolean;
    hasAttentionTasks: boolean;
  };
}
