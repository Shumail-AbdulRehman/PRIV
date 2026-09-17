import { Request, Response } from "express";
import { createStaffSchema, editStaffSchema, staffLoginSchema } from "../validations/staff.validation.js";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, isPasswordCorrect } from "../utils/auth.js";
import { DEFAULT_TIME_ZONE, getZonedClockMinutes, getZonedDayRangeFromDateInput, getZonedMonthRange } from "../utils/dateTime.js";
import { syncTodaysOpenAttendanceWindow } from "../utils/syncAttendanceWindow.js";
import { getCookieOptions } from "../utils/cookies.js";
import { permanentlyDelete } from "../services/deletion.service.js";
import { getScopedLocationIds, assertLocationAccess } from "../utils/scope.js";
import { assertCompanyCanAdd } from "../services/subscription.service.js";


export const loginStaff = async (req: Request, res: Response) => {
  const result = staffLoginSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((e: any) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }
  const { email, password } = result.data;

  const staff = await prisma.staff.findUnique({
    where: { email },
  });

  if (!staff) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!staff.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const isValid = await isPasswordCorrect(password, staff.password);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(staff, staff.role);
  const refreshToken = generateRefreshToken(staff, staff.role);

  await prisma.staff.update({
    where: { id: staff.id },
    data: { refreshToken },
  });

  const cookieOptions = getCookieOptions();

  res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        companyId: staff.companyId,
        locationId: staff.locationId,
        accessToken,
        refreshToken,
      }, "Login successful")
    );
};

export const createStaff = async (req: Request, res: Response) => {
  const result = createStaffSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join("."),
      message: e.message
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const { name, email, phone, password, locationId, shiftStart, shiftEnd } = result.data;

  const existingStaff = await prisma.staff.findUnique({ where: { email } });
  if (existingStaff) throw new ApiError(409, "Staff with this email already exists");

  await assertCompanyCanAdd(req.user!.companyId, "staff");

  if (locationId) {
    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location || location.companyId !== req.user!.companyId || !location.isActive) {
      throw new ApiError(404, "Location not found in your company");
    }
    assertLocationAccess(req.user!, locationId);
  }



  const staff = await prisma.staff.create({
    data: {
      name,
      email,
      phone,
      password,
      companyId: req.user!.companyId,
      locationId: locationId || null,
      shiftStart: shiftStart || null,
      shiftEnd: shiftEnd || null,
    }
  });

  const { password: _, ...safeStaff } = staff;

  res.status(201).json(
    new ApiResponse(201, safeStaff, "Staff created successfully")
  );
};

export const getStaff = async (req: Request, res: Response) => {
  const scopedLocationIds = getScopedLocationIds(req.user!);

  const staff = await prisma.staff.findMany({
    where: {
      companyId: req.user!.companyId,
      isActive: true,
      ...(scopedLocationIds ? { locationId: { in: scopedLocationIds } } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      companyId: true,
      locationId: true,
      createdAt: true,
      updatedAt: true,
      shiftStart: true,
      shiftEnd: true
    }
  });

  res.status(200).json(new ApiResponse(200, staff, "Staff fetched successfully"));
};

export const deleteStaff = async (req: Request, res: Response) => {
  await permanentlyDelete("staff", Number(req.params.id), req.user!);
  res.status(200).json(new ApiResponse(200, {}, "Deleted permanently"));
};

export const getStaffById = async (req: Request, res: Response) => {
  const staffId = Number(req.params.id);
  if (isNaN(staffId)) throw new ApiError(400, "Invalid staff id");

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      companyId: true,
      locationId: true,
      createdAt: true,
      updatedAt: true,
      shiftStart: true,
      shiftEnd: true
    }
  });

  if (!staff || staff.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Staff not found in your company");
  }

  if (req.user!.role === "MANAGER") {
    if (!staff.locationId) {
      throw new ApiError(403, "You do not have access to this location");
    }
    assertLocationAccess(req.user!, staff.locationId);
  }

  res.status(200).json(new ApiResponse(200, staff, "Staff fetched successfully"));
};

export const getStaffByLocation = async (req: Request, res: Response) => {
  const locationId = Number(req.params.locationId);
  if (isNaN(locationId)) throw new ApiError(400, "Invalid location id");

  assertLocationAccess(req.user!, locationId);

  const location = await prisma.location.findUnique({ where: { id: locationId } });

  if (!location || location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Location not found in your company");
  }

  const staff = await prisma.staff.findMany({
    where: { companyId: req.user!.companyId, locationId, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      companyId: true,
      locationId: true,
      createdAt: true,
      updatedAt: true,
      shiftStart: true,
      shiftEnd: true
    }
  });

  res.status(200).json(new ApiResponse(200, staff, "Staff fetched successfully"));
};

