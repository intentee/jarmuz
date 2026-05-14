import assert from "node:assert/strict";
import { test } from "node:test";

import { managePipeline } from "../src/libs/manage-pipeline.mjs";
import { scheduler } from "../src/libs/scheduler.mjs";

test("manage-pipeline schedule skips when an earlier pipeline job is pending", function () {
  const state = { pending: new Map(), workers: new Map() };
  const schedule = scheduler(state);
  const pipeline = managePipeline(state, schedule, ["compile", "bundle"]);

  schedule.unique("compile", function () {});

  pipeline.schedule("/project", "bundle", "build-1");

  assert.equal(state.pending.has("bundle"), false);
});
