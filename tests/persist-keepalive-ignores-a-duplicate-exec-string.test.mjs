import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { createWorker } from "./support/create-worker.mjs";
import { drainWorker } from "./support/drain-worker.mjs";
import { killProcess } from "./support/kill-process.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";
import { waitForMessage } from "./support/wait-for-message.mjs";

test("persist keepAlive ignores a duplicate exec string", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const lockFile = join(tempDirectory.path, "lock.txt");
  const resultFile = join(tempDirectory.path, "result.txt");
  const pidFile = join(tempDirectory.path, "pid.txt");

  await writeFile(resultFile, "");
  await writeFile(pidFile, "");

  const worker = createWorker("worker-persist-keepalive-dedup", {
    env: {
      ...process.env,
      JARMUZ_LOCK_FILE: lockFile,
      JARMUZ_RESULT_FILE: resultFile,
      JARMUZ_PID_FILE: pidFile,
    },
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

  await waitForMessage(worker);

  const result = await waitForFileContent(resultFile, function (content) {
    return content.length > 0;
  });

  assert.equal(result, "ok");

  childPid = Number(
    await waitForFileContent(pidFile, function (content) {
      return content.length > 0;
    }),
  );

  await drainWorker(worker);
});
