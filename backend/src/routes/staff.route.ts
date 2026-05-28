import { Router } from "express";
import { loginStaff, createStaff, getStaff, softDeleteStaff , getInactiveStaff, getStaffById, getStaffByLocation, getProfile, editStaff, getStaffDetails } from "../controllers/staff.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/staff-login", loginStaff);
router.post("/create-staff", verifyJwt, authorize, createStaff);

router.get("/", verifyJwt, authorize, getStaff);
router.get("/inactive", verifyJwt, authorize, getInactiveStaff);
router.get("/profile/me", verifyJwt, getProfile);
router.get("/details/:id", verifyJwt, authorize, getStaffDetails);
router.get("/location/:locationId", verifyJwt, authorize, getStaffByLocation);

router.get("/:id", verifyJwt, authorize, getStaffById);
router.patch("/:id/deactivate", verifyJwt, authorize, softDeleteStaff);
router.patch("/:id", verifyJwt, authorize, editStaff);

export default router;
