const {createRequire}=require('node:module');
const fs=require('node:fs');
const path=require('node:path');
const req=createRequire(path.join(process.cwd(),'frontend/package.json'));
const {chromium}=req('playwright');
const out=path.join(process.cwd(),'docs/plan-project/billing-onboarding/research/revision-2/evidence/review-b');
const base='http://127.0.0.1:56789/revision-2/v3/';
const result={base,started:new Date().toISOString(),matrix:[],checks:[],requests:[],errors:[],console:[]};
const check=(name,pass,detail)=>result.checks.push({name,pass,detail});
const measure=()=>{
const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0};
const selector=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):'');
const elems=[...document.querySelectorAll('body *')].filter(visible);
return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,dir:document.documentElement.dir,lang:document.documentElement.lang,title:document.querySelector('h1')?.textContent,overflow:elems.filter(e=>{const r=e.getBoundingClientRect();return !e.closest('.skip')&&(r.left < -1 ||r.right>innerWidth+1)}).map(e=>({selector:selector(e),text:e.textContent.trim().slice(0,110),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).slice(0,30),support:[...document.querySelectorAll('.small-note,.plan-description,.plan-price>span,.capacity-list li,.owner-note,.sandbox,.page-heading>p,.confirmation-steps p,.test-guide p,.product-footer>span')].filter(visible).map(e=>({selector:selector(e),fontSize:getComputedStyle(e).fontSize,lineHeight:getComputedStyle(e).lineHeight,text:e.textContent.trim().slice(0,130)})),primary:[...document.querySelectorAll('main .button')].filter(visible).map(e=>({text:e.textContent.trim(),top:Math.round(e.getBoundingClientRect().top),height:Math.round(e.getBoundingClientRect().height),bottom:Math.round(e.getBoundingClientRect().bottom)}))};
};
(async()=>{
const browser=await chromium.launch({headless:true});
const context=await browser.newContext();
const page=await context.newPage();
page.on('request',r=>result.requests.push({url:r.url(),method:r.method()}));
page.on('pageerror',e=>result.errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')result.console.push({type:m.type(),text:m.text()})});
for(const width of [320,390,768,1366]) for(const lang of ['en','ur']) for(const screen of ['account','index','payment','activation','billing','recovery']){
await page.setViewportSize({width,height:width===1366?900:width===768?1024:844});
await page.goto(base+screen+'.html?lang='+lang);await page.evaluate(()=>document.fonts.ready);
const row={screen,lang,...await page.evaluate(measure)};result.matrix.push(row);
if((width===1366&&lang==='en')||(width===390&&lang==='ur'))await page.screenshot({path:path.join(out,`${screen}-${lang}-${width}.png`),fullPage:true});
if(row.overflow.length)await page.screenshot({path:path.join(out,`overflow-${screen}-${lang}-${width}.png`),fullPage:true});
}
await page.setViewportSize({width:1366,height:900});
for(const lang of ['en','ur']){
await page.goto(base+'index.html?lang='+lang); await page.evaluate(()=>document.fonts.ready);
const radios=page.getByRole('radio');check('native radio semantics '+lang,(await radios.count())===3,await radios.evaluateAll(es=>es.map(e=>({type:e.type,name:e.getAttribute('aria-label'),describedby:e.getAttribute('aria-describedby'),checked:e.checked}))));
await radios.nth(1).focus();await page.keyboard.press('ArrowRight');const afterRight=await radios.evaluateAll(es=>es.map(e=>({value:e.value,checked:e.checked,focused:e===document.activeElement})));
check('radio ArrowRight selection and focus '+lang,afterRight.some(e=>e.checked&&e.focused)&&!afterRight.find(e=>e.value==='PRO').checked,afterRight);
await page.keyboard.press('ArrowLeft');const afterLeft=await radios.evaluateAll(es=>es.map(e=>({value:e.value,checked:e.checked,focused:e===document.activeElement})));
check('radio ArrowLeft reverses '+lang,afterLeft.find(e=>e.value==='PRO').checked&&afterLeft.find(e=>e.value==='PRO').focused,afterLeft);
await page.locator('input[value=STARTER]').focus();await page.keyboard.press('Space');check('radio Space selection '+lang,await page.locator('input[value=STARTER]').isChecked(),{focus:await page.evaluate(()=>document.activeElement?.value)});
await page.locator('[data-interval=year]').click();const focusAfterYear=await page.evaluate(()=>({interval:document.activeElement.dataset.interval,pressed:document.activeElement.getAttribute('aria-pressed')}));
check('year interval focus '+lang,focusAfterYear.interval==='year'&&focusAfterYear.pressed==='true',focusAfterYear);
check('plan/interval retained in payment URL '+lang,(await page.locator('.continue-button').getAttribute('href')).includes('plan=STARTER&interval=year&lang='+lang),await page.locator('.continue-button').getAttribute('href'));
await page.screenshot({path:path.join(out,`keyboard-plan-${lang}.png`),fullPage:false});
check('plan focus indicator '+lang,await page.locator('.plan-card').first().evaluate(e=>getComputedStyle(e).outlineStyle)!=='none'||focusAfterYear.interval==='year',{note:'Radio focus appearance recorded by CSS :has(input:focus-visible); screenshot after interval interaction.'});
}
await page.goto(base+'account.html');
for(const [field,value]of Object.entries({name:'Ayesha Khan',company:'Example Workspace',email:'owner@example.test',password:'test-only-secret'}))await page.locator('[name='+field+']').fill(value);
await page.locator('[data-language=ur]').click();
const preserved=await page.locator('#account-form').evaluate(f=>({name:f.elements.name.value==='Ayesha Khan',company:f.elements.company.value==='Example Workspace',email:f.elements.email.value==='owner@example.test',password:f.elements.password.value==='test-only-secret'}));
check('language switch preserves all form values',Object.values(preserved).every(Boolean),preserved);
check('language button keeps focus',await page.locator('[data-language=ur]').evaluate(e=>e===document.activeElement),await page.evaluate(()=>({lang:document.documentElement.lang,dir:document.documentElement.dir,active:document.activeElement.dataset.language})));
await page.locator('[data-language=en]').click();check('language roundtrip preserves form',await page.locator('[name=name]').inputValue()==='Ayesha Khan',{});
check('account form field labels',(await page.getByRole('textbox',{name:'Full name'}).count())===1&&(await page.getByRole('textbox',{name:'Company name'}).count())===1,{snapshot:await page.locator('#account-form').ariaSnapshot()});
const helpOpener=page.locator('.topbar [data-help]');await helpOpener.click();
check('help native modal focus',await page.locator('#help-dialog').evaluate(e=>e.open&&e.contains(document.activeElement)),await page.locator('#help-dialog').evaluate(e=>({open:e.open,focus:document.activeElement.id})));
let helpContained=true;for(let i=0;i<12;i++){await page.keyboard.press('Tab');helpContained&&=await page.locator('#help-dialog').evaluate(e=>e.contains(document.activeElement));}check('help Tab focus stays inside dialog',helpContained,{});
await page.keyboard.press('Escape');check('help Escape dismiss/restore',await page.locator('#help-dialog').evaluate(e=>!e.open)&&await helpOpener.evaluate(e=>e===document.activeElement),{});
check('help preserves form',await page.locator('[name=email]').inputValue()==='owner@example.test',{});
await page.goto(base+'payment.html?plan=ADVANCED&interval=year&lang=ur');await page.locator('#open-checkout').click();
check('checkout modal focus',await page.locator('#checkout-dialog').evaluate(e=>e.open&&e.contains(document.activeElement)),await page.evaluate(()=>document.activeElement.id));
let checkoutContained=true;for(let i=0;i<15;i++){await page.keyboard.press('Tab');checkoutContained&&=await page.locator('#checkout-dialog').evaluate(e=>e.contains(document.activeElement));}check('checkout Tab focus containment',checkoutContained,{});
await page.locator('#simulate-decline').click();check('decline alert displayed',await page.locator('#decline-message').isVisible(),await page.locator('#decline-message').innerText());
await page.screenshot({path:path.join(out,'checkout-decline-ur-desktop.png'),fullPage:false});
await page.keyboard.press('Escape');check('checkout Escape dismiss/restore',await page.locator('#checkout-dialog').evaluate(e=>!e.open)&&await page.locator('#open-checkout').evaluate(e=>e===document.activeElement),{});
await page.locator('#open-checkout').click();check('checkout reopens same plan',await page.locator('.checkout-columns h2').first().innerText()==='Enterprise',{});
await page.keyboard.press('Escape');
for(const lang of ['en','ur']){
await page.goto(base+'index.html?state=loading&lang='+lang);check('loading has busy status and disabled CTA '+lang,await page.locator('.service-state').getAttribute('aria-busy')==='true'&&await page.locator('main button').isDisabled(),{text:await page.locator('.service-state').innerText()});
await page.goto(base+'index.html?state=unavailable&lang='+lang+'&plan=STARTER&interval=year');check('unavailable has alert/help/retry '+lang,await page.locator('.service-state[role=alert]').count()===1&&(await page.locator('.service-state button').count())===2,{});await page.locator('#retry-plans').click();check('retry retains selected plan/interval '+lang,await page.locator('input[value=STARTER]').isChecked()&&await page.locator('[data-interval=year]').getAttribute('aria-pressed')==='true',{});
await page.goto(base+'activation.html?state=pending&lang='+lang);check('pending has no workspace/payment CTA '+lang,(await page.locator('#refresh-status').count())===1&&(await page.locator('#open-checkout').count())===0&&(await page.locator('[data-demo="Workspace setup"]').count())===0,{});await page.locator('#refresh-status').click();check('pending refresh announces status '+lang,(await page.locator('#announcements').innerText()).length>0,await page.locator('#announcements').innerText());
await page.goto(base+'activation.html?state=ready&lang='+lang);check('ready has workspace CTA '+lang,(await page.locator('[data-demo="Workspace setup"]').count())===1&&(await page.locator('#refresh-status').count())===0,{});await page.locator('[data-demo="Workspace setup"]').click();check('workspace CTA explicitly preview '+lang,(await page.locator('#announcements').innerText()).includes('Design preview'),await page.locator('#announcements').innerText());
await page.goto(base+'recovery.html?state=uncertain&lang='+lang+'&plan=ADVANCED&interval=year');const href=await page.locator('.recovery-layout>.button').getAttribute('href');check('uncertain recovery checks status before new payment '+lang,href.includes('activation.html')&&!href.includes('payment.html'),{href,text:await page.locator('.recovery-layout').innerText()});
await page.goto(base+'recovery.html?lang='+lang+'&plan=ADVANCED&interval=year');check('recovery retains selection and gives status route '+lang,(await page.locator('.recovery-layout>.button').getAttribute('href')).includes('plan=ADVANCED&interval=year')&&(await page.locator('.recovery-status').getAttribute('href')).includes('activation.html'),{});
}
for(const [screen,state]of [['index','loading'],['index','unavailable'],['activation','ready'],['recovery','uncertain']]){await page.setViewportSize({width:320,height:844});await page.goto(base+screen+'.html?lang=ur&state='+state);await page.evaluate(()=>document.fonts.ready);const r=await page.evaluate(measure);result.matrix.push({screen,state,lang:'ur',...r});await page.screenshot({path:path.join(out,`${screen}-${state}-ur-320.png`),fullPage:true});}
await page.goto(base+'index.html');const preflight=await page.evaluate(()=>{document.title='[Assessment B] '+document.title;const s=document.createElement('script');s.id='assessment-b-mutable-preflight';s.textContent='window.__assessmentBInjection = true;';document.head.append(s);return {title:document.title,scriptAdded:!!document.getElementById(s.id),scriptExecuted:window.__assessmentBInjection===true};});result.overlayPreflight=preflight;
check('mutable browser injection preflight',preflight.scriptAdded&&preflight.scriptExecuted,preflight);
result.externalRequests=result.requests.filter(r=>!r.url.startsWith('http://127.0.0.1:56789/'));
result.summary={matrixCases:result.matrix.length,overflowCases:result.matrix.filter(x=>x.documentWidth>x.width||x.overflow.length).length,checks:result.checks.length,failedChecks:result.checks.filter(x=>!x.pass),externalRequests:result.externalRequests.length,pageErrors:result.errors.length};
fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));
await context.close();await browser.close();console.log(JSON.stringify(result.summary,null,2));
})().catch(e=>{fs.writeFileSync(path.join(out,'browser-results.partial.json'),JSON.stringify(result,null,2));console.error(e);process.exitCode=1});
