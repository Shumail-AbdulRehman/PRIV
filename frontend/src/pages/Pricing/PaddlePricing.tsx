import EnterprisePlan from "./EnterprisePlan";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { clearUser } from "@/store/slices/authSlice";
import useAuth from "@/hooks/useAuth";
import { getCurrentUser } from "@/api/auth";
import type { Paddle, PricePreviewParams } from "@paddle/paddle-js";
import {
  ArrowRight,
  Building2,
  Check,
  Image,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPaddle } from "@/lib/paddle";
import { usePricingContext } from "@/pages/Subscription/queries";
import type { PlanCode } from "@/pages/Subscription/types";
import { TIERS, type BillingPeriod, type Tier } from "./tiers";

type PaddlePricingProps = {
  appearance?: "default" | "marketing";
  currentPlan?: PlanCode;
  subscribeDisabled?: boolean;
  disabledMessage?: string;
};

type PriceMap = Record<string, string>;

const planCode = (tier: Tier): PlanCode => tier.name.toUpperCase() as PlanCode;

export function PaddlePricing({
  appearance = "default",
  currentPlan,
  subscribeDisabled = false,
  disabledMessage,
}: PaddlePricingProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("month");
  const [paddle, setPaddle] = useState<Paddle>();
  const [prices, setPrices] = useState<PriceMap>({});
  const [previewCountry, setPreviewCountry] = useState<string>();
  const [paddleError, setPaddleError] = useState<string>();
  const [loadedPreviewKey, setLoadedPreviewKey] = useState<string>();
  const pricingContext = usePricingContext();

  useEffect(() => {
    let active = true;

    getPaddle()
      .then((instance) => {
        if (active) setPaddle(instance);
      })
      .catch((error: unknown) => {
        if (active) {
          setPaddleError(
            error instanceof Error
              ? error.message
              : "Paddle.js could not be initialized.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedItems = useMemo(
    () =>
      TIERS.map((tier) => ({
        priceId: tier.priceId[billingPeriod],
        quantity: 1,
      })),
    [billingPeriod],
  );
  const previewKey = `${billingPeriod}:${pricingContext.data?.countryCode ?? "auto"}`;
  const previewLoading =
    !paddleError &&
    (!paddle || pricingContext.isPending || loadedPreviewKey !== previewKey);

  useEffect(() => {
    if (!paddle || pricingContext.isPending) return;

    let active = true;

    const countryCode = pricingContext.data?.countryCode;
    const request: PricePreviewParams = {
      items: selectedItems,
      ...(countryCode ? { address: { countryCode } } : {}),
    };

    paddle
      .PricePreview(request)
      .then((response) => {
        if (!active) return;

        const nextPrices = Object.fromEntries(
          response.data.details.lineItems.map((lineItem) => [
            lineItem.price.id,
            lineItem.formattedTotals.total,
          ]),
        );

        setPrices(nextPrices);
        setPreviewCountry(response.data.address?.countryCode);
        setLoadedPreviewKey(previewKey);
        setPaddleError(undefined);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setPrices({});
        setLoadedPreviewKey(previewKey);
        setPaddleError(
          error instanceof Error
            ? error.message
            : "Localized prices could not be loaded.",
        );
      });

    return () => {
      active = false;
    };
  }, [
    paddle,
    previewKey,
    pricingContext.data?.countryCode,
    pricingContext.isPending,
    selectedItems,
  ]);

  const openCheckout = async (tier: Tier) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (
      !paddle ||
      subscribeDisabled ||
      user.role !== "ADMIN" ||
      checkoutPending
    )
      return;

    setCheckoutPending(true);
    setCheckoutError(undefined);
    try {
      // Revalidate the session so an expired or switched account cannot open
      // an anonymous checkout or attach payment to the previous workspace.
      const account = await getCurrentUser();
      if (account.role !== "ADMIN" || account.companyId !== user.companyId) {
        throw new Error(
          "Your account has changed. Refresh this page before choosing a plan.",
        );
      }
      const countryCode = previewCountry ?? pricingContext.data?.countryCode;
      paddle.Checkout.open({
        items: [{ priceId: tier.priceId[billingPeriod], quantity: 1 }],
        customer: {
          email: account.email,
          ...(countryCode ? { address: { countryCode } } : {}),
        },
        settings: {
          displayMode: "overlay",
          variant: "one-page",
          theme: "light",
          successUrl: new URL("/welcome", window.location.origin).toString(),
        },
        customData: {
          plan: planCode(tier),
          billingPeriod,
          companyId: account.companyId,
        },
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        queryClient.clear();
        dispatch(clearUser());
        navigate("/login", { state: { from: "/choose-plan" } });
        return;
      }
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Checkout could not be opened. Please sign in again and retry.",
      );
    } finally {
      setCheckoutPending(false);
    }
  };

  if (appearance === "marketing") {
    return (
      <div className="saas-pricing">
        <div className="pricing-controls">
          <div
            className="billing-toggle"
            role="group"
            aria-label="Billing period"
          >
            {(["month", "year"] as BillingPeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={billingPeriod === period}
                onClick={() => setBillingPeriod(period)}
              >
                {period === "month" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
          <span className="pricing-localized">
            <MapPin size={12} />
            {previewCountry
              ? `Prices localized for ${previewCountry}`
              : "Prices in your local currency"}
          </span>
        </div>
        {paddleError && (
          <p className="pricing-message" role="status">
            Prices are temporarily unavailable. You can still create your
            account and choose a plan once prices are available.
          </p>
        )}
        {checkoutError && (
          <p className="pricing-message error" role="alert">
            {checkoutError}
          </p>
        )}
        <div className="plan-grid">
          {TIERS.map((tier) => {
            const price = prices[tier.priceId[billingPeriod]];
            const current = currentPlan === planCode(tier);
            return (
              <article
                key={tier.name}
                className={cn("saas-plan", tier.recommended && "recommended")}
              >
                {tier.recommended && (
                  <span className="recommended-label">For growing teams</span>
                )}
                <div className="plan-title">
                  <h2>{tier.name}</h2>
                  {current && (
                    <span className="current-plan-label">Current plan</span>
                  )}
                </div>
                <p>{tier.description}</p>
                <div className="plan-price" aria-live="polite">
                  {previewLoading ? (
                    <LoaderCircle
                      size={25}
                      className="animate-spin"
                      aria-label="Loading localized price"
                    />
                  ) : (
                    <strong className={!price ? "price-fallback" : undefined}>
                      {price ?? "Unavailable"}
                    </strong>
                  )}
                  {price && !previewLoading && <span>/ {billingPeriod}</span>}
                </div>
                <span className="plan-trial">7-day free trial included</span>
                <button
                  type="button"
                  className={cn(
                    "marketing-button",
                    tier.recommended ? "primary-button" : "secondary-button",
                  )}
                  disabled={
                    Boolean(user) &&
                    (!paddle ||
                      previewLoading ||
                      !price ||
                      subscribeDisabled ||
                      user?.role !== "ADMIN" ||
                      checkoutPending)
                  }
                  onClick={() => void openCheckout(tier)}
                >
                  {!user
                    ? "Get started"
                    : checkoutPending
                      ? "Opening checkout…"
                      : `Choose ${tier.name}`}
                  <ArrowRight size={15} />
                </button>
                <ul className="plan-allowances">
                  {tier.capacity.map((item, index) => {
                    const Icon = [Building2, Users, ShieldCheck, Image][index];
                    return (
                      <li key={item}>
                        <Icon aria-hidden="true" />
                        {item}
                      </li>
                    );
                  })}
                </ul>
                <h3 className="plan-feature-heading">
                  {tier.name === "Starter"
                    ? "Your everyday essentials"
                    : tier.name === "Pro"
                      ? "Everything in Starter, plus"
                      : "Everything in Pro, plus"}
                </h3>
                <ul className="plan-features">
                  {tier.features
                    .filter((feature) => !feature.startsWith("Everything in"))
                    .map((feature) => (
                      <li key={feature}>
                        <Check aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                </ul>
              </article>
            );
          })}
          <EnterprisePlan current={currentPlan === "ADVANCED"} />
        </div>
        <div className="pricing-security">
          <ShieldCheck size={15} />
          Secure payments through Paddle. Choose monthly or yearly billing.
        </div>
        {subscribeDisabled && disabledMessage && (
          <p className="pricing-message">{disabledMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-5 border-y border-line py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink/65">
          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
          {previewCountry
            ? `Localized for ${previewCountry}`
            : "Localized automatically by Paddle"}
        </div>

        <div
          className="grid grid-cols-2 border border-ink bg-surface p-1"
          role="group"
          aria-label="Billing period"
        >
          {(["month", "year"] as BillingPeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setBillingPeriod(period)}
              aria-pressed={billingPeriod === period}
              className={cn(
                "min-w-28 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors",
                billingPeriod === period
                  ? "bg-ink text-surface"
                  : "text-ink hover:bg-ink/5",
              )}
            >
              {period === "month" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
      </div>

      {checkoutError ? (
        <p role="alert" className="mt-5 text-sm text-status-missed">
          {checkoutError}
        </p>
      ) : null}

      {paddleError ? (
        <div
          role="alert"
          className="mt-5 border border-status-missed bg-status-missed-bg px-4 py-3 text-sm text-status-missed"
        >
          {paddleError}
        </div>
      ) : null}

      <div className="mt-7 grid border-x border-t border-line lg:grid-cols-3">
        {TIERS.map((tier) => {
          const priceId = tier.priceId[billingPeriod];
          const current = currentPlan === planCode(tier);
          const inverted = tier.recommended;

          return (
            <article
              key={tier.name}
              className={cn(
                "relative flex min-h-full flex-col border-b border-line p-6 sm:p-7 lg:border-r lg:last:border-r-0",
                inverted ? "bg-ink text-surface" : "bg-surface text-ink",
              )}
            >
              <div className="flex min-h-6 items-center justify-between gap-3">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.2em]",
                    inverted ? "text-surface/65" : "text-ink/55",
                  )}
                >
                  {tier.recommended
                    ? "Recommended for teams"
                    : "Operating tier"}
                </span>
                {current ? (
                  <span
                    className={cn(
                      "border px-2 py-1 font-mono text-[10px] uppercase tracking-wider",
                      inverted ? "border-surface/30" : "border-ink/25",
                    )}
                  >
                    Current
                  </span>
                ) : null}
              </div>

              <h3 className="mt-6 font-heading text-3xl font-bold tracking-tight">
                {tier.name}
              </h3>
              <p
                className={cn(
                  "mt-2 min-h-12 text-sm leading-6",
                  inverted ? "text-surface/70" : "text-ink/65",
                )}
              >
                {tier.description}
              </p>

              <div
                className="mt-7 flex min-h-14 items-end gap-2"
                aria-live="polite"
              >
                {previewLoading ? (
                  <LoaderCircle
                    className="mb-2 h-6 w-6 animate-spin"
                    aria-label="Loading localized price"
                  />
                ) : (
                  <span className="font-heading text-4xl font-bold tracking-tight">
                    {prices[priceId] ?? "Unavailable"}
                  </span>
                )}
                {!previewLoading && prices[priceId] ? (
                  <span
                    className={cn(
                      "mb-1.5 text-sm",
                      inverted ? "text-surface/60" : "text-ink/55",
                    )}
                  >
                    / {billingPeriod}
                  </span>
                ) : null}
              </div>
              <p
                className={cn(
                  "mt-2 font-mono text-[11px] uppercase tracking-wider",
                  inverted ? "text-primary" : "text-status-complete",
                )}
              >
                7-day free trial
              </p>

              <Button
                type="button"
                disabled={
                  Boolean(user) &&
                  (!paddle ||
                    previewLoading ||
                    !prices[priceId] ||
                    subscribeDisabled ||
                    user?.role !== "ADMIN" ||
                    checkoutPending)
                }
                onClick={() => openCheckout(tier)}
                className={cn(
                  "mt-7 h-12 w-full rounded-[2px] border font-mono text-xs uppercase tracking-wider",
                  inverted
                    ? "border-surface bg-surface text-ink hover:bg-surface/90"
                    : "border-ink bg-primary text-surface hover:bg-primary/90",
                )}
              >
                {!user
                  ? "Create account to get started"
                  : checkoutPending
                    ? "Opening checkout…"
                    : previewLoading
                      ? "Loading price…"
                      : `Choose ${tier.name}`}
              </Button>

              <div
                className={cn(
                  "mt-7 border-t pt-5",
                  inverted ? "border-surface/20" : "border-line",
                )}
              >
                <p
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.18em]",
                    inverted ? "text-surface/55" : "text-ink/50",
                  )}
                >
                  Capacity
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm leading-6",
                    inverted ? "text-surface/80" : "text-ink/75",
                  )}
                >
                  {tier.capacity.join(" · ")}
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      "flex items-start gap-2.5 text-sm leading-5",
                      inverted ? "text-surface/80" : "text-ink/70",
                    )}
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
        <EnterprisePlan current={currentPlan === "ADVANCED"} />
      </div>

      <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-sm text-ink/60">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Secure checkout and localized totals are provided by Paddle.
        </p>
        {subscribeDisabled && disabledMessage ? (
          <p className="text-sm text-status-pending">{disabledMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
