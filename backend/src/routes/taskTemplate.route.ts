import { Router } from "express";
import { createTaskTemplate, editTaskTemplate, deleteTaskTemplate,getTaskTemplatesByLocation, getTaskTemplate } from "../controllers/taskTemplate.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/", verifyJwt, authorize, createTaskTemplate);
router.patch("/:id", verifyJwt, authorize, editTaskTemplate);
router.delete("/:id", verifyJwt, authorize, deleteTaskTemplate);
router.get("/location/:locationId", verifyJwt, authorize, getTaskTemplatesByLocation);
router.get("/:id", verifyJwt, authorize, getTaskTemplate);

export default router;
