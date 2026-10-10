import type { Account, CaptureMetadata, LocalSession, QueueRow, QueueState } from './types';
const unsupported=():never=>{throw new Error('Use the native Hygene Ops Staff app for photo verification.');};
export async function unlockQueue(_account:Account){unsupported();} export async function lockQueue(){} export function queueAccount(){return null;}
export async function saveSession(_session:LocalSession){unsupported();} export async function getSession(_id:number):Promise<LocalSession|null>{return null;} export async function savedWork():Promise<LocalSession[]>{return [];}
export async function queueRows(_id?:number):Promise<QueueRow[]>{return [];} export async function saveCapture(_metadata:CaptureMetadata,_bytes:Uint8Array){unsupported();} export async function queueBytes(_id:string):Promise<Uint8Array>{return unsupported();}
export async function updateQueue(_id:string,_state:QueueState,_options?:unknown){unsupported();} export async function pendingCount(){return 0;} export async function saveIssue(_id:number,_payload:Record<string,unknown>){unsupported();}
export async function pendingIssues():Promise<{id:string;task_id:number;payload:string}[]>{return [];} export async function removeIssue(_id:string){} export async function materializeUpload(_id:string):Promise<{uri:string;delete():void}>{return unsupported();} export function cleanUploadCache(){}

export async function getRequest(_key:string):Promise<{path:string;body:Record<string,unknown>}|null>{return null;}
export async function saveRequest(_key:string,_value:{path:string;body:Record<string,unknown>}){unsupported();}
export async function removeRequest(_key:string){unsupported();}

export function cleanPreviousProcessCaptureCache(){}

export const persistSpatialCheckpoint = async (..._args:unknown[]) => { throw new Error("Use the native app for secure photo storage."); };
