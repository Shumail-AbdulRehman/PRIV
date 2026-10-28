import {test,expect,enter,fixture,sql,backend} from './fixtures';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=join(root,'docs/implementation/v5-locations-evidence');
test.use({trace:'off',screenshot:'off',video:'off'});
test('V5 locations register and detail tabs render actual API data desktop phone English Urdu',async({browser})=>{
 test.setTimeout(180000);await mkdir(out,{recursive:true});const results:unknown[]=[];
 for(const width of [1366,390])for(const lang of ['en','ur']){
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await enter(page,'/locations','ownerA',lang);await expect(page.locator('.location-register-v5')).toBeVisible();await expect(page.locator('.location-register-v5').getByText('E2E site A',{exact:true}).filter({visible:true})).toBeVisible();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:join(out,`app-register-${width}-${lang}.png`),fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
  for(const tab of ['overview','staff','templates','areas','instances','schedule']){
   await page.goto(`/locations/${fixture.site.A}?tab=${tab}`);await expect(page.locator('.location-detail-page h1')).toHaveText('E2E site A');
   if(tab==='overview'){await expect(page.locator('.location-metrics-v5')).toBeVisible();await expect(page.locator('.location-metrics-v5 > button > strong')).toHaveText('1');}
   else if(tab==='areas')await expect(page.locator('.location-detail-page .ops-section-heading')).toBeVisible();
   else if(tab==='schedule')await expect(page.locator('.location-week-v5')).toBeVisible();
   else if(tab==='templates')await expect(page.getByRole('button',{name:lang==='ur'?'صفائی کا شیڈول شامل کریں':'Add cleaning schedule',exact:true})).toBeVisible();
   else await expect(page.locator('.location-detail-page .ops-panel').first()).toBeVisible();
   await expect(page.locator('.location-detail-page .skeleton:visible')).toHaveCount(0);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:join(out,`app-${tab}-${width}-${lang}.png`),fullPage:true});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);expect(overflow).toBe(false);expect(errors).toEqual([]);results.push({tab,width,lang,overflow,errors:[...errors],route:page.url(),source:'actual React/API, migrated synthetic SQL'});
  }
  const reference=await context.newPage();await reference.goto('file://'+join(root,'design/v5/location.html')+`?lang=${lang}`);await reference.evaluate(()=>document.fonts.ready);
  for(const tab of ['overview','team','schedule','areas','history']){
   await reference.locator(`[data-location-tab="${tab}"]`).click();await reference.screenshot({path:join(out,`v5-${tab}-${width}-${lang}.png`),fullPage:true});
  }
  await reference.close();await context.close();
 }
 await writeFile(join(out,'render-results.json'),JSON.stringify(results,null,2));
});
test('location owner edit persists without replacing coordinates and manager cannot mutate or read other tenant',async({page})=>{
 test.setTimeout(60000);await mkdir(out,{recursive:true});await page.setViewportSize({width:1366,height:900});
 const before=(await sql('SELECT name,address,latitude,longitude,timezone,"radiusMeters" FROM "Location" WHERE id=$1',[fixture.site.A]))[0];
 try{
  await enter(page,`/locations/${fixture.site.A}`);await page.getByRole('button',{name:'Edit location',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.screenshot({path:join(out,'app-edit-1366-en.png'),fullPage:true});
  await page.getByLabel('Location name',{exact:true}).fill('V5 saved location');await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('status')).toContainText('Location updated.');await page.reload();await expect(page.locator('.location-detail-page h1')).toHaveText('V5 saved location');
  const after=(await sql('SELECT name,latitude,longitude,timezone,"radiusMeters" FROM "Location" WHERE id=$1',[fixture.site.A]))[0];expect(after).toEqual({name:'V5 saved location',latitude:before.latitude,longitude:before.longitude,timezone:before.timezone,radiusMeters:before.radiusMeters});
  await page.screenshot({path:join(out,'app-saved-1366-en.png'),fullPage:true});
  await enter(page,`/locations/${fixture.site.A}`,'managerA');await expect(page.locator('.location-detail-page h1')).toHaveText('V5 saved location');await expect(page.getByRole('button',{name:'Edit location',exact:true})).toHaveCount(0);
  expect((await page.request.patch(backend+`/api/location/${fixture.site.A}`,{data:{data:{name:'Forbidden manager edit'}}})).status()).toBe(403);
  expect((await page.request.get(backend+`/api/location/${fixture.site.B}/stats`)).status()).toBe(403);
  const foreign=await page.request.get(backend+`/api/location/${fixture.site.foreign}/stats`);expect([403,404]).toContain(foreign.status());
  await page.setViewportSize({width:390,height:900});await page.goto(`/locations/${fixture.site.B}`);await expect(page.locator('[role=alert]')).toBeVisible();await page.screenshot({path:join(out,'app-manager-denied-390-en.png'),fullPage:true});
 }finally{await sql('UPDATE "Location" SET name=$2 WHERE id=$1',[fixture.site.A,before.name]);}
});
test('location loading network failure recovery and empty assignment use honest states',async({browser})=>{
 test.setTimeout(60000);await mkdir(out,{recursive:true});
 for(const lang of ['en','ur']){
  const context=await browser.newContext({viewport:{width:390,height:900}});const page=await context.newPage();
  await page.route('**/api/location/',async route=>{await new Promise(resolve=>setTimeout(resolve,1000));await route.continue();});
  await enter(page,'/locations','ownerA',lang);await expect(page.locator('.location-v5')).toBeVisible();await page.screenshot({path:join(out,`app-loading-390-${lang}.png`),fullPage:true});await expect(page.locator('.location-register-v5')).toBeVisible();await page.unroute('**/api/location/');
  await page.route('**/api/location/*/stats*',route=>route.abort('failed'));await page.goto(`/locations/${fixture.site.A}`);await expect(page.locator('[role=alert]')).toBeVisible();await page.screenshot({path:join(out,`app-detail-network-error-390-${lang}.png`),fullPage:true});await page.unroute('**/api/location/*/stats*');await page.getByRole('button',{name:lang==='ur'?'دوبارہ کوشش کریں':'Retry',exact:true}).click();await expect(page.locator('.location-detail-page h1')).toHaveText('E2E site A');
  await page.goto('/locations?create=1');await expect(page.getByRole('dialog')).toBeVisible();await page.screenshot({path:join(out,`app-create-390-${lang}.png`),fullPage:true});await context.close();
 }
 const assignments=await sql('SELECT "managerId","locationId" FROM "ManagerLocation" WHERE "managerId"=$1',[fixture.users.managerB.id]);
 try{
  await sql('DELETE FROM "ManagerLocation" WHERE "managerId"=$1',[fixture.users.managerB.id]);const context=await browser.newContext({viewport:{width:390,height:900}});const page=await context.newPage();await enter(page,'/locations','managerB');await expect(page.getByText('No locations assigned to you yet. Contact your admin.')).toBeVisible();await page.screenshot({path:join(out,'app-manager-empty-390-en.png'),fullPage:true});await context.close();
 }finally{for(const assignment of assignments)await sql('INSERT INTO "ManagerLocation" ("managerId","locationId","createdAt") VALUES ($1,$2,NOW())',[assignment.managerId,assignment.locationId]);}
});
test('phone Urdu location creation saves real fields and readiness derives the saved incomplete setup',async({page})=>{
 test.setTimeout(60000);await mkdir(out,{recursive:true});await page.setViewportSize({width:390,height:900});
 await enter(page,'/locations?create=1','ownerA','ur');await expect(page.getByRole('dialog')).toBeVisible();
 await page.locator('#location-name').fill('V5 phone persisted site');await page.locator('#location-address').fill('Synthetic creation address');
 await page.locator('.location-coordinate-details > summary').click();
 await page.locator('#location-latitude').fill('31');await page.locator('#location-longitude').fill('74');await page.locator('#location-timezone').selectOption('Asia/Karachi');await page.locator('#location-radius').fill('250');
 await page.locator('#location-name').scrollIntoViewIfNeeded();await page.screenshot({path:join(out,'app-create-details-390-ur.png'),fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
 await page.locator('.location-editor button[type=submit]').click();
 await expect(page.locator('.location-field-error')).toContainText('آپ کے پلان میں مقامات کی گنجائش پوری ہو گئی ہے');
 await expect(page.locator('#location-name')).toHaveValue('V5 phone persisted site');await page.screenshot({path:join(out,'app-create-capacity-390-ur.png'),fullPage:true});
 // The seed intentionally exceeds Starter capacity. Free only synthetic current
 // site slots, then exercise the real retry; no account/provider rules change.
 const original=await sql('SELECT id,"isActive" FROM "Location" WHERE "companyId"=$1',[fixture.company.A]);
 try {
  await sql('UPDATE "Location" SET "isActive"=false WHERE "companyId"=$1',[fixture.company.A]);
  await page.locator('.location-editor button[type=submit]').click();await expect(page.getByRole('dialog')).toHaveCount(0);
 const saved=(await sql('SELECT id,name,address,timezone,"radiusMeters" FROM "Location" WHERE "companyId"=$1 AND name=$2',[fixture.company.A,'V5 phone persisted site']))[0];
 expect(saved).toMatchObject({name:'V5 phone persisted site',address:'Synthetic creation address',timezone:'Asia/Karachi',radiusMeters:250});
 const readiness=await page.request.get(backend+'/api/location/readiness');expect(readiness.status()).toBe(200);const body=await readiness.json();const site=body.data.sites.find((item:{id:number})=>item.id===saved.id);expect(site).toMatchObject({setupReady:false,counts:{staffWithShift:0,activeAreas:0,readySchedules:0}});
 await page.reload();await expect(page.locator('.location-register-v5').getByText('V5 phone persisted site',{exact:true}).filter({visible:true})).toBeVisible();await page.screenshot({path:join(out,'app-created-persisted-390-ur.png'),fullPage:true});
 }finally{for(const site of original)await sql('UPDATE "Location" SET "isActive"=$2 WHERE id=$1',[site.id,site.isActive]);}
});
test('persisted cleaning schedule editor uses saved fields and preserves a failed phone Urdu draft',async({browser})=>{
 test.setTimeout(120000);await mkdir(out,{recursive:true});
 const before=(await sql('SELECT "shiftStart","shiftEnd" FROM "Staff" WHERE id=$1',[fixture.staff.recovery.id]))[0];
 const prep=await browser.newContext();const initial=await prep.newPage();
 try{
  await enter(initial,`/locations/${fixture.site.A}?tab=templates`);
  await sql('UPDATE "Staff" SET "shiftStart"=$2,"shiftEnd"=$3 WHERE id=$1',[fixture.staff.recovery.id,'1970-01-01T00:00:00Z','1970-01-01T18:00:00Z']);
  const areaResponse=await initial.request.post(backend+`/api/location/${fixture.site.A}/areas`,{data:{name:'V5 schedule inventory',roomType:'WASHROOM',counts:[{fixtureType:'SINK',count:1}]}});expect(areaResponse.status()).toBe(201);const area=(await areaResponse.json()).data;
  const future=new Date(Date.now()+3*86400000).toISOString().slice(0,10);
  const created=await initial.request.post(backend+'/api/task-template',{data:{title:'V5 persisted schedule',locationId:fixture.site.A,areaId:area.id,inventorySelection:'ALL',selectedItems:[],expectedInventoryVersion:area.inventoryVersion,shiftStart:future+'T04:00:00Z',shiftEnd:future+'T05:00:00Z',recurringType:'ONCE',effectiveDate:future+'T00:00:00Z'}});const createdBody=await created.json();expect(created.status(),JSON.stringify(createdBody)).toBe(201);const id=createdBody.data.id;
  await prep.close();
  for(const width of [1366,390])for(const lang of ['en','ur']){
   const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();await enter(page,`/locations/${fixture.site.A}?tab=templates`,'ownerA',lang);
   await page.getByRole('button',{name:lang==='ur'?'شیڈول بدلیں':'Edit schedule',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:join(out,`app-edit-schedule-${width}-${lang}.png`),fullPage:true});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
   if(width===1366&&lang==='en'){
    await page.locator('#schedule-title').fill('V5 edited schedule');await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);expect((await sql('SELECT title FROM "TaskTemplate" WHERE id=$1',[id]))[0].title).toBe('V5 edited schedule');
   }
   if(width===390&&lang==='ur'){
    await page.locator('#schedule-title').fill('Preserved phone schedule draft');await page.route('**/api/task-template/'+id,route=>route.abort('failed'));await page.getByRole('button',{name:'تبدیلیاں محفوظ کریں',exact:true}).click();await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();await expect(page.locator('#schedule-title')).toHaveValue('Preserved phone schedule draft');await page.screenshot({path:join(out,'app-edit-schedule-network-error-390-ur.png'),fullPage:true});await page.unroute('**/api/task-template/'+id);
   }
   await context.close();
  }
 }finally{await prep.close();await sql('UPDATE "Staff" SET "shiftStart"=$2,"shiftEnd"=$3 WHERE id=$1',[fixture.staff.recovery.id,before.shiftStart,before.shiftEnd]);}
});
test('history Today sends the saved location calendar day to the real API',async({page})=>{
 await enter(page,`/locations/${fixture.site.A}?tab=instances`);await expect(page.locator('.location-detail-page h1')).toHaveText('E2E site A');
 const response=page.waitForResponse(value=>value.url().includes(`/api/location/${fixture.site.A}/stats?`)&&value.url().includes('dateFrom='));await page.getByRole('button',{name:'Today',exact:true}).click();const result=await response;expect(result.status()).toBe(200);const query=new URL(result.url()).searchParams;
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());expect(query.get('dateFrom')).toBe(date);expect(query.get('dateTo')).toBe(date);
 await page.screenshot({path:join(out,'app-history-local-today-1366-en.png'),fullPage:true});
});
