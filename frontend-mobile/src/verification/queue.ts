import type {SpatialCheckpoint} from './spatialTypes';
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import type { Account, CaptureMetadata, LocalSession, QueueRow, QueueState } from './types';
import { getFreeDiskStorageAsync } from 'expo-file-system/legacy';
import { MAX_QUEUE_BYTES, MAX_QUEUE_PHOTOS } from './policy';
import { databaseDirectoryUri } from './fileUri';
let database: SQLite.SQLiteDatabase | null = null;
let activeAccount: string | null = null;
let opening: Promise<void> | null = null;
let lockEpoch = 0;
let operations: Promise<unknown> = Promise.resolve();
let storageError: string | null = null;
function serialized<T>(operation: () => Promise<T>): Promise<T> {
  const result = operations.then(operation, operation);
  operations = result.catch(() => {});
  return result;
}
function scoped<T>(operation: () => Promise<T>): Promise<T> {
  const scope = activeAccount;
  return serialized(async () => {
    if (!scope) throw new Error(storageError ?? 'Saved photos are locked. Sign in to open them.');
    if (scope !== activeAccount) throw new Error('Account changed. Saved photos are locked.');
    return operation();
  });
}
const namespace = (account: Account) => {
 if(!Number.isSafeInteger(account.companyId)||account.companyId<1||!Number.isSafeInteger(account.id)||account.id<1)throw new Error('Valid signed-in account required.');
 return `${account.companyId}_${account.id}`;
};
export async function unlockQueue(account: Account) {
  if (opening) await opening;
  if (activeAccount === namespace(account) && database) return;
  const epoch = lockEpoch;
  opening = serialized(async () => {
    await closeQueue();
    const scope = namespace(account), keyName = `hygene_verification_key_${scope}`;
    let key = await SecureStore.getItemAsync(keyName);
    if (!key && new File(databaseDirectoryUri(SQLite.defaultDatabaseDirectory),`verification_${scope}.db`).exists) throw new Error('The encryption key for saved work is unavailable. Ask support before reinstalling or clearing data.');
    if (!key) { key = Array.from(await Crypto.getRandomBytesAsync(32)).map(v => v.toString(16).padStart(2,'0')).join(''); await SecureStore.setItemAsync(keyName,key, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }); }
    if (!/^[0-9a-f]{64}$/.test(key)) throw new Error('Secure photo storage is unavailable. Sign in again.');
    const db = await SQLite.openDatabaseAsync(`verification_${scope}.db`);
    try {
      await db.execAsync(`PRAGMA key = "x'${key}'";`);
      const cipher = await db.getFirstAsync<Record<string,string>>('PRAGMA cipher_version;');
      if (!cipher || !Object.values(cipher).some(Boolean)) throw new Error('Encrypted photo storage requires a native build.');
      await db.execAsync(`PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL; PRAGMA secure_delete = ON;
        CREATE TABLE IF NOT EXISTS sessions (task_id INTEGER PRIMARY KEY, payload TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS queue (id TEXT PRIMARY KEY, task_id INTEGER NOT NULL, session_id TEXT NOT NULL, slot_id TEXT NOT NULL UNIQUE,
          metadata TEXT NOT NULL, photo BLOB, bytes INTEGER NOT NULL, state TEXT NOT NULL, retries INTEGER NOT NULL DEFAULT 0,
          next_retry_at INTEGER NOT NULL DEFAULT 0, attempt_id TEXT, last_error TEXT);
        CREATE TABLE IF NOT EXISTS requests (request_key TEXT PRIMARY KEY, payload TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, task_id INTEGER NOT NULL, payload TEXT NOT NULL);
        UPDATE queue SET state='SAVED' WHERE state='UPLOADING';`);
      if (epoch !== lockEpoch) { await db.closeAsync(); return; }
      database = db; activeAccount = scope; storageError = null;
    } catch(error) { await db.closeAsync(); throw error; }
  });
  try { await opening; } catch(error) {
    storageError = error instanceof Error ? error.message : 'Secure photo storage could not open.';
    throw error;
  } finally { opening = null; }
}
async function closeQueue() { const previous=database; database=null; activeAccount=null; if(previous) await previous.closeAsync(); }
export async function lockQueue() { lockEpoch++; activeAccount=null; storageError=null; await serialized(closeQueue); }
export function queueAccount() { return activeAccount; }
function db() { if(!database || !activeAccount) throw new Error('Sign in to open your saved photos.'); return database; }
async function pruneLocalHistory() {
 const old=await db().getAllAsync<{task_id:number}>(`SELECT task_id FROM sessions WHERE json_extract(payload,'$.manifest.task.status')='COMPLETED' ORDER BY rowid DESC LIMIT -1 OFFSET 50`);
 for(const row of old){
   const pending=await db().getFirstAsync<{count:number}>("SELECT COUNT(*) AS count FROM queue WHERE task_id=? AND (photo IS NOT NULL OR state!='FINAL')",row.task_id);
   const issues=await db().getFirstAsync<{count:number}>('SELECT COUNT(*) AS count FROM issues WHERE task_id=?',row.task_id);
   if(!pending?.count&&!issues?.count){await db().runAsync('DELETE FROM queue WHERE task_id=?',row.task_id);await db().runAsync('DELETE FROM sessions WHERE task_id=?',row.task_id);}
 }
}
export async function saveSession(local: LocalSession) { return scoped(async () => {
 await pruneLocalHistory();
 const exists=await db().getFirstAsync<{payload:string}>('SELECT payload FROM sessions WHERE task_id=?',local.manifest.task.id);
 const existing=exists?JSON.parse(exists.payload) as LocalSession:null;
 if(existing?.session.id===local.session.id&&existing.spatialCheckpoint)local={...local,spatialCheckpoint:existing.spatialCheckpoint};
 if(!exists&&(await db().getFirstAsync<{count:number}>('SELECT COUNT(*) AS count FROM sessions'))!.count>=200)throw new Error('Too many saved tasks. Reconnect and ask your manager to resolve pending tasks.');
 await db().runAsync('INSERT INTO sessions(task_id,payload) VALUES(?,?) ON CONFLICT(task_id) DO UPDATE SET payload=excluded.payload', local.manifest.task.id,JSON.stringify(local)); }); }
