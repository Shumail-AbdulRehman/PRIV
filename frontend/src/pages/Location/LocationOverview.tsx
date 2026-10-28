import { Link } from 'react-router-dom';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAreas } from '../Area/queries';
import type { OperationOverview } from '../Manager/operations';
import { dailyLink, reviewLink } from '../Manager/operations';
import OperationsState from '../Manager/OperationsState';
import AttentionList from '@/components/common/AttentionList';
import { Button } from '@/components/ui/button';
import { useLocationLanguage } from './locationTranslations';
import type { LocationStaff } from './types';
import { formatInTimeZone } from 'date-fns-tz';

export default function LocationOverview({location,onTab,overview}:{
 location:{id:number;timezone:string;radiusMeters:number;staff:LocationStaff[]};
 onTab:(tab:'areas'|'staff')=>void;
 overview:UseQueryResult<OperationOverview,Error>;
}) {
 const {t}=useLocationLanguage();
 const areas=useAreas(location.id);
 const params=new URLSearchParams({locationId:String(location.id),date:'today'});
 const facts=overview.isError?undefined:overview.data;
 const metrics=facts?.metrics;
 const activeAreas=areas.isError?undefined:areas.data?.filter(area=>area.status!=='ARCHIVED').length;
 const shifts=[...new Set(location.staff.filter(person=>person.isActive&&person.shiftStart&&person.shiftEnd).map(person=>formatInTimeZone(new Date(person.shiftStart!),location.timezone,'HH:mm')+'–'+formatInTimeZone(new Date(person.shiftEnd!),location.timezone,'HH:mm')))];
 return <div className="location-overview-v5">
  <OperationsState loading={overview.isPending} skeleton="metrics" error={overview.error} retry={()=>void overview.refetch()}/>
  {metrics&&facts?<section className="location-metrics-v5" aria-label={t('Daily summary')}>
   <Link to={dailyLink(params,{tab:'staff'})}><span>{t('Staff today')}</span><strong>{metrics.scheduled}</strong><p>{t('{present} checked in · {missing} not checked in',{present:metrics.present,missing:Math.max(0,metrics.scheduled-metrics.present)})}</p><small>{t('Site-local day')}</small></Link>
   <Link to={dailyLink(params,{tab:'tasks'})}><span>{t('Tasks submitted')}</span><strong dir="ltr">{metrics.submitted}<small> / {metrics.totalTasks}</small></strong><p>{t('{progress} in progress · {overdue} overdue',{progress:facts.chart.inProgress,overdue:facts.chart.overdue})}</p><small>{t('Submission is not verification')}</small></Link>
   <Link to={reviewLink(params)}><span>{t('Photo reviews')}</span><strong>{metrics.reviewCount}</strong><p>{t('Waiting for a decision')}</p><small>{t('View reviews')}</small></Link>
   <button type="button" onClick={()=>onTab('areas')}><span>{t('Area templates')}</span><strong>{activeAreas??'—'}</strong><p>{t(areas.isError?'Area templates are unavailable.':'Reusable cleaning requirements')}</p><small>{t('Immutable task snapshots')}</small></button>
  </section>:null}
  {areas.isError?<OperationsState error={areas.error} retry={()=>void areas.refetch()}/>:null}
  <div className="location-details-grid-v5">
   {facts?<div className="location-attention-v5"><div className="location-attention-heading"><h2>{t('Today at this location')}</h2><p>{t('Start with the exceptions, then check the schedule.')}</p></div><AttentionList data={facts} params={params} limit={3}/></div>:null}
   <section className="ops-panel location-facts-v5"><div className="ops-panel-heading"><div><h2>{t('Location details')}</h2><p>{t('The facts used by attendance and scheduling.')}</p></div></div><div className="location-facts-body"><dl>
    <div><dt>{t('Timezone')}</dt><dd><bdi>{location.timezone}</bdi></dd></div>
    <div><dt>{t('Check-in radius')}</dt><dd><bdi>{location.radiusMeters} m</bdi></dd></div>
    <div><dt>{t('Staff shifts')}</dt><dd>{shifts.length===1?<bdi>{shifts[0]}</bdi>:t(shifts.length?'Shift times vary by worker':'No shift configured')}</dd></div>
   </dl><p>{t('Attendance uses the saved geofence and reported device location.')}</p><Button variant="ghost" onClick={()=>onTab('staff')}>{t('Open team and shifts')}</Button></div></section>
  </div>
 </div>;
}
