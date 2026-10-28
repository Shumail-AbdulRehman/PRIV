import {test,expect,enter,fixture,sql,backend} from './fixtures';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=join(root,'docs/implementation/v5-setup-evidence');
test.use({trace:'off',screenshot:'off',video:'off'});
test('setup actual saved readiness and V5 paired English Urdu desktop phone',async({browser})=>{
 test.setTimeout(120000);await mkdir(out,{recursive:true});const results=[];
 for(const width of [1366,390])for(const lang of ['en','ur']){
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await enter(page,'/setup','ownerA',lang);await expect(page.getByLabel(lang==='ur'?'اس مقام کا سیٹ اپ':'Setup for location')).toContainText('E2E site A');await expect(page.getByRole('progressbar')).toHaveAttribute('value','2');await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:join(out,`app-setup-${width}-${lang}.png`),fullPage:true});
  const reference=await context.newPage();await reference.goto('file://'+join(root,'design/v5/setup.html')+`?lang=${lang}`);await reference.evaluate(()=>document.fonts.ready);await reference.screenshot({path:join(out,`v5-setup-${width}-${lang}.png`),fullPage:true});await reference.close();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);expect(errors).toEqual([]);results.push({width,lang,errors,source:'actual React/API/disposable SQL; V5 untouched',state:'saved site and active area; unconfigured shift/schedule'});await context.close();
 }
 await writeFile(join(out,'render-results.json'),JSON.stringify(results,null,2));
});
test('setup derives real shift persistence and exact linked forms; managers see only assigned sites',async({page})=>{
 await mkdir(out,{recursive:true});await enter(page,'/setup');await expect(page.getByRole('progressbar')).toHaveAttribute('value','2');
 const previous=await sql('SELECT "shiftStart","shiftEnd" FROM "Staff" WHERE id=$1',[fixture.staff.transfer.id]);
 try{
  await sql('UPDATE "Staff" SET "shiftStart"=$2,"shiftEnd"=$3 WHERE id=$1',[fixture.staff.transfer.id,'2000-01-01T03:00:00Z','2000-01-01T11:00:00Z']);await page.reload();await expect(page.getByRole('progressbar')).toHaveAttribute('value','3');
  await expect(page.getByRole('link',{name:'Open team and shifts',exact:true})).toHaveAttribute('href',`/staff?locationId=${fixture.site.A}`);
  await expect(page.getByRole('link',{name:'Add cleaning schedule',exact:true})).toHaveAttribute('href',`/locations/${fixture.site.A}?tab=templates&newSchedule=1`);await page.getByRole('link',{name:'Review area templates',exact:true}).click();await expect(page).toHaveURL(/tab=areas/);await page.goto(`/locations/${fixture.site.A}?tab=areas&newArea=1`);await expect(page.getByRole('dialog')).toBeVisible();
 }finally{await sql('UPDATE "Staff" SET "shiftStart"=$2,"shiftEnd"=$3 WHERE id=$1',[fixture.staff.transfer.id,previous[0].shiftStart,previous[0].shiftEnd]);}
 await enter(page,'/setup','managerA');await expect(page.getByLabel('Setup for location')).toContainText('E2E site A');expect(await page.getByLabel('Setup for location').locator('option').allTextContents()).toEqual(['E2E site A']);expect(await page.getByRole('link',{name:'Plan & billing',exact:true}).count()).toBe(0);
 expect((await page.request.get(backend+'/api/location/readiness?locationId='+fixture.site.foreign)).status()).toBe(404);
 await page.screenshot({path:join(out,'app-setup-manager-1366-en.png'),fullPage:true});
});
test('setup loading network error retry and server read-only permission stay truthful',async({page})=>{
 await mkdir(out,{recursive:true});await page.setViewportSize({width:390,height:900});
 await page.route('**/api/location/readiness?*',async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue();});await enter(page,'/setup');await expect(page.getByText('Loading setup status…',{exact:true})).toBeVisible();await page.screenshot({path:join(out,'app-setup-loading-390-en.png'),fullPage:true});await expect(page.getByRole('progressbar')).toBeVisible();await page.unroute('**/api/location/readiness?*');
 await page.route('**/api/location/readiness?*',route=>route.abort('failed'));await page.reload();await expect(page.getByRole('heading',{name:'Setup status could not load'})).toBeVisible();expect(await page.getByRole('progressbar').count()).toBe(0);await page.screenshot({path:join(out,'app-setup-network-error-390-en.png'),fullPage:true});await page.unroute('**/api/location/readiness?*');await page.getByRole('button',{name:'Try again',exact:true}).first().click();await expect(page.getByRole('progressbar')).toBeVisible();
 const before=await sql('SELECT "billingSubscriptionId","billingCustomerId" FROM "Company" WHERE id=$1',[fixture.company.A]);
 try{
  await sql('UPDATE "Company" SET "billingSubscriptionId"=NULL,"billingCustomerId"=NULL WHERE id=$1',[fixture.company.A]);await page.reload();await expect(page.getByText('This workspace is read-only for new work. Review plan activation to add or change setup.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Add cleaning schedule',exact:true})).toBeDisabled();await page.screenshot({path:join(out,'app-setup-readonly-390-en.png'),fullPage:true});
 }finally{await sql('UPDATE "Company" SET "billingSubscriptionId"=$2,"billingCustomerId"=$3 WHERE id=$1',[fixture.company.A,before[0].billingSubscriptionId,before[0].billingCustomerId]);}
});
