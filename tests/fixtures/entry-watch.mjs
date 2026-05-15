import { takeCoverage } from "node:v8";

import { jarmuz } from "../../src/index.mjs";

process.on("SIGTERM", function () {
  takeCoverage();
  process.exit(0);
});

const ignore = JSON.parse(process.env.JARMUZ_IGNORE);
const pipeline = JSON.parse(process.env.JARMUZ_PIPELINE);
const rules = JSON.parse(process.env.JARMUZ_RULES);
const watch = JSON.parse(process.env.JARMUZ_WATCH);

jarmuz({
  baseDirectory: process.env.JARMUZ_BASE_DIRECTORY,
  ignore,
  once: false,
  pipeline,
  watch,
}).decide(function ({ initial, matches, schedule }) {
  if (initial) {
    return;
  }

  for (const rule of rules) {
    if (matches(rule.pattern)) {
      schedule(rule.job);
    }
  }
});
