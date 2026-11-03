import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { invalidateWorkspace } from '@/lib/invalidateWorkspace';
import { useArea } from './queries';
import { mapTemplate } from './api';
import InventorySelector from './InventorySelector';
import { inventorySummary, validateInventorySelection, type InventorySelection } from './types';
import { setupErrorKey, useSetupFormText } from './areaFormText';

export default function TemplateInventoryEditor({ templateId, areaId }: { templateId: number; areaId: number }) {
  const t = useSetupFormText(), query = useArea(areaId), qc = useQueryClient();
  const [draft, setDraft] = useState<{ mode: 'ALL' | 'SUBSET'; items: InventorySelection[] } | null>(null);
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const inFlight = useRef(false);
  const area = query.data, template = area?.templates?.find(row => row.id === templateId);
  const mode = draft?.mode ?? template?.inventorySelection ?? 'ALL', items = draft?.items ?? template?.inventoryItems ?? [];
  async function save() {
    if (!area || !draft || inFlight.current || area.status !== 'ACTIVE') return;
    const problem = validateInventorySelection(area, mode, items);
    if (problem) { setNotice({ error: true, text: problem }); return; }
    inFlight.current = true; setBusy(true); setNotice(null);
    let saved = false;
    try {
      await mapTemplate(templateId, { areaId, inventorySelection: mode, selectedItems: items, expectedInventoryVersion: area.inventoryVersion });
      saved = true;
      await invalidateWorkspace(qc);
      setDraft(null); setNotice({ error: false, text: 'Future inventory saved. Current tasks retain their requirements.' });
    } catch (error) {
      if (saved) setNotice({ error: false, text: 'Inventory saved, but the latest view could not refresh. Reload to see saved requirements.' });
      else {
        setNotice({ error: true, text: setupErrorKey(error, 'Could not save inventory. Check your connection and try again.') });
        if ((error as { response?: { status?: number } }).response?.status === 409) {
          const refreshed = await query.refetch();
          setNotice({ error: true, text: refreshed.isError ? 'Inventory could not refresh. Your draft is preserved. Retry loading areas.' : 'The saved inventory changed elsewhere. Review your preserved selection before retrying.' });
        }
      }
    } finally { inFlight.current = false; setBusy(false); }
  }
  if (query.isPending) return <p role="status">{t('Loading saved inventory…')}</p>;
  if (!area || !template) return <div role="alert"><p>{t('Saved inventory could not be loaded.')}</p><Button type="button" variant="outline" onClick={() => void query.refetch()}>{t('Retry inventory')}</Button></div>;
  const summary = inventorySummary(area, mode, items), problem = validateInventorySelection(area, mode, items);
  return <section className="setup-inventory-editor" aria-label={t('Future inventory: {name}', { name: area.name })} aria-busy={busy}>
    <h3 className="text-sm font-semibold">{t('Future inventory: {name}', { name: area.name })}</h3>
    {query.isError && <div role="alert"><p>{t('Saved inventory could not be loaded.')}</p><Button type="button" variant="outline" onClick={() => void query.refetch()}>{t('Retry inventory')}</Button></div>}
    <fieldset disabled={busy || query.isError || area.status !== 'ACTIVE'}><InventorySelector id={`template-inventory-${templateId}`} area={area} mode={mode} selected={items} onChange={(mode, items) => { setDraft({ mode, items }); setNotice(null); }} /></fieldset>
    <p className="text-sm">{t('{mandatory} mandatory fixtures, {optional} optional fixtures, {photos} required photos.', { ...summary, photos: summary.requiredViews })}</p>
    {problem && <p role="alert" className="setup-form-error">{t(problem)}</p>}
    {notice && <p role={notice.error ? 'alert' : 'status'} className={notice.error ? 'setup-form-error' : undefined}>{t(notice.text)}</p>}
    <Button type="button" variant="outline" disabled={!draft || busy || query.isError || !!problem || area.status !== 'ACTIVE'} onClick={() => void save()}>{t(busy ? 'Saving inventory…' : 'Save future inventory')}</Button>
  </section>;
}
