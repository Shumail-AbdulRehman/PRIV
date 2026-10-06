import {z} from 'zod';
import {requiredRubricSurfaces} from './rubrics.js';
import type {ImageAssessmentProvider,Assessment} from './provider.service.js';
const verdict=z.enum(['CLEAN','NEEDS_ATTENTION','DIRTY','CANNOT_ASSESS']);
export const cleanlinessResultSchema=z.object({verdict,surfaces:z.array(z.object({surface:z.string().min(1).max(100),verdict}).strict()).min(1).max(20),reasonCode:z.enum(['CLEAN','CLEANING_REQUIRED','CANNOT_ASSESS'])}).strict();
export type CleanlinessResult=z.infer<typeof cleanlinessResultSchema>;
export interface CleanlinessProvider{evaluate(image:Buffer,rubric:unknown,view:string):Promise<Assessment<CleanlinessResult>>;}
export function validateCleanlinessResult(raw:unknown,requiredSurfaces:string[]){
 const result=cleanlinessResultSchema.parse(raw);
 if(new Set(result.surfaces.map(s=>s.surface)).size!==result.surfaces.length||result.surfaces.length!==requiredSurfaces.length||requiredSurfaces.some(s=>!result.surfaces.some(v=>v.surface===s)))throw new Error('Missing, extra or repeated required surface');
 const values=result.surfaces.map(s=>s.verdict);
 const aggregate=values.includes('CANNOT_ASSESS')?'CANNOT_ASSESS':values.includes('DIRTY')?'DIRTY':values.includes('NEEDS_ATTENTION')?'NEEDS_ATTENTION':'CLEAN';
 const reason=aggregate==='CLEAN'?'CLEAN':aggregate==='CANNOT_ASSESS'?'CANNOT_ASSESS':'CLEANING_REQUIRED';
 if(result.verdict!==aggregate||result.reasonCode!==reason)throw new Error('Contradictory aggregate verdict');
 return result;
}
export async function assessCleanliness(provider:ImageAssessmentProvider,image:Buffer,rubric:unknown,view:string){
 const surfaces=requiredRubricSurfaces(rubric,view);
 const assessment=await provider.assess('cleanliness',`Assess visible cleanliness only after controlled capture, privacy and coverage passed. Never use a reference image or similarity score. Hidden/unreadable required surface must be CANNOT_ASSESS, not DIRTY. Snapshot rubric: ${JSON.stringify(rubric)}. Required view: ${view}. Assess exactly these surfaces individually: ${JSON.stringify(surfaces)}. JSON: verdict CLEAN/NEEDS_ATTENTION/DIRTY/CANNOT_ASSESS, surfaces [{surface,verdict}], reasonCode CLEAN/CLEANING_REQUIRED/CANNOT_ASSESS. Aggregate prioritizes CANNOT_ASSESS, then DIRTY, then NEEDS_ATTENTION, then CLEAN.`,[image],cleanlinessResultSchema);
 return {...assessment,result:validateCleanlinessResult(assessment.result,surfaces),rubricVersion:(rubric as {version:number}).version};
}
/** No fixture is eligible until a measured held-out benchmark is recorded and reviewed. */
export function autoPassAllowed(_fixtureType:string){return false;}
