import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Building2, Check, ChevronDown, CircleHelp, RefreshCw, SlidersHorizontal, TrendingUp, Users, ClipboardCheck, Camera } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RootState } from '@/store/store';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import ScopeFilters from '@/components/common/ScopeFilters';
import OperationsState from '../Manager/OperationsState';
import { dailyLink, localTime, scopeParams } from '../Manager/operations';
import { useCompanyPerformance, statusLabel } from './performance';
import './performance.css';

const palette={attendance:'#217c70',submission:'#7398c3',progress:'#dfb56c',overdue:'#d47b72',pending:'#d7e2e4'};
const statusTone={ATTENTION:'attention',IN_PROGRESS:'progress',ON_TRACK:'success',NO_ACTIVITY:'neutral'};
function Delta({value}:{value:number|null}){
  const {t}=useLanguage();
  if(value===null)return <span className="perf-delta is-neutral">{t('No previous data')}</span>;
  const Icon=value>0?ArrowUpRight:value<0?ArrowDownRight:Activity;
  return <span className={`perf-delta ${value<0?'is-down':value===0?'is-neutral':''}`}><Icon size={13}/>{value>0?'+':''}{value} {t('pp vs previous period')}</span>;
}
function NoChart({message}:{message:string}){const {t}=useLanguage();return <div className="perf-chart-empty"><Activity size={27} strokeWidth={1.3}/><strong>{t(message)}</strong><span>{t('Charts will appear when scheduled work is recorded.')}</span></div>;}

