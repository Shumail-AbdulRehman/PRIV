import {describe,it,expect} from 'vitest';
import {signAreaQr,signFixtureQr,verifyAreaQr,slotNonce,hashNonce} from './qr.service.js';
process.env.VERIFICATION_QR_SECRET='test-only-key-longer-than-thirty-two-characters';
process.env.VERIFICATION_SLOT_SECRET='independent-test-slot-key-at-least-thirty-two';
const area={id:1,qrVersion:1,qrNonce:'opaque-identity'};
describe('signed area and fixture authority',()=>{
 it('accepts the current signed area, rejects tampering, other areas and rotations',()=>{const qr=signAreaQr(area);expect(verifyAreaQr(qr,area).areaId).toBe(1);expect(()=>verifyAreaQr(qr,{...area,id:2})).toThrow();expect(()=>verifyAreaQr(qr,{...area,qrVersion:2})).toThrow();expect(()=>verifyAreaQr(qr+'tamper',area)).toThrow();});
 it('does not let a fixture label substitute for the area scan',()=>{expect(()=>verifyAreaQr(signFixtureQr(area,10),area)).toThrow();});
 it('binds reconstructible slot secrets to session, slot and generation',()=>{const nonce=slotNonce('session','slot',0);expect(slotNonce('session','slot',0)).toBe(nonce);expect(slotNonce('other','slot',0)).not.toBe(nonce);expect(slotNonce('session','slot',1)).not.toBe(nonce);expect(hashNonce(nonce)).toHaveLength(64);});
});
