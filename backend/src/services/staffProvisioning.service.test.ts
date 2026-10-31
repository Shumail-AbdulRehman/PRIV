import { expect,it,vi } from 'vitest';
import { insertStaff } from './staffProvisioning.service.js';
it('serializes normalized email identities before shared Prisma hashing insertion',async()=>{
 const lock=vi.fn(),findFirst=vi.fn().mockResolvedValue(null),create=vi.fn().mockResolvedValue({id:7});
 const tx={$queryRaw:lock,staff:{findFirst,create}} as unknown as Parameters<typeof insertStaff>[0];
 const data={name:'Worker',email:'a@example.com',phone:'03001234567',password:'one-time-random-fixture'};
 expect(await insertStaff(tx,1,data,true)).toEqual({id:7});expect(lock).toHaveBeenCalledBefore(findFirst);expect(create).toHaveBeenCalledWith({data:{...data,companyId:1,locationId:null,shiftStart:null,shiftEnd:null,mustChangePassword:true}});
 findFirst.mockResolvedValue({id:9});await expect(insertStaff(tx,1,data)).rejects.toMatchObject({statusCode:409});expect(create).toHaveBeenCalledTimes(1);
});
