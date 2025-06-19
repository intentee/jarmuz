import { basename } from "node:path";
import { Worker } from "node:worker_threads";

function spawnWorker(state, path, name, onMessage) {
  const worker = new Worker(path, {
    name,
  });

  worker.once("exit", function (code) {
    console.error(
      state.isTerminated
        ? `jarmuz: Worker(${name}) terminated with exit code ${code}.`
        : `jarmuz: Worker(${name}) stopped with exit code ${code}. Restarting...`,
    );
    worker.off("message", onMessage);

    if (!state.isTerminated) {
      spawnWorker(state, path, name, onMessage);
    }
  });
  worker.on("message", onMessage);

  state.isTerminated = false;
  state.worker = worker;
}

export function keepWorkerAlive({ path, onMessage }) {
  const name = basename(path, ".mjs");
  const state = {
    isTerminated: false,
    worker: null,
  };

  spawnWorker(state, path, name, onMessage);

  return Object.freeze({
    postMessage(data) {
      if (state.isTerminated) {
        throw new Error(`Worker(${name}) is terminated`);
      } else if (!state.worker) {
        throw new Error(`Worker(${name}) is not ready`);
      } else {
        state.worker.postMessage(data);
      }
    },
    terminate() {
      state.isTerminated = true;
      state.worker.off("message", onMessage);
      state.worker.terminate();
    },
  });
}
