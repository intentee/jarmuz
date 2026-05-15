import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { spawnVictimProcess } from "./support/spawn-victim-process.mjs";

test("child-process-registry kill-worker kills only that worker's PIDs", async function (t) {
  const victimA1 = spawnVictimProcess();
  const victimA2 = spawnVictimProcess();
  const victimB = spawnVictimProcess();

  t.after(function () {
    victimA1.kill("SIGKILL");
    victimA2.kill("SIGKILL");
    victimB.kill("SIGKILL");
  });

  await Promise.all([
    once(victimA1, "spawn"),
    once(victimA2, "spawn"),
    once(victimB, "spawn"),
  ]);
  assert.equal(typeof victimA1.pid, "number");
  assert.equal(typeof victimA2.pid, "number");
  assert.equal(typeof victimB.pid, "number");

  const registry = childProcessRegistry();
  registry.registerWorker("worker-a");
  registry.registerWorker("worker-b");
  registry.addChild("worker-a", victimA1.pid);
  registry.addChild("worker-a", victimA2.pid);
  registry.addChild("worker-b", victimB.pid);

  registry.killWorker("worker-a");

  await Promise.all([once(victimA1, "exit"), once(victimA2, "exit")]);
  assert.equal(victimA1.signalCode, "SIGTERM");
  assert.equal(victimA2.signalCode, "SIGTERM");
  assert.equal(victimB.exitCode, null);
  assert.equal(victimB.signalCode, null);
});
