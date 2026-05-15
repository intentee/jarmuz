import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { keepWorkerAlive } from "../src/libs/keep-worker-alive.mjs";

test("keepWorkerAlive delivers a posted message to the worker", async function (t) {
  const received = new Promise(function (resolve) {
    const handle = keepWorkerAlive({
      path: fileURLToPath(
        new URL("./fixtures/workers/worker-echo.mjs", import.meta.url),
      ),
      onMessage: resolve,
      registry: childProcessRegistry(),
    });

    t.after(function () {
      return handle.terminate();
    });

    handle.postMessage({
      baseDirectory: "/tmp",
      buildId: "build-1",
      name: "worker-echo",
    });
  });

  assert.deepEqual(await received, {
    baseDirectory: "/tmp",
    buildId: "build-1",
    name: "worker-echo",
  });
});
