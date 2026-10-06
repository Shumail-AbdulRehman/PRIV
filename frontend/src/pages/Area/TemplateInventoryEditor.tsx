import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { invalidateWorkspace } from '@/lib/invalidateWorkspace';
import { useArea } from './queries';
import { apiMessage, mapTemplate } from './api';
import InventorySelector from './InventorySelector';
import { inventorySummary, validateInventorySelection, type InventorySelection } from './types';

export default function TemplateInventoryEditor({ templateId, areaId }: { templateId: number; areaId: number }) {
  const query = useArea(areaId), qc = useQueryClient();
  const [draft, setDraft] = useState<{mode:'ALL'|'SUBSET';items:InventorySelection[]} | null>(null);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const area = query.data;
  const template = area?.templates?.find(row => row.id === templateId);
  const mode = draft?.mode ?? template?.inventorySelection ?? 'ALL';
  const items = draft?.items ?? template?.inventoryItems ?? [];
  async function save() {
    if (!area || !draft || busy) return;
    const problem = validateInventorySelection(area, mode, items);
    if (problem) { setMessage(problem); return; }
    setBusy(true); setMessage('');
    try {
      await mapTemplate(templateId, {areaId, inventorySelection:mode,selectedItems:items,expectedInventoryVersion:area.inventoryVersion});
      await invalidateWorkspace(qc); setDraft(null); setMessage('Future inventory saved. Current tasks retain their requirements.');
    } catch (error) {
      setMessage(apiMessage(error));
      if ((error as {response?:{status?:number}}).response?.status === 409) {
        await query.refetch(); setMessage(`${apiMessage(error)} Inventory refreshed. Review your preserved selection before retrying.`);
      }
    } finally { setBusy(false); }
  }
  if (query.isPending) return <p role="status">Loading saved inventory…</p>;
  if (query.isError || !area || !template) return <div role="alert"><p>Saved inventory could not be loaded.</p><Button variant="outline" onClick={() => void query.refetch()}>Retry inventory</Button></div>;
  const summary = inventorySummary(area,mode,items);
  const problem = validateInventorySelection(area,mode,items);
  return <section className="space-y-3 border-t border-border pt-4">
    <h3 className="text-sm font-semibold">Future inventory: {area.name}</h3>
    <fieldset disabled={busy || area.status !== 'ACTIVE'}><InventorySelector id={`template-inventory-${templateId}`} area={area} mode={mode} selected={items} onChange={(mode,items) => setDraft({mode,items})}/></fieldset>
    <p className="text-sm">{summary.mandatory} mandatory fixtures, {summary.optional} optional fixtures, {summary.requiredViews} required photos.</p>
    {problem && <p role="alert" className="text-sm">{problem}</p>}
    {message && <p role="status" className="text-sm">{message}</p>}
    <Button variant="outline" disabled={!draft || busy || !!problem || area.status !== 'ACTIVE'} onClick={() => void save()}>{busy ? 'Saving inventory…' : 'Save future inventory'}</Button>
  </section>;
}
