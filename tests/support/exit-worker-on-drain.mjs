import { parentPort } from "node:worker_threads";
import { takeCoverage } from "node:v8";

export function exitWorkerOnDrain() {
  parentPort.on("message", function ({ drain }) {
    if (drain) {
      takeCoverage();
      process.exit(0);
    }
  });
}
