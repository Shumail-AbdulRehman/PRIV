import {getTodaysTasksForStaff, startTask, completeTask, getTaskInstanceById, getTasknstancesOfLocation} from "../controllers/taskInstance.controller.js";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/staff/:staffId/today", verifyJwt, getTodaysTasksForStaff);
router.post("/:taskId/start", verifyJwt, startTask);
router.post("/:taskId/complete", verifyJwt,upload.array("images", 5), completeTask);
router.get("/:taskId", verifyJwt, getTaskInstanceById);
router.get("/location/:locationId", verifyJwt, authorize, getTasknstancesOfLocation);


export default router;