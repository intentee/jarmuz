import chokidar from "chokidar";
import { minimatch } from "minimatch";
import { randomUUID } from "node:crypto";

import { managePipeline } from "./manage-pipeline.mjs";
import { manageWorkers } from "./manage-workers.mjs";
import { scheduler } from "./scheduler.mjs";

export function jarmuz({
  baseDirectory = process.cwd(),
  ignore = [],
  once = false,
  pipeline,
  watch,
}) {
  const state = {
    pending: new Map(),
    workers: new Map(),
  };

  const schedule = scheduler(state);
  const workers = manageWorkers(baseDirectory, state);
  const pipelineManager = managePipeline(state, schedule, pipeline);

  for (const name of pipeline) {
    workers.start({
      name,
      onFailure() {
        if (once) {
          workers.stopAll();

          process.exit(1);
        }
      },
      onSuccess({ baseDirectory, buildId }) {
        if (
          !pipelineManager.scheduleSuccessor(
            baseDirectory,
            buildId,
            name,
            once,
          ) &&
          once
        ) {
          workers.stopAll();
        }
      },
    });
  }

  return {
    decide(decider) {
      const toBeScheduled = new Set();
      const watcher = chokidar.watch(watch);

      watcher.on("all", function (event, path) {
        if (
          ignore.some(function (pattern) {
            return minimatch(path, pattern);
          })
        ) {
          return;
        }

        decider({
          baseDirectory: baseDirectory,
          matches(pattern) {
            return minimatch(path, pattern);
          },
          path: path,
          schedule(name) {
            if (once) {
              toBeScheduled.add(name);
            } else {
              pipelineManager.schedule(baseDirectory, name, randomUUID(), once);
            }
          },
        });
      });
      watcher.on("ready", async function () {
        if (!once) {
          return;
        }

        await watcher.close();

        const buildId = randomUUID();

        for (const name of toBeScheduled) {
          pipelineManager.schedule(baseDirectory, name, buildId, once);
        }
      });
    },
  };
}
