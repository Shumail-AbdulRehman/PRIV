import PageLoadingSkeleton from "@/components/common/PageLoadingSkeleton";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { formatInTimeZone } from "date-fns-tz";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useLanguage } from "@/i18n/context";
import { getLocationById } from "../Location/api";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info } from "lucide-react";

function moveDay(day: string, offset: number) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
type Counts = { submitted: number; scheduled: number };
function counts(
  stats: Array<{ status: string; _count: { status: number } }>,
): Counts {
  return stats.reduce(
    (out, row) => ({
      submitted:
        out.submitted + (row.status === "COMPLETED" ? row._count.status : 0),
      scheduled:
        out.scheduled + (row.status === "CANCELLED" ? 0 : row._count.status),
    }),
    { submitted: 0, scheduled: 0 },
  );
}
export default function OwnerTrends({
  locations,
  asOf,
  date = "today",
}: {
  locations: Array<{ id: number; name: string; timezone?: string }>;
  asOf: string;
  date?: string;
}) {
  const { t } = useLanguage();
  const scope = useSelector(
    (s: RootState) => s.auth.user?.companyId + ":" + s.auth.user?.id,
  );
  const [expanded, setExpanded] = useState(
    locations.length > 0 &&
      locations.length <= 4 &&
      window.matchMedia("(min-width: 1024px)").matches,
  );
  const ranges = locations.map((location) => {
    const day =
      date !== "today"
        ? date
        : Number.isFinite(Date.parse(asOf))
          ? formatInTimeZone(
              new Date(asOf),
              location.timezone ?? "Asia/Karachi",
              "yyyy-MM-dd",
            )
          : "";
    return {
      location,
      current: { dateFrom: day ? moveDay(day, -6) : "", dateTo: day },
      previous: {
        dateFrom: day ? moveDay(day, -13) : "",
        dateTo: day ? moveDay(day, -7) : "",
      },
    };
  });
  const queries = useQueries({
    queries: ranges.flatMap((range) =>
      [range.current, range.previous].map((period) => ({
        queryKey: ["owner-trends", scope, range.location.id, period],
        queryFn: () =>
          getLocationById(String(range.location.id), {
            type: "range",
            ...period,
          }),
        enabled: expanded && !!period.dateTo,
        staleTime: 60000,
      })),
    ),
  });
  const rows = ranges.map((range, i) => ({
    ...range,
    currentCounts: queries[i * 2]?.data
      ? counts(queries[i * 2].data.data.taskStats)
      : null,
    previousCounts: queries[i * 2 + 1]?.data
      ? counts(queries[i * 2 + 1].data.data.taskStats)
      : null,
  }));
  const max = Math.max(
    1,
    ...rows.flatMap((r) => [
      r.currentCounts?.scheduled ?? 0,
      r.previousCounts?.scheduled ?? 0,
    ]),
  );
  return (
    <details
      className="ops-panel trends-panel"
      open={expanded}
      onToggle={(e) => setExpanded(e.currentTarget.open)}
    >
      <summary>
        <span>
          {t("Compare the last 7 days")}
          <small>{t("Submitted work, compared with the previous week")}</small>
        </span>
        <ChevronDown size={18} />
      </summary>
      {expanded ? (
        <div className="trend-content">
          <div className="trend-legend">
            <span>
              <i />
              {t("Last 7 days")}
            </span>
            <span>
              <i className="trend-previous" />
              {t("Previous 7 days")}
            </span>
          </div>
          {queries.some((q) => q.isPending) ? (
            <PageLoadingSkeleton layout="trends" section />
          ) : null}
          {queries.some((q) => q.isError) ? (
            <div role="alert" className="operations-notice">
              <p>{t("Trends could not load. Try again.")}</p>
              <Button
                variant="outline"
                onClick={() => queries.forEach((q) => void q.refetch())}
              >
                {t("Try again")}
              </Button>
            </div>
          ) : null}
          {rows.map((row) => (
            <div className="trend-row" key={row.location.id}>
              <div className="trend-row-heading">
                <strong>{row.location.name}</strong>
              </div>
              {[row.currentCounts, row.previousCounts].map((value, i) => (
                <div
                  key={i}
                  className={"trend-bar-row " + (i ? "is-previous" : "")}
                >
                  <div
                    role="img"
                    aria-label={
                      t(i ? "Previous 7 days" : "Last 7 days") +
                      ": " +
                      (value
                        ? t("{count} of {total} submitted", {
                            count: value.submitted,
                            total: value.scheduled,
                          })
                        : t("Information unavailable"))
                    }
                  >
                    <i
                      style={{
                        width:
                          (value ? (value.submitted / max) * 100 : 0) + "%",
                      }}
                    />
                  </div>
                  <span>
                    {value ? value.submitted + " / " + value.scheduled : "—"}
                  </span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                <bdi>
                  {row.current.dateFrom} {t("to")} {row.current.dateTo}
                </bdi>
              </p>
            </div>
          ))}
          <p className="workspace-footnote">
            <Info size={14} />
            {t(
              "Submitted tasks out of scheduled tasks. Cancelled work is excluded. Includes today’s unfinished shifts; submission is separate from approval.",
            )}
          </p>
        </div>
      ) : null}
    </details>
  );
}
