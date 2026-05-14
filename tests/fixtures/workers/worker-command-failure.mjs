import { parentPort } from "node:worker_threads";
import { takeCoverage } from "node:v8";

import { command } from "../../../src/job-types/command.mjs";

command("false");

parentPort.on("message", function ({ drain }) {
  if (drain) {
    takeCoverage();
    process.exit(0);
  }
});
