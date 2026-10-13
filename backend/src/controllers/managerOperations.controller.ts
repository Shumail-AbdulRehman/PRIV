import type { Request, Response } from "express";
import { z } from "zod";
import { operationsQuery } from "../services/operationsScope.service.js";
import { managerOperations } from "../services/managerOperations.service.js";
import { ApiError } from "../utils/ApiError.js";
export const operationsRead =
  (kind: "overview" | "staff" | "tasks") =>
  async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: await managerOperations(
          req.user!,
          operationsQuery.parse(req.query),
          kind,
        ),
      });
    } catch (e) {
      if (e instanceof z.ZodError)
        throw new ApiError(400, "Invalid daily filters", e.issues);
      throw e;
    }
  };
