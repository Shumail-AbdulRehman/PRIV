import { useEffect, useRef } from 'react';
import './workforce-v5.css';
import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/context";
import { useForm } from "react-hook-form";
import { fromZonedTime } from "date-fns-tz";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

type StaffCreateProps = {
  open:boolean;
  onOpenChange:(open:boolean)=>void;
  locations?:LocationOption[];
  location?:LocationOption;
  onSaved?:()=>void;
  inline?:boolean;
};
export default function StaffCreateDialog(props:StaffCreateProps){
  const {user}=useAuth();
  return <ScopedStaffCreateDialog key={`${user?.companyId}:${user?.role}:${user?.id}:${props.location?.id??'directory'}`} {...props}/>;
}
function ScopedStaffCreateDialog({open,onOpenChange,locations=[],location,onSaved,inline=false}:StaffCreateProps){
  const { t } = useLanguage();
  const { user } = useAuth();
  const managerHire = user?.role === "MANAGER";
  const createStaff = useCreateStaff();
  const inFlight = useRef(false);
  const mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
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
  const onCreateSubmit = (formData: CreateStaffForm) => {
    if (inFlight.current) return;
    const selected = location?.id ?? Number(formData.locationId);
    if (managerHire && !locations.some(site => site.id === selected)) return;
    const tz = tzForLocation(
      location?.id ??
        (formData.locationId ? Number(formData.locationId) : null),
    );
    inFlight.current = true;
    createStaff.mutate(
      {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
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
        onSettled: () => { inFlight.current = false; },
        onSuccess: () => {
          if(!mounted.current)return;
          reset();
          onOpenChange(false);
          onSaved?.();
        },
      },
    );
  };

  const failure=createStaff.error as {response?:{status?:number;data?:{errors?:Array<{code?:string}>}}}|undefined;
  const failureCode=failure?.response?.data?.errors?.find(issue=>issue.code)?.code;
  const failureMessage=failureCode==='CAPACITY_REACHED'
    ? 'Your plan’s staff capacity has been reached. Ask the company owner to review Plan & billing. Your draft is kept.'
    : failureCode==='SUBSCRIPTION_REQUIRED'
      ? 'An active subscription is required to add staff. Ask the company owner to review Plan & billing. Your draft is kept.'
      : failure?.response?.status===403
        ? 'You do not have access to this action. Refresh your assigned sites.'
        : failure?.response?.status===409
          ? 'The email is already in use or the available capacity changed. Your draft is kept.'
          : 'Could not add staff. Check the details and try again. Your draft is kept.';
  const body = (
        <form
          onSubmit={event=>void handleSubmit(onCreateSubmit)(event)}
          className="workforce-form"
        >
          <fieldset disabled={createStaff.isPending} className="workforce-form-grid">
          <div>
            <label
              htmlFor="staff-create-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t("Full Name")}
            </label>
            <Input
              id="staff-create-name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "staff-create-name-error" : undefined} aria-label={t("Full Name")}
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } })}
              autoComplete="name"
            />
            {errors.name && (
              <p id="staff-create-name-error" className="mt-1 text-xs workforce-danger">{t(String(errors.name.message))}</p>
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
              id="staff-create-email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "staff-create-email-error" : undefined} aria-label={t("Email")}
              {...register("email", { required: "Email is required" })}
              dir="ltr" autoComplete="email"
            />
            {errors.email && (
              <p id="staff-create-email-error" className="mt-1 text-xs workforce-danger">
                {t(String(errors.email.message))}
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
              id="staff-create-phone" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "staff-create-phone-error" : undefined} aria-label={t("Phone Number")}
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
              dir="ltr" autoComplete="tel"
            />
            {errors.phone && (
              <p id="staff-create-phone-error" className="mt-1 text-xs workforce-danger">
                {t(String(errors.phone.message))}
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
              id="staff-create-password" aria-invalid={!!errors.password} aria-describedby={errors.password ? "staff-create-password-error" : undefined} aria-label={t("Password")}
              {...register("password", {
                required: "Password is required", minLength: {value: 8, message:"Use at least 8 characters"},
              })}
              dir="ltr" autoComplete="new-password"
            />
            {errors.password && (
              <p id="staff-create-password-error" className="mt-1 text-xs workforce-danger">
                {t(String(errors.password.message))}
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
              id="staff-create-locationId" aria-invalid={!!errors.locationId} aria-describedby={errors.locationId ? "staff-create-locationId-error" : undefined} aria-label={t(location||managerHire?"Location":"Location (optional)")}
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
          {errors.locationId ? <p id="staff-create-locationId-error" role="alert" className="text-destructive">{t(String(errors.locationId.message))}</p> : null}
          <div className="workforce-create-shifts grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="staff-create-shiftStart"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                {t("Shift Start")}
              </label>
              <Input
                type="time" dir="ltr"
                id="staff-create-shiftStart" aria-invalid={!!errors.shiftStart} aria-describedby={errors.shiftStart ? "staff-create-shiftStart-error" : undefined} aria-label={t("Shift Start")}
                {...register("shiftStart", {
                  required: "Shift start is required",
                })}
              />
              {errors.shiftStart && (
                <p id="staff-create-shiftStart-error" className="mt-1 text-xs workforce-danger">
                  {t(String(errors.shiftStart.message))}
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
                type="time" dir="ltr"
                id="staff-create-shiftEnd" aria-invalid={!!errors.shiftEnd} aria-describedby={errors.shiftEnd ? "staff-create-shiftEnd-error" : undefined} aria-label={t("Shift End")}
                {...register("shiftEnd", {
                  required: "Shift end is required",
                })}
              />
              {errors.shiftEnd && (
                <p id="staff-create-shiftEnd-error" className="mt-1 text-xs workforce-danger">
                  {t(String(errors.shiftEnd.message))}
                </p>
              )}
            </div>
          </div>
          {createStaff.isError ? (
            <p role="alert" className="operations-notice">
              {t(failureMessage)}
            </p>
          ) : null}
          </fieldset>
          <p className="workforce-help">{t('Times use the assigned site’s timezone. Share initial credentials directly with the staff member.')}</p>
          <div className="workforce-form-actions">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-lg"
              disabled={createStaff.isPending}
              onClick={() => {
                if(inFlight.current)return;
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
  );
  if (!open) return null;
  if (inline) return <section className="workforce-panel workforce-inline-form" aria-labelledby="staff-create-title"><h2 id="staff-create-title">{t('Add team member')}</h2><p className="workforce-help">{t('Set up a real staff account and its working shift.')}</p>{body}</section>;
  return <Dialog open={open} onOpenChange={value=>{if(!createStaff.isPending&&!inFlight.current)onOpenChange(value);}}><DialogContent className="workforce-dialog bg-card sm:max-w-xl" showCloseButton={!createStaff.isPending} onEscapeKeyDown={e=>{if(createStaff.isPending)e.preventDefault();}} onInteractOutside={e=>{if(createStaff.isPending)e.preventDefault();}}><DialogHeader><DialogTitle>{t('Add team member')}</DialogTitle><DialogDescription>{t('Set up a real staff account and its working shift.')}</DialogDescription></DialogHeader>{body}</DialogContent></Dialog>;
}
