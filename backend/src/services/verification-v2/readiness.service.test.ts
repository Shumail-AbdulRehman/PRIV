import {expect,it,vi} from 'vitest';
const query=vi.hoisted(()=>vi.fn());
vi.mock('../../prisma/prisma.js',()=>({prisma:{$queryRaw:query}}));
import {verificationSchemaReadiness} from './readiness.service.js';
it('detects a missing or partial spatial migration instead of promising capture readiness',async()=>{
 query.mockResolvedValue([]);expect(await verificationSchemaReadiness()).toEqual({ready:false,missingColumns:['spatialEvidence','spatialDecision','spatialVersion','staffSubmittedAt','activatedAt'],requiredMigration:'202610070001_spatial_observations'});
 query.mockResolvedValue([{column_name:'spatialEvidence'}]);expect((await verificationSchemaReadiness()).ready).toBe(false);
 query.mockResolvedValue(['spatialEvidence','spatialDecision','spatialVersion','staffSubmittedAt','activatedAt'].map(column_name=>({column_name})));expect(await verificationSchemaReadiness()).toEqual({ready:true,missingColumns:[],requiredMigration:null});
});

it('identifies the staff submission migration when spatial capture is already present',async()=>{query.mockResolvedValue(['spatialEvidence','spatialDecision','spatialVersion'].map(column_name=>({column_name})));expect(await verificationSchemaReadiness()).toEqual({ready:false,missingColumns:['staffSubmittedAt','activatedAt'],requiredMigration:'202610100001_sequential_capture'});});
