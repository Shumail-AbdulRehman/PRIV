import crypto from "node:crypto";
import { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getUtcDayRange, getZonedDayRange } from "../utils/dateTime.js";
import { uploadMultipleImages, uploadSingleImage } from "../utils/cloudinary.js";
import {
  markCurrentAssignmentCompleted,
  markCurrentAssignmentStarted,
} from "../services/taskAssignment.service.js";
import { assertLocationAccess } from "../utils/scope.js";
import {
  AREA_UPLOAD_WINDOW_SECONDS,
  canAreaBeUploaded,
  isUploadWithinWindow,
  isTaskCompletionEligible,
} from "../services/areaSubmission.service.js";
import { getVerificationProvider } from "../services/verification/imageVerification.service.js";
import { VerificationError } from "../services/verification/imageVerification.types.js";
import {
  compareImagesWithDiffAll,
  CvServiceUnavailableError,
  type AreaMatchResult,
} from "../services/verification/diffAll.client.js";
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
        imageUrl: true,
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

async function getActiveTaskForStaff(
  taskId: number,
  staffId: number,
  requiredStatus?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "NOT_COMPLETED_INTIME" | "MISSED" | "CANCELLED"
) {
  const task = await prisma.taskInstance.findUnique({
    where: { id: taskId },
    include: {
      template: true,
      referenceImages: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!task || !task.isActive || task.staffId !== staffId) {
    throw new ApiError(404, "Task not found for this staff");
  }

  if (requiredStatus && task.status !== requiredStatus) {
    throw new ApiError(400, `Task must be ${requiredStatus.toLowerCase().replace(/_/g, " ")}`);
  }

  const now = new Date();
  if (task.shiftEnd <= now) {
    throw new ApiError(400, "Task time ended");
  }

  return task;
}

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

export const scanAreaQr = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);
  const referenceImageId = Number(req.params.referenceImageId);
  const qrToken = req.query.qrToken;

  if (isNaN(taskId) || isNaN(referenceImageId)) {
    throw new ApiError(400, "Invalid task or area id");
  }

  if (typeof qrToken !== "string" || !qrToken.trim()) {
    throw new ApiError(400, "Invalid qr token");
  }

  const task = await getActiveTaskForStaff(taskId, req.user!.id, "IN_PROGRESS");

  if (!task.template) {
    throw new ApiError(400, "Task is not linked to a template");
  }

  if (task.template.qrToken !== qrToken) {
    throw new ApiError(400, "QR code does not belong to this task");
  }

  const referenceImage = task.referenceImages.find((img) => img.id === referenceImageId);
  if (!referenceImage) {
    throw new ApiError(404, "Area not found for this task");
  }

  const now = new Date();

  const submission = await prisma.taskAreaSubmission.upsert({
    where: {
      taskInstanceId_referenceImageId: {
        taskInstanceId: taskId,
        referenceImageId,
      },
    },
    update: {
      scannedAt: now,
      status: "PENDING",
      uploadedAt: null,
      photoUrl: "",
    },
    create: {
      taskInstanceId: taskId,
      referenceImageId,
      staffId: req.user!.id,
      photoUrl: "",
      scannedAt: now,
    },
  });

  res.status(200).json(
    new ApiResponse(200, { scannedAt: submission.scannedAt }, "Area QR scanned successfully")
  );
};

