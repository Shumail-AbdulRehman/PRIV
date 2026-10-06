import {describe,it,expect,vi,beforeEach} from 'vitest';
import jwt from 'jsonwebtoken';
import type {Request,Response} from 'express';
const m=vi.hoisted(()=>({staff:vi.fn(),manager:vi.fn(),locations:vi.fn()}));
vi.mock('../prisma/prisma.js',()=>({prisma:{staff:{findUnique:m.staff},manager:{findUnique:m.manager},managerLocation:{findMany:m.locations}}}));
import {verifyJwt} from './auth.middleware.js';
process.env.ACCESS_TOKEN_SECRET='test-auth-secret';
const request=(role:string)=>({cookies:{},header:()=>`Bearer ${jwt.sign({id:1,role},'test-auth-secret')}`} as unknown as Request);
beforeEach(()=>{vi.resetAllMocks();m.locations.mockResolvedValue([]);});
describe('active JWT principals',()=>{
 it('rejects inactive staff',async()=>{m.staff.mockResolvedValue({id:1,companyId:1,role:'STAFF',isActive:false,company:{isActive:true}});await expect(verifyJwt(request('STAFF'),{} as Response,vi.fn())).rejects.toMatchObject({statusCode:403});});
 it('rejects obsolete role claims against the current manager role',async()=>{m.manager.mockResolvedValue({id:1,role:'MANAGER',isActive:true,company:{isActive:true}});await expect(verifyJwt(request('ADMIN'),{} as Response,vi.fn())).rejects.toMatchObject({statusCode:401});});
 it('rejects disabled companies',async()=>{m.staff.mockResolvedValue({id:1,role:'STAFF',isActive:true,company:{isActive:false}});await expect(verifyJwt(request('STAFF'),{} as Response,vi.fn())).rejects.toMatchObject({statusCode:403});});
 it('loads staff and manager IDs from separate tables',async()=>{m.staff.mockResolvedValue({id:1,companyId:1,role:'STAFF',isActive:true,company:{isActive:true}});const req=request('STAFF');await verifyJwt(req,{} as Response,vi.fn());expect(m.manager).not.toHaveBeenCalled();expect(req.user).toMatchObject({id:1,role:'STAFF'});expect(req.user).not.toHaveProperty('company');});
});
