import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { keepWorkerAlive } from "../src/libs/keep-worker-alive.mjs";
import { TerminatedWorkerError } from "../src/libs/terminated-worker-error.mjs";

test("keepWorkerAlive stops the worker and rejects posting after terminate", async function () {
  const handle = keepWorkerAlive({
    path: fileURLToPath(
      new URL("./fixtures/workers/worker-echo.mjs", import.meta.url),
    ),
    onMessage: function () {},
    registry: childProcessRegistry(),
  });

  await handle.terminate();

  assert.throws(
    function () {
      handle.postMessage({
        baseDirectory: "/tmp",
        buildId: "build-1",
        name: "worker-echo",
      });
    },
    function (error) {
      return (
        error instanceof TerminatedWorkerError &&
        error.workerName === "worker-echo"
      );
    },
  );
});
