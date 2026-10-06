import { inventorySelectionSchema } from "../validations/area.validation.js";
import { configureTemplateInventory, validateInventorySelection } from "../services/verification-v2/inventorySnapshot.service.js";
import { Request, Response } from "express";
import { createTaskSchema, createTaskMultipartSchema, editTaskSchema } from "../validations/taskTemplate.validation.js";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { permanentlyDelete } from "../services/deletion.service.js";
import {requireLocationAccess} from '../services/verification-v2/authorization.service.js';
import {writeAuditLog} from '../services/auditLog.service.js';
import { DEFAULT_TIME_ZONE, getZonedClockMinutes, getZonedDayRange } from "../utils/dateTime.js";
import { assertLocationAccess } from "../utils/scope.js";
import { uploadSingleImage } from "../utils/cloudinary.js";
import { assertReferenceImageAllowance } from "../services/subscription.service.js";

const getMinutes = (date: Date, timeZone: string) => getZonedClockMinutes(date, timeZone);

const toTimeRanges = (start: Date, end: Date, timeZone: string) => {
  const startMin = getMinutes(start, timeZone);
  const endMin = getMinutes(end, timeZone);

  if (endMin > startMin) {
    return [{ start: startMin, end: endMin }];
  }

  return [
    { start: startMin, end: 24 * 60 },
    { start: 0, end: endMin },
  ];
};

const timeRangesOverlap = (firstStart: Date, firstEnd: Date, secondStart: Date, secondEnd: Date, timeZone: string) => {
  const firstRanges = toTimeRanges(firstStart, firstEnd, timeZone);
  const secondRanges = toTimeRanges(secondStart, secondEnd, timeZone);

  return firstRanges.some((first) =>
    secondRanges.some((second) => first.start < second.end && second.start < first.end)
  );
};

const validateTaskAgainstStaffShift = (
  staff: { shiftStart: Date | null; shiftEnd: Date | null },
  taskShiftStart: Date,
  taskShiftEnd: Date,
  timeZone: string
) => {
  if (!staff.shiftStart || !staff.shiftEnd) return;

  const staffStartMin = getMinutes(staff.shiftStart, timeZone);
  const staffEndMin = getMinutes(staff.shiftEnd, timeZone);
  const taskStartMin = getMinutes(taskShiftStart, timeZone);
  const taskEndMin = getMinutes(taskShiftEnd, timeZone);

  const isOvernightShift = staffEndMin < staffStartMin;
  let taskFitsInShift: boolean;

  if (isOvernightShift) {
    const isOvernightTask = taskEndMin < taskStartMin;
    if (isOvernightTask) {
      taskFitsInShift = taskStartMin >= staffStartMin && taskEndMin <= staffEndMin;
    } else {
      taskFitsInShift = taskStartMin >= staffStartMin || taskEndMin <= staffEndMin;
    }
  } else {
    taskFitsInShift = taskStartMin >= staffStartMin && taskEndMin <= staffEndMin;
  }

  if (!taskFitsInShift) {
    throw new ApiError(
      400,
      `Task shift (${taskShiftStart.toISOString()} - ${taskShiftEnd.toISOString()}) falls outside staff's attendance shift. Please update the staff's shift or choose a different time.`
    );
  }
};

const staffShiftCoversTask = (
  staff: { shiftStart: Date | null; shiftEnd: Date | null },
  taskShiftStart: Date,
  taskShiftEnd: Date,
  timeZone: string
) => {
  if (!staff.shiftStart || !staff.shiftEnd) return false;

  try {
    validateTaskAgainstStaffShift(staff, taskShiftStart, taskShiftEnd, timeZone);
    return true;
  } catch {
    return false;
  }
};

const getZonedDayMs = (date: Date, timeZone: string) =>
  getZonedDayRange(date, timeZone).start.getTime();

