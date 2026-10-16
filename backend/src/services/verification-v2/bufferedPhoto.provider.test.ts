import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BufferedClefProvider, bufferedEvaluatorVersion } from './bufferedPhoto.provider.js';
const rubric = { version: 1, criteria: ['No removable dirt'], views: [{ key: 'basin_tap' }], surfacesByView: { basin_tap: ['basin', 'tap'] } };
let choices: Record<string, string>;
beforeEach(() => {
  vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'a'.repeat(32)); vi.stubEnv('CLOUDFLARE_API_TOKEN', 'test'); vi.stubEnv('CLEF_MODEL', 'clef'); vi.stubEnv('CLEF_SCREENING_CONFIDENCE_THRESHOLD', '.9'); vi.stubEnv('CLEF_CONFIDENCE_THRESHOLD', '.9'); vi.stubEnv('CLEF_THRESHOLD_VERSION', 'test-v1');
  choices = { originality: 'DIRECT', object_match: 'MATCH', surface_0: 'CLEAN', surface_1: 'CLEAN' };
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
it('one request checks the required object and view alongside cleanliness and screen recapture', async () => {
  const request = mock(), result = await new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap', 'SINK');
  expect(result.cleanliness?.verdict).toBe('CLEAN'); expect(request).toHaveBeenCalledOnce();
  const body = JSON.parse(request.mock.calls[0]![1].body);
  expect(Object.keys(body.questions)).toEqual(['originality', 'object_match', 'surface_0', 'surface_1']);
  expect(result.objectMatch).toBe('MATCH');
  expect(body.state.expected).toEqual({fixtureType:'SINK',view:'basin_tap',requiredSurfaces:['basin','tap']});
  expect(body.questions).not.toHaveProperty('privacy');
  expect(body.questions).not.toHaveProperty('identity');
});
it.each(['DIRTY', 'CANNOT_ASSESS'] as const)('returns %s without fabricating success', async verdict => {
  choices.surface_0 = verdict; mock();
  expect((await new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap', 'SINK')).cleanliness?.verdict).toBe(verdict);
});
it('context images have only the originality question, not fixture or privacy checks', async () => {
  const request = mock(), result = await new BufferedClefProvider().evaluate(Buffer.from('sanitized'));
  expect(result.cleanliness).toBeNull(); expect(Object.keys(JSON.parse(request.mock.calls[0]![1].body).questions)).toEqual(['originality']);
});
it('malformed responses and outages throw service failures, never dirty results', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ result: { model: 'clef', answers: {} } }))));
  await expect(new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap', 'SINK')).rejects.toMatchObject({ code: 'PROVIDER_MALFORMED' });
  vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 503 })));
  await expect(new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap', 'SINK')).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE' });
});

it('without automatic-clean calibration, clear dirt can request cleaning but clean predictions remain review-only', async () => {
  vi.stubEnv('CLEF_CONFIDENCE_THRESHOLD', '');choices.surface_0='DIRTY';mock();
  const dirty=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),rubric,'basin_tap','SINK');
  expect(dirty.cleanliness?.surfaces[0]?.verdict).toBe('DIRTY');
  choices.surface_0='CLEAN';mock();
  expect((await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),rubric,'basin_tap','SINK')).cleanliness?.verdict).toBe('CANNOT_ASSESS');
});

it.each(['WRONG_ITEM', 'MISSING_SURFACE', 'UNCERTAIN'])('records %s for an object/view mismatch', async verdict => {
  choices.object_match = verdict; mock();
  expect((await new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap', 'SINK')).objectMatch).toBe(verdict);
});

it('a low-confidence object match requires a retake rather than silently matching', async () => {
  mock();
  const request = fetch;
  vi.stubGlobal('fetch', vi.fn(async (...args: Parameters<typeof fetch>) => {
    const response = await request(...args), body = await response.json();
    body.result.answers.object_match.confidence = .5;
    return new Response(JSON.stringify(body));
  }));
  expect((await new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap', 'SINK')).objectMatch).toBe('UNCERTAIN');
});

it('requires the expected category from the server and invalidates older assessment caches', async () => {
  const request = mock();
  await expect(new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap')).rejects.toMatchObject({code:'PROVIDER_CONFIGURATION_INVALID'});
  expect(request).not.toHaveBeenCalled();
  expect(bufferedEvaluatorVersion()).toMatch(/^photo-object-match-v2-/);
});
