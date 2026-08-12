import { Router } from "express";
import { assignStaffToLocation, assignStaffToTaskTemplate } from "../controllers/assignment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.patch("/staff/:staffId/location/:locationId", verifyJwt, authorize("ADMIN", "MANAGER"), assignStaffToLocation);
router.patch("/task-template/:templateId/staff/:staffId", verifyJwt, authorize("ADMIN", "MANAGER"), assignStaffToTaskTemplate);

export default router;
