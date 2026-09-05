import {
  completeTask,
  getTaskInstanceById,
  getTasknstancesOfLocation,
  getTodaysTasksForStaff,
  scanAreaQr,
  startTask,
  uploadAreaPhoto,
  getAreaSubmissions,
} from "../controllers/taskInstance.controller.js";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/staff/:staffId/today", verifyJwt, getTodaysTasksForStaff);
router.post("/:taskId/start", verifyJwt, startTask);
router.post("/:taskId/area/:referenceImageId/scan", verifyJwt, scanAreaQr);
router.post(
  "/:taskId/area/:referenceImageId/upload",
  verifyJwt,
  upload.single("photo"),
  uploadAreaPhoto
);
router.post("/:taskId/complete", verifyJwt, upload.array("images", 5), completeTask);
router.get("/:taskId", verifyJwt, getTaskInstanceById);
router.get("/:taskId/area-submissions", verifyJwt, getAreaSubmissions);
router.get("/location/:locationId", verifyJwt, authorize("ADMIN", "MANAGER"), getTasknstancesOfLocation);


export default router;
