import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatInTimeZone } from 'date-fns-tz';
import type { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLocationSchedule } from '../queries';
import { moveWeek, normalizeWeek, type ScheduleItem } from '../scheduleTypes';
const dayLabel = (day: string, pattern: string) => formatInTimeZone(`${day}T12:00:00Z`, 'UTC', pattern);
const statusLabel = (item: ScheduleItem) => item.kind === 'planned' ? 'Planned' : (item.status ?? 'Scheduled').replaceAll('_', ' ').toLowerCase();
const staffLabel = (item: ScheduleItem) => item.staff ? `${item.staffMeaning === 'template-default' ? 'Default staff' : 'Assigned to'}: ${item.staff.name}` : 'Unassigned';
export default function LocationScheduleTab({ locationId }: { locationId: string }) {
  const companyId = useSelector((state: RootState) => state.auth.user?.companyId);
  const [params, setParams] = useSearchParams();
  const week = normalizeWeek(params.get('week'));
  const query = useLocationSchedule(companyId, locationId, week);
  const [selected, setSelected] = useState<{ key: string; date: string } | null>(null);
  const data = query.data;
  const selectedItem = data?.days.find((day) => day.date === selected?.date)?.items.find((item) => item.key === selected?.key);
  const setWeek = (value?: string) => {
    setSelected(null);
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set('week', value); else next.delete('week');
      return next;
    });
    if (!value && !week) void query.refetch();
  };
  const time = (value: string) => formatInTimeZone(value, data!.location.timezone, 'HH:mm');
  return <section className="space-y-5" aria-label="Weekly schedule">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-xl font-semibold text-slate-900">Week at a glance</h2><p className="mt-1 text-sm text-slate-500">Planned tasks preview the automatic schedule. Assignments can change.</p></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={!data || query.isFetching} onClick={() => setWeek(moveWeek(data!.weekStart, -1))}>Previous week</Button>
        <Button variant="outline" disabled={query.isFetching} onClick={() => setWeek()}>This week</Button>
        <Button variant="outline" disabled={!data || query.isFetching} onClick={() => setWeek(moveWeek(data!.weekStart, 1))}>Next week</Button>
      </div>
    </div>
    {query.isPending ? <div role="status" className="rounded-xl border p-8 text-slate-500">Loading weekly schedule…</div>
      : query.isError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5"><p>We couldn’t load this week. Try again.</p><Button variant="outline" className="mt-3" onClick={() => void query.refetch()}>Retry</Button></div>
      : data && <>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><p className="font-medium text-slate-800">{dayLabel(data.weekStart, 'd MMM')} – {dayLabel(data.days[6].date, 'd MMM yyyy')}</p><p className="text-slate-500">Site time: {data.location.timezone}{query.isFetching ? ' · Updating…' : ''}</p></div>
        {data.days.every((day) => day.items.length === 0) && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">No tasks scheduled for this week.</p>}
        <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {data.days.map((day) => <div key={day.date} className="grid gap-3 p-4 sm:grid-cols-[120px_1fr] sm:gap-6 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-900">{dayLabel(day.date, 'EEEE')}<span className="ml-2 font-normal text-slate-500 sm:ml-0 sm:mt-1 sm:block">{dayLabel(day.date, 'd MMM')}</span></h3>
            <div className="min-w-0 space-y-2">
              {day.items.length === 0 && <p className="py-1 text-sm text-slate-400">No tasks</p>}
              {day.items.map((item) => <button key={item.key} onClick={() => setSelected({ key: item.key, date: day.date })} className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-blue-600">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="break-words font-medium text-slate-900">{item.title}</span><span className={`rounded-md px-2 py-1 text-xs capitalize ${item.kind === 'planned' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{statusLabel(item)}</span></div>
                <p className="mt-1 text-sm text-slate-600">{time(item.startsAt)} – {time(item.endsAt)} · {staffLabel(item)}</p>
                {(item.continuesFromPreviousDay || item.continuesIntoNextDay) && <p className="mt-1 text-xs text-slate-500">{[item.continuesFromPreviousDay && 'Continues from previous day', item.continuesIntoNextDay && 'Continues into next day'].filter(Boolean).join(' · ')}</p>}
              </button>)}
            </div>
          </div>)}
        </div>
      </>}
    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent>
      <DialogTitle>{selectedItem?.title ?? 'Task no longer available'}</DialogTitle>
      <DialogDescription>{selectedItem?.kind === 'planned' ? 'Template preview. The scheduler creates the actual task when it is due.' : 'Read-only schedule details.'}</DialogDescription>
      {selectedItem && data ? <div className="space-y-3 text-sm text-slate-700"><p className="capitalize">{statusLabel(selectedItem)}</p><p>{staffLabel(selectedItem)}</p><p>{formatInTimeZone(selectedItem.startsAt, data.location.timezone, 'EEE d MMM yyyy, HH:mm')} – {formatInTimeZone(selectedItem.endsAt, data.location.timezone, 'EEE d MMM yyyy, HH:mm')}</p><p className="text-slate-500">{data.location.name} · {data.location.timezone}</p></div> : <p className="text-sm text-slate-600">The schedule has changed. Close this panel and refresh the week.</p>}
    </DialogContent></Dialog>
  </section>;
}
