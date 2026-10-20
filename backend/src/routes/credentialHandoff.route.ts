import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJwt, verifyPasswordChangeJwt } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import { changeOwnPassword, issueStaffHandoff, completeStaffHandoff } from "../services/credentialHandoff.service.js";
import { getCookieOptions } from "../utils/cookies.js";
const router = Router();
router.use((_req, res, next) => { res.setHeader("Cache-Control", "private, no-store"); next(); });
router.post("/security/password", verifyPasswordChangeJwt, async (req, res) => {
  const result = await changeOwnPassword(req.user!, req.body);
  res.clearCookie("accessToken", getCookieOptions()).clearCookie("refreshToken", getCookieOptions()).json(new ApiResponse(200, result, "Password changed. Sign in again."));
});
router.post("/security/staff/:id/handoff", verifyJwt, authorize("ADMIN", "MANAGER"), async (req, res) => {
  res.json(new ApiResponse(200, await issueStaffHandoff(req.user!, Number(req.params.id), req.body), "One-use access handoff created. Share directly with the staff member."));
});
router.post("/security/handoff/complete", async (req, res) => {
  res.json(new ApiResponse(200, await completeStaffHandoff(req.body), "Password replaced. Sign in to continue."));
});
export default router;
