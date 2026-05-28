import type { ElementType } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  default: "bg-primary/12 text-primary",
  sky: "bg-sky-100 text-sky-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-200 text-slate-700",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  tone?: keyof typeof TONES;
  hint?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: StatCardProps) {
  return (
    <Card className="border-border/70">
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className={cn("flex size-12 items-center justify-center rounded-2xl", TONES[tone])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
