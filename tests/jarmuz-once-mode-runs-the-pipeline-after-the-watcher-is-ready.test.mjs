import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { makeConsumerProject } from "./support/consumer-project.mjs";
import { runNodeScript } from "./support/run-node-script.mjs";
import { touchFileWorkerSource } from "./support/consumer-worker-sources.mjs";

test("jarmuz once mode runs the whole pipeline after the watcher is ready", async function (t) {
  const consumerProject = await makeConsumerProject({
    workers: [
      { name: "first", source: touchFileWorkerSource },
      { name: "second", source: touchFileWorkerSource },
    ],
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
        JARMUZ_PIPELINE: JSON.stringify(["first", "second"]),
        JARMUZ_RESULT_FILE: resultFile,
        JARMUZ_WATCH: JSON.stringify([consumerProject.watchedDirectory]),
      },
    },
  );

  const { code } = await closed;

  assert.equal(code, 0);
  assert.equal(await readFile(resultFile, "utf8"), "firstsecond");
});
