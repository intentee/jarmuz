import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { spawnVictimProcess } from "./support/spawn-victim-process.mjs";

test("child-process-registry tolerates an already-dead PID", async function () {
  const victim = spawnVictimProcess();

  await once(victim, "spawn");
  assert.equal(typeof victim.pid, "number");

  const registry = childProcessRegistry();
  registry.registerWorker("worker-a");
  registry.addChild("worker-a", victim.pid);

  victim.kill("SIGKILL");
  await once(victim, "exit");

  registry.killWorker("worker-a");
});
