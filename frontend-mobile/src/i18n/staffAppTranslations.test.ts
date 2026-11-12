import assert from "node:assert/strict";
import test from "node:test";
import { launchUrdu } from "../launch/launchTranslations.ts";
import { staffAppUrdu } from "./staffAppTranslations.ts";
import { translate, translateText, urdu } from "./translations.ts";

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

test("staffAppUrdu has no key shared with urdu or launchUrdu", () => {
  for (const key of Object.keys(staffAppUrdu)) {
    assert.ok(!(key in urdu), `${key} is in urdu`);
    assert.ok(!(key in launchUrdu), `${key} is in launchUrdu`);
  }
});

test("every value is Urdu script and keeps placeholders", () => {
  for (const [key, value] of Object.entries(staffAppUrdu)) {
    assert.ok(value.trim().length > 0, key);
    assert.match(value, /[؀-ۿ]/, key);
    assert.deepEqual(placeholders(value), placeholders(key), key);
  }
});

test("lookup order and fallback", () => {
  assert.equal(translate("See my history", "ur"), staffAppUrdu["See my history"]);
  assert.equal(translateText("See my history", "ur"), staffAppUrdu["See my history"]);
  assert.equal(translate("Check in", "ur"), urdu["Check in"] ?? launchUrdu["Check in"]);
  assert.equal(translate("Totally unknown phrase", "ur"), "Totally unknown phrase");
  assert.equal(translate("See my history", "en"), "See my history");
});

test("required extra strings exist", () => {
  for (const k of ["Uploaded, checking", "Connection settings", "Server address", "Change server address", "Save address", "Hide connection settings", "Show connection settings", "Restart scanner", "Torch on", "Torch off", "Refresh results", "Results updated"]) {
    assert.notEqual(translate(k, "ur"), k, k);
  }
});

test("Part 2 history and profile strings are translated", () => {
  for (const k of ["No finished tasks this month.", "This task is not in your history.", "Manager", "No shifts yet", "No tasks yet", "No manager assigned", "Not set", "Figures could not load.", "On shift", "No shifts this month.", "Upcoming", "Sunday"]) {
    assert.notEqual(translate(k, "ur"), k, k);
  }
});
