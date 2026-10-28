import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatInTimeZone } from 'date-fns-tz';
import { ArrowRight, Plus, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/i18n/context';
import useAuth from '@/hooks/useAuth';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { type Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OperationsState from '../Manager/OperationsState';
import { useGetLocations } from '../Location/queries';
import { useGetStaff, getStaffDetailsQueryOptions } from './queries';
import WorkforceActions from './WorkforceActions';
import StaffCreateDialog from './StaffCreateDialog';
import StaffEditDialog, { type EditableStaff } from './StaffEditDialog';
import './workforce-v5.css';
interface StaffMember extends EditableStaff { locationId:number|null }
interface LocationOption {id:number;name:string;timezone:string;isActive?:boolean}
const shiftTime=(date:string|null,timezone:string)=>date?formatInTimeZone(new Date(date),timezone,'HH:mm'):'—';
export default function StaffPage(){
 const {t}=useLanguage();const {user}=useAuth();const staffQuery=useGetStaff();const locationsQuery=useGetLocations();const queryClient=useQueryClient();const navigate=useNavigate();
 const [success,setSuccess]=useState('');const [search,setSearch]=useState('');const [editingStaff,setEditingStaff]=useState<StaffMember|null>(null);const [params,setParams]=useSearchParams();
 const locationFilter=params.get('locationId')??'all';const dialogOpen=params.get('create')==='1';
 const setLocationFilter=(value:string)=>setParams(previous=>{const next=new URLSearchParams(previous);if(value==='all')next.delete('locationId');else next.set('locationId',value);return next;},{replace:true});
 const setDialogOpen=(open:boolean)=>setParams(previous=>{const next=new URLSearchParams(previous);if(open)next.set('create','1');else next.delete('create');return next;},{replace:true});
 const staff=(staffQuery.data?.data??[]) as StaffMember[];const locations=(locationsQuery.data?.data??[]) as LocationOption[];const locMap=new Map(locations.map(location=>[location.id,location]));
 const filtered=staff.filter(person=>(`${person.name} ${person.email} ${person.phone??''}`).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())&&(locationFilter==='all'||(locationFilter==='unassigned'?person.locationId==null:person.locationId===Number(locationFilter))));
 const timezone=(person:StaffMember)=>locMap.get(person.locationId??-1)?.timezone??'UTC';
 const columns:Column<StaffMember>[]=[
  {key:'name',header:'Team member',sortValue:person=>person.name,render:person=><div className="table-identity"><span className="workspace-avatar" aria-hidden="true">{person.name.split(' ').map(word=>word[0]).join('').slice(0,2).toUpperCase()}</span><div><strong>{person.name}</strong><p><bdi dir="ltr">{person.email}</bdi></p></div></div>},
  {key:'location',header:'Location & shift',sortValue:person=>locMap.get(person.locationId??-1)?.name??'',render:person=><div className="workforce-record-location"><span>{person.locationId==null?t('Unassigned'):locMap.get(person.locationId)?.name??`#${person.locationId}`}</span><small><bdi dir="ltr">{shiftTime(person.shiftStart,timezone(person))}–{shiftTime(person.shiftEnd,timezone(person))}</bdi> · {timezone(person)}</small></div>},
  {key:'phone',header:'Phone',render:person=><bdi dir="ltr">{person.phone||'—'}</bdi>},
  {key:'status',header:'Account status',render:person=><StatusBadge status={person.isActive?'ACTIVE':'INACTIVE'}/>},
  {key:'actions',header:'Actions',render:person=><div className="workforce-record-actions"><Button variant="outline" onClick={()=>navigate(`/staff/${person.id}`)}>{t('View details')}</Button><Button variant="ghost" disabled={!person.isActive} onClick={()=>setEditingStaff(person)}>{t('Edit')}</Button><WorkforceActions person={person} locations={locations}/></div>}
 ];
 return <div className="workforce-page"><PageHeader title="Your team" subtitle="The right people, in the right place, with a clear working day." action={<Button onClick={()=>setDialogOpen(true)} disabled={staffQuery.isLoading||locationsQuery.isPending||locationsQuery.isError}><Plus size={16}/>{t('Add team member')}</Button>}/>
  {staffQuery.isLoading||locationsQuery.isPending?<OperationsState loading skeleton="table"/>:staffQuery.isError||locationsQuery.isError?<OperationsState error={staffQuery.error??locationsQuery.error} retry={()=>{void staffQuery.refetch();void locationsQuery.refetch();}}/>:<>
   <OperationsState/>{success?<p role="status" className="ops-save-result">{t(success)}</p>:null}
   <dl className="workforce-summary" aria-label={t('Team summary')}>
    <div><dt>{t('Active staff')}</dt><dd>{staff.filter(person=>person.isActive).length}</dd><p>{t('Current active accounts')}</p><p>{t(user?.role==='ADMIN'?'Company-wide scope':'Assigned-site scope')}</p></div>
    <div><dt>{t('Assigned staff')}</dt><dd>{staff.filter(person=>person.locationId!=null).length}</dd><p>{t('Staff with a current location')}</p><Link to="/attendance">{t('Open attendance')}</Link></div>
    <div><dt>{t('Locations')}</dt><dd>{locations.length}</dd><p>{t('Locations available to your account')}</p>{user?.role==='ADMIN'?<Link to="/managers">{t('Manager assignments')}</Link>:<p>{t('Assigned-site access')}</p>}</div>
    <div><dt>{t('Unassigned hires')}</dt><dd>{staff.filter(person=>person.locationId==null).length}</dd><p>{t(user?.role==='ADMIN'?'Owners can stage new hires':'Managers must choose an assigned site')}</p><p>{t('Assign a site before starting work')}</p></div>
   </dl>
   {dialogOpen?<StaffCreateDialog open inline onOpenChange={setDialogOpen} locations={locations} location={locations.find(location=>String(location.id)===locationFilter)} onSaved={()=>setSuccess('Team member added.')}/>:null}
   <section className="workforce-panel workforce-directory" aria-labelledby="team-directory-title"><div className="workforce-panel-heading"><h2 id="team-directory-title">{t('Your people, at a glance')}</h2><p>{t('Current assignments and account access. Open a person for attendance and task history.')}</p></div>
    <div className="workforce-toolbar"><label>{t('Find a team member')}<Input aria-label={t('Search team')} type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder={t('Search by name, email or phone')}/></label><label>{t('Location')}<select aria-label={t('Filter by location')} value={locationFilter} onChange={event=>setLocationFilter(event.target.value)}><option value="all">{t('All locations')}</option>{user?.role==='ADMIN'?<option value="unassigned">{t('Unassigned')}</option>:null}{locations.map(location=><option key={location.id} value={location.id}>{location.name}</option>)}</select></label></div>
    <DataTable pageSize={20} columns={columns} data={filtered} rowKey={person=>person.id} emptyIcon={<Users size={40}/>} emptyMessage={staff.length?'No team members match these filters.':'No team members yet. Add your first team member to get started.'} onRowHover={person=>{void queryClient.prefetchQuery(getStaffDetailsQueryOptions(person.id));}} onRowClick={person=>navigate(`/staff/${person.id}`)}/>
    <div className="workforce-panel-footer"><span>{t('{shown} of {total} team members',{shown:filtered.length,total:staff.length})}</span>{search||locationFilter!=='all'?<Button variant="ghost" onClick={()=>{setSearch('');setLocationFilter('all');}}>{t('Clear filters')}</Button>:null}<Link to="/attendance">{t('Open attendance')}<ArrowRight size={16}/></Link></div>
   </section><div className="workforce-guide">{user?.role==='ADMIN'?<section className="workforce-panel"><h2>{t('Manager assignments')}</h2><p>{t('Review each manager’s assigned sites. Release the previous manager’s access before assigning a replacement.')}</p><Link to="/managers">{t('Manage managers')}<ArrowRight size={16}/></Link></section>:<section className="workforce-panel"><h2>{t('Assigned-site access')}</h2><p>{t('You can manage staff only at your assigned sites. Contact the company owner for manager access changes.')}</p></section>}<section className="workforce-panel"><h2>{t('Safe offboarding')}</h2><p>{t('Keep retained evidence and history. Use Staff access to record a reason, end access or transfer a person safely.')}</p></section></div>
  </>}{editingStaff?<StaffEditDialog person={editingStaff} timezone={timezone(editingStaff)} onClose={()=>setEditingStaff(null)} onSaved={()=>setSuccess('Team member changes saved.')}/>:null}
 </div>;
}
