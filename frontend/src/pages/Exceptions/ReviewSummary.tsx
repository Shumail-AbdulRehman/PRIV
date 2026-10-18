import {AlertCircle, Camera, Clock3, CheckCircle2} from 'lucide-react';
import {useLanguage} from '@/i18n/context';
import {localTime} from '../Manager/operations';
import {reviewDiagnosis} from './reviewDiagnosis';
import type {ExceptionDetail} from './types';
export default function ReviewSummary({detail,onSelect}:{detail:ExceptionDetail;onSelect:(id:string)=>void}) {
  const {t,language}=useLanguage();
  const summary=reviewDiagnosis(detail,t);
  const headings={cleaning:'More cleaning needed',missing:'Missing photos',retake:'Photos did not pass',review:'Manager review needed',processing:'Checks in progress'};
  const title=detail.state==='RESOLVED'?'Review resolved':summary.cleaning&&summary.missing?'Cleaning is incomplete':summary.cleaning?'More cleaning is needed':summary.missing?'Required photos are missing':summary.groups.every(group=>group.category==='processing')&&summary.groups.length?'Photo checks are still running':'Photos need a manager’s review';
  const deadline=summary.capture.deadline;

  return <section className="ops-review-summary" aria-label={t('Review summary')}>
    <div className="ops-review-summary-heading"><div><p className="ops-review-eyebrow">{t(detail.state==='RESOLVED'?'Review result':'What went wrong')}</p><h2>{t(title)}</h2></div>{summary.total>0&&<span className="ops-review-progress"><CheckCircle2 size={16}/>{t('{checked} of {total} required photos satisfied',{checked:summary.checked,total:summary.total})}</span>}</div>
    {summary.groups.length>0&&detail.state!=='RESOLVED'&&<div className="ops-review-findings">{summary.groups.map(group=><div className="ops-review-finding" key={group.category} data-kind={group.category}>
      <div className="ops-review-finding-title">{group.category==='missing'?<Camera size={18}/>:<AlertCircle size={18}/>}<h3>{t(headings[group.category])}</h3><span>{group.rows.length}</span></div>
      <div className="ops-review-affected">{group.rows.slice(0,4).map(row=><button key={row.id} onClick={()=>onSelect(row.id)} aria-label={t('Inspect {name}: {view}',{name:row.name,view:row.view})}>{row.name}{group.rows.filter(other=>other.name===row.name).length>1?` · ${row.view}`:''}</button>)}</div>
      <p>{group.category==='cleaning'&&group.rows.length===1?group.rows[0].description: t(group.category==='missing'?'These required views still need a photo.':group.category==='cleaning'?'The recorded checks flagged these views for further cleaning.':group.category==='retake'?'The received photos did not meet the capture requirements.':group.category==='processing'?'Photos were received and their checks have not finished.':'These photos need a manager’s decision. Select an item to see the recorded reason.')}</p>
      {group.rows.length>4&&<p className="ops-review-more">{t('{count} more photos listed below',{count:group.rows.length-4})}</p>}
    </div>)}</div>}
    <div className="ops-review-next"><div><strong>{t('What to do next')}</strong><p>{summary.next}</p></div>{deadline&&<div className="ops-review-deadline" data-closed={summary.capture.reason==='DEADLINE_PASSED'}><Clock3 size={17}/><span><strong>{t(summary.capture.reason==='DEADLINE_PASSED'?'Photo deadline passed':'Photo deadline')}</strong><time dateTime={deadline}>{localTime(deadline,detail.location?.timezone??'Asia/Karachi',language,true)} ({detail.location?.timezone??'Asia/Karachi'})</time></span></div>}</div>
  </section>;
}
