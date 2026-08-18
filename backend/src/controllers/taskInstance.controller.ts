import crypto from "node:crypto";
import { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getUtcDayRange, getZonedDayRange } from "../utils/dateTime.js";
import { uploadMultipleImages } from "../utils/cloudinary.js";
import {
  markCurrentAssignmentCompleted,
  markCurrentAssignmentStarted,
} from "../services/taskAssignment.service.js";
import { assertLocationAccess } from "../utils/scope.js";
import { getVerificationProvider } from "../services/verification/imageVerification.service.js";
import { VerificationError } from "../services/verification/imageVerification.types.js";
import { writeAuditLog } from "../services/auditLog.service.js";


export const getTodaysTasksForStaff = async (req: Request, res: Response) => {
  const staffId = Number(req.params.staffId);

  if (isNaN(staffId)) {
    throw new ApiError(400, "Invalid staff id");
  }

  const staff = await prisma.staff.findUnique({
    where: { id: staffId, isActive:true },
    include: { location: { select: { timezone: true } } },
  });

  if (!staff || staff.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Staff not found in your company");
  }

const { start: today, end: tomorrow } = staff.location?.timezone
  ? getZonedDayRange(new Date(), staff.location.timezone)
  : getUtcDayRange();

const tasks = await prisma.taskInstance.findMany({
  where: {
    staffId,
    date: {
      gte: today,
      lt: tomorrow
    },
    isActive: true
  },
  include: {
    referenceImages: {
      select: {
        id: true,
        name: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
    },
    template: {
      include: {
        location: true
      }
    }
  }
});

  res.status(200).json(new ApiResponse(200, tasks, "Today's tasks fetched successfully"));
};

export const startTask = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);
  const qrToken = req.query.qrToken;

  if (isNaN(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }

  if (typeof qrToken !== "string" || !qrToken.trim()) {
    throw new ApiError(400, "Invalid qr token");
  }

  const template = await prisma.taskTemplate.findUnique({
    where: { qrToken },
  });

  if (!template) {
    throw new ApiError(404, "Invalid QR code");
  }

  const task = await prisma.taskInstance.findUnique({
    where: { id: taskId },
  });

  if (!task || !task.isActive || task.staffId !== req.user!.id) {
    throw new ApiError(404, "Task not found for this staff");
  }

  if (!task.templateId) {
    throw new ApiError(400, "Task is not linked to a template");
  }

  if (task.templateId !== template.id) {
    throw new ApiError(400, "QR code does not belong to this task");
  }

  if (task.status !== "PENDING") {
    throw new ApiError(400, "Only pending tasks can be started");
  }

  const now = new Date();

  if (task.shiftEnd <= now) {
    throw new ApiError(400, "Task time ended");
  }

  const GRACE_PERIOD_MINUTES = 5;
  const nowPlusGrace = new Date(now.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000);

  if (task.shiftStart > nowPlusGrace) {
    throw new ApiError(400, "Task hasn't started yet");
  }

  const graceDeadline = new Date(task.shiftStart.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000);
  const isLate = now > graceDeadline;

  if (isLate) {
    const lateMinutes = Math.floor((now.getTime() - task.shiftStart.getTime()) / (1000 * 60));

    const taskStartedLate = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.taskInstance.update({
        where: { id: taskId },
        data: {
          status: "IN_PROGRESS",
          startedAt: now,
          isLate: true,
          lateMinutes,
        },
      });

      await markCurrentAssignmentStarted(taskId, req.user!.id, now, tx as typeof prisma);

      return updatedTask;
    });

    return res.status(200).json(new ApiResponse(200, taskStartedLate, "Task started late"));
  }

  const taskStarted = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.taskInstance.update({
      where: { id: taskId },
      data: {
        status: "IN_PROGRESS",
        startedAt: now,
      },
    });

    await markCurrentAssignmentStarted(taskId, req.user!.id, now, tx as typeof prisma);

    return updatedTask;
  });

  return res.status(200).json(new ApiResponse(200, taskStarted, "Task started successfully"));
};

const LOCATION_MATCH_THRESHOLD = Number(process.env.LOCATION_MATCH_THRESHOLD ?? 70);
const CLEANLINESS_THRESHOLD = Number(process.env.CLEANLINESS_THRESHOLD ?? 70);

const normalizeAreaNames = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v ?? "").trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

