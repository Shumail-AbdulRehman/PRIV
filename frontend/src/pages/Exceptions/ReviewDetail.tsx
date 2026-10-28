import LaunchReviewContext from './LaunchReviewContext';
import ReviewSummary from './ReviewSummary';
import {reviewDiagnosis, issueDiagnosis, reviewViewLabel} from './reviewDiagnosis';
import OperationStatus from "@/components/common/OperationStatus";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Camera,
  MapPin,
  UserRound,
  Clock3,
} from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { useOnline } from "@/hooks/useOnline";
import { Button } from "@/components/ui/button";
import { client } from "@/api/client";
import { invalidateWorkspace } from "@/lib/invalidateWorkspace";
import ProtectedEvidence from "../Verification/ProtectedEvidence";
import {
  exceptionStateLabel,
  plainReason,
} from "../Verification/presentation";
import { localTime } from "../Manager/operations";
import OperationsState from "../Manager/OperationsState";
import DecisionForm from "./DecisionForm";
import { useException } from "./queries";
import { readException } from "./api";
import type {
  VerificationIssue,
} from "./types";
function safeReviewReturn(value: string | null) {
  return value && /^\/(exceptions|dashboard|today-status|staff\/\d+|locations\/\d+)(\?|$)/.test(value)
    ? value
    : "/exceptions";
}
export default function ReviewDetail({ id, backTo, returnState }: {
  id:number; backTo:string; returnState?:{scrollY?:number;focusId?:number}|null;
}) {
  const { t, language } = useLanguage();
  const online = useOnline();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const query = useException(id);
  const cache = useQueryClient();
  const detail = query.data;
  const [notice, setNotice] = useState("");
  const returnTo = safeReviewReturn(
    params.get("returnTo") ??
      (location.state as { returnTo?: string } | null)?.returnTo ??
      backTo,
  );
  const actorScope = useSelector(
    (s: RootState) =>
      `${s.auth.user?.companyId}:${s.auth.user?.role}:${s.auth.user?.id}`,
  );
  const listFilters = Object.fromEntries(
    new URLSearchParams(returnTo.split("?")[1] ?? ""),
  );
  const nextFilters = {...listFilters, queue: detail?.state === 'RESOLVED' ? 'needs-me' : listFilters.queue ?? 'needs-me'};
  const nextReturnTo = detail?.state === 'RESOLVED'
    ? '/exceptions?' + new URLSearchParams({...nextFilters,page:'1'}) : returnTo;
  const next = useQuery({
    queryKey: ["review-next", actorScope, id, listFilters, detail?.state],
    queryFn: async ({ signal }) => {
      const result = (await client.get<{data:{nextId:number|null}}>(`/verification-exceptions/${id}/next`, {params:nextFilters,signal})).data.data;
      if(result.nextId || detail?.state !== 'RESOLVED') return result;
      const first = (await client.get<{data:{cases:Array<{id:number}>}}>('/verification-exceptions',{params:{...nextFilters,page:'1',pageSize:'1'},signal})).data.data.cases[0];
      return {nextId:first?.id !== id ? first?.id ?? null : null};
    },
    enabled: id > 0,
  });
  const nextReviewHref = next.data?.nextId ? `/exceptions/${next.data.nextId}?returnTo=${encodeURIComponent(nextReturnTo)}` : undefined;
  useEffect(() => {
    if (detail?.rowVersion === undefined) return;
    void readException(id)
      .then(() => cache.invalidateQueries({ queryKey: ["exception-count"] }))
      .catch(() => {});
  }, [id, detail?.rowVersion, cache]);
  async function done(message?: string) {
    if (message) setNotice(message);
    await invalidateWorkspace(cache);
    try {
      const refreshed = await query.refetch({ throwOnError: true });
      if (message && refreshed.data) {
        const remaining = refreshed.data.issues.filter(
          (i) => i.state !== "RESOLVED",
        );
        const target =
          remaining.find((i) => ["OPEN", "MANAGER_REVIEW"].includes(i.state)) ??
          remaining[0];
        setParams(
          (old) => {
            const n = new URLSearchParams(old);
            n.delete("requirementId");
            if (target) n.set("issueId", String(target.id));
            else n.delete("issueId");
            return n;
          },
          { replace: true },
        );
      }
      await next.refetch();
    } catch {
      if (message)
        setNotice(
          "Decision saved; updated details could not load. Refresh before another decision.",
        );
    }
  }
  const denied=[401,403,404].includes((query.error as {response?:{status?:number}})?.response?.status??0);
  if (query.isPending || !detail || denied)
    return (
      <div className="ops-page">
        <Link className="ops-text-link" to={returnTo}>
          {t(returnTo.startsWith("/exceptions") ? "Back to reviews" : "Back")}
        </Link>
        <OperationsState
          loading={query.isPending}
          layout="review-detail"
          error={query.error}
          retry={() => void query.refetch()}
        />
      </div>
    );
  const requirements = detail.items?.flatMap((item) => item.requirements.map((r) => ({...r,item}))) ?? [];
  const requestedIssue = detail.issues.find((i) => i.id === Number(params.get('issueId')));
  const defaultRequirement = detail.state !== 'RESOLVED' && !params.has('requirementId') && !requestedIssue?.requirementId && !params.has('issueId')
    ? requirements.find(r => ['CLEANING_REQUIRED','RECAPTURE_REQUIRED','REVIEW_REQUIRED'].includes(r.state))
      ?? requirements.find(r => r.mandatory && r.item.mandatory !== false && r.state === 'MISSING') : undefined;
  const selectedRequirement = requirements.find((r) => r.id === params.get('requirementId')) ?? defaultRequirement;
  const linkedIssue = detail.issues.find(i => i.requirementId === selectedRequirement?.id && i.state !== 'RESOLVED');
  const open = detail.issues.filter((i) => i.state !== "RESOLVED");
  const chosen =
    detail.issues.find((i) => i.id === Number(params.get("issueId"))) ??
    open[0] ??
    detail.issues[0];
  const requirementIssue: VerificationIssue | undefined = selectedRequirement
    ? linkedIssue ?? {
        id: -1,
        reasonCode: selectedRequirement.currentAttempt?.reviewSummary?.reasonCode ??
          (selectedRequirement.state === 'MISSING' ? 'MISSING_EVIDENCE' : selectedRequirement.state),
        requirementId: selectedRequirement.id,
        requirement: selectedRequirement,
        state: selectedRequirement.state,
        occurrences: 1,
        recommendedAction: selectedRequirement.instructionsSnapshot,
        firstSeenAt: detail.firstRaisedAt,
        lastSeenAt: detail.updatedAt,
        latestAttempt: selectedRequirement.currentAttempt,
        allowedActions: selectedRequirement.allowedActions,
      }
    : undefined;
  const issue = requirementIssue ?? chosen;
  const diagnosis = reviewDiagnosis(detail, t);
  const selectedDiagnosis = issue ? issueDiagnosis(detail, issue, t) : null;
  const photo = selectedDiagnosis ? selectedDiagnosis.attempt : issue?.latestAttempt;
  const item =
    selectedRequirement?.item ??
    detail.items?.find((i) =>
      i.requirements.some((r) => r.id === issue?.requirementId),
    );
  const requirement =
    selectedRequirement ??
    item?.requirements.find((r) => r.id === issue?.requirementId) ??
    issue?.requirement;
  const timezone = detail.location?.timezone ?? "Asia/Karachi";
  function selectIssue(issueId: number) {
    setParams((old) => {
      const n = new URLSearchParams(old);
      n.set("issueId", String(issueId));
      n.delete("requirementId");
      return n;
    });
  }
  function selectRequirement(requirementId: string) {
    setParams((old) => {
      const n = new URLSearchParams(old);
      n.set('requirementId', requirementId);
      n.delete('issueId');
      return n;
    });
  }
  function inspectRequirement(requirementId: string) {
    selectRequirement(requirementId);
    requestAnimationFrame(() => {
      const panel = document.getElementById('review-evidence');
      panel?.scrollIntoView({block:'start',behavior:'instant'});
      panel?.focus({preventScroll:true});
    });
  }
  return (
    <div className="ops-page ops-review-workspace v5-review-content">
      <div className="ops-review-navigation">
        <Link className="ops-text-link" to={returnTo} state={returnState}>
          <ArrowLeft size={16} />
          {t(returnTo.startsWith("/exceptions") ? "Back to reviews" : "Back")}
        </Link>
        {nextReviewHref ? (
          <Button asChild variant="outline">
            <Link
              to={nextReviewHref}
              state={returnState}
            >
              {t(detail.state === 'RESOLVED' ? "Next pending review" : "Next review")}
              <ArrowRight size={16} />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={() => void next.refetch()}>
            {t("Check for next review")}
          </Button>
        )}
      </div>
      <section className="v5-review-reason" aria-label={t('Review reason')}>
        <Camera size={20} aria-hidden="true"/><div><h2>{detail.state === 'RESOLVED' ? t('Review handled') : selectedDiagnosis?.title ?? t(plainReason(issue?.reasonCode??'REVIEW_REQUIRED'))}</h2><p>{detail.state === 'RESOLVED' ? t('This review has been handled. Existing photos and task completion records stay as recorded.') : selectedDiagnosis?.description ?? diagnosis.next}</p></div>
      </section>
      <div className={"v5-evidence-and-decision"+(detail.kind==='SETUP'?' v5-review-setup-layout':'')}>
      <div className="v5-evidence-stack">
      <section className="ops-panel v5-evidence-card" id="review-evidence" tabIndex={-1}>
      <header className="ops-header v5-evidence-header">
        <div>
          <h2>
            {detail.area?.name ??
              detail.task?.areaNameSnapshot ??
              t("Room setup")}
          </h2>
          <div className="ops-case-meta">
            <span>
              <MapPin size={16} />
              {detail.location?.name}
            </span>
            {detail.kind !== 'SETUP' && detail.task ? <span>
              <UserRound size={16} />
              {detail.task.staff?.name ?? t("Unassigned")}
            </span> : null}
            {detail.task?.shiftEnd ? (
              <span>
                <Clock3 size={16} />
                <bdi>
                  {localTime(detail.task.shiftEnd, timezone, language, true)}
                </bdi>
              </span>
            ) : null}
          </div>
        </div>
      </header>
      <div className="ops-case-status v5-evidence-status">
        <OperationStatus
          state={detail.state}
          label={exceptionStateLabel(detail.state)}
        />
        <span>
          {detail.kind === "SETUP"
            ? t("No task generated")
            : !detail.task ? t("Task submission information unavailable")
            : detail.task.staffSubmittedAt ? t("Task submitted") : t("Task not submitted")}
        </span>
      </div>
      <OperationsState error={query.error} retry={() => void query.refetch()} />
      {!online ? (
        <p className="operations-notice" role="status">
          {t(
            "Internet needed to save a decision. Reconnect and try again. Your note stays on this page.",
          )}
        </p>
      ) : null}
      {notice ? (
        <div className="ops-save-result" role="status">
          <CheckCircle2 size={20} />
          <div>
            <strong>{t(notice)}</strong>
            <p>
              {t("{count} unresolved issues remain", { count: open.length })}
            </p>
          </div>
        </div>
      ) : null}

      {open.length > 1 ? (
        <div className="ops-issue-tabs" aria-label={t("Issues in this review")}>
          {open.map((i) => (
            <button
              key={i.id}
              aria-pressed={!requirementIssue && issue?.id === i.id}
              onClick={() => selectIssue(i.id)}
            >
              {t(plainReason(i.reasonCode))}
            </button>
          ))}
        </div>
      ) : null}
      {detail.kind === "SETUP" ? (
        <section className="ops-panel-body v5-review-setup">
          <h2>{t("Room inventory needs setup")}</h2>
          <p>
            {t(
              "Configure the room and its schedule. Photos cannot be reviewed until the inventory is ready.",
            )}
          </p>
          <p role="status">{t('Complete the room setup before reviewing task photos. No staff decision is available for this setup record.')}</p>
          <div className="v5-review-setup-actions"><Button asChild>
            <Link to={`/locations/${detail.locationId}?tab=templates`}>
              {t("Review room setup")}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => void done()}>
            {t("Check again")}
          </Button></div>
        </section>
      ) : (
        <div className="v5-evidence-body">
          <section className="ops-evidence-column">
            <div className="ops-panel-heading">
              <div>
                <h2>
                  {item?.nameSnapshot ??
                    issue?.requirement?.item?.nameSnapshot ??
                    t("Task photos")}
                </h2>
                <p>
                  {requirement
                    ? reviewViewLabel(requirement.viewKey,t)
                    : t("Room and fixture evidence")}
                </p>
              </div>
              <OperationStatus
                state={selectedDiagnosis?.category === 'review' ? 'REVIEW_REQUIRED' : photo?.state ?? requirement?.state ?? "MISSING"}
                label={selectedDiagnosis?.title ?? plainReason(photo?.state ?? requirement?.state ?? 'MISSING')}
              />
            </div>
            <div className="ops-panel-body">
              {photo?.mediaAssetId ? (
                <ProtectedEvidence
                  assetId={photo.mediaAssetId}
                  privacyState={photo.privacyState}
                  allowRestrictedReview
                  variant="workspace"
                  key={photo.mediaAssetId}
                  alt={`${item?.nameSnapshot ?? detail.area?.name ?? t("Room photo")} · ${t(plainReason(requirement?.viewKey ?? photo.contextKey ?? "Photo"))}`}
                />
              ) : (
                <div className="ops-evidence-placeholder">
                  <Camera size={30} />
                  <strong>{t(photo?.privacyState === 'DISCARDED' ? 'Rejected photo was not kept' : photo ? 'Photo is unavailable to view' : selectedDiagnosis?.category === 'missing' ? 'This required photo is missing' : 'No photo linked to this issue')}</strong>
                  <p>{t(photo?.privacyState === 'DISCARDED' ? 'The photo was rejected and was not retained for manager review. Its recorded check result is explained in this review.' : photo ? 'Use the recorded explanation in this review. A preview is not available for this attempt.' : selectedDiagnosis?.description ?? 'The review summary above lists the affected fixtures and missing photos.')}</p>
                </div>
              )}
              {photo?.receivedAt ? (
                <p className="ops-photo-caption">
                  {t("Received")}{" "}
                  <bdi>
                    {localTime(photo.receivedAt, timezone, language, true)}
                  </bdi>
                </p>
              ) : null}
              {requirement ? (
                <div className="ops-instructions">
                  <h3>{t("What this photo must show")}</h3>
                  <p>{requirement.instructionsSnapshot}</p>
                </div>
              ) : null}
              {detail.items?.length ? (
                <section className="ops-requirements v5-photo-thumbnails" aria-label={t('Required photo views')}>
                  <h3>{t("All required photos")}</h3>
                  {detail.items.map((i) => (
                    <div key={i.id}>
                      {i.requirements.map((r) => (
                        <button
                          className="ops-requirement"
                          key={r.id}
                          onClick={() => selectRequirement(r.id)}
                          aria-pressed={requirement?.id === r.id}
                        >
                          {r.currentAttempt?.mediaAssetId
                            ? <ProtectedEvidence key={r.currentAttempt.mediaAssetId} assetId={r.currentAttempt.mediaAssetId} privacyState={r.currentAttempt.privacyState} allowRestrictedReview variant="thumbnail" alt=""/>
                            : <span className="v5-thumbnail-missing"><Camera size={22} aria-hidden="true"/></span>}
                          <span>
                            <strong>{i.nameSnapshot}</strong>
                            <small>
                              {reviewViewLabel(r.viewKey,t)}
                              {!r.mandatory ? ` · ${t("Optional")}` : ""}
                            </small>
                          </span>
                          <OperationStatus state={r.state} label={diagnosis.rows.find(row => row.id === r.id)?.title ?? plainReason(r.state)} />
                        </button>
                      ))}
                    </div>
                  ))}
                </section>
              ) : null}
              {detail.standards?.filter(
                (s) => !s.areaItemId || s.areaItemId === item?.sourceAreaItemId,
              ).length ? (
                <details className="ops-history">
                  <summary>{t("Example guidance")}</summary>
                  <p>
                    {t(
                      "Current room guidance. Task requirements above remain unchanged.",
                    )}
                  </p>
                  {detail.standards
                    .filter(
                      (s) =>
                        !s.areaItemId ||
                        s.areaItemId === item?.sourceAreaItemId,
                    )
                    .map((s) => (
                      <div key={s.id}>
                        <p>{s.caption}</p>
                        <ProtectedEvidence
                          assetId={s.mediaAssetId}
                          privacyState="SAFE"
                          alt={s.caption ?? t("Example guidance")}
                        />
                      </div>
                    ))}
                </details>
              ) : null}
              {(detail.attempts ?? []).some((a) => a.contextKey) ? (
                <details className="ops-history">
                  <summary>{t("Room context photos")}</summary>
                  {detail.attempts
                    ?.filter((a) => a.contextKey)
                    .map((a) => (
                      <div key={a.id}>
                        <p>{t(plainReason(a.contextKey!))}</p>
                        {a.mediaAssetId ? (
                          <ProtectedEvidence
                            assetId={a.mediaAssetId}
                            privacyState={a.privacyState}
                            allowRestrictedReview
                          />
                        ) : (
                          <p>
                            {t(
                              "Privacy check pending. Photo is not available for routine review yet.",
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                </details>
              ) : null}
            </div>
          </section>
        </div>
      )}
      </section>
      {detail.kind !== 'SETUP' && <LaunchReviewContext detail={detail} replacement={selectedRequirement?.replacement} />}
      {detail.kind !== 'SETUP' && <details className="v5-findings-disclosure"><summary>{t('Review findings and capture rules')}</summary><ReviewSummary detail={detail} onSelect={inspectRequirement}/></details>}
      </div>
      {detail.kind !== 'SETUP' && <section className="ops-panel ops-action-column v5-decision-card" id="review-finding" tabIndex={-1}>
        <div className="ops-panel-body">
          <DecisionForm detail={detail} onDone={done} nextReviewHref={nextReviewHref} />
        </div>
      </section>}
      </div>
    </div>
  );
}
