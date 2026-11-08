import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { EventEntity } from '@paddle/paddle-node-sdk';
import { assertIsolatedMediaDatabase } from '../src/services/attendanceMediaTransition.service.js';
const url = process.env.BILLING_LIFECYCLE_TEST_DATABASE_URL;
assertIsolatedMediaDatabase(url, process.env.NODE_ENV); process.env.DATABASE_URL = url;
process.env.PADDLE_ENVIRONMENT = 'sandbox';
const priceId = 'pri_00000000000000000000000001', otherPriceId = 'pri_00000000000000000000000002';
process.env.PADDLE_PRICE_CATALOG_JSON = JSON.stringify([{ plan: 'STARTER', interval: 'month', priceId }, { plan: 'PRO', interval: 'month', priceId: otherPriceId }]);
process.env.PADDLE_BILLING_ENABLED = 'true'; process.env.PADDLE_API_KEY = 'isolated-non-network-credential-fixture-000000';
process.env.PADDLE_CHECKOUT_URL = 'https://workspace.example.invalid/choose-plan';
const { prisma } = await import('../src/prisma/prisma.js');
const { registerCompany } = await import('../src/services/companyRegistration.service.js');
const { processPaddleEvent, companyHasPaidAccess } = await import('../src/services/paddleFulfillment.service.js');
const { createBillingCheckout, getBillingLifecycle } = await import('../src/services/billingLifecycle.service.js');
const suffix = randomUUID(), now = new Date();
const providerId = (prefix: string) => `${prefix}_${randomUUID().replaceAll('-', '').slice(0, 26)}`;
const customerId = providerId('ctm'), subscriptionId = providerId('sub');
const subscription = (id: string, customer: string, status: string, at: Date, price = priceId) => ({ id, customerId: customer, status,
    items: [{ recurring: true, price: { id: price, productId: 'pro_00000000000000000000000001' } }],
    currentBillingPeriod: ['paused', 'canceled'].includes(status) ? null : { startsAt: new Date(+now - 3600000).toISOString(), endsAt: new Date(+now + 3600000).toISOString() },
    createdAt: now.toISOString(), updatedAt: at.toISOString(), canceledAt: status === 'canceled' ? at.toISOString() : null, pausedAt: null, scheduledChange: null, customData: {} });