const recurrenceRange = (template: {
  recurringType?: string | null;
  effectiveDate: Date;
  recurringEndDate?: Date | null;
}, timeZone: string) => {
  const start = getZonedDayMs(template.effectiveDate, timeZone);

  if (template.recurringType === "ONCE") {
    return { start, end: start };
  }

  if (template.recurringType === "DAILY") {
    return {
      start,
      end: template.recurringEndDate ? getZonedDayMs(template.recurringEndDate, timeZone) : null,
    };
  }

  return null;
};

const recurrenceRangesOverlap = (
  first: {
    recurringType?: string | null;
    effectiveDate: Date;
    recurringEndDate?: Date | null;
  },
  second: {
    recurringType?: string | null;
    effectiveDate: Date;
    recurringEndDate?: Date | null;
  },
  timeZone: string
) => {
  const firstRange = recurrenceRange(first, timeZone);
  const secondRange = recurrenceRange(second, timeZone);

  if (!firstRange || !secondRange) return false;

  const firstEnd = firstRange.end ?? Number.POSITIVE_INFINITY;
  const secondEnd = secondRange.end ?? Number.POSITIVE_INFINITY;

  return firstRange.start <= secondEnd && secondRange.start <= firstEnd;
};

const assertLocationHasCapacityForTaskTemplate = async ({
  locationId,
  shiftStart,
  shiftEnd,
  recurringType,
  effectiveDate,
  recurringEndDate,
  excludeTemplateId,
}: {
  locationId: number;
  shiftStart: Date;
  shiftEnd: Date;
  recurringType?: string | null;
  effectiveDate: Date;
  recurringEndDate?: Date | null;
  excludeTemplateId?: number;
}) => {
  const [location, staffMembers, existingTemplates] = await Promise.all([
    prisma.location.findUnique({
      where: { id: locationId },
      select: { timezone: true },
    }),
    prisma.staff.findMany({
      where: {
        locationId,
        isActive: true,
        shiftStart: { not: null },
        shiftEnd: { not: null },
      },
      select: {
        id: true,
        shiftStart: true,
        shiftEnd: true,
      },
    }),
    prisma.taskTemplate.findMany({
      where: {
        locationId,
        isActive: true,
        id: excludeTemplateId ? { not: excludeTemplateId } : undefined,
      },
      select: {
        id: true,
        title: true,
        shiftStart: true,
        shiftEnd: true,
        recurringType: true,
        effectiveDate: true,
        recurringEndDate: true,
      },
    }),
  ]);

  const timeZone = location?.timezone ?? DEFAULT_TIME_ZONE;

  const availableStaffCount = staffMembers.filter((staff) =>
    staffShiftCoversTask(staff, shiftStart, shiftEnd, timeZone)
  ).length;

  const overlappingTemplateCount = existingTemplates.filter((template) =>
    recurrenceRangesOverlap(
      { recurringType, effectiveDate, recurringEndDate },
      template,
      timeZone
    ) &&
    timeRangesOverlap(shiftStart, shiftEnd, template.shiftStart, template.shiftEnd, timeZone)
  ).length;

  const requiredStaffCount = overlappingTemplateCount + 1;

  if (requiredStaffCount > availableStaffCount) {
    throw new ApiError(
      400,
      `Cannot create this task schedule. ${requiredStaffCount} task(s) would overlap at this location, but only ${availableStaffCount} active staff member(s) have shifts covering this time. Add staff, adjust shifts, or choose a different task time.`
    );
  }
};

const MAX_REFERENCE_IMAGES = Number(process.env.MAX_REFERENCE_IMAGES ?? 10);

