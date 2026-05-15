import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { makeConsumerProject } from "./support/consumer-project.mjs";
import { makeTempDirectory } from "./support/temp-directory.mjs";
import { runNodeScript } from "./support/run-node-script.mjs";
import { touchFileWorkerSource } from "./support/consumer-worker-sources.mjs";

test("jarmuz uses the provided base directory instead of the working directory", async function (t) {
  const consumerProject = await makeConsumerProject({
    workers: [{ name: "touch-file", source: touchFileWorkerSource }],
  });
  const workingDirectory = await makeTempDirectory();
  const resultFile = join(consumerProject.baseDirectory, "result.txt");

  t.after(async function () {
    await consumerProject.cleanup();
    await workingDirectory.cleanup();
  });

  const { closed } = runNodeScript(
    fileURLToPath(new URL("./fixtures/entry-once.mjs", import.meta.url)),
    {
      cwd: workingDirectory.path,
      env: {
        ...process.env,
        JARMUZ_BASE_DIRECTORY: consumerProject.baseDirectory,
        JARMUZ_PIPELINE: JSON.stringify(["touch-file"]),
        JARMUZ_RESULT_FILE: resultFile,
        JARMUZ_WATCH: JSON.stringify([consumerProject.watchedDirectory]),
      },
    },
  );

  const { code } = await closed;

  assert.equal(code, 0);
  assert.equal(await readFile(resultFile, "utf8"), "touch-file");
});
