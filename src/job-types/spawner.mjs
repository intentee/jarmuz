import spawn from "cross-spawn";
import { exec as nodeExec } from "node:child_process";
import { parseArgsStringToArgv } from "string-argv";

import { basic } from "./basic.mjs";

export function spawner(build) {
  let abortController = new AbortController();
  const running = new Set();

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

  function register({ background, proc }) {
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

    function registerProc({ background, exec }) {
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

    function background(exec) {
      return registerProc({ background: true, exec });
    }

    function command(exec) {
      return registerProc({ background: false, exec });
    }

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