const normalizeReferenceNames = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v ?? "").trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const createLegacyTaskTemplate = async (req: Request, res: Response) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (!files.length) {
    throw new ApiError(400, "At least one reference image is required");
  }

  if (files.length > MAX_REFERENCE_IMAGES) {
    throw new ApiError(400, `You can upload up to ${MAX_REFERENCE_IMAGES} reference images`);
  }

  await assertReferenceImageAllowance(req.user!.companyId, files.length);

  const result = createTaskMultipartSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join("."),
      message: e.message
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const referenceNames = normalizeReferenceNames(req.body.referenceNames);

  if (referenceNames.length !== files.length) {
    throw new ApiError(
      400,
      "Each reference image must have a name",
      [{ field: "referenceNames", message: `Expected ${files.length} names, got ${referenceNames.length}` }]
    );
  }

  const duplicateNames = new Set(
    referenceNames.filter((name, index) => referenceNames.indexOf(name) !== index)
  );

  if (duplicateNames.size > 0) {
    throw new ApiError(
      400,
      "Reference area names must be unique",
      [{ field: "referenceNames", message: `Duplicate names: ${Array.from(duplicateNames).join(", ")}` }]
    );
  }

  const { locationId } = result.data;

  const location = await prisma.location.findUnique({ where: { id: locationId } });

  if (!location || location.companyId !== req.user!.companyId || !location.isActive) {
    throw new ApiError(404, "Location not found in your company");
  }

  assertLocationAccess(req.user!, locationId);

  const data = {
    ...result.data,
    referenceImageUrl: null as string | null,
  };

  await assertLocationHasCapacityForTaskTemplate(data);

  const uploadedReferences = await Promise.all(
    files.map((file, index) =>
      uploadSingleImage(file, `task-templates/${locationId}/reference-images`).then((upload) => ({
        name: referenceNames[index],
        imageUrl: upload.secure_url,
        sortOrder: index,
      }))
    )
  );

  const taskTemplate = await prisma.$transaction(async (tx) => {
    const template = await tx.taskTemplate.create({ data });

    await tx.taskTemplateReferenceImage.createMany({
      data: uploadedReferences.map((ref) => ({
        ...ref,
        templateId: template.id,
      })),
    });

    return template;
  });

  res.status(201).json(new ApiResponse(201, taskTemplate, "Task template created successfully"));
};

