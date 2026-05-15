import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { createWorker } from "./support/create-worker.mjs";
import { drainWorker } from "./support/drain-worker.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";
import { waitForMessage } from "./support/wait-for-message.mjs";

test("spawner runs a background process without waiting for it to finish", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const markerFile = join(tempDirectory.path, "marker.txt");

  await writeFile(markerFile, "");

  const worker = createWorker("worker-spawner-background", {
    env: { ...process.env, JARMUZ_MARKER_FILE: markerFile },
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

  const result = await waitForMessage(worker);

  assert.equal(result.success, true);

  await waitForFileContent(markerFile, function (content) {
    return content === "started";
  });

  await drainWorker(worker);
});
