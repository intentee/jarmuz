import { appendFile } from "node:fs/promises";

import { spawner } from "../../../src/job-types/spawner.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

let alreadyBuilt = false;

spawner(async function ({ exec }) {
  if (alreadyBuilt) {
    return;
  }

  alreadyBuilt = true;

  const { stdout } = await exec("echo jarmuz-exec-output");

  await appendFile(process.env.JARMUZ_RESULT_FILE, stdout);
});

exitWorkerOnDrain();
