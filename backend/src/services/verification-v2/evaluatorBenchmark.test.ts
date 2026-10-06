import {describe,it,expect} from 'vitest';
import {benchmarkReport} from './evaluatorBenchmark.js';
const base={id:'a',roomId:'room',fixtureId:'fixture',fixtureType:'TOILET',split:'heldout',consented:true,visibility:'ASSESSABLE',identity:'WRONG',cleanliness:'DIRTY',predictedCleanliness:'CLEAN',wouldAutoPass:true,provider:'test',model:'test',promptVersion:'v1',rubricVersion:1,latencyMs:5,costUsd:null};
describe('held-out reporting',()=>{
 it('reports unavailable data honestly',()=>{const r=benchmarkReport([]);expect(r.status).toBe('DATASET_UNAVAILABLE');expect(r.overall.targetMet).toBe(false);expect(r.overall.falseClean95).toBeNull();});
 it('counts independent errors',()=>{const r=benchmarkReport([base]);expect(r.overall.falseClean).toBe(1);expect(r.overall.wrongAutoPasses).toBe(1);});
 it('rejects split leakage',()=>expect(()=>benchmarkReport([base,{...base,id:'b',split:'development'}])).toThrow('leakage'));
 it('never enables credit even on target success',()=>{const r=benchmarkReport(Array.from({length:100},(_,i)=>({...base,id:String(i),predictedCleanliness:'DIRTY',wouldAutoPass:false})));expect(r.overall.targetMet).toBe(true);expect(r.autoPassEnabled).toBe(false);expect(r.overall.wrongAutoPass95?.[1]).toBeGreaterThan(0);});
});
