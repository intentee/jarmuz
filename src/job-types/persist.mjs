import spawn from "cross-spawn";
import { parseArgsStringToArgv } from "string-argv";

import { basic } from "./basic.mjs";

const running = new Set();

export function persist(build) {
  function run({
    args,
    baseDirectory,
    command,
    cwd,
  }) {
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
        cwd,
      });
    });
  }

  return basic(async function ({ buildId, baseDirectory, ...rest }) {
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
        cwd: baseDirectory,
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
