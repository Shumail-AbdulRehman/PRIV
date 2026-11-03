import {test,expect,enter,fixture,sql,backend,login} from './fixtures';
import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const require=createRequire(new URL('../../backend/package.json',import.meta.url));
const ExcelJS=require('exceljs');
const out=join(fileURLToPath(new URL('../../',import.meta.url)),'docs/implementation/v5-import-evidence');
test.use({trace:'off',screenshot:'off',video:'off'});
const header='Full Name,Email,Phone,Shift Start,Shift End,Password\n';
function upload(text:string) {return {file:{name:'staff.csv',mimeType:'text/csv',buffer:Buffer.from(header+text.split('\n').map(row=>row+','+fixture.password).join('\n'))}};}
test('location import uses real XLSX/CSV and persisted secure onboarding in English Urdu desktop phone',async({browser})=>{
 test.setTimeout(120000);await mkdir(out,{recursive:true});
 const original=await sql('SELECT id FROM "Staff" WHERE "companyId"=$1 AND "isActive"=true',[fixture.company.A]);
 await sql('UPDATE "Staff" SET "isActive"=false WHERE "companyId"=$1',[fixture.company.A]);
 try {
  for(const width of [1366,390])for(const lang of ['en','ur']) {
   const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
   const email=`import-${width}-${lang}@example.invalid`,ur=lang==='ur';
   await enter(page,`/locations/${fixture.site.A}?tab=staff`,'ownerA',lang);
   await page.getByRole('button',{name:ur?'عملہ درآمد کریں':'Import Staff',exact:true}).click();
   const dialog=page.getByRole('dialog');await expect(dialog).toContainText('E2E site A');
   const download=page.waitForEvent('download');await page.getByRole('button',{name:ur?'ایکسل سانچہ ڈاؤن لوڈ کریں':'Download Excel Template'}).click();expect((await download).suggestedFilename()).toBe('staff-template.xlsx');
   const template=await page.request.get(`${backend}/api/location/${fixture.site.A}/staff-import/template`);expect(template.status()).toBe(200);
   let buffer=Buffer.from(header+`Imported Worker,${email},03001234567,22:00,06:00,${fixture.password}`),name='staff.csv';
   if(lang==='en') {const book=new ExcelJS.Workbook();await book.xlsx.load(await template.body());book.worksheets[0].addRow(['Imported Worker',email,'03001234567','22:00','06:00',fixture.password]);buffer=Buffer.from(await book.xlsx.writeBuffer());name='staff.xlsx';}
   await dialog.locator('input[type=file]').setInputFiles({name,mimeType:lang==='en'?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'text/csv',buffer});
   await expect(dialog.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();
   expect((await dialog.innerText()).includes(fixture.password)).toBe(false);
   expect((await sql('SELECT id FROM "Staff" WHERE email=$1',[email])).length).toBe(0);
   await page.screenshot({path:join(out,`preview-${width}-${lang}.png`),animations:'disabled'});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
   const completed=page.waitForResponse(response=>response.url().endsWith('/staff-import/confirm'));
   await dialog.getByRole('button',{name:ur?'درآمد کی تصدیق':'Confirm Import'}).click();
   expect(JSON.stringify(await (await completed).json()).includes(fixture.password)).toBe(false);
   await expect(dialog.getByText(ur?/ملازمین درآمد ہوئے:/ : /employees imported into/)).toBeVisible();
   const staff=(await sql('SELECT id,"companyId","locationId","shiftStart","shiftEnd","mustChangePassword",password FROM "Staff" WHERE email=$1',[email]))[0];
   expect(staff.companyId).toBe(fixture.company.A);expect(staff.locationId).toBe(fixture.site.A);expect(staff.mustChangePassword).toBe(false);expect(staff.password).toMatch(/^\$2[aby]\$/);expect(new Date(staff.shiftStart).toISOString()).toBe('1970-01-01T17:00:00.000Z');expect(new Date(staff.shiftEnd).toISOString()).toBe('1970-01-01T01:00:00.000Z');
   expect((await page.request.get(`${backend}/api/staff/location/${fixture.site.A}`)).status()).toBe(200);
   await page.screenshot({path:join(out,`success-${width}-${lang}.png`),animations:'disabled'});
   // Credentials never appear in preview, receipt or screenshots; no handoff is needed.
   const audit=(await sql('SELECT "newValue" FROM "AuditLog" WHERE action=$1 AND "entityId"=$2 ORDER BY id DESC LIMIT 1',['STAFF_IMPORT_COMMITTED',fixture.site.A]))[0];
   expect(JSON.stringify(audit).includes(fixture.password)).toBe(false);
   const staffContext=await browser.newContext();expect((await staffContext.request.post(`${backend}/api/staff/staff-login`,{data:{email,password:fixture.password+'wrong'}})).status()).toBe(401);const signedIn=await staffContext.request.post(`${backend}/api/staff/staff-login`,{data:{email,password:fixture.password}});expect(signedIn.status()).toBe(200);expect((await staffContext.request.get(`${backend}/api/staff/profile/me`)).status()).toBe(200);await staffContext.close();
   await dialog.getByRole('button',{name:ur?'مکمل':'Done',exact:true}).click();
   await page.goto('/staff');await expect(page.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();
   await sql('UPDATE "Staff" SET "isActive"=false WHERE id=$1',[staff.id]);await context.close();
  }
 }finally{await sql('UPDATE "Staff" SET "isActive"=true WHERE id=ANY($1::int[])',[original.map((row:{id:number})=>row.id)]);}
});
test('import denies unauthorized actors, serializes confirmation and rolls back a failed batch',async({page})=>{
 test.setTimeout(60000);
 const original=await sql('SELECT id FROM "Staff" WHERE "companyId"=$1 AND "isActive"=true',[fixture.company.A]);
 await sql('UPDATE "Staff" SET "isActive"=false WHERE "companyId"=$1',[fixture.company.A]);
 const url=`${backend}/api/location/${fixture.site.A}/staff-import`;
 try {
  await login(page.request,'managerB');expect((await page.request.post(url+'/preview',{multipart:upload('Denied,denied@example.invalid,03001234567,08:00,16:00')})).status()).toBe(403);
  await login(page.request,'foreign');expect((await page.request.post(url+'/preview',{multipart:upload('Denied,denied@example.invalid,03001234567,08:00,16:00')})).status()).toBe(403);
  await login(page.request,'ownerB');expect((await page.request.post(url+'/preview',{multipart:upload('Denied,denied@example.invalid,03001234567,08:00,16:00')})).status()).toBe(404);
  await login(page.request,'managerA');
  const content=upload('Concurrent,concurrent@example.invalid,03001234567,08:00,16:00');const preview=await page.request.post(url+'/preview',{multipart:content});expect(preview.status()).toBe(200);const token=(await preview.json()).data.token;
  const results=await Promise.all([1,2].map(()=>page.request.post(url+'/confirm',{multipart:{...content,token}})));expect(results.map(r=>r.status())).toEqual([200,200]);
  expect((await sql('SELECT id FROM "Staff" WHERE email=$1',['concurrent@example.invalid'])).length).toBe(1);
  await sql('UPDATE "Staff" SET "isActive"=false WHERE email=$1',['concurrent@example.invalid']);
  const individual=await page.request.post(`${backend}/api/staff/create-staff`,{data:{name:'Individual Worker',email:'individual@example.invalid',phone:'03001234567',password:fixture.password,locationId:fixture.site.A}});expect(individual.status()).toBe(201);expect((await individual.json()).data.password).toBeUndefined();
  const staleFile=upload('Stale,stale@example.invalid,03001234567,08:00,16:00');const stale=await page.request.post(url+'/preview',{multipart:staleFile});expect(stale.status()).toBe(200);
  await sql('DELETE FROM "ManagerLocation" WHERE "managerId"=$1 AND "locationId"=$2',[fixture.users.managerA.id,fixture.site.A]);
  try {expect((await page.request.post(url+'/confirm',{multipart:{...staleFile,token:(await stale.json()).data.token}})).status()).toBe(403);}
  finally {await sql('INSERT INTO "ManagerLocation" ("managerId","locationId") VALUES ($1,$2)',[fixture.users.managerA.id,fixture.site.A]);}
  await sql(`CREATE FUNCTION import_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.email='rollback2@example.invalid' THEN RAISE EXCEPTION 'synthetic import failure'; END IF; RETURN NEW; END $$`);
  await sql('CREATE TRIGGER import_test_failure BEFORE INSERT ON "Staff" FOR EACH ROW EXECUTE FUNCTION import_test_failure()');
  const batch=upload('Rollback One,rollback1@example.invalid,03001234567,08:00,16:00\nRollback Two,rollback2@example.invalid,03011234567,09:00,17:00');const check=await page.request.post(url+'/preview',{multipart:batch});expect(check.status()).toBe(200);
  expect((await page.request.post(url+'/confirm',{multipart:{...batch,token:(await check.json()).data.token}})).status()).toBeGreaterThanOrEqual(400);
  expect((await sql('SELECT id FROM "Staff" WHERE email LIKE $1',['rollback%@example.invalid'])).length).toBe(0);
 }finally{await sql('DROP TRIGGER IF EXISTS import_test_failure ON "Staff"');await sql('DROP FUNCTION IF EXISTS import_test_failure()');await sql('UPDATE "Staff" SET "isActive"=true WHERE id=ANY($1::int[])',[original.map((row:{id:number})=>row.id)]);}
});

test('200 employee batch fits existing Enterprise capacity and 500 row preview refuses excess capacity',async({page})=>{
 test.setTimeout(90000);
 const original=await sql('SELECT id FROM "Staff" WHERE "companyId"=$1 AND "isActive"=true',[fixture.company.A]);
 await sql('UPDATE "Staff" SET "isActive"=false WHERE "companyId"=$1',[fixture.company.A]);
 await sql('UPDATE "Company" SET plan=\'ADVANCED\' WHERE id=$1',[fixture.company.A]);
 await sql('UPDATE "PaddleSubscription" SET "priceId"=$2 WHERE "companyId"=$1',[fixture.company.A,'pri_00000000000000000000000003']);
 try {
  await login(page.request);const url=`${backend}/api/location/${fixture.site.A}/staff-import`;
  const rows=(count:number)=>Array.from({length:count},(_,i)=>`Batch Worker ${i},batch${i}@example.invalid,03001234567,22:00,06:00`).join('\n');
  expect((await page.request.post(url+'/preview',{multipart:upload(rows(500))})).status()).toBe(403);
  const file=upload(rows(200));const preview=await page.request.post(url+'/preview',{multipart:file});expect(preview.status()).toBe(200);const token=(await preview.json()).data.token;
  const started=Date.now();const result=await page.request.post(url+'/confirm',{multipart:{...file,token},timeout:60000});expect(result.status()).toBe(200);expect((await result.json()).data.count).toBe(200);
  expect((await sql('SELECT count(*)::int AS count FROM "Staff" WHERE "companyId"=$1 AND email LIKE $2',[fixture.company.A,'batch%@example.invalid']))[0].count).toBe(200);
  console.log(`Synthetic local 200-row committed import: ${Date.now()-started} ms`);
 }finally{
  await sql('UPDATE "Staff" SET "isActive"=false WHERE "companyId"=$1',[fixture.company.A]);
  await sql('UPDATE "Staff" SET "isActive"=true WHERE id=ANY($1::int[])',[original.map((row:{id:number})=>row.id)]);
  await sql('UPDATE "Company" SET plan=\'STARTER\' WHERE id=$1',[fixture.company.A]);
  await sql('UPDATE "PaddleSubscription" SET "priceId"=$2 WHERE "companyId"=$1',[fixture.company.A,'pri_00000000000000000000000001']);
 }
});

test('invalid spreadsheet password blocks the whole batch without exposing credentials',async({page})=>{
 const original=await sql('SELECT id FROM "Staff" WHERE "companyId"=$1 AND "isActive"=true',[fixture.company.A]);
 await sql('UPDATE "Staff" SET "isActive"=false WHERE "companyId"=$1',[fixture.company.A]);
 try {
  await login(page.request);
  const url=`${backend}/api/location/${fixture.site.A}/staff-import`;
  const file={name:'invalid-password.csv',mimeType:'text/csv',buffer:Buffer.from(header+`Valid Worker,password-check1@example.invalid,03001234567,08:00,16:00,${fixture.password}\nInvalid Worker,password-check2@example.invalid,03011234567,22:00,06:00,short`)};
  const preview=await page.request.post(url+'/preview',{multipart:{file}});expect(preview.status()).toBe(200);
  const data=(await preview.json()).data;expect(data.total).toBe(2);expect(data.valid).toBe(1);expect(JSON.stringify(data).includes(fixture.password)).toBe(false);expect('password' in data.rows[0]).toBe(false);
  expect((await page.request.post(url+'/confirm',{multipart:{file,token:data.token}})).status()).toBe(400);
  expect((await sql('SELECT id FROM "Staff" WHERE email LIKE $1',['password-check%@example.invalid'])).length).toBe(0);
 }finally{await sql('UPDATE "Staff" SET "isActive"=true WHERE id=ANY($1::int[])',[original.map((row:{id:number})=>row.id)]);}
});
