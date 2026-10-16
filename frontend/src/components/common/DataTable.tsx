import { useLanguage } from "@/i18n/context";
import { Fragment, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "./EmptyState";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  emptyIcon?: ReactNode;
  emptyMessage?: string;
  mobileRender?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  onRowHover?: (row: T) => void;
  className?: string;
  pageSize?: number;
  expandedRow?: (row: T) => ReactNode;
}

export default function DataTable<T>({
  mobileRender,
  columns,
  data,
  rowKey,
  emptyIcon,
  emptyMessage = "No data found.",
  onRowClick,
  onRowHover,
  className,
  pageSize,
  expandedRow,
}: DataTableProps<T>) {
  const { t } = useLanguage();
  const [sort, setSort] = useState<{ key: string; direction: 1 | -1 } | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const pages = pageSize ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const currentPage = Math.min(page, pages);
  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sort?.key);
    if (!sort || !column?.sortValue) return data;
    const value = column.sortValue;
    return [...data].sort((a, b) => {
      const x = value(a),
        y = value(b);
      return (
        (typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y), undefined, { numeric: true })) *
        sort.direction
      );
    });
  }, [data, columns, sort]);
  const toggleSort = (key: string) => {
    setPage(1);
    setSort((old) =>
      old?.key === key
        ? old.direction === 1
          ? { key, direction: -1 }
          : null
        : { key, direction: 1 },
    );
  };
  const visible = pageSize
    ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sorted;
  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} message={emptyMessage} />;
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {columns.some((c) => c.sortValue) ? (
          <label className="table-mobile-sort">
            {t("Sort by")}
            <select
              value={sort?.key ?? ""}
              onChange={(e) =>
                setSort(
                  e.target.value ? { key: e.target.value, direction: 1 } : null,
                )
              }
            >
              <option value="">{t("Default order")}</option>
              {columns
                .filter((c) => c.sortValue)
                .map((c) => (
                  <option key={c.key} value={c.key}>
                    {t(c.header)}
                  </option>
                ))}
            </select>
          </label>
        ) : null}
        {visible.map((row) => {
          const actions = columns.filter((col) =>
            ["actions", "action"].includes(col.key),
          );
          const summary = columns.filter(
            (col, index) =>
              index === 0 || ["status", "location"].includes(col.key),
          );
          const details = columns.filter(
            (col) => !summary.includes(col) && !actions.includes(col),
          );
          const field = (col: Column<T>) => (
            <div key={col.key} className="space-y-1">
              <p className="text-sm text-muted-foreground">{t(col.header)}</p>
              <div className="min-w-0 break-words">{col.render(row)}</div>
            </div>
          );
          return (
            <article
              key={rowKey(row)}
              className="record-summary"
              onMouseEnter={() => onRowHover?.(row)}
            >
              {mobileRender ? (
                mobileRender(row)
              ) : (
                <>
                  {summary.map(field)}
                  {details.length ? (
                    <details>
                      <summary className="min-h-12 cursor-pointer font-semibold text-primary">
                        {t("Show details")}
                      </summary>
                      <div className="grid gap-4 py-3">
                        {details.map(field)}
                      </div>
                    </details>
                  ) : null}
                  {actions.map(field)}
                  {expandedRow?.(row)}
                  {onRowClick ? (
                    <Button variant="outline" onClick={() => onRowClick(row)}>
                      {t("Open details")}
                    </Button>
                  ) : null}
                </>
              )}
            </article>
          );
        })}
      </div>
      <div
        role="region"
        aria-label={t(columns[0]?.header ?? "Records") + " " + t("table")}
        tabIndex={0}
        className={cn(
          "data-table overflow-x-auto rounded-xl border border-border bg-card",
          "hidden md:block",
          className,
        )}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={
                    col.sortValue
                      ? sort?.key === col.key
                        ? sort.direction === 1
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                  className={`px-5 py-3 text-start text-sm font-medium text-muted-foreground ${col.className ?? ""}`}
                >
                  {col.sortValue ? (
                    <button
                      className="table-sort"
                      onClick={() => toggleSort(col.key)}
                    >
                      {t(col.header)}
                      {sort?.key === col.key ? (
                        sort.direction === 1 ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : (
                        <ArrowUpDown size={14} />
                      )}
                    </button>
                  ) : (
                    t(col.header)
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {visible.map((row) => (
              <Fragment key={rowKey(row)}>
                <tr
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(event) => {
                    if (
                      onRowClick &&
                      event.target === event.currentTarget &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  onClick={(event) => {
                    if (
                      !(event.target as HTMLElement).closest(
                        "a, button, input, select, textarea, summary",
                      )
                    )
                      onRowClick?.(row);
                  }}
                  onMouseEnter={() => onRowHover?.(row)}
                  className={`transition-colors hover:bg-muted/40 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-5 py-4 text-muted-foreground ${col.className ?? ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
                {expandedRow?.(row) ? (
                  <tr className="table-expanded-row">
                    <td colSpan={columns.length}>{expandedRow(row)}</td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {pageSize && data.length > pageSize ? (
        <nav className="ops-pagination" aria-label={t("Pagination")}>
          <p>
            {t("{from}–{to} of {total}", {
              from: (currentPage - 1) * pageSize + 1,
              to: Math.min(currentPage * pageSize, data.length),
              total: data.length,
            })}
          </p>
          <div>
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              {t("Previous")}
            </Button>
            <span aria-live="polite">
              {t("Page {page} of {total}", { page: currentPage, total: pages })}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= pages}
              onClick={() => setPage(currentPage + 1)}
            >
              {t("Next")}
            </Button>
          </div>
        </nav>
      ) : null}
    </>
  );
}
