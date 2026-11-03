import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import StatusBadge from '@/components/common/StatusBadge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { setupErrorKey, useSetupFormText } from './areaFormText';
import './setup-forms.css';
import { invalidateWorkspace } from '@/lib/invalidateWorkspace';
import { useArea } from './queries';
import { addItems, archiveArea, createArea, editArea, editItem } from './api';
import { fixtureNames, itemEditPayload, roomPresets, setupFixtureTypes, type AreaItem, type FixtureType } from './types';

function FixtureRow({ item, disabled, save }: { item: AreaItem; disabled: boolean; save: (item: AreaItem) => Promise<boolean> }) {
  const t = useSetupFormText();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.displayName);
  const [status, setStatus] = useState(item.status);
  return <li className="area-template-fixture">
    {editing ? <form className="area-template-fixture-edit" onSubmit={event => {
      event.preventDefault(); void save({ ...item, displayName: name, status }).then(ok => { if (ok) setEditing(false); });
    }}>
      <label>{t('Fixture name')}<Input value={name} disabled={disabled} onChange={event => setName(event.target.value)} maxLength={100} /></label>
      <label>{t('Status')}<select aria-label={t('Status')} value={status} disabled={disabled} onChange={event => setStatus(event.target.value as AreaItem['status'])}>
        <option value="ACTIVE">{t('Active')}</option><option value="MAINTENANCE">{t('Maintenance')}</option><option value="RETIRED">{t('Remove from template')}</option>
      </select></label>
      <div className="flex flex-wrap gap-2"><Button disabled={disabled || !name.trim()} type="submit">{t('Save fixture')}</Button><Button variant="ghost" disabled={disabled} type="button" onClick={() => setEditing(false)}>{t('Cancel')}</Button></div>
    </form> : <>
      <div><strong>{item.displayName}</strong><p>{item.requiredViews.map(view => t(view.instructions ?? view.key.replaceAll('_', ' '))).join(' ')}</p></div>
      <StatusBadge status={item.status} />
      <Button type="button" variant="ghost" disabled={disabled} onClick={() => { setName(item.displayName); setStatus(item.status); setEditing(true); }} aria-label={t('Edit {name}', { name: item.displayName })}><Pencil size={15} />{t('Edit')}</Button>
    </>}
  </li>;
}

