import { Router } from "express";
import { signupManager, loginManager, getManagerProfile, getTodayStatus, createManager, getManagers, updateManager } from "../controllers/manager.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/manager-signup", signupManager);
router.post("/manager-login", loginManager);
router.get("/profile/me", verifyJwt, getManagerProfile);
router.get("/today-status", verifyJwt, authorize("ADMIN", "MANAGER"), getTodayStatus);
router.post("/", verifyJwt, authorize("ADMIN"), createManager);
router.get("/", verifyJwt, authorize("ADMIN"), getManagers);
router.patch("/:id", verifyJwt, authorize("ADMIN"), updateManager);

export default router;
