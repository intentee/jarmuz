import { writeFileSync } from "node:fs";

import { jarmuz } from "../../src/index.mjs";

const pipeline = JSON.parse(process.env.JARMUZ_PIPELINE);
const watch = JSON.parse(process.env.JARMUZ_WATCH);

jarmuz({
  baseDirectory: process.env.JARMUZ_BASE_DIRECTORY,
  once: true,
  pipeline,
  watch,
}).decide(function ({ initial, matches, schedule }) {
  if (initial) {
    writeFileSync(
      process.env.JARMUZ_DECIDER_RESULT_FILE,
      JSON.stringify({ initial, matchesResult: matches("anything") }),
    );

    schedule(pipeline[0]);
  }
});
