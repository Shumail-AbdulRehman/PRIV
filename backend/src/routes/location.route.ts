import { Router } from "express";
import { createLocation, editLocation, getLocations, softDeleteLocation, getInactiveLocations,getLocationById, getLocationStatsById, restoreLocation} from "../controllers/location.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/", verifyJwt, authorize, createLocation);
router.get("/", verifyJwt, authorize, getLocations);
router.patch("/:id", verifyJwt, authorize, editLocation);
router.patch("/:id/deactivate", verifyJwt, authorize, softDeleteLocation);
router.get("/inactive", verifyJwt, authorize, getInactiveLocations);
router.get("/:id", verifyJwt, authorize, getLocationById);
router.get("/:id/stats", verifyJwt, authorize, getLocationStatsById);
router.patch("/:id/restore", verifyJwt, authorize, restoreLocation);

    
export default router;
