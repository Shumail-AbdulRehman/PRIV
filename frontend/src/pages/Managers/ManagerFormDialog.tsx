import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateManager, useUpdateManager } from "./queries";
import type { Manager, ManagerFormValues } from "./types";

interface ManagerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager?: Manager | null;
  locations: { id: number; name: string }[];
  takenLocations?: Map<number, string>;
}

export default function ManagerFormDialog({ open, onOpenChange, manager, locations, takenLocations }: ManagerFormDialogProps) {
  const isEdit = !!manager;
  const createManager = useCreateManager();
  const updateManager = useUpdateManager();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManagerFormValues>({
    defaultValues: { name: "", email: "", password: "", locationIds: [] },
  });

  useEffect(() => {
    if (open) {
      setServerError(null);
      reset({
        name: manager?.name ?? "",
        email: manager?.email ?? "",
        password: "",
        locationIds: manager?.locations.map((loc) => String(loc.id)) ?? [],
      });
    }
  }, [open, manager, reset]);

  const isPending = createManager.isPending || updateManager.isPending;

  const onSubmit: SubmitHandler<ManagerFormValues> = async (data) => {
    setServerError(null);
    const locationIds = data.locationIds.map(Number);

    try {
      if (isEdit && manager) {
        await updateManager.mutateAsync({
          id: manager.id,
          data: {
            name: data.name,
            email: data.email,
            ...(data.password ? { password: data.password } : {}),
            locationIds,
          },
        });
      } else {
        await createManager.mutateAsync({
          name: data.name,
          email: data.email,
          password: data.password,
          locationIds,
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      setServerError(error?.response?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/70 bg-card text-card-foreground sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Manager" : "Create New Manager"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {serverError && (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <div>
            <label htmlFor="manager-name" className="mb-1.5 block text-sm font-medium text-foreground">Manager Name</label>
            <Input id="manager-name" {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } })} placeholder="Ayesha Khan" />
            {errors.name && <p role="alert" className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="manager-email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <Input id="manager-email" type="email" {...register("email", { required: "Email is required" })} placeholder="manager@company.com" />
            {errors.email && <p role="alert" className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="manager-password" className="mb-1.5 block text-sm font-medium text-foreground">
              {isEdit ? "New Password" : "Password"}
            </label>
            <Input
              id="manager-password"
              type="password"
              {...register("password", isEdit
                ? { minLength: { value: 6, message: "Password must be at least 6 characters" } }
                : { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
              placeholder="••••••••"
            />
            {isEdit && !errors.password && (
              <p className="mt-1 text-xs text-muted-foreground">Leave blank to keep the current password.</p>
            )}
            {errors.password && <p role="alert" className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-foreground">Assigned Locations</legend>
            <p className="mb-2 text-xs text-muted-foreground">The manager can only see and manage the locations you select here. A location can only be assigned to one manager.</p>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-2xl border border-border/70 bg-muted/30 p-2">
              {locations.map((loc) => {
                const takenBy = takenLocations?.get(loc.id);
                return (
                  <label
                    key={loc.id}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
                      takenBy
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer text-foreground hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={loc.id}
                      disabled={!!takenBy}
                      {...register("locationIds", {
                        validate: (value) => value.length >= 1 || "Assign at least one location",
                      })}
                      className="h-4 w-4 shrink-0 accent-primary"
                    />
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground">{loc.name}</span>
                    {takenBy && (
                      <span className="ml-auto text-xs text-muted-foreground">Assigned to {takenBy}</span>
                    )}
                  </label>
                );
              })}
            </div>
            {errors.locationIds && <p role="alert" className="mt-1 text-xs text-red-500">{errors.locationIds.message}</p>}
          </fieldset>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="flex-1 rounded-2xl">
              {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save changes" : "Create manager")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
