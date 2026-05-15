import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { createWorker } from "./support/create-worker.mjs";
import { drainWorker } from "./support/drain-worker.mjs";
import { killProcess } from "../src/libs/kill-process.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";
import { waitForBuildResult } from "./support/wait-for-build-result.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";

test("persist keepAlive throws on a duplicate exec within a build", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const pidFile = join(tempDirectory.path, "pid.txt");

  await writeFile(pidFile, "");

  const worker = createWorker("worker-persist-keepalive-dedup", {
    env: {
      ...process.env,
      JARMUZ_PID_FILE: pidFile,
    },
  });

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

  const result = await waitForBuildResult(worker);

  assert.equal(result.success, false);

  bgPid = Number(
    await waitForFileContent(pidFile, function (content) {
      return content.length > 0;
    }),
  );

  await drainWorker(worker);
});
