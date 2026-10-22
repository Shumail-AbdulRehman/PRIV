import {chromium} from '../../../frontend/node_modules/@playwright/test/index.mjs';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
const out=fileURLToPath(new URL('.',import.meta.url));
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const rows=[];
for(const width of [1366,390])for(const lang of ['en','ur']){
const ctx=await browser.newContext({viewport:{width,height:900}});const p=await ctx.newPage();
for(const [name,path,action] of [['settings-organization','settings.html',''],['settings-account','settings.html','tab:account'],['settings-security','settings.html','tab:security'],['settings-manager-account','settings.html?role=manager',''],['help','help.html',''],['information','information.html','']]){
let errors=[];const err=e=>errors.push(e.message);p.on('pageerror',err);
await p.goto(`${process.argv[2]||'http://127.0.0.1:5197'}/${path}${path.includes('?')?'&':'?'}lang=${lang}`);
if(action)await p.locator(`[data-action="${action}"]`).click();
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
const filename=`reference-${name}-${width}-${lang}.png`;await p.screenshot({path:`${out}/${filename}`,fullPage:true});
rows.push({source:'approved design/v5 HTML via local static server5197',name,path,width,height:900,lang,action,filename,errors,overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),h1:await p.locator('h1').textContent()});p.off('pageerror',err);
}await ctx.close();}
await browser.close();await writeFile(`${out}/reference-manifest.json`,JSON.stringify(rows,null,2));console.log(JSON.stringify({captures:rows.length,overflow:rows.filter(x=>x.overflow),errors:rows.filter(x=>x.errors.length)}));
