import { parentPort } from "node:worker_threads";

parentPort.on("message", function (message) {
  parentPort.postMessage(message);
});