export default function AreaTemplateForm({ locationId, areaId, close, created }: {
  locationId: number; areaId?: number; close: () => void; created: (id: number) => void;
}) {
  const t = useSetupFormText(), qc = useQueryClient();
  const query = useArea(areaId ?? 0), area = query.data;
  const [name, setName] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<keyof typeof roomPresets>('WASHROOM');
  const [counts, setCounts] = useState<Record<FixtureType, number>>({ ...roomPresets.WASHROOM.defaults });
  const [addType, setAddType] = useState<FixtureType>('INDIAN_TOILET'), [addCount, setAddCount] = useState(1);
  const [adding, setAdding] = useState(false), [busy, setBusy] = useState(false), [archive, setArchive] = useState(false);
  const [error, setError] = useState(''), [success, setSuccess] = useState('');
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const items = (area?.items ?? []).filter(item => item.status !== 'RETIRED').sort((a, b) => a.sequence - b.sequence);
  const [uncertain, setUncertain] = useState(false);
  const inFlight = useRef(false);
  const disabled = busy || uncertain || area?.status === 'ARCHIVED';
  async function mutate(work: () => Promise<unknown>, message: string) {
    if (inFlight.current) return false;
    inFlight.current = true; setBusy(true); setError(''); setSuccess('');
    try { await work(); setSuccess(message); await invalidateWorkspace(qc).catch(() => undefined); return true; }
    catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (!areaId && (!status || status >= 500)) {
        setUncertain(true); setError('Area creation could not be confirmed. Close and check the area list before trying again.');
      } else setError(setupErrorKey(err, 'Could not save the area template. Check the fields and try again.'));
      if (status === 409) {
        const refreshed = await query.refetch();
        setError(refreshed.isError ? 'The template could not refresh. Your edits are preserved. Retry loading it.' : 'The template was refreshed. Your edits are preserved; review them and save again.');
      }
      return false;
    } finally { inFlight.current = false; setBusy(false); }
  }
  async function save() {
    const value = (name ?? area?.name ?? '').trim();
    if (!value || disabled || (area && area.locationId !== locationId)) return;
    if (areaId && area) {
      await mutate(() => editArea(area.id, { name: value, layoutInstructions: instructions ?? area.layoutInstructions ?? '', expectedInventoryVersion: area.inventoryVersion }), 'Area template saved.');
    } else if (total > 0 && total <= 200) {
      let id: number | undefined;
      const ok = await mutate(async () => { const result = await createArea(locationId, { name: value, roomType, layoutInstructions: instructions ?? '', counts: roomPresets[roomType].fixtureTypes.map(fixtureType => ({fixtureType, count: counts[fixtureType]})).filter(row => row.count > 0) }); id = result.id; }, 'Area template created.');
      if (ok && id) created(id);
    }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) close(); }}><DialogContent className="setup-form-dialog area-template-editor" showCloseButton={!busy} aria-busy={busy} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} onPointerDownOutside={event => { if (busy) event.preventDefault(); }}>
    <DialogHeader><DialogTitle>{t(areaId ? 'Edit area template' : 'Prepare area template')}</DialogTitle><DialogDescription>{t('Name the area and choose what staff need to clean.')}</DialogDescription></DialogHeader>
    <div className="space-y-5">
      {areaId && query.isPending ? <p role="status">{t('Loading area template…')}</p> : areaId && (query.isError || !area || area.locationId !== locationId) ? <div role="alert"><p>{t('Area template could not be loaded.')}</p><Button type="button" variant="outline" onClick={() => void query.refetch()}>{t('Retry')}</Button></div> : <>
        {error && <p id="area-template-error" role="alert" className="setup-form-error">{t(error)}</p>}
        {uncertain && <Button type="button" variant="outline" onClick={close}>{t('Close and check areas')}</Button>}
        {success && <p role="status" className="ops-save-result">{t(success)}</p>}
        <form className="space-y-4" aria-describedby={error ? "area-template-error" : undefined} onSubmit={event => { event.preventDefault(); void save(); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">{t('Area name')}<Input autoFocus aria-label={t('Area name')} aria-describedby={error ? 'area-template-error' : undefined} value={name ?? area?.name ?? ''} disabled={disabled} maxLength={100} placeholder={t('East washroom')} onChange={event => setName(event.target.value)} /></label>
            {!areaId && <label className="space-y-2 text-sm font-medium">{t('Area type')}<select aria-label={t('Area type')} disabled={disabled} value={roomType} onChange={event => { const preset = event.target.value as keyof typeof roomPresets; setRoomType(preset); setCounts({...roomPresets[preset].defaults}); }}><option value="WASHROOM">{t('Washroom')}</option><option value="GENERAL">{t('General room')}</option></select></label>}
          </div>
          <label className="block space-y-2 text-sm font-medium">{t('Cleaning instructions (optional)')}<Textarea disabled={disabled} value={instructions ?? area?.layoutInstructions ?? ''} onChange={event => setInstructions(event.target.value)} /></label>
          {!areaId && <fieldset disabled={disabled}><legend className="mb-3 text-sm font-semibold">{t('Fixtures')}</legend><div className="area-template-counts">{roomPresets[roomType].fixtureTypes.map(type => <label key={type}>{t(fixtureNames[type])}<Input aria-label={t(fixtureNames[type])} type="number" min={0} max={200} value={counts[type]} onChange={event => setCounts({...counts, [type]: Math.max(0, Math.min(200, Math.floor(Number(event.target.value) || 0)))})} /></label>)}</div><p className="mt-3 text-sm text-muted-foreground">{t('{count} fixtures selected', {count: total})}</p>{total > 200 && <p role="alert">{t('Choose at most 200 fixtures.')}</p>}</fieldset>}
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={disabled || !(name ?? area?.name ?? '').trim() || (!areaId && (total < 1 || total > 200))}>{t(busy ? 'Saving…' : areaId ? 'Save changes' : 'Create area template')}</Button>
            {area?.status === 'DRAFT' && <Button type="button" variant="outline" disabled={busy || !items.length} onClick={() => void mutate(() => editArea(area.id, {status: 'ACTIVE', expectedInventoryVersion: area.inventoryVersion}), 'Area template activated.')}>{t('Activate area')}</Button>}
          </div>
        </form>
        {area && <>
          <div className="flex flex-wrap items-center justify-between gap-3"><h4 className="font-semibold">{t('Fixtures')}</h4><Button type="button" variant="outline" disabled={disabled || items.length >= 200} aria-expanded={adding} onClick={() => setAdding(!adding)}><Plus size={15} />{t('Add fixtures')}</Button></div>
          {adding && <form className="area-template-add" onSubmit={event => { event.preventDefault(); if (!Number.isSafeInteger(addCount) || addCount < 1 || items.length + addCount > 200) return; void mutate(() => addItems(area.id, [{fixtureType: addType, count: addCount}], area.inventoryVersion), 'Fixtures added.').then(ok => { if (ok) setAdding(false); }); }}>
            <label>{t('Fixture type')}<select aria-label={t('Fixture type')} value={addType} disabled={disabled} onChange={event => setAddType(event.target.value as FixtureType)}>{setupFixtureTypes.map(type => <option value={type} key={type}>{t(fixtureNames[type])}</option>)}</select></label>
            <label>{t('Count')}<Input type="number" min={1} max={200 - items.length} value={addCount} disabled={disabled} onChange={event => setAddCount(Number(event.target.value))} /></label>
            <Button type="submit" disabled={disabled || !Number.isSafeInteger(addCount) || addCount < 1 || items.length + addCount > 200}>{t('Add fixtures')}</Button><Button type="button" variant="ghost" disabled={busy} onClick={() => setAdding(false)}>{t('Cancel')}</Button>
          </form>}
          <ul className="area-template-fixtures">{items.map(item => <FixtureRow key={item.id} item={item} disabled={disabled} save={item => mutate(() => editItem(area.id, item.id, itemEditPayload(item, area.inventoryVersion)), 'Fixture saved.')} />)}</ul>
          <p className="text-sm text-muted-foreground">{t('Template changes apply to future tasks. Existing tasks keep their required photos.')}</p>
          {area.status !== 'ARCHIVED' && <div className="border-t border-border pt-4">{archive ? <div className="space-y-3"><p>{t('Archive this template? It will no longer be available for new schedules. Existing tasks and evidence stay saved.')}</p><div className="flex flex-wrap gap-2"><Button type="button" disabled={busy} onClick={() => void mutate(() => archiveArea(area.id, area.inventoryVersion), 'Area template archived.').then(ok => {if (ok) setArchive(false);})}>{t('Confirm archive')}</Button><Button type="button" variant="ghost" disabled={busy} onClick={() => setArchive(false)}>{t('Cancel')}</Button></div></div> : <Button type="button" variant="ghost" disabled={busy} onClick={() => setArchive(true)}>{t('Archive template')}</Button>}</div>}
        </>}
      </>}
    </div>
  </DialogContent></Dialog>;
}
