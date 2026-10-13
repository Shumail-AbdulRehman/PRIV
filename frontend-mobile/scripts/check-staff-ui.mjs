// Browser layout checks for an exported Expo web bundle. Camera/GPS remain device tests.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const output = process.env.UI_SCREENSHOTS || "/tmp/priv-staff-browser";
await mkdir(output, { recursive: true });
const user = {
  id: 1,
  name: "Ayesha Khan",
  email: "ayesha@example.test",
  role: "STAFF",
  companyId: 1,
  locationId: 1,
};
const now = new Date();
const start = new Date(+now - 60 * 60 * 1000).toISOString();
const end = new Date(+now + 5 * 60 * 60 * 1000).toISOString();
const location = { id: 1, name: "Gulberg office", timezone: "Asia/Karachi" };
const task = {
  id: 7,
  title: "Morning cleaning",
  areaNameSnapshot: "Ground floor washroom",
  status: "PENDING",
  verificationVersion: 2,
  location,
  shiftStart: start,
  shiftEnd: end,
};
try {
  for (const language of ["en", "ur"]) {
    for (const width of [390,320]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(
      ({ user, language }) => {
        localStorage.setItem(
          "@cleanops-staff/auth",
          JSON.stringify({
            user,
            accessToken: "fabricated",
            refreshToken: "fabricated",
          }),
        );
        localStorage.setItem("hygene-ops.language", language);
      },
      { user, language },
    );
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (!url.pathname.startsWith("/api/")) return route.continue();
      let data = [];
      if (url.pathname.endsWith("/get-current-user")) data = user;
      else if (url.pathname.endsWith("/attendance/my"))
        data = [
          {
            id: 1,
            staffId: 1,
            locationId: 1,
            date: now.toISOString(),
            expectedStart: start,
            expectedEnd: end,
            status: "CHECKED_IN",
            checkInTime: start,
            checkOutTime: null,
            location,
          },
        ];
      else if (url.pathname.endsWith("/verification-work"))
        data = { tasks: [], nextCursor: null };
      else if (url.pathname.endsWith("/today")) data = [task];
      else if (url.pathname.endsWith("/task-instance/7")) data = task;
      return route.fulfill({
        headers: {
          "Access-Control-Allow-Origin": "http://127.0.0.1:5180",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers":
            "authorization,content-type,x-app-version",
        },
        contentType: "application/json",
        body: JSON.stringify({ success: true, data }),
      });
    });
    await page.goto(process.env.UI_BASE_URL || "http://127.0.0.1:5180");
    await page.getByText("Ground floor washroom", { exact: true }).waitFor();
    await page.getByText("Gulberg office", { exact: true }).waitFor();
    await page.screenshot({
      path: `${output}/staff-home-${language}-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button",{name:language === "ur" ? "شفٹ کی تفصیل" : "Shift details",exact:true}).click();
    await page.getByText(language === "ur" ? "شفٹ" : "Shift",{exact:true}).last().waitFor();
    await page.getByRole("button",{name:language === "ur" ? "شفٹ کی تفصیل" : "Shift details",exact:true}).click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Home must fit the viewport');
    await page.evaluate(()=>{window.__textStyles=[...document.querySelectorAll('[dir]')].map(element=>[element,element.getAttribute('style')]);for(const [element] of window.__textStyles){const style=getComputedStyle(element);element.style.fontSize=`${parseFloat(style.fontSize)*1.3}px`;if(style.lineHeight!=='normal')element.style.lineHeight=`${parseFloat(style.lineHeight)*1.3}px`;}});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Enlarged home text must fit the viewport');
    await page.screenshot({path:`${output}/staff-home-large-${language}-${width}.png`,fullPage:true});
    await page.evaluate(()=>{for(const [element,style]of window.__textStyles){if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);}delete window.__textStyles;});
    await page
      .getByRole("tab", {
        name: language === "ur" ? "کام" : "Tasks",
        exact: true,
      })
      .click();
    await page
      .getByText(language === "ur" ? "آج کے کام" : "Today’s tasks", {
        exact: true,
      })
      .last().waitFor();
    await page.screenshot({
      path: `${output}/staff-tasks-${language}-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", {name:language === "ur" ? "صفائی شروع کریں" : "Start cleaning",exact:true}).last().click();
    await page.getByText("Cleaning task",{exact:true}).or(page.getByText("صفائی کا کام",{exact:true})).waitFor();
    await page.screenshot({path:`${output}/staff-start-${language}-${width}.png`,fullPage:true});
    await page.getByRole("button",{name:language === "ur" ? "کام کی فہرست پر واپس" : "Back to tasks",exact:true}).click();
    await page
      .getByRole("tab", {
        name: language === "ur" ? "مدد اور اکاؤنٹ" : "Help & account",
        exact: true,
      })
      .click();
    await page.getByText("ayesha@example.test", { exact: true }).waitFor();
    await page.screenshot({
      path: `${output}/staff-help-${language}-${width}.png`,
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(`PASS: staff home, tasks, help in ${language}, no page errors`);
    await context.close();
    }
  }
} finally {
  await browser.close();
}
