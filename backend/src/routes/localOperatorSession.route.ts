import { Router } from 'express';
import { localOperatorSessions, LOCAL_OPERATOR_COOKIE, localOperatorCookieOptions } from '../services/localOperatorSession.service.js';
const router = Router();
router.use((_req,res,next)=>{res.setHeader('Cache-Control','private, no-store');next();});
router.get('/',(req,res)=>res.json({data:localOperatorSessions.status(req)}));
router.post('/login',async(req,res)=>{
  const session=await localOperatorSessions.login(req,req.body);
  res.cookie(LOCAL_OPERATOR_COOKIE,session.token,{...localOperatorCookieOptions,expires:session.expiresAt})
    .json({data:{authenticated:true,email:session.email,expiresAt:session.expiresAt}});
});
router.post('/logout',(req,res)=>{
  localOperatorSessions.logout(req);
  res.clearCookie(LOCAL_OPERATOR_COOKIE,localOperatorCookieOptions).json({data:{authenticated:false}});
});
export default router;
