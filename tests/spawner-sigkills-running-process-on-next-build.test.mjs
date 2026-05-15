import assert from "node:assert/strict";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { createWorker } from "./support/create-worker.mjs";
import { killProcess } from "../src/libs/kill-process.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";
import { waitForBuildResult } from "./support/wait-for-build-result.mjs";

test("spawner SIGKILLs a still-running process on the next build", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const pidFile = join(tempDirectory.path, "pid.txt");

  await writeFile(pidFile, "");

  const worker = createWorker("worker-spawner-abort", {
    env: { ...process.env, JARMUZ_PID_FILE: pidFile },
  });

  let childPid;

  t.after(async function () {
    if (childPid !== undefined) {
      killProcess(childPid);
    }

    await worker.terminate();
    await tempDirectory.cleanup();
  });

  worker.postMessage({
    baseDirectory: tempDirectory.path,
    buildId: "build-1",
    name: "server",
  });

  await waitForBuildResult(worker);

  childPid = Number(
    await waitForFileContent(pidFile, function (content) {
      return content.length > 0;
    }),
  );

  assert.doesNotThrow(function () {
    process.kill(childPid, 0);
  });

  worker.postMessage({
    baseDirectory: tempDirectory.path,
    buildId: "build-2",
    name: "server",
  });

  await once(worker, "exit");

  assert.throws(function () {
    process.kill(childPid, 0);
  });
});
