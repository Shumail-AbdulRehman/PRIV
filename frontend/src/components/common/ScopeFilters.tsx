import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import type { LocationScope } from "@/pages/Manager/operations";
export default function ScopeFilters({
  locations,
}: {
  locations: LocationScope[];
}) {
  const { t } = useLanguage();
  const role = useSelector((s: RootState) => s.auth.user?.role);
  const [params, setParams] = useSearchParams();
  function update(k: string, v: string) {
    setParams((old) => {
      const next = new URLSearchParams(old);
      if (v) next.set(k, v);
      else next.delete(k);
      next.delete("page");
      next.delete("taskId");
      return next;
    });
  }
  return (
    <div className="ops-scope">
      <label>
        {t("Location")}
        <select
          aria-label={t("Location")}
          value={params.get("locationId") ?? ""}
          onChange={(e) => update("locationId", e.target.value)}
        >
          <option value="">
            {t(role === "ADMIN" ? "All locations" : "My assigned locations")}
          </option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="scope-date-heading">
          {t("Date")}
          {!params.get("date") || params.get("date") === "today" ? (
            <small>{t("Today")}</small>
          ) : null}
        </span>
        <input
          aria-label={t("Date")}
          type="date"
          value={
            params.get("date") === "today" ? "" : (params.get("date") ?? "")
          }
          onChange={(e) => update("date", e.target.value || "today")}
        />
      </label>
      {!params.get("date") || params.get("date") === "today" ? (
        <span className="ops-today-label">{t("Today in each location")}</span>
      ) : (
        <Button variant="ghost" onClick={() => update("date", "today")}>
          {t("Back to today")}
        </Button>
      )}
    </div>
  );
}
