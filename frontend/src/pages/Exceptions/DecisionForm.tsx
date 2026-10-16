import { useRef, useState } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { client } from "@/api/client";
import { useOnline } from "@/hooks/useOnline";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/context";
import { plainReason } from "../Verification/presentation";
import { decideException } from "./api";
import { actionConsequence, issueActions } from "./actionPresentation";
import { everydayActions, reviewActionLabels } from "./reviewPresentation";
import type {
  ExceptionAction,
  ExceptionDetail,
  VerificationIssue,
} from "./types";

export default function DecisionForm({
  detail,
  issue,
  onDone,
}: {
  detail: ExceptionDetail;
  issue: VerificationIssue;
  onDone: (message?: string) => Promise<void>;
}) {
  const { t } = useLanguage();
  const online = useOnline();
  const actions = issueActions(detail, issue);
  const [action, setAction] = useState<ExceptionAction | "">("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [minutes, setMinutes] = useState(
    Math.min(60, detail.policyBounds?.maxExtensionMinutes ?? 120),
  );
  const [followUp, setFollowUp] = useState("");
  const context = [
    ...new Map(
      [
        ...(issue.latestAttempt?.contextKey ? [issue.latestAttempt] : []),
        ...(detail.attempts ?? []),
      ]
        .filter(
          (a) => a.contextKey && a.mediaAssetId && a.privacyState === "SAFE",
        )
        .map((a) => [a.id, a]),
    ).values(),
  ];
  const pendingDecision = useRef<{ body: string; requestId: string } | null>(
    null,
  );
  const [evidence, setEvidence] = useState(context[0]?.id ?? "");
  const saving = useRef(false);
  const mutation = useMutation({
    onSettled: () => {
      saving.current = false;
    },
    mutationFn: () => {
      if (!online || !action || !actions.includes(action))
        throw new Error(t("Refresh this review before choosing an action."));
      const input = {
        expectedVersion: detail.rowVersion,
        ...(issue.id > 0 ? { issueId: issue.id } : {}),
        ...(issue.requirementId ? { requirementId: issue.requirementId } : {}),
        action,
        reasonCode: reason,
        note,
        ...(["ACCEPT_EVIDENCE", "ACCEPT_CONTEXT"].includes(action)
          ? {
              evidenceAttemptId:
                action === "ACCEPT_EVIDENCE"
                  ? issue.latestAttempt?.id
                  : evidence,
            }
          : {}),
        ...(action === "EXTEND_WINDOW" ? { extensionMinutes: minutes } : {}),
        ...(detail.requiresFollowUp
          ? { followUpTaskInstanceId: Number(followUp) }
          : {}),
      };
      const body = JSON.stringify(input);
      if (pendingDecision.current?.body !== body)
        pendingDecision.current = { body, requestId: crypto.randomUUID() };
      return decideException(detail.id, {
        ...input,
        requestId: pendingDecision.current.requestId,
      });
    },
    onSuccess: async () => {
      const messages: Partial<Record<ExceptionAction, string>> = {
        REQUEST_RECAPTURE:
          "Another photo requested. This view is waiting for staff.",
        REQUEST_CLEANING:
          "More cleaning requested. This view is waiting for staff.",
        ACCEPT_EVIDENCE:
          "Photo accepted. Other unresolved issues remain visible.",
        RESOLVE_ISSUE:
          "Issue resolved. Any remaining issues still need attention.",
        MARK_MAINTENANCE: "Repair recorded. Required photos remain unresolved.",
      };
      await onDone(
        messages[action as ExceptionAction] ??
          "Decision saved. The review now shows the updated result.",
      );
      setAction("");
      setReason("");
      setNote("");
    },
  });
  const followUps = useFollowUps(detail, issue, action === "RESOLVE_ISSUE");
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!note &&
      !mutation.isPending &&
      currentLocation.pathname + currentLocation.search !==
        nextLocation.pathname + nextLocation.search,
  );
  useBeforeUnload((event) => {
    if (note) {
      event.preventDefault();
    }
  });
  if (!actions.length)
    return (
      <p className="mt-5 text-sm text-muted-foreground">
        {t(
          "No decision is available for this issue. Refresh the review or check your location access.",
        )}
      </p>
    );
  const conflict =
    (mutation.error as { response?: { status?: number } })?.response?.status ===
    409;
  const field =
    "min-h-12 w-full rounded-lg border border-border bg-background px-3 py-3 text-base";
  const choose = (value: ExceptionAction) => {
    setAction(value);
    mutation.reset();
  };
  const secondary = actions.filter((a) => !everydayActions.includes(a));
  return (
    <div className="ops-decision-actions">
      {blocker.state === "blocked" ? (
        <div className="operations-notice" role="alert">
          <p>
            {t(
              "You have an unsaved note. Stay to save it or leave this review.",
            )}
          </p>
          <Button type="button" onClick={() => blocker.reset()}>
            {t("Stay here")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => blocker.proceed()}
          >
            {t("Leave review")}
          </Button>
        </div>
      ) : null}
      <h3 className="mb-3 font-semibold">{t("What should happen next?")}</h3>
      <div className="grid gap-3">
        {actions
          .filter((a) => everydayActions.includes(a))
          .map((a) => (
            <Button
              key={a}
              variant={action === a ? "default" : "outline"}
              type="button"
              onClick={() => choose(a)}
              aria-pressed={action === a}
            >
              {t(reviewActionLabels[a])}
            </Button>
          ))}
      </div>
      {secondary.length > 0 && (
        <details className="mt-3 rounded-lg border border-border p-4">
          <summary className="cursor-pointer text-sm font-medium">
            {t("Other manager options")}
          </summary>
          <p className="mt-3 max-w-prose text-sm text-muted-foreground">
            {t(
              "Use these only after checking the requirements. Closing an issue does not replace missing photos.",
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {secondary.map((a) => (
              <Button
                key={a}
                type="button"
                variant="outline"
                aria-pressed={action === a}
                onClick={() => choose(a)}
              >
                {t(reviewActionLabels[a])}
              </Button>
            ))}
          </div>
        </details>
      )}
      {action && (
        <form
          className="mt-5 max-w-2xl space-y-4 rounded-xl bg-muted/50 p-4 sm:p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (online && !mutation.isPending && !saving.current) {
              saving.current = true;
              mutation.mutate();
            }
          }}
        >
          <h3 className="text-lg font-semibold">
            {t(reviewActionLabels[action])}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(actionConsequence(action))}
          </p>
          {action === "ACCEPT_CONTEXT" && (
            <label className="grid gap-2 text-sm font-medium">
              {t("Room photo you reviewed")}
              <select
                required
                className={field}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              >
                {context.map((a, i) => (
                  <option key={a.id} value={a.id}>
                    {t("Room photo")} {i + 1} ·{" "}
                    {new Date(a.createdAt).toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
          )}
          {action === "EXTEND_WINDOW" && (
            <label className="grid gap-2 text-sm font-medium">
              {t("Minutes after the original deadline")}
              <input
                required
                className={field}
                type="number"
                min="1"
                max={detail.policyBounds?.maxExtensionMinutes ?? 120}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </label>
          )}
          {detail.requiresFollowUp && (
            <div className="grid gap-2">
              <label>
                {t("Completed follow-up work")}
                <select
                  required
                  className={field}
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                >
                  <option value="">
                    {t("Choose completed follow-up work")}
                  </option>
                  {followUps.data?.pages
                    .flatMap((p) => p.tasks)
                    .map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title} ·{" "}
                        {new Date(task.completedAt).toLocaleDateString()}
                      </option>
                    ))}
                </select>
              </label>
              {followUps.isPending ? (
                <p role="status">{t("Loading…")}</p>
              ) : null}
              {followUps.isError ? (
                <p role="alert">
                  {t("Follow-up work could not load.")}
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => void followUps.refetch()}
                  >
                    {t("Retry")}
                  </Button>
                </p>
              ) : null}
              {followUps.hasNextPage ? (
                <Button
                  variant="outline"
                  type="button"
                  disabled={followUps.isFetchingNextPage}
                  onClick={() => void followUps.fetchNextPage()}
                >
                  {t("Load more")}
                </Button>
              ) : null}
              <p className="text-sm text-muted-foreground">
                {t(
                  "Only completed work with eligible replacement photos appears here.",
                )}
              </p>
            </div>
          )}
          <label className="grid gap-2 text-sm font-medium">
            {t("Why are you taking this action?")}
            <select
              required
              className={field}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">{t("Choose a reason")}</option>
              {[
                "CLEAN",
                "CANNOT_ASSESS",
                "WRONG_ITEM",
                "CLEANING_REQUIRED",
                "DAMAGED",
                "INACCESSIBLE",
                "OCCUPIED",
                "GPS_UNCERTAIN",
                "CONTEXT_UNCERTAIN",
                "IDENTITY_UNCERTAIN",
                "SERVICE_FAILURE",
                "PRIVACY_HOLD",
                "MISSING_EVIDENCE",
                "CLOCK_UNCERTAIN",
                "DUPLICATE_EVIDENCE",
                "STALE_ASSIGNMENT",
              ].map((r) => (
                <option key={r} value={r}>
                  {t(plainReason(r))}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {t("What did you check?")}
            <textarea
              required
              maxLength={1000}
              rows={3}
              className={field}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t(
                "Write a short note for the team and review history.",
              )}
            />
          </label>
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {conflict
                ? t(
                    "This review changed. Refresh before saving. Your note is kept.",
                  )
                : ((
                    mutation.error as {
                      response?: { data?: { message?: string } };
                    }
                  ).response?.data?.message ??
                  t(
                    "Could not save your decision. Check your connection and try again.",
                  ))}
            </p>
          )}
          {!actions.includes(action) && (
            <p role="alert" className="text-sm">
              {t("This action is no longer available. Choose another option.")}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {conflict && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void onDone()}
              >
                {t("Refresh review")}
              </Button>
            )}
            <Button
              disabled={
                mutation.isPending || !online || !actions.includes(action)
              }
            >
              {t(mutation.isPending ? "Saving decision…" : "Save decision")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={mutation.isPending}
              onClick={() => setAction("")}
            >
              {t("Cancel")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function useFollowUps(
  detail: ExceptionDetail,
  issue: VerificationIssue,
  enabled: boolean,
) {
  const scope = useSelector(
    (s: RootState) =>
      `${s.auth.user?.companyId}:${s.auth.user?.role}:${s.auth.user?.id}`,
  );
  return useInfiniteQuery({
    queryKey: ["follow-ups", scope, detail.id, issue.id],
    enabled: !!detail.requiresFollowUp && enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      (
        await client.get<{
          data: {
            tasks: Array<{ id: number; title: string; completedAt: string }>;
            nextCursor: string | null;
          };
        }>(`/verification-exceptions/${detail.id}/follow-ups`, {
          params: { issueId: issue.id, cursor: pageParam },
        })
      ).data.data,
    getNextPageParam: (p) => p.nextCursor ?? undefined,
  });
}
