import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExcelJS from 'exceljs';
const m=vi.hoisted(()=>({staff:vi.fn(),audit:vi.fn(),create:vi.fn(),authorize:vi.fn(),capacity:vi.fn(),action:vi.fn(),state:vi.fn(),count:vi.fn()}));
vi.mock('../prisma/prisma.js',()=>({prisma:{staff:{findMany:m.staff,count:m.count},auditLog:{findFirst:m.audit}}}));
vi.mock('./verification-v2/authorization.service.js',()=>({requireOperationalRole:(actor:{role:string})=>{if(actor.role==='STAFF')throw Error('Denied');},requireLocationAccess:m.authorize}));
vi.mock('./accountAccess.service.js',()=>({assertAccountAction:m.action,readAccountState:m.state,withAccountCapacity:m.capacity}));
vi.mock('../utils/syncAttendanceWindow.js',()=>({prepareStaffAttendance:vi.fn()}));
vi.mock('./staffProvisioning.service.js',()=>({insertStaff:m.create}));
vi.mock('./auditLog.service.js',()=>({writeAuditLog:vi.fn()}));
import { HEADERS, parseStaffFile, staffTemplate, previewStaffImport, confirmStaffImport } from './staffImport.service.js';
const actor={id:1,companyId:1,role:'ADMIN' as const};
const TEST_PASSWORD='LocalImport!42';
const csv=(line='Ahmed Khan,ahmed@example.com,03001234567,22:00,06:00')=>Buffer.from(HEADERS.join(',')+'\n'+line.split('\n').map(row=>row+','+TEST_PASSWORD).join('\n'));
beforeEach(()=>{vi.clearAllMocks();process.env.ACCESS_TOKEN_SECRET='unit-test-only-import-secret-long-enough';m.authorize.mockResolvedValue({id:3,name:'Site',timezone:'Asia/Karachi',isActive:true});m.staff.mockResolvedValue([]);m.audit.mockResolvedValue(null);m.state.mockResolvedValue({company:{plan:'ADVANCED'}});m.count.mockResolvedValue(0);});
describe('bounded spreadsheet parsing',()=>{
 it('reads CSV text without dropping phone zero and normalizes email',async()=>{const [row]=await parseStaffFile(csv('Ahmed Khan,AHMED@example.com,03001234567,22:00,06:00'),'staff.csv');expect(row).toMatchObject({row:2,email:'ahmed@example.com',phone:'03001234567',start:'22:00',end:'06:00',errors:[]});});
 it('generates exact XLSX headers and reads real Excel time numbers',async()=>{const book=new ExcelJS.Workbook();await book.xlsx.load(await staffTemplate());expect(book.worksheets[0]!.getRow(1).values).toEqual([undefined,...HEADERS]);book.worksheets[0]!.addRow(['Ahmed Khan','ahmed@example.com','03001234567',22/24,6/24,TEST_PASSWORD]);const rows=await parseStaffFile(Buffer.from(await book.xlsx.writeBuffer()),'staff.xlsx');expect(rows[0]).toMatchObject({start:'22:00',end:'06:00',errors:[]});});
 it.each(['bad.exe','staff.xls'])('rejects unsupported %s',async name=>{await expect(parseStaffFile(csv(),name)).rejects.toMatchObject({statusCode:400});});
 it('rejects an oversized expanded workbook before XML parsing',async()=>{const book=new ExcelJS.Workbook(),sheet=book.addWorksheet('Staff');sheet.addRow(HEADERS);sheet.addRow(['x'.repeat(9*1024*1024),'a@example.com','03001234567','08:00','16:00',TEST_PASSWORD]);const bytes=Buffer.from(await book.xlsx.writeBuffer());expect(bytes.length).toBeLessThan(1024*1024);await expect(parseStaffFile(bytes,'staff.xlsx')).rejects.toMatchObject({statusCode:400});});
 it('accepts native Excel time cells and rejects phone separators without digits',async()=>{const book=new ExcelJS.Workbook(),sheet=book.addWorksheet('Staff');sheet.addRow(HEADERS);sheet.addRow(['Worker','a@example.com','-------',new Date('1899-12-30T22:00:00Z'),new Date('1899-12-30T06:00:00Z'),TEST_PASSWORD]);sheet.getCell('D2').numFmt='hh:mm';sheet.getCell('E2').numFmt='hh:mm';const [row]=await parseStaffFile(Buffer.from(await book.xlsx.writeBuffer()),'staff.xlsx');expect(row).toMatchObject({start:'22:00',end:'06:00'});expect(row!.errors).toContain('Enter a valid phone as text, including any leading zero.');});
 it('rejects malformed xlsx',async()=>{await expect(parseStaffFile(csv(),'staff.xlsx')).rejects.toMatchObject({statusCode:400});});
 it('rejects oversized file',async()=>{await expect(parseStaffFile(Buffer.alloc(1024*1024+1),'staff.csv')).rejects.toMatchObject({statusCode:400});});
 it.each(['','Full Name,Email,Email,Shift Start,Shift End\nA,a,b,08:00,16:00','Full Name,Email,Phone,Shift Start,Shift End,Location\nA,a,b,08:00,16:00,site'])('rejects empty/duplicate/additional columns',async text=>{await expect(parseStaffFile(Buffer.from(text),'staff.csv')).rejects.toMatchObject({statusCode:400});});
 it.each(['X,bad,bad,25:00,06:00','Ahmed,a@example.com,03001234567,08:00,08:00','Ahmed,a@example.com,03001234567,8:00,16:00'])('reports row field errors for %s',async line=>{expect((await parseStaffFile(csv(line),'staff.csv'))[0]!.errors.length).toBeGreaterThan(0);});
 it('marks duplicate normalized file emails',async()=>{const rows=await parseStaffFile(csv('Ahmed,a@example.com,03001234567,08:00,16:00\nAli,A@example.com,03011234567,09:00,17:00'),'staff.csv');expect(rows[1]!.errors).toContain('Duplicate email in this spreadsheet.');});
 it('rejects formula cells without evaluating them',async()=>{const book=new ExcelJS.Workbook(),sheet=book.addWorksheet('Staff');sheet.addRow(HEADERS);sheet.addRow([{formula:'1+1'},'a@example.com','03001234567','08:00','16:00',TEST_PASSWORD]);const rows=await parseStaffFile(Buffer.from(await book.xlsx.writeBuffer()),'staff.xlsx');expect(rows[0]!.errors).toContain('Unsupported formula, link or cell content.');});
 it('validates 500 rows and refuses 501',async()=>{const lines=Array.from({length:500},(_,i)=>`Worker ${i},worker${i}@example.com,03001234567,08:00,16:00`).join('\n');expect(await parseStaffFile(csv(lines),'staff.csv')).toHaveLength(500);await expect(parseStaffFile(csv(lines+'\nWorker501,a@example.com,03001234567,08:00,16:00'),'staff.csv')).rejects.toMatchObject({statusCode:400});});
});
describe('preview and confirmation security',()=>{
 it('previews without provisioning and marks existing emails',async()=>{m.staff.mockResolvedValue([{email:'ahmed@example.com'}]);const result=await previewStaffImport(actor,3,csv(),'staff.csv');expect(result.valid).toBe(0);expect(m.create).not.toHaveBeenCalled();expect(m.capacity).not.toHaveBeenCalled();});
 it('rejects staff role',async()=>{await expect(previewStaffImport({...actor,role:'STAFF'},3,csv(),'staff.csv')).rejects.toThrow('Denied');});
 it('propagates cross-tenant/site denial before parsing',async()=>{m.authorize.mockRejectedValue(Error('Site denied'));await expect(previewStaffImport(actor,3,csv(),'staff.csv')).rejects.toThrow('Site denied');expect(m.staff).not.toHaveBeenCalled();});
 it('rejects inactive location',async()=>{m.authorize.mockResolvedValue({isActive:false});await expect(previewStaffImport(actor,3,csv(),'staff.csv')).rejects.toMatchObject({statusCode:403});});
 it('refuses over-capacity preview',async()=>{m.count.mockResolvedValue(200);await expect(previewStaffImport(actor,3,csv(),'staff.csv')).rejects.toMatchObject({statusCode:403});});
 it('binds confirmation to file and actor',async()=>{const preview=await previewStaffImport(actor,3,csv(),'staff.csv');await expect(confirmStaffImport(actor,3,csv('Ali,ali@example.com,03001234567,08:00,16:00'),'staff.csv',preview.token)).rejects.toMatchObject({statusCode:400});await expect(confirmStaffImport({...actor,id:2},3,csv(),'staff.csv',preview.token)).rejects.toMatchObject({statusCode:400});expect(m.create).not.toHaveBeenCalled();});
 it('reconciles duplicate confirmation without creating accounts',async()=>{const preview=await previewStaffImport(actor,3,csv(),'staff.csv');m.audit.mockResolvedValue({newValue:{count:1,staffIds:[9]}});expect(await confirmStaffImport(actor,3,csv(),'staff.csv',preview.token)).toEqual({count:1,staffIds:[9]});expect(m.capacity).not.toHaveBeenCalled();});
 it('creates within capacity transaction with the supplied login password and site-local overnight clocks',async()=>{const preview=await previewStaffImport(actor,3,csv(),'staff.csv');const tx={$queryRaw:vi.fn(),staff:{findMany:m.staff,count:m.count},auditLog:{findFirst:m.audit}};m.capacity.mockImplementation(async(_a,_r,run)=>run(tx));m.create.mockResolvedValue({id:9});expect(await confirmStaffImport(actor,3,csv(),'staff.csv',preview.token)).toMatchObject({count:1,staffIds:[9],locationId:3});const input=m.create.mock.calls[0]![2];expect(input.shiftStart.toISOString()).toBe('1970-01-01T17:00:00.000Z');expect(input.shiftEnd.toISOString()).toBe('1970-01-01T01:00:00.000Z');expect(input.password===TEST_PASSWORD).toBe(true);expect(m.create.mock.calls[0]![3]).toBe(false);});
});

