import assert from "node:assert/strict";
import { test } from "node:test";

import { runWorkerBuild } from "./support/run-worker-build.mjs";

test("basic reports failure when the build function throws", async function () {
  const message = await runWorkerBuild("worker-basic-throws", {
    baseDirectory: "/tmp",
    buildId: "build-1",
    name: "stylesheet",
  });

  assert.deepEqual(message, {
    baseDirectory: "/tmp",
    buildId: "build-1",
    success: false,
  });
});
