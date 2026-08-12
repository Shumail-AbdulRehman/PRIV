import { Request, Response } from "express";
import tzLookup from "tz-lookup";
import { createLocationSchema, editLocationSchema } from "../validations/location.validation.js";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { addUtcDays, getZonedDayRange, getZonedDayRangeFromDateInput } from "../utils/dateTime.js";
import { markCurrentAssignmentsForTasks } from "../services/taskAssignment.service.js";
import { getScopedLocationIds, assertLocationAccess } from "../utils/scope.js";

const timezoneFromCoordinates = (latitude: string, longitude: string) => {
  try {
    return tzLookup(Number(latitude), Number(longitude));
  } catch {
    return "UTC";
  }
};

export const createLocation = async (req: Request, res: Response) => {
  const payload = req.body?.data ?? req.body;
  const result = createLocationSchema.safeParse(payload);

  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join("."),
      message: e.message
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const location = await prisma.location.create({
    data: {
      ...result.data,
      timezone: result.data.timezone ?? timezoneFromCoordinates(result.data.latitude, result.data.longitude),
      companyId: req.user!.companyId
    }
  });

  res.status(201).json(new ApiResponse(201, location, "Location created successfully"));
};

export const editLocation = async (req: Request, res: Response) => {
  const locationId = Number(req.params.id);
  if (isNaN(locationId)) throw new ApiError(400, "Invalid location id");

  const payload = req.body?.data ?? req.body;
  const result = editLocationSchema.safeParse(payload);

  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join("."),
      message: e.message
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const location = await prisma.location.findUnique({ where: { id: locationId ,isActive:true} });

  if (!location || location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Location not found in your company");
  }

  const coordinatesChanged =
    result.data.latitude !== location.latitude || result.data.longitude !== location.longitude;

  const updatedLocation = await prisma.location.update({
    where: { id: locationId },
    data: {
      ...result.data,
      ...(result.data.timezone
        ? {}
        : coordinatesChanged
          ? { timezone: timezoneFromCoordinates(result.data.latitude, result.data.longitude) }
          : {}),
    }
  });

  res.status(200).json(new ApiResponse(200, updatedLocation, "Location updated successfully"));
};

