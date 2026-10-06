import { client } from '@/api/client';
import type { VerificationManifest, EvidenceAttempt } from './types';
export const getVerification = async (id: number) => (await client.get<{data: VerificationManifest}>(`/task-instance/${id}/verification`)).data.data;
export const getVerificationHistory = async (id: number, cursor?: string) => (await client.get<{data:{attempts:EvidenceAttempt[];nextCursor:string|null}}>(`/task-instance/${id}/verification/history`,{params:{cursor}})).data.data;
export const getEvidenceBlob = async (id: string, signal?: AbortSignal) => (await client.get<Blob>(`/evidence/${encodeURIComponent(id)}/content`, {params:{variant:'review'},responseType:'blob',signal})).data;
