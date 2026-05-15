import { test } from "node:test";

import { runPersistRestartScenario } from "./support/run-persist-restart-scenario.mjs";

test("persist keepAlive restarts a process that is killed by a signal", async function (t) {
  await runPersistRestartScenario(t, "worker-persist-keepalive-signal-kill");
});
