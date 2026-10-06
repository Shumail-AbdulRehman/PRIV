import {describe,it,expect,vi,beforeEach} from 'vitest';
import type {Request,Response} from 'express';
const m=vi.hoisted(()=>({find:vi.fn(),update:vi.fn(),upload:vi.fn(),audit:vi.fn(),complete:vi.fn()}));
vi.mock('../prisma/prisma.js',()=>({prisma:{taskInstance:{findUnique:m.find,update:m.update},$transaction:async(cb:(tx:unknown)=>unknown)=>cb({taskInstance:{update:m.update}})}}));
vi.mock('../utils/cloudinary.js',()=>({uploadMultipleImages:m.upload,uploadSingleImage:vi.fn()}));
vi.mock('../services/auditLog.service.js',()=>({writeAuditLog:m.audit}));
vi.mock('../services/taskAssignment.service.js',()=>({markCurrentAssignmentCompleted:m.complete,markCurrentAssignmentStarted:vi.fn()}));
import {completeTask} from './taskInstance.controller.js';
beforeEach(()=>{vi.resetAllMocks();m.find.mockResolvedValue({id:1,isActive:true,staffId:7,status:'IN_PROGRESS',shiftEnd:new Date(Date.now()+3600000),verificationVersion:1,referenceImageUrl:null,referenceImages:[]});m.upload.mockResolvedValue([{secure_url:'https://legacy.test/evidence.jpg'}]);m.update.mockResolvedValue({id:1,status:'COMPLETED'});});
describe('legacy completion drain characterization',()=>{
 const request=()=>({params:{taskId:'1'},files:[{buffer:Buffer.from('legacy')}],user:{id:7,companyId:1,role:'STAFF'}} as unknown as Request);
 const response=()=>({status:vi.fn().mockReturnThis(),json:vi.fn().mockReturnThis()} as unknown as Response);
 it('preserves the historical no-reference completion contract for v1 only',async()=>{await completeTask(request(),response());expect(m.audit).toHaveBeenCalledWith(expect.objectContaining({action:'VERIFICATION_SKIPPED_NO_REFERENCE'}));expect(m.update).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({status:'COMPLETED'})}));expect(m.complete).toHaveBeenCalled();});
 it('rejects v2 before storage or legacy AI can bypass requirements',async()=>{m.find.mockResolvedValue({id:1,isActive:true,staffId:7,verificationVersion:2});await expect(completeTask(request(),response())).rejects.toMatchObject({statusCode:409});expect(m.upload).not.toHaveBeenCalled();expect(m.update).not.toHaveBeenCalled();});
});
