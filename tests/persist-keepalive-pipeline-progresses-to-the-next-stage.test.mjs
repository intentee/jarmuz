import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { copyConsumerProject } from "./support/consumer-project.mjs";
import { killProcess } from "../src/libs/kill-process.mjs";
import { runNodeScript } from "./support/run-node-script.mjs";

const pidScript = fileURLToPath(
  new URL("./fixtures/scripts/write-pid-and-stay-alive.mjs", import.meta.url),
);

test("persist keepAlive pipeline progresses to the next stage", async function (t) {
  const consumerProject = await copyConsumerProject("persist-then-next");
  const pidFile = join(consumerProject.baseDirectory, "pid.txt");
  const resultFile = join(consumerProject.baseDirectory, "result.txt");

  await writeFile(pidFile, "");
  await writeFile(resultFile, "");

  let bgPid;

  t.after(async function () {
    if (bgPid !== undefined) {
      killProcess(bgPid);
    }
    await consumerProject.cleanup();
  });

  const { closed } = runNodeScript(
    fileURLToPath(new URL("./fixtures/entry-once.mjs", import.meta.url)),
    {
      cwd: consumerProject.baseDirectory,
      env: {
        ...process.env,
        JARMUZ_BASE_DIRECTORY: consumerProject.baseDirectory,
        JARMUZ_PID_FILE: pidFile,
        JARMUZ_PID_SCRIPT: pidScript,
        JARMUZ_PIPELINE: JSON.stringify(["keep-alive-server", "next"]),
        JARMUZ_RESULT_FILE: resultFile,
        JARMUZ_WATCH: JSON.stringify([consumerProject.watchedDirectory]),
      },
    },
  );

  const { code } = await closed;

  assert.equal(code, 0);
  assert.equal(await readFile(resultFile, "utf8"), "next");

  bgPid = Number((await readFile(pidFile, "utf8")).trim());
  assert.equal(Number.isFinite(bgPid), true);
});
