import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { manageWorkers } from "../src/libs/manage-workers.mjs";

test("manageWorkers invokes onSuccess and clears pending for a successful build", async function (t) {
  const baseDirectory = fileURLToPath(new URL("./fixtures", import.meta.url));
  const state = { pending: new Map(), workers: new Map() };
  const workers = manageWorkers(baseDirectory, state, childProcessRegistry());

  t.after(function () {
    workers.stopAll();
  });

  state.pending.set("reports-success", "pending");

  const succeeded = new Promise(function (resolve) {
    workers.start({
      name: "reports-success",
      onFailure: function () {},
      onSuccess: resolve,
    });
  });

  state.workers.get("reports-success").postMessage({
    baseDirectory,
    buildId: "build-1",
  });

  assert.deepEqual(await succeeded, { baseDirectory, buildId: "build-1" });
  assert.equal(state.pending.has("reports-success"), false);
});
