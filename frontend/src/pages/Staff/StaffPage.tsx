import StaffCreateDialog from "./StaffCreateDialog";
import OperationsState from "../Manager/OperationsState";
import DeleteButton from "@/components/common/DeleteButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import {
  useGetStaff,
  useDeleteStaff,
  useEditStaff,
  getStaffDetailsQueryOptions,
} from "./queries";
import type { EditStaffInput } from "./api";
import { useGetLocations } from "../Location/queries";
import { useAssignStaffToLocation } from "../Assignment/queries";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { Column } from "@/components/common/DataTable";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, Search, Pencil, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/common/StatCard";
import FilterBar from "@/components/common/FilterBar";
import { useQueryClient } from "@tanstack/react-query";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  locationId: number | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  isActive: boolean;
}

interface LocationOption {
  id: number;
  name: string;
  timezone: string;
}

interface ApiErrorBody {
  message?: string;
  errors?: { message: string }[];
}

interface ApiError {
  response?: {
    data?: ApiErrorBody;
  };
  message?: string;
}

const fmtTimeWithTz = (d: string | null, timeZone = "UTC") => {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), timeZone, "HH:mm (zzz)");
};

const toTimeValue = (iso: string | null, timeZone = "UTC") => {
  if (!iso) return "";
  return formatInTimeZone(new Date(iso), timeZone, "HH:mm");
};

const wallTimeToIso = (
  base: string | null,
  timeValue: string,
  timeZone: string,
) => {
  const datePart = formatInTimeZone(
    base ? new Date(base) : new Date(),
    timeZone,
    "yyyy-MM-dd",
  );
  return fromZonedTime(`${datePart}T${timeValue}:00`, timeZone).toISOString();
};

const inputCls =
  "flex h-11 w-full rounded-lg border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10";

