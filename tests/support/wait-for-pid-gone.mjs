import { readFileSync } from "node:fs";

export function waitForPidGone(pid) {
  return new Promise(function (resolve, reject) {
    function probe() {
      try {
        process.kill(pid, 0);
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ESRCH"
        ) {
          resolve();
          return;
        }
        reject(error);
        return;
      }

      // The PID exists at the OS level. When a child of a terminated worker
      // thread dies, libuv has no live handle to drive the SIGCHLD reap, so
      // the kernel leaves it as a zombie until the parent process exits. For
      // test purposes the process is effectively gone — accept the zombie
      // state as "dead" by reading /proc/<pid>/status on Linux.
      try {
        const status = readFileSync(`/proc/${pid}/status`, "utf8");

        if (status.includes("\nState:\tZ")) {
          resolve();
          return;
        }
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          resolve();
          return;
        }
        reject(error);
        return;
      }

      setImmediate(probe);
    }

    probe();
  });
}
