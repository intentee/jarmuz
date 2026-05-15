import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { childProcessRegistry } from "../src/libs/child-process-registry.mjs";
import { manageWorkers } from "../src/libs/manage-workers.mjs";

test("manageWorkers invokes onFailure and clears pending for a failed build", async function (t) {
  const baseDirectory = fileURLToPath(new URL("./fixtures", import.meta.url));
  const state = { pending: new Map(), workers: new Map() };
  const workers = manageWorkers(baseDirectory, state, childProcessRegistry());

  t.after(function () {
    workers.stopAll();
  });

  state.pending.set("reports-failure", "pending");

  const failed = new Promise(function (resolve) {
    workers.start({
      name: "reports-failure",
      onFailure: resolve,
      onSuccess: function () {},
    });
  });

  state.workers.get("reports-failure").postMessage({
    baseDirectory,
    buildId: "build-1",
  });

  assert.deepEqual(await failed, { baseDirectory, buildId: "build-1" });
  assert.equal(state.pending.has("reports-failure"), false);
});