export const completeTask = async (req: Request, res: Response) => {
    const files = Array.isArray(req.files) ? req.files : [];

    const taskId = Number(req.params.taskId);

    if (isNaN(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }

    if (!files.length) {
        throw new ApiError(400, "At least one completion image is required");
    }

    const task = await prisma.taskInstance.findUnique({
        where: { id: taskId },
        include: {
            referenceImages: {
                orderBy: { sortOrder: "asc" },
            },
        },
    });

    if (!task || !task.isActive || task.staffId !== req.user!.id) {
        throw new ApiError(404, "Task not found for this staff");
    }

    if (task.status !== "IN_PROGRESS") {
        throw new ApiError(400, "Only in-progress tasks can be completed");
    }

    const now = new Date();

    if (task.shiftEnd <= now) {
        throw new ApiError(400, "Task time ended")
    }

    const uploadedImages = await uploadMultipleImages(
        files,
        `task-instances/${taskId}/completion-proofs`
    );

    const proofImageUrls = uploadedImages.map((image) => image.secure_url);

    const hasMultiAreaReferences = task.referenceImages.length > 0;

    if (!hasMultiAreaReferences && !task.referenceImageUrl) {
        await writeAuditLog({
            companyId: req.user!.companyId,
            actorType: "STAFF",
            actorId: req.user!.id,
            entityType: "TaskInstance",
            entityId: taskId,
            action: "VERIFICATION_SKIPPED_NO_REFERENCE",
            reason: "Task has no reference image; verification bypassed for legacy task.",
        });

        const taskCompleted = await prisma.$transaction(async (tx) => {
            const updatedTask = await tx.taskInstance.update({
                where: { id: taskId },
                data: {
                    status: "COMPLETED",
                    completedAt: now,
                    proofImageUrls,
                }
            });

            await markCurrentAssignmentCompleted(taskId, req.user!.id, now, tx as typeof prisma);

            return updatedTask;
        });

        return res.status(200).json(new ApiResponse(200, taskCompleted, "Task completed successfully (verification skipped - no reference image)"));
    }

    if (hasMultiAreaReferences) {
        const referenceImages = task.referenceImages;
        const areaNames = normalizeAreaNames(req.body.areaNames);

        if (files.length !== referenceImages.length) {
            throw new ApiError(
                400,
                `This task requires ${referenceImages.length} reference area photos, but ${files.length} were uploaded`,
                [{ field: "images", message: `Expected ${referenceImages.length} images, got ${files.length}` }]
            );
        }

        if (areaNames.length !== referenceImages.length) {
            throw new ApiError(
                400,
                "Area names must be provided for every reference image",
                [{ field: "areaNames", message: `Expected ${referenceImages.length} names, got ${areaNames.length}` }]
            );
        }

        const expectedNames = referenceImages.map((ref) => ref.name);
        const mismatchedName = areaNames.find((name, index) => name !== expectedNames[index]);

        if (mismatchedName) {
            throw new ApiError(
                400,
                "Area names do not match the expected reference area names",
                [{ field: "areaNames", message: `Expected order: ${expectedNames.join(", ")}` }]
            );
        }

        const submissionId = crypto.randomUUID();
        const provider = getVerificationProvider();

        type AreaResult = {
            areaName: string;
            imageUrl: string;
            referenceImageUrl: string;
            result: Awaited<ReturnType<typeof provider.compare>>;
        };

        const areaResults: AreaResult[] = [];

        for (let i = 0; i < referenceImages.length; i++) {
            const referenceImage = referenceImages[i];
            const staffImageUrl = proofImageUrls[i];

            let verificationResult;
            try {
                verificationResult = await provider.compare(referenceImage.imageUrl, staffImageUrl);
            } catch (error) {
                await prisma.taskCompletionAttempt.create({
                    data: {
                        taskInstanceId: taskId,
                        staffId: req.user!.id,
                        imageUrl: staffImageUrl,
                        areaName: referenceImage.name,
                        submissionId,
                        status: "ERROR",
                        rawResponse: { error: error instanceof Error ? error.message : String(error) },
                    }
                });

                throw new ApiError(503, "Verification service is temporarily unavailable. Please try again in a moment.");
            }

            areaResults.push({
                areaName: referenceImage.name,
                imageUrl: staffImageUrl,
                referenceImageUrl: referenceImage.imageUrl,
                result: verificationResult,
            });

            if (verificationResult.locationMatch.score < LOCATION_MATCH_THRESHOLD) {
                await prisma.taskCompletionAttempt.create({
                    data: {
                        taskInstanceId: taskId,
                        staffId: req.user!.id,
                        imageUrl: staffImageUrl,
                        areaName: referenceImage.name,
                        submissionId,
                        locationMatchScore: verificationResult.locationMatch.score,
                        cleanlinessMatchScore: verificationResult.cleanlinessMatch.score,
                        locationMatchReason: verificationResult.locationMatch.reasoning,
                        cleanlinessReason: verificationResult.cleanlinessMatch.reasoning,
                        status: "REJECTED_LOCATION",
                        rawResponse: verificationResult as any,
                    }
                });

                throw new ApiError(
                    422,
                    `Photo for "${referenceImage.name}" does not appear to match the reference area. Please retake the photo of the correct area.`,
                    [
                        { field: "locationMatch", message: `${referenceImage.name}: ${verificationResult.locationMatch.score}/100 (need ${LOCATION_MATCH_THRESHOLD})`, score: verificationResult.locationMatch.score, threshold: LOCATION_MATCH_THRESHOLD },
                        { field: "cleanlinessMatch", message: verificationResult.cleanlinessMatch.reasoning, score: verificationResult.cleanlinessMatch.score },
                    ]
                );
            }

            if (verificationResult.cleanlinessMatch.score < CLEANLINESS_THRESHOLD) {
                await prisma.taskCompletionAttempt.create({
                    data: {
                        taskInstanceId: taskId,
                        staffId: req.user!.id,
                        imageUrl: staffImageUrl,
                        areaName: referenceImage.name,
                        submissionId,
                        locationMatchScore: verificationResult.locationMatch.score,
                        cleanlinessMatchScore: verificationResult.cleanlinessMatch.score,
                        locationMatchReason: verificationResult.locationMatch.reasoning,
                        cleanlinessReason: verificationResult.cleanlinessMatch.reasoning,
                        status: "REJECTED_CLEANLINESS",
                        rawResponse: verificationResult as any,
                    }
                });

                throw new ApiError(
                    422,
                    `Cleanliness for "${referenceImage.name}" does not meet the reference standard. Please clean the area again and resubmit.`,
                    [
                        { field: "locationMatch", message: verificationResult.locationMatch.reasoning, score: verificationResult.locationMatch.score },
                        { field: "cleanlinessMatch", message: `${referenceImage.name}: ${verificationResult.cleanlinessMatch.score}/100 (need ${CLEANLINESS_THRESHOLD})`, score: verificationResult.cleanlinessMatch.score, threshold: CLEANLINESS_THRESHOLD },
                    ]
                );
            }
        }

        const taskCompleted = await prisma.$transaction(async (tx) => {
            await tx.taskCompletionAttempt.createMany({
                data: areaResults.map((area) => ({
                    taskInstanceId: taskId,
                    staffId: req.user!.id,
                    imageUrl: area.imageUrl,
                    areaName: area.areaName,
                    submissionId,
                    locationMatchScore: area.result.locationMatch.score,
                    cleanlinessMatchScore: area.result.cleanlinessMatch.score,
                    locationMatchReason: area.result.locationMatch.reasoning,
                    cleanlinessReason: area.result.cleanlinessMatch.reasoning,
                    status: "APPROVED" as const,
                    rawResponse: area.result as any,
                })),
            });

            const updatedTask = await tx.taskInstance.update({
                where: { id: taskId },
                data: {
                    status: "COMPLETED",
                    completedAt: now,
                    proofImageUrls,
                }
            });

            await markCurrentAssignmentCompleted(taskId, req.user!.id, now, tx as typeof prisma);

            return updatedTask;
        });

        return res.status(200).json(new ApiResponse(200, taskCompleted, "Task completed successfully"));
    }

    let verificationResult;
    try {
        const provider = getVerificationProvider();
        verificationResult = await provider.compare(task.referenceImageUrl!, proofImageUrls[0]);
    } catch (error) {
        await prisma.taskCompletionAttempt.create({
            data: {
                taskInstanceId: taskId,
                staffId: req.user!.id,
                imageUrl: proofImageUrls[0],
                status: "ERROR",
                rawResponse: { error: error instanceof Error ? error.message : String(error) },
            }
        });

        if (error instanceof VerificationError) {
            throw new ApiError(503, "Verification service is temporarily unavailable. Please try again in a moment.");
        }

        throw new ApiError(503, "Verification service is temporarily unavailable. Please try again in a moment.");
    }

    const { locationMatch, cleanlinessMatch } = verificationResult;

    if (locationMatch.score < LOCATION_MATCH_THRESHOLD) {
        await prisma.taskCompletionAttempt.create({
            data: {
                taskInstanceId: taskId,
                staffId: req.user!.id,
                imageUrl: proofImageUrls[0],
                locationMatchScore: locationMatch.score,
                cleanlinessMatchScore: cleanlinessMatch.score,
                locationMatchReason: locationMatch.reasoning,
                cleanlinessReason: cleanlinessMatch.reasoning,
                status: "REJECTED_LOCATION",
                rawResponse: verificationResult as any,
            }
        });

        throw new ApiError(
            422,
            "Photo does not appear to match the area in the reference image. Please retake the photo of the correct area.",
            [
                { field: "locationMatch", message: `Location match: ${locationMatch.score}/100 (need ${LOCATION_MATCH_THRESHOLD})`, score: locationMatch.score, threshold: LOCATION_MATCH_THRESHOLD },
                { field: "cleanlinessMatch", message: cleanlinessMatch.reasoning, score: cleanlinessMatch.score },
            ]
        );
    }

    if (cleanlinessMatch.score < CLEANLINESS_THRESHOLD) {
        await prisma.taskCompletionAttempt.create({
            data: {
                taskInstanceId: taskId,
                staffId: req.user!.id,
                imageUrl: proofImageUrls[0],
                locationMatchScore: locationMatch.score,
                cleanlinessMatchScore: cleanlinessMatch.score,
                locationMatchReason: locationMatch.reasoning,
                cleanlinessReason: cleanlinessMatch.reasoning,
                status: "REJECTED_CLEANLINESS",
                rawResponse: verificationResult as any,
            }
        });

        throw new ApiError(
            422,
            "Cleanliness does not meet the standard shown in the reference image. Please clean the area again and resubmit.",
            [
                { field: "locationMatch", message: locationMatch.reasoning, score: locationMatch.score },
                { field: "cleanlinessMatch", message: `Cleanliness match: ${cleanlinessMatch.score}/100 (need ${CLEANLINESS_THRESHOLD})`, score: cleanlinessMatch.score, threshold: CLEANLINESS_THRESHOLD },
            ]
        );
    }

    const taskCompleted = await prisma.$transaction(async (tx) => {
        await tx.taskCompletionAttempt.create({
            data: {
                taskInstanceId: taskId,
                staffId: req.user!.id,
                imageUrl: proofImageUrls[0],
                locationMatchScore: locationMatch.score,
                cleanlinessMatchScore: cleanlinessMatch.score,
                locationMatchReason: locationMatch.reasoning,
                cleanlinessReason: cleanlinessMatch.reasoning,
                status: "APPROVED",
                rawResponse: verificationResult as any,
            }
        });

        const updatedTask = await tx.taskInstance.update({
            where: { id: taskId },
            data: {
                status: "COMPLETED",
                completedAt: now,
                proofImageUrls,
            }
        });

        await markCurrentAssignmentCompleted(taskId, req.user!.id, now, tx as typeof prisma);

        return updatedTask;
    });

    res.status(200).json(new ApiResponse(200, taskCompleted, "Task completed successfully"));
}

export const getTaskInstanceById = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);

    if (isNaN(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }

    const task= await prisma.taskInstance.findUnique({
        where: {id: taskId, isActive:true},
        include: {
            referenceImages: {
                orderBy: { sortOrder: "asc" },
            },
            assignments: {
                orderBy: { assignedAt: "asc" },
                include: {
                    staff: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            completionAttempts: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    if (!task) {
        throw new ApiError(404, "Task not found for this staff");
    }

    if (req.user!.role === "MANAGER") {
        assertLocationAccess(req.user!, task.locationId);
    } else if (task.staffId !== req.user!.id) {
        throw new ApiError(404, "Task not found for this staff");
    }

    res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));  

};

export const getTasknstancesOfLocation = async (req: Request, res: Response) => {

    const locationId = Number(req.params.locationId);
    
    if (isNaN(locationId)) {
        throw new ApiError(400, "Invalid location id");
    }

    assertLocationAccess(req.user!, locationId);
    
    const location = await prisma.location.findUnique({
        where: { id: locationId }
    });

    if (!location) {
        throw new ApiError(404, "Location not found");
    }

    if (location.companyId !== req.user!.companyId) {
        throw new ApiError(403, "Location does not belong to your company");
    }

    const tasks = await prisma.taskInstance.findMany({
        where: { locationId, isActive: true },
        include: {
            referenceImages: {
                orderBy: { sortOrder: "asc" },
            },
            staff: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    shiftStart: true,
                    shiftEnd: true
                }
            },
            assignments: {
                orderBy: { assignedAt: "asc" },
                include: {
                    staff: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        }
    });

    res.status(200).json(new ApiResponse(200, tasks, "Task instances fetched successfully"));
};


  
