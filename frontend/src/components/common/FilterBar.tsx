import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export default function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-3xl border border-border/70 bg-card/95 p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.3)] sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto]",
        className,
      )}
    >
      {children}
    </div>
  );
}
