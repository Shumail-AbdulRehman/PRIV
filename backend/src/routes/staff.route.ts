import { Router } from "express";
import { loginStaff, createStaff, getStaff, softDeleteStaff , getInactiveStaff, getStaffById, getStaffByLocation, getProfile, editStaff, getStaffDetails } from "../controllers/staff.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/staff-login", loginStaff);
router.post("/create-staff", verifyJwt, authorize("ADMIN", "MANAGER"), createStaff);

router.get("/", verifyJwt, authorize("ADMIN", "MANAGER"), getStaff);
router.get("/inactive", verifyJwt, authorize("ADMIN", "MANAGER"), getInactiveStaff);
router.get("/profile/me", verifyJwt, getProfile);
router.get("/details/:id", verifyJwt, authorize("ADMIN", "MANAGER"), getStaffDetails);
router.get("/location/:locationId", verifyJwt, authorize("ADMIN", "MANAGER"), getStaffByLocation);

router.get("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), getStaffById);
router.patch("/:id/deactivate", verifyJwt, authorize("ADMIN", "MANAGER"), softDeleteStaff);
router.patch("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), editStaff);

export default router;
