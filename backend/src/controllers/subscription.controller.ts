import { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getCompanySubscriptionSummary } from "../services/subscription.service.js";
import { getPaddleClient } from "../config/paddle.js";

const countryHeaders = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
] as const;

const readCountryHeader = (req: Request) => {
  for (const header of countryHeaders) {
    const rawValue = req.headers[header];
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    const normalized = value?.trim().toUpperCase();

    if (normalized && /^[A-Z]{2}$/.test(normalized) && normalized !== "XX") {
      return normalized;
    }
  }

  return undefined;
};

export const getPricingContext = (req: Request, res: Response) => {
  const countryCode = readCountryHeader(req);

  res.setHeader("Cache-Control", "private, no-store");
  countryHeaders.forEach((header) => res.vary(header));
  res.status(200).json(
    new ApiResponse(
      200,
      countryCode ? { countryCode } : {},
      "Pricing context fetched successfully"
    )
  );
};

export const getSubscription = async (req: Request, res: Response) => {
  const summary = await getCompanySubscriptionSummary(req.user!.companyId);
  res.status(200).json(new ApiResponse(200, summary, "Subscription fetched successfully"));
};

export const createCustomerPortalSession = async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where: { id: req.user!.companyId },
    select: { billingCustomerId: true },
  });

  if (!company?.billingCustomerId) {
    throw new ApiError(404, "No Paddle billing customer is linked to this workspace yet.");
  }

  const customer = await prisma.paddleCustomer.findUnique({
    where: { id: company.billingCustomerId },
    select: { id: true },
  });
  if (!customer) {
    throw new ApiError(409, "Billing details are still being synchronized. Try again shortly.");
  }

  const subscriptions = await prisma.paddleSubscription.findMany({
    where: { customerId: customer.id, companyId: req.user!.companyId },
    select: { id: true },
    orderBy: { paddleUpdatedAt: "desc" },
  });

  const portalSession = await getPaddleClient().customerPortalSessions.create(
    customer.id,
    subscriptions.map((subscription) => subscription.id),
  );

  res.setHeader("Cache-Control", "no-store");
  res.status(201).json(
    new ApiResponse(
      201,
      { url: portalSession.urls.general.overview },
      "Customer portal session created successfully",
    ),
  );
};
