import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { spawnIdleProcess } from "./support/spawn-idle-process.mjs";

test("child-process-registry kill-all kills every tracked PID", async function (t) {
  const idleProcessA = spawnIdleProcess();
  const idleProcessB = spawnIdleProcess();

  t.after(function () {
    idleProcessA.kill("SIGKILL");
    idleProcessB.kill("SIGKILL");
  });

  await Promise.all([once(idleProcessA, "spawn"), once(idleProcessB, "spawn")]);
  assert.equal(typeof idleProcessA.pid, "number");
  assert.equal(typeof idleProcessB.pid, "number");

  const registry = childProcessRegistry();
  registry.registerWorker("worker-a");
  registry.registerWorker("worker-b");
  registry.addChild("worker-a", idleProcessA.pid);
  registry.addChild("worker-b", idleProcessB.pid);

  registry.killAll();

  await Promise.all([once(idleProcessA, "exit"), once(idleProcessB, "exit")]);
  assert.equal(idleProcessA.signalCode, "SIGTERM");
  assert.equal(idleProcessB.signalCode, "SIGTERM");
});
