import { useEffect, useId, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { fromZonedTime } from 'date-fns-tz';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { Input } from '@/components/ui/input';
import SidePanel, { SidePanelFieldError, SidePanelFooter } from '@/components/workspace/SidePanel';
import SelectMenu from '@/components/workspace/SelectMenu';
import { useCreateStaff } from './queries';
import './staff-forms-v6.css';

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations?: LocationOption[];
  location?: LocationOption;
  onSaved?: () => void;
  inline?: boolean;
};

export default function StaffCreateDialog(props: StaffCreateProps) {
  const { user } = useAuth();
  return <ScopedStaffCreateDialog key={`${user?.companyId}:${user?.role}:${user?.id}:${props.location?.id ?? 'directory'}`} {...props} />;
}

function ScopedStaffCreateDialog({ open, onOpenChange, locations = [], location, onSaved, inline = false }: StaffCreateProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const managerHire = user?.role === 'MANAGER';
  const createStaff = useCreateStaff();
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const formId = useId();
  const id = (field: string) => `${formId}-${field}`;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm<CreateStaffForm>({
    defaultValues: { locationId: location ? String(location.id) : '' },
  });
  const onCreateSubmit = (formData: CreateStaffForm) => {
    if (inFlight.current) return;
    const selected = location?.id ?? Number(formData.locationId);
    if (managerHire && !locations.some(site => site.id === selected)) {
      setError('locationId', { type: 'validate', message: 'Select assigned site' });
      return;
    }
    const tz = (location?.id === selected ? location.timezone : locations.find(site => site.id === selected)?.timezone) ?? 'UTC';
    inFlight.current = true;
    createStaff.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      locationId: location?.id ?? (formData.locationId ? Number(formData.locationId) : undefined),
      shiftStart: formData.shiftStart ? fromZonedTime(`1970-01-01T${formData.shiftStart}:00`, tz).toISOString() : undefined,
      shiftEnd: formData.shiftEnd ? fromZonedTime(`1970-01-01T${formData.shiftEnd}:00`, tz).toISOString() : undefined,
    }, {
      onSettled: () => { inFlight.current = false; },
      onSuccess: () => {
        if (!mounted.current) return;
        reset();
        onOpenChange(false);
        onSaved?.();
      },
    });
  };
  const close = () => { if (!createStaff.isPending && !inFlight.current) onOpenChange(false); };
  const cancel = () => { if (!createStaff.isPending && !inFlight.current) { reset(); onOpenChange(false); } };
  const failure = createStaff.error as { response?: { status?: number; data?: { errors?: Array<{ code?: string }> } } } | undefined;
  const failureCode = failure?.response?.data?.errors?.find(issue => issue.code)?.code;
  const failureMessage = failureCode === 'CAPACITY_REACHED'
    ? 'Your plan’s staff capacity has been reached. Ask the company owner to review Plan & billing. Your draft is kept.'
    : failureCode === 'SUBSCRIPTION_REQUIRED'
      ? 'An active subscription is required to add staff. Ask the company owner to review Plan & billing. Your draft is kept.'
      : failure?.response?.status === 403
        ? 'You do not have access to this action. Refresh your assigned sites.'
        : failure?.response?.status === 409
          ? 'The email is already in use or the available capacity changed. Your draft is kept.'
          : 'Could not add staff. Check the details and try again. Your draft is kept.';
  const locationLabel = location || managerHire ? 'Location' : 'Location (optional)';
  const actions = <SidePanelFooter className="wx-staff-form-actions">
    <button type="button" className="wx-staff-form-button" disabled={createStaff.isPending} onClick={cancel}>{t('Cancel')}</button>
    <button type="submit" form={formId} className="wx-staff-form-button wx-staff-form-primary" disabled={createStaff.isPending} aria-busy={createStaff.isPending}>{t(createStaff.isPending ? 'Creating...' : 'Create staff')}</button>
  </SidePanelFooter>;
  const body = <form id={formId} onSubmit={event => void handleSubmit(onCreateSubmit)(event)} className="wx-staff-form" aria-busy={createStaff.isPending}>
    <fieldset disabled={createStaff.isPending} className="wx-staff-form-fields">
      <div className="wx-staff-form-field">
        <label htmlFor={id('name')}>{t('Full Name')}</label>
        <Input id={id('name')} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? id('name-error') : undefined}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })} />
        <SidePanelFieldError id={id('name-error')}>{errors.name?.message}</SidePanelFieldError>
      </div>
      <div className="wx-staff-form-pair">
        <div className="wx-staff-form-field">
          <label htmlFor={id('email')}>{t('Email')}</label>
          <Input type="email" id={id('email')} dir="ltr" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? id('email-error') : undefined}
            {...register('email', { required: 'Email is required' })} />
          <SidePanelFieldError id={id('email-error')}>{errors.email?.message}</SidePanelFieldError>
        </div>
        <div className="wx-staff-form-field">
          <label htmlFor={id('phone')}>{t('Phone Number')}</label>
          <Input type="tel" id={id('phone')} dir="ltr" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? id('phone-error') : undefined}
            {...register('phone', { required: 'Phone number is required', minLength: { value: 7, message: 'Phone number must be at least 7 characters' }, maxLength: { value: 20, message: 'Phone number must be at most 20 characters' } })} />
          <SidePanelFieldError id={id('phone-error')}>{errors.phone?.message}</SidePanelFieldError>
        </div>
      </div>
      <div className="wx-staff-form-field">
        <label htmlFor={id('password')}>{t('Password')}</label>
        <Input type="password" id={id('password')} dir="ltr" autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={`${id('password-hint')}${errors.password ? ` ${id('password-error')}` : ''}`}
          {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} />
        <p id={id('password-hint')} className="wx-staff-form-help">{t('Share initial credentials directly with the staff member.')}</p>
        <SidePanelFieldError id={id('password-error')}>{errors.password?.message}</SidePanelFieldError>
      </div>
      <div className="wx-staff-form-field" role={location ? undefined : 'group'} aria-labelledby={location ? undefined : id('location-label')} aria-describedby={errors.locationId ? id('location-error') : undefined}>
        <label id={id('location-label')} htmlFor={location ? id('location') : undefined}>{t(locationLabel)}</label>
        {location ? <select id={id('location')} disabled aria-invalid={!!errors.locationId} aria-describedby={errors.locationId ? id('location-error') : undefined} {...register('locationId', { validate: () => !managerHire || locations.some(site => site.id === location.id) || 'Select assigned site' })}><option value={location.id}>{location.name}</option></select>
          : <Controller control={control} name="locationId" rules={{ validate: value => !managerHire || locations.some(site => String(site.id) === value) || 'Select assigned site' }} render={({ field }) => <SelectMenu
            label={locationLabel} value={field.value ?? ''} disabled={createStaff.isPending} onChange={field.onChange}
            options={[{ value: '', label: managerHire ? 'Select assigned site' : 'No location' }, ...locations.map(site => ({ value: String(site.id), label: site.name, translateLabel: false }))]} /> } />}
        <SidePanelFieldError id={id('location-error')}>{errors.locationId?.message}</SidePanelFieldError>
      </div>
      <div className="wx-staff-form-pair">
        {(['shiftStart', 'shiftEnd'] as const).map(field => <div className="wx-staff-form-field" key={field}>
          <label htmlFor={id(field)}>{t(field === 'shiftStart' ? 'Shift Start' : 'Shift End')}</label>
          <Input type="time" dir="ltr" id={id(field)} aria-invalid={!!errors[field]} aria-describedby={`${id('timezone-hint')}${errors[field] ? ` ${id(`${field}-error`)}` : ''}`}
            {...register(field, { required: field === 'shiftStart' ? 'Shift start is required' : 'Shift end is required' })} />
          <SidePanelFieldError id={id(`${field}-error`)}>{errors[field]?.message}</SidePanelFieldError>
        </div>)}
      </div>
      <p id={id('timezone-hint')} className="wx-staff-form-help">{t('Times use the assigned site’s timezone.')}</p>
    </fieldset>
    {createStaff.isError && <p role="alert" className="wx-staff-form-error">{t(failureMessage)}</p>}
  </form>;
  if (!open) return null;
  if (inline) return <section className="wx-staff-form-inline" aria-labelledby={id('title')}>
    <header><h2 id={id('title')}>{t('Add team member')}</h2><p className="wx-staff-form-help">{t('Set up a real staff account and its working shift.')}</p></header>
    {body}{actions}
  </section>;
  return <SidePanel open={open} title="Add team member" description="Set up a real staff account and its working shift." onOpenChange={value => { if (!value) close(); }} footer={actions}>{body}</SidePanel>;
}
