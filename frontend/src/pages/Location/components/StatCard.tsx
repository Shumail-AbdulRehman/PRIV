import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: "blue" | "green" | "amber" | "purple" | "rose" | "cyan";
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-600",   text: "text-blue-700"   },
  green:  { bg: "bg-green-50",  icon: "bg-green-100 text-green-600",  text: "text-green-700"  },
  amber:  { bg: "bg-amber-50",  icon: "bg-amber-100 text-amber-600",  text: "text-amber-700"  },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", text: "text-purple-700" },
  rose:   { bg: "bg-rose-50",   icon: "bg-rose-100 text-rose-600",    text: "text-rose-700"   },
  cyan:   { bg: "bg-cyan-50",   icon: "bg-cyan-100 text-cyan-600",    text: "text-cyan-700"   },
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  const c = colorMap[color];
  return (
    <div className={`flex items-center gap-4 rounded-2xl ${c.bg} p-4 shadow-sm`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.icon}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
