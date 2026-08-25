import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useCreateLocation, useGetLocations } from "./queries";
import LocationCard from "./components/LocationCard";
import type { LocationWithCounts, LocationFormValues } from "./types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { LocateFixed, MapPin, Plus } from "lucide-react";
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
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

type CapturedLocation = {
  latitude: string;
  longitude: string;
  accuracy: number | null;
};

const POOR_ACCURACY_THRESHOLD_METERS = 50;

export default function LocationsPage() {
  const createLocation = useCreateLocation();
  const getLocations = useGetLocations();
  const user = useSelector((s: RootState) => s.auth.user);
  const isAdmin = user?.role === "ADMIN";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const timeZones = useMemo<string[]>(() => (Intl as any).supportedValuesOf("timeZone"), []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LocationFormValues>({
    defaultValues: { timezone: "" },
  });

  const fillCurrentLocation = () => {
    setLocationError(null);
    setCapturedLocation(null);

    if (!navigator.geolocation) {
      setLocationError("Location access is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        const accuracy = position.coords.accuracy ?? null;

        setValue("latitude", latitude, { shouldDirty: true, shouldValidate: true });
        setValue("longitude", longitude, { shouldDirty: true, shouldValidate: true });
        setCapturedLocation({ latitude, longitude, accuracy });
        setIsLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. You can still enter coordinates manually."
            : "Could not get your location. Enter coordinates manually or try again."
        );
        setIsLocating(false);
      },
      // maximumAge: 0 forces a fresh GPS fix instead of reusing a stale
      // cached position. Stale coordinates are a common cause of stored
      // locations being hundreds of meters away from the actual site.
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const onSubmit: SubmitHandler<LocationFormValues> = async (data) => {
    await createLocation.mutateAsync(
      { name: data.name, address: data.address, latitude: data.latitude, longitude: data.longitude, ...(data.timezone ? { timezone: data.timezone } : {}) },
      { onSuccess: () => { reset(); setLocationError(null); setCapturedLocation(null); setDialogOpen(false); } }
    );
  };

  if (createLocation.isPending || getLocations.isPending) return <LoadingSpinner fullScreen />;

  const locations = getLocations.data?.data ?? [];
  const totalStaff = locations.reduce((sum: number, loc: LocationWithCounts) => sum + loc._count.staff, 0);
  const totalTemplates = locations.reduce((sum: number, loc: LocationWithCounts) => sum + loc._count.taskTemplates, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Locations" subtitle="Manage the operational sites that staff, attendance, and task schedules roll up into." action={
        isAdmin ? (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl px-4">
              <Plus className="h-4 w-4" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/70 bg-card text-card-foreground sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New Location</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Location Name</label>
                <Input {...register("name", { required: "Name is required" })} placeholder="Downtown Office Tower" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Address</label>
                <Input {...register("address", { required: "Address is required" })} placeholder="123 Main St, Metropolis" />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Latitude</label>
                <Input type="number" step="any" {...register("latitude", {
                  required: "Latitude is required",
                  min: { value: -90, message: "Latitude must be between -90 and 90" },
                  max: { value: 90, message: "Latitude must be between -90 and 90" },
                })} placeholder="33.6844" />
                  {errors.latitude && <p className="mt-1 text-xs text-red-500">{errors.latitude.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Longitude</label>
                  <Input type="number" step="any" {...register("longitude", {
                    required: "Longitude is required",
                    min: { value: -180, message: "Longitude must be between -180 and 180" },
                    max: { value: 180, message: "Longitude must be between -180 and 180" },
                  })} placeholder="73.0479" />
                  {errors.longitude && <p className="mt-1 text-xs text-red-500">{errors.longitude.message}</p>}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Timezone</label>
                <select {...register("timezone")} className="flex h-11 w-full rounded-2xl border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10">
                  <option value="">Auto-detect from coordinates</option>
                  {timeZones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">Detected automatically from the latitude/longitude. Only change it if the detected zone is wrong.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Use current coordinates</p>
                    <p className="text-xs text-muted-foreground">Auto-fill latitude and longitude from this device, then adjust manually if needed.</p>
                  </div>
                  <Button type="button" variant="outline" className="rounded-2xl" onClick={fillCurrentLocation} disabled={isLocating}>
                    <LocateFixed className="h-4 w-4" />
                    {isLocating ? "Locating..." : "Get my location"}
                  </Button>
                </div>
                {capturedLocation && (
                  <div className="mt-3 rounded-xl border border-border/60 bg-background/80 p-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Latitude:</span>{" "}
                        <span className="font-medium text-foreground">{capturedLocation.latitude}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Longitude:</span>{" "}
                        <span className="font-medium text-foreground">{capturedLocation.longitude}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">GPS accuracy:</span>{" "}
                        <span className="font-medium text-foreground">
                          {capturedLocation.accuracy !== null
                            ? `±${Math.round(capturedLocation.accuracy)} m`
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                    {capturedLocation.accuracy !== null &&
                      capturedLocation.accuracy > POOR_ACCURACY_THRESHOLD_METERS && (
                        <p className="mt-2 text-xs font-medium text-amber-600">
                          Accuracy is low (±{Math.round(capturedLocation.accuracy)} m). For best results,
                          use a phone/tablet with GPS outdoors, or verify the pin on a map before creating
                          the location.
                        </p>
                      )}
                  </div>
                )}
                {locationError && <p className="mt-2 text-xs text-red-500">{locationError}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => { reset(); setLocationError(null); setCapturedLocation(null); setDialogOpen(false); }}>Cancel</Button>
                <Button type="submit" disabled={createLocation.isPending} className="flex-1 rounded-2xl">{createLocation.isPending ? "Creating..." : "Create location"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        ) : undefined
      } />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active locations" value={locations.length} icon={MapPin} />
        <StatCard label="Assigned staff" value={totalStaff} icon={MapPin} tone="sky" />
        <StatCard label="Task templates" value={totalTemplates} icon={Plus} tone="emerald" />
      </div>

      {locations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc: LocationWithCounts) => (
            <LocationCard key={loc.id} name={loc.name} address={loc.address} staff={loc._count.staff} taskTemplate={loc._count.taskTemplates} lat={loc.latitude.toString()} lng={loc.longitude.toString()} timezone={loc.timezone} id={loc.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MapPin className="h-12 w-12" />}
          message={isAdmin ? "No locations yet. Add your first location to get started." : "No locations assigned to you yet. Contact your admin."}
          action={isAdmin ? <Button onClick={() => setDialogOpen(true)} className="rounded-2xl px-4">Add location</Button> : undefined}
        />
      )}
    </div>
  );
}