export const uploadAreaPhoto = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);
  const referenceImageId = Number(req.params.referenceImageId);
  const file = req.file;

  if (isNaN(taskId) || isNaN(referenceImageId)) {
    throw new ApiError(400, "Invalid task or area id");
  }

  if (!file) {
    throw new ApiError(400, "Area photo is required");
  }

  const task = await getActiveTaskForStaff(taskId, req.user!.id, "IN_PROGRESS");

  const referenceImage = task.referenceImages.find((img) => img.id === referenceImageId);
  if (!referenceImage) {
    throw new ApiError(404, "Area not found for this task");
  }

  const submission = await prisma.taskAreaSubmission.findUnique({
    where: {
      taskInstanceId_referenceImageId: {
        taskInstanceId: taskId,
        referenceImageId,
      },
    },
  });

  const eligibility = canAreaBeUploaded(submission ?? undefined);
  if (!eligibility.ok) {
    throw new ApiError(400, eligibility.reason);
  }

  const now = new Date();

  if (!isUploadWithinWindow(submission!.scannedAt, now, AREA_UPLOAD_WINDOW_SECONDS)) {
    await prisma.taskAreaSubmission.update({
      where: {
        taskInstanceId_referenceImageId: {
          taskInstanceId: taskId,
          referenceImageId,
        },
      },
      data: {
        status: "REJECTED_TIMEOUT",
        uploadedAt: now,
      },
    });

    throw new ApiError(
      422,
      `Photo upload time exceeded. Please re-scan the QR code for "${referenceImage.name}" and try again.`,
      [{ field: "timeout", message: `Limit: ${AREA_UPLOAD_WINDOW_SECONDS}s` }]
    );
  }

  const uploadedImage = await uploadSingleImage(
    file,
    `task-instances/${taskId}/area-submissions/${referenceImageId}`
  );

  const staffPhotoUrl = uploadedImage.secure_url;
  const submissionKey = {
    taskInstanceId_referenceImageId: {
      taskInstanceId: taskId,
      referenceImageId,
    },
  };

  const appendAttempt = async (attempt: Record<string, unknown>) => {
    const existing = await prisma.taskAreaSubmission.findUnique({
      where: submissionKey,
      select: { attempts: true },
    });
    const priorAttempts = Array.isArray(existing?.attempts) ? (existing!.attempts as unknown[]) : [];
    await prisma.taskAreaSubmission.update({
      where: submissionKey,
      data: { attempts: [...priorAttempts, attempt] as any },
    });
  };

  // Compare against this reference image plus any sibling reference images
  // sharing the same area name (multi-angle support without a schema change).
  const areaReferences = task.referenceImages
    .filter((img) => img.name === referenceImage.name)
    .map((img) => ({ id: img.id, imageUrl: img.imageUrl }));
  const references = areaReferences.some((r) => r.id === referenceImageId)
    ? areaReferences
    : [{ id: referenceImageId, imageUrl: referenceImage.imageUrl }];

  let cvResult: AreaMatchResult;
  try {
    cvResult = await compareImagesWithDiffAll(
      file.buffer,
      file.mimetype,
      references
    );
  } catch (error) {
    if (error instanceof CvServiceUnavailableError) {
      await appendAttempt({ photoUrl: staffPhotoUrl, areaMatchStatus: "cv_error", at: now.toISOString() });
      await prisma.taskAreaSubmission.update({
        where: submissionKey,
        data: { photoUrl: staffPhotoUrl, uploadedAt: now, status: "CV_ERROR" },
      });
      throw new ApiError(
        503,
        "Photo verification is temporarily unavailable. Please try again."
      );
    }
    throw error;
  }

  const isBlocked = cvResult.areaMatchStatus === "blocked";

  const updatedSubmission = await prisma.taskAreaSubmission.update({
    where: submissionKey,
    data: {
      photoUrl: staffPhotoUrl,
      uploadedAt: now,
      status: isBlocked ? "BLOCKED" : "APPROVED",
      similarityScore: cvResult.similarityScore,
      areaMatchStatus: cvResult.areaMatchStatus,
      areaMatchFlag: cvResult.areaMatchFlag,
      bestReferenceImageId: cvResult.bestReferencePhotoId,
      colorScore: cvResult.colorScore ?? null,
      ssimScore: cvResult.ssimScore ?? null,
      featureScore: cvResult.featureScore ?? null,
      matchThresholdUsed: cvResult.thresholds.match,
      blockThresholdUsed: cvResult.thresholds.block,
      colorWeightUsed: cvResult.weights?.color ?? null,
      ssimWeightUsed: cvResult.weights?.ssim ?? null,
      featureWeightUsed: cvResult.weights?.feature ?? null,
    },
  });

  await appendAttempt({
    photoUrl: staffPhotoUrl,
    areaMatchStatus: cvResult.areaMatchStatus,
    similarityScore: cvResult.similarityScore,
    colorScore: cvResult.colorScore ?? null,
    ssimScore: cvResult.ssimScore ?? null,
    featureScore: cvResult.featureScore ?? null,
    bestReferenceImageId: cvResult.bestReferencePhotoId,
    at: now.toISOString(),
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        referenceImageId,
        photoUrl: updatedSubmission.photoUrl,
        areaMatchStatus: cvResult.areaMatchStatus,
        similarityScore: cvResult.similarityScore,
        areaMatchFlag: cvResult.areaMatchFlag,
      },
      isBlocked
        ? "Area doesn't match. Please photograph the correct area and try again."
        : "Area photo uploaded successfully"
    )
  );
};

