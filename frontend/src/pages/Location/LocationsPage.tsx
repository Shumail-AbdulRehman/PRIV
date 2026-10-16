import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useCreateLocation, useGetLocations } from "./queries";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import OperationStatus from "@/components/common/OperationStatus";
import OperationsState from "../Manager/OperationsState";
import { useOperations, type OperationOverview } from "../Manager/operations";
import { useLanguage } from "@/i18n/context";
import { Link } from "react-router-dom";
import type { LocationWithCounts, LocationFormValues } from "./types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import {
  LocateFixed,
  MapPin,
  Plus,
  Search,
  Building2,
  Users,
  ClipboardList,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/common/StatCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPreciseCurrentPosition } from "./currentPosition";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

type CapturedLocation = {
  latitude: string;
  longitude: string;
  accuracy: number;
};

export default function LocationsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [success, setSuccess] = useState("");
  const operations = useOperations<OperationOverview>("overview", {
    date: "today",
  });
  const createLocation = useCreateLocation();
  const getLocations = useGetLocations();
  const user = useSelector((s: RootState) => s.auth.user);
  const isAdmin = user?.role === "ADMIN";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const locationRequest = useRef<AbortController | null>(null);
  useEffect(() => () => locationRequest.current?.abort(), []);
  const [capturedLocation, setCapturedLocation] =
    useState<CapturedLocation | null>(null);
  const timeZones = useMemo<string[]>(
    () => Intl.supportedValuesOf("timeZone"),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LocationFormValues>({
    defaultValues: { timezone: "" },
  });

  const changeDialogOpen = (open: boolean) => {
    if (!open) {
      locationRequest.current?.abort();
      setIsLocating(false);
    }
    setDialogOpen(open);
  };

  const editCoordinates = () => {
    locationRequest.current?.abort();
    setIsLocating(false);
    setCapturedLocation(null);
    setLocationError(null);
  };

  const fillCurrentLocation = async () => {
    locationRequest.current?.abort();
    setLocationError(null);
    setCapturedLocation(null);

    if (!navigator.geolocation) {
      setLocationError("Location access is not supported by this browser.");
      return;
    }

    const request = new AbortController();
    locationRequest.current = request;
    setIsLocating(true);
    try {
      const position = await getPreciseCurrentPosition(
        navigator.geolocation,
        request.signal,
      );
      if (request.signal.aborted) return;
      const latitude = position.coords.latitude.toFixed(6);
      const longitude = position.coords.longitude.toFixed(6);
      const accuracy = position.coords.accuracy;

      setValue("latitude", latitude, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("longitude", longitude, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setCapturedLocation({ latitude, longitude, accuracy });
    } catch (error) {
      if (!request.signal.aborted)
        setLocationError(
          error instanceof Error
            ? error.message
            : "Could not get your location. Enter coordinates manually or try again.",
        );
    } finally {
      if (locationRequest.current === request && !request.signal.aborted)
        setIsLocating(false);
    }
  };

  const onSubmit: SubmitHandler<LocationFormValues> = async (data) => {
    try {
      await createLocation.mutateAsync(
        {
          name: data.name,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          ...(data.timezone ? { timezone: data.timezone } : {}),
        },
        {
          onSuccess: () => {
            reset();
            setLocationError(null);
            setCapturedLocation(null);
            changeDialogOpen(false);
            setSuccess(
              "Location created. Add areas and assign your team to get started.",
            );
          },
        },
      );
    } catch {
      /* The mutation error stays visible in the form. */
    }
  };

  if (getLocations.isPending) return <LoadingSpinner fullScreen />;

  if (getLocations.isError)
    return (
      <div className="ops-page">
        <PageHeader
          title="Locations"
          subtitle="Your sites and cleaning operations"
        />
        <OperationsState
          error={getLocations.error}
          retry={() => void getLocations.refetch()}
        />
      </div>
    );
  const locations: LocationWithCounts[] = getLocations.data?.data ?? [];
  const visible = locations.filter(
    (loc) =>
      (statusFilter === "all" ||
        loc.isActive === (statusFilter === "active")) &&
      (loc.name + " " + loc.address)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const daily = new Map(
    (operations.isError ? [] : (operations.data?.comparison ?? [])).map(
      (row) => [row.location.id, row],
    ),
  );
  const totalStaff = locations.reduce(
    (sum: number, loc: LocationWithCounts) => sum + loc._count.staff,
    0,
  );
  const totalTemplates = locations.reduce(
    (sum: number, loc: LocationWithCounts) => sum + loc._count.taskTemplates,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        subtitle="See your sites, teams, and today’s cleaning work."
        action={
          isAdmin ? (
            <Dialog open={dialogOpen} onOpenChange={changeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-lg px-4">
                  <Plus className="h-4 w-4" /> Add location
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border/70 bg-card text-card-foreground sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Create location</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4 pt-2"
                >
                  <div>
                    <label
                      htmlFor="location-name"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Location Name
                    </label>
                    <Input
                      id="location-name"
                      {...register("name", { required: "Name is required" })}
                      placeholder="Blue Area Office"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="location-address"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Address
                    </label>
                    <Input
                      id="location-address"
                      {...register("address", {
                        required: "Address is required",
                      })}
                      placeholder="Blue Area, Islamabad"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="location-latitude"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Latitude
                      </label>
                      <Input
                        type="number"
                        step="any"
                        id="location-latitude"
                        {...register("latitude", {
                          onChange: editCoordinates,
                          required: "Latitude is required",
                          min: {
                            value: -90,
                            message: "Latitude must be between -90 and 90",
                          },
                          max: {
                            value: 90,
                            message: "Latitude must be between -90 and 90",
                          },
                        })}
                        placeholder="33.6844"
                      />
                      {errors.latitude && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.latitude.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="location-longitude"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Longitude
                      </label>
                      <Input
                        type="number"
                        step="any"
                        id="location-longitude"
                        {...register("longitude", {
                          onChange: editCoordinates,
                          required: "Longitude is required",
                          min: {
                            value: -180,
                            message: "Longitude must be between -180 and 180",
                          },
                          max: {
                            value: 180,
                            message: "Longitude must be between -180 and 180",
                          },
                        })}
                        placeholder="73.0479"
                      />
                      {errors.longitude && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.longitude.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="location-timezone"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Timezone
                    </label>
                    <select
                      id="location-timezone"
                      {...register("timezone")}
                      className="flex h-11 w-full rounded-lg border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="">Auto-detect from coordinates</option>
                      {timeZones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Detected automatically from the latitude/longitude. Only
                      change it if the detected zone is wrong.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Use current coordinates
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Use this only while at the site. We wait up to 15
                          seconds for a reading accurate to 50 m or better.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={fillCurrentLocation}
                        disabled={isLocating}
                      >
                        <LocateFixed className="h-4 w-4" />
                        {isLocating ? "Locating..." : "Get my location"}
                      </Button>
                    </div>
                    {capturedLocation && (
                      <div className="mt-3 rounded-xl border border-border/60 bg-background/80 p-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Latitude:
                            </span>{" "}
                            <span className="font-medium text-foreground">
                              {capturedLocation.latitude}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Longitude:
                            </span>{" "}
                            <span className="font-medium text-foreground">
                              {capturedLocation.longitude}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">
                              Estimated accuracy:
                            </span>{" "}
                            <span className="font-medium text-foreground">
                              {`±${Math.round(capturedLocation.accuracy)} m`}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {locationError && (
                      <p role="alert" className="mt-2 text-xs text-destructive">
                        {locationError}
                      </p>
                    )}
                  </div>
                  {createLocation.isError ? (
                    <p role="alert" className="operations-notice">
                      {(
                        createLocation.error as {
                          response?: { data?: { message?: string } };
                        }
                      ).response?.data?.message ??
                        "Location could not be created. Check the details and try again."}
                    </p>
                  ) : null}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-lg"
                      onClick={() => {
                        reset();
                        setLocationError(null);
                        setCapturedLocation(null);
                        changeDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createLocation.isPending || isLocating}
                      className="flex-1 rounded-lg"
                    >
                      {createLocation.isPending
                        ? "Creating..."
                        : "Create location"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {success ? (
        <p className="ops-save-result" role="status">
          {t(success)}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active locations"
          value={locations.filter((loc) => loc.isActive).length}
          icon={MapPin}
        />
        <StatCard
          label="Assigned staff"
          value={totalStaff}
          icon={Users}
          tone="sky"
        />
        <StatCard
          label="Cleaning schedules"
          value={totalTemplates}
          icon={ClipboardList}
          tone="emerald"
        />
      </div>
      <div className="ops-toolbar">
        <label className="ops-search">
          <span className="flex items-center gap-2">
            <Search size={14} />
            {t("Search locations")}
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search by name or address")}
          />
        </label>
        <label>
          {t("Location status")}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="active">{t("Active locations")}</option>
            <option value="inactive">{t("Inactive locations")}</option>
            <option value="all">{t("All locations")}</option>
          </select>
        </label>
      </div>
      {operations.isError ? (
        <p className="workspace-footnote">
          {t("Today’s attendance and task totals are unavailable.")}{" "}
          <button
            className="text-primary underline"
            onClick={() => void operations.refetch()}
          >
            {t("Retry")}
          </button>
        </p>
      ) : null}
      {locations.length ? (
        <DataTable
          data={visible}
          pageSize={20}
          rowKey={(loc) => loc.id}
          emptyMessage="No locations match these filters."
          columns={[
            {
              key: "location",
              header: "Location",
              sortValue: (loc) => loc.name,
              render: (loc) => (
                <div className="table-identity">
                  <Building2 size={18} />
                  <div>
                    <strong>{loc.name}</strong>
                    <p>{loc.address}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "staff",
              header: "Staff present",
              sortValue: (loc) => daily.get(loc.id)?.present ?? -1,
              render: (loc) => {
                const row = daily.get(loc.id);
                return row ? (
                  <div className="table-progress">
                    <small>
                      {row.present} {t("of")} {row.scheduled}
                    </small>
                    {row.scheduled > 0 ? (
                      <progress
                        aria-label={t("Staff present")}
                        max={row.scheduled}
                        value={row.present}
                      />
                    ) : null}
                  </div>
                ) : (
                  <span aria-label={t("Information unavailable")}>—</span>
                );
              },
            },
            {
              key: "tasks",
              header: "Submitted / due",
              sortValue: (loc) => daily.get(loc.id)?.submitted ?? -1,
              render: (loc) => {
                const row = daily.get(loc.id);
                return row ? (
                  <div className="table-progress is-blue">
                    <small>
                      {row.submitted} {t("of")} {row.tasks}
                    </small>
                    {row.tasks > 0 ? (
                      <progress
                        aria-label={t("Work submitted")}
                        max={row.tasks}
                        value={row.submitted}
                      />
                    ) : null}
                  </div>
                ) : (
                  <span aria-label={t("Information unavailable")}>—</span>
                );
              },
            },
            {
              key: "review",
              header: "Waiting for review",
              sortValue: (loc) => daily.get(loc.id)?.reviews ?? -1,
              render: (loc) => {
                const row = daily.get(loc.id);
                return row ? (
                  <OperationStatus
                    state={row.reviews ? "REVIEW_REQUIRED" : "PASSED"}
                    label={
                      row.reviews
                        ? String(row.reviews) + " " + t("reviews")
                        : "No open reviews"
                    }
                  />
                ) : (
                  "—"
                );
              },
            },
            {
              key: "status",
              header: "Status",
              sortValue: (loc) => (loc.isActive ? 1 : 0),
              render: (loc) => (
                <StatusBadge status={loc.isActive ? "ACTIVE" : "INACTIVE"} />
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (loc) => (
                <Button asChild>
                  <Link to={"/locations/" + loc.id}>
                    {t("Open")}
                    <ArrowRight size={14} />
                  </Link>
                </Button>
              ),
            },
          ]}
        />
      ) : (
        <EmptyState
          icon={<MapPin />}
          message={
            isAdmin
              ? "No locations yet. Add your first location to get started."
              : "No locations assigned to you yet. Contact your admin."
          }
          action={
            isAdmin ? (
              <Button onClick={() => setDialogOpen(true)}>
                {t("Add location")}
              </Button>
            ) : undefined
          }
        />
      )}
      <div className="directory-guide">
        <Layers size={23} />
        <div>
          <strong>{t("Inside a location")}</strong>
          <p>
            {t(
              "Open a site to manage its areas and fixtures, staff and shifts, cleaning schedules, and photo reviews.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
