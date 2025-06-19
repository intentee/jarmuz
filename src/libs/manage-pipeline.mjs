function hasPendingPredecessor(state, predecessors) {
  for (const predecessor of predecessors) {
    if (state.pending.has(predecessor)) {
      return true;
    }
  }

  return false;
}

export function managePipeline(state, scheduler, pipeline) {
  function schedule(baseDirectory, name, buildId) {
    if (-1 === pipeline.indexOf(name)) {
      throw new Error(`Unknown job: ${name}`);
    }

    const predecessors = pipeline.slice(0, pipeline.indexOf(name));

    if (hasPendingPredecessor(state, predecessors)) {
      // will be executed later anyway
      return;
    }

    scheduler.unique(name, function () {
      if (hasPendingPredecessor(state, predecessors)) {
        state.pending.delete(name);
      } else {
        if (!state.workers.has(name)) {
          throw new Error(`Worker is not running: "${name}"`);
        }

        state.workers.get(name).postMessage({
          baseDirectory,
          buildId,
          name,
        });
      }
    });
  }

  return Object.freeze({
    schedule,
    scheduleSuccessor(baseDirectory, buildId, name, once) {
      const successor = pipeline[pipeline.indexOf(name) + 1];

      if ("string" === typeof successor) {
        schedule(baseDirectory, successor, buildId, once);

        return true;
      }

      return false;
    },
  });
}
