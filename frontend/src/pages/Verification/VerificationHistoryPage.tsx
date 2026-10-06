import { Link,useParams } from 'react-router-dom';
import { useInfiniteQuery,useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { getVerification,getVerificationHistory } from './api';
import ProtectedEvidence from './ProtectedEvidence';
import { plainReason,timingLabel,verificationLabel } from './presentation';
import { client } from '@/api/client';
import AreaSubmissionsPanel from '../Task/components/AreaSubmissionsPanel';
export default function VerificationHistoryPage(){
 const id=Number(useParams().id);
 const task=useQuery({queryKey:['verification-task',id],queryFn:async()=>(await client.get<{data:{verificationVersion:number;title:string}}>(`/task-instance/${id}`)).data.data,enabled:id>0});
 const modern=task.data?.verificationVersion===2;
 const manifest=useQuery({queryKey:['verification',id],queryFn:()=>getVerification(id),enabled:modern});
 const history=useInfiniteQuery({queryKey:['verification-history',id],queryFn:({pageParam})=>getVerificationHistory(id,pageParam),initialPageParam:undefined as string|undefined,getNextPageParam:page=>page.nextCursor??undefined,enabled:modern});
 if(task.isPending)return <p role="status">Loading task…</p>;
 if(task.isError)return <p role="alert">Task unavailable. Check your location access.</p>;
 if(!modern)return <div className="space-y-5"><PageHeader title={task.data?.title??'Task history'} subtitle="Previous verification system"/><AreaSubmissionsPanel taskInstanceId={id}/></div>;
 const data=manifest.data;
 return <div className="space-y-6"><PageHeader title={data?.task.title??'Verification history'} subtitle={data?`${data.area.name} · ${verificationLabel(data.task)}`:'Loading requirements…'}/>{data?<><p className="text-sm">{timingLabel(data.task.completionTiming)} · Original deadline: {new Date(data.task.shiftEnd).toLocaleString(undefined,{timeZone:data.task.location?.timezone})}</p>{data.exceptions.map(c=><Link key={c.id} className="text-primary" to={`/exceptions/${c.id}`}>Open manager case</Link>)}<div className="divide-y divide-border rounded-xl border border-border">{data.items.map(item=><section key={item.id} className="p-5"><h2 className="font-semibold">{item.nameSnapshot}</h2>{item.requirements.map(r=><p key={r.id} className="mt-2 text-sm">{r.instructionsSnapshot} · {plainReason(r.state)}{r.mandatory?'':' · Optional'}</p>)}</section>)}</div></>:null}
 <h2 className="text-lg font-semibold">Photo attempts</h2>{history.data?.pages.flatMap(p=>p.attempts).map(a=><section key={a.id} className="space-y-3 border-b border-border pb-5"><p className="font-medium">{a.requirement?.item.nameSnapshot??'Room context'} · {plainReason(a.requirement?.viewKey??a.contextKey??'Photo')}</p><p className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleString()} · {a.staff?.name} · {plainReason(a.state)}</p>{a.instructions?<p className="text-sm">{a.instructions}</p>:null}{a.mediaAssetId?<ProtectedEvidence assetId={a.mediaAssetId} privacyState={a.privacyState}/>:<p className="text-sm">Photo unavailable for routine review.</p>}</section>)}
 {manifest.isError||history.isError?<div role="alert">History could not load. <Button onClick={()=>{void manifest.refetch();void history.refetch();}}>Retry</Button></div>:null}{history.hasNextPage?<Button variant="outline" disabled={history.isFetchingNextPage} onClick={()=>void history.fetchNextPage()}>Load older attempts</Button>:null}
 </div>;
}
