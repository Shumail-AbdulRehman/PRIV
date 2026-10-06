import { client } from '@/api/client';
import type { ExceptionAction, ExceptionDetail, ExceptionFilters, VerificationException } from './types';
export const getExceptions = async (filters: ExceptionFilters = {}, cursor?: string) => (await client.get<{data:{cases:VerificationException[];nextCursor:string|null;unreadCount:number;total?:number}}>(`/verification-exceptions`,{params:{...filters,cursor}})).data.data;
export const getException = async (id: number, cursor?: string) => (await client.get<{data:ExceptionDetail}>(`/verification-exceptions/${id}`,{params:{cursor}})).data.data;
export const readException = async (id: number) => (await client.post(`/verification-exceptions/${id}/read`)).data.data;
export const decideException = async (id: number, input: {requestId:string;expectedVersion:number;issueId?:number;requirementId?:string;action:ExceptionAction;reasonCode:string;note?:string;evidenceAttemptId?:string;extensionMinutes?:number}) => (await client.post(`/verification-exceptions/${id}/actions`,input)).data.data;
