import assert from "node:assert/strict";
import { test } from "node:test";

import { formatSubtreeList } from "../src/helpers/format-subtree-list.mjs";

test("formatSubtreeList renders a sorted tree with branch and leaf prefixes", function () {
  assert.deepEqual(
    formatSubtreeList({ title: "assets", items: ["c", "a", "b"] }),
    ["└── assets:", "    ├── a", "    ├── b", "    └── c"],
  );
});
