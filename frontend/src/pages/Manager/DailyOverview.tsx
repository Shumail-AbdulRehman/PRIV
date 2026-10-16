import OwnerTrends from "./OwnerTrends";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { formatInTimeZone } from "date-fns-tz";
import {
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import type { RootState } from "@/store/store";
import { useLanguage } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { type Column } from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import ListenButton from "@/components/common/ListenButton";
import { useExceptions } from "@/pages/Exceptions/queries";
import { getLocationSchedule } from "@/pages/Location/api";
import { verificationLabel } from "@/pages/Verification/presentation";
import { useGetTodayStatus } from "./queries";
import { staffTodayLink } from "./todayPresentation";
import type { StaffStatusEntry } from "./types";

type View =
  | "all"
  | "present"
  | "absent"
  | "overdue"
  | "unassigned"
  | "review"
  | "completed";
type Location = { id: number; name: string; timezone?: string };
const views: View[] = [
  "all",
  "present",
  "absent",
  "overdue",
  "unassigned",
  "review",
  "completed",
];
export default function DailyOverview() {
  const { t, language } = useLanguage();
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  const user = useSelector((state: RootState) => state.auth.user);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const selected = params.get("locationId") ?? "all";
  const view = views.includes(params.get("view") as View)
    ? (params.get("view") as View)
    : "all";
  const today = useGetTodayStatus({
    locationId: selected === "all" ? undefined : Number(selected),
  });
  const denied =
    (today.error as { response?: { status?: number } } | null)?.response
      ?.status === 403;
  const loadFailure = t(
    denied
      ? "You do not have access to this location. Choose an assigned location or ask your owner."
      : "Today could not load. Check your internet and try again.",
  );
  const payload = today.data?.data;
  const entries: StaffStatusEntry[] = payload?.staffStatus ?? [];
  // Location options must remain available after narrowing the daily feed.
  const allLocations = useGetTodayStatus(
    selected === "all" ? { locationId: undefined } : undefined,
  );
  const locations: Location[] =
    allLocations.data?.data?.locations ?? payload?.locations ?? [];
  const activeLocations =
    selected === "all"
      ? locations
      : locations.filter((l) => l.id === Number(selected));
  const schedules = useQueries({
    queries: activeLocations.map((location) => ({
      queryKey: [
        "daily-schedule",
        user?.companyId,
        user?.role,
        user?.id,
        location.id,
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getLocationSchedule(String(location.id), undefined, signal),
      staleTime: 30000,
      refetchInterval: 30000,
    })),
  });
  const reviews = useExceptions({
    state: "MANAGER_REVIEW",
    ...(selected === "all" ? {} : { locationId: selected }),
  });
  const reviewRows = reviews.data?.pages.flatMap((p) => p.cases) ?? [];
  const reviewCount = reviews.data?.pages[0]?.total ?? reviewRows.length;
  const asOf: string = payload?.asOf ?? payload?.date ?? "";
  const recordedAt = Date.parse(asOf);
  const tasks = entries.flatMap((entry) =>
    entry.tasks.map((task) => ({ ...task, entry })),
  );
  const overdue = tasks.filter(
    (task) =>
      ["PENDING", "IN_PROGRESS", "NOT_COMPLETED_INTIME", "MISSED"].includes(
        task.status,
      ) &&
      Number.isFinite(recordedAt) &&
      Date.parse(task.shiftEnd) < recordedAt,
  );
  const unassigned = schedules.flatMap((query, index) => {
    const location = activeLocations[index];
    if (!query.data || !location || !Number.isFinite(recordedAt)) return [];
    const day = formatInTimeZone(
      new Date(recordedAt),
      query.data.location.timezone,
      "yyyy-MM-dd",
    );
    return query.data.days
      .filter((d) => d.date === day)
      .flatMap((d) => d.items)
      .filter(
        (item) =>
          item.kind === "actual" && !item.staff && item.status === "PENDING",
      )
      .map((item) => ({ ...item, location }));
  });
  const schedulesReady =
    schedules.length === activeLocations.length &&
    schedules.every((s) => s.isSuccess);
  const absent = entries.filter((e) => e.flags.isAbsent);
  const present = entries.filter((e) => e.flags.isPresent);
  const submitted = tasks.filter((task) => task.status === "COMPLETED");
  const totalTasks =
    tasks.filter((task) => task.status !== "CANCELLED").length +
    unassigned.length;
  const approved = tasks.filter(
    (task) => task.completionOutcome === "VERIFIED_COMPLETE",
  ).length;
  const accepted = tasks.filter(
    (task) => task.completionOutcome === "COMPLETED_WITH_EXCEPTIONS",
  ).length;
  const metrics = [
    {
      key: "present" as View,
      label: "Today’s attendance",
      value: today.isError ? "—" : present.length,
      detail: today.isError
        ? t("Information unavailable")
        : t("{count} of {total} present", {
            count: present.length,
            total: entries.length,
          }),
      icon: Users,
    },
    {
      key: "completed" as View,
      label: "Submitted work",
      value: today.isError ? "—" : submitted.length,
      detail: today.isError
        ? t("Information unavailable")
        : schedulesReady
          ? t("{count} of {total} submitted", {
              count: submitted.length,
              total: totalTasks,
            })
          : t("Assigned work only"),
      icon: Check,
    },
    {
      key: "overdue" as View,
      label: "Overdue work",
      value: today.isError ? "—" : overdue.length,
      detail: t("Open today’s records"),
      icon: Clock3,
    },
    {
      key: "review" as View,
      label: "Waiting for review",
      value: reviews.isError ? "—" : reviews.isPending ? "…" : reviewCount,
      detail: language === "ur" ? "تمام کھلے جائزے" : "All open reviews",
      icon: CircleAlert,
    },
  ];
  function filter(key: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value === "all") next.delete(key);
      else next.set(key, value);
      return next;
    });
  }
  const filtered = entries.filter((e) => {
    const matches = `${e.staff.name} ${e.staff.email}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase());
    return (
      matches &&
      (view === "absent"
        ? e.flags.isAbsent
        : view === "present"
          ? e.flags.isPresent
          : view === "overdue"
            ? overdue.some((task) => task.entry.staff.id === e.staff.id)
            : view === "completed"
              ? e.taskCounts.completed > 0
              : true)
    );
  });
  const columns: Column<StaffStatusEntry>[] = [
    {
      key: "staff",
      header: "Staff",
      render: (e) => (
        <div>
          <strong className="font-semibold text-foreground">
            {e.staff.name}
          </strong>
          <p className="text-sm text-muted-foreground">
            {e.staff.location?.name ?? t("Location")}
          </p>
        </div>
      ),
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (e) => (
        <StatusBadge
          status={
            e.attendanceDisplayStatus ??
            e.attendance?.status ??
            "NO_RECORD_TODAY"
          }
        />
      ),
    },
    {
      key: "work",
      header: "Cleaning progress",
      render: (e) => (
        <div>
          <p className="text-foreground">
            {t("{count} of {total} submitted", {
              count: e.taskCounts.completed,
              total: e.taskCounts.total,
            })}
          </p>
          <progress
            className="daily-progress"
            aria-label={t("Cleaning progress")}
            value={e.taskCounts.completed}
            max={Math.max(1, e.taskCounts.total)}
          />
        </div>
      ),
    },
    {
      key: "action",
      header: "Next action",
      render: (e) => (
        <Button asChild variant="outline">
          <Link to={staffTodayLink(e)}>
            {t(e.flags.isAbsent ? "Check attendance" : "Open details")}
          </Link>
        </Button>
      ),
    },
  ];
  const help = t("Start with the items that need you.");
  if (today.isLoading)
    return (
      <div className="space-y-6" role="status" aria-label={t("Loading…")}>
        <div className="daily-header">
          <h1 className="daily-heading">{t("Daily overview")}</h1>
        </div>
        <div className="daily-loading" />
        <div className="daily-loading" />
        <span className="sr-only">{t("Loading…")}</span>
      </div>
    );
  return (
    <div className="space-y-7">
      <header className="daily-header">
        <div>
          <p className="daily-eyebrow">
            <CalendarDays size={18} />
            {t("Today")}{" "}
            {Number.isFinite(recordedAt)
              ? new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-PK", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: activeLocations[0]?.timezone ?? "Asia/Karachi",
                }).format(new Date(recordedAt))
              : ""}
          </p>
          <h1 className="daily-heading">{t("Daily overview")}</h1>
          <p className="mt-2 text-muted-foreground">{help}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              user?.role === "ADMIN"
                ? "All locations"
                : "My assigned locations",
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ListenButton text={help} />
          <Button
            variant="outline"
            disabled={today.isFetching}
            onClick={() => {
              void today.refetch();
              void reviews.refetch();
              schedules.forEach((q) => void q.refetch());
            }}
          >
            <RefreshCw size={16} />
            {t(today.isFetching ? "Refreshing…" : "Refresh")}
          </Button>
        </div>
      </header>
      {today.isError ? (
        <div className="operations-notice" role="alert">
          <CircleAlert />
          <p>{loadFailure}</p>
          <Button
            variant="outline"
            onClick={() =>
              denied ? filter("locationId", "all") : void today.refetch()
            }
          >
            {t(denied ? "Choose a location" : "Try again")}
          </Button>
        </div>
      ) : null}
      {!online ? (
        <div className="operations-notice" role="status">
          <p>
            <strong>{t("Internet needed to continue")}</strong>
            <br />
            {t("You are viewing the last loaded information.")}
          </p>
          <p>{t("Reconnect, then refresh before making changes.")}</p>
        </div>
      ) : null}
      <section className="daily-metrics" aria-label={t("Today’s work")}>
        {metrics.map((metric) => (
          <button
            key={metric.key}
            className="daily-metric"
            aria-pressed={view === metric.key}
            onClick={() =>
              filter("view", view === metric.key ? "all" : metric.key)
            }
          >
            <span className="flex items-center gap-2">
              <metric.icon size={18} />
              {t(metric.label)}
            </span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </button>
        ))}
      </section>
      <div className="daily-grid">
        <section className="daily-section">
          <div className="daily-section-heading">
            <h2>{t("Needs attention")}</h2>
            <span className="text-sm text-muted-foreground">{t("Today")}</span>
          </div>
          {today.isError ? (
            <p>{loadFailure}</p>
          ) : (
            <>
              {absent.slice(0, 4).map((e) => (
                <div key={`absent-${e.staff.id}`} className="issue-row">
                  <span className="issue-symbol">
                    <Users size={18} />
                  </span>
                  <div className="issue-body">
                    <strong>{e.staff.name}</strong>
                    <p>
                      {t("Not checked in")} · {e.staff.location?.name}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to={staffTodayLink(e)}>{t("Check attendance")}</Link>
                  </Button>
                </div>
              ))}
              {overdue.slice(0, 4).map((task) => (
                <div key={`task-${task.id}`} className="issue-row">
                  <span className="issue-symbol">
                    <Clock3 size={18} />
                  </span>
                  <div className="issue-body">
                    <strong>{task.areaNameSnapshot ?? task.title}</strong>
                    <p>
                      {t("Overdue work")} · {task.entry.staff.name}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link
                      to={
                        task.verificationVersion === 2
                          ? `/verification/${task.id}`
                          : staffTodayLink(task.entry)
                      }
                    >
                      {t("Open task")}
                    </Link>
                  </Button>
                </div>
              ))}
              {unassigned.slice(0, 4).map((task) => (
                <div key={task.key} className="issue-row">
                  <span className="issue-symbol">
                    <CircleAlert size={18} />
                  </span>
                  <div className="issue-body">
                    <strong>{task.areaNameSnapshot ?? task.title}</strong>
                    <p>
                      {t("Unassigned work")} · {task.location.name}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link
                      to={`/locations/${task.location.id}?tab=templates#schedule-${task.templateId}`}
                    >
                      {t("Assign staff")}
                    </Link>
                  </Button>
                </div>
              ))}
              {!schedulesReady ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {schedules.some((q) => q.isError)
                    ? language === "ur"
                      ? "بغیر عملے کے کام کی فہرست نہیں کھلی۔ مقام کی تفصیل دیکھیں۔"
                      : "Unassigned work could not load. Open a location to check its schedule."
                    : language === "ur"
                      ? "بغیر عملے کے کام چیک ہو رہے ہیں…"
                      : "Checking unassigned work…"}
                </p>
              ) : null}
              {!absent.length &&
              !overdue.length &&
              !unassigned.length &&
              schedulesReady ? (
                <div className="daily-empty">
                  <Check className="text-primary" />
                  <h3 className="font-semibold">
                    {t(entries.length ? "No issues right now" : "No staff yet")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(
                      entries.length
                        ? "Your team is on track."
                        : "Add staff to a location to see today’s work.",
                    )}
                  </p>
                  {!entries.length ? (
                    <Button asChild variant="outline">
                      <Link to="/staff">{t("Team")}</Link>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </section>
        <section className="daily-section">
          <div className="daily-section-heading">
            <h2>{t("Waiting for manager review")}</h2>
            <Link
              className="text-sm font-semibold text-primary underline underline-offset-4"
              to={`/exceptions?state=MANAGER_REVIEW${selected === "all" ? "" : `&locationId=${selected}`}`}
            >
              {t("Review photos")}
            </Link>
          </div>
          {reviews.isPending ? (
            <p role="status">{t("Loading…")}</p>
          ) : reviews.isError ? (
            <div role="alert">
              <p>
                {t("Today could not load. Check your internet and try again.")}
              </p>
              <Button variant="outline" onClick={() => void reviews.refetch()}>
                {t("Try again")}
              </Button>
            </div>
          ) : reviewRows.length ? (
            reviewRows.slice(0, 3).map((c) => (
              <div className="issue-row" key={c.id}>
                <div className="issue-body">
                  <strong>
                    {c.area?.name ?? c.task?.areaNameSnapshot ?? c.task?.title}
                  </strong>
                  <p>
                    {c.location?.name} · {c.task?.staff?.name}
                  </p>
                </div>
                <Button asChild>
                  <Link to={`/exceptions/${c.id}`}>{t("Review")}</Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="daily-empty">
              <Check className="text-primary" />
              <p>{t("No issues right now")}</p>
            </div>
          )}
          <div className="mt-5 space-y-3 border-t border-border pt-5">
            <h3 className="font-semibold">{t("Cleaning progress")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("Submitted is separate from approved.")}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span>
                {t("Verified")}:{" "}
                <strong>{today.isError ? "—" : approved}</strong>
              </span>
              <span>
                {t("Accepted with exceptions")}:{" "}
                <strong>{today.isError ? "—" : accepted}</strong>
              </span>
            </div>
          </div>
        </section>
      </div>
      <section className="space-y-4">
        <div className="daily-section-heading">
          <h2 className="text-xl font-semibold">{t("Today’s work")}</h2>
          {Number.isFinite(recordedAt) ? (
            <p className="text-sm text-muted-foreground">
              {t("Recorded today")} ·{" "}
              <bdi>
                {new Intl.DateTimeFormat(
                  language === "ur" ? "ur-PK" : "en-PK",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: activeLocations[0]?.timezone ?? "Asia/Karachi",
                  },
                ).format(new Date(recordedAt))}
              </bdi>
            </p>
          ) : null}
        </div>
        <div className="daily-search">
          <label>
            {t("Search staff")}
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search name or email")}
            />
          </label>
          <label>
            {t("Location")}
            <select
              value={selected}
              onChange={(e) => filter("locationId", e.target.value)}
            >
              <option value="all">
                {t(
                  user?.role === "ADMIN"
                    ? "All locations"
                    : "My assigned locations",
                )}
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="daily-filter" role="group" aria-label={t("Status")}>
          {(["all", "absent", "overdue", "unassigned", "review"] as View[]).map(
            (key) => (
              <button
                key={key}
                aria-pressed={view === key}
                onClick={() => filter("view", key)}
              >
                {t(
                  (
                    {
                      all: "All staff",
                      absent: "Not checked in",
                      overdue: "Overdue work",
                      unassigned: "Unassigned work",
                      review: "Waiting for review",
                    } as Record<string, string>
                  )[key],
                )}
                {key === "unassigned"
                  ? ` (${schedulesReady ? unassigned.length : "…"})`
                  : ""}
              </button>
            ),
          )}
        </div>
        {view === "review" ? (
          <Button asChild>
            <Link
              to={`/exceptions?state=MANAGER_REVIEW${selected === "all" ? "" : `&locationId=${selected}`}`}
            >
              {t("Review photos")}
            </Link>
          </Button>
        ) : view === "unassigned" ? (
          <div className="space-y-3">
            {unassigned.map((task) => (
              <article className="record-summary" key={task.key}>
                <strong>{task.areaNameSnapshot ?? task.title}</strong>
                <p>{task.location.name}</p>
                <Button asChild variant="outline">
                  <Link
                    to={`/locations/${task.location.id}?tab=templates#schedule-${task.templateId}`}
                  >
                    {t("Assign staff")}
                  </Link>
                </Button>
              </article>
            ))}
            {schedulesReady && !unassigned.length ? (
              <p>{t("No issues right now")}</p>
            ) : null}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(e) => e.staff.id}
            emptyMessage={t("Try another name or clear your filters.")}
            mobileRender={(e) => (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{e.staff.name}</strong>
                  <StatusBadge status={e.attendanceDisplayStatus} />
                </div>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} />
                  {e.staff.location?.name}
                </p>
                <p>
                  {t("{count} of {total} submitted", {
                    count: e.taskCounts.completed,
                    total: e.taskCounts.total,
                  })}
                </p>
                <details>
                  <summary className="min-h-12 cursor-pointer text-primary">
                    {t("Show details")}
                  </summary>
                  <ul className="space-y-2 py-3">
                    {e.tasks.map((task) => (
                      <li key={task.id}>
                        {task.title} ·{" "}
                        {t(
                          task.verificationVersion === 2
                            ? verificationLabel(task)
                            : task.status === "COMPLETED"
                              ? "Submitted work"
                              : "Not started",
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
                <Button asChild variant="outline">
                  <Link to={staffTodayLink(e)}>
                    {t(e.flags.isAbsent ? "Check attendance" : "Open details")}
                  </Link>
                </Button>
              </>
            )}
          />
        )}
      </section>
      {user?.role === "ADMIN" && locations.length > 0 && !today.isError ? (
        <OwnerTrends locations={activeLocations} asOf={asOf} />
      ) : null}
      {user?.role === "ADMIN" && selected === "all" ? (
        <section className="daily-section">
          <div className="daily-section-heading">
            <h2>{t("Locations")}</h2>
            <Link
              className="text-primary underline underline-offset-4"
              to="/locations"
            >
              {t("Manage locations")}
            </Link>
          </div>
          {locations.length ? (
            locations.map((l) => {
              const staff = entries.filter(
                (e) => e.staff.location?.id === l.id,
              );
              const alerts =
                staff.filter(
                  (e) => e.flags.isAbsent || e.flags.hasAttentionTasks,
                ).length +
                unassigned.filter((task) => task.location.id === l.id).length +
                reviewRows.filter((item) => item.location?.id === l.id).length;
              return (
                <Link
                  className="workspace-list-link"
                  key={l.id}
                  to={`/today-status?locationId=${l.id}`}
                >
                  <MapPin size={20} />
                  <div className="flex-1">
                    <strong>{l.name}</strong>
                    <p className="text-sm text-muted-foreground">
                      {t("{count} staff", { count: staff.length })}
                    </p>
                  </div>
                  <span className="text-sm">
                    {alerts
                      ? `${t("Needs attention")} (${alerts})`
                      : t(
                          schedulesReady &&
                            reviews.isSuccess &&
                            reviewRows.length === reviewCount
                            ? "No issues right now"
                            : "Open details",
                        )}
                  </span>
                </Link>
              );
            })
          ) : (
            <p>{t("Set up a location and add your team.")}</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
