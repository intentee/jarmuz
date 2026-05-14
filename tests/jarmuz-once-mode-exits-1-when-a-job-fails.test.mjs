import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { makeConsumerProject } from "./support/consumer-project.mjs";
import { runNodeScript } from "./support/run-node-script.mjs";
import { failingWorkerSource } from "./support/consumer-worker-sources.mjs";

test("jarmuz once mode exits with code 1 when a job fails", async function (t) {
  const consumerProject = await makeConsumerProject({
    workers: [{ name: "bad", source: failingWorkerSource }],
  });
  const resultFile = join(consumerProject.baseDirectory, "result.txt");

  t.after(function () {
    return consumerProject.cleanup();
  });

  const { closed } = runNodeScript(
    fileURLToPath(new URL("./fixtures/entry-once.mjs", import.meta.url)),
    {
      cwd: consumerProject.baseDirectory,
      env: {
        ...process.env,
        JARMUZ_BASE_DIRECTORY: consumerProject.baseDirectory,
        JARMUZ_PIPELINE: JSON.stringify(["bad"]),
        JARMUZ_RESULT_FILE: resultFile,
        JARMUZ_WATCH: JSON.stringify([consumerProject.watchedDirectory]),
      },
    },
  );

  const { code } = await closed;

  assert.equal(code, 1);
});
