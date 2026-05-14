import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { keepWorkerAlive } from "../src/libs/keep-worker-alive.mjs";

test("keepWorkerAlive stops the worker and rejects posting after terminate", async function () {
  const handle = keepWorkerAlive({
    path: fileURLToPath(
      new URL("./fixtures/workers/worker-echo.mjs", import.meta.url),
    ),
    onMessage: function () {},
  });

  await handle.terminate();

  assert.throws(
    function () {
      handle.postMessage({ ping: "hello" });
    },
    { message: "Worker(worker-echo) is terminated" },
  );
});
