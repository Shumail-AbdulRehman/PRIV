import { writeFile,rename,unlink } from 'node:fs/promises';
import {processVerificationJob} from '../services/verification-v2/pipeline.service.js';
import 'dotenv/config';
import {ProviderServiceFailure} from '../services/verification-v2/provider.service.js';
import {hostname} from 'node:os';
import {randomUUID} from 'node:crypto';
import {prisma} from '../prisma/prisma.js';
import {claimVerificationJob,renewJobLease,failVerificationJob,workerHeartbeat} from '../services/verification-v2/jobQueue.service.js';
import {dispatchVerificationJobs} from '../services/verification-v2/dispatcher.js';
import {createEvidenceImageCache} from '../services/verification-v2/imageCache.js';
import {verificationEvent} from '../services/verification-v2/latency.js';
import type {VerificationJob} from '@prisma/client';
const readImage=createEvidenceImageCache();
const healthFile=process.env.VERIFICATION_WORKER_HEALTH_FILE??'/tmp/hygene-verification-worker.json';
const id=`${hostname()}:${process.pid}:${randomUUID()}`;
let stopping=false;let active=0;
process.on('SIGTERM',()=>{stopping=true;});process.on('SIGINT',()=>{stopping=true;});
/** No privacy/AI auto-pass before evaluated adapters in steps 12–13. */
async function tick(job:VerificationJob) {
 verificationEvent('WORKER_CLAIM',{jobId:job.id,attemptId:job.attemptId,stage:job.stage},{claimCount:job.attempts});
 active++;
 let leaseLost=false;
 const renewal=setInterval(()=>{void renewJobLease(job.id,job.leaseToken!).then(ok=>{if(!ok)leaseLost=true;}).catch(()=>{leaseLost=true;});},30000);
 try {
  if(!leaseLost)await processVerificationJob(job,undefined,readImage);
 } catch(error) {
  if(!leaseLost)await failVerificationJob(job,error instanceof ProviderServiceFailure?error.code:error instanceof Error&&/^PROVIDER_[A-Z_]+$/.test(error.message)?error.message:'SERVICE_FAILURE',Math.random,error instanceof ProviderServiceFailure?error.metadata:undefined);
 } finally {clearInterval(renewal);active--;}
}
async function heartbeatTick(){await workerHeartbeat(id,active);await writeFile(`${healthFile}.tmp`,JSON.stringify({id}));await rename(`${healthFile}.tmp`,healthFile);}
const heartbeat=setInterval(()=>{void heartbeatTick().catch(()=>console.warn('Verification worker heartbeat unavailable'));},10000);
await heartbeatTick();
await dispatchVerificationJobs({claim:claimVerificationJob,process:tick,stopping:()=>stopping,onError:()=>console.warn('Verification worker database temporarily unavailable')});
clearInterval(heartbeat);await unlink(healthFile).catch(()=>{});await prisma.verificationWorkerHeartbeat.update({where:{id},data:{activeJobs:0,lastSeenAt:new Date(0)}});await prisma.$disconnect();
