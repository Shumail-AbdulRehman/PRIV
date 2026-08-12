import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../prisma/prisma.js";

export const verifyJwt = async (req: Request, res: Response, next: NextFunction) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized access");
    }

    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
    } catch (error) {
        throw new ApiError(401, "Access Token Expired");
    }

    const { id, role } = decoded;
    let user;
    let locationIds: number[] | undefined;

    if (role === "MANAGER" || role === "ADMIN") {
        user = await prisma.manager.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, companyId: true, isActive: true },
        });

        if (user && !user.isActive) {
            throw new ApiError(401, "Account is deactivated");
        }

        if (user && role === "MANAGER") {
            const assignments = await prisma.managerLocation.findMany({
                where: { managerId: id },
                select: { locationId: true },
            });
            locationIds = assignments.map((assignment) => assignment.locationId);
        }
    } else if (role === "STAFF") {
        user = await prisma.staff.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, companyId: true, locationId: true },
        });
    }

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    const { isActive, ...safeUser } = user as typeof user & { isActive?: boolean };
    (req as any).user = { ...safeUser, role, ...(locationIds ? { locationIds } : {}) };
    next();
};
