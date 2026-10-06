import {processVerificationJob} from '../services/verification-v2/pipeline.service.js';
import 'dotenv/config';
import {hostname} from 'node:os';
import {randomUUID} from 'node:crypto';
import {prisma} from '../prisma/prisma.js';
import {claimVerificationJob,renewJobLease,failVerificationJob,workerHeartbeat} from '../services/verification-v2/jobQueue.service.js';
const id=`${hostname()}:${process.pid}:${randomUUID()}`;
let stopping=false;let active=0;
process.on('SIGTERM',()=>{stopping=true;});process.on('SIGINT',()=>{stopping=true;});
/** No privacy/AI auto-pass before evaluated adapters in steps 12–13. */
async function tick() {
 const job=await claimVerificationJob();if(!job)return;
 active++;
 let leaseLost=false;
 const renewal=setInterval(()=>{void renewJobLease(job.id,job.leaseToken!).then(ok=>{if(!ok)leaseLost=true;}).catch(()=>{leaseLost=true;});},30000);
 try {
  if(!leaseLost)await processVerificationJob(job);
 } catch(error) {
  if(!leaseLost)await failVerificationJob(job,error instanceof Error&&/^PROVIDER_[A-Z_]+$/.test(error.message)?error.message:'SERVICE_FAILURE');
 } finally {clearInterval(renewal);active--;}
}
const heartbeat=setInterval(()=>{void workerHeartbeat(id,active).catch(()=>console.warn('Verification worker heartbeat unavailable'));},10000);
await workerHeartbeat(id,active);
while(!stopping){try{await Promise.all(Array.from({length:4},()=>tick()));}catch{console.warn('Verification worker database temporarily unavailable');}if(!stopping)await new Promise(resolve=>setTimeout(resolve,2000));}
clearInterval(heartbeat);await prisma.verificationWorkerHeartbeat.update({where:{id},data:{activeJobs:0,lastSeenAt:new Date(0)}});await prisma.$disconnect();
