import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BufferedClefProvider, bufferedEvaluatorVersion } from './bufferedPhoto.provider.js';
import {bufferedDecision} from './photoResultPolicy.js';
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
      const options = Object.keys(value.criteria), choice = choices[key] ?? (key.startsWith('visible_')?'VISIBLE':'CANNOT_ASSESS');
      return [key, { type: 'choice', choice, confidence: .98, probabilities: Object.fromEntries(options.map(o => [o, o === choice ? .98 : .02 / (options.length - 1)])) }];
    }));
    return new Response(JSON.stringify({ success: true, result: { model: 'clef', answers } }));
  }); vi.stubGlobal('fetch', request); return request;
}
it('one request checks the required object and view alongside cleanliness and screen recapture', async () => {
  const request = mock(), result = await new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap', 'SINK');
  expect(result.cleanliness?.verdict).toBe('CLEAN'); expect(request).toHaveBeenCalledOnce();
  const body = JSON.parse(request.mock.calls[0]![1].body);
  expect(Object.keys(body.questions)).toEqual(['originality', 'object_match', 'visible_surface_0', 'surface_0', 'visible_surface_1', 'surface_1']);
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
  if(verdict==='MISSING_SURFACE')choices.visible_surface_0='MISSING';else choices.object_match=verdict; mock();
  const result=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'), rubric, 'basin_tap', 'SINK');
  expect(verdict==='MISSING_SURFACE'?result.viewMatch:result.objectMatch).toBe(verdict);
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
  expect(bufferedEvaluatorVersion()).toMatch(/^photo-staged-checks-v4-/);
});

const toiletRubric={version:1,criteria:['No removable dirt'],views:[{key:'bowl_seat'},{key:'exterior_base'}],surfacesByView:{bowl_seat:['bowl','seat'],exterior_base:['exterior','base']}};
it.each([
  ['SQUAT','bowl_seat',['pan','drain','footrests']],
  ['WESTERN','bowl_seat',['bowl','seat']],
  ['SQUAT','exterior_base',['pan_edges','surrounding_floor']],
  ['WESTERN','exterior_base',['exterior','base']],
] as const)('accepts %s for toilet %s and only assesses its actual parts',async(style,view,surfaces)=>{
  choices.toilet_style=style;
  for(let i=0;i<surfaces.length;i++)choices[`${style.toLowerCase()}_surface_${i}`]='CLEAN';
  const request=mock();
  const result=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),toiletRubric,view,'TOILET');
  expect(result).toMatchObject({objectMatch:'MATCH',toiletStyle:style,cleanliness:{verdict:'CLEAN'}});
  expect(result.cleanliness?.surfaces.map(s=>s.surface)).toEqual([...surfaces]);
  expect(bufferedDecision(result,true,true).state).toBe('PASSED');
  expect(request).toHaveBeenCalledOnce();
  const body=JSON.parse(request.mock.calls[0]![1].body);
  expect(body.state.expected).not.toHaveProperty('requiredSurfaces');
  expect(body.state.expected.acceptableToiletViews).toHaveLength(2);
  expect(body.questions.object_match.instructions).toContain('Do not require a seat or raised pedestal');
});

it('a dirty Indian toilet still requires cleaning',async()=>{
  Object.assign(choices,{toilet_style:'SQUAT',squat_surface_0:'DIRTY',squat_surface_1:'CLEAN',squat_surface_2:'CLEAN'});mock();
  const result=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),toiletRubric,'bowl_seat','TOILET');
  expect(bufferedDecision(result,true,true)).toMatchObject({state:'CLEANING_REQUIRED',keep:false});
  expect(result.cleanliness?.surfaces[0]).toEqual({surface:'pan',verdict:'DIRTY'});
});

