import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { copyConsumerProject } from "./support/consumer-project.mjs";
import { killProcess } from "../src/libs/kill-process.mjs";
import { runNodeScript } from "./support/run-node-script.mjs";
import { waitForFileContent } from "./support/wait-for-file-content.mjs";
import { waitForPidGone } from "./support/wait-for-pid-gone.mjs";

const pidScript = fileURLToPath(
  new URL("./fixtures/scripts/write-pid-and-stay-alive.mjs", import.meta.url),
);

test("spawner background process dies when jarmuz exits on SIGTERM", async function (t) {
  const consumerProject = await copyConsumerProject("spawner-background");
  const pidFile = join(consumerProject.baseDirectory, "pid.txt");

  await writeFile(pidFile, "");

  let bgPid;

  t.after(async function () {
    if (bgPid !== undefined) {
      killProcess(bgPid);
    }
    await consumerProject.cleanup();
  });

  const { child, closed } = runNodeScript(
    fileURLToPath(
      new URL("./fixtures/entry-watch-schedule-initial.mjs", import.meta.url),
    ),
    {
      cwd: consumerProject.baseDirectory,
      env: {
        ...process.env,
        JARMUZ_BASE_DIRECTORY: consumerProject.baseDirectory,
        JARMUZ_PID_FILE: pidFile,
        JARMUZ_PID_SCRIPT: pidScript,
        JARMUZ_PIPELINE: JSON.stringify(["build"]),
        JARMUZ_WATCH: JSON.stringify([consumerProject.watchedDirectory]),
      },
    },
  );

  await waitForFileContent(pidFile, function (content) {
    return content.length > 0;
  });
  bgPid = Number((await readFile(pidFile, "utf8")).trim());
  assert.equal(Number.isFinite(bgPid), true);

  child.kill("SIGTERM");
  await closed;

  await waitForPidGone(bgPid);
});
