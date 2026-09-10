import {
  EventName,
  type CustomerNotification,
  type EventEntity,
  type SubscriptionCreatedNotification,
  type SubscriptionNotification,
  type TransactionNotification,
} from "@paddle/paddle-node-sdk";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma.js";
import type { PlanCode } from "./subscription.service.js";

type SubscriptionPayload = SubscriptionNotification | SubscriptionCreatedNotification;

const PRICE_TO_PLAN: Record<string, PlanCode> = {
  pri_01m26dxq2nvjb2ak7jt4gym22g: "STARTER",
  pri_01m26dxqw2hx8kk0tc70wg5t29: "STARTER",
  pri_01m26dxtv0k73yk444nc0vvqjj: "PRO",
  pri_01m26dxvj8cmtdtr7a660mqa2h: "PRO",
  pri_01m26dxxw7h9ma5xxcmsc0axgp: "ADVANCED",
  pri_01m26dxyqpqr2cmr8cwez9am00: "ADVANCED",
};

const epoch = new Date(0);

const asDate = (value: string | null | undefined) => value ? new Date(value) : null;

const shouldApplyEntityVersion = (
  current: { paddleUpdatedAt: Date; lastEventAt: Date } | null,
  paddleUpdatedAt: Date,
  eventAt: Date,
) => !current
  || paddleUpdatedAt > current.paddleUpdatedAt
  || (paddleUpdatedAt.getTime() === current.paddleUpdatedAt.getTime() && eventAt >= current.lastEventAt);

