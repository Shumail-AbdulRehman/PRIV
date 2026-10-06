import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import type { Account, CaptureMetadata, LocalSession, QueueRow, QueueState } from './types';
import { MAX_QUEUE_BYTES, MAX_QUEUE_PHOTOS } from './policy';
let database: SQLite.SQLiteDatabase | null = null;
let activeAccount: string | null = null;
let opening: Promise<void> | null = null;
const namespace = (account: Account) => `${account.companyId}_${account.id}`;
export async function unlockQueue(account: Account) {
  if (opening) await opening;
  if (activeAccount === namespace(account) && database) return;
  opening = (async () => {
    await lockQueue();
    const scope = namespace(account), keyName = `hygene_verification_key_${scope}`;
    let key = await SecureStore.getItemAsync(keyName);
    if (!key) { key = Array.from(await Crypto.getRandomBytesAsync(32)).map(v => v.toString(16).padStart(2,'0')).join(''); await SecureStore.setItemAsync(keyName,key, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }); }
    if (!/^[0-9a-f]{64}$/.test(key)) throw new Error('Secure photo storage is unavailable. Sign in again.');
    const db = await SQLite.openDatabaseAsync(`verification_${scope}.db`);
    try {
      await db.execAsync(`PRAGMA key = "x'${key}'";`);
      const cipher = await db.getFirstAsync<Record<string,string>>('PRAGMA cipher_version;');
      if (!cipher || !Object.values(cipher).some(Boolean)) throw new Error('Encrypted photo storage requires a native build.');
      await db.execAsync(`PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS sessions (task_id INTEGER PRIMARY KEY, payload TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS queue (id TEXT PRIMARY KEY, task_id INTEGER NOT NULL, session_id TEXT NOT NULL, slot_id TEXT NOT NULL UNIQUE,
          metadata TEXT NOT NULL, photo BLOB, bytes INTEGER NOT NULL, state TEXT NOT NULL, retries INTEGER NOT NULL DEFAULT 0,
          next_retry_at INTEGER NOT NULL DEFAULT 0, attempt_id TEXT, last_error TEXT);
        CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, task_id INTEGER NOT NULL, payload TEXT NOT NULL);
        UPDATE queue SET state='SAVED' WHERE state='UPLOADING';`);
      database = db; activeAccount = scope;
    } catch(error) { await db.closeAsync(); throw error; }
  })();
  try { await opening; } finally { opening = null; }
}
export async function lockQueue() { const previous=database; database=null;activeAccount=null; if(previous) await previous.closeAsync(); }
export function queueAccount() { return activeAccount; }
function db() { if(!database || !activeAccount) throw new Error('Sign in to open your saved photos.'); return database; }
export async function saveSession(local: LocalSession) { await db().runAsync('INSERT INTO sessions(task_id,payload) VALUES(?,?) ON CONFLICT(task_id) DO UPDATE SET payload=excluded.payload', local.manifest.task.id,JSON.stringify(local)); }
export async function getSession(taskId: number): Promise<LocalSession | null> { const row=await db().getFirstAsync<{payload:string}>('SELECT payload FROM sessions WHERE task_id=?',taskId);return row?JSON.parse(row.payload):null; }
export async function savedWork():Promise<LocalSession[]> { return (await db().getAllAsync<{payload:string}>('SELECT payload FROM sessions')).map(r=>JSON.parse(r.payload)); }
type RawRow = Omit<QueueRow,'metadata'|'taskId'|'sessionId'|'slotId'|'nextRetryAt'|'attemptId'|'lastError'> & { metadata:string;task_id:number;session_id:string;slot_id:string;next_retry_at:number;attempt_id:string|null;last_error:string|null };
export async function queueRows(taskId?:number): Promise<QueueRow[]> { const rows=await db().getAllAsync<RawRow>(taskId?'SELECT id,task_id,session_id,slot_id,metadata,bytes,state,retries,next_retry_at,attempt_id,last_error FROM queue WHERE task_id=? ORDER BY rowid':'SELECT id,task_id,session_id,slot_id,metadata,bytes,state,retries,next_retry_at,attempt_id,last_error FROM queue ORDER BY rowid',taskId?[taskId]:[]);return rows.map(r=>({ ...r,metadata:JSON.parse(r.metadata),taskId:r.task_id,sessionId:r.session_id,slotId:r.slot_id,nextRetryAt:r.next_retry_at,attemptId:r.attempt_id,lastError:r.last_error })); }
export async function saveCapture(metadata:CaptureMetadata, bytes:Uint8Array) {
  if(bytes.byteLength>5*1024*1024) throw new Error('Photo is too large. Please retake it.');
  await db().withExclusiveTransactionAsync(async(tx)=>{
    const total=await tx.getFirstAsync<{count:number;size:number}>('SELECT COUNT(*) AS count, COALESCE(SUM(bytes),0) AS size FROM queue WHERE photo IS NOT NULL');
    if((total?.count??0)>=MAX_QUEUE_PHOTOS || (total?.size??0)+bytes.byteLength>MAX_QUEUE_BYTES) throw new Error('Photo storage is full. Connect to upload your saved photos before taking more.');
    await tx.runAsync('INSERT INTO queue(id,task_id,session_id,slot_id,metadata,photo,bytes,state) VALUES(?,?,?,?,?,?,?,?)',metadata.clientCaptureId,metadata.taskId,metadata.sessionId,metadata.slotId,JSON.stringify(metadata),bytes,bytes.byteLength,'SAVED');
  });
}
export async function queueBytes(id:string) { const row=await db().getFirstAsync<{photo:Uint8Array|null}>('SELECT photo FROM queue WHERE id=?',id);if(!row?.photo) throw new Error('Saved photo unavailable.');return row.photo; }
export async function updateQueue(id:string,state:QueueState, options:{attemptId?:string;error?:string;nextRetryAt?:number;retry?:boolean;releaseBytes?:boolean}={}) {
  await db().runAsync('UPDATE queue SET state=?, attempt_id=COALESCE(?,attempt_id), last_error=?, next_retry_at=?, retries=retries+?, photo=CASE WHEN ? THEN NULL ELSE photo END WHERE id=?',state,options.attemptId??null,options.error??null,options.nextRetryAt??0,options.retry?1:0,options.releaseBytes?1:0,id);
}
export async function pendingCount() { return (await db().getFirstAsync<{count:number}>('SELECT COUNT(*) AS count FROM queue WHERE photo IS NOT NULL'))?.count??0; }
export async function saveIssue(taskId:number,payload:Record<string,unknown>) { const id=Crypto.randomUUID();await db().runAsync('INSERT INTO issues(id,task_id,payload) VALUES(?,?,?)',id,taskId,JSON.stringify({...payload,requestId:id})); }
export async function pendingIssues() { return db().getAllAsync<{id:string;task_id:number;payload:string}>('SELECT * FROM issues'); }
export async function removeIssue(id:string) { await db().runAsync('DELETE FROM issues WHERE id=?',id); }
export async function materializeUpload(id:string) { const file=new File(Paths.cache,`verification-upload-${id}.jpg`);file.create({overwrite:true});file.write(await queueBytes(id));return file; }
export function cleanUploadCache() { const files=Paths.cache.list();for(const file of files) if(file instanceof File && file.name.startsWith('verification-upload-')) file.delete(); }
