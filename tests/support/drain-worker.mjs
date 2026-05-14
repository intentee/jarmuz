import { once } from "node:events";

export async function drainWorker(worker) {
  worker.postMessage({ drain: true });

  await once(worker, "exit");
}
