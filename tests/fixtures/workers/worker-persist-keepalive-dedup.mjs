import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { persist } from "../../../src/job-types/persist.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

const createLockScript = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "scripts",
  "create-lock-or-report.mjs",
);

let alreadyBuilt = false;

persist(async function ({ keepAlive }) {
  if (alreadyBuilt) {
    return;
  }

  alreadyBuilt = true;

  const exec =
    `${process.execPath} ${createLockScript} ` +
    `${process.env.JARMUZ_LOCK_FILE} ` +
    `${process.env.JARMUZ_RESULT_FILE} ` +
    `${process.env.JARMUZ_PID_FILE}`;

  keepAlive(exec);
  keepAlive(exec);
});

exitWorkerOnDrain();
