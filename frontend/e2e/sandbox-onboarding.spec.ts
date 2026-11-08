import {test,expect,fixture,sql,mockBilling,backend} from './fixtures';
import {randomUUID} from 'node:crypto';
test.use({trace:'off',screenshot:'off',video:'off'});
test('F01 F09 F13 F14 F25 F30 F31 real signup standalone plan card confirmation and explicit workspace entry',async({page})=>{
 const billing=await mockBilling(page);let chunks=0;
 await page.route(/\/assets\/SubscriptionPage-[^/]+\.js$/,route=>chunks++===0?route.fulfill({status:404,contentType:'text/plain',body:'Missing old module'}):route.continue());
 const email=`billing-${randomUUID()}@example.invalid`;await page.goto('/signup');
 await page.getByLabel('Full Name',{exact:true}).fill('Synthetic owner');await page.getByLabel('Company Name',{exact:true}).fill('Synthetic workspace');await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(fixture.password);await page.getByRole('button',{name:'Create account & choose plan'}).click();
 await expect(page.getByRole('heading',{name:'Choose your plan',exact:true})).toBeVisible();expect(chunks).toBeGreaterThanOrEqual(2);
 await expect(page.getByRole('navigation',{name:'Workspace navigation'})).toHaveCount(0);
 const [owner]=await sql('SELECT id,"companyId","emailVerifiedAt" FROM "Manager" WHERE email=$1',[email]);expect(owner.emailVerifiedAt).toBeNull();
 await page.getByRole('button',{name:'Yearly billing'}).click();await page.getByRole('radio',{name:/^Pro/}).check();await page.getByRole('button',{name:'Continue with selected plan'}).click();
 await expect(page).toHaveURL(/subscription\/payment\?plan=PRO&interval=year/);await expect(page.getByRole('heading',{name:'Review your plan'})).toBeVisible();await expect(page.getByText('US$640.00')).toBeVisible();await page.getByRole('button',{name:'Open secure checkout'}).click();await expect(page.getByRole('dialog',{name:'Paddle fixture'})).toBeVisible();expect(billing.controls.posts).toBe(1);
 await billing.emit('checkout.completed');await expect(page.getByRole('heading',{name:'Waiting for subscription confirmation'})).toBeVisible();await expect(page.getByRole('link',{name:'Open workspace'})).toHaveCount(0);
 billing.facts.workspaceAccessAllowed=true;billing.facts.onboardingRequired=false;
 await page.getByRole('button',{name:'Check subscription status',exact:true}).click();await page.getByRole('link',{name:'Open workspace'}).click();await expect(page).toHaveURL(/dashboard$/);expect(billing.controls.posts).toBe(1);
 await page.reload();await expect(page.getByRole('navigation',{name:'Workspace navigation'})).toBeVisible();await page.context().clearCookies();const signin=await page.request.post(backend+'/api/manager/manager-login',{data:{email,password:fixture.password}});expect(signin.status()).toBe(200);await page.goto('/dashboard');await expect(page.getByRole('navigation',{name:'Workspace navigation'})).toBeVisible();const[saved]=await sql('SELECT id,"companyId" FROM "Manager" WHERE email=$1',[email]);expect(saved).toEqual({id:owner.id,companyId:owner.companyId});await page.unrouteAll({behavior:'wait'});
});
