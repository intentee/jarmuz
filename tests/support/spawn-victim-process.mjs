import { spawn } from "node:child_process";

export function spawnVictimProcess() {
  return spawn(process.execPath, [
    "-e",
    "setInterval(function () {}, 1000000);",
  ]);
}
