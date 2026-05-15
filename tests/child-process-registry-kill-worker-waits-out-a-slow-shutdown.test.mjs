import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";

const delayedShutdownScript = fileURLToPath(
  new URL("./fixtures/scripts/delayed-shutdown-on-sigterm.mjs", import.meta.url),
);

test("child-process-registry kill-worker waits out a child with a slow SIGTERM shutdown", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const pidFile = join(tempDirectory.path, "pid.txt");

  await writeFile(pidFile, "");

  t.after(function () {
    return tempDirectory.cleanup();
  });

  const delayedShutdownProcess = spawn(process.execPath, [
    delayedShutdownScript,
    pidFile,
  ]);

  t.after(function () {
    if (
      delayedShutdownProcess.exitCode === null &&
      delayedShutdownProcess.signalCode === null
    ) {
      delayedShutdownProcess.kill("SIGKILL");
    }
  });

  await once(delayedShutdownProcess, "spawn");
  assert.equal(typeof delayedShutdownProcess.pid, "number");

  await waitForFileContent(pidFile, function (content) {
    return content.length > 0;
  });
  const reportedPid = Number((await readFile(pidFile, "utf8")).trim());
  assert.equal(reportedPid, delayedShutdownProcess.pid);

  const registry = childProcessRegistry();
  registry.registerWorker("delayed-worker");
  registry.addChild("delayed-worker", delayedShutdownProcess.pid);

  const start = process.hrtime.bigint();
  registry.killWorker("delayed-worker");

  await once(delayedShutdownProcess, "exit");
  const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;

  assert.equal(delayedShutdownProcess.exitCode, 0);
  assert.equal(delayedShutdownProcess.signalCode, null);
  assert.ok(
    elapsedMs >= 90,
    "expected the delayed-shutdown process to take ~100ms to shut down after SIGTERM (got " +
      elapsedMs +
      "ms)",
  );
});
