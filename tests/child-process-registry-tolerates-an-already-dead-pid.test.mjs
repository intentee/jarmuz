import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { spawnIdleProcess } from "./support/spawn-idle-process.mjs";

test("child-process-registry tolerates an already-dead PID", async function () {
  const idleProcess = spawnIdleProcess();

  await once(idleProcess, "spawn");
  assert.equal(typeof idleProcess.pid, "number");

  const registry = childProcessRegistry();
  registry.registerWorker("worker-a");
  registry.addChild("worker-a", idleProcess.pid);

  idleProcess.kill("SIGKILL");
  await once(idleProcess, "exit");

  registry.killWorker("worker-a");
});
