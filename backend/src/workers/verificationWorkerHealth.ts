import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { prisma } from '../prisma/prisma.js';
import { heartbeatFresh } from '../services/verification-v2/workerHealthPolicy.js';
try{
 const local=JSON.parse(await readFile(process.env.VERIFICATION_WORKER_HEALTH_FILE??'/tmp/hygene-verification-worker.json','utf8')) as {id:string};
 const record=await prisma.verificationWorkerHeartbeat.findUnique({where:{id:local.id}});
 if(!heartbeatFresh(record))throw new Error('Worker heartbeat stale');
 console.log('Verification worker healthy');
}catch{console.error('Verification worker heartbeat or database unavailable');process.exitCode=1;}
finally{await prisma.$disconnect();}
