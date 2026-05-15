import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { keepWorkerAlive } from "../src/libs/keep-worker-alive.mjs";
import { managePipeline } from "../src/libs/manage-pipeline.mjs";
import { scheduler } from "../src/libs/scheduler.mjs";

test("manage-pipeline callback posts the build message to the registered worker", async function (t) {
  const state = { pending: new Map(), workers: new Map() };
  const pipeline = managePipeline(state, scheduler(state), ["compile"]);

  const received = new Promise(function (resolve) {
    const echoWorker = keepWorkerAlive({
      path: fileURLToPath(
        new URL("./fixtures/workers/worker-echo.mjs", import.meta.url),
      ),
      onMessage: resolve,
      registry: childProcessRegistry(),
    });

    t.after(function () {
      echoWorker.terminate();
    });

    state.workers.set("compile", echoWorker);
  });

  pipeline.schedule("/project", "compile", "build-1");

  assert.deepEqual(await received, {
    baseDirectory: "/project",
    buildId: "build-1",
    name: "compile",
  });
});
