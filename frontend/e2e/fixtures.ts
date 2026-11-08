import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  test as base,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
const require = createRequire(
  new URL("../../backend/package.json", import.meta.url),
);
const { Client } = require("pg");
export type Fixture = {
  password: string;
  review: { id: number; taskId: number };
  company: Record<string, number>;
  site: Record<string, number>;
  users: Record<string, { id: number; email: string }>;
  staff: Record<string, { id: number; email: string }>;
  attendance: Record<string, number>;
  task: Record<string, number>;
};
export const fixture: Fixture = JSON.parse(
  readFileSync(process.env.HYGENE_E2E_MANIFEST!, "utf8"),
);
export const backend = process.env.HYGENE_E2E_BACKEND_ORIGIN!;
export async function sql(text: string, values: unknown[] = []) {
  const db = new Client({
    connectionString: process.env.HYGENE_E2E_DATABASE_URL,
  });
  await db.connect();
  try {
    return (await db.query(text, values)).rows;
  } finally {
    await db.end();
  }
}
export async function login(request: APIRequestContext, who = "ownerA") {
  const person = fixture.users[who] ?? fixture.staff[who];
  const response = await request.post(
    `${backend}/api/${fixture.users[who] ? "manager/manager-login" : "staff/staff-login"}`,
    { data: { email: person.email, password: fixture.password } },
  );
  expect(response.status()).toBe(200);
}
export async function enter(
  page: Page,
  path: string,
  who = "ownerA",
  language = "en",
) {
  await login(page.request, who);
  await page.addInitScript(
    (value) => localStorage.setItem("hygene-ops.language", value),
    language,
  );
  await page.goto(path);
}
// Credential-bearing flows intentionally do not persist traces, videos, screenshots or auth state.
export const test = base.extend({});
export { expect };

// Billing UI evidence only: real auth/API beneath explicit provider-facing fixtures.
// SQL reservation/entitlement proof lives in backend/tests/billingLifecycle.integration.ts.
export async function mockBilling(page: Page) {
 const transactionId='txn_'+'a'.repeat(26);
 const facts:Record<string,unknown>={subscription:null,providerState:'NOT_LINKED',billingConfigured:true,billingEnvironment:'sandbox',ownerVerified:false,reconciliationRequired:false,checkoutAvailable:true,portalAvailable:false,checkoutReadiness:'READY',workspaceAccessAllowed:false,onboardingRequired:true,checkoutResume:null};
 let base:Record<string,unknown>|null=null;
 const controls={catalog:'ok',checkout:'ok',sdk:'ok',lifecycle:'ok',posts:0,reads:0};
 const catalog=['month','year'].flatMap(interval=>['STARTER','PRO','ADVANCED'].map((plan,i)=>({plan,interval,priceId:'pri_'+String.fromCharCode(97+i+(interval==='year'?3:0)).repeat(26),productId:'pro_'+'b'.repeat(26),amount:String([1800,6400,17600][i]*(interval==='year'?10:1)),currencyCode:'USD',trialPeriod:null})));
 await page.route('**/api/subscription/manage/lifecycle',async route=>{
  controls.reads++;
  if(controls.lifecycle==='fail')return route.fulfill({status:503,json:{message:'Synthetic unavailable'}});
  if(controls.lifecycle==='denied')return route.fulfill({status:403,json:{message:'Denied'}});
  if(!base){const response=await route.fetch();expect(response.status()).toBe(200);base=(await response.json()).data as Record<string,unknown>;}
  // Subsequent lifecycle responses are explicit fixture facts. Avoid forwarding a
  // canceled browser request during route changes; real persistence is SQL60.
  return route.fulfill({json:{data:{...base,...facts}}});
 });
 await page.route('**/api/subscription/manage/catalog',route=>controls.catalog==='error'?route.fulfill({status:503,json:{message:'Unavailable'}}):route.fulfill({json:{data:controls.catalog==='empty'?[]:controls.catalog==='partial'?catalog.filter(row=>row.plan==='PRO'&&row.interval==='year'):catalog}}));
 await page.route('**/api/subscription/manage/checkout',route=>{
  controls.posts++;const selection=route.request().postDataJSON() as {plan:string;interval:string};
  if(controls.checkout==='lost')return route.abort('failed');
  if(controls.checkout==='409')return route.fulfill({status:409,json:{message:'Pending'}});
  facts.providerState='AWAITING_PROVIDER';facts.checkoutResume={...selection,transactionId};return route.fulfill({json:{data:{transactionId,reused:false}}});
 });
 await page.route('https://cdn.paddle.com/**',route=>controls.sdk==='fail'?route.abort('failed'):route.fulfill({contentType:'application/javascript',body:`
  window.billingThrow=${controls.sdk==='throw'};window.PaddleBillingV1={Environment:{set(){}},Initialize(o){this.Initialized=true;window.billingEvent=o.eventCallback;},Checkout:{close(){document.querySelector('[data-fixture-overlay]')?.remove();},open(o){
   if(window.billingThrow)throw new Error("Synthetic overlay failure");
   window.billingOpen=o;window.billingOpens=(window.billingOpens||0)+1;
   const d=document.createElement('div');d.dataset.fixtureOverlay='true';d.setAttribute('role','dialog');d.setAttribute('aria-label','Paddle fixture');d.innerHTML='<button>Close checkout</button>';document.body.append(d);
   const close=()=>{d.remove();window.billingEvent({name:'checkout.closed',data:{transaction_id:o.transactionId}});};d.querySelector('button').onclick=close;d.addEventListener('keydown',e=>{if(e.key==='Escape')close();});d.querySelector('button').focus();
  }}};
 `}));
 const emit=async(name:string)=>page.evaluate(({name,transactionId})=>{(window as unknown as {billingEvent?:(event:unknown)=>void}).billingEvent?.({name,data:{transaction_id:transactionId}});document.querySelector('[data-fixture-overlay]')?.remove();},{name,transactionId});
 return {facts,controls,catalog,transactionId,emit};
}
