import type { BufferedAssessment } from './bufferedPhoto.provider.js';
export type Decision = { state: 'PASSED' | 'REVIEW_REQUIRED' | 'RECAPTURE_REQUIRED' | 'CLEANING_REQUIRED'; reason: string; keep: boolean };
export function bufferedDecision(assessment: BufferedAssessment, automaticAcceptance: boolean): Decision {
  if (assessment.originality === 'SCREEN_RECAPTURE') return { state: 'RECAPTURE_REQUIRED', reason: 'PHOTO_OF_SCREEN', keep: false };
  if (assessment.cleanliness?.surfaces.some(s => s.verdict === 'DIRTY')) return { state: 'CLEANING_REQUIRED', reason: 'CLEANING_REQUIRED', keep: false };
  if (assessment.originality === 'UNCERTAIN') return { state: 'REVIEW_REQUIRED', reason: 'PHOTO_ORIGIN_UNCERTAIN', keep: true };
  if (assessment.cleanliness?.details?.assessmentStatus === 'THRESHOLD_UNCONFIGURED') return { state: 'REVIEW_REQUIRED', reason: 'CLEF_CALIBRATION_REQUIRED', keep: true };
  if (assessment.cleanliness?.verdict === 'CANNOT_ASSESS') return { state: 'REVIEW_REQUIRED', reason: 'CANNOT_ASSESS', keep: true };
  if (assessment.cleanliness && !automaticAcceptance) return { state: 'REVIEW_REQUIRED', reason: 'AUTO_PASS_NOT_VALIDATED', keep: true };
  return { state: 'PASSED', reason: 'CLEAN', keep: true };
}
