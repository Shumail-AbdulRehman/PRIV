import { Link } from 'react-router-dom';
import { Users, CalendarCheck, Camera, Clock3, ArrowRight, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/context';
import { dailyLink, reviewLink, localTime, type OperationOverview } from './operations';

type Props = { data: OperationOverview; params: URLSearchParams };
export default function TodayPulse({ data, params }: Props) {
  const { t } = useLanguage();
  const { metrics, chart } = data;
  const segments = [
    { label: 'Work submitted', count: chart.submitted, status: 'submitted', tone: 'submitted' },
    { label: 'In progress', count: chart.inProgress, status: 'in-progress', tone: 'progress' },
    { label: 'Not started', count: chart.notStarted, status: 'not-started', tone: 'pending' },
    { label: 'Overdue', count: chart.overdue, status: 'overdue', tone: 'overdue' },
  ];
  return <section className="today-pulse" aria-label={t('Daily summary')}>
    <div className="today-pulse-section">
      <h2><Users size={18} aria-hidden="true" />{t('Team attendance')}</h2>
      <div className="today-pulse-value"><strong>{metrics.present}<small> / {metrics.scheduled}</small></strong><span>{t('scheduled staff checked in')}</span></div>
      <div className="today-distribution" role="img" aria-label={t('{present} of {scheduled} scheduled staff checked in', {present:metrics.present,scheduled:metrics.scheduled})}>
        <span className="progress-progress" style={{width: `${metrics.scheduled ? Math.min(100,metrics.present / metrics.scheduled * 100) : 0}%`}} />
      </div>
      <Link className="today-summary-link" to={dailyLink(params,{tab:'staff'})}>{t('View attendance')}<ArrowRight size={14} aria-hidden="true" /></Link>
    </div>
    <div className="today-pulse-section">
      <h2><CalendarCheck size={18} aria-hidden="true" />{t('Today’s task progress')}<span>{metrics.totalTasks} {t('scheduled')}</span></h2>
      <div className="today-pulse-value"><strong>{metrics.submitted}<small> / {metrics.totalTasks}</small></strong><span>{t('Work submitted')}</span></div>
      <div className="today-distribution" role="img" aria-label={segments.map(s => `${t(s.label)}: ${s.count}`).join(', ')}>
        {segments.filter(s=>s.count>0).map(s=><span key={s.status} className={'progress-'+s.tone} style={{flexGrow:s.count,flexBasis:0}} />)}
      </div>
      <div className="today-pulse-legend">{segments.map(s=><Link key={s.status} to={dailyLink(params,{tab:'tasks',status:s.status})}><i className={'progress-'+s.tone} />{s.count} {t(s.label)}</Link>)}</div>
    </div>
  </section>;
}

export function TodayAside({data,params}:Props) {
  const {t,language}=useLanguage();
  // The attention response is bounded; do not present its length as a company total.
  const missing = data.attention.filter(a=>a.kind === 'attendance');
  const upcoming = data.tasks.filter(task=>!task.staffSubmittedAt && task.status !== 'CANCELLED' && Date.parse(task.shiftStart)>Date.parse(data.asOf)).sort((a,b)=>Date.parse(a.shiftStart)-Date.parse(b.shiftStart)).slice(0,2);
  return <aside className="today-aside">
    <section className="ops-panel today-attention">
      <h2>{t('Needs attention')}<TriangleAlert size={18} aria-hidden="true" /></h2>
      <div className="today-signal"><span className="today-signal-icon"><Users size={19} aria-hidden="true" /></span><div><strong>{t('Missing check-ins')}</strong><p>{t('Check expected attendance for this day.')}</p>{missing.slice(0,2).map(a=><small key={a.key}><bdi>{a.staff?.name}</bdi></small>)}</div><Link to={dailyLink(params,{tab:'staff',attendance:'absent'})}>{t('View')}</Link></div>
      <div className="today-signal"><span className="today-signal-icon warning"><Clock3 size={19} aria-hidden="true" /></span><div><strong>{data.chart.overdue} {t('Overdue tasks')}</strong><p>{t('Past their scheduled end time')}</p></div><Link to={dailyLink(params,{tab:'tasks',status:'overdue'})}>{t('View')}</Link></div>
    </section>
    <section className="ops-panel today-review-preview">
      <span className="today-camera"><Camera size={20} aria-hidden="true" /></span>
      <h2>{data.metrics.reviewCount === 1 ? t('1 photo review needs attention') : <>{data.metrics.reviewCount} {t('photo reviews need attention')}</>}</h2>
      <p>{t('Inspect the evidence and record a decision in your review workspace.')}</p>
      <Button asChild><Link to={reviewLink(params)}><ArrowRight size={17} aria-hidden="true" />{t('Open Photo Reviews')}</Link></Button>
    </section>
    <section className="ops-panel today-upcoming">
      <h2>{t('Coming up')}<Clock3 size={18} aria-hidden="true" /></h2>
      {upcoming.length ? upcoming.map(task=><Link key={task.id} className="today-upcoming-task" to={dailyLink(params,{tab:'tasks',taskId:String(task.id)})}>
        <time><bdi>{localTime(task.shiftStart,task.location.timezone,language)}</bdi></time><strong><bdi>{task.areaNameSnapshot ?? task.title}</bdi></strong><p><bdi>{task.staff?.name ?? t('Unassigned')}</bdi> · <bdi>{task.location.name}</bdi></p>
      </Link>) : <p>{t('No upcoming tasks in the loaded summary.')}</p>}
    </section>
  </aside>;
}
