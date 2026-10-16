import { Building2, Camera, ClipboardList, Users } from "lucide-react";
import { useLanguage } from "@/i18n/context";
import "./loading-skeleton.css";

export type SkeletonVariant =
  "overview" | "table" | "detail" | "metrics" | "panel";
type Props = { variant?: SkeletonVariant; header?: boolean };

function Line({
  width = "medium",
  className = "",
}: {
  width?: "short" | "medium" | "long" | "full";
  className?: string;
}) {
  return <span className={`sk-block sk-line sk-${width} ${className}`} />;
}

function Metrics({
  count = 4,
  compact = false,
}: {
  count?: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`sk-metrics sk-count-${count} ${compact ? "sk-metrics-compact" : ""}`}
    >
      {Array.from(
        { length: count },
        (_, index) => [Users, ClipboardList, Camera, Building2][index % 4],
      ).map((Icon, index) => (
        <div className="sk-metric" key={index}>
          <div className="sk-metric-top">
            <Line width="medium" />
            <span className={`sk-metric-icon sk-tone-${index % 4}`}>
              <Icon size={17} strokeWidth={1.6} />
            </span>
          </div>
          <div className="sk-metric-value">
            <span className="sk-block sk-number" />
            <span className="sk-block sk-unit" />
          </div>
          <Line width="long" />
          <div className="sk-metric-track">
            <span className="sk-block" />
          </div>
        </div>
      ))}
    </div>
  );
}

export {
  Line as SkeletonLine,
  Metrics as SkeletonMetrics,
  Chart as SkeletonChart,
  Rows as SkeletonRows,
  PanelHeading as SkeletonPanelHeading,
};

function Rows({
  count = 4,
  table = false,
}: {
  count?: number;
  table?: boolean;
}) {
  return (
    <div className={`sk-rows ${table ? "sk-table-rows" : ""}`}>
      {Array.from({ length: count }, (_, index) => (
        <div className="sk-row" key={index}>
          <span
            className={`sk-block sk-avatar ${index % 2 ? "sk-avatar-square" : ""}`}
          />
          <div className="sk-row-identity">
            <Line width={index % 2 ? "long" : "medium"} />
            <Line width={index % 2 ? "medium" : "short"} />
          </div>
          {table ? (
            <>
              <div className="sk-row-column">
                <Line width="medium" />
                <Line width="short" />
              </div>
              <div className="sk-row-column sk-row-progress">
                <Line width="short" />
                <span className="sk-block sk-progress" />
              </div>
            </>
          ) : null}
          <span className={`sk-block sk-pill sk-pill-${index % 3}`} />
          <span className="sk-block sk-row-action" />
        </div>
      ))}
    </div>
  );
}

function PanelHeading() {
  return (
    <div className="sk-panel-heading">
      <div>
        <Line width="medium" />
        <Line width="long" />
      </div>
      <span className="sk-block sk-small-action" />
    </div>
  );
}

function Table({ compact = false }: { compact?: boolean }) {
  return (
    <div className="sk-panel sk-table">
      <PanelHeading />
      <div className="sk-table-labels">
        <Line width="medium" />
        <Line width="short" />
        <Line width="short" />
        <Line width="short" />
      </div>
      <Rows count={compact ? 3 : 5} table />
      {!compact ? (
        <div className="sk-table-footer">
          <Line width="short" />
          <div>
            {[0, 1, 2].map((i) => (
              <span key={i} className="sk-block sk-page" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Chart() {
  return (
    <div className="sk-panel sk-chart">
      <PanelHeading />
      <div className="sk-chart-content">
        <div className="sk-donut">
          <div>
            <span className="sk-block sk-number" />
            <Line width="short" />
          </div>
        </div>
        <div className="sk-chart-legend">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <span className={`sk-legend-dot sk-tone-${i}`} />
              <Line width={i % 2 ? "long" : "medium"} />
              <span className="sk-block sk-legend-value" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Detail() {
  return (
    <div className="sk-detail">
      <div className="sk-panel">
        <PanelHeading />
        <div className="sk-detail-media">
          <span className="sk-media-icon">
            <Camera size={34} strokeWidth={1.3} />
          </span>
          <Line width="short" />
        </div>
        <Rows count={2} />
      </div>
      <div className="sk-panel">
        <PanelHeading />
        <div className="sk-detail-facts">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <Line width="short" />
              <Line width={i % 2 ? "medium" : "long"} />
            </div>
          ))}
        </div>
        <Rows count={2} />
        <div className="sk-detail-actions">
          <span className="sk-block" />
          <span className="sk-block" />
        </div>
      </div>
    </div>
  );
}

/** Decorative placeholders are hidden; one concise status announces the entire region. */
export default function LoadingSkeleton({
  variant = "table",
  header = false,
}: Props) {
  const { t } = useLanguage();
  return (
    <div
      className={`loading-skeleton sk-variant-${variant}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t("Loading…")}
    >
      <span className="sr-only">{t("Loading…")}</span>
      <div className="sk-content" aria-hidden="true">
        {header ? (
          <div className="sk-header">
            <div>
              <Line width="short" />
              <span className="sk-block sk-title" />
              <Line width="long" />
            </div>
            <span className="sk-block sk-header-action" />
          </div>
        ) : null}
        {variant === "overview" ||
        variant === "metrics" ||
        (header && variant === "table") ? (
          <Metrics />
        ) : null}
        {variant === "overview" ? (
          <div className="sk-overview">
            <div className="sk-overview-main">
              <Chart />
              <Table compact />
            </div>
            <div className="sk-overview-side">
              <div className="sk-panel">
                <PanelHeading />
                <Rows count={3} />
              </div>
              <div className="sk-panel">
                <PanelHeading />
                <Rows count={3} />
              </div>
            </div>
          </div>
        ) : variant === "detail" ? (
          <Detail />
        ) : variant === "panel" ? (
          <div className="sk-panel sk-compact">
            <Rows count={3} />
          </div>
        ) : variant === "table" ? (
          <Table />
        ) : null}
      </div>
    </div>
  );
}
