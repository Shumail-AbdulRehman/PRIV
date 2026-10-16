import { useEffect, useState, useRef } from "react";
import { Expand, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/context";
import { getEvidenceBlob } from "./api";
export default function ProtectedEvidence({
  assetId,
  privacyState,
  allowRestrictedReview = false,
  alt = "Verification evidence",
}: {
  assetId: string;
  privacyState?: string;
  allowRestrictedReview?: boolean;
  alt?: string;
}) {
  const { t } = useLanguage();
  const [image, setImage] = useState<{ key: string; url: string } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const held = ["PRIVACY_HOLD", "HELD", "HOLD"].includes(privacyState ?? "");
  const reviewAllowed = held && allowRestrictedReview;
  const allowed = ["SAFE", "NOT_REQUIRED"].includes(privacyState ?? "") || reviewAllowed;
  const key = `${assetId}:${privacyState}`;
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!allowed || !root.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [allowed]);
  useEffect(() => {
    if (!allowed || !visible) return;
    const abort = new AbortController();
    let url: string | undefined;
    getEvidenceBlob(assetId, abort.signal)
      .then((blob) => {
        if (abort.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setImage({ key, url });
        setFailed(null);
      })
      .catch(() => {
        if (!abort.signal.aborted) setFailed(key);
      });
    return () => {
      abort.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [assetId, key, allowed, retry, visible]);
  if (!allowed)
    return (
      <p className="ops-evidence-placeholder">
        {t(
          held
            ? "Sensitive image restricted. Request a safe recapture."
            : "Privacy check pending. Photo is not available for routine review yet.",
        )}
      </p>
    );
  const url = image?.key === key ? image.url : null;
  if (failed === key)
    return (
      <div role="alert" className="ops-evidence-placeholder">
        {t("Evidence unavailable.")}
        <Button variant="outline" onClick={() => setRetry((r) => r + 1)}>
          {t("Retry")}
        </Button>
      </div>
    );
  return (
    <div ref={root}>
      {url ? (
        <div className="ops-protected-image">
          {reviewAllowed ? (
            <p className="ops-privacy-notice">
              {t(
                "Privacy flag recorded · Manager access. Viewing does not allow acceptance.",
              )}
            </p>
          ) : null}
          <button
            className="ops-image-button"
            onClick={() => {
              setZoom(1);
              setExpanded(true);
            }}
            aria-label={t("Enlarge photo")}
          >
            <img alt={t(alt)} src={url} />
          </button>
          <Button
            variant="ghost"
            onClick={() => {
              setZoom(1);
              setExpanded(true);
            }}
          >
            <Expand size={16} />
            {t("Enlarge photo")}
          </Button>
          <Dialog open={expanded} onOpenChange={setExpanded}>
            <DialogContent className="workspace ops-image-dialog sm:max-w-5xl">
              <DialogTitle>{t("Review photo")}</DialogTitle>
              <DialogDescription>{t(alt)}</DialogDescription>
              <div className="ops-zoom-toolbar">
                <Button
                  aria-label={t("Zoom out")}
                  variant="outline"
                  disabled={zoom <= 1}
                  onClick={() => setZoom((z) => z - 0.5)}
                >
                  <ZoomOut size={18} />
                  {t("Zoom out")}
                </Button>
                <Button
                  aria-label={t("Zoom in")}
                  variant="outline"
                  disabled={zoom >= 3}
                  onClick={() => setZoom((z) => z + 0.5)}
                >
                  <ZoomIn size={18} />
                  {t("Zoom in")}
                </Button>
              </div>
              <div className="ops-image-zoom">
                <img
                  alt={t(alt)}
                  src={url}
                  style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div role="status" className="ops-evidence-placeholder">
          {t("Loading protected photo…")}
        </div>
      )}
    </div>
  );
}
