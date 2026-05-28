import cron from "node-cron";
import { prisma } from "../prisma/prisma.js";
import { resolveTaskInstanceWindow } from "./taskInstanceWindow.js";
import { KARACHI_TIMEZONE, getKarachiDayRange } from "../utils/karachiTime.js";


cron.schedule("*/5 * * * *",async()=>
{
    try {

    console.log("Generating Once task instances...");

    const { start: today, end: tomorrow } = getKarachiDayRange();

        const onceTemplates = await prisma.taskTemplate.findMany({
      where: {
        isActive: true,
        recurringType: "ONCE",
        effectiveDate: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        staff: {
          select: {
            shiftStart: true,
            shiftEnd: true,
          },
        },
      },
    });

    const instancesToCreate = [];

    for (const template of onceTemplates) {
      const { date, shiftStart, shiftEnd } = resolveTaskInstanceWindow({
        baseDate: today,
        taskShiftStart: template.shiftStart,
        taskShiftEnd: template.shiftEnd,
        staffShiftStart: template.staff?.shiftStart,
        staffShiftEnd: template.staff?.shiftEnd,
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
        
    } catch (error) {
         console.error("Once Task scheduler cron error:", error);
    }
}, { timezone: KARACHI_TIMEZONE })
