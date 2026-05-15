import { test } from "node:test";

import { runPersistRestartScenario } from "./support/run-persist-restart-scenario.mjs";

test("persist keepAlive starts a process and restarts it after it exits", async function (t) {
  await runPersistRestartScenario(t, "worker-persist-keepalive-restart");
});
