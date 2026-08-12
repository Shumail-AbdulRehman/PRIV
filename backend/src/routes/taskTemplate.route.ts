import { Router } from "express";
import { createTaskTemplate, editTaskTemplate, deleteTaskTemplate,getTaskTemplatesByLocation, getTaskTemplate } from "../controllers/taskTemplate.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/", verifyJwt, authorize("ADMIN", "MANAGER"), createTaskTemplate);
router.patch("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), editTaskTemplate);
router.delete("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), deleteTaskTemplate);
router.get("/location/:locationId", verifyJwt, authorize("ADMIN", "MANAGER"), getTaskTemplatesByLocation);
router.get("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), getTaskTemplate);

export default router;
