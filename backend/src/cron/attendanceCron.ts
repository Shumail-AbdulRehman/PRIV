import cron from "node-cron";
import { prisma } from "../prisma/prisma.js";
import {
    resolveZonedAttendanceWindow,
} from "../utils/dateTime.js";
import { syncTodaysOpenAttendanceWindow } from "../utils/syncAttendanceWindow.js";

cron.schedule("2 */6 * * *", async () => {
    try {
        console.log("Creating daily attendance records...");

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

        const { count: created } = attendanceToCreate.length
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

        console.log(`Attendance records created: ${created}`);
    } catch (error) {
        console.error("Attendance cron error:", error);
    }
});
