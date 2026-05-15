import spawn from "cross-spawn";
import { parseArgsStringToArgv } from "string-argv";

import { basic } from "./basic.mjs";

/**
 * @typedef {import("./basic.mjs").BasicContext & {
 *   keepAlive: (exec: string) => void;
 * }} PersistContext
 */

/** @type {Set<string>} */
const running = new Set();

/**
 * @param {(context: PersistContext) => unknown} build
 */
export function persist(build) {
  /**
   * @param {{ args: string[]; baseDirectory: string; command: string }} input
   */
  function run({ args, baseDirectory, command }) {
    const proc = spawn(command, args, {
      cwd: baseDirectory,
      stdio: "inherit",
    });

    proc.once("spawn", function () {
      console.debug(`jarmuz: Process(${proc.pid}) was spawned.`);
    });

    proc.once("close", function (code) {
      console.debug(
        null === code
          ? `jarmuz: Process(${proc.pid}) was killed; restarting`
          : `jarmuz: Process(${proc.pid}) exited with code ${code}; restarting`,
      );

      run({
        args,
        baseDirectory,
        command,
      });
    });
  }

  return basic(async function ({ buildId, baseDirectory, ...rest }) {
    /** @param {string} exec */
    function keepAlive(exec) {
      if (running.has(exec)) {
        return;
      }

      running.add(exec);

      const [command, ...args] = parseArgsStringToArgv(exec);

      return run({
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
