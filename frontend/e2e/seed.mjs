import { writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
// Reuse the real Prisma adapter; dotenv sees only the clean worktree and sanitized child env.
const require = createRequire(
  new URL("../../backend/package.json", import.meta.url),
);
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const hash = require("bcrypt");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const password = randomBytes(20).toString("base64url"),
  encrypted = await hash.hash(password, 10),
  now = new Date(),
  yesterday = new Date(+now - 86400000);
const fixture = {
  password,
  company: {},
  site: {},
  users: {},
  staff: {},
  attendance: {},
  task: {},
};
try {
  for (const key of ["A", "B"]) {
    const company = await db.company.create({
      data: { name: `E2E company ${key}` },
    });
    fixture.company[key] = company.id;
    const customerId = `ctm_e2e_${key}`,
      subscriptionId = `sub_e2e_${key}`;
    await db.paddleCustomer.create({
      data: {
        id: customerId,
        companyId: company.id,
        status: "active",
        paddleUpdatedAt: now,
        lastEventAt: now,
      },
    });
    await db.paddleSubscription.create({
      data: {
        id: subscriptionId,
        customerId,
        companyId: company.id,
        status: "active",
        priceId: "pri_00000000000000000000000001",
        productId: "pro_e2e",
        currentBillingPeriodStart: new Date(+now - 86400000),
        currentBillingPeriodEnd: new Date(+now + 86400000),
        paddleUpdatedAt: now,
        lastEventAt: now,
      },
    });
    await db.company.update({
      where: { id: company.id },
      data: {
        billingCustomerId: customerId,
        billingSubscriptionId: subscriptionId,
      },
    });
    const owner = await db.manager.create({
      data: {
        name: `E2E owner ${key}`,
        email: `owner-${key.toLowerCase()}@example.invalid`,
        password: encrypted,
        companyId: company.id,
        role: "ADMIN",
        emailVerifiedAt: now,
      },
    });
    fixture.users["owner" + key] = { id: owner.id, email: owner.email };
  }
  for (const key of ["A", "B", "foreign"]) {
    const location = await db.location.create({
      data: {
        companyId: key === "foreign" ? fixture.company.B : fixture.company.A,
        name: `E2E site ${key}`,
        address: "Synthetic test location",
        latitude: "31",
        longitude: "74",
        timezone: "Asia/Karachi",
      },
    });
    fixture.site[key] = location.id;
  }
  for (const key of ["A", "B"]) {
    const user = await db.manager.create({
      data: {
        companyId: fixture.company.A,
        name: `E2E manager ${key}`,
        email: `manager-${key.toLowerCase()}@example.invalid`,
        password: encrypted,
        role: "MANAGER",
        assignedLocations: { create: { locationId: fixture.site[key] } },
      },
    });
    fixture.users["manager" + key] = { id: user.id, email: user.email };
  }
  for (const [key, site] of [
    ["transfer", "A"],
    ["deactivate", "A"],
    ["archive", "A"],
    ["openShift", "A"],
    ["recovery", "A"],
    ["legacy", "A"],
    ["foreign", "foreign"],
  ]) {
    const companyId = key === "foreign" ? fixture.company.B : fixture.company.A;
    const row = await db.staff.create({
      data: {
        name: `E2E staff ${key}`,
        email: `staff-${key.toLowerCase()}@example.invalid`,
        password: encrypted,
        companyId,
        locationId: fixture.site[site],
      },
    });
    fixture.staff[key] = { id: row.id, email: row.email };
    const attendance = await db.attendance.create({
      data: {
        staffId: row.id,
        locationId: fixture.site[site],
        date: key === "openShift" ? now : yesterday,
        expectedStart: new Date(
          +(key === "openShift" ? now : yesterday) - 3600000,
        ),
        expectedEnd: new Date(
          +(key === "openShift" ? now : yesterday) + 3600000,
        ),
        checkInTime: key === "openShift" ? new Date(+now - 60000) : yesterday,
        checkOutTime:
          key === "openShift" ? null : new Date(+yesterday + 1800000),
        status: key === "openShift" ? "CHECKED_IN" : "CHECKED_OUT",
        checkInImage:
          key === "legacy"
            ? "https://res.cloudinary.com/fictional/image/upload/v1/attendance-selfies/held.jpg"
            : `attendance:v1:${companyId}:${row.id}:${randomUUID()}`,
      },
    });
    fixture.attendance[key] = attendance.id;
    const task = await db.taskInstance.create({
      data: {
        title: `E2E history ${key}`,
        staffId: row.id,
        locationId: fixture.site[site],
        date: yesterday,
        shiftStart: yesterday,
        shiftEnd: new Date(+yesterday + 3600000),
        startedAt: yesterday,
        completedAt: new Date(+yesterday + 1800000),
        status: "COMPLETED",
      },
    });
    fixture.task[key] = task.id;
  }
  for (const key of ["oldForeign", "newForeign"]) {
    const user = await db.manager.create({
      data: {
        companyId: fixture.company.B,
        name: `E2E manager ${key}`,
        email: `manager-${key.toLowerCase()}@example.invalid`,
        password: encrypted,
        role: "MANAGER",
        ...(key === "oldForeign"
          ? {
              assignedLocations: {
                create: { locationId: fixture.site.foreign },
              },
            }
          : {}),
      },
    });
    fixture.users[key] = { id: user.id, email: user.email };
  }
  const area = await db.area.create({
    data: {
      locationId: fixture.site.A,
      name: "E2E review room",
      roomType: "WASHROOM",
      status: "ACTIVE",
    },
  });
  const item = await db.areaItem.create({
    data: {
      areaId: area.id,
      stableCode: "E2E-SINK",
      displayName: "E2E sink",
      fixtureType: "SINK",
      sequence: 1,
      rubricKey: "sink",
      requiredViews: ["basin"],
    },
  });
  const task = await db.taskInstance.create({
    data: {
      title: "E2E missing-photo review",
      staffId: fixture.staff.recovery.id,
      locationId: fixture.site.A,
      areaId: area.id,
      verificationVersion: 2,
      areaNameSnapshot: area.name,
      inventoryVersion: 1,
      policySnapshot: { version: 1 },
      date: now,
      shiftStart: new Date(+now - 3600000),
      shiftEnd: new Date(+now + 3600000),
      startedAt: new Date(+now - 1800000),
      status: "IN_PROGRESS",
      verificationDeadline: new Date(+now + 3600000),
      uploadDeadline: new Date(+now + 3600000),
    },
  });
  const snapshot = await db.taskVerificationItem.create({
    data: {
      taskInstanceId: task.id,
      areaId: area.id,
      sourceAreaItemId: item.id,
      itemCodeSnapshot: "E2E-SINK",
      nameSnapshot: "E2E sink",
      typeSnapshot: "SINK",
      orderSnapshot: 1,
      identificationSnapshot: {},
      rubricSnapshot: { version: 1 },
    },
  });
  await db.taskEvidenceRequirement.create({
    data: {
      taskVerificationItemId: snapshot.id,
      viewKey: "basin",
      instructionsSnapshot: "Show the sink basin",
      state: "MISSING",
    },
  });
  const review = await db.verificationException.create({
    data: {
      companyId: fixture.company.A,
      locationId: fixture.site.A,
      areaId: area.id,
      taskInstanceId: task.id,
      kind: "TASK",
      dedupeKey: `task:${task.id}`,
    },
  });
  await db.verificationIssue.create({
    data: {
      exceptionId: review.id,
      dedupeKey: "missing-e2e",
      reasonCode: "MISSING_EVIDENCE",
      recommendedAction: "UPLOAD_REQUIRED_PHOTO",
    },
  });
  fixture.review = { id: review.id, taskId: task.id };
  await writeFile(process.env.HYGENE_E2E_MANIFEST, JSON.stringify(fixture), {
    mode: 0o600,
  });
} finally {
  await db.$disconnect();
}
