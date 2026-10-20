import credentialHandoffRouter from "./credentialHandoff.route.js";
import { Router } from "express";
import { verifyOwnSecurityJwt } from "../middlewares/auth.middleware.js";
import { getCurrentUser,logOut,refreshToken } from "../controllers/common.controller.js";





const router = Router();
router.use(credentialHandoffRouter);


router.post("/logout",logOut);
router.post("/refresh-token",refreshToken);
router.get("/get-current-user",verifyOwnSecurityJwt,getCurrentUser);
export default router;
