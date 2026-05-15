import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { makeTempDirectory } from "./support/temp-directory.mjs";
import { runWorkerBuild } from "./support/run-worker-build.mjs";

test("spawner rejects exec when the command fails", async function (t) {
  const tempDirectory = await makeTempDirectory();
  const resultFile = join(tempDirectory.path, "result.txt");

  t.after(async function () {
    await tempDirectory.cleanup();
  });

  await runWorkerBuild(
    "worker-spawner-exec-failure",
    { baseDirectory: tempDirectory.path, buildId: "build-1", name: "probe" },
    { env: { ...process.env, JARMUZ_RESULT_FILE: resultFile } },
  );

  assert.equal(await readFile(resultFile, "utf8"), "rejected");
});
