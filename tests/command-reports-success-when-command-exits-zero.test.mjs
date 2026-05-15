import assert from "node:assert/strict";
import { test } from "node:test";

import { runWorkerBuild } from "./support/run-worker-build.mjs";

test("command reports success when the command exits zero", async function () {
  const message = await runWorkerBuild("worker-command-success", {
    baseDirectory: "/tmp",
    buildId: "build-1",
    name: "lint",
  });

  assert.equal(message.success, true);
});
