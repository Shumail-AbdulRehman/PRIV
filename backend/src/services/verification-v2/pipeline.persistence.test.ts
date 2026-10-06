import {afterEach,it,expect,vi} from 'vitest';
vi.mock('../../prisma/prisma.js',()=>({prisma:{verificationJob:{findFirst:vi.fn(),findMany:vi.fn()}}}));
vi.mock('./captureSession.service.js',()=>({lockTask:vi.fn()}));
vi.mock('./exception.service.js',()=>({raiseIssue:vi.fn()}));
vi.mock('./completion.service.js',()=>({finalizeTask:vi.fn()}));
import {raiseIssue} from './exception.service.js';
import {prisma} from '../../prisma/prisma.js';
import {processVerificationJob,contextNeedsReview,applyDecision} from './pipeline.service.js';
afterEach(()=>vi.resetAllMocks());
it('reuses recorded success without reading media or rebilling provider',async()=>{
 vi.mocked(prisma.verificationJob.findFirst).mockResolvedValue({id:'job'} as any);
 vi.mocked(prisma.verificationJob.findMany).mockResolvedValue([{evaluatorVersion:'cleanliness-v1'}] as any);
 const provider={assess:vi.fn()},read=vi.fn();
 const result=await processVerificationJob({id:'job',leaseToken:'lease',attemptId:'attempt',stage:'CLEANLINESS',evaluatorVersion:'cleanliness-v1'} as any,provider as any,read);
 expect(result).toBe(false);expect(provider.assess).not.toHaveBeenCalled();expect(read).not.toHaveBeenCalled();
});
it('ignores an expired or replaced lease before loading evidence or calling provider',async()=>{
 vi.mocked(prisma.verificationJob.findFirst).mockResolvedValue(null);
 const provider={assess:vi.fn()},read=vi.fn();
 expect(await processVerificationJob({id:'job',leaseToken:'old',attemptId:'attempt',stage:'CLEANLINESS',evaluatorVersion:'cleanliness-v1'} as any,provider as any,read)).toBe(false);
 expect(prisma.verificationJob.findFirst).toHaveBeenCalledWith({where:{id:'job',state:'RUNNING',leaseToken:'old',leaseUntil:{gt:expect.any(Date)}},select:{id:true}});
 expect(prisma.verificationJob.findMany).not.toHaveBeenCalled();expect(provider.assess).not.toHaveBeenCalled();expect(read).not.toHaveBeenCalled();
});

it('escalates serious context immediately and ordinary recapture only at policy threshold',()=>{
 expect(contextNeedsReview('PRIVACY_HOLD',true,'PRIVACY_HOLD',1,3)).toBe(true);
 expect(contextNeedsReview('REVIEW_REQUIRED',false,'STALE_ASSIGNMENT',1,3)).toBe(true);
 expect(contextNeedsReview('REVIEW_REQUIRED',true,'DUPLICATE_EVIDENCE',1,3)).toBe(true);
 expect(contextNeedsReview('RECAPTURE_REQUIRED',true,'CONTEXT_UNCERTAIN',2,3)).toBe(false);
 expect(contextNeedsReview('RECAPTURE_REQUIRED',true,'CONTEXT_UNCERTAIN',3,3)).toBe(true);
 expect(contextNeedsReview('RECAPTURE_REQUIRED',true,'CONTEXT_UNCERTAIN',2,2)).toBe(true);
});

function completedTransaction(){return {
 verificationAttempt:{findUniqueOrThrow:vi.fn().mockResolvedValue({session:{taskInstanceId:9},requirementId:'optional',slot:{generation:0}}),update:vi.fn().mockResolvedValue({})},
 taskInstance:{findUniqueOrThrow:vi.fn().mockResolvedValue({id:9,status:'COMPLETED'}),update:vi.fn()},
 taskEvidenceRequirement:{findUniqueOrThrow:vi.fn(),update:vi.fn()},
 captureSession:{update:vi.fn()},
};}
it.each(['CLEANING_REQUIRED','RECAPTURE_REQUIRED','REVIEW_REQUIRED','PASSED'] as const)('records late optional %s without stale-assignment spam or completion mutation',async state=>{
 const tx=completedTransaction();
 await applyDecision(tx as any,'attempt',state,state==='CLEANING_REQUIRED'?'CLEANING_REQUIRED':state==='RECAPTURE_REQUIRED'?'CANNOT_ASSESS':'CLEAN');
 expect(tx.verificationAttempt.update).toHaveBeenCalledWith({where:{id:'attempt'},data:{state}});
 expect(raiseIssue).not.toHaveBeenCalled();expect(tx.taskEvidenceRequirement.findUniqueOrThrow).not.toHaveBeenCalled();expect(tx.taskEvidenceRequirement.update).not.toHaveBeenCalled();expect(tx.taskInstance.update).not.toHaveBeenCalled();expect(tx.captureSession.update).not.toHaveBeenCalled();
});
it.each(['PRIVACY_HOLD','DUPLICATE_EVIDENCE'] as const)('links serious late %s without reopening completion or requirements',async reason=>{
 const tx=completedTransaction(),state=reason==='PRIVACY_HOLD'?'PRIVACY_HOLD':'REVIEW_REQUIRED';
 await applyDecision(tx as any,'attempt',state,reason);
 if(reason==='DUPLICATE_EVIDENCE')expect(raiseIssue).toHaveBeenCalledWith(tx,9,reason,null,'attempt');else expect(raiseIssue).not.toHaveBeenCalled();expect(tx.taskEvidenceRequirement.update).not.toHaveBeenCalled();expect(tx.taskInstance.update).not.toHaveBeenCalled();
});
