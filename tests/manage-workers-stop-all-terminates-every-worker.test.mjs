import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { manageWorkers } from "../src/libs/manage-workers.mjs";

test("manageWorkers stopAll terminates every worker and empties the registry", function () {
  const baseDirectory = fileURLToPath(new URL("./fixtures", import.meta.url));
  const state = { pending: new Map(), workers: new Map() };
  const workers = manageWorkers(baseDirectory, state);

  workers.start({
    name: "reports-success",
    onFailure: function () {},
    onSuccess: function () {},
  });
  workers.start({
    name: "reports-failure",
    onFailure: function () {},
    onSuccess: function () {},
  });

  assert.equal(state.workers.size, 2);

  workers.stopAll();

  assert.equal(state.workers.size, 0);
});
