export type RootStackParamList = {
  Login: undefined;
  StaffTabs: undefined;
  QrScanner: {
    taskId: number;
    taskTitle: string;
  };
  CompleteTask: {
    taskId: number;
    taskTitle: string;
  };
};

export type StaffTabId = "Shift" | "Tasks";

export type StaffUser = {
  id: number;
  name: string;
  email: string;
  role: "STAFF";
  companyId: number;
  locationId: number | null;
};

export type AuthTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type AuthSession = AuthTokens & {
  user: StaffUser | null;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AttendanceStatus =
  | "ABSENT"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "LATE"
  | "MISSED_CHECKOUT";

export type AttendanceRecord = {
  id: number;
  date: string;
  status: AttendanceStatus;
  expectedStart: string;
  expectedEnd: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInImage: string | null;
  checkOutImage: string | null;
  location?: {
    id: number;
    name: string;
  };
};

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "MISSED"
  | "CANCELLED"
  | "NOT_COMPLETED_INTIME";

export type TaskInstance = {
  id: number;
  title: string;
  status: TaskStatus;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  startedAt: string | null;
  completedAt: string | null;
  proofImageUrls: string[];
  template?: {
    id: number;
    qrToken: string;
    location?: {
      id: number;
      name: string;
      address?: string;
    };
  };
};