export const getProfile = async (req: Request, res: Response) => {
  const staff = await prisma.staff.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      companyId: true,
      locationId: true,
      createdAt: true,
      updatedAt: true,
      shiftStart: true,
      shiftEnd: true
    }
  });

  if (!staff) {
    throw new ApiError(404, "Staff not found");
  }

  res.status(200).json(new ApiResponse(200, staff, "Profile fetched successfully"));
};

export const editStaff = async (req: Request, res: Response) => {
  const staffId = Number(req.params.id);
  if (isNaN(staffId)) throw new ApiError(400, "Invalid staff id");

  const result = editStaffSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join("."),
      message: e.message
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: { location: { select: { timezone: true } } },
  });

  if (!staff || staff.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Staff not found in your company");
  }

  if (!staff.isActive) {
    throw new ApiError(400, "Cannot edit deactivated staff");
  }

  if (staff.locationId) {
    assertLocationAccess(req.user!, staff.locationId);
  }

  if (result.data.email && result.data.email !== staff.email) {
    const existing = await prisma.staff.findUnique({ where: { email: result.data.email } });
    if (existing) {
      throw new ApiError(409, "A staff member with this email already exists");
    }
  }

  console.log("staff data::",result.data);

  const shiftChanged = result.data.shiftStart !== undefined || result.data.shiftEnd !== undefined;

 if (result.data.shiftStart || result.data.shiftEnd) {
  
  const newStart = result.data.shiftStart ?? staff.shiftStart;
  const newEnd = result.data.shiftEnd ?? staff.shiftEnd;

  if (newStart && newEnd) {
   
    const staffTemplates = await prisma.taskTemplate.findMany({
      where: {
        staffId,
        isActive: true,
      },
      include: { location: { select: { timezone: true } } },
    });

    const locationTimeZone = staff.location?.timezone ?? DEFAULT_TIME_ZONE;
    const newStartMin = getZonedClockMinutes(newStart, locationTimeZone);
    const newEndMin = getZonedClockMinutes(newEnd, locationTimeZone);
    const isOvernightShift = newEndMin < newStartMin;

    const conflicts = staffTemplates.filter((t) => {
      const templateTimeZone = t.location.timezone;
      const tStartMin = getZonedClockMinutes(t.shiftStart, templateTimeZone);
      const tEndMin = getZonedClockMinutes(t.shiftEnd, templateTimeZone);

      if (isOvernightShift) {
        return !(tStartMin >= newStartMin || tEndMin <= newEndMin);
      }
      return !(tStartMin >= newStartMin && tEndMin <= newEndMin);
    });

    if (conflicts.length > 0) {
      const names = conflicts.map((c) => `"${c.title}"`).join(", ");
      throw new ApiError(
        400,
        `Cannot update shift: ${names} task template(s) fall outside the new shift window. Remove or reassign them first.`
      );
    }
  }
}


  const updated = await prisma.staff.update({
    where: { id: staffId },
    data: result.data,
    select: {
      id: true, name: true, email: true, phone: true, role: true, isActive: true,
      companyId: true, locationId: true, shiftStart: true, shiftEnd: true,
      createdAt: true, updatedAt: true,
    }
  });

  if (shiftChanged) {
    await syncTodaysOpenAttendanceWindow({
      staffId,
      locationId: updated.locationId,
      shiftStart: updated.shiftStart,
      shiftEnd: updated.shiftEnd,
    });
  }

  res.status(200).json(new ApiResponse(200, updated, "Staff updated successfully"));
};

