import { useLanguage } from "@/i18n/context";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  message?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  message = "Nothing here yet.",
  action,
}: EmptyStateProps) {
  const { t } = useLanguage();
  return (
    <div className="workspace-empty flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 rounded-2xl bg-muted p-4 text-muted-foreground">
        {icon ?? <Inbox className="h-12 w-12" />}
      </div>
      <p className="text-sm text-muted-foreground">{t(message)}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
