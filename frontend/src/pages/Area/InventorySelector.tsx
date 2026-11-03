import type { Area, InventorySelection } from './types';
import { useSetupFormText } from './areaFormText';
import './setup-forms.css';

export default function InventorySelector({ area, mode, selected, onChange, id = 'inventory-mode' }: {
  id?: string; area: Area; mode: 'ALL' | 'SUBSET'; selected: InventorySelection[];
  onChange: (mode: 'ALL' | 'SUBSET', selected: InventorySelection[]) => void;
}) {
  const t = useSetupFormText();
  return <section className="setup-inventory-selector space-y-3">
    <label className="block text-sm font-medium" htmlFor={id}>{t('Required inventory')}</label>
    <select id={id} value={mode} aria-describedby={id + '-help'} onChange={event => onChange(event.target.value as 'ALL' | 'SUBSET', [])}>
      <option value="ALL">{t('All active items')}</option><option value="SUBSET">{t('Choose items for this task')}</option>
    </select>
    <p id={id + '-help'} className="setup-form-help">{t('Changes apply to future tasks. Each generated task keeps its original requirements.')}</p>
    <div>{area.items.filter(item => item.status === 'ACTIVE').sort((a, b) => a.sequence - b.sequence || a.id - b.id).map(item => {
      const row = selected.find(value => value.areaItemId === item.id), checked = mode === 'ALL' || !!row;
      return <div key={item.id} className="setup-inventory-item">
        <label><input type="checkbox" checked={checked} disabled={mode === 'ALL'} aria-label={t('Include {name}', { name: item.displayName })} onChange={event => onChange(mode, event.target.checked ? [...selected, { areaItemId: item.id, mandatory: true }] : selected.filter(value => value.areaItemId !== item.id))} /><span><bdi>{item.displayName}</bdi>{item.positionHint ? <small><bdi>{item.positionHint}</bdi></small> : null}</span></label>
        {checked && <label className="setup-mandatory-choice"><input type="checkbox" checked={row?.mandatory !== false} aria-label={t('Mandatory: {name}', { name: item.displayName })} onChange={event => onChange(mode, [...selected.filter(value => value.areaItemId !== item.id), { areaItemId: item.id, mandatory: event.target.checked }])} />{t('Mandatory')}</label>}
      </div>;
    })}</div>
  </section>;
}
