import assert from "node:assert/strict";
import { test } from "node:test";

import { runWorkerBuild } from "./support/run-worker-build.mjs";

test("command reports failure when the command exits with a non-zero code", async function () {
  const message = await runWorkerBuild("worker-command-failure", {
    baseDirectory: "/tmp",
    buildId: "build-1",
    name: "lint",
  });

  assert.equal(message.success, false);
});
