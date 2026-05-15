import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { spawnVictimProcess } from "./support/spawn-victim-process.mjs";

test("child-process-registry kill-all kills every tracked PID", async function (t) {
  const victimA = spawnVictimProcess();
  const victimB = spawnVictimProcess();

  t.after(function () {
    victimA.kill("SIGKILL");
    victimB.kill("SIGKILL");
  });

  await Promise.all([once(victimA, "spawn"), once(victimB, "spawn")]);
  assert.equal(typeof victimA.pid, "number");
  assert.equal(typeof victimB.pid, "number");

  const registry = childProcessRegistry();
  registry.registerWorker("worker-a");
  registry.registerWorker("worker-b");
  registry.addChild("worker-a", victimA.pid);
  registry.addChild("worker-b", victimB.pid);

  registry.killAll();

  await Promise.all([once(victimA, "exit"), once(victimB, "exit")]);
  assert.equal(victimA.signalCode, "SIGTERM");
  assert.equal(victimB.signalCode, "SIGTERM");
});
