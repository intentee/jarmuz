import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { keepWorkerAlive } from "../src/libs/keep-worker-alive.mjs";
import { killProcess } from "../src/libs/kill-process.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";
import { waitForPidGone } from "./support/wait-for-pid-gone.mjs";

test("keep-worker-alive terminate reaps the worker's background child", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const pidFile = join(tempDirectory.path, "pid.txt");

  await writeFile(pidFile, "");

  let bgPid;

  t.after(async function () {
    if (bgPid !== undefined) {
      killProcess(bgPid);
    }
    await tempDirectory.cleanup();
  });

  const registry = childProcessRegistry();

  let resolveBuildResult;
  const buildResultPromise = new Promise(function (resolve) {
    resolveBuildResult = resolve;
  });

  const handle = keepWorkerAlive({
    onMessage(message) {
      resolveBuildResult(message);
    },
    path: fileURLToPath(
      new URL(
        "./fixtures/workers/worker-spawner-background-pid.mjs",
        import.meta.url,
      ),
    ),
    registry,
  });

  handle.postMessage({
    baseDirectory: tempDirectory.path,
    buildId: "build-1",
    name: "build",
  });

  await buildResultPromise;
  await waitForFileContent(pidFile, function (content) {
    return content.length > 0;
  });

  bgPid = Number((await readFile(pidFile, "utf8")).trim());

  await handle.terminate();
  await waitForPidGone(bgPid);
});
