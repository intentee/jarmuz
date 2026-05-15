import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { takeCoverage } from "node:v8";

import { spawner } from "../../../src/job-types/spawner.mjs";

const stayAliveScript = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "scripts",
  "write-pid-and-stay-alive.mjs",
);

let buildCount = 0;

spawner(async function ({ background }) {
  buildCount += 1;

  if (buildCount === 1) {
    background(
      `${process.execPath} ${stayAliveScript} ${process.env.JARMUZ_PID_FILE}`,
    );
  } else {
    takeCoverage();
    process.exit(0);
  }
});
