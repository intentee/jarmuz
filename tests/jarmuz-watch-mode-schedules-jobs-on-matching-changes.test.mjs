import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { makeConsumerProject } from "./support/consumer-project.mjs";
import { runNodeScript } from "./support/run-node-script.mjs";
import { touchFileWorkerSource } from "./support/consumer-worker-sources.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";

test("jarmuz watch mode schedules jobs on changes that match a pattern", async function (t) {
  const consumerProject = await makeConsumerProject({
    workers: [{ name: "touch-file", source: touchFileWorkerSource }],
  });
  const resultFile = join(consumerProject.baseDirectory, "result.txt");

  await writeFile(resultFile, "");
  await writeFile(join(consumerProject.watchedDirectory, "style.css"), "");

  const { child, closed } = runNodeScript(
    fileURLToPath(new URL("./fixtures/entry-watch.mjs", import.meta.url)),
    {
      cwd: consumerProject.baseDirectory,
      env: {
        ...process.env,
        JARMUZ_BASE_DIRECTORY: consumerProject.baseDirectory,
        JARMUZ_IGNORE: JSON.stringify([]),
        JARMUZ_PIPELINE: JSON.stringify(["touch-file"]),
        JARMUZ_RESULT_FILE: resultFile,
        JARMUZ_RULES: JSON.stringify([
          { pattern: "**/*.css", job: "touch-file" },
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

  await waitForFileContent(resultFile, function (content) {
    return content === "touch-file";
  });
});
