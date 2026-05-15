import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { persist } from "../../../src/job-types/persist.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

const pidScript = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "scripts",
  "write-pid-and-stay-alive.mjs",
);

persist(async function ({ keepAlive, baseDirectory }) {
  keepAlive(`${process.execPath} ${pidScript} ${join(baseDirectory, "pid.txt")}`);
});

exitWorkerOnDrain();
