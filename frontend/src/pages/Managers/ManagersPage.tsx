import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Pencil, Plus, UserCheck, Users } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGetLocations } from "../Location/queries";
import { useGetManagers, useUpdateManager } from "./queries";
import ManagerFormDialog from "./ManagerFormDialog";
import type { Manager } from "./types";

export default function ManagersPage() {
  const getManagers = useGetManagers();
  const getLocations = useGetLocations();
  const updateManager = useUpdateManager();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

  if (getManagers.isPending || getLocations.isPending) return <LoadingSpinner fullScreen />;

  const managers: Manager[] = getManagers.data?.data ?? [];
  const locations = (getLocations.data?.data ?? []).filter((loc: any) => loc.isActive);
  const activeManagers = managers.filter((manager) => manager.isActive).length;
  const coveredLocationIds = new Set(managers.flatMap((manager) => manager.locations.map((loc) => loc.id)));

  const takenLocations = new Map<number, string>();
  for (const manager of managers) {
    if (editingManager && manager.id === editingManager.id) continue;
    for (const loc of manager.locations) {
      takenLocations.set(loc.id, manager.name);
    }
  }

  const openCreateDialog = () => {
    setEditingManager(null);
    setDialogOpen(true);
  };

  const openEditDialog = (manager: Manager) => {
    setEditingManager(manager);
    setDialogOpen(true);
  };

  const toggleActive = async (manager: Manager) => {
    await updateManager.mutateAsync({ id: manager.id, data: { isActive: !manager.isActive } });
  };

  const initials = (name: string) =>
    name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Managers"
        subtitle="Create managers and decide which locations each of them can see and manage."
        action={
          locations.length > 0 ? (
            <Button className="rounded-2xl px-4" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" /> Add Manager
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total managers" value={managers.length} icon={Users} />
        <StatCard label="Active managers" value={activeManagers} icon={UserCheck} tone="emerald" />
        <StatCard label="Locations covered" value={coveredLocationIds.size} icon={MapPin} tone="sky" />
      </div>

      {locations.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-12 w-12" />}
          message="You need at least one location before you can create a manager."
          action={
            <Link to="/locations">
              <Button className="rounded-2xl px-4">Go to locations</Button>
            </Link>
          }
        />
      ) : managers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {managers.map((manager) => (
            <Card key={manager.id} className="border-border/70">
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
                      {initials(manager.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{manager.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{manager.email}</p>
                    </div>
                  </div>
                  <Badge variant={manager.isActive ? "default" : "secondary"}>
                    {manager.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Assigned locations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {manager.locations.map((loc) => (
                      <Badge key={loc.id} variant="outline">
                        <MapPin className="mr-1 h-3 w-3" />
                        {loc.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => openEditDialog(manager)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-2xl"
                    disabled={updateManager.isPending}
                    onClick={() => toggleActive(manager)}
                  >
                    {manager.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          message="No managers yet. Create your first manager and assign them locations."
          action={
            <Button onClick={openCreateDialog} className="rounded-2xl px-4">
              <Plus className="h-4 w-4" /> Add Manager
            </Button>
          }
        />
      )}

      <ManagerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        manager={editingManager}
        locations={locations.map((loc: any) => ({ id: loc.id, name: loc.name }))}
        takenLocations={takenLocations}
      />
    </div>
  );
}
