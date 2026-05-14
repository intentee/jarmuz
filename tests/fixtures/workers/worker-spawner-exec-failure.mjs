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

  try {
    await exec("false");
    await appendFile(process.env.JARMUZ_RESULT_FILE, "resolved");
  } catch (error) {
    await appendFile(
      process.env.JARMUZ_RESULT_FILE,
      error instanceof Error ? "rejected" : "rejected-non-error",
    );
  }
});

parentPort.on("message", function ({ drain }) {
  if (drain) {
    takeCoverage();
    process.exit(0);
  }
});