export const createTaskTemplate = async (req: Request, res: Response) => {
  if (req.body.areaId === undefined) return createLegacyTaskTemplate(req,res);
  const result=createTaskMultipartSchema.safeParse(req.body);
  const selection=inventorySelectionSchema.safeParse(req.body);
  if(!result.success||!selection.success)throw new ApiError(400,"A single area and valid inventory selection are required",[...(!result.success?result.error.issues:[]),...(!selection.success?selection.error.issues:[])]);
  if(result.data.recurringEndDate&&result.data.recurringEndDate<result.data.effectiveDate)throw new ApiError(400,'Recurrence end must follow the effective date');
  const location=await requireLocationAccess(req.user!,result.data.locationId);
  if(!location.isActive)throw new ApiError(404,'Location is inactive');
  if(result.data.staffId) {
    const staff=await prisma.staff.findFirst({where:{id:result.data.staffId,companyId:req.user!.companyId,locationId:location.id,isActive:true}});
    if(!staff)throw new ApiError(422,'Choose active staff at this location');
    validateTaskAgainstStaffShift(staff,result.data.shiftStart,result.data.shiftEnd,location.timezone);
  }
  let sourceLegacyTemplateId:number|undefined;
  if(req.body.sourceLegacyTemplateId!==undefined){sourceLegacyTemplateId=Number(req.body.sourceLegacyTemplateId);if(!Number.isSafeInteger(sourceLegacyTemplateId)||!await prisma.taskTemplate.findFirst({where:{id:sourceLegacyTemplateId,locationId:location.id,verificationVersion:1,location:{companyId:req.user!.companyId}}}))throw new ApiError(422,'Legacy source must belong to this location');}
  const template=await prisma.$transaction(async tx=>{
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(872120, ${location.id})::text`;
    await validateInventorySelection(tx,location.id,selection.data);
    await assertLocationHasCapacityForTaskTemplate(result.data);
    const created=await tx.taskTemplate.create({data:{...result.data,sourceLegacyTemplateId,areaId:selection.data.areaId,verificationVersion:2}});
    await configureTemplateInventory(tx,created.id,location.id,selection.data);
    await writeAuditLog({companyId:req.user!.companyId,actorType:req.user!.role,actorId:req.user!.id,entityType:'TASK_TEMPLATE',entityId:created.id,action:'CONFIGURE_INVENTORY',newValue:selection.data},tx);
    return tx.taskTemplate.findUniqueOrThrow({where:{id:created.id},include:{inventoryItems:true,area:true}});
  });
  res.status(201).json(new ApiResponse(201,template,'Task template created'));
};

export const mapTemplateInventory = async (req: Request, res: Response) => {
  const id=Number(req.params.id); const input=inventorySelectionSchema.safeParse(req.body);
  if(!input.success)throw new ApiError(400,"Invalid inventory mapping",input.error.issues);
  const template=await prisma.taskTemplate.findUnique({where:{id},include:{location:true}});
  if(!template||template.location.companyId!==req.user!.companyId)throw new ApiError(404,"Template not found");
  assertLocationAccess(req.user!,template.locationId);
  const updated=await prisma.$transaction(async tx=>{
    await configureTemplateInventory(tx,id,template.locationId,input.data);
    await tx.verificationException.updateMany({where:{dedupeKey:`setup:template:${id}`},data:{state:'RESOLVED',resolvedAt:new Date()}});
    return tx.taskTemplate.findUniqueOrThrow({where:{id}});
  });
  res.json(new ApiResponse(200,updated,"Future tasks use this area inventory. Existing tasks are unchanged."));
};

export const editTaskTemplate = async (req: Request, res: Response) => {
  const taskTemplateId = Number(req.params.id);
  if (isNaN(taskTemplateId)) throw new ApiError(400, "Invalid task template id");

  const result = editTaskSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join("."),
      message: e.message
    }));
    throw new ApiError(400, "Validation failed", errors);
  }
  const template = await prisma.taskTemplate.findUnique({
    where: { id: taskTemplateId },
    include: { location: true , staff:true}
  });

  if (!template || template.location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Task template not found in your company");
  }

  assertLocationAccess(req.user!, template.locationId);

  if (!template.isActive) {
    throw new ApiError(400, "Task template is inactive");
  }

  let nextLocationTimeZone: string | null = null;

  if (result.data.locationId) {
    const location = await prisma.location.findUnique({
      where: { id: result.data.locationId }
    });

    if (!location || location.companyId !== req.user!.companyId || !location.isActive) {
      throw new ApiError(404, "New location not found in your company");
    }

    nextLocationTimeZone = location.timezone;
  }

  const nextLocationId = result.data.locationId ?? template.locationId;
  const nextShiftStart = result.data.shiftStart ?? template.shiftStart;
  const nextShiftEnd = result.data.shiftEnd ?? template.shiftEnd;
  const nextRecurringType = result.data.recurringType ?? template.recurringType;
  const nextEffectiveDate = result.data.effectiveDate ?? template.effectiveDate;
  const nextRecurringEndDate = result.data.recurringEndDate ?? template.recurringEndDate;
  const nextTimeZone = nextLocationTimeZone ?? template.location.timezone;
  const assignedStaff = template.staff;

  if (assignedStaff) {
    if (assignedStaff.companyId !== req.user!.companyId || !assignedStaff.isActive) {
      throw new ApiError(400, "Assigned staff is no longer active for this company");
    }

    if (assignedStaff.locationId !== nextLocationId) {
      throw new ApiError(400, "Assigned staff must belong to the same location");
    }

    validateTaskAgainstStaffShift(assignedStaff, nextShiftStart, nextShiftEnd, nextTimeZone);
  }

  await assertLocationHasCapacityForTaskTemplate({
    locationId: nextLocationId,
    shiftStart: nextShiftStart,
    shiftEnd: nextShiftEnd,
    recurringType: nextRecurringType,
    effectiveDate: nextEffectiveDate,
    recurringEndDate: nextRecurringEndDate,
    excludeTemplateId: taskTemplateId,
  });

  if (result.data.locationId) assertLocationAccess(req.user!, result.data.locationId);
  const updated = await prisma.$transaction(async tx=>{
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(872120, ${nextLocationId})::text`;
    await assertLocationHasCapacityForTaskTemplate({locationId:nextLocationId,shiftStart:nextShiftStart,shiftEnd:nextShiftEnd,recurringType:nextRecurringType,effectiveDate:nextEffectiveDate,recurringEndDate:nextRecurringEndDate,excludeTemplateId:taskTemplateId});
    if(req.body.areaId!==undefined) {
      const selection=inventorySelectionSchema.safeParse(req.body);
      if(!selection.success)throw new ApiError(400,"Invalid inventory selection",selection.error.issues);
      await validateInventorySelection(tx,nextLocationId,selection.data);
      await tx.$queryRaw`SELECT id FROM "TaskTemplate" WHERE id=${taskTemplateId} FOR UPDATE`;
      // Move the area and location together; old instances keep their immutable area.
      await tx.taskTemplateItem.deleteMany({where:{templateId:taskTemplateId}});
      await tx.taskTemplate.update({where:{id:taskTemplateId},data:{...result.data,areaId:selection.data.areaId}});
      await configureTemplateInventory(tx,taskTemplateId,nextLocationId,selection.data);
    } else {
      if(['inventorySelection','selectedItems','expectedInventoryVersion'].some(key=>req.body[key]!==undefined))throw new ApiError(400,'Inventory edits require areaId and the full versioned selection');
      if(template.verificationVersion===2 && nextLocationId!==template.locationId) throw new ApiError(422,"Choose an area at the new location");
      await tx.taskTemplate.update({where:{id:taskTemplateId},data:result.data});
    }
    return tx.taskTemplate.findUniqueOrThrow({where:{id:taskTemplateId},include:{inventoryItems:true,area:true}});
  });

  res.status(200).json(new ApiResponse(200, updated, "Task template updated successfully"));
};