describe('manager-provided passwords',()=>{
 it.each(['','short','      ','ü'.repeat(37)])('rejects an invalid password without echoing it',async password=>{
  const bytes=Buffer.from(HEADERS.join(',')+'\nWorker,worker@example.com,03001234567,08:00,16:00,'+password);
  const [row]=await parseStaffFile(bytes,'staff.csv');expect(row!.errors).toContain('Enter a password with at least 6 characters and at most 72 UTF-8 bytes.');
 });
 it('preserves password whitespace and punctuation exactly',async()=>{
  const password='  @Keep my spaces!  ';
  const [row]=await parseStaffFile(Buffer.from(HEADERS.join(',')+'\nWorker,worker@example.com,03001234567,08:00,16:00,'+password),'staff.csv');
  expect(row!.password===password).toBe(true);expect(row!.errors).toEqual([]);
 });
 it('does not expose the supplied password in preview or signed claims',async()=>{
  const result=await previewStaffImport(actor,3,csv(),'staff.csv');expect(result.valid).toBe(1);
  expect('password' in result.rows[0]!).toBe(false);expect(JSON.stringify(result).includes(TEST_PASSWORD)).toBe(false);
  const claims=JSON.parse(Buffer.from(result.token.split('.')[1]!,'base64url').toString());
  expect(JSON.stringify(claims).includes(TEST_PASSWORD)).toBe(false);
 });
 it('rejects the previous five-column template',async()=>{
  await expect(parseStaffFile(Buffer.from('Full Name,Email,Phone,Shift Start,Shift End\nWorker,worker@example.com,03001234567,08:00,16:00'),'staff.csv')).rejects.toMatchObject({statusCode:400});
 });
});
