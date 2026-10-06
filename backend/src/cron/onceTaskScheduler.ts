import { generateTaskInstances } from "../services/verification-v2/inventorySnapshot.service.js";
import cron from "node-cron";
import { prisma } from "../prisma/prisma.js";
import { resolveTaskInstanceWindow } from "./taskInstanceWindow.js";
import { getZonedDayRange } from "../utils/dateTime.js";
import { ensureAssignmentsForToday } from "../services/taskAssignment.service.js";


export async function runOnceTaskScheduler(now = new Date())
{
    try {

    console.log("Generating Once task instances...");



        const onceTemplates = await prisma.taskTemplate.findMany({
      where: {
        isActive: true,
        recurringType: "ONCE",
      },
      include: {
        staff: {
          select: {
            shiftStart: true,
            shiftEnd: true,
          },
        },
        location: {
          select: {
            timezone: true,
          },
        },
        referenceImages: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const instancesToCreate = [];


    for (const template of onceTemplates) {
      const timeZone = template.location.timezone;
      const { start: localToday, end: localTomorrow } = getZonedDayRange(now, timeZone);

      if (template.effectiveDate < localToday || template.effectiveDate >= localTomorrow) continue;

      const { date, shiftStart, shiftEnd } = resolveTaskInstanceWindow({
        baseDate: localToday,
        taskShiftStart: template.shiftStart,
        taskShiftEnd: template.shiftEnd,
        staffShiftStart: template.staff?.shiftStart,
        staffShiftEnd: template.staff?.shiftEnd,
        timeZone,
      });

      instancesToCreate.push({
          templateId: template.id,
          baseDate: localToday,
          title: template.title,
          date,
          shiftStart,
          shiftEnd,
          staffId: template.staffId,
          locationId: template.locationId,
          referenceImageUrl: template.referenceImageUrl
      });


    }

    const { count: created } = instancesToCreate.length
      ? await generateTaskInstances(instancesToCreate)
      : { count: 0 };

    console.log(`Once Task instances created: ${created}`);

    const ensuredAssignments = await ensureAssignmentsForToday();
    console.log(`Once task assignments ensured: ${ensuredAssignments}`);

    } catch (error) {
         console.error("Once Task scheduler cron error:", error);
    }
}

if (process.env.NODE_ENV !== "test") cron.schedule("3-59/15 * * * *",()=>runOnceTaskScheduler());
