import { useId, useRef, useState, type FormEvent } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProtectedAttendancePhoto, { type AttendancePhoto } from '@/components/common/ProtectedAttendancePhoto';
import StatusBadge from '@/components/common/StatusBadge';
import { appendAttendanceContext, getAttendanceContext, type AnnotationRequest } from './contextApi';
import './attendance-context.css';

export type AttendanceCapture = {
  id: number;
  date: string | null;
  expectedStart: string | null;
  expectedEnd: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  location?: { name?: string | null; timezone?: string | null } | null;
  checkInPhoto?: AttendancePhoto;
  checkOutPhoto?: AttendancePhoto;
};
type Props = { attendance: AttendanceCapture; staffName?: string };
const forbiddenControls = (value: string) => [...value].some(character => {
  const code = character.charCodeAt(0);
  return code < 32 && ![9, 10, 13].includes(code) || code === 127;
});
const statusOf = (error: unknown) => (error as { response?: { status?: number } })?.response?.status;

export default function AttendanceContext(props: Props) {
  const { user } = useAuth();
  if (!user) return null;
  // Neither drafts nor an open dialog survive a principal/tenant/record change.
  return <ScopedContext key={`${user.companyId}:${user.role}:${user.id}:${props.attendance.id}`} {...props} />;
}

