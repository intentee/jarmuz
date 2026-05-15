import assert from "node:assert/strict";
import { parentPort } from "node:worker_threads";

/**
 * @typedef {object} BuildMessage
 * @property {string} baseDirectory
 * @property {string} buildId
 * @property {string} name
 */

/**
 * @typedef {object} BuildResult
 * @property {string} baseDirectory
 * @property {string} buildId
 * @property {boolean} success
 */

/**
 * @typedef {object} BuildResultMessage
 * @property {string} baseDirectory
 * @property {string} buildId
 * @property {boolean} success
 * @property {"build-result"} type
 */

/**
 * @typedef {object} ChildSpawnedMessage
 * @property {number} pid
 * @property {"child-spawned"} type
 */

/**
 * @typedef {BuildResultMessage | ChildSpawnedMessage} WorkerMessage
 */

/**
 * @typedef {object} WorkerPort
 * @property {(result: BuildResult) => void} postBuildResult
 * @property {(pid: number) => void} postChildSpawned
 * @property {(handler: (message: BuildMessage) => void) => void} onMessage
 */

/** @returns {WorkerPort} */
export function workerPort() {
  assert(parentPort, "workerPort() must run in a worker thread");

  const port = parentPort;

  return Object.freeze({
    /** @param {BuildResult} result */
    postBuildResult({ baseDirectory, buildId, success }) {
      port.postMessage({
        baseDirectory,
        buildId,
        success,
        type: "build-result",
      });
    },
    /** @param {number} pid */
    postChildSpawned(pid) {
      port.postMessage({
        pid,
        type: "child-spawned",
      });
    },
    /** @param {(message: BuildMessage) => void} handler */
    onMessage(handler) {
      port.on("message", handler);
    },
  });
}
