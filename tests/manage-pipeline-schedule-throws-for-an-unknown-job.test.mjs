import assert from "node:assert/strict";
import { test } from "node:test";

import { managePipeline } from "../src/libs/manage-pipeline.mjs";
import { scheduler } from "../src/libs/scheduler.mjs";
import { UnknownJobError } from "../src/libs/unknown-job-error.mjs";

test("manage-pipeline schedule throws for a job that is not in the pipeline", function () {
  const state = { pending: new Map(), workers: new Map() };
  const pipeline = managePipeline(state, scheduler(state), ["compile"]);

  assert.throws(
    function () {
      pipeline.schedule("/project", "deploy", "build-1");
    },
    function (error) {
      return error instanceof UnknownJobError && error.jobName === "deploy";
    },
  );
});
