import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parentPort } from "node:worker_threads";
import { takeCoverage } from "node:v8";

import { persist } from "../../../src/job-types/persist.mjs";

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

parentPort.on("message", function ({ drain }) {
  if (drain) {
    takeCoverage();
    process.exit(0);
  }
});
