import {test,expect,enter,fixture,backend} from './fixtures';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));const out=join(root,'docs/implementation/v5-dashboard-evidence');
test.use({trace:'off',screenshot:'off',video:'off'});
test('owner and manager actual scoped performance match V5 composition English Urdu desktop phone',async({browser})=>{
 test.setTimeout(120000);await mkdir(out,{recursive:true});const results=[];
 for(const who of ['ownerA','managerA'])for(const width of [1366,390])for(const lang of ['en','ur']){
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await enter(page,'/dashboard',who,lang);await expect(page.locator('.perf-main-grid')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  const response=await page.request.get(backend+'/api/manager/operations/performance');expect(response.status()).toBe(200);const real=(await response.json()).data;
  if(who==='ownerA'){await expect(page.locator('.perf-metrics')).toContainText(String(real.summary.reviews));await expect(page.locator('.perf-location-table tbody tr')).toHaveCount(real.sites.length);}else{expect(real.sites.map((site:{location:{id:number}})=>site.location.id)).toEqual([fixture.site.A]);await expect(page.locator('.perf-metrics')).toHaveCount(0);}
  await page.screenshot({path:join(out,`app-${who}-${width}-${lang}.png`)});await page.screenshot({path:join(out,`app-${who}-${width}-${lang}-full.png`),fullPage:true});
  const reference=await context.newPage();await reference.goto('file://'+join(root,`design/v5/${who==='ownerA'?'owner':'overview'}.html`)+`?lang=${lang}`);await reference.evaluate(()=>document.fonts.ready);await reference.screenshot({path:join(out,`v5-${who}-${width}-${lang}.png`)});await reference.screenshot({path:join(out,`v5-${who}-${width}-${lang}-full.png`),fullPage:true});await reference.close();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);expect(errors).toEqual([]);results.push({who,width,lang,errors,source:'actual API and persisted synthetic SQL'});await context.close();
 }
 await writeFile(join(out,'render-results.json'),JSON.stringify(results,null,2));
});
test('performance period scope daily disclosure search and authorization use actual APIs',async({page})=>{
 await mkdir(out,{recursive:true});await enter(page,'/dashboard');await expect(page.locator('.perf-location-table')).toBeVisible();
 await page.getByRole('button',{name:'Last 30 days',exact:true}).click();await expect(page).toHaveURL(/period=30/);await expect(page.locator('.perf-data-scroll tbody tr')).toHaveCount(30);await page.getByText('View daily figures',{exact:true}).click();await expect(page.locator('.perf-data-scroll')).toBeVisible();
 await expect(page.getByLabel('Date',{exact:true})).not.toHaveValue('');await page.getByRole('textbox',{name:'Find a location',exact:true}).fill('not-a-site');await expect(page.getByText('No matching locations.',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Clear search',exact:true}).click();await expect(page.locator('.perf-location-table tbody tr')).toHaveCount(2);
 await page.getByLabel('Location',{exact:true}).selectOption(String(fixture.site.A));await expect(page.locator('.perf-location-table tbody tr')).toHaveCount(1);await page.screenshot({path:join(out,'app-owner-scoped-period-1366-en.png'),fullPage:true});
 await enter(page,'/dashboard','managerA');expect((await page.request.get(backend+'/api/manager/operations/performance?locationId='+fixture.site.B)).status()).toBe(403);expect((await page.request.get(backend+'/api/manager/operations/performance?locationId='+fixture.site.foreign)).status()).toBe(403);
 await page.route('**/api/manager/operations/performance?*',route=>route.abort('failed'));await page.reload();await expect(page.getByRole('alert')).toBeVisible();await expect(page.locator('.perf-main-grid')).toHaveCount(0);await page.screenshot({path:join(out,'app-performance-network-error-1366-en.png'),fullPage:true});await page.unroute('**/api/manager/operations/performance?*');await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(page.locator('.perf-main-grid')).toBeVisible();
});

test('dashboard overdue and attendance follow-up actions keep backend-supported site/day filters',async({page})=>{
 await enter(page,`/dashboard?locationId=${fixture.site.A}&date=2026-10-20`);await expect(page.locator('.perf-main-grid')).toBeVisible();
 const overdue=page.waitForResponse(response=>response.url().includes('/manager/operations/tasks?')&&response.url().includes('status=overdue'));
 await page.getByRole('link',{name:/Overdue work/}).click();expect((await overdue).status()).toBe(200);await expect(page).toHaveURL(/status=overdue/);
 await page.goto(`/dashboard?locationId=${fixture.site.A}&date=2026-10-20`);await expect(page.locator('.perf-main-grid')).toBeVisible();
 const attendance=page.waitForResponse(response=>response.url().includes('/attendance/?')&&response.url().includes('from=2026-10-20')&&response.url().includes('locationId='+fixture.site.A));
 await page.getByRole('link',{name:/Attendance follow-up/}).click();expect((await attendance).status()).toBe(200);await expect(page.getByLabel('Location',{exact:true})).toHaveValue(String(fixture.site.A));await expect(page.getByLabel('From date',{exact:true})).toHaveValue('2026-10-20');
});
