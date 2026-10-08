import type { CaptureSlot, LocalSession, Manifest, QueueRow, QueueState } from './types';
export const MAX_QUEUE_BYTES = 100 * 1024 * 1024;
export const MAX_QUEUE_PHOTOS = 50;
export const terminalRequirement = (state: string) => ['PASSED', 'MANAGER_ACCEPTED', 'WAIVED'].includes(state);
export function captureAllowed(local: LocalSession, clock: { bootId: string; elapsedMs: number }) {
  if (local.paused || !['ACTIVE'].includes(local.session.state)) return false;
  if (clock.bootId !== local.anchorBootId || clock.elapsedMs < local.anchorElapsedMs) return false;
  const supportedNow = Date.parse(local.session.serverTime) + clock.elapsedMs - local.anchorElapsedMs;
  return supportedNow <= Date.parse(local.session.captureExpiresAt);
}
export function nextSlot(local: LocalSession, queue: QueueRow[]): CaptureSlot | undefined {
  const used = new Set(queue.filter(q => q.sessionId === local.session.id).map(q => q.slotId));
  const states = new Map(local.manifest.items.flatMap(i => i.requirements).map(r => [r.id, r.state]));
  return [...local.session.slots].sort((a,b) => a.sequence-b.sequence).find(slot => !slot.attemptId && !used.has(slot.id) && (!slot.requirementId || !terminalRequirement(states.get(slot.requirementId) ?? 'MISSING')));
}
export function retryOutcome(status: number | undefined, retry: number, now: number, retryAfterSeconds?: number): { state: QueueState; nextRetryAt: number } {
  if (status === 401 || status === 403) return { state: 'AUTH_REQUIRED', nextRetryAt: 0 };
  // Rejected authority remains durable; reconnect/manager help can reconcile it.
  if (status === 409 || status === 410 || status === 413 || status === 422) return { state: 'BLOCKED', nextRetryAt: 0 };
  const delay = retryAfterSeconds ? retryAfterSeconds * 1000 : Math.min(120_000, 2000 * 2 ** Math.min(retry, 6));
  return { state: 'RETRY_WAIT', nextRetryAt: now + delay + Math.floor(Math.random()*1000) };
}
export function recoverQueueState(state: QueueState): QueueState { return state === 'UPLOADING' ? 'SAVED' : state; }
export function reconciledState(local: QueueRow, accepted: { id: string; state: string } | undefined): { state: QueueState; attemptId?: string } {
  if (!accepted) return { state: recoverQueueState(local.state), attemptId: local.attemptId ?? undefined };
  return { state: ['PASSED','RECAPTURE_REQUIRED','CLEANING_REQUIRED','REVIEW_REQUIRED','PRIVACY_HOLD','SERVICE_FAILURE','MANAGER_ACCEPTED','WAIVED'].includes(accepted.state) ? 'FINAL' : 'PROCESSING', attemptId: accepted.id };
}
export function mergeManifest(local: LocalSession, manifest: Manifest): LocalSession {
  const serverSession=manifest.sessions?.find(s=>s.id===local.session.id);
  return {...local,manifest,session:{...local.session,...(serverSession?{state:serverSession.state}:{}),...(manifest.task.status==='COMPLETED'?{state:'CLOSED'}:{})}};
}
