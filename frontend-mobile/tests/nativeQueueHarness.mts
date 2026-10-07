// Real SQLite + mocked Expo adapters. This proves JS/SQL durability, not SQLCipher or a physical device.
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync,writeFileSync,readFileSync,unlinkSync,existsSync,readdirSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { randomBytes,randomUUID,createHash } from 'node:crypto';
const directory=process.env.QUEUE_TEST_DIRECTORY!;
mkdirSync(directory,{recursive:true});
let connected=true;let appState="active";
let freeBytes=1000*1024*1024;
let cipherAvailable=true;
class TestFile {
 path:string;name:string;uri:string;
 constructor(parent:string|{path:string},name?:string){
  // Android Expo FileSystem requires an absolute URI, unlike SQLite's raw path.
  const base=typeof parent==='string'?fileURLToPath(parent):parent.path;
  this.path=name?join(base,name):base;this.name=this.path.split('/').at(-1)!;this.uri=pathToFileURL(this.path).href;
 }
 get exists(){return existsSync(this.path);}
 create(){writeFileSync(this.path,'');}
 write(data:Uint8Array){writeFileSync(this.path,data);}
 delete(){unlinkSync(this.path);}
}
class TestDirectory {
 path:string;
 constructor(parent:string|{path:string},name:string){this.path=join(typeof parent==='string'?parent:parent.path,name);}
 get exists(){return existsSync(this.path);}
 delete(){rmSync(this.path,{recursive:true,force:true});}
}
function openDatabaseAsync(name:string){const sql=new DatabaseSync(join(directory,name));const params=(input:unknown[])=>input.length===1&&Array.isArray(input[0])?input[0]:input;const db={
 execAsync:async(text:string)=>sql.exec(text.replace(/PRAGMA key[^;]*;/g,'')),
 getFirstAsync:async(text:string,...values:unknown[])=>text==='PRAGMA cipher_version;'?(cipherAvailable?{cipher_version:'TEST_ADAPTER_NOT_ENCRYPTED'}:null):sql.prepare(text).get(...params(values) as never[]),
 getAllAsync:async(text:string,...values:unknown[])=>sql.prepare(text).all(...params(values) as never[]),
 runAsync:async(text:string,...values:unknown[])=>sql.prepare(text).run(...params(values) as never[]),
 closeAsync:async()=>sql.close(),
 withExclusiveTransactionAsync:async(fn:(tx:unknown)=>Promise<void>)=>{sql.exec('BEGIN IMMEDIATE');try{await fn(db);sql.exec('COMMIT');}catch(error){sql.exec('ROLLBACK');throw error;}}
};return Promise.resolve(db);}
const secure={getItemAsync:async(key:string)=>existsSync(join(directory,key))?readFileSync(join(directory,key),'utf8'):null,setItemAsync:async(key:string,value:string)=>writeFileSync(join(directory,key),value),WHEN_UNLOCKED_THIS_DEVICE_ONLY:1};
(globalThis as unknown as {queueHarness:unknown}).queueHarness={sqlite:{openDatabaseAsync,defaultDatabaseDirectory:directory},secure,crypto:{getRandomBytesAsync:async(n:number)=>randomBytes(n),randomUUID},fs:{File:TestFile,Directory:TestDirectory,Paths:{cache:{path:directory,list:()=>readdirSync(directory).map(n=>new TestFile({path:directory},n))}}},free:()=>freeBytes,
 rn:{AppState:{get currentState(){return appState;},addEventListener:()=>({remove(){}})}},
 network:{fetch:async()=>({isConnected:connected,isInternetReachable:connected}),addEventListener:()=>()=>{}},
 location:{requestForegroundPermissionsAsync:async()=>({granted:true}),getCurrentPositionAsync:async()=>({coords:{latitude:0,longitude:0,accuracy:1},timestamp:Date.now()}),Accuracy:{Highest:1}},
 native:{requireOptionalNativeModule:()=>({clock:()=>({bootId:'test-boot',elapsedMs:1000})})}
};
const mocks:Record<string,string>={
 'react-native':'module.exports=globalThis.queueHarness.rn;',
 '@react-native-community/netinfo':'module.exports=globalThis.queueHarness.network;',
 'expo-location':'module.exports=globalThis.queueHarness.location;',
 'expo-modules-core':'module.exports=globalThis.queueHarness.native;',
 'expo-sqlite':'module.exports=globalThis.queueHarness.sqlite;',
 'expo-secure-store':'module.exports=globalThis.queueHarness.secure;',
 'expo-crypto':'module.exports=globalThis.queueHarness.crypto;',
 'expo-file-system':'module.exports=globalThis.queueHarness.fs;',
 'expo-file-system/legacy':'module.exports={getFreeDiskStorageAsync:async()=>globalThis.queueHarness.free()};'
};
const urls:Record<string,string>={};for(const [name,source] of Object.entries(mocks)){const file=join(directory,`mock-${name.replaceAll('/','-')}.cjs`);writeFileSync(file,source);urls[name]=pathToFileURL(file).href;}
registerHooks({resolve(specifier,context,next){if(specifier in urls)return {url:urls[specifier],shortCircuit:true};return next(specifier,context);}});
export const setConnectivity=(value:boolean)=>{connected=value;};
export const setAppState=(value:string)=>{appState=value;};
export const setFreeBytes=(bytes:number)=>{freeBytes=bytes;};
export const setCipherAvailable=(value:boolean)=>{cipherAvailable=value;};
export const queue=await import('../src/verification/queue');
if(process.argv.includes('--seed-and-wait')){
 await queue.unlockQueue({companyId:1,id:1});
 await queue.saveCapture({taskId:7,sessionId:'original-session',slotId:'original-slot',clientCaptureId:'capture-id',sha256:'same-hash',nonce:'nonce',claimedCapturedAt:'2026-10-06T10:00:00Z',elapsedMs:10,bootId:'same-boot',deviceId:'device'},new Uint8Array([4,5,6]));
 await queue.updateQueue('capture-id','UPLOADING');
 process.stdout.write('DURABLE\n');setInterval(()=>{},1000);
}
