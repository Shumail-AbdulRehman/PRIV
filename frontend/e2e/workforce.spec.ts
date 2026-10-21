import { test, expect, fixture, backend, enter, login, sql } from "./fixtures";
test.use({ trace: "off", screenshot: "off", video: "off" });
async function access(page: import("@playwright/test").Page, key: string) {
  await enter(page, `/staff/${fixture.staff[key].id}`);
  await page
    .getByRole("button", { name: "Staff access", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
test("staff transfer UI persists, retains history and hides site-A rows from manager-B", async ({
  page,
  browser,
}) => {
  await access(page, "transfer");
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Action", exact: true })
    .selectOption("transfer");
  await dialog
    .getByRole("combobox", { name: "Destination site", exact: true })
    .selectOption(String(fixture.site.B));
  await dialog
    .getByLabel("Reason", { exact: true })
    .fill("E2E reasoned site transfer");
  await dialog.getByRole("button", { name: "Confirm access change" }).click();
  await expect(dialog).not.toBeVisible();
  expect(
    (
      await sql('SELECT "locationId" FROM "Staff" WHERE id=$1', [
        fixture.staff.transfer.id,
      ])
    )[0].locationId,
  ).toBe(fixture.site.B);
  expect(
    (
      await sql('SELECT "locationId" FROM "Attendance" WHERE id=$1', [
        fixture.attendance.transfer,
      ])
    )[0].locationId,
  ).toBe(fixture.site.A);
  expect(
    await sql('SELECT id FROM "TaskInstance" WHERE id=$1', [
      fixture.task.transfer,
    ]),
  ).toHaveLength(1);
  const isolated = await browser.newContext();
  try {
    await login(isolated.request, "managerB");
    const response = await isolated.request.get(
      backend + `/api/staff/details/${fixture.staff.transfer.id}`,
    );
    expect(response.status()).toBe(200);
    expect(JSON.stringify(await response.json())).not.toContain(
      "E2E history transfer",
    );
    expect(
      (
        await isolated.request.get(
          backend +
            `/api/attendance/${fixture.attendance.transfer}/annotations`,
        )
      ).status(),
    ).toBe(403);
  } finally {
    await isolated.close();
  }
});
test("open-shift transfer conflict retains UI draft and does not change site", async ({
  page,
}) => {
  await access(page, "openShift");
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Action", exact: true })
    .selectOption("transfer");
  await dialog
    .getByRole("combobox", { name: "Destination site", exact: true })
    .selectOption(String(fixture.site.B));
  await dialog
    .getByLabel("Reason", { exact: true })
    .fill("Keep conflict reason");
  await dialog.getByRole("button", { name: "Confirm access change" }).click();
  await expect(dialog.getByRole("alert")).toContainText("a shift is open");
  await expect(dialog.getByLabel("Reason", { exact: true })).toHaveValue(
    "Keep conflict reason",
  );
  expect(
    (
      await sql('SELECT "locationId" FROM "Staff" WHERE id=$1', [
        fixture.staff.openShift.id,
      ])
    )[0].locationId,
  ).toBe(fixture.site.A);
});
for (const action of ["deactivate", "archive"])
  test(`${action} UI revokes a live staff session and preserves historical records`, async ({
    page,
    browser,
  }) => {
    const staffContext = await browser.newContext();
    try {
      await login(staffContext.request, action);
      expect(
        (
          await staffContext.request.get(backend + "/api/staff/profile/me")
        ).status(),
      ).toBe(200);
      await access(page, action);
      const dialog = page.getByRole("dialog");
      await dialog
        .getByRole("combobox", { name: "Action", exact: true })
        .selectOption(action);
      await dialog
        .getByLabel("Reason", { exact: true })
        .fill(`E2E ${action} history preservation`);
      await dialog
        .getByRole("button", { name: "Confirm access change" })
        .click();
      await expect(dialog).not.toBeVisible();
      expect(
        (
          await sql('SELECT "isActive" FROM "Staff" WHERE id=$1', [
            fixture.staff[action].id,
          ])
        )[0].isActive,
      ).toBe(false);
      expect(
        (
          await staffContext.request.get(backend + "/api/staff/profile/me")
        ).status(),
      ).toBe(403);
      expect(
        await sql('SELECT id FROM "Attendance" WHERE id=$1', [
          fixture.attendance[action],
        ]),
      ).toHaveLength(1);
      expect(
        await sql('SELECT id FROM "TaskInstance" WHERE id=$1', [
          fixture.task[action],
        ]),
      ).toHaveLength(1);
    } finally {
      await staffContext.close();
    }
  });
