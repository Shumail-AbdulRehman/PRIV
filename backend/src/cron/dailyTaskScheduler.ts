import { prisma } from "../prisma/prisma.js";
import { resolveTaskInstanceWindow } from "./taskInstanceWindow.js";
import { getZonedDayRange } from "../utils/dateTime.js";
import { ensureAssignmentsForToday } from "../services/taskAssignment.service.js";

let isDailyTaskSchedulerRunning = false;

export const runDailyTaskScheduler = async () => {
  if (isDailyTaskSchedulerRunning) {
    console.log("Daily task scheduler skipped: previous run still in progress.");
    return;
  }

  isDailyTaskSchedulerRunning = true;

  try {
    console.log("Generating daily task instances...");

    const now = new Date();

    const dailyTemplates = await prisma.taskTemplate.findMany({
      where: {
        isActive: true,
        recurringType: "DAILY",
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

    for (const template of dailyTemplates) {
      const timeZone = template.location.timezone;
      const { start: localToday, end: localTomorrow } = getZonedDayRange(now, timeZone);

      if (template.effectiveDate > localTomorrow) continue;
      if (template.recurringEndDate && template.recurringEndDate < localToday) continue;

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

    console.log(`Task instances created: ${created}`);
    const ensuredAssignments = await ensureAssignmentsForToday();
    console.log(`Task assignments ensured: ${ensuredAssignments}`);
  } catch (error) {
    console.error("Task scheduler cron error:", error);
  } finally {
    isDailyTaskSchedulerRunning = false;
  }
};

void runDailyTaskScheduler();
setInterval(() => {
  void runDailyTaskScheduler();
}, 90 * 1000);
