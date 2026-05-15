import assert from "node:assert/strict";
import { test } from "node:test";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { WorkerNotRegisteredError } from "../src/libs/worker-not-registered-error.mjs";

test("child-process-registry kill-worker throws when worker not registered", function () {
  const registry = childProcessRegistry();

  assert.throws(
    function () {
      registry.killWorker("never-registered");
    },
    function (error) {
      return (
        error instanceof WorkerNotRegisteredError &&
        error.workerName === "never-registered"
      );
    },
  );
});
