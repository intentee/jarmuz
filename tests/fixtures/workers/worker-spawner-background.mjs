import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { spawner } from "../../../src/job-types/spawner.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

const touchAndExitScript = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "scripts",
  "touch-and-exit.mjs",
);

let alreadyBuilt = false;

spawner(async function ({ background }) {
  if (alreadyBuilt) {
    return;
  }

  alreadyBuilt = true;

  background(
    `${process.execPath} ${touchAndExitScript} ${process.env.JARMUZ_MARKER_FILE}`,
  );
});

exitWorkerOnDrain();
