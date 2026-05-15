import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { createWorker } from "./support/create-worker.mjs";
import { drainWorker } from "./support/drain-worker.mjs";
import { killProcess } from "../src/libs/kill-process.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";
import { waitForBuildResult } from "./support/wait-for-build-result.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";

test("persist keepAlive restarts the kept-alive process on a pipeline retrigger", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const pidFile = join(tempDirectory.path, "pid.txt");

  await writeFile(pidFile, "");

  const worker = createWorker("worker-persist-keepalive-restart-on-retrigger");

  let bgPid;

  t.after(async function () {
    if (bgPid !== undefined) {
      killProcess(bgPid);
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
  await waitForFileContent(pidFile, function (content) {
    return content.length > 0;
  });
  const firstPid = Number((await readFile(pidFile, "utf8")).trim());
  bgPid = firstPid;

  worker.postMessage({
    baseDirectory: tempDirectory.path,
    buildId: "build-2",
    name: "server",
  });

  await waitForBuildResult(worker);
  await waitForFileContent(pidFile, function (content) {
    const reportedPid = Number(content.trim());
    return Number.isFinite(reportedPid) && reportedPid !== firstPid;
  });
  const secondPid = Number((await readFile(pidFile, "utf8")).trim());
  bgPid = secondPid;

  assert.notEqual(secondPid, firstPid);

  await drainWorker(worker);
});
