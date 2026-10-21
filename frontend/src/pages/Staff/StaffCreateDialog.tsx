import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/context";
import { useForm } from "react-hook-form";
import { fromZonedTime } from "date-fns-tz";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateStaff } from "./queries";

type LocationOption = { id: number; name: string; timezone: string };
interface CreateStaffForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  locationId?: string;
  shiftStart: string;
  shiftEnd: string;
}

export default function StaffCreateDialog({
  open,
  onOpenChange,
  locations = [],
  location,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations?: LocationOption[];
  location?: LocationOption;
  onSaved?: () => void;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const managerHire = user?.role === "MANAGER";
  const createStaff = useCreateStaff();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStaffForm>({
    defaultValues: { locationId: location ? String(location.id) : "" },
  });
  const tzForLocation = (id: number | null) =>
    (location?.id === id
      ? location.timezone
      : locations.find((l) => l.id === id)?.timezone) ?? "UTC";
  const inputCls =
    "flex min-h-12! w-full rounded-lg border border-border/80 bg-background/90 px-4 py-2 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10";
  const extractError = (error: unknown) => {
    const e = error as {
      response?: { data?: { message?: string; errors?: { message: string }[] } };
      message?: string;
    };
    return (
      e.response?.data?.message ??
      e.response?.data?.errors?.map((issue) => issue.message).join(", ") ??
      e.message ??
      "Could not add staff. Try again."
    );
  };
  const onCreateSubmit = (formData: CreateStaffForm) => {
    const selected = location?.id ?? Number(formData.locationId);
    if (managerHire && !locations.some(site => site.id === selected)) return;
    const tz = tzForLocation(
      location?.id ??
        (formData.locationId ? Number(formData.locationId) : null),
    );
    createStaff.mutate(
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        locationId:
          location?.id ??
          (formData.locationId ? Number(formData.locationId) : undefined),
        shiftStart: formData.shiftStart
          ? fromZonedTime(
              `1970-01-01T${formData.shiftStart}:00`,
              tz,
            ).toISOString()
          : undefined,
        shiftEnd: formData.shiftEnd
          ? fromZonedTime(
              `1970-01-01T${formData.shiftEnd}:00`,
              tz,
            ).toISOString()
          : undefined,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
          onSaved?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/70 bg-card text-card-foreground sm:max-w-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Add team member")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onCreateSubmit)}
          className="space-y-4 pt-2"
        >
          <div>
            <label
              htmlFor="staff-create-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t("Full Name")}
            </label>
            <Input
              id="staff-create-name"
              {...register("name", { required: "Name is required" })}
              placeholder="Ali Raza"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="staff-create-email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t("Email")}
            </label>
            <Input
              type="email"
              id="staff-create-email"
              {...register("email", { required: "Email is required" })}
              placeholder="ali@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="staff-create-phone"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t("Phone Number")}
            </label>
            <Input
              type="tel"
              id="staff-create-phone"
              {...register("phone", {
                required: "Phone number is required",
                minLength: {
                  value: 7,
                  message: "Phone number must be at least 7 characters",
                },
                maxLength: {
                  value: 20,
                  message: "Phone number must be at most 20 characters",
                },
              })}
              placeholder="+92 300 1234567"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="staff-create-password"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t("Password")}
            </label>
            <Input
              type="password"
              id="staff-create-password"
              {...register("password", {
                required: "Password is required",
              })}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="staff-create-locationId"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t(location || managerHire ? "Location" : "Location (optional)")}
            </label>
            <select
              disabled={!!location}
              id="staff-create-locationId"
              {...register("locationId", { validate: value => !managerHire || locations.some(site => String(site.id) === (location ? String(location.id) : value)) || "Select assigned site" })}
              className={inputCls}
            >
              <option value="">{t(managerHire ? "Select assigned site" : "No location")}</option>
              {(location ? [location] : locations).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          {errors.locationId ? <p role="alert" className="text-destructive">{t(String(errors.locationId.message))}</p> : null}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="staff-create-shiftStart"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                {t("Shift Start")}
              </label>
              <Input
                type="time"
                id="staff-create-shiftStart"
                {...register("shiftStart", {
                  required: "Shift start is required",
                })}
              />
              {errors.shiftStart && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.shiftStart.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="staff-create-shiftEnd"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                {t("Shift End")}
              </label>
              <Input
                type="time"
                id="staff-create-shiftEnd"
                {...register("shiftEnd", {
                  required: "Shift end is required",
                })}
              />
              {errors.shiftEnd && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.shiftEnd.message}
                </p>
              )}
            </div>
          </div>
          {createStaff.isError ? (
            <p role="alert" className="operations-notice">
              {extractError(createStaff.error)}
            </p>
          ) : null}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createStaff.isPending}
              className="flex-1 rounded-lg"
            >
              {t(createStaff.isPending ? "Creating..." : "Create staff")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
