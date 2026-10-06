export type VerificationSummary = { status?: string | null; verificationVersion?: number; verificationState?: string; completionOutcome?: string | null; completionTiming?: string | null };
export function verificationLabel(task: VerificationSummary): string {
  if (task.completionOutcome === 'VERIFIED_COMPLETE') return 'Verified complete';
  if (task.completionOutcome === 'COMPLETED_WITH_EXCEPTIONS') return 'Completed with exceptions';
  if (task.completionOutcome === 'LEGACY_RECORDED') return 'Previously completed';
  const labels: Record<string, string> = { NOT_STARTED: 'Not started', CAPTURING: 'Taking photos', PROCESSING: 'Waiting for checks', REWORK_REQUIRED: 'Staff fixing', NEEDS_REVIEW: 'Needs manager', VERIFIED: 'Verified complete', RESOLVED_WITH_EXCEPTIONS: 'Completed with exceptions' };
  return labels[task.verificationState ?? ''] ?? (task.status ?? 'Pending').replaceAll('_', ' ').toLowerCase();
}
export function timingLabel(value?: string | null): string {
  return ({ ON_TIME_SERVER_OBSERVED: 'Evidence received on time', ON_TIME_DEVICE_REPORTED: 'Captured on time, reported by device', LATE: 'Evidence captured late', UNCERTAIN: 'Capture timing needs review' } as Record<string, string>)[value ?? ''] ?? '';
}
export function exceptionStateLabel(state: string): string {
  return ({ OPEN: 'Needs manager', MANAGER_REVIEW: 'Needs manager', STAFF_ACTION_REQUIRED: 'Staff fixing', WAITING_SERVICE: 'Waiting for service', RESOLVED: 'Resolved' } as Record<string, string>)[state] ?? state.replaceAll('_', ' ').toLowerCase();
}
export function plainReason(code: string): string {
  return code.toLowerCase().replaceAll('_', ' ').replace(/^./, character => character.toUpperCase());
}
