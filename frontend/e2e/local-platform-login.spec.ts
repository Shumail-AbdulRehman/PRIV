import {test,expect,backend,fixture,login,sql} from './fixtures';
import {readFileSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
test.use({trace:'off',screenshot:'off',video:'off'});
test('local platform email/password grants metadata access only and logout revokes it',async({browser})=>{
 test.skip(process.env.HYGENE_E2E_LOCAL_PLATFORM!=='true','Explicit isolated local-platform mode is required');
 test.setTimeout(60000);
 const owner: {email:string;password:string}=JSON.parse(readFileSync(process.env.HYGENE_E2E_PLATFORM_OWNER_FILE!,'utf8'));
 // Inactive synthetic records must not inflate active counts. Only this runner's disposable DB is used.
 await sql(`INSERT INTO "Manager" (name,email,password,role,"isActive","companyId","updatedAt")
  SELECT 'Inactive platform count fixture','inactive-manager-count@example.invalid',password,'MANAGER',false,"companyId",NOW() FROM "Manager" WHERE id=$1`,[fixture.users.ownerA.id]);
 await sql(`INSERT INTO "Staff" (name,email,password,"isActive","companyId","updatedAt")
  SELECT 'Inactive platform count fixture','inactive-staff-count@example.invalid',password,false,"companyId",NOW() FROM "Staff" WHERE id=$1`,[fixture.staff.transfer.id]);
 await sql(`INSERT INTO "Location" (name,address,latitude,longitude,"isActive","companyId","updatedAt")
  VALUES ('Inactive platform count fixture','Synthetic','31','74',false,$1,NOW())`,[fixture.company.A]);
 const out=join(fileURLToPath(new URL('../../',import.meta.url)),'docs/implementation/local-platform-evidence');await mkdir(out,{recursive:true});
 const context=await browser.newContext(),page=await context.newPage();
 await page.goto('/platform/login');await expect(page.getByLabel('Platform email')).toBeVisible();
 await page.getByLabel('Platform email').fill(owner.email);await page.getByLabel('Password',{exact:true}).fill(owner.password+'wrong');
 await page.getByRole('button',{name:'Sign in to platform',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Sign-in failed');
 await expect(page.getByLabel('Password',{exact:true})).toHaveValue('');
 await page.getByLabel('Password',{exact:true}).fill(owner.password);await page.getByRole('button',{name:'Sign in to platform',exact:true}).click();
 await expect(page).toHaveURL(/\/platform\/companies$/);await expect(page.getByRole('heading',{name:'Customer companies',exact:true})).toBeVisible();
 await expect(page.getByText('E2E company A',{exact:true}).filter({visible:true})).toBeVisible();
 const companies=await page.request.get(backend+'/api/platform/companies');expect(companies.status()).toBe(200);
 const metadata=await companies.json();expect(JSON.stringify(metadata).includes(owner.password)).toBe(false);expect(metadata.data.items.every((item:Record<string,unknown>)=>!('staff' in item)&&!('password' in item))).toBe(true);
 // Compare the real operator API with independent database aggregates across tenants.
 for(const item of metadata.data.items){
  const [expected]=await sql(`SELECT
   (SELECT COUNT(*)::int FROM "Manager" WHERE "companyId"=$1 AND "isActive" AND role='MANAGER') AS managers,
   (SELECT COUNT(*)::int FROM "Staff" WHERE "companyId"=$1 AND "isActive") AS staff,
   (SELECT COUNT(*)::int FROM "Location" WHERE "companyId"=$1 AND "isActive") AS locations`,[item.id]);
  expect(item.counts).toEqual(expected);
 }
 const company=metadata.data.items.find((item:{id:number})=>item.id===fixture.company.A);
 expect(company.counts.managers).toBeGreaterThan(0);expect(company.counts.staff).toBeGreaterThan(0);
 for(const path of ['/platform/inquiries','/platform/service','/platform/audit?companyId='+fixture.company.A]){
  await page.goto(path);await expect(page).toHaveURL(/\/platform\/companies$/);
 }
 for(const label of ['Inquiries','Service diagnostics','Administrative audit'])await expect(page.getByRole('link',{name:label,exact:true})).toHaveCount(0);
 await page.goto('/platform/companies/'+fixture.company.A);
 const overview=page.getByRole('region',{name:'Company overview'});await expect(overview).toBeVisible();
 for(const [key,label] of [['managers','Managers'],['staff','Staff'],['locations','Locations']]){
  await expect(overview.locator('dl>div').filter({has:page.getByText(label,{exact:true})}).locator('dd')).toHaveText(String(company.counts[key]));
 }
 await page.goto('/platform/companies');
 expect((await page.request.get(backend+'/api/staff/')).status()).toBe(401);
 await page.screenshot({path:join(out,'companies-1280-en.png'),animations:'disabled',fullPage:true});
 await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
 await page.screenshot({path:join(out,'companies-390-en.png'),animations:'disabled',fullPage:true});
 await page.goto('/platform/security');await page.getByRole('button',{name:'Sign out of platform',exact:true}).click();
 await expect(page.getByLabel('Platform email')).toBeVisible();expect((await page.request.get(backend+'/api/platform/companies')).status()).toBe(401);
 const tenant=await browser.newContext();await login(tenant.request,'ownerA');expect((await tenant.request.get(backend+'/api/platform/companies')).status()).toBe(401);
 const wrong=await tenant.request.post(backend+'/api/platform/session/login',{headers:{Origin:new URL(page.url()).origin},data:{email:fixture.users.ownerA.email,password:fixture.password}});expect(wrong.status()).toBe(401);
 await tenant.close();await context.close();
});
