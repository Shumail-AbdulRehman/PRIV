import { prisma } from "../prisma/prisma.js";
import { resolveTaskInstanceWindow } from "./taskInstanceWindow.js";
import { getZonedDayRange, resolveZonedAttendanceWindow } from "../utils/dateTime.js";
import { syncTodaysOpenAttendanceWindow } from "../utils/syncAttendanceWindow.js";
import { ensureAssignmentsForToday } from "../services/taskAssignment.service.js";


export async function runStartupCron(): Promise<void> {
    try {
        const now = new Date();

       

        const eligibleStaff = await prisma.staff.findMany({
            where: {
                isActive: true,
                locationId: { not: null },
                shiftStart: { not: null },
                shiftEnd: { not: null },
            },
            select: {
                id: true,
                locationId: true,
                shiftStart: true,
                shiftEnd: true,
                location: {
                    select: {
                        timezone: true,
                    },
                },
            },
        });

        const attendanceToCreate = [];

        for (const staff of eligibleStaff) {
            if (!staff.location) continue;

            const { date, expectedStart, expectedEnd } = resolveZonedAttendanceWindow({
                baseDate: now,
                shiftStart: staff.shiftStart!,
                shiftEnd: staff.shiftEnd!,
                timeZone: staff.location.timezone,
            });

            attendanceToCreate.push({
                    staffId: staff.id,
                    locationId: staff.locationId!,
                    date,
                    expectedStart,
                    expectedEnd,
                    status: "ABSENT" as const,
            });
        }

        const { count: attendanceCreated } = attendanceToCreate.length
            ? await prisma.attendance.createMany({
                data: attendanceToCreate,
                skipDuplicates: true,
            })
            : { count: 0 };

        for (const staff of eligibleStaff) {
            await syncTodaysOpenAttendanceWindow({
                staffId: staff.id,
                locationId: staff.locationId,
                shiftStart: staff.shiftStart,
                shiftEnd: staff.shiftEnd,
                timeZone: staff.location?.timezone,
            });
        }

       

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
                    locationId: template.locationId,
            });
        }

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
            });
        }

        const { count: tasksCreated } = instancesToCreate.length
            ? await prisma.taskInstance.createMany({
                data: instancesToCreate,
                skipDuplicates: true,
            })
            : { count: 0 };

        const assignmentsEnsured = await ensureAssignmentsForToday();

        if (attendanceCreated > 0 || tasksCreated > 0) {
            console.log(
                `Startup cron: created ${attendanceCreated} attendance record(s), ${tasksCreated} task instance(s), ensured ${assignmentsEnsured} assignment(s) for today.`
            );
        } else {
            console.log(`Startup cron: all today's records already exist; ensured ${assignmentsEnsured} assignment(s).`);
        }
    } catch (error) {
        console.error("Startup cron error:", error);
    }
}
