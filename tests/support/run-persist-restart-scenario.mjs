import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { createWorker } from "./create-worker.mjs";
import { drainWorker } from "./drain-worker.mjs";
import { makeTempDirectory } from "./temp-directory.mjs";
import { waitForFileContent } from "./wait-for-file-content.mjs";
import { waitForMessage } from "./wait-for-message.mjs";

export async function runPersistRestartScenario(t, fixtureName) {
  const tempDirectory = await makeTempDirectory();
  const resultFile = join(tempDirectory.path, "result.txt");

  await writeFile(resultFile, "");

  const worker = createWorker(fixtureName, {
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
}
