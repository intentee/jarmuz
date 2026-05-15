import assert from "node:assert/strict";
import spawn from "cross-spawn";
import { exec as nodeExec } from "node:child_process";
import { parseArgsStringToArgv } from "string-argv";

import { workerPort } from "../libs/worker-port.mjs";
import { basic } from "./basic.mjs";

/**
 * @typedef {import("./basic.mjs").BasicContext & {
 *   background: (exec: string) => Promise<void>;
 *   command: (exec: string) => Promise<boolean | void>;
 *   exec: (cmd: string) => Promise<{ stderr: string; stdout: string }>;
 *   register: (input: {
 *     background: boolean;
 *     proc: import("node:child_process").ChildProcess;
 *   }) => Promise<boolean | void>;
 * }} SpawnerContext
 */

/**
 * @param {(context: SpawnerContext) => unknown} build
 */
export function spawner(build) {
  const port = workerPort();

  let abortController = new AbortController();
  /** @type {Set<import("node:child_process").ChildProcess>} */
  const running = new Set();

  /** @returns {Promise<void>} */
  async function abort() {
    abortController.abort();
    abortController = new AbortController();

    for (const proc of running) {
      await new Promise(function (resolve) {
        console.debug(`jarmuz: Killing Process(${proc.pid})...`);

        proc.once("close", resolve);
        proc.kill("SIGKILL");
      });
    }

    running.clear();
  }

  /**
   * @param {{
   *   background: boolean;
   *   proc: import("node:child_process").ChildProcess;
   * }} input
   * @returns {Promise<boolean | void>}
   */
  function register({ background, proc }) {
    running.add(proc);

    const pid = proc.pid;

    assert(typeof pid === "number");

    console.debug(`jarmuz: Process(${pid}) was spawned.`);
    port.postChildSpawned(pid);

    return new Promise(function (resolve) {
      proc.once("close", function (code) {
        console.debug(
          null === code
            ? `jarmuz: Process(${proc.pid}) was killed.`
            : `jarmuz: Process(${proc.pid}) exited with code ${code}.`,
        );
        running.delete(proc);

        if (!background) {
          resolve(code === 0);
        }
      });

      if (background) {
        resolve();
      }
    });
  }

  return basic(async function ({ buildId, baseDirectory, ...rest }) {
    await abort();

    /**
     * @param {{ background: boolean; exec: string }} input
     * @returns {Promise<boolean | void>}
     */
    function spawnAndRegister({ background, exec }) {
      const [command, ...args] = parseArgsStringToArgv(exec);
      const proc = spawn(command, args, {
        cwd: baseDirectory,
        stdio: "inherit",
      });

      return register({
        background,
        proc,
      });
    }

    /**
     * @param {string} exec
     * @returns {Promise<void>}
     */
    async function background(exec) {
      await spawnAndRegister({ background: true, exec });
    }

    /**
     * @param {string} exec
     * @returns {Promise<boolean | void>}
     */
    function command(exec) {
      return spawnAndRegister({ background: false, exec });
    }

    /**
     * @param {string} command
     * @returns {Promise<{ stderr: string; stdout: string }>}
     */
    function exec(command) {
      return new Promise(function (resolve, reject) {
        nodeExec(
          command,
          {
            cwd: baseDirectory,
            encoding: "utf-8",
            signal: abortController.signal,
          },
          function (error, stdout, stderr) {
            if (error) {
              reject(error);
            } else {
              resolve({
                stderr,
                stdout,
              });
            }
          },
        );
      });
    }

    return build({
      background,
      baseDirectory,
      buildId,
      command,
      exec,
      register,
      ...rest,
    });
  });
}
