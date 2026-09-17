import { ArrowRight, MapPin, Users, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import type { LocationCardProps } from "../types";
import StatusBadge from "@/components/common/StatusBadge";

export default function LocationCard({
  name,
  address,
  staff = 0,
  taskTemplate = 0,
  status = "Active",
  id,
}: LocationCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin size={19} />
        </span>
        <StatusBadge status={status === "Active" ? "ACTIVE" : "INACTIVE"} />
      </div>
      <h2 className="text-base font-semibold">
        <Link to={`/locations/${id}`} className="hover:text-primary">
          {name}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{address}</p>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <Users size={15} />
          {staff} staff
        </span>
        <span className="flex items-center gap-2">
          <CheckSquare size={15} />
          {taskTemplate} scheduled tasks
        </span>
      </div>
      <Link
        to={`/locations/${id}`}
        className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-medium text-primary"
      >
        Open location
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}
