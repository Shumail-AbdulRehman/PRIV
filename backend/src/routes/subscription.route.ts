import billingLifecycleRouter from "./billingLifecycle.route.js";
import { createEnterpriseInquiry } from "../controllers/enterpriseInquiry.controller.js";
import { Router } from "express";
import {
  getPricingContext,
  getSubscription,
  createCustomerPortalSession,
} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();
router.use("/manage", billingLifecycleRouter);

router.get("/pricing-context", getPricingContext);
router.post("/enterprise-inquiries", createEnterpriseInquiry);
router.get("/", verifyJwt, authorize("ADMIN", "MANAGER"), getSubscription);
router.post("/portal-session", verifyJwt, authorize("ADMIN"), createCustomerPortalSession);

export default router;
