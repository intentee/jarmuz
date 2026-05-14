import { parentPort } from "node:worker_threads";

parentPort.on("message", function ({ baseDirectory, buildId }) {
  parentPort.postMessage({ baseDirectory, buildId, success: false });
});
