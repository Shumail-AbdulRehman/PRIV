import { Router } from "express";
import { createLocation, editLocation, getLocations, softDeleteLocation, getInactiveLocations,getLocationById, getLocationStatsById, restoreLocation} from "../controllers/location.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/", verifyJwt, authorize("ADMIN"), createLocation);
router.get("/", verifyJwt, authorize("ADMIN", "MANAGER"), getLocations);
router.patch("/:id", verifyJwt, authorize("ADMIN"), editLocation);
router.patch("/:id/deactivate", verifyJwt, authorize("ADMIN"), softDeleteLocation);
router.get("/inactive", verifyJwt, authorize("ADMIN"), getInactiveLocations);
router.get("/:id", verifyJwt, authorize("ADMIN", "MANAGER"), getLocationById);
router.get("/:id/stats", verifyJwt, authorize("ADMIN", "MANAGER"), getLocationStatsById);
router.patch("/:id/restore", verifyJwt, authorize("ADMIN"), restoreLocation);

    
export default router;
