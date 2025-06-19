import spawn from "cross-spawn";
import { parseArgsStringToArgv } from "string-argv";

import { basic } from "./basic.mjs";

export function spawner(build) {
  const running = new Set();

  async function abort() {
    for (const proc of running) {
      await new Promise(function (resolve) {
        console.debug(`jarmuz: Killing Process(${proc.pid})...`);

        proc.once("close", resolve);
        proc.kill("SIGKILL");
      });
    }

    running.clear();
  }

  function register(proc) {
    running.add(proc);

    proc.once("spawn", function () {
      console.debug(`jarmuz: Process(${proc.pid}) was spawned.`);
    });

    return new Promise(function (resolve) {
      proc.once("close", function (code) {
        console.debug(
          null === code
            ? `jarmuz: Process(${proc.pid}) was killed.`
            : `jarmuz: Process(${proc.pid}) exited with code ${code}.`,
        );
        running.delete(proc);

        resolve(code === 0);
      });
    });
  }

  return basic(async function ({ buildId, baseDirectory, ...rest }) {
    await abort();

    function command(exec) {
      const [command, ...args] = parseArgsStringToArgv(exec);
      const proc = spawn(command, args, {
        cwd: baseDirectory,
        stdio: "inherit",
      });

      return register(proc);
    }

    return build({
      buildId,
      baseDirectory,
      command,
      register,
      ...rest,
    });
  });
}
