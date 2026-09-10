import { describe, expect, it } from "vitest";
import { subscriptionGrantsPaidAccess } from "./paddleFulfillment.service.js";

describe("subscriptionGrantsPaidAccess", () => {
  it.each(["active", "trialing", "ACTIVE", "TRIALING"])(
    "grants access for %s",
    (status) => expect(subscriptionGrantsPaidAccess(status)).toBe(true),
  );

  it.each(["canceled", "paused", "past_due"])(
    "does not grant access for %s",
    (status) => expect(subscriptionGrantsPaidAccess(status)).toBe(false),
  );
});
