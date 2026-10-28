import TaskQr from '@/pages/Task/components/TaskQr';
import { Link } from 'react-router-dom';
import PageLoadingSkeleton from '@/components/common/PageLoadingSkeleton';
import { verificationLabel } from '@/pages/Verification/presentation';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatInTimeZone } from 'date-fns-tz';
import type { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLocationSchedule } from '../queries';
import { useLocationLanguage } from '../locationTranslations';
import { moveWeek, normalizeWeek, type ScheduleItem } from '../scheduleTypes';
const basicStatuses:Record<string,string>={PENDING:'Pending',IN_PROGRESS:'In progress',COMPLETED:'Submitted',MISSED:'Missed',CANCELLED:'Cancelled'};
export default function LocationScheduleTab({ locationId }: { locationId: string }) {
  const {t,language}=useLocationLanguage();
  const dayLabel=(day:string,pattern:string)=>new Intl.DateTimeFormat(language==='ur'?'ur-PK':'en-PK',{timeZone:'UTC',...(pattern==='EEEE'?{weekday:'long' as const}:{day:'numeric' as const,month:'short' as const,...(pattern.includes('yyyy')?{year:'numeric' as const}:{})})}).format(new Date(`${day}T12:00:00Z`));
  const statusLabel=(item:ScheduleItem)=>t(item.kind==='planned'?'Planned':item.verificationVersion===2?verificationLabel(item):(basicStatuses[item.status??'']??'Scheduled'));
  const staffLabel=(item:ScheduleItem)=>item.staff?`${t(item.staffMeaning==='template-default'?'Default staff':'Assigned to')}: ${item.staff.name}`:t('Unassigned');
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
  // The compiler may inspect callback dependencies before the query resolves.
  const weekStart = data?.weekStart;
  const timezone = data?.location.timezone;
  const time = (value: string) => timezone ? formatInTimeZone(value, timezone, 'HH:mm') : '—';
  const fullTime=(value:string)=>new Intl.DateTimeFormat(language==='ur'?'ur-PK':'en-PK',{timeZone:timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
  return <section className="location-week-v5 space-y-5" aria-label={t("Weekly schedule")}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-xl font-semibold text-foreground">{t('Week at a glance')}</h2><p className="mt-1 text-sm text-muted-foreground">{t('Planned tasks preview the automatic schedule. Assignments can change.')}</p></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={!data || query.isFetching} onClick={() => { if (weekStart) setWeek(moveWeek(weekStart, -1)); }}>{t('Previous week')}</Button>
        <Button variant="outline" disabled={query.isFetching} onClick={() => setWeek()}>{t('This week')}</Button>
        <Button variant="outline" disabled={!data || query.isFetching} onClick={() => { if (weekStart) setWeek(moveWeek(weekStart, 1)); }}>{t('Next week')}</Button>
      </div>
    </div>
    {query.isPending ? <PageLoadingSkeleton layout="schedule" section />
      : query.isError ? <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-5"><p>{t('We couldn’t load this week. Try again.')}</p><Button variant="outline" className="mt-3" onClick={() => void query.refetch()}>{t('Retry')}</Button></div>
      : data && <>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><p className="font-medium text-foreground">{dayLabel(data.weekStart, 'd MMM')} – {dayLabel(data.days[6].date, 'd MMM yyyy')}</p><p className="text-muted-foreground">{t('Site time')}: <bdi>{data.location.timezone}</bdi>{query.isFetching ? ' · '+t('Updating…') : ''}</p></div>
        {data.days.every((day) => day.items.length === 0) && <p className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">{t('No tasks scheduled for this week.')}</p>}
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {data.days.map((day) => <div key={day.date} className="grid gap-3 p-4 sm:grid-cols-[120px_1fr] sm:gap-6 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground">{dayLabel(day.date, 'EEEE')}<span className="ml-2 font-normal text-muted-foreground sm:ml-0 sm:mt-1 sm:block">{dayLabel(day.date, 'd MMM')}</span></h3>
            <div className="min-w-0 space-y-2">
              {day.items.length === 0 && <p className="py-1 text-sm text-muted-foreground">{t('No tasks')}</p>}
              {day.items.map((item) => <button key={item.key} onClick={() => setSelected({ key: item.key, date: day.date })} className="w-full rounded-lg border border-border p-3 text-start transition hover:border-primary/40 hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="break-words font-medium text-foreground">{item.title}{item.areaNameSnapshot?` · ${item.areaNameSnapshot}`:""}</span><span className={`rounded-md px-2 py-1 text-xs capitalize ${item.kind === 'planned' ? 'bg-accent text-primary' : 'bg-muted text-foreground'}`}>{statusLabel(item)}</span></div>
                <p className="mt-1 text-sm text-muted-foreground"><bdi dir="ltr">{time(item.startsAt)} – {time(item.endsAt)}</bdi> · {staffLabel(item)}</p>
                {(item.continuesFromPreviousDay || item.continuesIntoNextDay) && <p className="mt-1 text-xs text-muted-foreground">{[item.continuesFromPreviousDay && t('Continues from previous day'), item.continuesIntoNextDay && t('Continues into next day')].filter(Boolean).join(' · ')}</p>}
              </button>)}
            </div>
          </div>)}
        </div>
      </>}
    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent>
      <DialogTitle>{selectedItem?.title ?? t('Task no longer available')}</DialogTitle>
      <DialogDescription>{t(selectedItem?.kind === 'planned' ? 'Template preview. The scheduler creates the actual task when it is due.' : 'Read-only schedule details.')}</DialogDescription>
      {selectedItem && data ? <div className="space-y-3 text-sm text-foreground"><p className="capitalize">{statusLabel(selectedItem)}</p><p>{staffLabel(selectedItem)}</p>{selectedItem.instanceId?<Link className="text-primary" to={`/verification/${selectedItem.instanceId}`}>{t('Verification history')}</Link>:null}<p>{fullTime(selectedItem.startsAt)} – {fullTime(selectedItem.endsAt)}</p><p className="text-muted-foreground">{data.location.name} · {data.location.timezone}</p>{selectedItem.instanceId && selectedItem.verificationVersion === 2 && !['COMPLETED','CANCELLED'].includes(selectedItem.status ?? '') ? <TaskQr taskId={selectedItem.instanceId} /> : null}</div> : <p className="text-sm text-muted-foreground">{t('The schedule has changed. Close this panel and refresh the week.')}</p>}
    </DialogContent></Dialog>
  </section>;
}
