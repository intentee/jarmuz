import { appendFile } from "node:fs/promises";

import { spawner } from "../../../src/job-types/spawner.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

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

exitWorkerOnDrain();
