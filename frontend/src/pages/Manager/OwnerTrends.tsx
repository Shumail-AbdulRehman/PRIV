import PageLoadingSkeleton from "@/components/common/PageLoadingSkeleton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatInTimeZone } from "date-fns-tz";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useLanguage } from "@/i18n/context";
import { client } from "@/api/client";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info } from "lucide-react";

function moveDay(day: string, offset: number) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
type TrendPeriod = { dateFrom: string; dateTo: string; submitted: number; scheduled: number };
type TrendResponse = { rows: Array<{ locationId: number; current: TrendPeriod; previous: TrendPeriod }> };
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
    (s: RootState) => `${s.auth.user?.companyId}:${s.auth.user?.role}:${s.auth.user?.id}`,
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
  const query = useQuery({
    // Calendar days keep the cache reusable as overview's asOf advances.
    queryKey: ["owner-trends", scope, ranges.map((r) => [r.location.id, r.current.dateTo])],
    queryFn: async ({ signal }) => (
      await client.get<{ data: TrendResponse }>("/manager/operations/trends", {
        params: { date, asOf, locationId: locations.length === 1 ? locations[0].id : undefined },
        signal,
      })
    ).data.data,
    enabled: expanded && ranges.length > 0 && ranges.every((r) => !!r.current.dateTo),
    staleTime: 60000,
    refetchIntervalInBackground: false,
  });
  const countsByLocation = new Map(query.data?.rows.map((r) => [r.locationId, r]));
  const rows = ranges.map((range) => ({
    ...range,
    currentCounts: countsByLocation.get(range.location.id)?.current ?? null,
    previousCounts: countsByLocation.get(range.location.id)?.previous ?? null,
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
          {query.isPending && ranges.length > 0 ? (
            <PageLoadingSkeleton layout="trends" section />
          ) : null}
          {query.isError ? (
            <div role="alert" className="operations-notice">
              <p>{t("Trends could not load. Try again.")}</p>
              <Button
                variant="outline"
                onClick={() => void query.refetch()}
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
