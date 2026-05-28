import { Router } from "express";
import { signupManager, loginManager, getManagerProfile, getTodayStatus } from "../controllers/manager.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/manager-signup", signupManager);
router.post("/manager-login", loginManager);
router.get("/profile/me", verifyJwt, getManagerProfile);
router.get("/today-status", verifyJwt, authorize, getTodayStatus);

export default router;
