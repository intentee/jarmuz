import assert from "node:assert/strict";
import { test } from "node:test";

import { formatSubtreeList } from "../src/helpers/format-subtree-list.mjs";

test("formatSubtreeList leaves the input items array unmutated", function () {
  const items = ["c", "a", "b"];

  formatSubtreeList({ title: "assets", items });

  assert.deepEqual(items, ["c", "a", "b"]);
});
