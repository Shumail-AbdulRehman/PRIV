import { prisma } from '../prisma/prisma.js';
import type { VerificationTransaction } from '../services/verification-v2/transaction.js';
import { resolveZonedAttendanceWindow } from './dateTime.js';

/** Caller holds the staff row lock shared with attendance writes and transfers. */
export async function prepareStaffAttendance(tx: VerificationTransaction, staffId: number, now = new Date()) {
    const staff = await tx.staff.findFirst({ where: { id: staffId, isActive: true, company: { isActive: true } }, include: { location: true } });
    if (!staff?.location || !staff.location.isActive || !staff.shiftStart || !staff.shiftEnd) return 'NO_SHIFT' as const;
    const { date, expectedStart, expectedEnd } = resolveZonedAttendanceWindow({ baseDate: now,
        shiftStart: staff.shiftStart, shiftEnd: staff.shiftEnd, timeZone: staff.location.timezone });
    const existing = await tx.attendance.findUnique({ where: { staffId_date: { staffId, date } } });
    if (existing) {
        // Never relocate evidence, alter recorded clocks, erase lateness or move
        // an already elapsed absence. One existing recorded shift/day is retained.
        if (existing.status !== 'ABSENT' || existing.checkInTime || existing.checkOutTime ||
            existing.checkInImage || existing.checkOutImage || existing.expectedEnd < now) return 'RECORDED_SHIFT' as const;
        await tx.attendance.updateMany({ where: { id: existing.id, status: 'ABSENT', checkInTime: null, checkOutTime: null,
            checkInImage: null, checkOutImage: null, expectedEnd: { gte: now } },
            data: { locationId: staff.location.id, expectedStart, expectedEnd } });
    } else {
        await tx.attendance.createMany({ data: [{ staffId, locationId: staff.location.id, date, expectedStart, expectedEnd, status: 'ABSENT' }], skipDuplicates: true });
    }
    return 'READY' as const;
}

// Retain incumbent call shape. Read current persistence rather than scheduler or
// editor snapshots; missing timeZone on old callers no longer silently does nothing.
export async function syncTodaysOpenAttendanceWindow(input: {
    staffId: number; locationId: number | null; shiftStart: Date | null; shiftEnd: Date | null; timeZone?: string | null;
}) {
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "Staff" WHERE id=${input.staffId} FOR UPDATE`;
        return prepareStaffAttendance(tx, input.staffId);
    });
}
