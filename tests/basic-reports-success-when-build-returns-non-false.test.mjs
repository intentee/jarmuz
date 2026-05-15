import assert from "node:assert/strict";
import { test } from "node:test";

import { runWorkerBuild } from "./support/run-worker-build.mjs";

test("basic reports success when the build function returns a non-false value", async function () {
  const message = await runWorkerBuild("worker-basic-returns-undefined", {
    baseDirectory: "/tmp",
    buildId: "build-1",
    name: "stylesheet",
  });

  assert.deepEqual(message, {
    baseDirectory: "/tmp",
    buildId: "build-1",
    success: true,
  });
});
