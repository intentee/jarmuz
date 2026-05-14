import assert from "node:assert/strict";
import { test } from "node:test";

import { managePipeline } from "../src/libs/manage-pipeline.mjs";
import { scheduler } from "../src/libs/scheduler.mjs";

test("manage-pipeline callback drops the job when a predecessor becomes pending during the debounce", async function () {
  const state = { pending: new Map(), workers: new Map() };
  const schedule = scheduler(state);
  const pipeline = managePipeline(state, schedule, ["compile", "bundle"]);

  pipeline.schedule("/project", "bundle", "build-1");

  assert.equal(state.pending.has("bundle"), true);

  schedule.unique("compile", function () {});

  await new Promise(function (resolve) {
    schedule.unique("debounce-sentinel", resolve);
  });

  assert.equal(state.pending.has("bundle"), false);
});
