import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { ZoomIn, ZoomOut } from "lucide-react";
import { client } from "@/api/client";
import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export type AttendancePhoto = {
  state: "AVAILABLE" | "NONE" | "LEGACY_RESTRICTED";
  path: string | null;
};
type Props = { attendanceId: number; kind: "check-in" | "check-out"; photo?: AttendancePhoto | null };
type PhotoState = { kind: "loading" } | { kind: "ready"; url: string } | { kind: "failed"; status?: number };

function PhotoBytes({ path, alt, retry }: { path: string; alt: string; retry: () => void }) {
  const { t } = useLanguage();
  const [state, setState] = useState<PhotoState>({ kind: "loading" });
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const abort = new AbortController();
    let url: string | undefined;
    client.get<Blob>(path, { responseType: "blob", signal: abort.signal })
      .then(({ data }) => {
        if (abort.signal.aborted) return;
        if (!data.type.startsWith("image/jpeg") || !data.size || data.size > 5 * 1024 * 1024)
          throw new Error("Invalid photo response");
        url = URL.createObjectURL(data);
        setState({ kind: "ready", url });
      })
      .catch((error: unknown) => {
        if (!abort.signal.aborted) setState({ kind: "failed", status: isAxiosError(error) ? error.response?.status : undefined });
      });
    return () => { abort.abort(); if (url) URL.revokeObjectURL(url); };
  }, [path]);
  if (state.kind === "loading") return <div className="ops-evidence-placeholder" role="status">{t("Loading attendance photo…")}</div>;
  if (state.kind === "failed") {
    const denied = state.status === 401 || state.status === 403;
    const missing = state.status === 404;
    return <div className="ops-evidence-placeholder" role="alert">
      <p>{t(denied ? "You no longer have access to this photo." : missing ? "Photo unavailable. The attendance record is unchanged." : "The photo could not load. Try again.")}</p>
      {!denied && !missing ? <Button variant="outline" onClick={retry}>{t("Retry")}</Button> : null}
    </div>;
  }
  return <>
    <div className="ops-zoom-toolbar">
      <Button variant="outline" disabled={zoom <= 1} onClick={() => setZoom(value => value - .5)}><ZoomOut aria-hidden="true" size={18} />{t("Zoom out")}</Button>
      <Button variant="outline" disabled={zoom >= 3} onClick={() => setZoom(value => value + .5)}><ZoomIn aria-hidden="true" size={18} />{t("Zoom in")}</Button>
    </div>
    <div className="ops-image-zoom"><img src={state.url} alt={alt} style={{ width: `${zoom * 100}%`, maxWidth: "none" }} onError={() => setState({ kind: "failed" })} /></div>
  </>;
}

function PhotoDialog({ path, kind }: { path: string; kind: Props["kind"] }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const title = t(kind === "check-in" ? "Check-in photo" : "Check-out photo");
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline">{t(kind === "check-in" ? "View check-in photo" : "View check-out photo")}</Button></DialogTrigger>
    <DialogContent className="workspace ops-image-dialog sm:max-w-5xl" showCloseButton={false}>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{t("Protected attendance photo.")}</DialogDescription>
      {open ? <PhotoBytes key={attempt} path={path} alt={title} retry={() => setAttempt(value => value + 1)} /> : null}
      <DialogClose asChild><Button variant="outline">{t("Close")}</Button></DialogClose>
    </DialogContent>
  </Dialog>;
}

export default function ProtectedAttendancePhoto({ attendanceId, kind, photo }: Props) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const path = `/attendance/${attendanceId}/photos/${kind}`;
  if (!user || photo?.state !== "AVAILABLE" || photo.path !== path || !Number.isSafeInteger(attendanceId) || attendanceId < 1) {
    return <span className="text-sm text-muted-foreground">{t(photo?.state === "LEGACY_RESTRICTED" ? "This earlier photo is unavailable. The attendance record is unchanged." : "No photo recorded.")}</span>;
  }
  // Remount on role/tenant/account/record change: an old user's in-memory bytes
  // and open dialog must never survive a different authenticated principal.
  return <PhotoDialog key={`${user.role}:${user.companyId}:${user.id}:${path}`} path={path} kind={kind} />;
}
