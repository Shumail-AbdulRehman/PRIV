import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { Input } from '@/components/ui/input';
import SidePanel, { SidePanelFooter } from '@/components/workspace/SidePanel';
import { useEditStaff } from './queries';
import type { EditStaffInput } from './api';
import './staff-forms-v6.css';

export interface EditableStaff {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  isActive: boolean;
  locationId?: number | null;
  location?: { id?: number; name?: string | null } | null;
}
type Props = { person: EditableStaff; timezone: string; onClose: () => void; onSaved?: () => void };
const timeValue = (date: string | null, timezone: string) => date ? formatInTimeZone(new Date(date), timezone, 'HH:mm') : '';

export default function StaffEditDialog(props: Props) {
  const { user } = useAuth();
  return <ScopedStaffEditDialog key={`${user?.companyId}:${user?.role}:${user?.id}:${props.person.id}`} {...props} />;
}

function ScopedStaffEditDialog({ person, timezone, onClose, onSaved }: Props) {
  const { t } = useLanguage();
  const edit = useEditStaff();
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const formId = useId();
  const id = (field: string) => `${formId}-${field}`;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: person.name, email: person.email, phone: person.phone ?? '', shiftStart: timeValue(person.shiftStart, timezone), shiftEnd: timeValue(person.shiftEnd, timezone) });
  const close = () => { if (!edit.isPending && !inFlight.current) onClose(); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlight.current || !person.isActive || !form.name.trim() || !form.email.trim()) return;
    inFlight.current = true;
    setError('');
    const payload: EditStaffInput = {};
    if (form.name.trim() !== person.name) payload.name = form.name.trim();
    if (form.email.trim() !== person.email) payload.email = form.email.trim();
    if (form.phone.trim() !== (person.phone ?? '')) payload.phone = form.phone.trim();
    for (const field of ['shiftStart', 'shiftEnd'] as const) if (form[field] && form[field] !== timeValue(person[field], timezone)) {
      const date = formatInTimeZone(person[field] ? new Date(person[field]!) : new Date(), timezone, 'yyyy-MM-dd');
      payload[field] = fromZonedTime(`${date}T${form[field]}:00`, timezone).toISOString();
    }
    try {
      if (Object.keys(payload).length) await edit.mutateAsync({ id: person.id, data: payload });
      if (!mounted.current) return;
      onSaved?.();
      onClose();
    } catch (cause) {
      if (!mounted.current) return;
      const status = (cause as { response?: { status?: number } }).response?.status;
      setError(status === 409 ? 'The record changed. Check the email and shift details before saving again. Your draft is kept.'
        : status === 403 ? 'You do not have access to this action. Refresh your assigned sites.'
          : status === 400 ? 'Check the contact and shift details. Existing schedules must fit the shift.'
            : 'The action could not be confirmed. Refresh the record before retrying. Your draft is kept.');
    } finally { inFlight.current = false; }
  };
  const locationId = person.locationId ?? person.location?.id;
  const locationName = person.location?.name || (locationId != null ? `#${locationId}` : t('Unassigned'));
  const actions = <SidePanelFooter className="wx-staff-form-actions">
    <button type="button" className="wx-staff-form-button" disabled={edit.isPending} onClick={close}>{t('Cancel')}</button>
    <button type="submit" form={formId} className="wx-staff-form-button wx-staff-form-primary" disabled={edit.isPending || !person.isActive || !form.name.trim() || !form.email.trim()} aria-busy={edit.isPending}>{t(edit.isPending ? 'Saving…' : 'Save changes')}</button>
  </SidePanelFooter>;
  return <SidePanel open title="Edit team member" description="Times use the assigned site’s timezone." onOpenChange={value => { if (!value) close(); }} footer={actions}>
    <p className="wx-staff-form-person"><bdi>{person.name}</bdi></p>
    <form id={formId} className="wx-staff-form" onSubmit={event => void save(event)} aria-busy={edit.isPending}>
      <fieldset className="wx-staff-form-fields" disabled={edit.isPending}>
        <div className="wx-staff-form-field">
          <label htmlFor={id('name')}>{t('Name')}</label>
          <Input id={id('name')} required minLength={2} autoComplete="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
        </div>
        <div className="wx-staff-form-pair">
          <div className="wx-staff-form-field">
            <label htmlFor={id('email')}>{t('Email')}</label>
            <Input id={id('email')} type="email" dir="ltr" required autoComplete="email" aria-describedby={id('email-hint')} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
          </div>
          <div className="wx-staff-form-field">
            <label htmlFor={id('phone')}>{t('Phone Number')}</label>
            <Input id={id('phone')} type="tel" dir="ltr" minLength={7} maxLength={20} autoComplete="tel" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} />
          </div>
        </div>
        <p id={id('email-hint')} className="wx-staff-form-help">{t('Updating the login email ends existing staff sessions.')}</p>
        <div className="wx-staff-form-field">
          <label htmlFor={id('location')}>{t('Location')}</label>
          <Input id={id('location')} readOnly value={locationName} aria-describedby={id('location-hint')} />
          <p id={id('location-hint')} className="wx-staff-form-help">{t('Use Staff access to transfer sites with a reason and open-shift checks.')}</p>
          <Link className="wx-staff-form-access" to={`/staff/${person.id}`} aria-disabled={edit.isPending || undefined} onClick={event => { if (edit.isPending || inFlight.current) event.preventDefault(); else onClose(); }}>{t('Staff access')}</Link>
        </div>
        <div className="wx-staff-form-pair">
          {(['shiftStart', 'shiftEnd'] as const).map(field => <div className="wx-staff-form-field" key={field}>
            <label htmlFor={id(field)}>{t(field === 'shiftStart' ? 'Shift Start' : 'Shift End')}</label>
            <Input id={id(field)} type="time" dir="ltr" value={form[field]} aria-describedby={id('timezone-hint')} onChange={event => setForm({ ...form, [field]: event.target.value })} />
          </div>)}
        </div>
        <p id={id('timezone-hint')} className="wx-staff-form-help">{t('Times use the assigned site’s timezone.')} <bdi>{timezone}</bdi></p>
      </fieldset>
      {error && <p className="wx-staff-form-error" role="alert">{t(error)}</p>}
    </form>
  </SidePanel>;
}
