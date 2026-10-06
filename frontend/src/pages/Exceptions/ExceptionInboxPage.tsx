import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useGetLocations } from '../Location/queries';
import { useAreas } from '../Area/queries';
import { useExceptions } from './queries';
import { exceptionStateLabel, plainReason } from '../Verification/presentation';
import type { ExceptionFilters } from './types';
const filterKeys=['locationId','areaId','workerId','reasonCode','priority','state'] as const;
export default function ExceptionInboxPage(){
 const [params,setParams]=useSearchParams();const filters:ExceptionFilters=Object.fromEntries(filterKeys.map(key=>[key,params.get(key)||undefined]));
 const query=useExceptions(filters);const locations=useGetLocations();const areas=useAreas(Number(filters.locationId));
 function filter(key:string,value:string){setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set(key,value);else next.delete(key);if(key==='locationId')next.delete('areaId');return next;});}
 const rows=query.data?.pages.flatMap(p=>p.cases)??[];
 const field='min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm';
 return <div className="space-y-6"><PageHeader title="Exception inbox" subtitle="One case per task. Review the affected items and keep the team moving."/>
 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
 <label className="space-y-1 text-sm">Location<select aria-label="Location" className={field} value={filters.locationId??''} onChange={e=>filter('locationId',e.target.value)}><option value="">All locations</option>{(locations.data?.data??[]).map((l:{id:number;name:string})=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
 <label className="space-y-1 text-sm">Area<select aria-label="Area" className={field} value={filters.areaId??''} onChange={e=>filter('areaId',e.target.value)}><option value="">All areas</option>{areas.data?.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
 <label className="space-y-1 text-sm">State<select aria-label="State" className={field} value={filters.state??''} onChange={e=>filter('state',e.target.value)}><option value="">All states</option>{['MANAGER_REVIEW','STAFF_ACTION_REQUIRED','WAITING_SERVICE','RESOLVED'].map(s=><option key={s} value={s}>{exceptionStateLabel(s)}</option>)}</select></label>
 <label className="space-y-1 text-sm">Priority<select aria-label="Priority" className={field} value={filters.priority??''} onChange={e=>filter('priority',e.target.value)}><option value="">All priorities</option>{[5,4,3,2,1,0].map(p=><option key={p} value={p}>Priority {p}</option>)}</select></label>
 <label className="space-y-1 text-sm">Reason<select aria-label="Reason" className={field} value={filters.reasonCode??''} onChange={e=>filter('reasonCode',e.target.value)}><option value="">All reasons</option>{['CLEANING_REQUIRED','CANNOT_ASSESS','WRONG_ITEM','MISSING_SURFACE','PRIVACY_HOLD','GPS_UNCERTAIN','CONTEXT_UNCERTAIN','DAMAGED','INACCESSIBLE','OCCUPIED','SERVICE_FAILURE','MISSING_EVIDENCE','DUPLICATE_EVIDENCE','SETUP_REQUIRED'].map(s=><option key={s} value={s}>{plainReason(s)}</option>)}</select></label>
 <label className="space-y-1 text-sm">Worker ID<input aria-label="Worker ID" className={field} type="number" min="1" value={filters.workerId??''} onChange={e=>filter('workerId',e.target.value)} placeholder="All workers"/></label>
 </div>
 <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{query.data?.pages[0].total??rows.length} cases · {query.data?.pages[0].unreadCount??0} unread needing manager</p><Button variant="outline" onClick={()=>setParams({})}>Clear filters</Button></div>
 {query.isPending?<p role="status">Loading cases…</p>:query.isError?<div role="alert">Could not load cases. <Button variant="outline" onClick={()=>void query.refetch()}>Retry</Button></div>:!rows.length?<p className="rounded-xl border border-border p-8">No cases match these filters.</p>:<div className="divide-y divide-border rounded-xl border border-border bg-card">{rows.map(c=><Link to={`/exceptions/${c.id}`} key={c.id} className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary"><div className="min-w-0 flex-1"><div className="flex gap-2"><span className="font-semibold">{c.area?.name??c.task?.areaNameSnapshot??'Area setup'}</span>{c.unread?<span className="rounded bg-primary/10 px-2 text-xs font-semibold text-primary">Unread</span>:null}</div><p className="text-sm">{c.task?.title??'Inventory setup needed'}</p><p className="mt-1 text-xs text-muted-foreground">{c.location?.name} · {c.task?.staff?.name??'Unassigned'} · {c.issues.filter(i=>i.state!=='RESOLVED').length} open issues</p></div><div className="text-right text-sm"><p>{exceptionStateLabel(c.state)} · Priority {c.priority}</p>{c.task?.shiftEnd?<p className="text-xs text-muted-foreground">Due {new Date(c.task.shiftEnd).toLocaleString(undefined,{timeZone:c.location?.timezone})}</p>:null}</div></Link>)}</div>}
 {query.hasNextPage?<Button disabled={query.isFetchingNextPage} onClick={()=>void query.fetchNextPage()}>Load more cases</Button>:null}
 </div>;
}
