import assert from "node:assert/strict";
import spawn from "cross-spawn";
import { parseArgsStringToArgv } from "string-argv";

import { DuplicateKeepAliveError } from "../libs/duplicate-keep-alive-error.mjs";
import { workerPort } from "../libs/worker-port.mjs";
import { basic } from "./basic.mjs";

/**
 * @typedef {import("./basic.mjs").BasicContext & {
 *   keepAlive: (exec: string) => void;
 * }} PersistContext
 */

/**
 * @param {(context: PersistContext) => unknown} build
 */
export function persist(build) {
  const port = workerPort();

  /** @type {Set<import("node:child_process").ChildProcess>} */
  const runningProcesses = new Set();
  /** @type {WeakSet<import("node:child_process").ChildProcess>} */
  const intentionallyKilled = new WeakSet();

  /**
   * @param {{ args: string[]; baseDirectory: string; command: string }} input
   */
  function startWithRestart({ args, baseDirectory, command }) {
    const proc = spawn(command, args, {
      cwd: baseDirectory,
      stdio: "inherit",
    });

    runningProcesses.add(proc);

    const pid = proc.pid;

    assert(typeof pid === "number");

    console.debug(`jarmuz: Process(${pid}) was spawned.`);
    port.postChildSpawned(pid);

    proc.once("close", function (code) {
      runningProcesses.delete(proc);

      if (intentionallyKilled.has(proc)) {
        console.debug(`jarmuz: Process(${pid}) was killed.`);

        return;
      }

      console.debug(
        null === code
          ? `jarmuz: Process(${pid}) was killed; restarting.`
          : `jarmuz: Process(${pid}) exited with code ${code}; restarting.`,
      );

      startWithRestart({
        args,
        baseDirectory,
        command,
      });
    });
  }

  /** @returns {Promise<void>} */
  async function abort() {
    for (const proc of Array.from(runningProcesses)) {
      intentionallyKilled.add(proc);

      await new Promise(function (resolve) {
        proc.once("close", resolve);
        proc.kill("SIGTERM");
      });
    }
  }

  return basic(async function ({ buildId, baseDirectory, ...rest }) {
    await abort();

    /** @type {Set<string>} */
    const startedThisBuild = new Set();

    /** @param {string} exec */
    function keepAlive(exec) {
      if (startedThisBuild.has(exec)) {
        throw new DuplicateKeepAliveError(exec);
      }

      startedThisBuild.add(exec);

      const [command, ...args] = parseArgsStringToArgv(exec);

      startWithRestart({
        args,
        baseDirectory,
        command,
      });
    }

    return build({
      buildId,
      baseDirectory,
      keepAlive,
      ...rest,
    });
  });
}
