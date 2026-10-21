import { useLanguage } from "@/i18n/context";
import { useState } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { useCreateManager, useUpdateManager } from "./queries";
import type { Manager, ManagerFormValues } from "./types";

interface ManagerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager?: Manager | null;
  locations: { id: number; name: string }[];
  takenLocations?: Map<number, string>;
  onSaved?: () => void;
}

export default function ManagerFormDialog({
  open,
  onOpenChange,
  manager,
  locations,
  takenLocations,
  onSaved,
}: ManagerFormDialogProps) {
  const { t } = useLanguage();
  const isEdit = !!manager;
  const createManager = useCreateManager();
  const updateManager = useUpdateManager();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManagerFormValues>({
    defaultValues: {
      name: manager?.name ?? "",
      email: manager?.email ?? "",
      password: "",
      locationIds: manager?.locations.map((loc) => String(loc.id)) ?? [],
    },
  });

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
      onSaved?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status;
      setServerError(t(status === 409
        ? 'The record changed or a site is already assigned. Refresh before retrying. Your draft is kept.'
        : status === 403
          ? 'You do not have access to this action. Refresh your assigned sites.'
          : 'The action could not be confirmed. Refresh the record before retrying. Your draft is kept.'));

    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/70 bg-card text-card-foreground sm:max-w-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(isEdit ? "Edit manager" : "Add manager")}</DialogTitle>
          <DialogDescription>{t("Access follows assigned locations")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {serverError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              {serverError}
            </p>
          )}

          <div>
            <label
              htmlFor="manager-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t("Manager Name")}
            </label>
            <Input
              className="min-h-12!"
              id="manager-name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              placeholder="Ayesha Khan"
            />
            {errors.name && (
              <p role="alert" className="mt-1 text-xs text-red-500">
                {t(String(errors.name.message))}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="manager-email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t("Email")}
            </label>
            <Input
              className="min-h-12!"
              id="manager-email"
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="manager@company.com"
            />
            {errors.email && (
              <p role="alert" className="mt-1 text-xs text-red-500">
                {t(String(errors.email.message))}
              </p>
            )}
          </div>

          {!isEdit ? <div>
            <label htmlFor="manager-password" className="mb-1.5 block text-sm font-medium text-foreground">{t("Password")}</label>
            <Input className="min-h-12!" id="manager-password" type="password" autoComplete="new-password" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Use at least 8 characters" } })} />
            {errors.password ? <p role="alert" className="text-destructive">{t(String(errors.password.message))}</p> : null}
          </div> : <p className="text-sm text-muted-foreground">{t("Managers change their own password in Account security. Owner password replacement is unavailable.")}</p>}

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-foreground">
              {t("Assigned Locations")}
            </legend>
            <p className="mb-2 text-xs text-muted-foreground">
              {t("The manager can only see and manage the locations you select here. A location can only be assigned to one manager.")}
            </p>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border/70 bg-muted/30 p-2">
              {locations.map((loc) => {
                const takenBy = takenLocations?.get(loc.id);
                return (
                  <label
                    key={loc.id}
                    className={`flex min-h-12! items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
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
                        validate: (value) =>
                          value.length >= 1 || "Assign at least one location",
                      })}
                      className="h-4 w-4 shrink-0 accent-primary"
                    />
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground">{loc.name}</span>
                    {takenBy && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {t("Assigned to {name}", { name: takenBy })}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            {errors.locationIds && (
              <p role="alert" className="mt-1 text-xs text-red-500">
                {t(String(errors.locationIds.message))}
              </p>
            )}
          </fieldset>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-lg min-h-12!"
              onClick={() => onOpenChange(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg min-h-12!"
            >
              {t(isPending
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create manager")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
