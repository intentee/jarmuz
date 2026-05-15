import assert from "node:assert/strict";
import { test } from "node:test";

import { scheduler } from "../src/libs/scheduler.mjs";

test("scheduler runs a uniquely scheduled callback after the debounce window", async function () {
  const state = { pending: new Map() };
  const schedule = scheduler(state);

  await new Promise(function (resolve) {
    schedule.debounce("compile", resolve);
  });

  assert.equal(state.pending.has("compile"), true);
});
