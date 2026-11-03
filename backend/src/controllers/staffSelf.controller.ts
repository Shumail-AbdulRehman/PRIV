import type { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getStaffSelfProfile = async (req: Request, res: Response) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Sign in to continue");
  if (actor.role !== "STAFF") throw new ApiError(403, "Staff account required");

  const staff = await prisma.staff.findFirst({
    where: {
      id: actor.id,
      companyId: actor.companyId,
      role: "STAFF",
      isActive: true,
      company: { isActive: true },
    },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      isActive: true, companyId: true, locationId: true,
      createdAt: true, updatedAt: true, shiftStart: true, shiftEnd: true,
    },
  });
  if (!staff) throw new ApiError(404, "Staff not found");
  res.status(200).json(new ApiResponse(200, staff, "Profile fetched successfully"));
};
