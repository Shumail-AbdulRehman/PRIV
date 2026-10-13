import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BufferedClefProvider } from './bufferedPhoto.provider.js';
const rubric = { version: 1, criteria: ['No removable dirt'], views: [{ key: 'basin_tap' }], surfacesByView: { basin_tap: ['basin', 'tap'] } };
let choices: Record<string, string>;
beforeEach(() => {
  vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'a'.repeat(32)); vi.stubEnv('CLOUDFLARE_API_TOKEN', 'test'); vi.stubEnv('CLEF_MODEL', 'clef'); vi.stubEnv('CLEF_SCREENING_CONFIDENCE_THRESHOLD', '.9'); vi.stubEnv('CLEF_CONFIDENCE_THRESHOLD', '.9'); vi.stubEnv('CLEF_THRESHOLD_VERSION', 'test-v1');
  choices = { originality: 'DIRECT', surface_0: 'CLEAN', surface_1: 'CLEAN' };
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function mock() {
  const request = vi.fn(async (_url, options) => {
    const body = JSON.parse(options.body), answers = Object.fromEntries(Object.entries(body.questions).map(([key, value]: [string, any]) => {
      const options = Object.keys(value.criteria), choice = choices[key];
      return [key, { type: 'choice', choice, confidence: .98, probabilities: Object.fromEntries(options.map(o => [o, o === choice ? .98 : .02 / (options.length - 1)])) }];
    }));
    return new Response(JSON.stringify({ success: true, result: { model: 'clef', answers } }));
  }); vi.stubGlobal('fetch', request); return request;
}
it('one request checks cleanliness and screen recapture with no privacy, coverage, fixture labels or identity questions', async () => {
  const request = mock(), result = await new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap');
  expect(result.cleanliness?.verdict).toBe('CLEAN'); expect(request).toHaveBeenCalledOnce();
  const body = JSON.parse(request.mock.calls[0]![1].body);
  expect(Object.keys(body.questions)).toEqual(['originality', 'surface_0', 'surface_1']);
  expect(body.state).not.toHaveProperty('expected'); expect(body.state).not.toHaveProperty('fixtureType');
});
it.each(['DIRTY', 'CANNOT_ASSESS'] as const)('returns %s without fabricating success', async verdict => {
  choices.surface_0 = verdict; mock();
  expect((await new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap')).cleanliness?.verdict).toBe(verdict);
});
it('context images have only the originality question, not fixture or privacy checks', async () => {
  const request = mock(), result = await new BufferedClefProvider().evaluate(Buffer.from('sanitized'));
  expect(result.cleanliness).toBeNull(); expect(Object.keys(JSON.parse(request.mock.calls[0]![1].body).questions)).toEqual(['originality']);
});
it('malformed responses and outages throw service failures, never dirty results', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ result: { model: 'clef', answers: {} } }))));
  await expect(new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap')).rejects.toMatchObject({ code: 'PROVIDER_MALFORMED' });
  vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 503 })));
  await expect(new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap')).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE' });
});

it('without automatic-clean calibration, clear dirt can request cleaning but clean predictions remain review-only', async () => {
  vi.stubEnv('CLEF_CONFIDENCE_THRESHOLD', '');choices.surface_0='DIRTY';mock();
  const dirty=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),rubric,'basin_tap');
  expect(dirty.cleanliness?.surfaces[0]?.verdict).toBe('DIRTY');
  choices.surface_0='CLEAN';mock();
  expect((await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),rubric,'basin_tap')).cleanliness?.verdict).toBe('CANNOT_ASSESS');
});
