import localOperatorSessionRouter from './localOperatorSession.route.js';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import ownerIdentityRouter from './ownerIdentity.route.js';
import platformCompanyRouter from './platformCompany.route.js';
import platformSupportRouter, { customerSupportRouter } from './platformSupport.route.js';
import companySettingsRouter from './companySettings.route.js';
import attendanceAnnotationRouter from './attendanceAnnotation.route.js';
import subscriptionRouter from './subscription.route.js';
import commonRouter from './common.route.js';

// Mount before operational routers. These adapters each own their audience;
// there is deliberately no tenant-auth wrapper around public/operator routes.
const router = Router();
router.use('/owner-identity', ownerIdentityRouter);
router.use('/platform/session', localOperatorSessionRouter);
router.use('/platform/companies', platformCompanyRouter);
router.use('/platform/service', platformSupportRouter);
router.use('/support', customerSupportRouter);
router.use('/company/settings', companySettingsRouter);
router.use('/attendance', attendanceAnnotationRouter);
router.use('/subscription', subscriptionRouter);
router.use('/common', commonRouter);
export default router;

/** Known transport/schema conflicts, never raw SQL/provider errors or stacks. */
export const launchErrorHandler: import('express').ErrorRequestHandler = (error, _req, res, _next) => {
 if(error instanceof z.ZodError) error = new ApiError(400,'Check the request details',[{code:'INVALID_REQUEST'},...error.issues.map(issue=>({field:issue.path.join('.'),message:issue.message}))]);
 if(error instanceof multer.MulterError) error = new ApiError(error.code==='LIMIT_FILE_SIZE'?413:400,'Upload limit exceeded',[{code:error.code}]);
 const code = (error as {code?:unknown})?.code;
 if(code==='P2002'||code==='P2034') error = new ApiError(409,'This record changed or already exists. Refresh and try again.',[{code:'CONFLICT'}]);
 if((error as {type?:unknown})?.type==='entity.too.large') error = new ApiError(413,'Request is too large',[{code:'REQUEST_TOO_LARGE'}]);
 if(error instanceof SyntaxError && 'body' in error) error = new ApiError(400,'Invalid JSON request',[{code:'INVALID_REQUEST'}]);
 if(error instanceof ApiError) {
  res.status(error.statusCode).json({success:false,message:error.message,errors:error.errors,code:error.errors[0]?.code??({400:'INVALID_REQUEST',401:'AUTH_REQUIRED',403:'FORBIDDEN',404:'NOT_FOUND',409:'CONFLICT',410:'AUTHORITY_EXPIRED',413:'REQUEST_TOO_LARGE',422:'INVALID_EVIDENCE',429:'CAPACITY_LIMIT',503:'SERVICE_UNAVAILABLE'} as Record<number,string>)[error.statusCode],details:error.errors});
  return;
 }
 // Generic driver/provider errors can contain credential material; do not log them.
 res.status(500).json({success:false,message:'Something went wrong',code:'INTERNAL_ERROR'});
};