const asCompanyId = (customData: unknown) => {
  if (!customData || typeof customData !== "object") return undefined;
  const value = (customData as Record<string, unknown>).companyId;
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export const subscriptionGrantsPaidAccess = (status: string) =>
  status.toLowerCase() === "active" || status.toLowerCase() === "trialing";

const toCompanyStatus = (status: string): "ACTIVE" | "PAST_DUE" | "CANCELLED" => {
  if (subscriptionGrantsPaidAccess(status)) return "ACTIVE";
  if (status.toLowerCase() === "past_due") return "PAST_DUE";
  return "CANCELLED";
};

const ensureCustomerExists = async (customerId: string, eventAt: Date) => {
  const existing = await prisma.paddleCustomer.findUnique({ where: { id: customerId } });
  if (existing) return existing;

  try {
    return await prisma.paddleCustomer.create({
      data: {
        id: customerId,
        status: "unknown",
        paddleUpdatedAt: epoch,
        lastEventAt: eventAt,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return prisma.paddleCustomer.findUniqueOrThrow({ where: { id: customerId } });
    }
    throw error;
  }
};

const resolveCompanyId = async (
  customerId: string,
  claimedCompanyId?: number,
) => {
  const linkedCompany = await prisma.company.findFirst({
    where: { billingCustomerId: customerId },
    select: { id: true },
  });
  if (linkedCompany) return linkedCompany.id;

  const mirroredCustomer = await prisma.paddleCustomer.findUnique({
    where: { id: customerId },
    select: { companyId: true, email: true },
  });
  if (mirroredCustomer?.companyId) return mirroredCustomer.companyId;

  if (claimedCompanyId) {
    const claimedCompany = await prisma.company.findUnique({
      where: { id: claimedCompanyId },
      select: {
        id: true,
        billingCustomerId: true,
        managers: {
          where: { role: "ADMIN", isActive: true },
          select: { email: true },
        },
      },
    });
    const emailMatchesAdmin = mirroredCustomer?.email && claimedCompany?.managers.some(
      (manager) => manager.email.toLowerCase() === mirroredCustomer.email!.toLowerCase(),
    );

    if (claimedCompany && !claimedCompany.billingCustomerId && emailMatchesAdmin) {
      return claimedCompany.id;
    }
  }

  if (mirroredCustomer?.email) {
    const admin = await prisma.manager.findFirst({
      where: {
        role: "ADMIN",
        isActive: true,
        email: { equals: mirroredCustomer.email, mode: "insensitive" },
        company: { billingCustomerId: null },
      },
      select: { companyId: true },
    });
    return admin?.companyId;
  }

  return undefined;
};

const linkCustomerToCompany = async (customerId: string, companyId: number) => {
  await prisma.$transaction([
    prisma.paddleCustomer.update({
      where: { id: customerId },
      data: { companyId },
    }),
    prisma.company.update({
      where: { id: companyId },
      data: { billingCustomerId: customerId },
    }),
    prisma.paddleSubscription.updateMany({
      where: { customerId, companyId: null },
      data: { companyId },
    }),
    prisma.paddleTransaction.updateMany({
      where: { customerId, companyId: null },
      data: { companyId },
    }),
  ]);
};

const syncCompanyAccess = async (companyId: number) => {
  const subscriptions = await prisma.paddleSubscription.findMany({
    where: { companyId },
    orderBy: [{ paddleUpdatedAt: "desc" }, { updatedAt: "desc" }],
  });
  if (subscriptions.length === 0) return;

  const effectiveSubscription = subscriptions.find((subscription) =>
    subscriptionGrantsPaidAccess(subscription.status)
  ) ?? subscriptions[0];
  const plan = PRICE_TO_PLAN[effectiveSubscription.priceId];

  await prisma.company.update({
    where: { id: companyId },
    data: {
      billingCustomerId: effectiveSubscription.customerId,
      billingSubscriptionId: effectiveSubscription.id,
      subscriptionStatus: toCompanyStatus(effectiveSubscription.status),
      ...(plan ? { plan } : {}),
      planUpdatedAt: new Date(),
    },
  });
};

export const companyHasPaidAccess = async (companyId: number) => {
  const subscription = await prisma.paddleSubscription.findFirst({
    where: {
      companyId,
      status: { in: ["active", "trialing"] },
    },
    select: { status: true },
  });

  return subscription ? subscriptionGrantsPaidAccess(subscription.status) : false;
};

const handleCustomer = async (data: CustomerNotification, eventAt: Date) => {
  const paddleUpdatedAt = new Date(data.updatedAt);
  const current = await prisma.paddleCustomer.findUnique({ where: { id: data.id } });

  if (shouldApplyEntityVersion(current, paddleUpdatedAt, eventAt)) {
    await prisma.paddleCustomer.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        email: data.email,
        name: data.name,
        locale: data.locale,
        status: data.status,
        paddleCreatedAt: asDate(data.createdAt),
        paddleUpdatedAt,
        lastEventAt: eventAt,
      },
      update: {
        email: data.email,
        name: data.name,
        locale: data.locale,
        status: data.status,
        paddleCreatedAt: asDate(data.createdAt),
        paddleUpdatedAt,
        lastEventAt: eventAt,
      },
    });
  }

  const companyId = await resolveCompanyId(data.id, asCompanyId(data.customData));
  if (companyId) {
    await linkCustomerToCompany(data.id, companyId);
    await syncCompanyAccess(companyId);
  }
};

const subscriptionItem = (data: SubscriptionPayload) => {
  const item = data.items.find((candidate) => candidate.recurring && candidate.price)
    ?? data.items.find((candidate) => candidate.price);
  if (!item?.price) throw new Error(`Subscription ${data.id} has no catalog price`);
  return { priceId: item.price.id, productId: item.price.productId };
};

