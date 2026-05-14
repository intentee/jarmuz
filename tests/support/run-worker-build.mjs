import { createWorker } from "./create-worker.mjs";
import { drainWorker } from "./drain-worker.mjs";
import { waitForMessage } from "./wait-for-message.mjs";

export async function runWorkerBuild(fixtureName, message, options = {}) {
  const worker = createWorker(fixtureName, options);

  worker.postMessage(message);

  const result = await waitForMessage(worker);

  await drainWorker(worker);

  return result;
}
