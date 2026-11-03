import {test,expect,enter,fixture} from './fixtures';
import {randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=join(root,'docs/implementation/v5-auth-evidence');
// Credential workflows never persist traces, videos or automatic failure captures.
// Explicit captures below have empty password fields and scrubbed fragment URLs.
test.use({trace:'off',screenshot:'off',video:'off'});
test('V5 customer auth pages render at matching desktop/phone English/Urdu sizes',async({browser})=>{
 test.setTimeout(180000);await mkdir(out,{recursive:true});const results:unknown[]=[];
 const routes=[['login','/login','login'],['signup','/signup','login'],['recovery','/recover-owner-account','recovery'],['reset-missing','/reset-owner-password','recovery'],['verify-missing','/verify-owner-email','verify']];
 for(const width of [1366,390])for(const lang of ['en','ur']){
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(value=>localStorage.setItem('hygene-ops.language',value),lang);
  for(const [name,path,prototype]of routes){
   await page.goto(path);await expect(page.locator('.v5-auth h1')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:join(out,`app-${name}-${width}-${lang}.png`),fullPage:true});
   const geometry=await page.evaluate(()=>{const brand=document.querySelector('.v5-auth-brand')!.getBoundingClientRect(),title=document.querySelector('.v5-auth h1')!.getBoundingClientRect();return {brandToTitle:title.y-brand.bottom};});
   expect(geometry.brandToTitle).toBeGreaterThanOrEqual(39);expect(geometry.brandToTitle).toBeLessThanOrEqual(41);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);results.push({name,path,prototype,width,lang,geometry,overflow,errors:[...errors]});expect(overflow).toBe(false);expect(errors).toEqual([]);errors.length=0;
   await expect(page.locator('.language-choice')).toHaveCount(1);await expect(page.locator('.auth-preview')).toHaveCount(0);
   const reference=await context.newPage();await reference.goto('file://'+join(root,`design/v5/${prototype}.html`)+`?lang=${lang}${name.endsWith('missing')?'&link=expired':''}`);await reference.evaluate(()=>document.fonts.ready);await reference.screenshot({path:join(out,`v5-${name}-${width}-${lang}.png`),fullPage:true});await reference.close();
  }
  // A shaped but never-issued synthetic link exercises the real form and real denial.
  // Its fragment is scrubbed before React/API reads; no token is written to artifacts.
  for(const kind of ['reset','verify']){
   const token=randomBytes(32).toString('base64url');
   const target=`/${kind==='reset'?'reset-owner-password':'verify-owner-email'}`;
   // Put the fragment in volatile browser memory before app import, keeping it out
   // of Playwright navigation call logs even if a navigation fails.
   await page.addInitScript(({target,token})=>{if(location.pathname===target)history.replaceState(history.state,'',target+'#token='+token);},{target,token});
   await page.goto(target);
   await expect(page.locator('.v5-auth h1')).toBeVisible();expect(new URL(page.url()).hash.length).toBe(0);
   await page.screenshot({path:join(out,`app-${kind}-form-${width}-${lang}.png`),fullPage:true});
   const reference=await context.newPage();await reference.goto('file://'+join(root,`design/v5/${kind==='reset'?'recovery':'verify'}.html`)+`?lang=${lang}`);
   if(kind==='reset'){await reference.locator('#recovery-form button[type=submit]').click();await reference.locator('[data-action=reset-form]').click();}
   await reference.screenshot({path:join(out,`v5-${kind}-form-${width}-${lang}.png`),fullPage:true});await reference.close();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);results.push({name:kind+'-form',width,lang,overflow,errors:[...errors]});expect(overflow).toBe(false);expect(errors).toEqual([]);
   if(kind==='verify'){
    const response=page.waitForResponse(r=>r.url().endsWith('/api/owner-identity/email/complete')&&r.request().method()==='POST');
    await page.locator('.v5-auth-panel button').click();expect((await response).status()).toBe(400);await expect(page.locator('.v5-auth-panel [role=alert]')).toBeVisible();
    await page.screenshot({path:join(out,`app-verify-invalid-${width}-${lang}.png`),fullPage:true});
   }
  }
  await enter(page,'/account/security','ownerA',lang);await expect(page.locator('input[name=currentPassword]')).toBeVisible();
  await page.screenshot({path:join(out,`app-security-${width}-${lang}.png`),fullPage:true});
  const reference=await context.newPage();await reference.goto('file://'+join(root,'design/v5/settings.html')+`?lang=${lang}&tab=security`);await reference.screenshot({path:join(out,`v5-security-${width}-${lang}.png`),fullPage:true});await reference.close();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);results.push({name:'security',width,lang,overflow,errors:[...errors]});expect(overflow).toBe(false);expect(errors).toEqual([]);
  await enter(page,'/dashboard','transfer',lang);await expect(page.locator('.v5-handoff-signout')).toBeVisible();
  await page.screenshot({path:join(out,`app-handoff-${width}-${lang}.png`),fullPage:true});
  const handoffRef=await context.newPage();await handoffRef.goto('file://'+join(root,'design/v5/handoff.html')+`?lang=${lang}`);await handoffRef.screenshot({path:join(out,`v5-handoff-${width}-${lang}.png`),fullPage:true});await handoffRef.close();
  const handoffOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);results.push({name:'handoff',width,lang,overflow:handoffOverflow,errors:[...errors]});expect(handoffOverflow).toBe(false);expect(errors).toEqual([]);
  await context.close();
 }
 await writeFile(join(out,'render-results.json'),JSON.stringify(results,null,2));
});
test('actual owner recovery explains unavailable delivery without claiming a sent message',async({page})=>{
 await mkdir(out,{recursive:true});await page.setViewportSize({width:1366,height:900});await page.goto('/recover-owner-account');
 await page.getByLabel('Owner email',{exact:true}).fill('synthetic-owner@example.invalid');
 const response=page.waitForResponse(r=>r.url().endsWith('/api/owner-identity/recovery/request')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Request recovery link',exact:true}).click();expect((await response).status()).toBe(503);
 await expect(page.getByRole('alert')).toContainText('Email recovery is unavailable.');
 await page.screenshot({path:join(out,'app-recovery-unavailable-1366-en.png'),fullPage:true});
});
test('real rejected sign-in remains on the form and permits a corrected retry',async({page})=>{
 await page.setViewportSize({width:1366,height:900});await page.goto('/login');await page.getByLabel('Email',{exact:true}).fill('no-account@example.invalid');await page.getByLabel('Password',{exact:true}).fill(randomBytes(20).toString('hex'));
 await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Email or password is incorrect.');await expect(page).toHaveURL(/login/);
 await page.getByLabel('Password',{exact:true}).clear();await page.screenshot({path:join(out,'app-login-denied-1366-en.png'),fullPage:true});
});

test('actual staff credential form reaches the app handoff and signs out',async({page})=>{
 await page.goto('/login');await page.getByLabel('Account type',{exact:true}).selectOption('Staff');await page.getByLabel('Email',{exact:true}).fill(fixture.staff.transfer.email);await page.getByLabel('Password',{exact:true}).fill(fixture.password);await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Your working day is in the app.'})).toBeVisible();await expect(page.getByRole('navigation',{name:'Workspace navigation'})).toHaveCount(0);await expect(page.getByText('Approved Android distribution is unavailable. Ask your company owner for the qualified app.')).toBeVisible();
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page).toHaveURL(/login/);
});
test('actual sign-in pending state blocks repeat submission while a delayed request finishes',async({page})=>{
 await mkdir(out,{recursive:true});await page.setViewportSize({width:1366,height:900});await page.route('**/api/manager/manager-login',async route=>{await new Promise(resolve=>setTimeout(resolve,1600));await route.continue();});
 await page.goto('/login');await page.getByLabel('Email',{exact:true}).fill(fixture.users.ownerA.email);await page.getByLabel('Password',{exact:true}).fill(fixture.password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('button',{name:'Signing in…',exact:true})).toBeDisabled();await expect(page.locator('form')).toHaveAttribute('aria-busy','true');
 // Redact credential fields in the capture itself; the normal pending form and
 // original request remain intact. No credential pixels enter the saved image.
 const maskColor=await page.locator('.v5-auth-page').evaluate(el=>getComputedStyle(el).getPropertyValue('--muted').trim());
 await page.screenshot({path:join(out,'app-login-pending-1366-en.png'),fullPage:true,mask:[page.getByLabel('Email',{exact:true}),page.getByLabel('Password',{exact:true})],maskColor});await expect(page).toHaveURL(/dashboard/);
});
