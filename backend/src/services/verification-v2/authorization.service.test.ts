import {describe,it,expect,vi,beforeEach} from 'vitest';
const m=vi.hoisted(()=>({staff:vi.fn(),manager:vi.fn(),location:vi.fn(),area:vi.fn(),task:vi.fn(),assignment:vi.fn()}));
vi.mock('../../prisma/prisma.js',()=>({prisma:{staff:{findFirst:m.staff},manager:{findFirst:m.manager},location:{findFirst:m.location},area:{findUnique:m.area},taskInstance:{findUnique:m.task},managerLocation:{findUnique:m.assignment}}}));
import {requireTaskAccess,requireAreaAccess,requireLocationAccess,requireAssignmentAccess} from './authorization.service.js';
const staff={id:7,companyId:1,role:'STAFF' as const};
const manager={id:7,companyId:1,role:'MANAGER' as const};
beforeEach(()=>{vi.resetAllMocks();m.staff.mockResolvedValue({id:7,isActive:true});m.manager.mockResolvedValue({id:7,isActive:true});m.location.mockResolvedValue({id:2,companyId:1,isActive:true});m.assignment.mockResolvedValue({managerId:7,locationId:2});m.task.mockResolvedValue({id:3,isActive:true,locationId:2,location:{companyId:1},staffId:7,assignmentEpoch:4,assignments:[{id:8,staffId:7,status:'STARTED'}]});});
describe('verification authorization',()=>{
 it('does not authorize a manager with the same numeric staff ID',async()=>{await expect(requireTaskAccess(manager,3,{staffMutation:true})).rejects.toThrow('Staff account required');});
 it('rejects inactive staff before reading task evidence',async()=>{m.staff.mockResolvedValue(null);await expect(requireTaskAccess(staff,3)).rejects.toThrow('Active account');expect(m.task).not.toHaveBeenCalled();});
 it('hides foreign tenant tasks and areas',async()=>{m.task.mockResolvedValue({location:{companyId:2}});m.area.mockResolvedValue({location:{companyId:2}});await expect(requireTaskAccess(staff,3)).rejects.toThrow('Task not found');await expect(requireAreaAccess(manager,5)).rejects.toThrow('Area not found');});
 it('uses current manager location membership instead of stale actor claims',async()=>{m.assignment.mockResolvedValue(null);await expect(requireLocationAccess({...manager,locationIds:[2]},2)).rejects.toThrow('Location access');});
 it('rejects former owners and stale epochs',async()=>{await expect(requireAssignmentAccess(staff,3,8,3)).rejects.toThrow('Assignment changed');m.task.mockResolvedValue({id:3,isActive:true,locationId:2,location:{companyId:1},staffId:9,assignments:[]});await expect(requireTaskAccess(staff,3)).rejects.toThrow('Current active assignment');});
});
