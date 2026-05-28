import { Router } from "express";
import { checkIn, checkOut, getMyAttendance, getStaffAttendance, assignShiftToStaff } from "../controllers/attendance.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import upload from "../middlewares/upload.middleware.js";


const router = Router();

router.patch("/staff/:id/shift", verifyJwt, authorize, assignShiftToStaff);
router.post("/check-in", (req, _res, next) => { console.log("[DEBUG] POST /check-in hit, content-type:", req.headers["content-type"]); next(); }, verifyJwt, upload.single("image"), checkIn);
router.post("/check-out" ,verifyJwt,upload.single("image"), checkOut);
router.get("/my", verifyJwt, getMyAttendance);
router.get("/", verifyJwt, authorize, getStaffAttendance);

export default router;
