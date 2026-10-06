import assert from 'node:assert/strict';
import { readFile,readdir,mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import pg from 'pg';
const source=process.env.VERIFICATION_TEST_DATABASE_URL;if(!source)throw new Error('Explicit isolated test database required');
const url=new URL(source);if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||!url.pathname.startsWith('/priv_verification_test'))throw new Error('Local priv_verification_test database required');
const database=`priv_verification_test_worker_${Date.now()}`;
const admin=new pg.Client({connectionString:source});await admin.connect();await admin.query(`CREATE DATABASE "${database}"`);await admin.end();url.pathname=`/${database}`;
const sql=new pg.Client({connectionString:url.toString()});await sql.connect();const root=new URL('../prisma/migrations/',import.meta.url);
for(const name of (await readdir(root)).filter(n=>/^\d/.test(n)).sort())await sql.query(await readFile(new URL(`${name}/migration.sql`,root),'utf8'));
const healthFile=join(await mkdtemp(join(tmpdir(),'hygene-worker-')),'heartbeat.json');
const env={...process.env,DATABASE_URL:url.toString(),AI_PROVIDER:'disabled',OPENAI_API_KEY:'',GEMINI_API_KEY:'',VERIFICATION_WORKER_HEALTH_FILE:healthFile};
const worker=spawn(process.execPath,['dist/workers/verificationWorker.js'],{env,stdio:['ignore','pipe','pipe']});let errors='';worker.stderr.on('data',data=>{errors+=data;});worker.stdout.resume();
try{
 let heartbeat=false;for(let attempt=0;attempt<40;attempt++){if(worker.exitCode!==null)throw new Error(errors||'Worker exited');if((await sql.query('SELECT id FROM "VerificationWorkerHeartbeat"')).rowCount){heartbeat=true;break;}await new Promise(resolve=>setTimeout(resolve,250));}assert.equal(heartbeat,true,'Worker publishes startup heartbeat');
 const health=spawn(process.execPath,['dist/workers/verificationWorkerHealth.js'],{env,stdio:'pipe'});health.stdout.resume();health.stderr.resume();assert.equal(await new Promise(resolve=>health.once('exit',resolve)),0,'Worker health checks its own heartbeat and database');
 worker.kill('SIGTERM');assert.equal(await new Promise(resolve=>worker.once('exit',resolve)),0,'Worker drains and stops cleanly');
 const healthAfterStop=spawn(process.execPath,['dist/workers/verificationWorkerHealth.js'],{env,stdio:'pipe'});healthAfterStop.stdout.resume();healthAfterStop.stderr.resume();assert.equal(await new Promise(resolve=>healthAfterStop.once('exit',resolve)),1,'Stopped worker fails health');
 console.log(`PASS: worker startup, own-instance health, graceful shutdown and stale health; isolated database ${database}`);
}finally{if(worker.exitCode===null)worker.kill('SIGKILL');await sql.end();}