export const deleteTaskTemplate = async (req: Request, res: Response) => {
  await permanentlyDelete("taskTemplate", Number(req.params.id), req.user!);
  res.status(200).json(new ApiResponse(200, {}, "Deleted permanently"));
};

export const getTaskTemplate=async (req:Request, res: Response)=>
{
  const templateId=Number(req.params.id);

  if(isNaN(templateId)) throw new ApiError(400, "Invalid task template id");

  const taskTemplate=await prisma.taskTemplate.findFirst({
    where:{
      id:templateId,
      isActive:true
    },
    include:{
      location:true,
      area:{include:{items:true}},
      inventoryItems:true
    }
  });

  if(!taskTemplate) throw new ApiError(404,"task template not found");

  if(taskTemplate.location.companyId !== req.user?.companyId) throw new ApiError(404,"task tenplate not found in your company");

  assertLocationAccess(req.user!, taskTemplate.locationId);

  res.status(200).json(
    new ApiResponse(200,taskTemplate,"task template fetched successfully")
  );

};

export const getTaskTemplatesByLocation=async (req:Request, res: Response)=>
{
  const locationId=Number(req.params.locationId);

  if(isNaN(locationId)) throw new ApiError(400, "Invalid location id");

  assertLocationAccess(req.user!, locationId);

  const location=await prisma.location.findUnique({
    where:{id:locationId}
  });

  if(!location) throw new ApiError(404,"Location not found");

  if(location.companyId !== req.user?.companyId) throw new ApiError(404,"Location not found in your company");

  const taskTemplates=await prisma.taskTemplate.findMany({
    where:{
      locationId,
      isActive:true
    }, include:{area:true,inventoryItems:true}
  });

  res.status(200).json(
    new ApiResponse(200,taskTemplates,"Task templates fetched successfully")
  );  
};
