import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, RefreshCw } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { useLanguage } from '@/i18n/context';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { type Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ProtectedAttendancePhoto, { type AttendancePhoto } from '@/components/common/ProtectedAttendancePhoto';
import { Button } from '@/components/ui/button';
import { getAttendanceDisplayStatus } from '@/lib/attendance';
import { useGetLocations } from '../Location/queries';
import { useGetStaff } from '../Staff/queries';
import OperationsState from '../Manager/OperationsState';
import AttendanceContext from './AttendanceContext';
import { useGetAttendance } from './queries';
import type { AttendanceFilters } from './api';
import './attendance-v5.css';

interface AttendanceRecord {
  id: number; staffId: number; locationId: number; date: string;
  expectedStart: string; expectedEnd: string; checkInTime: string | null; checkOutTime: string | null;
  status: string; isLateCheckIn: boolean; lateMinutes: number | null;
  checkInPhoto?: AttendancePhoto; checkOutPhoto?: AttendancePhoto;
  staff: { id: number; name: string; email: string };
  location: { id: number; name: string; timezone?: string };
}
interface Site { id: number; name: string; timezone: string }
interface StaffOption { id: number; name: string; locationId?: number | null }
const calendarDate = (date = new Date(), timezone = 'UTC') => formatInTimeZone(date, timezone, 'yyyy-MM-dd');

export default function AttendancePage() {
  const { t, language } = useLanguage();
  const [location, setLocation] = useState('');
  const [staff, setStaff] = useState('');
  const [from, setFrom] = useState(() => calendarDate());
  const [to, setTo] = useState(() => calendarDate());
  const [month, setMonth] = useState(() => calendarDate().slice(0, 7));
  const [validation, setValidation] = useState('');
  const [applied, setApplied] = useState<AttendanceFilters>(() => ({ from: calendarDate(), to: calendarDate() }));
  const locationsQuery = useGetLocations();
  const staffQuery = useGetStaff();
  const query = useGetAttendance(applied);
  const sites = (locationsQuery.data?.data ?? []) as Site[];
  const allStaff = (staffQuery.data?.data ?? []) as StaffOption[];
  const records = ((query.data?.data ?? []) as AttendanceRecord[]).map(record => ({
    ...record,
    location: { ...record.location, timezone: record.location.timezone ?? sites.find(site => site.id === record.locationId)?.timezone },
  }));
  const selectedSite = sites.find(site => String(site.id) === location);
  const appliedSite = sites.find(site => site.id === applied.locationId);
  const appliedStaff = allStaff.find(person => person.id === applied.staffId);
  const now = new Date();
  const checkedIn = records.filter(record => record.checkInTime).length;
  const checkedOut = records.filter(record => record.checkOutTime).length;
  const late = records.filter(record => record.isLateCheckIn || record.status === 'LATE').length;
  const hasRecords = !!query.data && !query.isError;
  const dateLabel = (value?: string) => value ? new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-PK', { timeZone: 'UTC', dateStyle: 'medium' }).format(new Date(value + 'T00:00:00Z')) : t('Any date');
  const time = (value: string | null, timezone?: string) => value ? formatInTimeZone(new Date(value), timezone ?? 'UTC', 'HH:mm') : t('Not recorded');
  const capture = (record: AttendanceRecord) => ({ ...record, location: { ...record.location, timezone: record.location.timezone ?? 'UTC' } });

  function apply(event?: FormEvent, range?: { from: string; to: string }) {
    event?.preventDefault();
    const start = range?.from ?? from, end = range?.to ?? to;
    if (!start || !end || start > end) { setValidation('Choose a valid date range. From must be on or before To.'); return; }
    setValidation(''); setFrom(start); setTo(end);
    setApplied({ locationId: location ? Number(location) : undefined, staffId: staff ? Number(staff) : undefined, from: start, to: end });
  }
  function quick(type: 'today' | 'yesterday' | 'month') {
    if (type === 'month') {
      const [year, number] = month.split('-').map(Number);
      if (!year || !number || number > 12) return;
      apply(undefined, { from: `${month}-01`, to: calendarDate(new Date(Date.UTC(year, number, 0))) });
    } else {
      const date = calendarDate(now, selectedSite?.timezone);
      const day = new Date(date + 'T12:00:00Z');
      if (type === 'yesterday') day.setUTCDate(day.getUTCDate() - 1);
      const value = calendarDate(day); apply(undefined, { from: value, to: value });
    }
  }
  function reset() {
    const date = calendarDate(); setLocation(''); setStaff(''); setFrom(date); setTo(date); setMonth(date.slice(0, 7)); setValidation('');
    setApplied({ from: date, to: date });
  }
  const staffCell = (record: AttendanceRecord) => <div className="attendance-person"><span className="workspace-avatar" aria-hidden="true">{record.staff.name.split(' ').map(word => word[0]).join('').slice(0, 2)}</span><div><Link to={`/staff/${record.staff.id}`}><bdi>{record.staff.name}</bdi></Link><small><bdi>{record.location.name}</bdi> · <bdi>{dateLabel(record.date.slice(0, 10))}</bdi></small></div></div>;
  const shiftCell = (record: AttendanceRecord) => <div><bdi>{time(record.expectedStart, record.location.timezone)} – {time(record.expectedEnd, record.location.timezone)}</bdi><small>{record.location.timezone ?? t('UTC · location timezone unavailable')}</small></div>;
  const timeCell = (record: AttendanceRecord) => <div><span>{t('Check-in')}: <bdi>{time(record.checkInTime, record.location.timezone)}</bdi></span><small>{t('Check-out')}: <bdi>{time(record.checkOutTime, record.location.timezone)}</bdi></small></div>;
  const statusCell = (record: AttendanceRecord) => <div><StatusBadge status={getAttendanceDisplayStatus(record, now, record.location.timezone ?? 'UTC')} />{record.isLateCheckIn && record.status !== 'LATE' ? <small>{t('Late arrival')}</small> : null}{record.lateMinutes ? <small>{t('{minutes} minutes late', { minutes: record.lateMinutes })}</small> : null}</div>;
  const actions = (record: AttendanceRecord) => <div className="attendance-row-actions"><AttendanceContext attendance={capture(record)} staffName={record.staff.name} /><details className="attendance-photo-options"><summary>{t('Photos')}</summary><div><ProtectedAttendancePhoto attendanceId={record.id} kind="check-in" photo={record.checkInPhoto} /><ProtectedAttendancePhoto attendanceId={record.id} kind="check-out" photo={record.checkOutPhoto} /></div></details></div>;
  const columns: Column<AttendanceRecord>[] = [
    { key: 'staff', header: 'Staff member', sortValue: record => record.staff.name, render: staffCell },
    { key: 'shift', header: 'Shift', render: shiftCell },
    { key: 'check-in', header: 'Check-in / out', render: timeCell },
    { key: 'status', header: 'Status', sortValue: record => getAttendanceDisplayStatus(record, now, record.location.timezone ?? 'UTC'), render: statusCell },
    { key: 'actions', header: 'Photo & context', render: actions },
  ];
  const metrics = [
    ['Scheduled shifts', records.length, 'Recorded for the applied dates'],
    ['Checked in', checkedIn, 'Includes late arrivals'],
    ['Late arrivals', late, 'Recorded against the shift'],
    ['Checked out', checkedOut, 'Captured checkouts'],
  ] as const;
  return <div className="attendance-v5">
    <PageHeader title="Attendance" subtitle="Know who is on site. Follow every check-in with confidence." />
    <form className="attendance-filter-panel" onSubmit={apply}>
      <div className="attendance-primary-filters">
        <label>{t('Location')}<select aria-label={t('Location')} value={location} onChange={event => { setLocation(event.target.value); setStaff(''); }} disabled={locationsQuery.isPending || locationsQuery.isError}><option value="">{t('All locations')}</option>{sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
        <label>{t('From')}<input aria-label={t('From date')} type="date" value={from} required onChange={event => setFrom(event.target.value)} /></label>
        <label>{t('To')}<input aria-label={t('To date')} type="date" value={to} required onChange={event => setTo(event.target.value)} /></label>
        <Button type="submit">{t('Apply filters')}</Button>
      </div>
      {validation ? <p role="alert" className="attendance-filter-error">{t(validation)}</p> : null}
      {locationsQuery.isError ? <div role="alert" className="attendance-option-error"><span>{t('Locations could not load. Existing attendance is still available.')}</span><Button type="button" variant="outline" onClick={() => void locationsQuery.refetch()}>{t('Retry locations')}</Button></div> : null}
      <div className="attendance-applied-scope"><p><bdi>{appliedSite?.name ?? t('All locations')}</bdi> · <bdi>{dateLabel(applied.from)}{applied.to !== applied.from ? ` – ${dateLabel(applied.to)}` : ''}</bdi>{appliedSite ? <> · <bdi>{appliedSite.timezone}</bdi></> : null}{appliedStaff ? <> · <bdi>{appliedStaff.name}</bdi></> : null}</p><Button type="button" variant="outline" onClick={() => quick('today')}>{t('Today')}</Button></div>
      <p className="attendance-calendar-help">{t(appliedSite ? 'Dates and times follow the selected location’s calendar.' : 'Dates follow each location’s calendar. Choose a location to use its current day.')}</p>
      <details className="attendance-more-filters"><summary>{t('More filters')}</summary><div>
        <label>{t('Staff')}<select aria-label={t('Staff')} value={staff} disabled={staffQuery.isPending || staffQuery.isError} onChange={event => setStaff(event.target.value)}><option value="">{t('All Staff')}</option>{allStaff.filter(person => !location || String(person.locationId) === location).map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
        <label>{t('Month')}<input type="month" aria-label={t('Month')} value={month} onChange={event => setMonth(event.target.value)} /></label>
        <Button type="button" variant="outline" onClick={() => quick('month')}>{t('Apply month')}</Button><Button type="button" variant="outline" onClick={() => quick('yesterday')}>{t('Yesterday')}</Button><Button type="button" variant="outline" onClick={reset}>{t('Reset')}</Button>
      </div>{staffQuery.isError ? <p role="alert">{t('Staff filter could not load.')} <Button type="button" variant="outline" onClick={() => void staffQuery.refetch()}>{t('Retry')}</Button></p> : null}</details>
    </form>
    <div className="attendance-summary" aria-label={t('Attendance summary')} aria-busy={query.isPending}>{metrics.map(([label, value, hint]) => <div key={label}><span>{t(label)}</span><strong>{hasRecords ? value : '—'}</strong><p>{t(hint)}</p></div>)}</div>
    <section className="attendance-register" aria-labelledby="attendance-register-title">
      <header><div><h2 id="attendance-register-title">{t('Attendance records')}</h2><p>{t('Photos are available only to authorized accounts.')}</p></div><Button type="button" variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw size={16} aria-hidden="true" />{t(query.isFetching ? 'Refreshing…' : 'Refresh')}</Button></header>
      <OperationsState loading={query.isPending} error={query.error} retry={() => void query.refetch()} />
      {hasRecords ? <DataTable pageSize={20} columns={columns} data={records} rowKey={record => record.id} emptyIcon={<CalendarCheck size={32} />} emptyMessage="No attendance records found for the selected filters." mobileRender={record => <><div className="attendance-mobile-person">{staffCell(record)}{statusCell(record)}</div><dl><div><dt>{t('Shift')}</dt><dd>{shiftCell(record)}</dd></div><div><dt>{t('Check-in / out')}</dt><dd>{timeCell(record)}</dd></div></dl>{actions(record)}</>} /> : null}
      <footer><span>{t('Overnight shifts remain tied to their scheduled local date.')}</span><span>{hasRecords ? t('{count} recorded shifts', { count: records.length }) : t('Attendance totals are unavailable until records load.')}</span></footer>
    </section>
  </div>;
}
