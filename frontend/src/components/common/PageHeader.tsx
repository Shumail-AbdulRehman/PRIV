import { useLanguage } from "@/i18n/context";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "page-header flex items-start justify-between gap-4 flex-wrap",
        className,
      )}
    >
      <div className="page-header-copy">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {t(title)}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t(subtitle)}
          </p>
        )}
      </div>
      {action && <div className="page-header-actions">{action}</div>}
    </div>
  );
}
