import { createWorker } from "./create-worker.mjs";
import { drainWorker } from "./drain-worker.mjs";
import { waitForBuildResult } from "./wait-for-build-result.mjs";

export async function runWorkerBuild(fixtureName, message, options = {}) {
  const worker = createWorker(fixtureName, options);

  worker.postMessage(message);

  const result = await waitForBuildResult(worker);

  await drainWorker(worker);

  return result;
}
