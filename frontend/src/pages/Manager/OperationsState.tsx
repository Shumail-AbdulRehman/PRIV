import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/context";
import { useOnline } from "@/hooks/useOnline";
import LoadingSkeleton, {
  type SkeletonVariant,
} from "@/components/common/LoadingSkeleton";
import PageLoadingSkeleton from "@/components/common/PageLoadingSkeleton";
import type { PageLoadingLayout } from "@/components/common/loadingLayout";
export default function OperationsState({
  loading,
  error,
  retry,
  skeleton = "panel",
  layout,
}: {
  loading?: boolean;
  error?: unknown;
  retry?: () => void;
  skeleton?: SkeletonVariant;
  layout?: PageLoadingLayout;
}) {
  const { t } = useLanguage();
  const online = useOnline();
  if (error) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    return (
      <div className="operations-notice" role="alert">
        <p>
          {t(
            status === 403
              ? "You do not have access to this location. Choose an assigned location or ask your owner."
              : "Records could not load. Check your connection and try again.",
          )}
        </p>
        <Button variant="outline" onClick={retry}>
          {t("Retry")}
        </Button>
      </div>
    );
  }
  if (loading)
    return layout ? (
      <PageLoadingSkeleton layout={layout} section />
    ) : (
      <LoadingSkeleton variant={skeleton} />
    );
  return !online ? (
    <p className="operations-notice" role="status">
      {t(
        "You are viewing the last loaded information. Reconnect and refresh before making changes.",
      )}
    </p>
  ) : null;
}
