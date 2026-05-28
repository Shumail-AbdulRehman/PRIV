import { ArrowRight, MapPin, Users, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LocationCardProps } from "../types";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";

export default function LocationCard({
  name = "default",
  address = "default",
  staff = 0,
  taskTemplate = 0,
  lat = "0.000",
  lng = "0.000",
  geofence = "100m",
  status = "Active",
  id,
}: LocationCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-[1.75rem] border border-border/70 bg-card/95 p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-36px_rgba(15,23,42,0.4)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>
        </div>
        <StatusBadge status={status === "Active" ? "ACTIVE" : "INACTIVE"} />
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-muted/60 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span><span className="font-medium text-foreground">{staff}</span> Staff</span>
          </div>
        </div>
        <div className="rounded-2xl bg-muted/60 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckSquare className="h-4 w-4" />
            <span><span className="font-medium text-foreground">{taskTemplate}</span> Task Templates</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{lat}, {lng}</span>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Geofence: {geofence}</span>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4">
        <Button
          onClick={() => navigate(`/locations/${id}`)}
          className="w-full rounded-2xl"
        >
          View details
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
