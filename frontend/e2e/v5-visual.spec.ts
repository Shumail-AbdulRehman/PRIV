import { test, expect, fixture, enter } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
// Actual compiled React and API, migrated disposable SQL fixtures. No request interception.
// Screenshots contain only generated test identities; never run against the dev/restored DB.
const root = fileURLToPath(new URL('../../', import.meta.url));
const out = join(root,'docs/implementation/v5-evidence');
test.use({ trace:'off', screenshot:'off', video:'off' });
test('V5 route evidence at matching desktop/phone English/Urdu viewports', async ({ browser }) => {
  test.setTimeout(240000);
  await mkdir(out,{recursive:true});
  const routes = [
    ['today','manager','/today-status'],
    ['overview','owner','/dashboard'],
    ['setup','setup','/setup'],
    ['team','team','/staff'],
    ['workforce','workforce',`/staff/${fixture.staff.transfer.id}`],
    ['locations','location','/locations'],
    ['location','location',`/locations/${fixture.site.A}`],
    ['attendance','attendance','/attendance'],
    ['billing','billing','/subscription'],
    ['settings','settings','/settings'],
    ['security','settings','/account/security'],
    ['reviews','reviews','/exceptions'],
    ['review-detail','reviews',`/exceptions/${fixture.review.id}`],
    ['help','help','/help'],
    ['information','information','/service-information'],
  ];
  const results:unknown[]=[];
  for(const width of [1366,390]) for(const language of ['en','ur']) {
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage();
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await enter(page,'/today-status','ownerA',language);
    for(const [name,prototype,path] of routes) {
      await page.goto(path);
      await page.locator('main').first().waitFor();
      await page.waitForTimeout(500);
      // Settle pending queries/fonts before capturing; do not hide loading or error states.
      await page.evaluate(()=>document.fonts.ready);
      await page.screenshot({path:join(out,`app-${name}-${width}-${language}.png`),fullPage:true});
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
      results.push({name,path,prototype,width,language,overflow,errors:[...errors],url:new URL(page.url()).pathname});
      errors.length=0;
      const reference=await context.newPage();
      await reference.goto('file://'+join(root,`design/v5/${prototype}.html`)+`?lang=${language}`);
      await reference.screenshot({path:join(out,`v5-${name}-${width}-${language}.png`),fullPage:true});
      await reference.close();
    }
    await page.goto(`/today-status?taskId=${fixture.review.taskId}`);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('E2E review room',{exact:true})).toBeVisible();
    await page.screenshot({path:join(out,`app-today-drawer-${width}-${language}.png`),fullPage:true});
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await enter(page,'/today-status','managerA',language);
    await expect(page.getByRole('heading',{name:language==='en'?'Team attendance':'ٹیم کی حاضری'})).toBeVisible();
    await page.screenshot({path:join(out,`app-today-manager-${width}-${language}.png`),fullPage:true});
    if(width===390){
      await page.getByRole('button',{name:language==='en'?'Open navigation':'نیویگیشن کھولیں'}).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.screenshot({path:join(out,`app-today-menu-${width}-${language}.png`),fullPage:true});
    }
    await context.close();
  }
  await writeFile(join(out,'route-results.json'),JSON.stringify(results,null,2));
  const today=results.filter((r)=> (r as {name:string}).name==='today') as {overflow:boolean;errors:string[]}[];
  expect(today.every(r=>!r.overflow&&!r.errors.length)).toBe(true);
});
test('Today filters use API results and task drawer closes with Escape',async({page})=>{
  await enter(page,'/today-status');
  await expect(page.getByRole('heading',{name:'Today, at a glance'})).toBeVisible();
  await page.getByRole('group',{name:'Task status',exact:true}).getByRole('button',{name:'In progress',exact:true}).click();
  await expect(page).toHaveURL(/status=in-progress/);
  await page.getByRole('group',{name:'Task status',exact:true}).getByRole('button',{name:'All tasks',exact:true}).click();
  await page.goto(`/today-status?taskId=${fixture.review.taskId}`);
  await expect(page.getByRole('dialog')).toBeVisible();
  const box=await page.getByRole('dialog').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  expect(box!.x+box!.width).toBeLessThanOrEqual(page.viewportSize()!.width+1);
  expect(box!.height).toBeGreaterThan(600);
  await expect(page.getByRole('dialog').getByRole('heading',{name:'Task details'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).not.toHaveURL(/taskId=/);
});

test('Today real empty/denied reads and simulated network loading/error recovery are explicit',async({page})=>{
  await enter(page,'/today-status?q=nonexistent-synthetic-task');
  await expect(page.getByText('No tasks match these filters.')).toBeVisible();
  await page.screenshot({path:join(out,'app-today-empty-1366-en.png'),fullPage:true});
  await page.goto(`/today-status?locationId=${fixture.site.foreign}`);
  await expect(page.getByRole('alert').first()).toContainText('You do not have access');
  await page.screenshot({path:join(out,'app-today-denied-1366-en.png'),fullPage:true});
  await page.route('**/api/manager/operations/**',route=>route.fulfill({status:503,json:{success:false,message:'Synthetic network outage'}}));
  await page.goto('/today-status');
  await expect(page.getByRole('alert').first()).toContainText('Records could not load');
  await page.screenshot({path:join(out,'app-today-network-error-1366-en.png'),fullPage:true});
  await page.unroute('**/api/manager/operations/**');
  await page.getByRole('button',{name:'Retry',exact:true}).first().click();
  await expect(page.getByRole('heading',{name:'Team attendance'})).toBeVisible();
  await page.route('**/api/manager/operations/**',async(route)=>{await new Promise(resolve=>setTimeout(resolve,2000));await route.continue();});
  await page.goto('/today-status');
  await expect(page.locator('[aria-busy=true]').first()).toBeVisible();
  await page.screenshot({path:join(out,'app-today-network-loading-1366-en.png'),fullPage:true});
  await expect(page.getByRole('heading',{name:'Team attendance'})).toBeVisible();
});

test('V5 public and safe-disabled platform routes have paired evidence without bypassing authorization',async({browser})=>{
 test.setTimeout(180000);
 const routes=[['login','login','/login'],['signup','login','/signup'],['recovery','recovery','/recover-owner-account'],['reset','recovery','/reset-owner-password'],['verify','verify','/verify-owner-email'],['operator-login','operator-login','/platform/login'],['platform','platform','/platform/companies'],['customer','customer','/platform/companies/1'],['operator-security','operator-security','/platform/security'],['service','service','/platform/service'],['audit','audit','/platform/audit'],['leads','leads','/platform/inquiries']];
 for(const width of [1366,390])for(const language of ['en','ur']){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();await page.addInitScript(lang=>localStorage.setItem('hygene-ops.language',lang),language);
  for(const [name,prototype,path]of routes){
   await page.goto(path);await page.locator('main').first().waitFor();await page.waitForTimeout(300);await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:join(out,`app-${name}-${width}-${language}.png`),fullPage:true});
   const ref=await context.newPage();await ref.goto('file://'+join(root,`design/v5/${prototype}.html`)+`?lang=${language}`);await ref.screenshot({path:join(out,`v5-${name}-${width}-${language}.png`),fullPage:true});await ref.close();
  }
  await enter(page,'/dashboard','transfer',language);
  await expect(page.getByRole('heading',{name:language==='en'?'Use the Android app':'اینڈرائیڈ ایپ استعمال کریں'})).toBeVisible();
  await page.screenshot({path:join(out,`app-handoff-${width}-${language}.png`),fullPage:true});
  const ref=await context.newPage();await ref.goto('file://'+join(root,'design/v5/handoff.html')+`?lang=${language}`);await ref.screenshot({path:join(out,`v5-handoff-${width}-${language}.png`),fullPage:true});await context.close();
 }
});