export const getAreaSubmissions = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);

  if (isNaN(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }

  const task = await prisma.taskInstance.findUnique({
    where: { id: taskId, isActive: true },
    select: {
      id: true,
      staffId: true,
      location: { select: { companyId: true } },
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const user = req.user!;
  const isStaff = user.role === "STAFF";
  if (isStaff && task.staffId !== user.id) {
    throw new ApiError(403, "This task is not assigned to you");
  }
  if (!isStaff && task.location.companyId !== user.companyId) {
    throw new ApiError(403, "Task does not belong to your company");
  }

  const submissions = await prisma.taskAreaSubmission.findMany({
    where: { taskInstanceId: taskId },
    orderBy: { referenceImage: { sortOrder: "asc" } },
    include: {
      referenceImage: { select: { id: true, name: true, imageUrl: true } },
      staff: { select: { id: true, name: true } },
    },
  });

  res.status(200).json(
    new ApiResponse(200, submissions, "Area submissions fetched successfully")
  );
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

    const hasMultiAreaReferences = task.referenceImages.length > 0;

    if (hasMultiAreaReferences) {
        if (files.length > 0) {
            throw new ApiError(400, "Photos for area-based tasks are uploaded per area, not at completion");
        }
    } else if (!files.length) {
        throw new ApiError(400, "At least one completion image is required");
    }

    const uploadedImages = !hasMultiAreaReferences && files.length
        ? await uploadMultipleImages(
            files,
            `task-instances/${taskId}/completion-proofs`
        )
        : [];

    const proofImageUrls = uploadedImages.map((image) => image.secure_url);

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
        const approvedSubmissions = await prisma.taskAreaSubmission.findMany({
            where: {
                taskInstanceId: taskId,
                status: "APPROVED",
            },
            select: { referenceImageId: true, photoUrl: true },
        });

        const approvedReferenceImageIds = approvedSubmissions.map((s) => s.referenceImageId);
        const referenceImageIds = task.referenceImages.map((img) => img.id);

        const completionCheck = isTaskCompletionEligible(
            referenceImageIds,
            approvedReferenceImageIds
        );

        if (!completionCheck.ok) {
            const missingNames = task.referenceImages
                .filter((img) => completionCheck.missingAreaIds.includes(img.id))
                .map((img) => img.name)
                .join(", ");

            throw new ApiError(
                400,
                `Cannot complete task. Missing photos for: ${missingNames}`,
                [{ field: "missingAreas", message: missingNames }]
            );
        }

        const orderedPhotoUrls = task.referenceImages
            .map((img) => {
                const submission = approvedSubmissions.find((s) => s.referenceImageId === img.id);
                return submission?.photoUrl;
            })
            .filter((url): url is string => Boolean(url));

        const taskCompleted = await prisma.$transaction(async (tx) => {
            const updatedTask = await tx.taskInstance.update({
                where: { id: taskId },
                data: {
                    status: "COMPLETED",
                    completedAt: now,
                    proofImageUrls: orderedPhotoUrls,
                },
            });

            await markCurrentAssignmentCompleted(taskId, req.user!.id, now, tx as typeof prisma);

            return updatedTask;
        });

        return res.status(200).json(
            new ApiResponse(200, taskCompleted, "Task completed successfully")
        );
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


  