export default function StaffPage() {
  const staffQuery = useGetStaff();
  const { data, isLoading } = staffQuery;
  const [success, setSuccess] = useState("");
  const locationsQuery = useGetLocations();
  const deleteStaff = useDeleteStaff();
  const editStaffMutation = useEditStaff();
  const assignLocation = useAssignStaffToLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    shiftStart: "",
    shiftEnd: "",
    locationId: "" as string,
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (staffQuery.isError)
    return (
      <div className="ops-page">
        <PageHeader title="Team" />
        <OperationsState
          error={staffQuery.error}
          retry={() => void staffQuery.refetch()}
        />
      </div>
    );

  const staff: StaffMember[] = data?.data ?? [];
  const locations = (locationsQuery.data?.data ?? []) as LocationOption[];

  const filtered = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesLocation =
      locationFilter === "all"
        ? true
        : locationFilter === "unassigned"
          ? s.locationId === null
          : s.locationId === Number(locationFilter);
    return matchesSearch && matchesLocation;
  });
  const assignedStaffCount = staff.filter((s) => s.locationId !== null).length;
  const activeStaffCount = staff.filter((s) => s.isActive).length;

  const locMap = new Map(locations.map((l) => [l.id, l.name]));
  const tzMap = new Map(locations.map((l) => [l.id, l.timezone]));
  const tzForLocation = (locationId: number | null) =>
    (locationId != null ? tzMap.get(locationId) : undefined) ?? "UTC";

  const extractError = (err: unknown) => {
    const error = err as ApiError;
    return (
      error.response?.data?.message ||
      error.response?.data?.errors?.map((e) => e.message).join(", ") ||
      error.message ||
      "An error occurred"
    );
  };

  const handleEditOpen = (s: StaffMember) => {
    setEditError(null);
    setEditingStaff(s);
    const tz = tzForLocation(s.locationId);
    setEditForm({
      name: s.name,
      email: s.email,
      phone: s.phone ?? "",
      shiftStart: toTimeValue(s.shiftStart, tz),
      shiftEnd: toTimeValue(s.shiftEnd, tz),
      locationId: s.locationId ? String(s.locationId) : "",
    });
  };

  const handleEditSave = async () => {
    if (!editingStaff) return;
    setEditError(null);
    try {
      const tz = tzForLocation(
        editForm.locationId ? Number(editForm.locationId) : null,
      );
      const payload: EditStaffInput = {};
      if (editForm.name !== editingStaff.name) payload.name = editForm.name;
      if (editForm.email !== editingStaff.email) payload.email = editForm.email;
      if (editForm.phone !== (editingStaff.phone ?? ""))
        payload.phone = editForm.phone;
      if (
        editForm.shiftStart &&
        editForm.shiftStart !== toTimeValue(editingStaff.shiftStart, tz)
      ) {
        payload.shiftStart = wallTimeToIso(
          editingStaff.shiftStart,
          editForm.shiftStart,
          tz,
        );
      }
      if (
        editForm.shiftEnd &&
        editForm.shiftEnd !== toTimeValue(editingStaff.shiftEnd, tz)
      ) {
        payload.shiftEnd = wallTimeToIso(
          editingStaff.shiftEnd,
          editForm.shiftEnd,
          tz,
        );
      }
      if (Object.keys(payload).length > 0) {
        await new Promise<void>((resolve, reject) => {
          editStaffMutation.mutate(
            { id: editingStaff.id, data: payload },
            { onSuccess: () => resolve(), onError: (err) => reject(err) },
          );
        });
      }
      const newLoc = editForm.locationId ? Number(editForm.locationId) : null;
      if (newLoc && newLoc !== editingStaff.locationId) {
        await new Promise<void>((resolve, reject) => {
          assignLocation.mutate(
            { staffId: editingStaff.id, locationId: newLoc },
            { onSuccess: () => resolve(), onError: (err) => reject(err) },
          );
        });
      }
      setEditingStaff(null);
      setSuccess("Team member changes saved.");
    } catch (err: unknown) {
      setEditError(extractError(err));
    }
  };

  const columns: Column<StaffMember>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (s) => s.name,
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
            {s.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <span className="font-medium text-gray-800">{s.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortValue: (s) => s.email,
      render: (s) => <span className="text-gray-500">{s.email}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (s) => <span className="text-gray-500">{s.phone || "—"}</span>,
    },
    {
      key: "location",
      header: "Location",
      sortValue: (s) => locMap.get(s.locationId ?? -1) ?? "",
      render: (s) =>
        s.locationId ? (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {(locMap.get(s.locationId) as string) ?? `#${s.locationId}`}
          </span>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        ),
    },
    {
      key: "shift",
      header: "Shift",
      render: (s) => (
        <span className="text-gray-600">
          {fmtTimeWithTz(s.shiftStart, tzForLocation(s.locationId))} –{" "}
          {fmtTimeWithTz(s.shiftEnd, tzForLocation(s.locationId))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (s) => (s.isActive ? 1 : 0),
      render: (s) => (
        <StatusBadge status={s.isActive ? "ACTIVE" : "INACTIVE"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (s) => (
        <div className="flex items-center gap-2">
          <button
            aria-label={`Edit ${s.name}`}
            onClick={(e) => {
              e.stopPropagation();
              handleEditOpen(s);
            }}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <DeleteButton
            name={s.name}
            description="Their account, attendance, assignments, and submitted evidence will be removed. Site task schedules will become unassigned."
            onDelete={() => deleteStaff.mutateAsync(s.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle={`${staff.length} team members`}
        action={
          <Button
            className="rounded-lg px-4"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add staff
          </Button>
        }
      />

      {dialogOpen ? (
        <StaffCreateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          locations={locations}
          onSaved={() => setSuccess("Team member added.")}
        />
      ) : null}

      {success ? (
        <p role="status" className="ops-save-result">
          {success}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Team members" value={staff.length} icon={Users} />
        <StatCard
          label="Assigned to location"
          value={assignedStaffCount}
          icon={MapPin}
          tone="sky"
        />
        <StatCard
          label="Active staff"
          value={activeStaffCount}
          icon={Plus}
          tone="emerald"
        />
      </div>

      <FilterBar>
        <div className="relative max-w-sm sm:max-w-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            aria-label="Search team"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email, or phone..."
            className="pl-10"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            aria-label="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className={`${inputCls} appearance-none pl-10 pr-8`}
          >
            <option value="all">All Locations</option>
            <option value="unassigned">Unassigned</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <DataTable
        pageSize={20}
        columns={columns}
        data={filtered}
        rowKey={(s) => s.id}
        emptyIcon={<Users className="h-12 w-12" />}
        emptyMessage="No staff members found."
        onRowHover={(s) => {
          queryClient.prefetchQuery(getStaffDetailsQueryOptions(s.id));
        }}
        onRowClick={(s) => navigate(`/staff/${s.id}`)}
      />

      {editingStaff && (
        <Dialog
          open={!!editingStaff}
          onOpenChange={(open) => {
            if (!open) setEditingStaff(null);
          }}
        >
          <DialogContent className="bg-card p-6 sm:max-w-lg">
            <DialogTitle>Edit team member</DialogTitle>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Name
                </label>
                <Input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="staff-create-locationId"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Location
                </label>
                <select
                  value={editForm.locationId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, locationId: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">Unassigned</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Shift Start
                  </label>
                  <Input
                    type="time"
                    value={editForm.shiftStart}
                    onChange={(e) =>
                      setEditForm({ ...editForm, shiftStart: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Shift End
                  </label>
                  <Input
                    type="time"
                    value={editForm.shiftEnd}
                    onChange={(e) =>
                      setEditForm({ ...editForm, shiftEnd: e.target.value })
                    }
                  />
                </div>
              </div>
              {editError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {editError}
                </div>
              )}
              <div className="flex gap-3 pt-3">
                <Button
                  onClick={() => setEditingStaff(null)}
                  variant="outline"
                  className="flex-1 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSave}
                  disabled={
                    editStaffMutation.isPending ||
                    assignLocation.isPending ||
                    !editForm.name.trim() ||
                    !editForm.email.trim() ||
                    !editForm.phone.trim()
                  }
                  className="flex-1 rounded-lg"
                >
                  {editStaffMutation.isPending || assignLocation.isPending
                    ? "Saving..."
                    : "Save changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
