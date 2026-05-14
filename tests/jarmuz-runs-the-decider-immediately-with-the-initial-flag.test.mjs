import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { makeConsumerProject } from "./support/consumer-project.mjs";
import { runNodeScript } from "./support/run-node-script.mjs";
import { touchFileWorkerSource } from "./support/consumer-worker-sources.mjs";

test("jarmuz runs the decider immediately with the initial flag", async function (t) {
  const consumerProject = await makeConsumerProject({
    workers: [{ name: "touch-file", source: touchFileWorkerSource }],
  });
  const resultFile = join(consumerProject.baseDirectory, "result.txt");
  const deciderResultFile = join(consumerProject.baseDirectory, "decider.json");

  t.after(function () {
    return consumerProject.cleanup();
  });

  const { closed } = runNodeScript(
    fileURLToPath(
      new URL("./fixtures/entry-once-records-context.mjs", import.meta.url),
    ),
    {
      cwd: consumerProject.baseDirectory,
      env: {
        ...process.env,
        JARMUZ_BASE_DIRECTORY: consumerProject.baseDirectory,
        JARMUZ_DECIDER_RESULT_FILE: deciderResultFile,
        JARMUZ_PIPELINE: JSON.stringify(["touch-file"]),
        JARMUZ_RESULT_FILE: resultFile,
        JARMUZ_WATCH: JSON.stringify([consumerProject.watchedDirectory]),
      },
    },
  );

  const { code } = await closed;

  assert.equal(code, 0);
  assert.deepEqual(JSON.parse(await readFile(deciderResultFile, "utf8")), {
    initial: true,
    matchesResult: false,
  });
  assert.equal(await readFile(resultFile, "utf8"), "touch-file");
});
