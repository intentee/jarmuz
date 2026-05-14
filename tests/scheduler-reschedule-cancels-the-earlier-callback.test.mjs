import assert from "node:assert/strict";
import { test } from "node:test";

import { scheduler } from "../src/libs/scheduler.mjs";

test("scheduler reschedule cancels the earlier callback so only the latest runs", async function () {
  const state = { pending: new Map() };
  const schedule = scheduler(state);

  let firstCallbackRan = false;

  schedule.unique("compile", function () {
    firstCallbackRan = true;
  });

  await new Promise(function (resolve) {
    schedule.unique("compile", resolve);
  });

  assert.equal(firstCallbackRan, false);
});