export default function DashboardPage(){
  const {t,language}=useLanguage(), owner=useSelector((s:RootState)=>s.auth.user?.role==='ADMIN');
  const [params,setParams]=useSearchParams();
  const period=params.get('period')==='30'?'30':'7';
  const query=useCompanyPerformance({...scopeParams(params),period}), data=query.data;
  const [siteMetric,setSiteMetric]=useState<'attendanceRate'|'submissionRate'>('attendanceRate');
  const [search,setSearch]=useState(''),[sort,setSort]=useState('name');
  const percent=(value:number|null)=>value===null?'—':`${value.toLocaleString(language==='ur'?'ur-PK':'en-PK',{maximumFractionDigits:1})}%`;
  const shortDate=(value:string|null,month=true)=>value?new Intl.DateTimeFormat(language==='ur'?'ur-PK':'en-GB',{day:'numeric',...(month?{month:'short' as const}:{})}).format(new Date(`${value}T12:00:00Z`)):'—';
  const changePeriod=(value:string)=>setParams(previous=>{const next=new URLSearchParams(previous);next.set('period',value);return next;});
  const summary=data?.summary;
  const distribution=summary?[
    {name:t('Work submitted'),value:summary.submitted,color:palette.attendance},
    {name:t('In progress'),value:summary.inProgress,color:palette.submission},
    {name:t('Not started'),value:summary.notStarted,color:palette.progress},
    {name:t('Overdue'),value:summary.overdue,color:palette.overdue},
  ]:[];
  const filtered=data?.sites.filter(site=>site.location.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())).sort((a,b)=>sort==='name'?a.location.name.localeCompare(b.location.name):sort==='attendance'?(b.attendanceRate??-1)-(a.attendanceRate??-1):sort==='submission'?(b.submissionRate??-1)-(a.submissionRate??-1):b.today.overdue+b.today.missing+b.today.reviews-(a.today.overdue+a.today.missing+a.today.reviews))??[];
  const chartSites=data?.sites.map(site=>({name:site.location.name,value:site[siteMetric]??0,rateLabel:site[siteMetric]===null?t('No data'):percent(site[siteMetric])}))??[];
  return <div className="ops-page performance-page">
    <header className="ops-header perf-header">
      <div><span className="ops-eyebrow"><TrendingUp size={14}/>{t(owner?'Across your company':'Your assigned locations')}</span><h1>{t(owner?'Company performance':'Location performance')}</h1><p>{t('The big picture. Attendance, work and every location, together.')}</p></div>
      <ScopeFilters locations={data?.locations??[]}/>
    </header>
    <div className="perf-toolbar"><div className="perf-period" role="group" aria-label={t('Reporting period')}>
      <button type="button" aria-pressed={period==='7'} onClick={()=>changePeriod('7')}>{t('Last 7 days')}</button>
      <button type="button" aria-pressed={period==='30'} onClick={()=>changePeriod('30')}>{t('Last 30 days')}</button>
    </div><span className="perf-range"><span className="perf-live-dot"/>{data?`${shortDate(data.dateFrom)} – ${shortDate(data.dateTo)}`:t('Loading performance…')}</span>
      <Button variant="ghost" disabled={query.isFetching} onClick={()=>void query.refetch()} aria-label={t('Refresh performance')}><RefreshCw size={15} className={query.isFetching?'animate-spin':''}/><span>{t('Refresh')}</span></Button>
    </div>
    <OperationsState loading={query.isPending} layout="owner-overview" error={query.error} retry={()=>void query.refetch()}/>
    {data&&!query.isError&&summary?<>
      {!data.sites.length?<section className="perf-empty-workspace"><Building2 size={36} strokeWidth={1.3}/><h2>{t(owner?'Your company at a glance starts here':'No assigned locations yet')}</h2><p>{t(owner?'Add a location and schedule your team to see attendance and work performance.':'Ask your company owner to assign a location to your account.')}</p>{owner?<Button asChild><Link to="/locations">{t('Manage locations')}<ArrowRight size={15}/></Link></Button>:null}</section>:<>
      <section className="perf-metrics" aria-label={t('Performance summary')}>
        <article className="perf-metric"><div className="perf-metric-label"><span>{t('Attendance rate')}</span><Users size={17}/></div><strong>{percent(summary.attendanceRate)}</strong><p>{summary.present} / {summary.scheduledShifts} {t('scheduled shifts attended')}</p><Delta value={summary.attendanceChange}/></article>
        <article className="perf-metric"><div className="perf-metric-label"><span>{t('Work submission rate')}</span><ClipboardCheck size={17}/></div><strong>{percent(summary.submissionRate)}</strong><p>{summary.submitted} / {summary.tasks} {t('scheduled tasks submitted')}</p><Delta value={summary.submissionChange}/></article>
        <article className="perf-metric"><div className="perf-metric-label"><span>{t('Locations with activity')}</span><Building2 size={17}/></div><strong>{summary.activeLocations}<small> / {summary.totalLocations}</small></strong><p>{t('Locations with scheduled shifts or tasks')}</p><span className="perf-metric-note">{summary.totalStaff} {t('active team members')}</span></article>
        <article className="perf-metric"><div className="perf-metric-label"><span>{t('Awaiting a decision')}</span><Camera size={17}/></div><strong>{summary.reviews}</strong><p>{t('Open reviews for work in this period')}</p><Link className="perf-metric-note" to={'/exceptions?'+new URLSearchParams({...(params.get('locationId')?{locationId:params.get('locationId')!}:{}),period:'all'})}>{t('Open reviews')}<ArrowRight size={13}/></Link></article>
      </section>
      <div className="perf-main-grid">
        <section className="perf-panel perf-trend"><div className="perf-panel-heading"><div><span className="perf-kicker">{t('CONSISTENCY OVER TIME')}</span><h2>{t('How your operation is doing')}</h2><p>{t('Daily attendance and submitted work as a share of the schedule.')}</p></div><span className="perf-period-tag">{t(period==='7'?'7 days':'30 days')}</span></div>
          <div className="perf-legend"><span><i style={{background:palette.attendance}}/>{t('Attendance')}</span><span><i style={{background:palette.submission}}/>{t('Work submitted')}</span></div>
          {summary.scheduledShifts||summary.tasks?<div className="perf-trend-canvas" dir="ltr" role="img" aria-label={t('Daily attendance and work submission percentages')}>
            <ResponsiveContainer width="100%" height="100%"><ComposedChart data={data.series} margin={{top:12,right:12,bottom:0,left:-20}} accessibilityLayer>
              <CartesianGrid vertical={false} stroke="#e6eded" strokeDasharray="3 5"/>
              <XAxis dataKey="date" tickFormatter={value=>shortDate(String(value))} axisLine={false} tickLine={false} minTickGap={24} tick={{fill:'#718388',fontSize:11}} dy={10}/>
              <YAxis domain={[0,100]} ticks={[0,25,50,75,100]} tickFormatter={value=>`${value}%`} axisLine={false} tickLine={false} tick={{fill:'#718388',fontSize:11}}/>
              <Tooltip labelFormatter={value=>shortDate(String(value))} formatter={value=>`${value}%`} contentStyle={{border:'1px solid #dce5e4',borderRadius:8,fontSize:13}}/>
              <Area name={t('Attendance')} dataKey="attendanceRate" type="monotone" stroke={palette.attendance} strokeWidth={2.5} fill="#edf6f2" connectNulls={false} isAnimationActive={false} dot={{r:3,fill:palette.attendance,strokeWidth:0}} activeDot={{r:5}}/>
              <Line name={t('Work submitted')} dataKey="submissionRate" type="monotone" stroke={palette.submission} strokeWidth={2.5} strokeDasharray="5 4" connectNulls={false} dot={{r:3,fill:palette.submission,strokeWidth:0}} isAnimationActive={false}/>
            </ComposedChart></ResponsiveContainer>
          </div>:<NoChart message="No performance data in this period"/>}
          <div className="perf-chart-caption"><span><Check size={14}/>{summary.present} {t('checked-in shifts')}</span><span>{summary.submitted} {t('tasks submitted')}</span><span>{t('Gaps mean no scheduled records.')}</span></div>
          <details className="perf-data-disclosure"><summary>{t('View daily figures')}<ChevronDown size={13}/></summary><div className="perf-data-scroll" tabIndex={0}><table><thead><tr><th>{t('Date')}</th><th>{t('Attendance')}</th><th>{t('Work submitted')}</th></tr></thead><tbody>{data.series.map(point=><tr key={point.offset}><td>{shortDate(point.date)}</td><td>{point.present} / {point.scheduledShifts} ({percent(point.attendanceRate)})</td><td>{point.submitted} / {point.tasks} ({percent(point.submissionRate)})</td></tr>)}</tbody></table></div></details>
        </section>
        <section className="perf-panel perf-distribution"><div className="perf-panel-heading"><div><span className="perf-kicker">{t('THE WORK PICTURE')}</span><h2>{t('Where the work stands')}</h2><p>{t('All scheduled tasks in this period')}</p></div></div>
          {summary.tasks?<div className="perf-donut" dir="ltr"><ResponsiveContainer width="100%" height="100%"><PieChart accessibilityLayer><Pie data={distribution.filter(row=>row.value>0)} dataKey="value" nameKey="name" innerRadius="65%" outerRadius="85%" paddingAngle={3} stroke="none" isAnimationActive={false}>{distribution.filter(row=>row.value>0).map(row=><Cell key={row.name} fill={row.color}/>)}</Pie><Tooltip formatter={value=>[value,t('Tasks')]} contentStyle={{borderRadius:8,fontSize:13}}/></PieChart></ResponsiveContainer><div className="perf-donut-label"><strong>{summary.tasks}</strong><span>{t('scheduled tasks')}</span></div></div>:<NoChart message="No scheduled tasks"/>}
          <div className="perf-distribution-legend">{distribution.map(row=><div key={row.name}><span><i style={{background:row.color}}/>{row.name}</span><b>{row.value}</b><small>{summary.tasks?`${Math.round(row.value/summary.tasks*100)}%`:'—'}</small></div>)}</div>
          <p className="perf-verification"><Check size={14}/>{summary.verified} {t('verified')}<span>·</span>{summary.accepted} {t('accepted with exceptions')}</p>
        </section>
      </div>
      <section className="perf-panel perf-sites-chart"><div className="perf-panel-heading"><div><span className="perf-kicker">{t('SIDE BY SIDE')}</span><h2>{t('Location performance')}</h2><p>{t('Compare rates across every location in your scope.')}</p></div><div className="perf-switch" role="group" aria-label={t('Location comparison metric')}><button aria-pressed={siteMetric==='attendanceRate'} onClick={()=>setSiteMetric('attendanceRate')}>{t('Attendance')}</button><button aria-pressed={siteMetric==='submissionRate'} onClick={()=>setSiteMetric('submissionRate')}>{t('Work submitted')}</button></div></div>
        <div className="perf-site-bars" dir="ltr"><div style={{height:Math.max(160,chartSites.length*45+30)}} role="img" aria-label={t('Rates by location')}><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={chartSites} margin={{top:4,left:0,right:35,bottom:0}} accessibilityLayer>
          <CartesianGrid horizontal={false} stroke="#e6eded" strokeDasharray="3 5"/><XAxis type="number" domain={[0,100]} tickFormatter={value=>`${value}%`} axisLine={false} tickLine={false} tick={{fill:'#718388',fontSize:11}}/>
          <YAxis type="category" dataKey="name" width={135} axisLine={false} tickLine={false} tick={{fill:'#405a60',fontSize:12}} tickFormatter={value=>String(value).length>19?String(value).slice(0,18)+'…':String(value)}/>
          <Tooltip formatter={(_value,_name,item)=>[item.payload.rateLabel,t(siteMetric==='attendanceRate'?'Attendance':'Work submitted')]} cursor={{fill:'#f3f7f6'}} contentStyle={{borderRadius:8,fontSize:13}}/>
          <Bar dataKey="value" fill={siteMetric==='attendanceRate'?palette.attendance:palette.submission} radius={[0,4,4,0]} barSize={14} isAnimationActive={false} background={{fill:'#f0f5f3',radius:4}}><LabelList dataKey="rateLabel" position="right" style={{fontSize:10,fill:'#6d8980'}}/></Bar>
        </BarChart></ResponsiveContainer></div></div>
        <p className="perf-note">{t('Rates with no scheduled records are marked No data. Exact figures are listed below.')}</p>
      </section>
      <section className="perf-panel perf-location-panel"><div className="perf-panel-heading"><div><h2>{t('Every location, in focus')}</h2><p>{t('Period totals alongside the latest status on the selected day.')}</p></div><span className="perf-period-tag">{data.sites.length} {t('locations')}</span></div>
        <div className="perf-table-tools"><label><SlidersHorizontal size={15}/><input aria-label={t('Find a location')} placeholder={t('Find a location…')} value={search} onChange={event=>setSearch(event.target.value)}/></label><select aria-label={t('Sort locations')} value={sort} onChange={event=>setSort(event.target.value)}><option value="name">{t('Name A–Z')}</option><option value="attendance">{t('Attendance rate')}</option><option value="submission">{t('Work submission rate')}</option><option value="attention">{t('Needs attention first')}</option></select></div>
        <div className="perf-table-scroll" tabIndex={0} role="region" aria-label={t('Location performance figures')}><table className="perf-location-table"><thead><tr><th>{t('Location')}</th><th>{t('Attendance')}</th><th>{t('Work submitted')}</th><th>{t('Open reviews')}</th><th>{t('Status on selected day')}</th><th><span className="sr-only">{t('Action')}</span></th></tr></thead><tbody>
          {filtered.map(site=><tr key={site.location.id}><td><Link to={`/locations/${site.location.id}`}><span className="perf-site-icon"><Building2 size={17}/></span><span><strong>{site.location.name}</strong><small>{site.staff} {t('active staff')}</small></span></Link></td>
            <td><div className="perf-cell-rate"><strong>{percent(site.attendanceRate)}</strong><small>{site.present} / {site.scheduledShifts} {t('shifts')}</small></div>{site.scheduledShifts?<progress value={site.present} max={site.scheduledShifts} aria-label={`${site.location.name}: ${t('Attendance')}`}/>:<small className="perf-muted">{t('No scheduled shifts')}</small>}</td>
            <td><div className="perf-cell-rate"><strong>{percent(site.submissionRate)}</strong><small>{site.submitted} / {site.tasks} {t('tasks')}</small></div>{site.tasks?<progress className="is-blue" value={site.submitted} max={site.tasks} aria-label={`${site.location.name}: ${t('Work submitted')}`}/>:<small className="perf-muted">{t('No scheduled tasks')}</small>}</td>
            <td><span className={site.reviews?'perf-review-count':'perf-muted'}>{site.reviews}</span></td><td><span className="perf-site-status" data-tone={statusTone[site.today.status]}><i/>{t(statusLabel[site.today.status])}</span>{site.today.overdue||site.today.missing?<small className="perf-status-detail">{site.today.overdue} {t('overdue')} · {site.today.missing} {t('missing check-ins')}</small>:null}</td>
            <td><Link className="perf-row-link" aria-label={`${t('View daily records')}: ${site.location.name}`} to={dailyLink(params,{locationId:String(site.location.id)})}><ArrowRight size={17}/></Link></td></tr>)}
          {!filtered.length?<tr><td colSpan={6} className="perf-no-results">{t('No matching locations.')}</td></tr>:null}
        </tbody></table></div>
      </section>
      <div className="perf-methodology"><CircleHelp size={16}/><p>{t('Attendance counts checked-in shifts, including late arrivals. Rates include all scheduled records, including upcoming shifts today. Overnight work is counted once on its scheduled local date. Submitted work is separate from verification.')}</p></div>
      </>}
      <footer className="dashboard-updated"><span>{t('Updated {time}',{time:localTime(data.asOf,data.selected[0]?.timezone??'Asia/Karachi',language,true)})} · {t('Dates follow each location’s timezone.')}</span><Link to={dailyLink(params)}>{t('Go to daily operations')}<ArrowRight size={14}/></Link></footer>
    </>:null}
  </div>;
}
