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
import { prisma } from "../prisma/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { requireTaskAccess } from "../services/verification-v2/authorization.service.js";
import type {RequestHandler} from "express";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();
const legacyEvidenceOnly:RequestHandler=async(req,_res,next)=>{
 const task=await prisma.taskInstance.findFirst({where:{id:Number(req.params.taskId),staffId:req.user!.id,location:{companyId:req.user!.companyId}}});
 if(!task)throw new ApiError(404,"Task not found for this staff");
 if(task.verificationVersion===2){await requireTaskAccess(req.user!,task.id,{staffMutation:true});throw new ApiError(409,'Inventory tasks require controlled verification. Legacy evidence cannot complete this task.',[{code:'INVENTORY_VERIFICATION_REQUIRED',verificationState:task.verificationState}]);}
 next();
};

router.get("/staff/:staffId/today", verifyJwt, getTodaysTasksForStaff);
router.post("/:taskId/start", verifyJwt, authorize("STAFF"), startTask);
router.post("/:taskId/area/:referenceImageId/scan", verifyJwt, authorize("STAFF"), legacyEvidenceOnly, scanAreaQr);
router.post(
  "/:taskId/area/:referenceImageId/upload",
  verifyJwt,
  authorize("STAFF"),
  legacyEvidenceOnly,
  upload.single("photo"),
  uploadAreaPhoto
);
router.post("/:taskId/complete", verifyJwt, authorize("STAFF"), legacyEvidenceOnly, upload.array("images", 5), completeTask);
router.get("/:taskId", verifyJwt, getTaskInstanceById);
router.get("/:taskId/area-submissions", verifyJwt, getAreaSubmissions);
router.get("/location/:locationId", verifyJwt, authorize("ADMIN", "MANAGER"), getTasknstancesOfLocation);


export default router;
