import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useCreateLocation, useGetLocations } from "./queries";
import LocationCard from "./components/LocationCard";
import type { LocationWithCounts, LocationFormValues } from "./types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { MapPin, Plus } from "lucide-react";
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
import { useState } from "react";

export default function LocationsPage() {
  const createLocation = useCreateLocation();
  const getLocations = useGetLocations();
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocationFormValues>();

  const onSubmit: SubmitHandler<LocationFormValues> = async (data) => {
    await createLocation.mutateAsync(
      { name: data.name, address: data.address, latitude: data.latitude, longitude: data.longitude },
      { onSuccess: () => { reset(); setDialogOpen(false); } }
    );
  };

  if (createLocation.isPending || getLocations.isPending) return <LoadingSpinner fullScreen />;

  const locations = getLocations.data?.data ?? [];
  const totalStaff = locations.reduce((sum: number, loc: LocationWithCounts) => sum + loc._count.staff, 0);
  const totalTemplates = locations.reduce((sum: number, loc: LocationWithCounts) => sum + loc._count.taskTemplates, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Locations" subtitle="Manage the operational sites that staff, attendance, and task schedules roll up into." action={
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
                  <Input type="number" step="any" {...register("latitude", { required: "Latitude is required" })} placeholder="33.6844" />
                  {errors.latitude && <p className="mt-1 text-xs text-red-500">{errors.latitude.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Longitude</label>
                  <Input type="number" step="any" {...register("longitude", { required: "Longitude is required" })} placeholder="73.0479" />
                  {errors.longitude && <p className="mt-1 text-xs text-red-500">{errors.longitude.message}</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => { reset(); setDialogOpen(false); }}>Cancel</Button>
                <Button type="submit" disabled={createLocation.isPending} className="flex-1 rounded-2xl">{createLocation.isPending ? "Creating..." : "Create location"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      } />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active locations" value={locations.length} icon={MapPin} />
        <StatCard label="Assigned staff" value={totalStaff} icon={MapPin} tone="sky" />
        <StatCard label="Task templates" value={totalTemplates} icon={Plus} tone="emerald" />
      </div>

      {locations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc: LocationWithCounts) => (
            <LocationCard key={loc.id} name={loc.name} address={loc.address} staff={loc._count.staff} taskTemplate={loc._count.taskTemplates} lat={loc.latitude.toString()} lng={loc.longitude.toString()} id={loc.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MapPin className="h-12 w-12" />}
          message="No locations yet. Add your first location to get started."
          action={<Button onClick={() => setDialogOpen(true)} className="rounded-2xl px-4">Add location</Button>}
        />
      )}
    </div>
  );
}
