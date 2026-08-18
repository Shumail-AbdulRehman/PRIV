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
        referenceImages: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const instancesToCreate = [];
    const instanceDateByTemplateId = new Map<number, Date>();

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
          locationId: template.locationId,
          referenceImageUrl: template.referenceImageUrl
      });

      instanceDateByTemplateId.set(template.id, date);
    }

    const { count: created } = instancesToCreate.length
      ? await prisma.taskInstance.createMany({
          data: instancesToCreate,
          skipDuplicates: true,
        })
      : { count: 0 };

    console.log(`Once Task instances created: ${created}`);

    if (created > 0) {
      const instanceWhereConditions = Array.from(instanceDateByTemplateId.entries()).map(
        ([templateId, date]) => ({ templateId, date })
      );

      const createdInstances = await prisma.taskInstance.findMany({
        where: {
          OR: instanceWhereConditions,
        },
        select: {
          id: true,
          templateId: true,
          referenceImages: { select: { id: true } },
        },
      });

      const templateReferenceMap = new Map(
        onceTemplates.map((t) => [t.id, t.referenceImages ?? []])
      );

      const referenceImagesToCreate = createdInstances
        .filter((instance) => instance.referenceImages.length === 0)
        .flatMap((instance) => {
          const refs = templateReferenceMap.get(instance.templateId ?? -1) ?? [];
          return refs.map((ref, index) => ({
            taskInstanceId: instance.id,
            name: ref.name,
            imageUrl: ref.imageUrl,
            sortOrder: index,
          }));
        });

      if (referenceImagesToCreate.length) {
        await prisma.taskInstanceReferenceImage.createMany({
          data: referenceImagesToCreate,
          skipDuplicates: true,
        });
        console.log(`Once task instance reference images created: ${referenceImagesToCreate.length}`);
      }
    }

    const ensuredAssignments = await ensureAssignmentsForToday();
    console.log(`Once task assignments ensured: ${ensuredAssignments}`);
        
    } catch (error) {
         console.error("Once Task scheduler cron error:", error);
    }
})
