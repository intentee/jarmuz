import assert from "node:assert/strict";
import { test } from "node:test";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { WorkerAlreadyRegisteredError } from "../src/libs/worker-already-registered-error.mjs";

test("child-process-registry register-worker throws on duplicate", function () {
  const registry = childProcessRegistry();

  registry.registerWorker("worker-a");

  assert.throws(
    function () {
      registry.registerWorker("worker-a");
    },
    function (error) {
      return (
        error instanceof WorkerAlreadyRegisteredError &&
        error.workerName === "worker-a"
      );
    },
  );
});
