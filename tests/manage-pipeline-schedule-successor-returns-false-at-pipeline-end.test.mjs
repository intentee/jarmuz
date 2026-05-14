import assert from "node:assert/strict";
import { test } from "node:test";

import { managePipeline } from "../src/libs/manage-pipeline.mjs";
import { scheduler } from "../src/libs/scheduler.mjs";

test("manage-pipeline scheduleSuccessor returns false at the end of the pipeline", function () {
  const state = { pending: new Map(), workers: new Map() };
  const pipeline = managePipeline(state, scheduler(state), [
    "compile",
    "bundle",
  ]);

  assert.equal(
    pipeline.scheduleSuccessor("/project", "build-1", "bundle"),
    false,
  );
});
