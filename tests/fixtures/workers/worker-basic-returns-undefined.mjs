import { parentPort } from "node:worker_threads";
import { takeCoverage } from "node:v8";

import { basic } from "../../../src/job-types/index.mjs";

basic(async function () {});

parentPort.on("message", function ({ drain }) {
  if (drain) {
    takeCoverage();
    process.exit(0);
  }
});