export async function getSession(taskId: number): Promise<LocalSession | null> { return scoped(async () => { const row=await db().getFirstAsync<{payload:string}>('SELECT payload FROM sessions WHERE task_id=?',taskId);return row?JSON.parse(row.payload):null; }); }
export async function savedWork():Promise<LocalSession[]> { return scoped(async () => { return (await db().getAllAsync<{payload:string}>('SELECT payload FROM sessions')).map(r=>JSON.parse(r.payload)); }); }
type RawRow = Omit<QueueRow,'metadata'|'taskId'|'sessionId'|'slotId'|'nextRetryAt'|'attemptId'|'lastError'> & { metadata:string;task_id:number;session_id:string;slot_id:string;next_retry_at:number;attempt_id:string|null;last_error:string|null };
export async function queueRows(taskId?:number): Promise<QueueRow[]> { return scoped(async () => { const rows=await db().getAllAsync<RawRow>(taskId?'SELECT id,task_id,session_id,slot_id,metadata,bytes,state,retries,next_retry_at,attempt_id,last_error FROM queue WHERE task_id=? ORDER BY rowid':'SELECT id,task_id,session_id,slot_id,metadata,bytes,state,retries,next_retry_at,attempt_id,last_error FROM queue ORDER BY rowid',taskId?[taskId]:[]);return rows.map(r=>({ ...r,metadata:JSON.parse(r.metadata),taskId:r.task_id,sessionId:r.session_id,slotId:r.slot_id,nextRetryAt:r.next_retry_at,attemptId:r.attempt_id,lastError:r.last_error })); }); }
export async function saveCapture(metadata:CaptureMetadata, bytes:Uint8Array, spatialCheckpoint?:SpatialCheckpoint) { return scoped(async () => {
  if((await db().getFirstAsync<{count:number}>('SELECT COUNT(*) AS count FROM queue'))!.count>=2000)throw new Error('Too much saved work. Reconnect and ask your manager to finish reviewing pending tasks.');
  if(bytes.byteLength>5*1024*1024) throw new Error('Photo is too large. Please retake it.');
  if (await getFreeDiskStorageAsync() < bytes.byteLength * 3 + 10 * 1024 * 1024) throw new Error('Phone storage is low. Free some space before taking more photos.');
  await db().withExclusiveTransactionAsync(async(tx)=>{
    const total=await tx.getFirstAsync<{count:number;size:number}>('SELECT COUNT(*) AS count, COALESCE(SUM(bytes),0) AS size FROM queue WHERE photo IS NOT NULL');
    if((total?.count??0)>=MAX_QUEUE_PHOTOS || (total?.size??0)+bytes.byteLength>MAX_QUEUE_BYTES) throw new Error('Photo storage is full. Connect to upload your saved photos before taking more.');
    await tx.runAsync('INSERT INTO queue(id,task_id,session_id,slot_id,metadata,photo,bytes,state) VALUES(?,?,?,?,?,?,?,?)',metadata.clientCaptureId,metadata.taskId,metadata.sessionId,metadata.slotId,JSON.stringify(metadata),bytes,bytes.byteLength,'SAVED');
    if(spatialCheckpoint){const row=await tx.getFirstAsync<{payload:string}>('SELECT payload FROM sessions WHERE task_id=?',metadata.taskId);if(!row)throw new Error('Saved capture session unavailable.');const local=JSON.parse(row.payload) as LocalSession;if(local.session.id!==metadata.sessionId)throw new Error('Capture session changed.');await tx.runAsync('UPDATE sessions SET payload=? WHERE task_id=?',JSON.stringify({...local,spatialCheckpoint}),metadata.taskId);}
  });
}); }
export async function queueBytes(id:string) { return scoped(async () => { const row=await db().getFirstAsync<{photo:Uint8Array|null}>('SELECT photo FROM queue WHERE id=?',id);if(!row?.photo) throw new Error('Saved photo unavailable.');return row.photo; }); }
export async function updateQueue(id:string,state:QueueState, options:{attemptId?:string;error?:string;nextRetryAt?:number;retry?:boolean;releaseBytes?:boolean}={}) { return scoped(async () => {
  await db().runAsync('UPDATE queue SET state=?, attempt_id=COALESCE(?,attempt_id), last_error=?, next_retry_at=?, retries=retries+?, photo=CASE WHEN ? THEN NULL ELSE photo END WHERE id=?',state,options.attemptId??null,options.error??null,options.nextRetryAt??0,options.retry?1:0,options.releaseBytes?1:0,id);
}); }
export async function pendingCount() { return scoped(async () => { return (await db().getFirstAsync<{count:number}>('SELECT COUNT(*) AS count FROM queue WHERE photo IS NOT NULL'))?.count??0; }); }
export async function saveIssue(taskId:number,payload:Record<string,unknown>) { return scoped(async () => { if ((await db().getFirstAsync<{count:number}>('SELECT COUNT(*) AS count FROM issues'))!.count >= 100) throw new Error('Connect to send your saved reports first.'); const id=Crypto.randomUUID();await db().runAsync('INSERT INTO issues(id,task_id,payload) VALUES(?,?,?)',id,taskId,JSON.stringify({...payload,requestId:id})); }); }
export async function pendingIssues() { return scoped(async () => { return db().getAllAsync<{id:string;task_id:number;payload:string}>('SELECT * FROM issues'); }); }
export async function removeIssue(id:string) { return scoped(async () => { await db().runAsync('DELETE FROM issues WHERE id=?',id); }); }
export async function materializeUpload(id:string) { return scoped(async () => { const file=new File(Paths.cache,`verification-upload-${id}.jpg`);file.create({overwrite:true});file.write((await db().getFirstAsync<{photo:Uint8Array}>('SELECT photo FROM queue WHERE id=?',id))!.photo);return file; }); }
export function cleanUploadCache() { const files=Paths.cache.list();for(const file of files) if(file instanceof File && file.name.startsWith('verification-upload-')) file.delete(); }

