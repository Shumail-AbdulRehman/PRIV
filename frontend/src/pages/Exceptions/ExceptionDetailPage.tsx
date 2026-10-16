import OperationStatus from "@/components/common/OperationStatus";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import {
  Link,
  useParams,
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
import ListenButton from "@/components/common/ListenButton";
import ProtectedEvidence from "../Verification/ProtectedEvidence";
import {
  exceptionStateLabel,
  plainReason,
  verificationLabel,
} from "../Verification/presentation";
import { localTime } from "../Manager/operations";
import OperationsState from "../Manager/OperationsState";
import DecisionForm from "./DecisionForm";
import { useException } from "./queries";
import { getException, readException } from "./api";
import { reviewGuidance, reviewActionLabels } from "./reviewPresentation";
import type {
  ExceptionDetail,
  VerificationIssue,
  ExceptionAction,
} from "./types";
function safeReviewReturn(value: string | null) {
  return value && /^\/(exceptions|dashboard|today-status|staff\/\d+|locations\/\d+)(\?|$)/.test(value)
    ? value
    : "/exceptions";
}
export default function ExceptionDetailPage() {
  const { t } = useLanguage();
  const id = Number(useParams().id);
  if (!Number.isSafeInteger(id) || id < 1)
    return <p role="alert">{t("Review unavailable.")}</p>;
  return <Workspace key={id} id={id} />;
}
function Workspace({ id }: { id: number }) {
  const { t, language } = useLanguage();
  const online = useOnline();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const query = useException(id);
  const cache = useQueryClient();
  const detail = query.data;
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<ExceptionDetail | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const returnTo = safeReviewReturn(
    params.get("returnTo") ??
      (location.state as { returnTo?: string } | null)?.returnTo ??
      null,
  );
  const returnState = location.state as {
    scrollY?: number;
    focusId?: number;
  } | null;
  const actorScope = useSelector(
    (s: RootState) =>
      `${s.auth.user?.companyId}:${s.auth.user?.role}:${s.auth.user?.id}`,
  );
  const listFilters = Object.fromEntries(
    new URLSearchParams(returnTo.split("?")[1] ?? ""),
  );
  const next = useQuery({
    queryKey: ["review-next", actorScope, id, listFilters],
    queryFn: async ({ signal }) =>
      (
        await client.get<{ data: { nextId: number | null } }>(
          `/verification-exceptions/${id}/next`,
          {
            params: { ...listFilters, queue: listFilters.queue ?? "needs-me" },
            signal,
          },
        )
      ).data.data,
    enabled: id > 0,
  });
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
  async function loadOlder() {
    if (!detail) return;
    setLoadingHistory(true);
    try {
      const cursors = {
        attemptCursor:
          (history ? history.nextAttemptCursor : detail.nextAttemptCursor) ??
          undefined,
        decisionCursor:
          (history ? history.nextDecisionCursor : detail.nextDecisionCursor) ??
          undefined,
        eventCursor:
          (history ? history.nextEventCursor : detail.nextEventCursor) ??
          undefined,
      };
      const page = await getException(id, cursors);
      setHistory((old) => ({
        ...page,
        attempts: [
          ...(old?.attempts ?? []),
          ...(cursors.attemptCursor ? (page.attempts ?? []) : []),
        ],
        decisions: [
          ...(old?.decisions ?? []),
          ...(cursors.decisionCursor ? page.decisions : []),
        ],
        events: [
          ...(old?.events ?? []),
          ...(cursors.eventCursor ? page.events : []),
        ],
      }));
      setHistoryError("");
    } catch {
      setHistoryError("Older history could not load. Try again.");
    } finally {
      setLoadingHistory(false);
    }
  }
  if (query.isPending || !detail)
    return (
      <div className="ops-page">
        <Link className="ops-text-link" to={returnTo}>
          {t(returnTo.startsWith("/exceptions") ? "Back to reviews" : "Back")}
        </Link>
        <OperationsState
          loading={query.isPending}
          error={query.error}
          retry={() => void query.refetch()}
        />
      </div>
    );
  const selectedRequirement = detail.items
    ?.flatMap((i) => i.requirements.map((r) => ({ ...r, item: i })))
    .find((r) => r.id === params.get("requirementId"));
  const open = detail.issues.filter((i) => i.state !== "RESOLVED");
  const chosen =
    detail.issues.find((i) => i.id === Number(params.get("issueId"))) ??
    open[0] ??
    detail.issues[0];
  const requirementIssue: VerificationIssue | undefined = selectedRequirement
    ? {
        id: -1,
        reasonCode:
          selectedRequirement.state === "MISSING"
            ? "MISSING_EVIDENCE"
            : selectedRequirement.state,
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
  const photo = issue?.latestAttempt;
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
      n.set("requirementId", requirementId);
      return n;
    });
  }
  const decisions = [
    ...new Map(
      [...detail.decisions, ...(history?.decisions ?? [])].map((d) => [
        d.id,
        d,
      ]),
    ).values(),
  ];
  const attempts = [
    ...new Map(
      [...(detail.attempts ?? []), ...(history?.attempts ?? [])].map((a) => [
        a.id,
        a,
      ]),
    ).values(),
  ];
  const older = history ?? detail;
  return (
    <div className="ops-page ops-review-workspace">
      <div className="ops-review-navigation">
        <Link className="ops-text-link" to={returnTo} state={returnState}>
          <ArrowLeft size={16} />
          {t(returnTo.startsWith("/exceptions") ? "Back to reviews" : "Back")}
        </Link>
        {next.data?.nextId ? (
          <Button asChild variant="outline">
            <Link
              to={`/exceptions/${next.data.nextId}?returnTo=${encodeURIComponent(returnTo)}`}
              state={returnState}
            >
              {t("Next review")}
              <ArrowRight size={16} />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={() => void next.refetch()}>
            {t("Check for next review")}
          </Button>
        )}
      </div>
      <header className="ops-header">
        <div>
          <h1>
            {detail.area?.name ??
              detail.task?.areaNameSnapshot ??
              t("Room setup")}
          </h1>
          <div className="ops-case-meta">
            <span>
              <MapPin size={16} />
              {detail.location?.name}
            </span>
            <span>
              <UserRound size={16} />
              {detail.task?.staff?.name ?? t("Unassigned")}
            </span>
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
      <div className="ops-case-status">
        <OperationStatus
          state={detail.state}
          label={exceptionStateLabel(detail.state)}
        />
        <span>
          {detail.task?.staffSubmittedAt
            ? t("Work submitted")
            : detail.task?.title}
        </span>
        {detail.task?.completionOutcome || detail.task?.staffSubmittedAt ? (
          <span>{t(verificationLabel(detail.task))}</span>
        ) : null}
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
      {open.length ? (
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
        <section className="ops-panel ops-panel-body">
          <h2>{t("Room inventory needs setup")}</h2>
          <p>
            {t(
              "Configure the room and its schedule. Photos cannot be reviewed until the inventory is ready.",
            )}
          </p>
          <Button asChild>
            <Link to={`/locations/${detail.locationId}?tab=templates`}>
              {t("Review room setup")}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => void done()}>
            {t("Check again")}
          </Button>
        </section>
      ) : (
        <div className="ops-review-columns">
          <section className="ops-panel ops-evidence-column">
            <div className="ops-panel-heading">
              <div>
                <h2>
                  {item?.nameSnapshot ??
                    issue?.requirement?.item?.nameSnapshot ??
                    t("Task photos")}
                </h2>
                <p>
                  {requirement
                    ? t(plainReason(requirement.viewKey))
                    : t("Room and fixture evidence")}
                </p>
              </div>
              <OperationStatus
                state={photo?.state ?? requirement?.state ?? "MISSING"}
                label={plainReason(
                  photo?.state ?? requirement?.state ?? "MISSING",
                )}
              />
            </div>
            <div className="ops-panel-body">
              {photo?.mediaAssetId ? (
                <ProtectedEvidence
                  assetId={photo.mediaAssetId}
                  privacyState={photo.privacyState}
                  allowRestrictedReview
                  alt={`${item?.nameSnapshot ?? detail.area?.name ?? t("Room photo")} · ${t(plainReason(requirement?.viewKey ?? photo.contextKey ?? "Photo"))}`}
                />
              ) : (
                <div className="ops-evidence-placeholder">
                  <Camera size={30} />
                  <strong>
                    {t(
                      photo
                        ? "This photo is not available for review yet."
                        : "No photo received for this view",
                    )}
                  </strong>
                  <p>
                    {t(
                      "Photos saved only on the worker’s phone appear after uploading.",
                    )}
                  </p>
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
                <section className="ops-requirements">
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
                          <span>
                            <strong>{i.nameSnapshot}</strong>
                            <small>
                              {t(plainReason(r.viewKey))}
                              {!r.mandatory ? ` · ${t("Optional")}` : ""}
                            </small>
                          </span>
                          <span className="ops-status">
                            {t(plainReason(r.state))}
                          </span>
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
          <section className="ops-panel ops-action-column">
            <div className="ops-panel-body">
              <h2>
                {t(issue ? plainReason(issue.reasonCode) : "Issue closed")}
              </h2>
              <p className="ops-guidance">
                {issue
                  ? t(reviewGuidance(issue))
                  : t("This case has no unresolved issues.")}
              </p>
              {issue ? <ListenButton text={t(reviewGuidance(issue))} /> : null}
              {issue?.blockedReason ? (
                <p className="ops-blocked">{t(issue.blockedReason)}</p>
              ) : null}
              {detail.requiresFollowUp ? (
                <p className="ops-blocked">
                  {t(
                    "This task is already complete. Use a completed follow-up task with fresh accepted photos to address new concerns. The original completion stays unchanged.",
                  )}
                </p>
              ) : null}
              {issue && issue.state !== "RESOLVED" ? (
                <DecisionForm
                  key={issue.requirementId ?? issue.id}
                  detail={detail}
                  issue={issue}
                  onDone={done}
                />
              ) : (
                <p className="ops-save-result">{t("Issue closed")}</p>
              )}
              {!issue?.allowedActions?.some((a) =>
                ["REQUEST_RECAPTURE", "REQUEST_CLEANING"].includes(a),
              ) && detail.taskInstanceId ? (
                <div className="ops-followup-link">
                  <Button asChild variant="outline">
                    <Link to={`/locations/${detail.locationId}?tab=templates`}>
                      {t("Open cleaning schedule")}
                    </Link>
                  </Button>
                  <p>
                    {t(
                      "If no photo window is available, arrange follow-up work in this room.",
                    )}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      )}
      <details className="ops-panel ops-history">
        <summary>{t("Previous decisions and earlier photos")}</summary>
        {decisions.length ? (
          decisions.map((d) => (
            <article key={d.id}>
              <strong>
                {t(
                  reviewActionLabels[d.action as ExceptionAction] ??
                    plainReason(d.action),
                )}{" "}
                · {d.actorManager?.name ?? t("Manager")}
              </strong>
              <p>
                {t(plainReason(d.reasonCode))} · {d.note}
              </p>
              <time>{localTime(d.createdAt, timezone, language, true)}</time>
            </article>
          ))
        ) : (
          <p>{t("No review decisions yet.")}</p>
        )}
        {attempts.map((a) => (
          <details key={a.id}>
            <summary>
              {t(plainReason(a.state))} ·{" "}
              {localTime(a.createdAt, timezone, language, true)}
            </summary>
            {a.mediaAssetId ? (
              <ProtectedEvidence
                assetId={a.mediaAssetId}
                privacyState={a.privacyState}
                allowRestrictedReview
              />
            ) : (
              <p>{t("This photo is not available for review yet.")}</p>
            )}
          </details>
        ))}
        {[...detail.events, ...(history?.events ?? [])]
          .filter((e, i, a) => a.findIndex((x) => x.id === e.id) === i)
          .map((e) => (
            <p key={e.id}>
              {t(plainReason(e.type))} ·{" "}
              {localTime(e.createdAt, timezone, language, true)}
            </p>
          ))}
        {historyError ? <p role="alert">{t(historyError)}</p> : null}
        {older.nextAttemptCursor ||
        older.nextDecisionCursor ||
        older.nextEventCursor ? (
          <Button
            variant="outline"
            disabled={loadingHistory}
            onClick={() => void loadOlder()}
          >
            {t(loadingHistory ? "Loading…" : "Load older history")}
          </Button>
        ) : null}
      </details>
    </div>
  );
}
