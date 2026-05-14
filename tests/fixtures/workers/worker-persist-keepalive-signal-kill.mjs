import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parentPort } from "node:worker_threads";
import { takeCoverage } from "node:v8";

import { persist } from "../../../src/job-types/persist.mjs";

const appendAndSelfKillScript = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "scripts",
  "append-and-self-kill.mjs",
);

let alreadyBuilt = false;

persist(async function ({ keepAlive }) {
  if (alreadyBuilt) {
    return;
  }

  alreadyBuilt = true;

  keepAlive(
    `${process.execPath} ${appendAndSelfKillScript} ${process.env.JARMUZ_RESULT_FILE}`,
  );
});

parentPort.on("message", function ({ drain }) {
  if (drain) {
    takeCoverage();
    process.exit(0);
  }
});