test('Today manager workspace and edge drawer stay within desktop/phone bounds in English/Urdu',async({browser})=>{
 test.setTimeout(90000);
 for(const width of [1366,390])for(const language of ['en','ur']){
  const context=await browser.newContext({viewport:{width,height:900}}), page=await context.newPage();
  await enter(page,'/today-status','managerA',language);
  await expect(page.getByRole('heading',{name:language==='en'?'Team attendance':'ٹیم کی حاضری'})).toBeVisible();
  await page.screenshot({path:join(out,`app-today-manager-${width}-${language}.png`),fullPage:true});
  await page.goto(`/today-status?taskId=${fixture.review.taskId}`);
  await expect(page.getByRole('dialog').getByText('E2E review room',{exact:true})).toBeVisible();
  const box=await page.getByRole('dialog').boundingBox();expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);expect(box!.y).toBeGreaterThanOrEqual(-1);
  expect(box!.x+box!.width).toBeLessThanOrEqual(width+1);expect(box!.height).toBeGreaterThanOrEqual(899);
  await page.screenshot({path:join(out,`app-today-drawer-${width}-${language}.png`)});
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  if(width===390){
   await page.getByRole('button',{name:language==='en'?'Open navigation':'نیویگیشن کھولیں'}).click();
   await expect(page.getByRole('dialog')).toBeVisible();
   const menu=await page.getByRole('dialog').boundingBox();expect(menu).not.toBeNull();
   expect(menu!.x).toBeGreaterThanOrEqual(-1);expect(menu!.y).toBeGreaterThanOrEqual(-1);
   expect(menu!.x+menu!.width).toBeLessThanOrEqual(width+1);expect(menu!.height).toBeGreaterThanOrEqual(899);
   await page.screenshot({path:join(out,`app-today-menu-${width}-${language}.png`)});
  }
  await context.close();
 }
});
