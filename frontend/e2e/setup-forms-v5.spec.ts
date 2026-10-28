import {test,expect,enter,fixture,sql} from './fixtures';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));const out=join(root,'docs/implementation/v5-setup-forms-evidence');
test.use({trace:'off',screenshot:'off',video:'off'});
test('area and schedule actual forms persist exact site inventory worker and readiness in desktop phone English Urdu',async({browser})=>{
 test.setTimeout(180000);await mkdir(out,{recursive:true});const observations=[];
 const before=(await sql('SELECT "shiftStart","shiftEnd" FROM "Staff" WHERE id=$1',[fixture.staff.recovery.id]))[0];
 try{
  await sql('UPDATE "Staff" SET "shiftStart"=$2,"shiftEnd"=$3 WHERE id=$1',[fixture.staff.recovery.id,'2000-01-01T03:00:00Z','2000-01-01T11:00:00Z']);
  let caseIndex=0;for(const width of [1366,390])for(const lang of ['en','ur']){
   const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
   await enter(page,`/locations/${fixture.site.A}?tab=areas&newArea=1`,'ownerA',lang);await expect(page.getByRole('dialog')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:join(out,`app-area-${width}-${lang}.png`)});
   const areaName=`Saved V5 area ${width} ${lang}`;await page.getByRole('dialog').getByLabel(lang==='ur'?'علاقے کا نام':'Area name',{exact:true}).fill(areaName);
   const savedArea=page.waitForResponse(r=>r.url().endsWith(`/location/${fixture.site.A}/areas`)&&r.request().method()==='POST');await page.getByRole('button',{name:lang==='ur'?'علاقے کا سانچہ بنائیں':'Create area template',exact:true}).click();const areaResponse=await savedArea;expect(areaResponse.status()).toBe(201);const area=(await areaResponse.json()).data;
   await expect(page.getByRole('dialog').getByRole('status')).toHaveCount(0);await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
   expect((await sql('SELECT "locationId",status FROM "Area" WHERE id=$1',[area.id]))[0]).toEqual({locationId:fixture.site.A,status:'ACTIVE'});
   await page.goto(`/locations/${fixture.site.A}?tab=templates&newSchedule=1`);const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.locator('#schedule-area option').filter({hasText:areaName})).toHaveCount(1);
   const title=`Saved V5 task ${width} ${lang}`;await dialog.locator('#schedule-title').fill(title);await dialog.locator('#schedule-area').selectOption(String(area.id));await page.screenshot({path:join(out,`app-schedule-task-${width}-${lang}.png`)});
   const next=()=>page.getByRole('button',{name:lang==='ur'?'اگلا':'Next',exact:true});await next().click();await dialog.locator('#schedule-staff').selectOption(String(fixture.staff.recovery.id));await page.screenshot({path:join(out,`app-schedule-team-${width}-${lang}.png`)});await next().click();
   const date=new Date(Date.now()+(4+caseIndex++)*86400000).toISOString().slice(0,10);await dialog.locator('#schedule-repeat').selectOption('ONCE');await dialog.locator('#schedule-date').fill(date);await dialog.locator('#schedule-start').fill('09:00');await dialog.locator('#schedule-end').fill('10:00');await page.screenshot({path:join(out,`app-schedule-time-${width}-${lang}.png`)});await next().click();await page.screenshot({path:join(out,`app-schedule-review-${width}-${lang}.png`)});
   const savedSchedule=page.waitForResponse(r=>r.url().endsWith('/task-template')&&r.request().method()==='POST');await page.getByRole('button',{name:lang==='ur'?'شیڈول بنائیں':'Create schedule',exact:true}).click();const scheduleResponse=await savedSchedule;const body=await scheduleResponse.json();expect(scheduleResponse.status(),JSON.stringify(body)).toBe(201);await expect(dialog).toHaveCount(0);
   const saved=(await sql('SELECT title,"areaId","staffId","locationId","setupStatus","verificationVersion","inventorySelection" FROM "TaskTemplate" WHERE id=$1',[body.data.id]))[0];expect(saved).toEqual({title,areaId:area.id,staffId:fixture.staff.recovery.id,locationId:fixture.site.A,setupStatus:'READY',verificationVersion:2,inventorySelection:'ALL'});
   await page.goto('/setup');await expect(page.getByRole('progressbar')).toHaveAttribute('value','4');await page.reload();await expect(page.getByRole('progressbar')).toHaveAttribute('value','4');await page.screenshot({path:join(out,`app-setup-ready-${width}-${lang}.png`)});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);expect(errors).toEqual([]);
   const reference=await context.newPage();await reference.goto('file://'+join(root,'design/v5/setup.html')+`?lang=${lang}`);await reference.locator('[data-action="setup:area"]').click();await reference.evaluate(()=>document.fonts.ready);await reference.screenshot({path:join(out,`v5-area-${width}-${lang}.png`)});await reference.keyboard.press('Escape');await reference.locator('[data-action="setup:task"]').click();await reference.screenshot({path:join(out,`v5-schedule-${width}-${lang}.png`)});await reference.close();
   observations.push({width,lang,errors,source:'actual area/create schedule APIs, persisted SQL and setup reload; untouched V5 reference',areaId:area.id,templateId:body.data.id});await context.close();
  }
 }finally{await sql('UPDATE "Staff" SET "shiftStart"=$2,"shiftEnd"=$3 WHERE id=$1',[fixture.staff.recovery.id,before.shiftStart,before.shiftEnd]);}
 await writeFile(join(out,'render-results.json'),JSON.stringify(observations,null,2));
});
