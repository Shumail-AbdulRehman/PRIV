import attendancePhotosRouter from "./attendancePhotos.route.js";
import { getStaffSelfAttendance } from "../controllers/attendanceSelf.controller.js";
import { Router } from "express";
import { checkIn, checkOut, getStaffAttendance, assignShiftToStaff } from "../controllers/attendance.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import upload from "../middlewares/upload.middleware.js";


const router = Router();
router.use(attendancePhotosRouter);

router.patch("/staff/:id/shift", verifyJwt, authorize("ADMIN", "MANAGER"), assignShiftToStaff);
router.post("/check-in", verifyJwt, authorize("STAFF"), upload.single("image"), checkIn);
router.post("/check-out", verifyJwt, authorize("STAFF"), upload.single("image"), checkOut);
router.get("/my", verifyJwt, authorize("STAFF"), getStaffSelfAttendance);
router.get("/", verifyJwt, authorize("ADMIN", "MANAGER"), getStaffAttendance);

export default router;
