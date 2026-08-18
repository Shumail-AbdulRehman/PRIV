import { Router } from "express";
import { createTaskTemplate, editTaskTemplate, deleteTaskTemplate,getTaskTemplatesByLocation, getTaskTemplate } from "../controllers/taskTemplate.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

const MAX_REFERENCE_IMAGES = Number(process.env.MAX_REFERENCE_IMAGES ?? 10);

router.post("/", verifyJwt, authorize("ADMIN", "MANAGER"), upload.array("referenceImages", MAX_REFERENCE_IMAGES), createTaskTemplate);
router.patch("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), editTaskTemplate);
router.delete("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), deleteTaskTemplate);
router.get("/location/:locationId", verifyJwt, authorize("ADMIN", "MANAGER"), getTaskTemplatesByLocation);
router.get("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), getTaskTemplate);

export default router;
