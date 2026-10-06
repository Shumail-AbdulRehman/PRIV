import { z } from 'zod';

export const WORKFLOW_VERSION = 2 as const;
export const reasonCodeSchema = z.enum([
  'CANNOT_ASSESS', 'WRONG_ITEM', 'MISSING_SURFACE', 'PHOTO_TOO_DARK', 'PHOTO_BLURRY',
  'PHOTO_TOO_SMALL', 'DUPLICATE_EVIDENCE', 'IDENTITY_UNCERTAIN', 'SERVICE_FAILURE',
  'PRIVACY_HOLD', 'OCCUPIED', 'DAMAGED', 'INACCESSIBLE', 'GPS_STALE', 'GPS_INACCURATE',
  'GPS_OUTSIDE', 'GPS_UNCERTAIN', 'CONTEXT_UNCERTAIN', 'MISSING_EVIDENCE', 'CLEANING_REQUIRED',
  'STALE_ASSIGNMENT', 'CLOCK_UNCERTAIN', 'SETUP_REQUIRED', 'CLEAN',
]);
export type ReasonCode = z.infer<typeof reasonCodeSchema>;
export const presenceSchema = z.enum(['ACCEPTABLE', 'UNCERTAIN', 'OUTSIDE']);
export const requirementStateSchema = z.enum(['MISSING','PROCESSING','PASSED','RECAPTURE_REQUIRED','CLEANING_REQUIRED','REVIEW_REQUIRED','MANAGER_ACCEPTED','WAIVED']);
export const sessionStateSchema = z.enum(['ACTIVE','PAUSED','CLOSED','EXPIRED','REVOKED']);
export const attemptStateSchema = z.enum(['RESERVED','STORING','RECEIVED','QUALITY_CHECK','COVERAGE_CHECK','CLEANLINESS_CHECK','PASSED','RECAPTURE_REQUIRED','CLEANING_REQUIRED','REVIEW_REQUIRED','RETRY_WAIT','SERVICE_FAILURE','PRIVACY_HOLD']);
export const requiredViewsSchema = z.array(z.object({key:z.string().min(1).max(80),instructions:z.string().min(1).max(1000),mandatory:z.boolean().default(true)})).min(1).max(10).refine(views=>new Set(views.map(v=>v.key)).size===views.length,'Views must be unique');
export const locationSampleSchema = z.object({latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180),accuracy:z.number().nonnegative().max(10000),sampledAt:z.iso.datetime()}).strict();
export const sessionRequestSchema = z.object({workflowVersion:z.literal(2).default(2),requestId:z.uuid(),areaQr:z.string().max(2048),deviceId:z.string().min(1).max(200),clientBootId:z.string().min(1).max(200),location:locationSampleSchema,clientTime:z.iso.datetime()}).strict();
export const captureMetadataSchema = z.object({clientCaptureId:z.uuid(),slotId:z.uuid(),nonce:z.string().min(32).max(256),sha256:z.string().regex(/^[a-f0-9]{64}$/),claimedCapturedAt:z.iso.datetime(),elapsedMs:z.coerce.number().int().nonnegative().max(24*60*60*1000),bootId:z.string().min(1).max(200)}).strict();
export const decisionRequestSchema = z.object({requestId:z.uuid(),expectedVersion:z.number().int().nonnegative(),issueId:z.number().int().positive().optional(),requirementId:z.uuid().optional(),action:z.enum(['ACCEPT_EVIDENCE','ACCEPT_CONTEXT','REJECT_EVIDENCE','REQUEST_RECAPTURE','REQUEST_CLEANING','MARK_MAINTENANCE','WAIVE_REQUIREMENT','EXTEND_WINDOW','RESOLVE_ISSUE']),reasonCode:reasonCodeSchema,note:z.string().trim().min(1).max(1000),evidenceAttemptId:z.uuid().optional()}).strict();
export const verificationManifestSchema = z.object({workflowVersion:z.literal(2),taskId:z.number().int().positive(),areaId:z.number().int().positive(),areaName:z.string(),inventoryVersion:z.number().int().positive(),assignmentEpoch:z.number().int().nonnegative(),locationTimezone:z.string(),items:z.array(z.object({id:z.number().int().positive(),name:z.string(),mandatory:z.boolean(),state:requirementStateSchema,requirements:z.array(z.object({id:z.uuid(),viewKey:z.string(),instructions:z.string(),mandatory:z.boolean(),state:requirementStateSchema,decisionVersion:z.number().int().nonnegative()}))}))});
