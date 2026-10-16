import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useEffect, useRef } from "react";
import {
  Link,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import type { RootState } from "@/store/store";
import { client } from "@/api/client";
import { useLanguage } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import OperationsState from "../Manager/OperationsState";
import { localTime } from "../Manager/operations";
import { useAreas } from "../Area/queries";
import { plainReason } from "../Verification/presentation";
import type { VerificationException } from "./types";
type Page = {
  cases: VerificationException[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  locations: Array<{ id: number; name: string; timezone: string }>;
  queueCounts: Record<string, number>;
};
export default function ExceptionInboxPage() {
  const { t, language } = useLanguage();
  const scope = useSelector(
    (s: RootState) =>
      `${s.auth.user?.companyId}:${s.auth.user?.role}:${s.auth.user?.id}`,
  );
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const restored = useRef<string | null>(null);
  const navigate = useNavigate();
  const filters = Object.fromEntries(
    ["locationId", "areaId", "queue", "period", "date", "q", "page", "pageSize"]
      .map((k) => [k, params.get(k) ?? ""])
      .filter(([, v]) => v),
  );
  filters.queue ??=
    params.get("state") === "STAFF_ACTION_REQUIRED"
      ? "staff"
      : params.get("state") === "WAITING_SERVICE"
        ? "service"
        : params.get("state") === "RESOLVED"
          ? "resolved"
          : "needs-me";
  filters.page ??= "1";
  const search = useDebouncedValue(params.get("q") ?? "");
  const appliedFilters = { ...filters, q: search };
  const query = useQuery({
    queryKey: ["review-page", scope, appliedFilters],
    queryFn: async ({ signal }) =>
      (
        await client.get<{ data: Page }>("/verification-exceptions", {
          params: appliedFilters,
          signal,
        })
      ).data.data,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const data = query.data;
  const areas = useAreas(Number(filters.locationId));
  function update(k: string, v: string) {
    setParams((old) => {
      const next = new URLSearchParams(old);
      if (v) next.set(k, v);
      else next.delete(k);
      if (k !== "page") next.delete("page");
      if (k === "locationId") next.delete("areaId");
      next.delete("state");
      next.delete("priority");
      next.delete("workerId");
      next.delete("reasonCode");
      return next;
    });
  }
  useEffect(() => {
    if (data && Number(filters.page) !== data.page)
      setParams(
        (old) => {
          const next = new URLSearchParams(old);
          next.set("page", String(data.page));
          return next;
        },
        { replace: true },
      );
  }, [data, filters.page, setParams]);
  useEffect(() => {
    if (!data || restored.current === location.key) return;
    const state = location.state as {
      scrollY?: number;
      focusId?: number;
    } | null;
    if (state?.scrollY !== undefined) {
      restored.current = location.key;
      requestAnimationFrame(() => {
        window.scrollTo(0, state.scrollY ?? 0);
        if (state.focusId)
          Array.from(
            document.querySelectorAll<HTMLAnchorElement>("[data-review-id]"),
          )
            .find(
              (el) =>
                el.dataset.reviewId === String(state.focusId) &&
                el.getClientRects().length > 0,
            )
            ?.focus({ preventScroll: true });
      });
    }
  }, [data, location.state, location.key]);
  const queue = filters.queue;
  const returnTo = location.pathname + "?" + new URLSearchParams(filters);
  const total = data?.total;
  return (
    <div className="ops-page">
      <header className="ops-header">
        <div>
          <h1>{t("Reviews")}</h1>
          <p>
            {t(
              "Check the reason, look at the photos, choose what happens next.",
            )}
          </p>
        </div>
      </header>
      <div className="ops-tabs" role="tablist" aria-label={t("Review queues")}>
        {[
          ["needs-me", "Needs my decision"],
          ["staff", "Waiting for staff"],
          ["service", "Checks pending"],
          ["resolved", "Resolved"],
        ].map(([v, l]) => (
          <button
            role="tab"
            className={queue === v ? "is-active" : ""}
            aria-selected={queue === v}
            key={v}
            onClick={() => update("queue", v)}
          >
            {t(l)}
            {data ? <span>{data.queueCounts[v]}</span> : null}
          </button>
        ))}
      </div>
      <div className="ops-toolbar">
        <label>
          {t("Location")}
          <select
            value={filters.locationId ?? ""}
            onChange={(e) => update("locationId", e.target.value)}
          >
            <option value="">
              {t(
                scope.includes(":ADMIN:")
                  ? "All locations"
                  : "My assigned locations",
              )}
            </option>
            {data?.locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Area")}
          <select
            disabled={!filters.locationId}
            value={filters.areaId ?? ""}
            onChange={(e) => update("areaId", e.target.value)}
          >
            <option value="">{t("All areas")}</option>
            {areas.data?.map((a) => (
              <option value={a.id} key={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {!filters.locationId ? (
            <small>{t("Choose a location to filter rooms.")}</small>
          ) : null}
        </label>
        <label className="ops-search">
          {t("Find a review")}
          <Input
            placeholder={t("Search name, room or task")}
            value={filters.q ?? ""}
            onChange={(e) => update("q", e.target.value)}
          />
        </label>
        <label>
          {t("Period")}
          <select
            value={filters.period ?? "all"}
            onChange={(e) => update("period", e.target.value)}
          >
            {[
              ["all", "All dates"],
              ["today", "Today"],
              ["earlier", "Earlier work"],
              ["date", "Specific date"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {t(l)}
              </option>
            ))}
          </select>
        </label>
        {filters.period === "date" ? (
          <label>
            {t("Date")}
            <input
              type="date"
              value={filters.date === "today" ? "" : (filters.date ?? "")}
              onChange={(e) => update("date", e.target.value)}
            />
          </label>
        ) : null}
        <Button variant="ghost" onClick={() => setParams({ queue })}>
          {t("Clear filters")}
        </Button>
      </div>
      <OperationsState
        loading={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {data && !query.isError ? (
        <>
          <p className="ops-result-count">
            {t("{count} reviews", { count: total ?? 0 })} ·{" "}
            {t(
              filters.period === "today"
                ? "Cases from today’s work"
                : "Earlier unresolved work stays visible here.",
            )}
          </p>
          <section className="ops-records">
            <DataTable
              data={data.cases}
              rowKey={(c) => c.id}
              emptyMessage={
                filters.q ||
                filters.locationId ||
                filters.areaId ||
                filters.period
                  ? "No reviews match these filters."
                  : "Nothing needs your decision in this queue."
              }
              columns={[
                {
                  key: "area",
                  header: "Area / task",
                  render: (c) => (
                    <div>
                      <strong>
                        {c.area?.name ??
                          c.task?.areaNameSnapshot ??
                          t("Room setup")}
                      </strong>
                      <p>
                        {c.task?.title ?? t("Inventory setup needed")} ·{" "}
                        {c.location?.name}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "reason",
                  header: "Why it needs you",
                  render: (c) => (
                    <div>
                      <strong>
                        {t(
                          plainReason(
                            c.displayReasonCode ??
                              c.issues.find((i) => i.state !== "RESOLVED")
                                ?.reasonCode ??
                              (c.kind === "SETUP"
                                ? "SETUP_REQUIRED"
                                : "REVIEW_REQUIRED"),
                          ),
                        )}
                      </strong>
                      {c.openIssueCount && c.openIssueCount > 1 ? (
                        <p>
                          {t("{count} other issues", {
                            count: c.openIssueCount - 1,
                          })}
                        </p>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: "worker",
                  header: "Worker",
                  render: (c) => c.task?.staff?.name ?? t("Unassigned"),
                },
                {
                  key: "time",
                  header: "Scheduled",
                  render: (c) =>
                    c.task?.shiftStart ? (
                      <div>
                        <bdi>
                          {localTime(
                            c.task.shiftStart,
                            c.location?.timezone ?? "Asia/Karachi",
                            language,
                            true,
                          )}
                        </bdi>
                        {c.task.shiftEnd &&
                        Date.parse(c.task.shiftEnd) < Date.now() - 86400000 ? (
                          <p>{t("Earlier work")}</p>
                        ) : null}
                      </div>
                    ) : (
                      t("Room setup")
                    ),
                },
                {
                  key: "action",
                  header: "Next action",
                  render: (c) => (
                    <Button asChild>
                      <Link
                        data-review-id={c.id}
                        to={`/exceptions/${c.id}?returnTo=${encodeURIComponent(returnTo)}`}
                        onClick={(e) => {
                          if (
                            e.button === 0 &&
                            !e.ctrlKey &&
                            !e.metaKey &&
                            !e.shiftKey
                          ) {
                            e.preventDefault();
                            navigate(
                              `/exceptions/${c.id}?returnTo=${encodeURIComponent(returnTo)}`,
                              {
                                state: {
                                  returnTo,
                                  scrollY: window.scrollY,
                                  focusId: c.id,
                                },
                              },
                            );
                          }
                        }}
                      >
                        {t("Review")}
                      </Link>
                    </Button>
                  ),
                },
              ]}
            />
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              pageSize={data.pageSize}
              total={data.total}
              onPage={(p) => update("page", String(p))}
              onSize={(p) => update("pageSize", String(p))}
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
