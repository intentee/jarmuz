import { keepWorkerAlive } from "./keep-worker-alive.mjs";

export function manageWorkers(baseDirectory, state) {
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