export async function getRequest(key:string):Promise<{path:string;body:Record<string,unknown>}|null>{return scoped(async()=>{const row=await db().getFirstAsync<{payload:string}>('SELECT payload FROM requests WHERE request_key=?',key);return row?JSON.parse(row.payload):null;});}
export async function saveRequest(key:string,payload:{path:string;body:Record<string,unknown>}){return scoped(async()=>{if((await db().getFirstAsync<{count:number}>('SELECT COUNT(*) AS count FROM requests'))!.count>=200&&!await db().getFirstAsync('SELECT request_key FROM requests WHERE request_key=?',key))throw new Error('Too many pending room checks. Reconnect before opening more tasks.');await db().runAsync('INSERT INTO requests(request_key,payload) VALUES(?,?) ON CONFLICT(request_key) DO UPDATE SET payload=excluded.payload',key,JSON.stringify(payload));});}
export async function removeRequest(key:string){return scoped(async()=>{await db().runAsync('DELETE FROM requests WHERE request_key=?',key);});}

// Run once before navigation mounts, never while an active camera/upload uses these caches.
let startupCacheCleaned=false;
export function cleanPreviousProcessCaptureCache() {
 if(startupCacheCleaned)return;startupCacheCleaned=true;
 cleanUploadCache();
 for(const name of ['Camera','ImageManipulator']){
   const directory=new Directory(Paths.cache,name);
   if(directory.exists)directory.delete();
 }
}

export async function persistSpatialCheckpoint(taskId:number,sessionId:string,spatialCheckpoint:SpatialCheckpoint){return scoped(async()=>{const row=await db().getFirstAsync<{payload:string}>('SELECT payload FROM sessions WHERE task_id=?',taskId);if(!row)return;const local=JSON.parse(row.payload) as LocalSession;if(local.session.id!==sessionId)return;await db().runAsync('UPDATE sessions SET payload=? WHERE task_id=?',JSON.stringify({...local,spatialCheckpoint}),taskId);});}
