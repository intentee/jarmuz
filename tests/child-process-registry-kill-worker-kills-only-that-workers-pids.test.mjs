import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { spawnIdleProcess } from "./support/spawn-idle-process.mjs";

test("child-process-registry kill-worker kills only that worker's PIDs", async function (t) {
  const idleProcessA1 = spawnIdleProcess();
  const idleProcessA2 = spawnIdleProcess();
  const idleProcessB = spawnIdleProcess();

  t.after(function () {
    idleProcessA1.kill("SIGKILL");
    idleProcessA2.kill("SIGKILL");
    idleProcessB.kill("SIGKILL");
  });

  await Promise.all([
    once(idleProcessA1, "spawn"),
    once(idleProcessA2, "spawn"),
    once(idleProcessB, "spawn"),
  ]);
  assert.equal(typeof idleProcessA1.pid, "number");
  assert.equal(typeof idleProcessA2.pid, "number");
  assert.equal(typeof idleProcessB.pid, "number");

  const registry = childProcessRegistry();
  registry.registerWorker("worker-a");
  registry.registerWorker("worker-b");
  registry.addChild("worker-a", idleProcessA1.pid);
  registry.addChild("worker-a", idleProcessA2.pid);
  registry.addChild("worker-b", idleProcessB.pid);

  registry.killWorker("worker-a");

  await Promise.all([
    once(idleProcessA1, "exit"),
    once(idleProcessA2, "exit"),
  ]);
  assert.equal(idleProcessA1.signalCode, "SIGTERM");
  assert.equal(idleProcessA2.signalCode, "SIGTERM");
  assert.equal(idleProcessB.exitCode, null);
  assert.equal(idleProcessB.signalCode, null);
});
