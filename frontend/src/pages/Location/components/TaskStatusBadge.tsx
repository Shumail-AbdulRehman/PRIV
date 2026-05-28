import React from "react";

type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NOT_COMPLETED_INTIME"
  | "MISSED"
  | "CANCELLED";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  count: number;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  PENDING:              { label: "Pending",            className: "bg-gray-100 text-gray-700 border-gray-200" },
  IN_PROGRESS:          { label: "In Progress",        className: "bg-blue-100 text-blue-700 border-blue-200" },
  COMPLETED:            { label: "Completed",          className: "bg-green-100 text-green-700 border-green-200" },
  NOT_COMPLETED_INTIME: { label: "Not On Time",        className: "bg-amber-100 text-amber-700 border-amber-200" },
  MISSED:               { label: "Missed",             className: "bg-rose-100 text-rose-700 border-rose-200" },
  CANCELLED:            { label: "Cancelled",          className: "bg-slate-100 text-slate-600 border-slate-200" },
};

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, count }) => {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${cfg.className}`}>
      <span className="text-sm font-medium">{cfg.label}</span>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
};

export default TaskStatusBadge;
