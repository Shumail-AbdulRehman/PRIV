vi.mock('../services/launchJobs.service.js',()=>({jobAccountAllowed:vi.fn(async()=>true)}));
import { beforeEach, describe, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ staff: vi.fn(), find: vi.fn(), update: vi.fn(), create: vi.fn(), lock: vi.fn() }));
vi.mock('../prisma/prisma.js', () => ({ prisma: { $transaction: (run: (tx: unknown) => unknown) => run({ $queryRaw: m.lock,
    staff: { findFirst: m.staff }, attendance: { findUnique: m.find, updateMany: m.update, createMany: m.create } }) } }));
import { prepareStaffAttendance, syncTodaysOpenAttendanceWindow } from './syncAttendanceWindow.js';
const now = new Date('2026-10-20T07:00:00Z');
const staff = { id: 7, locationId: 30, shiftStart: new Date('2026-10-20T03:00:00Z'), shiftEnd: new Date('2026-10-20T11:00:00Z'),
    location: { id: 30, isActive: true, timezone: 'Asia/Karachi' } };
const row = { id: 9, status: 'ABSENT', checkInTime: null, checkOutTime: null, checkInImage: null, checkOutImage: null, expectedEnd: new Date(+now + 3600000) };
const tx = { staff: { findFirst: m.staff }, attendance: { findUnique: m.find, updateMany: m.update, createMany: m.create } } as unknown as Parameters<typeof prepareStaffAttendance>[0];
beforeEach(() => { vi.resetAllMocks(); m.staff.mockResolvedValue(staff); m.find.mockResolvedValue(row); m.update.mockResolvedValue({ count: 1 }); });
describe('current unrecorded attendance preparation', () => {
    it('prepares only a still-unstarted absence using current site/timezone/shift', async () => {
        expect(await prepareStaffAttendance(tx, 7, now)).toBe('READY');
        expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ checkInTime: null, checkInImage: null, status: 'ABSENT' }), data: expect.objectContaining({ locationId: 30, expectedStart: staff.shiftStart, expectedEnd: staff.shiftEnd }) }));
        expect(m.update.mock.calls[0]![0].data.isLateCheckIn).toBeUndefined();
    });
    it.each([
        { status: 'CHECKED_IN' }, { status: 'LATE' }, { status: 'CHECKED_OUT' }, { checkInTime: now },
        { checkOutTime: now }, { checkInImage: 'retained-private-photo' }, { checkOutImage: 'retained-private-photo' },
        { expectedEnd: new Date(+now - 1) },
    ])('never overwrites recorded, evidence-bearing or elapsed attendance %j', async change => {
        m.find.mockResolvedValue({ ...row, ...change });
        expect(await prepareStaffAttendance(tx, 7, now)).toBe('RECORDED_SHIFT');
        expect(m.update).not.toHaveBeenCalled(); expect(m.create).not.toHaveBeenCalled();
    });
    it('does not manufacture an absence before onboarding', async () => {
        m.find.mockResolvedValue(null); m.staff.mockResolvedValue({...staff, createdAt: now});
        expect(await prepareStaffAttendance(tx, 7, now)).toBe('BEFORE_ONBOARDING');
        expect(m.create).not.toHaveBeenCalled();
    });
    it('creates an absent current-site window if none exists', async () => {
        m.find.mockResolvedValue(null);
        expect(await prepareStaffAttendance(tx, 7, now)).toBe('READY');
        expect(m.create).toHaveBeenCalledWith({ data: [{ staffId: 7, locationId: 30, date: new Date('2026-10-19T19:00:00Z'), expectedStart: staff.shiftStart, expectedEnd: staff.shiftEnd, status: 'ABSENT' }], skipDuplicates: true });
    });
    it.each([null, { ...staff, location: null }, { ...staff, shiftStart: null }, { ...staff, location: { ...staff.location, isActive: false } }])('does not manufacture readiness for unavailable staff/site/shift', async value => {
        m.staff.mockResolvedValue(value);
        expect(await prepareStaffAttendance(tx, 7, now)).toBe('NO_SHIFT'); expect(m.update).not.toHaveBeenCalled();
    });
    it('takes the shared staff lock and disregards stale scheduler location snapshots', async () => {
        m.find.mockResolvedValue(null);
        await syncTodaysOpenAttendanceWindow({ staffId: 7, locationId: 20, shiftStart: null, shiftEnd: null });
        expect(m.lock).toHaveBeenCalledBefore(m.staff);
        expect(m.create.mock.calls[0]![0].data[0].locationId).toBe(30);
        expect(m.staff).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 7, isActive: true, company: { isActive: true, operationalStatus: "ACTIVE" } } }));
    });
});