function event(type: string, data: object, at = now, id = providerId('evt')) {
    return { eventId: id, eventType: type, occurredAt: at.toISOString(), data } as unknown as EventEntity;
}
try {
    const owner = await registerCompany({ name: 'Synthetic billing owner', companyName: 'Synthetic billing fixture', email: `${suffix}-owner@example.invalid`, password: 'synthetic-owner-password' });
    const other = await registerCompany({ name: 'Other synthetic owner', companyName: 'Other isolated company', email: `${suffix}-other@example.invalid`, password: 'synthetic-owner-password' });
    await prisma.company.update({ where: { id: owner.companyId }, data: { billingCustomerId: customerId } });
    const customer = event('customer.created', { id: customerId, email: `${suffix}-other@example.invalid`, name: 'Provider fixture', status: 'active', locale: 'en', createdAt: now.toISOString(), updatedAt: now.toISOString(), customData: { companyId: other.companyId } });
    await processPaddleEvent(customer);
    assert.equal((await prisma.paddleCustomer.findUniqueOrThrow({ where: { id: customerId } })).companyId, owner.companyId, 'customData and email never override canonical customer ownership');
    const signedFixture = event('subscription.updated', subscription(subscriptionId, customerId, 'active', now));
    const duplicate = await Promise.all([processPaddleEvent(signedFixture), processPaddleEvent(signedFixture)]);
    assert.equal(duplicate.filter(result => result.duplicate).length, 1);
    assert.equal(await prisma.paddleWebhookEvent.count({ where: { id: signedFixture.eventId } }), 1);
    assert.equal(await companyHasPaidAccess(owner.companyId), true);
    const old = new Date(+now - 60000);
    await processPaddleEvent(event('subscription.canceled', subscription(subscriptionId, customerId, 'canceled', old), old));
    assert.equal((await prisma.paddleSubscription.findUniqueOrThrow({ where: { id: subscriptionId } })).status, 'active');
    const impostorId = providerId('ctm');
    await processPaddleEvent(event('customer.created', { id: impostorId, email: `${suffix}-other@example.invalid`, name: 'Unlinked fixture', status: 'active', locale: 'en', createdAt: now.toISOString(), updatedAt: now.toISOString(), customData: { companyId: other.companyId } }));
    assert.equal((await prisma.paddleCustomer.findUniqueOrThrow({ where: { id: impostorId } })).companyId, null);
    assert.equal((await prisma.company.findUniqueOrThrow({ where: { id: other.companyId } })).billingCustomerId, null);
    // An early completed transaction creates only an unknown placeholder. Earlier
    // subscription.created must still replace it with real subscription facts.
    const placeholderId = providerId('sub');
    await processPaddleEvent(event('transaction.completed', { id: providerId('txn'), customerId, subscriptionId: placeholderId, status: 'completed', currencyCode: 'USD', invoiceNumber: null,
        createdAt: now.toISOString(), updatedAt: new Date(+now + 2000).toISOString(), items: [{ price: { id: priceId, productId: 'pro_00000000000000000000000001' } }], customData: { companyId: other.companyId }, details: { totals: { grandTotal: '1234' } } }, new Date(+now + 2000)));
    assert.equal((await prisma.paddleSubscription.findUniqueOrThrow({ where: { id: placeholderId } })).status, 'unknown');
    await processPaddleEvent(event('subscription.created', subscription(placeholderId, customerId, 'active', new Date(+now + 1000)), new Date(+now + 1000)));
    assert.equal((await prisma.paddleSubscription.findUniqueOrThrow({ where: { id: placeholderId } })).status, 'active');
    const before = await prisma.company.findUniqueOrThrow({ where: { id: owner.companyId } });
    const failed = event('subscription.updated', subscription(subscriptionId, customerId, 'active', new Date(+now + 3000), otherPriceId), new Date(+now + 3000));
    const failingDb = { $transaction: (run: (tx: unknown) => unknown) => prisma.$transaction(async tx => run(new Proxy(tx, {
        get(target, property) {
            if (property === 'paddleWebhookEvent') return { ...target.paddleWebhookEvent, create: async () => { throw new Error('isolated marker failure'); } };
            const value = Reflect.get(target, property); return typeof value === 'function' ? value.bind(target) : value;
        },
    }))) } as unknown as NonNullable<Parameters<typeof processPaddleEvent>[1]>;
    await assert.rejects(processPaddleEvent(failed, failingDb), /isolated marker failure/);
    assert.deepEqual(await prisma.company.findUniqueOrThrow({ where: { id: owner.companyId } }), before);
    assert.equal(await prisma.paddleWebhookEvent.count({ where: { id: failed.eventId } }), 0);
    assert.equal((await prisma.paddleSubscription.findUniqueOrThrow({ where: { id: subscriptionId } })).priceId, priceId);
    // Unknown catalog pricing cannot grant capacity or access; no fallback to Company.ACTIVE.
    await prisma.paddleSubscription.updateMany({ where: { companyId: owner.companyId }, data: { priceId: 'pri_99999999999999999999999999' } });
    assert.equal(await companyHasPaidAccess(owner.companyId), false);
    // Concurrent application checkout requests use the real company lock and
    // audit reservation, with a no-network provider seam returning only a draft.
    assert.equal((await prisma.manager.findUniqueOrThrow({ where: { id: other.id } })).emailVerifiedAt, null);
    assert.equal((await getBillingLifecycle(other)).checkoutAvailable, true, 'sandbox owner does not need email verification');
    const checkoutCustomer = providerId('ctm');
    await prisma.company.update({ where: { id: other.companyId }, data: { billingCustomerId: checkoutCustomer } });
    await prisma.paddleCustomer.create({ data: { id: checkoutCustomer, companyId: other.companyId, status: 'active', paddleUpdatedAt: now, lastEventAt: now } });
    let creates = 0;
    const draftId = providerId('txn');
    const provider = () => ({ prices: { get: async (requestedPrice: string) => ({ id: requestedPrice, productId: 'pro_fixture', status: 'active', billingCycle: { interval: 'month', frequency: 1 }, unitPrice: { amount: '1234', currencyCode: 'USD' }, trialPeriod: null }) },
        products: { get: async () => ({ id: 'pro_fixture', status: 'active' }) }, transactions: { create: async () => { creates++; return { id: draftId, customerId: checkoutCustomer, status:'draft' }; } } }) as unknown as ReturnType<NonNullable<NonNullable<Parameters<typeof createBillingCheckout>[2]>['provider']>>;
    const checkouts = await Promise.allSettled([createBillingCheckout(other, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider }), createBillingCheckout(other, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider })]);
    assert.equal(creates, 1);
    assert(checkouts.some(result => result.status === 'fulfilled'));
    assert.equal((await createBillingCheckout(other, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider })).transactionId, draftId);
    assert.equal(creates, 1);
    assert.equal((await getBillingLifecycle(other)).onboardingRequired, true, 'a draft customer is not an active subscription');
    assert.deepEqual((await getBillingLifecycle(other)).checkoutResume, {plan:'STARTER',interval:'month',transactionId:draftId}, 'fresh read restores exact prepared draft even before a mirror');
    assert.equal((await getBillingLifecycle(other)).workspaceAccessAllowed,false);
    await assert.rejects(createBillingCheckout(other,{plan:'PRO',interval:'month'},{db:prisma,provider}), /existing checkout/);
    assert.equal(creates,1,'selection change cannot replace reserved checkout');

    assert.equal((await prisma.manager.findUniqueOrThrow({ where: { id: other.id } })).emailVerifiedAt, null);
    const uncertain = await registerCompany({ name: 'Synthetic uncertain owner', companyName: 'Synthetic recovery fixture', email: `${suffix}-uncertain@example.invalid`, password: 'synthetic-owner-password' });
    const uncertainCustomer = providerId('ctm'), uncertainDraft = providerId('txn');
    await prisma.manager.update({ where: { id: uncertain.id }, data: { emailVerifiedAt: now } });
    await prisma.company.update({ where: { id: uncertain.companyId }, data: { billingCustomerId: uncertainCustomer } });
    await prisma.paddleCustomer.create({ data: { id: uncertainCustomer, companyId: uncertain.companyId, status: 'active', paddleUpdatedAt: now, lastEventAt: now } });
    let uncertainCreates = 0;
    const uncertainProvider = () => ({ ...provider(), transactions: { create: async () => { uncertainCreates++; throw new Error('Synthetic lost provider response'); } } }) as unknown as ReturnType<typeof provider>;
    await assert.rejects(createBillingCheckout(uncertain, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider: uncertainProvider }));
    const pending = await prisma.auditLog.findFirstOrThrow({ where: { companyId: uncertain.companyId, action: 'CHECKOUT_RESERVED' }, orderBy: { id: 'desc' } });
    assert.equal((await getBillingLifecycle(uncertain)).checkoutReadiness,'RECONCILIATION_PENDING');
    await assert.rejects(createBillingCheckout(uncertain,{plan:'STARTER',interval:'month'},{db:prisma,provider:uncertainProvider}));
    assert.equal(uncertainCreates,1,'unmatched RESERVED denies a second provider call before callback');
    assert.equal(await prisma.auditLog.count({where:{id:pending.id,companyId:uncertain.companyId}}),1);

    await processPaddleEvent(event('transaction.created', { id: uncertainDraft, customerId: uncertainCustomer, subscriptionId: null, status: 'draft', currencyCode: 'USD', invoiceNumber: null,
        createdAt: now.toISOString(), updatedAt: now.toISOString(), items: [{ quantity: 1, price: { id: priceId, productId: 'pro_fixture' } }], customData: { checkoutReservationId: pending.id } }));
    assert.equal((await createBillingCheckout(uncertain, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider: uncertainProvider })).transactionId, uncertainDraft);
    assert.equal(uncertainCreates, 1, 'provider callback reconciles a lost response without another creation');

    // Persisted callback changes confirmation only after qualified effective periods.
    assert.deepEqual((await getBillingLifecycle(uncertain)).checkoutResume,{plan:'STARTER',interval:'month',transactionId:uncertainDraft});
    const paidSubscription=providerId('sub');
    await processPaddleEvent(event('subscription.created',subscription(paidSubscription,uncertainCustomer,'trialing',new Date(+now+4000)),new Date(+now+4000)));
    assert.equal((await getBillingLifecycle(uncertain,{now:()=>now})).workspaceAccessAllowed,true);
    await processPaddleEvent(event('transaction.completed',{id:uncertainDraft,customerId:uncertainCustomer,subscriptionId:paidSubscription,status:'completed',currencyCode:'USD',invoiceNumber:null,createdAt:now.toISOString(),updatedAt:new Date(+now+5000).toISOString(),items:[{quantity:1,price:{id:priceId,productId:'pro_fixture'}}],customData:{checkoutReservationId:pending.id},details:{totals:{grandTotal:'1234'}}},new Date(+now+5000)));
    const fulfilled=await getBillingLifecycle(uncertain,{now:()=>now});
    assert.equal(fulfilled.workspaceAccessAllowed,true);
    assert.equal(fulfilled.reconciliationRequired,false,'canonical fulfilled checkout must not leave a draft hold after signed persistence');
    assert.equal(fulfilled.checkoutAvailable,false);assert.equal(fulfilled.checkoutResume,null);

    assert.equal((await getBillingLifecycle(uncertain)).checkoutResume,null,'linked subscription is never a second purchase');
    for(const [start,end] of [[new Date(+now+3600000),new Date(+now+7200000)],[new Date(+now-7200000),new Date(+now-3600000)],[null,null]]){
        await prisma.paddleSubscription.update({where:{id:paidSubscription},data:{currentBillingPeriodStart:start,currentBillingPeriodEnd:end}});
        assert.equal((await getBillingLifecycle(uncertain,{now:()=>now})).workspaceAccessAllowed,false,'future/expired/missing windows never authorize');
    }
    await prisma.paddleSubscription.update({where:{id:paidSubscription},data:{currentBillingPeriodStart:new Date(+now-3600000),currentBillingPeriodEnd:new Date(+now+3600000)}});
    await prisma.company.update({where:{id:uncertain.companyId},data:{operationalStatus:'SUSPENDED'}});
    assert.equal((await getBillingLifecycle(uncertain,{now:()=>now})).workspaceAccessAllowed,false);
    await prisma.company.update({where:{id:uncertain.companyId},data:{operationalStatus:'ACTIVE'}});
    await prisma.paddleSubscription.update({where:{id:paidSubscription},data:{priceId:'pri_99999999999999999999999999'}});
    assert.equal((await getBillingLifecycle(uncertain,{now:()=>now})).workspaceAccessAllowed,false,'unknown catalog cannot grant entitlement');

    // Failed customer creation preserves the actual reservation and never creates twice.
    const makeOwner=async(label:string)=>registerCompany({name:'Synthetic owner',companyName:'Synthetic '+label,email:`${suffix}-${label}@example.invalid`,password:'synthetic-owner-password'});
    const customerFailure=await makeOwner('customer-loss');let customerCreates=0;
    const failingCustomer=()=>({...provider(),customers:{create:async()=>{customerCreates++;throw new Error('synthetic lost customer response');}}}) as unknown as ReturnType<typeof provider>;
    await assert.rejects(createBillingCheckout(customerFailure,{plan:'STARTER',interval:'month'},{db:prisma,provider:failingCustomer}));
    const customerReservation=await prisma.auditLog.findFirstOrThrow({where:{companyId:customerFailure.companyId,action:'CUSTOMER_CREATE_RESERVED'}});
    assert.equal((await getBillingLifecycle(customerFailure)).checkoutReadiness,'RECONCILIATION_PENDING');
    await assert.rejects(createBillingCheckout(customerFailure,{plan:'STARTER',interval:'month'},{db:prisma,provider:failingCustomer}));
    assert.equal(customerCreates,1);
    assert.equal(await prisma.auditLog.count({where:{id:customerReservation.id,companyId:customerFailure.companyId}}),1);

    // READY persistence failure rolls back only that transaction, keeping RESERVED.
    const persistenceFailure=await makeOwner('ready-persist-loss'),persistCustomer=providerId('ctm'),persistDraft=providerId('txn');
    await prisma.company.update({where:{id:persistenceFailure.companyId},data:{billingCustomerId:persistCustomer}});
    await prisma.paddleCustomer.create({data:{id:persistCustomer,companyId:persistenceFailure.companyId,status:'active',paddleUpdatedAt:now,lastEventAt:now}});
    let persistCreates=0;
    const persistProvider=()=>({...provider(),transactions:{create:async()=>{persistCreates++;return{id:persistDraft,customerId:persistCustomer,status:'draft'};}}}) as unknown as ReturnType<typeof provider>;
    const failReadyDb=new Proxy(prisma,{get(target,property){if(property==='$transaction')return (run:(tx:unknown)=>unknown)=>prisma.$transaction(async tx=>run(new Proxy(tx,{get(inner,key){if(key==='auditLog')return{...inner.auditLog,create:async(args:Parameters<typeof inner.auditLog.create>[0])=>{if(args?.data.action==='CHECKOUT_READY')throw new Error('synthetic READY persistence failure');return inner.auditLog.create(args);}};const value=Reflect.get(inner,key);return typeof value==='function'?value.bind(inner):value;}})));const value=Reflect.get(target,property);return typeof value==='function'?value.bind(target):value;}}) as typeof prisma;
    await assert.rejects(createBillingCheckout(persistenceFailure,{plan:'STARTER',interval:'month'},{db:failReadyDb,provider:persistProvider}));
    const persistReservation=await prisma.auditLog.findFirstOrThrow({where:{companyId:persistenceFailure.companyId,action:'CHECKOUT_RESERVED'}});
    assert.equal((await getBillingLifecycle(persistenceFailure)).checkoutReadiness,'RECONCILIATION_PENDING');
    await assert.rejects(createBillingCheckout(persistenceFailure,{plan:'STARTER',interval:'month'},{db:prisma,provider:persistProvider}));
    assert.equal(persistCreates,1);
    assert.equal(await prisma.auditLog.count({where:{id:persistReservation.id,companyId:persistenceFailure.companyId}}),1);
    assert.equal(await prisma.auditLog.count({where:{companyId:persistenceFailure.companyId,action:'CHECKOUT_READY'}}),0);
    // An unproven paid/foreign mirror must never make the held draft reopenable.
    await processPaddleEvent(event('transaction.completed',{id:persistDraft,customerId:persistCustomer,subscriptionId:null,status:'completed',currencyCode:'USD',invoiceNumber:null,createdAt:now.toISOString(),updatedAt:now.toISOString(),items:[{quantity:1,price:{id:priceId,productId:'pro_fixture'}}],customData:{checkoutReservationId:persistReservation.id}}));
    assert.equal((await getBillingLifecycle(persistenceFailure)).checkoutResume,null);
    await assert.rejects(createBillingCheckout(persistenceFailure,{plan:'STARTER',interval:'month'},{db:prisma,provider:persistProvider}));
    assert.equal(persistCreates,1);
    await assert.rejects(getBillingLifecycle({...persistenceFailure,companyId:other.companyId}),/owner/);
    await prisma.paddleTransaction.create({data:{id:draftId,companyId:owner.companyId,customerId:checkoutCustomer,status:'draft',currencyCode:'USD',paddleUpdatedAt:now,lastEventAt:now}});
    assert.equal((await getBillingLifecycle(other)).checkoutResume,null,'a foreign mirror overrides apparently valid READY metadata');
    await assert.rejects(createBillingCheckout(other,{plan:'STARTER',interval:'month'},{db:prisma,provider}));
    assert.equal(creates,1);

    console.log('PASS isolated billing: atomic dedup/rollback, ordered canonical customer ownership, untrusted email/customData denied, early transaction placeholder convergence, unqualified catalog denied concurrent checkout one provider draft, exact reload resume, persisted effective entitlement, retained customer/checkout reservations and failed READY persistence. Provider is a no-network fixture; sandbox remains required.');
} finally { await prisma.$disconnect(); }
