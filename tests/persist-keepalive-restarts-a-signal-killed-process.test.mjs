import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { createWorker } from "./support/create-worker.mjs";
import { drainWorker } from "./support/drain-worker.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";
import { waitForMessage } from "./support/wait-for-message.mjs";

test("persist keepAlive restarts a process that is killed by a signal", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const resultFile = join(tempDirectory.path, "result.txt");

  await writeFile(resultFile, "");

  const worker = createWorker("worker-persist-keepalive-signal-kill", {
    env: { ...process.env, JARMUZ_RESULT_FILE: resultFile },
  });

  t.after(async function () {
    await worker.terminate();
    await tempDirectory.cleanup();
  });

  worker.postMessage({
    baseDirectory: tempDirectory.path,
    buildId: "build-1",
    name: "server",
  });

  await waitForMessage(worker);

  await waitForFileContent(resultFile, function (content) {
    return content.split("\n").filter(Boolean).length >= 2;
  });

  await drainWorker(worker);

  assert.ok(true);
});
