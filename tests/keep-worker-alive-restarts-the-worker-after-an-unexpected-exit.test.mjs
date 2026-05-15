import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { keepWorkerAlive } from "../src/libs/keep-worker-alive.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";

test("keepWorkerAlive restarts the worker after an unexpected exit", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const runCountFile = join(tempDirectory.path, "run-count.txt");

  await writeFile(runCountFile, "0");

  process.env.JARMUZ_RUN_COUNT_FILE = runCountFile;

  let handle;

  t.after(async function () {
    if (handle !== undefined) {
      await handle.terminate();
    }

    delete process.env.JARMUZ_RUN_COUNT_FILE;
    await tempDirectory.cleanup();
  });

  const message = await new Promise(function (resolve) {
    handle = keepWorkerAlive({
      path: fileURLToPath(
        new URL("./fixtures/workers/worker-crashes-once.mjs", import.meta.url),
      ),
      onMessage: resolve,
      registry: childProcessRegistry(),
    });
  });

  assert.equal(message.ready, true);
  assert.equal(message.runCount, 2);
  assert.equal((await readFile(runCountFile, "utf8")).trim(), "2");
});
