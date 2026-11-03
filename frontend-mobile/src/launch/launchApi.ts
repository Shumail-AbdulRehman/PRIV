import { client, accountRequest } from '../api/client';
import { captureAccount } from '../verification/captureAccount';
import type { ApiEnvelope, AttendanceRecord } from '../types';

export async function readAttendance() {
  const scope = captureAccount();
  if (!scope) throw new Error('Sign in again to continue.');
  return (await client.get<ApiEnvelope<AttendanceRecord[]>>('/staff/mobile/attendance', accountRequest(scope))).data.data;
}
export async function replaceOwnPassword(currentPassword: string, newPassword: string) {
  const scope = captureAccount();
  if (!scope) throw new Error('Sign in again to continue.');
  await client.post('/common/security/password', { currentPassword, newPassword }, accountRequest(scope));
}
export async function completeStaffHandoff(token: string, newPassword: string) {
  await client.post('/common/security/handoff/complete', { token: token.trim(), newPassword });
}
