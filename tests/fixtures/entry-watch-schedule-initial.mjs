import { jarmuz } from "../../src/index.mjs";

const pipeline = JSON.parse(process.env.JARMUZ_PIPELINE);
const watch = JSON.parse(process.env.JARMUZ_WATCH);

jarmuz({
  baseDirectory: process.env.JARMUZ_BASE_DIRECTORY,
  once: false,
  pipeline,
  watch,
}).decide(function ({ initial, schedule }) {
  if (initial) {
    schedule(pipeline[0]);
  }
});
