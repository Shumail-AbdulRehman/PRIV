import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blankCreateForm, buildDateTimeIso, buildEffectiveDate, validateScheduleStep } from '../src/pages/Task/taskScheduleForm.ts';

const file = new File(['photo'], 'lobby.png', { type: 'image/png' });
const valid = () => ({ ...blankCreateForm(), title: '  Lobby  ', effectiveDate: '2026-09-18', shiftStart: '09:00', shiftEnd: '10:00', referenceImages: [{ id: 'one', name: 'Lobby', file, previewUrl: null }] });

test('reference areas require aligned names and files without dropping partial rows', () => {
  const form = valid();
  assert.equal(validateScheduleStep(form, 0, 5), null);
  form.referenceImages.push({ id: 'two', name: 'Sink', file: null, previewUrl: null });
  assert.match(validateScheduleStep(form, 0, 5), /both a name and a photo/);
  form.referenceImages[1].file = file;
  form.referenceImages[1].name = 'Lobby';
  assert.match(validateScheduleStep(form, 0, 5), /unique/);
  form.referenceImages[1].name = 'Sink';
  assert.match(validateScheduleStep(form, 0, 1), /up to 1/);
});

test('recurrence end and required times are validated before submission', () => {
  const form = valid();
  assert.equal(validateScheduleStep(form, 2), null);
  form.recurringEndDate = '2026-09-17';
  assert.match(validateScheduleStep(form, 2), /on or after/);
  form.recurringEndDate = '2026-09-19';
  assert.equal(validateScheduleStep(form, 2), null);
  form.shiftStart = '';
  assert.match(validateScheduleStep(form, 2), /start time/);
});

test('site wall times use the site time zone and date-only values keep existing UTC convention', () => {
  assert.equal(buildDateTimeIso('Asia/Karachi', '2026-09-18', '09:00'), '2026-09-18T04:00:00.000Z');
  assert.equal(buildDateTimeIso('America/Los_Angeles', '2026-09-18', '09:00'), '2026-09-18T16:00:00.000Z');
  assert.equal(buildEffectiveDate('2026-09-18').toISOString(), '2026-09-18T00:00:00.000Z');
});