function ScopedContext({ attendance, staffName }: Props) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const reasonId = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [request, setRequest] = useState<AnnotationRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<number | 'unknown' | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [saved, setSaved] = useState(false);
  const busy = useRef(false);
  const queryKey = ['attendance-context', user?.companyId, user?.role, user?.id, attendance.id];
  const history = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => getAttendanceContext(attendance.id, pageParam, signal),
    getNextPageParam: page => page.nextCursor ?? undefined,
    enabled: open,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const denied = [401, 403, 404].includes(statusOf(history.error) ?? 0);
  const entries = history.isError ? [] : history.data?.pages.flatMap(page => page.items) ?? [];
  const acknowledge = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const timezone = attendance.location?.timezone || 'UTC';
  const timestamp = (value: string | null) => value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-PK', {
      timeZone: timezone, dateStyle: 'medium', timeStyle: 'short',
    }).format(new Date(value)) : t('Not recorded');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current || !history.isSuccess || history.isError) return;
    const trimmed = reason.trim();
    if (!request && (!trimmed || trimmed.length > 1000 || forbiddenControls(trimmed))) {
      setInvalid(true);
      return;
    }
    const intent = request ?? {
      requestId: crypto.randomUUID(), reason: trimmed,
      ...(parentId ? { kind: 'ACKNOWLEDGEMENT' as const, parentId } : { kind: 'NOTE' as const }),
    };
    busy.current = true;
    setRequest(intent);
    setSaving(true);
    setError(null);
    setInvalid(false);
    setSaved(false);
    try {
      await appendAttendanceContext(attendance.id, intent);
      setReason('');
      setParentId(null);
      setRequest(null);
      setSaved(true);
      await queryClient.invalidateQueries({ queryKey });
    } catch (failure) {
      setError(statusOf(failure) ?? 'unknown');
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline">{t('Attendance context')}</Button></DialogTrigger>
    <DialogContent className="workspace attendance-context-dialog sm:max-w-3xl" showCloseButton={false}>
      <header className="attendance-context-header"><DialogTitle>{t('Attendance context')} · <bdi>#{attendance.id}</bdi></DialogTitle><DialogClose asChild><Button type="button" variant="outline">{t('Close')}</Button></DialogClose></header>
      <DialogDescription>{t('Notes add context. Original attendance, photos and paid hours are not changed.')}</DialogDescription>
      <section className="attendance-capture" aria-labelledby={`${reasonId}-capture`}>
        <h2 id={`${reasonId}-capture`}>{t('Original captured facts')}</h2>
        {staffName ? <p><bdi>{staffName}</bdi></p> : null}
        <p><bdi>{attendance.location?.name ?? t('Location unavailable')}</bdi> · <bdi>{timezone}</bdi></p>
        <dl>
          <dt>{t('Attendance day')}</dt><dd><bdi>{attendance.date && Number.isFinite(Date.parse(attendance.date)) ? new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-PK', { timeZone: 'UTC', dateStyle: 'medium' }).format(new Date(attendance.date)) : t('Not recorded')}</bdi></dd>
          <dt>{t('Expected start')}</dt><dd><bdi>{timestamp(attendance.expectedStart)}</bdi></dd>
          <dt>{t('Expected end')}</dt><dd><bdi>{timestamp(attendance.expectedEnd)}</bdi></dd>
          <dt>{t('Captured check-in')}</dt><dd><bdi>{timestamp(attendance.checkInTime)}</bdi></dd>
          <dt>{t('Captured check-out')}</dt><dd><bdi>{timestamp(attendance.checkOutTime)}</bdi></dd>
          <dt>{t('Captured status')}</dt><dd><StatusBadge status={attendance.status} /></dd>
        </dl>
        <div className="attendance-context-photos">
          <ProtectedAttendancePhoto attendanceId={attendance.id} kind="check-in" photo={attendance.checkInPhoto} />
          <ProtectedAttendancePhoto attendanceId={attendance.id} kind="check-out" photo={attendance.checkOutPhoto} />
        </div>
      </section>
      <section className="attendance-context-history" aria-labelledby={`${reasonId}-history`}>
        <h2 id={`${reasonId}-history`}>{t('Recorded context')}</h2>
        {history.isPending ? <p role="status">{t('Loading attendance context…')}</p> : null}
        {history.isError ? <div role="alert"><p>{t(denied ? 'This attendance context is no longer available to your account.' : 'Context could not load. Your draft is kept.')}</p>
          <Button variant="outline" onClick={() => void history.refetch()}>{t('Refresh context')}</Button></div> : null}
        {history.isSuccess && !entries.length ? <p>{t('No context has been recorded.')}</p> : null}
        <ol>{entries.map(entry => <li key={entry.id}>
          <div className="attendance-context-attribution"><strong>{t(entry.kind === 'NOTE' ? 'Note' : 'Acknowledgement')}</strong>
            <span>{t(entry.actorRole === 'ADMIN' ? 'Company owner' : entry.actorRole === 'MANAGER' ? 'Manager' : 'Worker')} <bdi>#{entry.actorId}</bdi></span>
            <time dateTime={entry.createdAt}><bdi>{timestamp(entry.createdAt)}</bdi></time></div>
          <p className="attendance-context-reason">{entry.reason}</p>
          {entry.parentId ? <p>{t('Acknowledges note')} <bdi>{entry.parentId}</bdi></p> : null}
          <p className="attendance-context-reference">{t('Record reference')} <bdi>{entry.id}</bdi></p>
          {acknowledge && entry.kind === 'NOTE' ? <Button variant="outline" disabled={!!request} onClick={() => { setParentId(entry.id); setSaved(false); document.getElementById(reasonId)?.focus(); }}>{t('Acknowledge note')}</Button> : null}
        </li>)}</ol>
        {history.hasNextPage && !history.isError ? <Button variant="outline" disabled={history.isFetchingNextPage} onClick={() => void history.fetchNextPage()}>{t(history.isFetchingNextPage ? 'Loading more context…' : 'Load more recorded context')}</Button> : null}
      </section>
      <form className="attendance-context-form" onSubmit={event => void submit(event)} noValidate>
        <h2>{t(parentId ? 'Add acknowledgement' : 'Add attendance note')}</h2>
        {parentId ? <p>{t('Acknowledges note')} <bdi>{parentId}</bdi></p> : null}
        <label htmlFor={reasonId}>{t('Reason (required)')}</label>
        <textarea id={reasonId} value={reason} readOnly={!!request} disabled={denied} maxLength={1000} required aria-invalid={invalid} aria-describedby={`${reasonId}-help`} onChange={event => { setReason(event.target.value); setInvalid(false); setSaved(false); }} />
        <p id={`${reasonId}-help`}>{t('Use 1–1000 characters. Saved notes cannot be edited or deleted.')}</p>
        {invalid ? <p role="alert">{t('Enter a reason of 1–1000 characters without control characters.')}</p> : null}
        {error ? <div role="alert"><p>{t(error === 409 ? 'Request conflict. Refresh context; your draft is kept.' : [401, 403, 404].includes(Number(error)) ? 'Your account cannot save context for this attendance. Your draft is kept.' : 'Saving was not confirmed. Your draft is locked for an exact retry to prevent duplicate notes.')}</p>
          {error === 409 ? <Button type="button" variant="outline" onClick={() => { setRequest(null); setError(null); void history.refetch(); }}>{t('Review conflict and edit draft')}</Button> : null}</div> : null}
        {saved ? <p role="status">{t('Context recorded. Original attendance is unchanged.')}</p> : null}
        <div className="attendance-context-actions">
          <Button disabled={saving || !history.isSuccess || history.isError || error === 409}>{t(saving ? 'Recording context…' : request ? 'Retry same request' : parentId ? 'Record acknowledgement' : 'Record note')}</Button>
          {parentId && !request ? <Button type="button" variant="outline" onClick={() => setParentId(null)}>{t('Add a note instead')}</Button> : null}
          <DialogClose asChild><Button type="button" variant="outline">{t('Close')}</Button></DialogClose>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}
