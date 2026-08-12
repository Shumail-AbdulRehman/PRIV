import cron from "node-cron";
import { prisma } from "../prisma/prisma.js";
import { resolveTaskInstanceWindow } from "./taskInstanceWindow.js";
import { getZonedDayRange } from "../utils/dateTime.js";
import { ensureAssignmentsForToday } from "../services/taskAssignment.service.js";


cron.schedule("3-59/15 * * * *",async()=>
{
    try {

    console.log("Generating Once task instances...");

    const now = new Date();

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
          title: template.title,
          date,
          shiftStart,
          shiftEnd,
          staffId: template.staffId,
          locationId: template.locationId
      });
    }

    const { count: created } = instancesToCreate.length
      ? await prisma.taskInstance.createMany({
          data: instancesToCreate,
          skipDuplicates: true,
        })
      : { count: 0 };

    console.log(`Once Task instances created: ${created}`);
    const ensuredAssignments = await ensureAssignmentsForToday();
    console.log(`Once task assignments ensured: ${ensuredAssignments}`);
        
    } catch (error) {
         console.error("Once Task scheduler cron error:", error);
    }
})
