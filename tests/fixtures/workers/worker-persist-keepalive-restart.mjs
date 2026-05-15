import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { persist } from "../../../src/job-types/persist.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

const appendAndExitScript = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "scripts",
  "append-and-exit.mjs",
);

let alreadyBuilt = false;

persist(async function ({ keepAlive }) {
  if (alreadyBuilt) {
    return;
  }

  alreadyBuilt = true;

  keepAlive(
    `${process.execPath} ${appendAndExitScript} ${process.env.JARMUZ_RESULT_FILE}`,
  );
});

exitWorkerOnDrain();