export const getLocations = async (req: Request, res: Response) => {

  const scopedLocationIds = getScopedLocationIds(req.user!);

  const locations = await prisma.location.findMany({
    where: {
      companyId: req.user!.companyId,
      isActive: true,
      ...(scopedLocationIds ? { id: { in: scopedLocationIds } } : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      radiusMeters: true,
      isActive: true,
      timezone: true,
      _count: {
        select: {
          staff: {
            where: {
              isActive: true,
            },
          },
          taskTemplates: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json(new ApiResponse(200, locations, "Locations fetched successfully"));
};

export const softDeleteLocation = async (req: Request, res: Response) => {
  const locationId = Number(req.params.id);
  if (isNaN(locationId)) throw new ApiError(400, "Invalid location id");

  const location = await prisma.location.findUnique({ where: { id: locationId } });

  if (!location || location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Location not found in your company");
  }

  if (!location.isActive) {
    throw new ApiError(400, "Location is already deactivated");
  }

  const affectedTasks = await prisma.taskInstance.findMany({
    where: {
      locationId,
      status: { in: ["PENDING", "IN_PROGRESS", "NOT_COMPLETED_INTIME"] },
    },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.location.update({
      where: { id: locationId },
      data: { isActive: false }
    }),
    prisma.taskTemplate.updateMany({
      where: { locationId, isActive: true },
      data: { isActive: false }
    }),
    prisma.taskInstance.updateMany({
      where: {
        locationId,
        status: { in: ["PENDING", "IN_PROGRESS", "NOT_COMPLETED_INTIME"] }
      },
      data: { status: "CANCELLED", isActive: false }
    }),
    prisma.staff.updateMany({
      where: { locationId },
      data: { locationId: null }
    })
  ]);

  await markCurrentAssignmentsForTasks(
    affectedTasks.map((task) => task.id),
    "CANCELLED",
    "LOCATION_DEACTIVATED"
  );

  res.status(200).json(new ApiResponse(200, {}, "Location deactivated successfully"));
};

export const getLocationById = async (req: Request, res: Response) => {
  const locationId = Number(req.params.id);
  if (isNaN(locationId)) throw new ApiError(400, "Invalid location id");
  const location = await prisma.location.findUnique({
    where: { id: locationId },
  });
  
  if (!location || location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Location not found in your company");
  }
  assertLocationAccess(req.user!, location.id);
  res.status(200).json(new ApiResponse(200, location, "Location fetched successfully"));
};

export const getInactiveLocations = async (req: Request, res: Response) => {
  const locations = await prisma.location.findMany({
    where: { companyId: req.user!.companyId, isActive: false }
  });

  res.status(200).json(new ApiResponse(200, locations, "Inactive locations fetched successfully"));
};

export const restoreLocation = async (req: Request, res: Response) => {
  const locationId = Number(req.params.id);
  if (isNaN(locationId)) throw new ApiError(400, "Invalid location id");

  const location = await prisma.location.findUnique({ where: { id: locationId } });

  if (!location || location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Location not found in your company");
  }

  if (location.isActive) {
    throw new ApiError(400, "Location is already active");
  }

  await prisma.location.update({
    where: { id: locationId },
    data: { isActive: true }
   });

  res.status(200).json(new ApiResponse(200, {}, "Location restored successfully"));
};

export const getLocationStatsById = async (req: Request, res: Response) => {
  const locationId = Number(req.params.id);
  if (isNaN(locationId)) throw new ApiError(400, "Invalid location id");

  const location = await prisma.location.findUnique({ where: { id: locationId } });
  if (!location || location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Location not found in your company");
  }

  assertLocationAccess(req.user!, location.id);

  
  const days = req.query.days ? Number(req.query.days) : null;
  const dateFromParam = req.query.dateFrom as string;
  const dateToParam = req.query.dateTo as string;

  let dateFilter = {};
  let periodLabel = "All time";

  
  if (dateFromParam && dateToParam) {
    const startRange = getZonedDayRangeFromDateInput(dateFromParam, location.timezone);
    const endRange = getZonedDayRangeFromDateInput(dateToParam, location.timezone);

    if (!startRange || !endRange) {
      throw new ApiError(400, "Invalid dateFrom or dateTo format. Use YYYY-MM-DD");
    }

    if (startRange.start > endRange.start) {
      throw new ApiError(400, "dateFrom must be before dateTo");
    }

    dateFilter = { date: { gte: startRange.start, lt: endRange.end } };
    const diffDays =
      Math.round((endRange.start.getTime() - startRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    periodLabel = `${dateFromParam} to ${dateToParam} (${diffDays} days)`;
  } else if (days) {
    if (isNaN(days) || days <= 0) {
      throw new ApiError(400, "days must be a positive number");
    }

    const { start: todayStart, end: tomorrowStart } = getZonedDayRange(new Date(), location.timezone);
    const startDate = addUtcDays(todayStart, -(days - 1));

    dateFilter = { date: { gte: startDate, lt: tomorrowStart } };
    periodLabel = `Last ${days} days`;
  }

 const [locationInfo, taskStats] = await Promise.all([
  prisma.location.findUnique({
    where: { id: locationId },
    include: {
      taskInstances: {
        where: {
          isActive: true,
          ...dateFilter,
        },
        include: {
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
        },
      },
      staff: {
        where:{
          isActive:true
        }
      },
      taskTemplates: {where:{
        isActive:true
      },
      include:{
        staff:true
      }
    },
    },
  }),

  prisma.taskInstance.groupBy({
    by: ["status"],
    where: {
      locationId,
      isActive: true,
      ...dateFilter,
    },
    _count: {
      status: true,
    },
  }),
]);




  res.status(200).json(new ApiResponse(200, {locationInfo,taskStats}, "Location stats fetched successfully"));
};