export const getStaffDetails = async (req: Request, res: Response) => {
  const staffId = Number(req.params.id);
  if (isNaN(staffId)) throw new ApiError(400, "Invalid staff id");

  const monthParam = req.query.month as string | undefined;
  const dateFromParam = req.query.dateFrom as string | undefined;
  const dateToParam = req.query.dateTo as string | undefined;

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      companyId: true,
      locationId: true,
      shiftStart: true,
      shiftEnd: true,
      createdAt: true,
      updatedAt: true,
      location: { select: { id: true, name: true, address: true, timezone: true } },
    },
  });

  if (!staff || staff.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Staff not found in your company");
  }

  if (req.user!.role === "MANAGER") {
    if (!staff.locationId) {
      throw new ApiError(403, "You do not have access to this location");
    }
    assertLocationAccess(req.user!, staff.locationId);
  }

  const timeZone = staff.location?.timezone ?? DEFAULT_TIME_ZONE;

  let dateFilter: { gte?: Date; lt?: Date } | undefined;
  let periodLabel = "All time";

  if (monthParam) {
    const match = /^(\d{4})-(\d{2})$/.exec(monthParam);
    if (!match) {
      throw new ApiError(400, "Invalid month format. Use YYYY-MM");
    }

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;

    if (monthIndex < 0 || monthIndex > 11) {
      throw new ApiError(400, "Invalid month value");
    }

    const monthRange = getZonedMonthRange(year, monthIndex, timeZone);
    if (!monthRange) {
      throw new ApiError(400, "Invalid month value");
    }

    dateFilter = { gte: monthRange.start, lt: monthRange.end };
    periodLabel = new Date(Date.UTC(year, monthIndex, 15)).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone,
    });
  } else if (dateFromParam || dateToParam) {
    if (!dateFromParam || !dateToParam) {
      throw new ApiError(400, "Both dateFrom and dateTo are required together");
    }

    const startRange = getZonedDayRangeFromDateInput(dateFromParam, timeZone);
    const endRange = getZonedDayRangeFromDateInput(dateToParam, timeZone);

    if (!startRange || !endRange) {
      throw new ApiError(400, "Invalid dateFrom or dateTo format. Use YYYY-MM-DD");
    }

    if (startRange.start > endRange.start) {
      throw new ApiError(400, "dateFrom must be before dateTo");
    }

    dateFilter = { gte: startRange.start, lt: endRange.end };
    periodLabel = `${dateFromParam} to ${dateToParam}`;
  }

  const taskInstanceWhere = {
    staffId,
    isActive: true,
    ...(dateFilter ? { date: dateFilter } : {}),
  };

  const attendanceWhere = {
    staffId,
    ...(dateFilter ? { date: dateFilter } : {}),
  };

  const [
    taskTemplates,
    taskInstances,
    attendances,
    totalTaskTemplates,
    taskStatusGroups,
    lateTaskCount,
    attendanceStatusGroups,
    lateAttendanceCount,
  ] = await Promise.all([
    prisma.taskTemplate.findMany({
      where: { staffId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        recurringType: true,
        isActive: true,
        shiftStart: true,
        shiftEnd: true,
        effectiveDate: true,
        location: { select: { id: true, name: true, timezone: true } },
      },
    }),
    prisma.taskInstance.findMany({
      where: taskInstanceWhere,
      orderBy: { date: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        date: true,
        shiftStart: true,
        shiftEnd: true,
        status: true,
        isLate: true,
        startedAt: true,
        completedAt: true,
        proofImageUrls: true,
        location: { select: { id: true, name: true, timezone: true } },
      },
    }),
    prisma.attendance.findMany({
      where: attendanceWhere,
      orderBy: { date: "desc" },
      take: 50,
      select: {
        id: true,
        date: true,
        expectedStart: true,
        expectedEnd: true,
        checkInTime: true,
        checkOutTime: true,
        status: true,
        isLateCheckIn: true,
        lateMinutes: true,
        checkInImage: true,
        checkOutImage: true,
        location: { select: { id: true, name: true, timezone: true } },
      },
    }),
    prisma.taskTemplate.count({
      where: { staffId, isActive: true },
    }),
    prisma.taskInstance.groupBy({
      by: ["status"],
      where: taskInstanceWhere,
      _count: { status: true },
    }),
    prisma.taskInstance.count({
      where: {
        ...taskInstanceWhere,
        isLate: true,
      },
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: attendanceWhere,
      _count: { status: true },
    }),
    prisma.attendance.count({
      where: {
        ...attendanceWhere,
        OR: [{ status: "LATE" }, { isLateCheckIn: true }],
      },
    }),
  ]);

  const totalTaskInstances = taskStatusGroups.reduce((sum, group) => sum + group._count.status, 0);
  const totalAttendanceRecords = attendanceStatusGroups.reduce((sum, group) => sum + group._count.status, 0);

  const taskStatusMap = new Map(taskStatusGroups.map((group) => [group.status, group._count.status]));
  const attendanceStatusMap = new Map(
    attendanceStatusGroups.map((group) => [group.status, group._count.status])
  );

  const taskStats = {
    totalTemplates: totalTaskTemplates,
    totalInstances: totalTaskInstances,
    completed: taskStatusMap.get("COMPLETED") ?? 0,
    pending: taskStatusMap.get("PENDING") ?? 0,
    inProgress: taskStatusMap.get("IN_PROGRESS") ?? 0,
    missed: taskStatusMap.get("MISSED") ?? 0,
    late: lateTaskCount,
  };

  const attendanceStats = {
    totalRecords: totalAttendanceRecords,
    present:
      (attendanceStatusMap.get("CHECKED_IN") ?? 0) +
      (attendanceStatusMap.get("CHECKED_OUT") ?? 0),
    absent: attendanceStatusMap.get("ABSENT") ?? 0,
    late: lateAttendanceCount,
    missedCheckout: attendanceStatusMap.get("MISSED_CHECKOUT") ?? 0,
  };

  res.status(200).json(
    new ApiResponse(200, {
      ...staff,
      taskTemplates,
      taskInstances,
      attendances,
      taskStats,
      attendanceStats,
      periodLabel,
    }, "Staff details fetched successfully")
  );
};
