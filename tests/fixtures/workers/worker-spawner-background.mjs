import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parentPort } from "node:worker_threads";
import { takeCoverage } from "node:v8";

import { spawner } from "../../../src/job-types/spawner.mjs";

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

parentPort.on("message", function ({ drain }) {
  if (drain) {
    takeCoverage();
    process.exit(0);
  }
});
