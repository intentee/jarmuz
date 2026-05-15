import assert from "node:assert/strict";
import { test } from "node:test";

import { killProcess } from "../src/libs/kill-process.mjs";

test("killProcess re-throws errors that aren't ESRCH", function () {
  assert.throws(function () {
    killProcess(NaN);
  });
});
