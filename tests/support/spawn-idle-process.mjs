import { spawn } from "node:child_process";

export function spawnIdleProcess() {
  return spawn(process.execPath, [
    "-e",
    "setInterval(function () {}, 1000000);",
  ]);
}
