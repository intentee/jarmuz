import assert from "node:assert/strict";
import { test } from "node:test";

import { managePipeline } from "../src/libs/manage-pipeline.mjs";
import { scheduler } from "../src/libs/scheduler.mjs";
import { WorkerNotRunningError } from "../src/libs/worker-not-running-error.mjs";

test("manage-pipeline callback throws when the target worker is not registered", async function () {
  const state = { pending: new Map(), workers: new Map() };
  const pipeline = managePipeline(state, scheduler(state), ["compile"]);

  const savedListeners = process.listeners("uncaughtException");

  process.removeAllListeners("uncaughtException");

  const error = await new Promise(function (resolve) {
    process.once("uncaughtException", resolve);

    pipeline.schedule("/project", "compile", "build-1");
  });

  for (const listener of savedListeners) {
    process.on("uncaughtException", listener);
  }

  assert.ok(error instanceof WorkerNotRunningError);
  assert.equal(error.workerName, "compile");
});
