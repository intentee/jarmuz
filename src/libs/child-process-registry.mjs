import { killProcess } from "./kill-process.mjs";
import { WorkerAlreadyRegisteredError } from "./worker-already-registered-error.mjs";
import { WorkerNotRegisteredError } from "./worker-not-registered-error.mjs";

/**
 * @typedef {object} ChildProcessRegistry
 * @property {(workerName: string) => void} registerWorker
 * @property {(workerName: string, pid: number) => void} addChild
 * @property {(workerName: string) => void} killWorker
 * @property {() => void} killAll
 */

/** @returns {ChildProcessRegistry} */
export function childProcessRegistry() {
  /** @type {Map<string, Set<number>>} */
  const byWorker = new Map();

  /** @param {string} workerName */
  function killByWorker(workerName) {
    const pids = byWorker.get(workerName);

    if (pids === undefined) {
      throw new WorkerNotRegisteredError(workerName);
    }

    for (const pid of pids) {
      killProcess(pid);
    }

    byWorker.delete(workerName);
  }

  return Object.freeze({
    /** @param {string} workerName */
    registerWorker(workerName) {
      if (byWorker.has(workerName)) {
        throw new WorkerAlreadyRegisteredError(workerName);
      }

      byWorker.set(workerName, new Set());
    },
    /**
     * @param {string} workerName
     * @param {number} pid
     */
    addChild(workerName, pid) {
      const pids = byWorker.get(workerName);

      if (pids === undefined) {
        throw new WorkerNotRegisteredError(workerName);
      }

      pids.add(pid);
    },
    /** @param {string} workerName */
    killWorker(workerName) {
      killByWorker(workerName);
    },
    killAll() {
      for (const workerName of Array.from(byWorker.keys())) {
        killByWorker(workerName);
      }
    },
  });
}
