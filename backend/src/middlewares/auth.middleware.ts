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

    if (role === "MANAGER") {
        user = await prisma.manager.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, companyId: true },
        });
    } else if (role === "STAFF") {
        user = await prisma.staff.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, companyId: true, locationId: true },
        });
    }

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

   (req as any).user = { ...user, role };
    next();
};