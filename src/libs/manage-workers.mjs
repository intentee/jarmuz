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
 * @param {import("./child-process-registry.mjs").ChildProcessRegistry} registry
 */
export function manageWorkers(baseDirectory, state, registry) {
  /** @param {StartOptions} options */
  function start({ name, onFailure, onSuccess }) {
    state.workers.set(
      name,
      keepWorkerAlive({
        onMessage(rawMessage) {
          /** @type {import("./worker-port.mjs").BuildResultMessage} */
          const message = /** @type {import("./worker-port.mjs").BuildResultMessage} */ (
            rawMessage
          );

          state.pending.delete(name);

          if (message.success) {
            onSuccess({
              baseDirectory: message.baseDirectory,
              buildId: message.buildId,
            });
          } else {
            onFailure({
              baseDirectory: message.baseDirectory,
              buildId: message.buildId,
            });
          }
        },
        path: `${baseDirectory}/jarmuz/worker-${name}.mjs`,
        registry,
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
