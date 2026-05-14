import { readFileSync, writeFileSync } from "node:fs";
import { parentPort } from "node:worker_threads";

const runCountFile = process.env.JARMUZ_RUN_COUNT_FILE;
const currentCount = Number(readFileSync(runCountFile, "utf8").trim()) + 1;

writeFileSync(runCountFile, String(currentCount));

if (currentCount === 1) {
  process.exit(1);
}

parentPort.postMessage({ ready: true, runCount: currentCount });
parentPort.on("message", function () {});
