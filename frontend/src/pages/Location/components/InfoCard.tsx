import React from "react";
import type { LucideIcon } from "lucide-react";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-none text-sm">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="text-gray-800 font-semibold text-right max-w-[60%] truncate">{value ?? "-"}</span>
  </div>
);

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon: Icon, iconColor = "text-gray-600", children }) => (
  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-600">{title}</h2>
    </div>
    <div className="px-5 py-2">{children}</div>
  </div>
);

export default InfoCard;
