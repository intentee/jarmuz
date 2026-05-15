import { UnknownJobError } from "./unknown-job-error.mjs";
import { WorkerNotRunningError } from "./worker-not-running-error.mjs";

/**
 * @param {import("./jarmuz.mjs").State} state
 * @param {string[]} predecessors
 * @returns {boolean}
 */
function hasPendingPredecessor(state, predecessors) {
  for (const predecessor of predecessors) {
    if (state.pending.has(predecessor)) {
      return true;
    }
  }

  return false;
}

/**
 * @param {import("./jarmuz.mjs").State} state
 * @param {import("./scheduler.mjs").Scheduler} scheduler
 * @param {string[]} pipeline
 */
export function managePipeline(state, scheduler, pipeline) {
  /**
   * @param {string} baseDirectory
   * @param {string} name
   * @param {string} buildId
   */
  function schedule(baseDirectory, name, buildId) {
    if (-1 === pipeline.indexOf(name)) {
      throw new UnknownJobError(name);
    }

    const predecessors = pipeline.slice(0, pipeline.indexOf(name));

    if (hasPendingPredecessor(state, predecessors)) {
      // will be executed later anyway
      return;
    }

    scheduler.debounce(name, function () {
      if (hasPendingPredecessor(state, predecessors)) {
        state.pending.delete(name);
      } else {
        const worker = state.workers.get(name);

        if (worker === undefined) {
          throw new WorkerNotRunningError(name);
        }

        worker.postMessage({
          baseDirectory,
          buildId,
          name,
        });
      }
    });
  }

  return Object.freeze({
    schedule,
    /**
     * @param {string} baseDirectory
     * @param {string} buildId
     * @param {string} name
     * @returns {boolean}
     */
    scheduleSuccessor(baseDirectory, buildId, name) {
      const successor = pipeline[pipeline.indexOf(name) + 1];

      if ("string" === typeof successor) {
        schedule(baseDirectory, successor, buildId);

        return true;
      }

      return false;
    },
  });
}
