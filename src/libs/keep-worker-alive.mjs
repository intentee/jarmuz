import { basename } from "node:path";
import { Worker } from "node:worker_threads";

import { TerminatedWorkerError } from "./terminated-worker-error.mjs";

/**
 * Handle to a kept-alive worker thread, returned by `keepWorkerAlive`.
 *
 * @typedef {object} WorkerHandle
 * @property {(data: import("./worker-port.mjs").BuildMessage) => void} postMessage
 * @property {() => Promise<number>} terminate
 */

/**
 * @param {{
 *   onMessage: (message: unknown) => void;
 *   path: string;
 *   registry: import("./child-process-registry.mjs").ChildProcessRegistry;
 * }} options
 * @returns {WorkerHandle}
 */
export function keepWorkerAlive({ onMessage, path, registry }) {
  const name = basename(path, ".mjs");
  let isTerminated = false;

  /** @type {Worker} */
  let worker;

  function spawnWorker() {
    worker = new Worker(path, {
      name,
    });
    registry.registerWorker(name);

    worker.once("exit", function (code) {
      console.error(
        isTerminated
          ? `jarmuz: Worker(${name}) terminated with exit code ${code}.`
          : `jarmuz: Worker(${name}) stopped with exit code ${code}. Restarting...`,
      );
      worker.off("message", dispatch);
      registry.killWorker(name);

      if (!isTerminated) {
        spawnWorker();
      }
    });
    worker.on("message", dispatch);

    isTerminated = false;
  }

  /** @param {unknown} rawMessage */
  function dispatch(rawMessage) {
    /** @type {{ type?: string; pid: number }} */
    const message = /** @type {{ type?: string; pid: number }} */ (rawMessage);

    if (message.type === "child-spawned") {
      registry.addChild(name, message.pid);

      return;
    }

    onMessage(rawMessage);
  }

  spawnWorker();

  return Object.freeze({
    /** @param {import("./worker-port.mjs").BuildMessage} data */
    postMessage(data) {
      if (isTerminated) {
        throw new TerminatedWorkerError(name);
      }

      worker.postMessage(data);
    },
    terminate() {
      isTerminated = true;
      worker.off("message", dispatch);

      return worker.terminate();
    },
  });
}
