import { beforeEach, describe, expect, it, vi } from 'vitest';
const m=vi.hoisted(()=>({transaction:vi.fn(),access:vi.fn(),audit:vi.fn(),tx:{$queryRaw:vi.fn(),taskTemplate:{findFirst:vi.fn(),findUniqueOrThrow:vi.fn(),findMany:vi.fn(),update:vi.fn()},staff:{findFirst:vi.fn()},taskInstance:{findMany:vi.fn(),update:vi.fn()},taskAssignment:{updateMany:vi.fn(),create:vi.fn()}}}));
vi.mock('../prisma/prisma.js',()=>({prisma:{$transaction:m.transaction}}));
vi.mock('./auditLog.service.js',()=>({writeAuditLog:m.audit}));
vi.mock('./verification-v2/authorization.service.js',()=>({requireLocationAccess:m.access,requireOperationalRole:(actor:{role:string})=>{if(actor.role==='STAFF')throw new Error('Manager required');}}));
import { assignTemplateStaff } from './templateAssignment.service.js';
const actor={id:1,companyId:1,role:'ADMIN' as const};
const now=new Date('2026-10-08T06:00:00Z');
const template={id:178,locationId:28,areaId:6,isActive:true,staffId:null,shiftStart:now,shiftEnd:new Date('2026-10-08T07:00:00Z'),location:{companyId:1}};
const task=(overrides={})=>({id:2,staffId:61,assignments:[{id:3,staffId:61,status:'ASSIGNED',isCurrent:true}],_count:{captureSessions:0,evidenceAssets:0,completionAttempts:0,areaSubmissions:0},...overrides});
describe('template assignment synchronizes existing task authority',()=>{
 beforeEach(()=>{
  vi.resetAllMocks();m.transaction.mockImplementation(work=>work(m.tx));m.tx.$queryRaw.mockResolvedValue([{id:2}]);
  m.tx.taskTemplate.findFirst.mockResolvedValue({locationId:28,areaId:6});m.tx.taskTemplate.findUniqueOrThrow.mockResolvedValue(template);
  m.access.mockResolvedValue({id:28,isActive:true,timezone:'Asia/Karachi'});m.tx.staff.findFirst.mockResolvedValue({id:65});
  m.tx.taskTemplate.findMany.mockResolvedValue([]);m.tx.taskTemplate.update.mockResolvedValue({...template,staffId:65});
  m.tx.taskInstance.findMany.mockResolvedValue([task()]);m.tx.taskAssignment.create.mockResolvedValue({id:4});
 });
 it('moves an unstarted automatic assignment and audits the change in the same transaction',async()=>{
  const result=await assignTemplateStaff(actor,178,65,now);
  expect(result.assignmentSync.updatedTaskIds).toEqual([2]);
  expect(m.tx.taskAssignment.updateMany).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({isCurrent:false,status:'REASSIGNED'})}));
  expect(m.tx.taskInstance.update).toHaveBeenCalledWith({where:{id:2},data:{staffId:65}});
  expect(m.tx.taskAssignment.create).toHaveBeenCalledWith({data:expect.objectContaining({staffId:65,isCurrent:true,assignedAt:now})});
  expect(m.audit).toHaveBeenCalledWith(expect.objectContaining({action:'TEMPLATE_STAFF_ASSIGNMENT_SYNC'}),m.tx);
 });
 it.each(['captureSessions','evidenceAssets','completionAttempts','areaSubmissions'])('preserves tasks with %s',async key=>{
  m.tx.taskInstance.findMany.mockResolvedValue([task({_count:{[key]:1}})]);
  const result=await assignTemplateStaff(actor,178,65,now);
  expect(result.assignmentSync.preservedTaskIds).toEqual([2]);expect(m.tx.taskInstance.update).not.toHaveBeenCalled();expect(m.tx.taskAssignment.create).not.toHaveBeenCalled();
 });
 it('preserves started assignment authority even when the task row says pending',async()=>{
  m.tx.taskInstance.findMany.mockResolvedValue([task({assignments:[{id:3,staffId:61,status:'STARTED',startedAt:now}]})]);
  await assignTemplateStaff(actor,178,65,now);expect(m.tx.taskInstance.update).not.toHaveBeenCalled();
 });
 it('retries are idempotent when the selected worker already owns the current task',async()=>{
  m.tx.taskInstance.findMany.mockResolvedValue([task({staffId:65,assignments:[{id:4,staffId:65,status:'ASSIGNED'}]})]);
  expect((await assignTemplateStaff(actor,178,65,now)).assignmentSync.updatedTaskIds).toEqual([]);expect(m.tx.taskAssignment.create).not.toHaveBeenCalled();
 });
 it('rejects out-of-scope staff before any schedule or task changes',async()=>{
  m.tx.staff.findFirst.mockResolvedValue(null);await expect(assignTemplateStaff(actor,178,65,now)).rejects.toMatchObject({statusCode:404});
  expect(m.tx.taskTemplate.update).not.toHaveBeenCalled();expect(m.tx.taskInstance.update).not.toHaveBeenCalled();
 });
 it('rejects overlap without reassigning existing work',async()=>{
  m.tx.taskTemplate.findMany.mockResolvedValue([{title:'Other',shiftStart:now,shiftEnd:template.shiftEnd}]);
  await expect(assignTemplateStaff(actor,178,65,now)).rejects.toMatchObject({statusCode:400});expect(m.tx.taskInstance.update).not.toHaveBeenCalled();
 });
});
