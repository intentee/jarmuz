import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { spawner } from "../../../src/job-types/spawner.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

const pidScript = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "scripts",
  "write-pid-and-stay-alive.mjs",
);

spawner(async function ({ background, baseDirectory }) {
  background(
    process.execPath + " " + pidScript + " " + join(baseDirectory, "pid.txt"),
  );
});

exitWorkerOnDrain();
