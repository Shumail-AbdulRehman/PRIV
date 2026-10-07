import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
const mocks=vi.hoisted(()=>({access:vi.fn(),lock:vi.fn(),update:vi.fn(),start:vi.fn()}));
vi.mock('../prisma/prisma.js',()=>({prisma:{$transaction:async(fn:(tx:unknown)=>unknown)=>fn({taskInstance:{update:mocks.update}})}}));
vi.mock('../services/verification-v2/authorization.service.js',()=>({requireTaskAccess:mocks.access,requireLocationAccess:vi.fn()}));
vi.mock('../services/verification-v2/captureSession.service.js',()=>({lockTask:mocks.lock}));
vi.mock('../services/taskAssignment.service.js',()=>({markCurrentAssignmentStarted:mocks.start}));
import {startTask,completeTask,retiredEvidenceEndpoint} from './taskInstance.controller.js';
const request=()=>({params:{taskId:'1'},query:{},user:{id:7,companyId:1,role:'STAFF'}} as unknown as Request);
const response=()=>({json:vi.fn()} as unknown as Response);
let task:Record<string,unknown>;
beforeEach(()=>{vi.resetAllMocks();task={id:1,verificationVersion:2,status:'PENDING',shiftStart:new Date(Date.now()-60000),shiftEnd:new Date(Date.now()+3600000)};mocks.access.mockImplementation(async()=>task);mocks.update.mockImplementation(async({data})=>({...task,...data}));});
describe('guided-only task mutations',()=>{
 it('starts without any QR, while locking and recording the assignment once',async()=>{
  await startTask(request(),response());
  expect(mocks.lock).toHaveBeenCalledWith(expect.anything(),1);
  expect(mocks.access).toHaveBeenCalledWith(expect.objectContaining({id:7}),1,{staffMutation:true},expect.anything());
  expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({status:'IN_PROGRESS'})}));
  expect(mocks.start).toHaveBeenCalledTimes(1);
 });
 it('ignores obsolete QR query data for a valid guided task',async()=>{const req=request();req.query.qrToken='old-template-qr';await startTask(req,response());expect(mocks.start).toHaveBeenCalledTimes(1);});
 it('does not restart an already started task',async()=>{task.status='IN_PROGRESS';await startTask(request(),response());expect(mocks.update).not.toHaveBeenCalled();expect(mocks.start).not.toHaveBeenCalled();});
 it('requires inventory setup for historical tasks and never starts the old QR flow',async()=>{task.verificationVersion=1;await expect(startTask(request(),response())).rejects.toMatchObject({statusCode:409,errors:[{code:'INVENTORY_SETUP_REQUIRED'}]});expect(mocks.update).not.toHaveBeenCalled();});
 it.each(['ended','early','cancelled'])('preserves the %s task window/status gate',async kind=>{if(kind==='ended')task.shiftEnd=new Date(0);else if(kind==='early')task.shiftStart=new Date(Date.now()+600000);else task.status='CANCELLED';await expect(startTask(request(),response())).rejects.toMatchObject({statusCode:409});expect(mocks.update).not.toHaveBeenCalled();});
 it('authorization failure prevents every task mutation',async()=>{mocks.access.mockRejectedValue(new Error('Current active assignment required'));await expect(startTask(request(),response())).rejects.toThrow('assignment');expect(mocks.update).not.toHaveBeenCalled();});
 it('rejects retired evidence endpoints before storage and returns guided instructions',async()=>{await expect(retiredEvidenceEndpoint(request(),response())).rejects.toMatchObject({statusCode:410,errors:[{code:'GUIDED_VERIFICATION_REQUIRED'}]});expect(mocks.update).not.toHaveBeenCalled();});
 it('cannot complete unresolved guided work through the old complete endpoint',async()=>{task.status='IN_PROGRESS';await expect(completeTask(request(),response())).rejects.toMatchObject({statusCode:409});expect(mocks.update).not.toHaveBeenCalled();});
 it('only reads an already finalized server outcome',async()=>{task.status='COMPLETED';task.completionOutcome='COMPLETED_WITH_EXCEPTIONS';const res=response();await completeTask(request(),res);expect(res.json).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({completionOutcome:'COMPLETED_WITH_EXCEPTIONS'})}));expect(mocks.update).not.toHaveBeenCalled();});
});
