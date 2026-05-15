import { basename } from "node:path";
import { Worker } from "node:worker_threads";

import { TerminatedWorkerError } from "./terminated-worker-error.mjs";

/**
 * Inbound build message: jarmuż -> worker.
 *
 * @typedef {object} BuildMessage
 * @property {string} baseDirectory
 * @property {string} buildId
 * @property {string} name
 */

/**
 * Outbound build result: worker -> jarmuż.
 *
 * @typedef {object} BuildResult
 * @property {string} baseDirectory
 * @property {string} buildId
 * @property {boolean} success
 */

/**
 * Handle to a kept-alive worker thread, returned by `keepWorkerAlive`.
 *
 * @typedef {object} WorkerHandle
 * @property {(data: BuildMessage) => void} postMessage
 * @property {() => Promise<number>} terminate
 */

/**
 * @param {{
 *   path: string;
 *   onMessage: (message: BuildResult) => void;
 * }} options
 * @returns {WorkerHandle}
 */
export function keepWorkerAlive({ path, onMessage }) {
  const name = basename(path, ".mjs");
  const state = { isTerminated: false };

  /** @type {Worker} */
  let worker;

  function spawnWorker() {
    worker = new Worker(path, {
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
        spawnWorker();
      }
    });
    worker.on("message", onMessage);

    state.isTerminated = false;
  }

  spawnWorker();

  return Object.freeze({
    /** @param {BuildMessage} data */
    postMessage(data) {
      if (state.isTerminated) {
        throw new TerminatedWorkerError(name);
      }

      worker.postMessage(data);
    },
    terminate() {
      state.isTerminated = true;
      worker.off("message", onMessage);

      return worker.terminate();
    },
  });
}
