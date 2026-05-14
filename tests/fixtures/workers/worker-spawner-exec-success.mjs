import { appendFile } from "node:fs/promises";
import { parentPort } from "node:worker_threads";
import { takeCoverage } from "node:v8";

import { spawner } from "../../../src/job-types/spawner.mjs";

let alreadyBuilt = false;

spawner(async function ({ exec }) {
  if (alreadyBuilt) {
    return;
  }

  alreadyBuilt = true;

  const { stdout } = await exec("echo jarmuz-exec-output");

  await appendFile(process.env.JARMUZ_RESULT_FILE, stdout);
});

parentPort.on("message", function ({ drain }) {
  if (drain) {
    takeCoverage();
    process.exit(0);
  }
});