it.each(['WRONG_ITEM','MISSING_SURFACE'] as const)('support for Indian toilets does not bypass %s',async objectMatch=>{
  Object.assign(choices,{toilet_style:'SQUAT',object_match:objectMatch==='MISSING_SURFACE'?'MATCH':objectMatch,squat_surface_0:'CLEAN',squat_surface_1:'CLEAN',squat_surface_2:'CLEAN',...(objectMatch==='MISSING_SURFACE'?{visible_squat_surface_0:'MISSING'}:{})});mock();
  const result=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),toiletRubric,'bowl_seat','TOILET');
  expect(bufferedDecision(result,true,true)).toMatchObject({state:'RECAPTURE_REQUIRED',reason:objectMatch,keep:false});
});

it('an uncertain toilet design cannot silently select Western surfaces or pass',async()=>{
  choices.toilet_style='UNCERTAIN';mock();
  const result=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),toiletRubric,'bowl_seat','TOILET');
  expect(result).toMatchObject({toiletStyle:'UNCERTAIN',objectMatch:'MATCH',viewMatch:'UNCERTAIN',cleanliness:null});
  expect(bufferedDecision(result,true,true)).toMatchObject({state:'REVIEW_REQUIRED',reason:'VIEW_UNCERTAIN'});
});

it('checks object category and each required part as separate questions',async()=>{
 const request=mock();
 const result=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),rubric,'basin_tap','SINK');
 const body=JSON.parse(request.mock.calls[0]![1].body);
 expect(Object.keys(body.questions.object_match.criteria)).toEqual(['MATCH','WRONG_ITEM','UNCERTAIN']);
 expect(body.questions.object_match.instructions).toContain('Part visibility is checked separately');
 expect(body.questions.visible_surface_0.instructions).toContain('A dirty surface can still be fully visible');
 expect(result).toMatchObject({objectMatch:'MATCH',viewMatch:'MATCH',missingSurfaces:[]});
});
it('names a confirmed missing part independently from the object and dirt checks',async()=>{
 choices.visible_surface_1='MISSING';choices.surface_0='DIRTY';mock();
 const result=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),rubric,'basin_tap','SINK');
 expect(result).toMatchObject({objectMatch:'MATCH',viewMatch:'MISSING_SURFACE',missingSurfaces:['tap']});
 expect(bufferedDecision(result,true,true)).toMatchObject({state:'RECAPTURE_REQUIRED',reason:'MISSING_SURFACE'});
});
it('a low-confidence missing-part prediction is reviewed rather than treated as a confirmed crop',async()=>{
 choices.visible_surface_1='MISSING';mock();const request=fetch;
 vi.stubGlobal('fetch',vi.fn(async(...args:Parameters<typeof fetch>)=>{
  const response=await request(...args),body=await response.json();body.result.answers.visible_surface_1.confidence=.4;
  return new Response(JSON.stringify(body));
 }));
 const result=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),rubric,'basin_tap','SINK');
 expect(result).toMatchObject({objectMatch:'MATCH',viewMatch:'UNCERTAIN',missingSurfaces:[]});
 expect(bufferedDecision(result,true,true)).toMatchObject({state:'REVIEW_REQUIRED',reason:'VIEW_UNCERTAIN'});
});
it('a clear squat-toilet type with uncertain object/view confidence does not create a retake loop',async()=>{
 Object.assign(choices,{toilet_style:'SQUAT',squat_surface_0:'DIRTY',squat_surface_1:'DIRTY',squat_surface_2:'DIRTY'});mock();const request=fetch;
 vi.stubGlobal('fetch',vi.fn(async(...args:Parameters<typeof fetch>)=>{
  const response=await request(...args),body=await response.json();body.result.answers.object_match.confidence=.4325;
  return new Response(JSON.stringify(body));
 }));
 const result=await new BufferedClefProvider().evaluate(Buffer.from('sanitized'),toiletRubric,'bowl_seat','TOILET');
 expect(result.toiletStyle).toBe('SQUAT');
 expect(bufferedDecision(result,true,true)).toEqual({state:'REVIEW_REQUIRED',reason:'OBJECT_UNCERTAIN',keep:true});
});
