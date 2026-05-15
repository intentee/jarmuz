import chokidar from "chokidar";
import { minimatch } from "minimatch";
import { nanoid } from "nanoid";

import { managePipeline } from "./manage-pipeline.mjs";
import { manageWorkers } from "./manage-workers.mjs";
import { scheduler } from "./scheduler.mjs";

/**
 * @typedef {object} JarmuzOptions
 * @property {string} [baseDirectory]
 * @property {string[]} [ignore]
 * @property {boolean} [once]
 * @property {string[]} pipeline
 * @property {string | string[]} watch
 */

/**
 * Internal shared state passed to scheduler / manage-pipeline / manage-workers.
 *
 * @typedef {object} State
 * @property {Map<string, NodeJS.Timeout>} pending
 * @property {Map<string, import("./keep-worker-alive.mjs").WorkerHandle>} workers
 */

/**
 * @typedef {object} DeciderContext
 * @property {string} baseDirectory
 * @property {boolean} initial
 * @property {(pattern: string) => boolean} matches
 * @property {(name: string) => void} schedule
 */

/**
 * @typedef {(context: DeciderContext) => void} Decider
 */

/**
 * @param {JarmuzOptions} options
 */
export function jarmuz({
  baseDirectory = process.cwd(),
  ignore = [],
  once = false,
  pipeline,
  watch,
}) {
  /** @type {State} */
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
          !pipelineManager.scheduleSuccessor(baseDirectory, buildId, name) &&
          once
        ) {
          workers.stopAll();
        }
      },
    });
  }

  return {
    /** @param {Decider} decider */
    decide(decider) {
      /** @type {Set<string>} */
      const toBeScheduled = new Set();
      const watcher = chokidar.watch(watch);

      /** @param {string} name */
      function schedule(name) {
        if (once) {
          toBeScheduled.add(name);
        } else {
          pipelineManager.schedule(baseDirectory, name, nanoid());
        }
      }

      decider({
        baseDirectory,
        initial: true,
        matches() {
          return false;
        },
        schedule,
      });

      watcher.on("all", function (_event, path) {
        if (
          ignore.some(function (pattern) {
            return minimatch(path, pattern);
          })
        ) {
          return;
        }

        decider({
          baseDirectory,
          initial: false,
          matches(pattern) {
            return minimatch(path, pattern);
          },
          schedule,
        });
      });
      watcher.on("ready", async function () {
        if (!once) {
          return;
        }

        await watcher.close();

        const buildId = nanoid();

        for (const name of toBeScheduled) {
          pipelineManager.schedule(baseDirectory, name, buildId);
        }
      });
    },
  };
}
