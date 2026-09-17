import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attentionReasons, needsAttention, sortedStaff, staffTodayLink } from '../src/pages/Manager/todayPresentation.ts';

const asOf = '2026-09-17T01:00:00.000Z';
const task = (status, end, isLate = false, isCurrentlyLate = false) => ({
  id: 1, title: 'Clean', status, shiftStart: '2026-09-16T23:00:00.000Z', shiftEnd: end,
  isLate, isCurrentlyLate, lateMinutes: null,
});
const entry = (id, name, overrides = {}) => ({
  staff: { id, name, email: `${id}@example.test`, locationId: 1, shiftStart: null, shiftEnd: null, location: { id: 1, name: 'Site', timezone: 'UTC' } },
  localDate: '2026-09-17', attendance: null, attendanceDisplayStatus: 'NO_RECORD_TODAY',
  tasks: [], taskCounts: { pending: 0, inProgress: 0, completed: 0, missed: 0, notCompletedInTime: 0, cancelled: 0, late: 0, total: 0 },
  attentionCount: 0,
  flags: { isAbsent: false, isPresent: false, isLateAttendance: false, isShiftNotStarted: false, hasPendingTasks: false, hasInProgressTasks: false, hasAttentionTasks: false },
  ...overrides,
});

test('future shift and missing attendance row remain neutral; absent record is attention', () => {
  const future = entry(1, 'Future', { attendanceDisplayStatus: 'SHIFT_NOT_STARTED', flags: { ...entry(1, '').flags, isShiftNotStarted: true } });
  const missingRow = entry(2, 'No record');
  const absent = entry(3, 'Absent', { flags: { ...entry(3, '').flags, isAbsent: true } });
  assert.equal(needsAttention(future), false);
  assert.equal(needsAttention(missingRow), false);
  assert.deepEqual(attentionReasons(missingRow, asOf), []);
  assert.deepEqual(attentionReasons(absent, asOf), ['Missing check-in']);
});

test('open overdue, late start, completed late, and cancelled use distinct wording', () => {
  const person = entry(1, 'Mixed', { tasks: [
    task('PENDING', '2026-09-17T02:00:00.000Z', false, true),
    task('IN_PROGRESS', '2026-09-17T00:00:00.000Z'),
    task('COMPLETED', '2026-09-17T00:00:00.000Z', true),
    task('CANCELLED', '2026-09-17T00:00:00.000Z', true),
    task('MISSED', '2026-09-17T00:00:00.000Z'),
    task('NOT_COMPLETED_INTIME', '2026-09-17T00:00:00.000Z'),
  ], attendance: { status: 'MISSED_CHECKOUT' } });
  assert.deepEqual(attentionReasons(person, asOf), [
    'Missing check-out', '1 late start', '1 overdue task', '1 task completed late',
    '1 missed task', '1 task not completed on time',
  ]);
});

test('Today and Overview use the same attention membership and ordering', () => {
  const absent = entry(3, 'Zed', { flags: { ...entry(3, '').flags, isAbsent: true } });
  const overdue = entry(2, 'Bob', { flags: { ...entry(2, '').flags, hasAttentionTasks: true }, tasks: [task('PENDING', '2026-09-17T00:00:00.000Z')] });
  const late = entry(4, 'Amy', { flags: { ...entry(4, '').flags, isLateAttendance: true } });
  const normal = entry(1, 'Carl');
  const entries = [normal, late, overdue, absent];
  assert.deepEqual(sortedStaff(entries, true, asOf).map((x) => x.staff.id), [3, 2, 4]);
  assert.equal(entries.filter(needsAttention).length, sortedStaff(entries, true, asOf).length);
  assert.deepEqual(sortedStaff(entries, false, asOf).map((x) => x.staff.name), ['Amy', 'Bob', 'Carl', 'Zed']);
});

test('detail links use each staff member’s local day', () => {
  const east = entry(1, 'East', { localDate: '2026-09-17' });
  const west = entry(2, 'West', { localDate: '2026-09-16' });
  assert.match(staffTodayLink(east), /dateFrom=2026-09-17&dateTo=2026-09-17/);
  assert.match(staffTodayLink(west), /dateFrom=2026-09-16&dateTo=2026-09-16/);
});
