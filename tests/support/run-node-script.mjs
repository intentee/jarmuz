import { spawn } from "node:child_process";

export function runNodeScript(scriptPath, options = {}) {
  const child = spawn(process.execPath, [scriptPath], {
    stdio: ["ignore", "ignore", "inherit"],
    ...options,
  });

  const closed = new Promise(function (resolve, reject) {
    child.once("error", reject);
    child.once("close", function (code, signal) {
      resolve({ code, signal });
    });
  });

  return { child, closed };
}
