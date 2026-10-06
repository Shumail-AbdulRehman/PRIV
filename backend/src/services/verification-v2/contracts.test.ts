import {describe,it,expect} from 'vitest';
import {captureMetadataSchema,requiredViewsSchema,sessionRequestSchema} from './contracts.js';
import {resolvePolicy} from './verificationPolicy.service.js';
describe('v2 contracts',()=>{
 it('requires bound capture identities and rejects arbitrary fields',()=>{expect(captureMetadataSchema.safeParse({}).success).toBe(false);expect(sessionRequestSchema.safeParse({workflowVersion:1}).success).toBe(false);});
 it('rejects ambiguous and empty required views',()=>{expect(requiredViewsSchema.safeParse([]).success).toBe(false);expect(requiredViewsSchema.safeParse([{key:'x',instructions:'Show'},{key:'x',instructions:'Show'}]).success).toBe(false);});
 it('bounds server policy independently of subscriptions',()=>{expect(resolvePolicy(null).captureMinutes).toBe(20);expect(()=>resolvePolicy({maxItems:201})).toThrow();expect(()=>resolvePolicy({maxExtensionMinutes:121})).toThrow();});
});
