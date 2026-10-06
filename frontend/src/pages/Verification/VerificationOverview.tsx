import { Link } from 'react-router-dom';
import { verificationLabel } from './presentation';
import type { StaffStatusEntry } from '../Manager/types';
export default function VerificationOverview({entries}:{entries:StaffStatusEntry[]}){
 const tasks=entries.flatMap(e=>e.tasks).filter(t=>t.verificationVersion===2);
 if(!tasks.length)return null;
 const groups=new Map<string,typeof tasks>();for(const task of tasks){const label=verificationLabel(task);groups.set(label,[...groups.get(label)??[],task]);}
 return <section className="space-y-3 rounded-xl border border-border bg-card p-5" aria-label="Inventory verification"><div className="flex justify-between gap-3"><h2 className="font-semibold">Room verification</h2><Link className="text-sm text-primary" to="/exceptions">Exception inbox</Link></div><div className="flex flex-wrap gap-3">{[...groups].map(([label,rows])=><details key={label} className="text-sm"><summary className="min-h-11 cursor-pointer rounded-lg bg-muted px-3 py-3">{rows.length} · {label}</summary><ul className="space-y-2 p-3">{rows.map(t=><li key={t.id}><Link className="text-primary underline" to={`/verification/${t.id}`}>{t.areaNameSnapshot??t.title}</Link></li>)}</ul></details>)}</div></section>;
}
