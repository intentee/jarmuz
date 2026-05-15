import { Worker } from "node:worker_threads";

export function createWorker(fixtureName, options = {}) {
  const worker = new Worker(
    new URL(`../fixtures/workers/${fixtureName}.mjs`, import.meta.url),
    { stdout: true, ...options },
  );

  worker.stdout.resume();

  return worker;
}