const handleSubscription = async (data: SubscriptionPayload, eventAt: Date) => {
  await ensureCustomerExists(data.customerId, eventAt);
  const companyId = await resolveCompanyId(data.customerId, asCompanyId(data.customData));
  if (companyId) await linkCustomerToCompany(data.customerId, companyId);

  const { priceId, productId } = subscriptionItem(data);
  const paddleUpdatedAt = new Date(data.updatedAt);
  const current = await prisma.paddleSubscription.findUnique({ where: { id: data.id } });

  if (shouldApplyEntityVersion(current, paddleUpdatedAt, eventAt)) {
    await prisma.paddleSubscription.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        customerId: data.customerId,
        companyId,
        status: data.status,
        priceId,
        productId,
        scheduledChangeAction: data.scheduledChange?.action,
        scheduledChangeAt: asDate(data.scheduledChange?.effectiveAt),
        currentBillingPeriodStart: asDate(data.currentBillingPeriod?.startsAt),
        currentBillingPeriodEnd: asDate(data.currentBillingPeriod?.endsAt),
        canceledAt: asDate(data.canceledAt),
        pausedAt: asDate(data.pausedAt),
        paddleCreatedAt: asDate(data.createdAt),
        paddleUpdatedAt,
        lastEventAt: eventAt,
      },
      update: {
        customerId: data.customerId,
        ...(companyId ? { companyId } : {}),
        status: data.status,
        priceId,
        productId,
        scheduledChangeAction: data.scheduledChange?.action ?? null,
        scheduledChangeAt: asDate(data.scheduledChange?.effectiveAt),
        currentBillingPeriodStart: asDate(data.currentBillingPeriod?.startsAt),
        currentBillingPeriodEnd: asDate(data.currentBillingPeriod?.endsAt),
        canceledAt: asDate(data.canceledAt),
        pausedAt: asDate(data.pausedAt),
        paddleCreatedAt: asDate(data.createdAt),
        paddleUpdatedAt,
        lastEventAt: eventAt,
      },
    });
  }

  if (companyId) await syncCompanyAccess(companyId);
};

const ensureSubscriptionExistsFromTransaction = async (
  data: TransactionNotification,
  eventAt: Date,
  companyId?: number,
) => {
  if (!data.subscriptionId || !data.customerId) return;
  const existing = await prisma.paddleSubscription.findUnique({ where: { id: data.subscriptionId } });
  if (existing) return;

  const price = data.items.find((item) => item.price)?.price;
  if (!price) return;

  try {
    await prisma.paddleSubscription.create({
      data: {
        id: data.subscriptionId,
        customerId: data.customerId,
        companyId,
        status: "unknown",
        priceId: price.id,
        productId: price.productId,
        paddleUpdatedAt: epoch,
        lastEventAt: eventAt,
      },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }
};

const handleTransactionCompleted = async (data: TransactionNotification, eventAt: Date) => {
  if (data.customerId) await ensureCustomerExists(data.customerId, eventAt);
  const companyId = data.customerId
    ? await resolveCompanyId(data.customerId, asCompanyId(data.customData))
    : undefined;
  if (data.customerId && companyId) await linkCustomerToCompany(data.customerId, companyId);
  await ensureSubscriptionExistsFromTransaction(data, eventAt, companyId);

  const paddleUpdatedAt = new Date(data.updatedAt);
  const current = await prisma.paddleTransaction.findUnique({ where: { id: data.id } });
  if (shouldApplyEntityVersion(current, paddleUpdatedAt, eventAt)) {
    await prisma.paddleTransaction.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        companyId,
        status: data.status,
        currencyCode: data.currencyCode,
        total: data.details?.totals?.grandTotal,
        invoiceNumber: data.invoiceNumber,
        paddleCreatedAt: asDate(data.createdAt),
        paddleUpdatedAt,
        lastEventAt: eventAt,
      },
      update: {
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        ...(companyId ? { companyId } : {}),
        status: data.status,
        currencyCode: data.currencyCode,
        total: data.details?.totals?.grandTotal,
        invoiceNumber: data.invoiceNumber,
        paddleCreatedAt: asDate(data.createdAt),
        paddleUpdatedAt,
        lastEventAt: eventAt,
      },
    });
  }

  if (companyId) await syncCompanyAccess(companyId);
};

export const processPaddleEvent = async (event: EventEntity) => {
  const alreadyProcessed = await prisma.paddleWebhookEvent.findUnique({
    where: { id: event.eventId },
    select: { id: true },
  });
  if (alreadyProcessed) return { duplicate: true };

  const eventAt = new Date(event.occurredAt);
  switch (event.eventType) {
    case EventName.CustomerCreated:
    case EventName.CustomerUpdated:
      await handleCustomer(event.data, eventAt);
      break;
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionCanceled:
      await handleSubscription(event.data, eventAt);
      break;
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data, eventAt);
      break;
    default:
      break;
  }

  await prisma.paddleWebhookEvent.create({
    data: {
      id: event.eventId,
      eventType: event.eventType,
      occurredAt: eventAt,
    },
  });

  return { duplicate: false };
};
