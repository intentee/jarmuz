import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { copyConsumerProject } from "./support/consumer-project.mjs";
import { runNodeScript } from "./support/run-node-script.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";

test("jarmuz watch mode skips changes that match the ignore patterns", async function (t) {
  const consumerProject = await copyConsumerProject("trigger-job");
  const resultFile = join(consumerProject.baseDirectory, "result.txt");

  await writeFile(resultFile, "");
  await writeFile(join(consumerProject.watchedDirectory, "a.ignored"), "");
  await writeFile(join(consumerProject.watchedDirectory, "b.trigger"), "");

  const { child, closed } = runNodeScript(
    fileURLToPath(new URL("./fixtures/entry-watch.mjs", import.meta.url)),
    {
      cwd: consumerProject.baseDirectory,
      env: {
        ...process.env,
        JARMUZ_BASE_DIRECTORY: consumerProject.baseDirectory,
        JARMUZ_IGNORE: JSON.stringify(["**/*.ignored"]),
        JARMUZ_PIPELINE: JSON.stringify(["trigger-job"]),
        JARMUZ_RESULT_FILE: resultFile,
        JARMUZ_RULES: JSON.stringify([
          { pattern: "**/*.ignored", job: "ignored-job" },
          { pattern: "**/*.trigger", job: "trigger-job" },
        ]),
        JARMUZ_WATCH: JSON.stringify(["watched"]),
      },
    },
  );

  t.after(async function () {
    child.kill();
    await closed;
    await consumerProject.cleanup();
  });

  const content = await waitForFileContent(resultFile, function (text) {
    return text.length > 0;
  });

  assert.equal(content, "trigger-job");
});
