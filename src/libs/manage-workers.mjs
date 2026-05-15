import { keepWorkerAlive } from "./keep-worker-alive.mjs";

/**
 * The identifying portion of a build result, passed to onSuccess / onFailure.
 *
 * @typedef {object} BuildOutcome
 * @property {string} baseDirectory
 * @property {string} buildId
 */

/**
 * @typedef {object} StartOptions
 * @property {string} name
 * @property {(outcome: BuildOutcome) => void} onFailure
 * @property {(outcome: BuildOutcome) => void} onSuccess
 */

/**
 * @param {string} baseDirectory
 * @param {import("./jarmuz.mjs").State} state
 */
export function manageWorkers(baseDirectory, state) {
  /** @param {StartOptions} options */
  function start({ name, onFailure, onSuccess }) {
    state.workers.set(
      name,
      keepWorkerAlive({
        path: `${baseDirectory}/jarmuz/worker-${name}.mjs`,
        onMessage({ baseDirectory, buildId, success }) {
          state.pending.delete(name);

          if (success) {
            onSuccess({ baseDirectory, buildId });
          } else {
            onFailure({ baseDirectory, buildId });
          }
        },
      }),
    );
  }

  function stopAll() {
    for (const worker of state.workers.values()) {
      worker.terminate();
    }

    state.workers.clear();
  }

  return Object.freeze({
    start,
    stopAll,
  });
}
