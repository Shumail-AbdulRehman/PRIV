import { Router } from "express";
import {
  createLocation,
  editLocation,
  getLocations,
  deleteLocation,
  getLocationById,
  getLocationStatsById,
} from "../controllers/location.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/", verifyJwt, authorize("ADMIN"), createLocation);
router.get("/", verifyJwt, authorize("ADMIN", "MANAGER"), getLocations);
router.patch("/:id", verifyJwt, authorize("ADMIN"), editLocation);
router.delete("/:id", verifyJwt, authorize("ADMIN"), deleteLocation);
router.get("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), getLocationById);
router.get(
  "/:id/stats",
  verifyJwt,
  authorize("ADMIN", "MANAGER"),
  getLocationStatsById,
);

export default router;
