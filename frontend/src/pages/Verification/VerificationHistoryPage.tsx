import { useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { ArrowLeft, Camera, Clock3, MapPin, RefreshCw, UserRound } from "lucide-react";
import type { RootState } from "@/store/store";
import { useLanguage } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import OperationStatus from "@/components/common/OperationStatus";
import ListenButton from "@/components/common/ListenButton";
import OperationsState from "../Manager/OperationsState";
import { localTime } from "../Manager/operations";
import { getVerification, getVerificationHistory } from "./api";
import ProtectedEvidence from "./ProtectedEvidence";
import { plainReason, verificationLabel } from "./presentation";
import type { VerificationManifest } from "./types";
import { client } from "@/api/client";
import AreaSubmissionsPanel from "../Task/components/AreaSubmissionsPanel";

type Task = {
  id: number; title: string; verificationVersion: number;
  staff?: { name: string } | null;
  verificationException?: { id: number; state: string } | null;
};
export default function VerificationHistoryPage() {
  const id = Number(useParams().id);
  const { t } = useLanguage();
  if (!Number.isSafeInteger(id) || id < 1)
    return <p role="alert">{t("Task unavailable.")}</p>;
  return <TaskPhotos key={id} id={id} />;
}
function TaskPhotos({ id }: { id: number }) {
  const { t, language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const scope = useSelector((s: RootState) => `${s.auth.user?.companyId}:${s.auth.user?.role}:${s.auth.user?.id}`);
  const candidate = params.get("returnTo");
  const returnTo = candidate && /^\/(exceptions|dashboard|today-status|staff\/\d+|locations\/\d+)(\?|$)/.test(candidate)
    ? candidate : `/today-status?tab=tasks&taskId=${id}`;
  const task = useQuery({
    queryKey: ["verification-task", scope, id],
    queryFn: async ({ signal }) => (await client.get<{ data: Task }>(`/task-instance/${id}`, { signal })).data.data,
  });
  const caseId = task.data?.verificationVersion === 2 ? task.data.verificationException?.id : undefined;
  const manifest = useQuery({
    queryKey: ["verification", scope, id],
    queryFn: () => getVerification(id),
    enabled: task.data?.verificationVersion === 2 && !caseId,
    staleTime: 15000,
    gcTime: 60000,
    refetchOnWindowFocus: true,
  });
  // Old bookmarks and staff/location links land in the complete workspace.
  // Use the authorized case identifier, never the task identifier.
  const destination = caseId ?? manifest.data?.exceptions[0]?.id;
  if (destination && !task.isError && (caseId || !manifest.isError))
    return <Navigate replace to={`/exceptions/${destination}?returnTo=${encodeURIComponent(returnTo)}`} />;
  const data = manifest.data;
  const loading = task.isPending || (task.data?.verificationVersion === 2 && manifest.isPending);
  const error = task.error ?? manifest.error;
  return <div className="ops-page">
    <div className="ops-review-navigation">
      <Link className="ops-text-link" to={returnTo}><ArrowLeft size={18} />{t("Back")}</Link>
      <Button variant="outline" disabled={task.isFetching || manifest.isFetching} onClick={() => { void task.refetch(); if (data) void manifest.refetch(); }}>
        <RefreshCw size={16} />{t("Refresh")}
      </Button>
    </div>
    <header className="ops-header"><div>
      <h1>{data?.area.name ?? task.data?.title ?? t("Task photos")}</h1>
      <p>{data?.task.title ?? t("Task photos and required views")}</p>
      {data ? <div className="ops-case-meta">
        <span><MapPin size={16} />{data.task.location?.name}</span>
        <span><UserRound size={16} />{task.data?.staff?.name ?? t("Unassigned")}</span>
        <span><Clock3 size={16} />{t("Due")} {localTime(data.task.shiftEnd, data.task.location?.timezone ?? "Asia/Karachi", language, true)}</span>
        <OperationStatus state={data.task.verificationState} label={verificationLabel(data.task)} />
      </div> : null}
    </div></header>
    <OperationsState loading={loading} error={error} retry={() => { void task.refetch(); if (task.data?.verificationVersion === 2) void manifest.refetch(); }} />
    {!error && data ? <PhotoWorkspace id={id} scope={scope} data={data} selectedId={params.get("view")} select={(view) => setParams(old => { const next = new URLSearchParams(old); next.set("view", view); return next; }, { replace: true })} /> : null}
    {!error && task.data && task.data.verificationVersion !== 2 ? <section className="ops-panel ops-panel-body">
      <h2>{t("Task photos")}</h2><AreaSubmissionsPanel taskInstanceId={id} />
    </section> : null}
  </div>;
}
function PhotoWorkspace({ id, scope, data, selectedId, select }: {
  id: number; scope: string; data: VerificationManifest; selectedId: string | null; select: (id: string) => void;
}) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const views = data.items.flatMap(item => item.requirements.map(requirement => ({ item, requirement })));
  const selected = views.find(v => v.requirement.id === selectedId) ?? views[0];
  const photo = selected?.requirement.currentAttempt;
  const required = views.filter(v => v.item.mandatory && v.requirement.mandatory);
  const received = required.filter(v => !!v.requirement.currentAttempt).length;
  const history = useInfiniteQuery({
    queryKey: ["verification-history", scope, id],
    queryFn: ({ pageParam }) => getVerificationHistory(id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.nextCursor ?? undefined,
    enabled: expanded,
    gcTime: 60000,
    staleTime: 15000,
  });
  return <>
    <div className="ops-photo-summary">
      <div><Camera size={20} /><div><strong>{t("{received} of {total} required photos received", { received, total: required.length })}</strong>
        <p>{t("Received photos may still need checking.")}</p></div></div>
      <p>{t("No manager review is open for this task.")}</p>
    </div>
    <div className="ops-photo-workspace">
      <section className="ops-panel ops-photo-selector" aria-label={t("Required photo views")}>
        <div className="ops-panel-heading"><div><h2>{t("Required photo views")}</h2><p>{t("Choose a view to inspect its photo.")}</p></div></div>
        {data.items.map(item => <div className="ops-photo-fixture" key={item.id}>
          <h3>{item.nameSnapshot}</h3>
          {item.requirements.map(r => <button key={r.id} aria-pressed={selected?.requirement.id === r.id} onClick={() => select(r.id)}>
            <span>{t(plainReason(r.viewKey))}</span>
            <small>{t(plainReason(r.state))}{!r.mandatory || !item.mandatory ? ` · ${t("Optional")}` : ""}</small>
          </button>)}
        </div>)}
        {!views.length ? <p className="ops-empty">{t("No photo requirements for this task.")}</p> : null}
      </section>
      <section className="ops-panel ops-photo-inspect">
        <div className="ops-panel-heading"><div><h2>{selected?.item.nameSnapshot ?? t("Task photos")}</h2><p>{selected ? t(plainReason(selected.requirement.viewKey)) : t("Required photo views")}</p></div></div>
        <div className="ops-panel-body">
          {photo?.mediaAssetId ? <ProtectedEvidence assetId={photo.mediaAssetId} privacyState={photo.privacyState} allowRestrictedReview alt={`${selected?.item.nameSnapshot} · ${t(plainReason(selected?.requirement.viewKey ?? "Photo"))}`} /> : <div className="ops-evidence-placeholder">
            <Camera size={32} /><strong>{t(photo ? "This photo is not available for review yet." : "No photo received for this view")}</strong>
            <p>{t("Photos saved only on the worker’s phone appear after uploading.")}</p>
          </div>}
          {selected ? <div className="ops-instructions"><h3>{t("What this photo must show")}</h3><p>{selected.requirement.instructionsSnapshot}</p><ListenButton text={selected.requirement.instructionsSnapshot} /></div> : null}
          {photo ? <OperationStatus state={photo.manualOutcome ?? photo.state} label={plainReason(photo.manualOutcome ?? photo.state)} /> : null}
        </div>
      </section>
    </div>
    <details className="ops-panel ops-photo-history" onToggle={e => setExpanded(e.currentTarget.open)}>
      <summary>{t("Previous photos and upload history")}</summary>
      {expanded ? <div className="ops-panel-body">
        <OperationsState loading={history.isPending} error={history.error} retry={() => void history.refetch()} />
        {history.isSuccess && !history.data.pages.some(p => p.attempts.length) ? <p className="ops-empty">{t("No uploaded photos yet.")}</p> : null}
        {history.data?.pages.flatMap(p => p.attempts).map(a => <section key={a.id} className="ops-photo-history-entry">
          <h3>{a.requirement?.item.nameSnapshot ?? t("Room photo")} · {t(plainReason(a.requirement?.viewKey ?? a.contextKey ?? "Photo"))}</h3>
          <p>{localTime(a.createdAt, data.task.location?.timezone ?? "Asia/Karachi", language, true)} · {a.staff?.name} · {t(plainReason(a.manualOutcome ?? a.state))}</p>
          {a.mediaAssetId ? <ProtectedEvidence assetId={a.mediaAssetId} privacyState={a.privacyState} allowRestrictedReview /> : <p>{t("This photo is not available for review yet.")}</p>}
        </section>)}
        {history.hasNextPage ? <Button variant="outline" disabled={history.isFetchingNextPage} onClick={() => void history.fetchNextPage()}>{t(history.isFetchingNextPage ? "Loading…" : "Load older photos")}</Button> : null}
      </div> : null}
    </details>
  </>;
}
