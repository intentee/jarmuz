import { jarmuz } from "../../src/index.mjs";

const pipeline = JSON.parse(process.env.JARMUZ_PIPELINE);
const watch = JSON.parse(process.env.JARMUZ_WATCH);

const baseDirectoryOption =
  process.env.JARMUZ_BASE_DIRECTORY === undefined
    ? {}
    : { baseDirectory: process.env.JARMUZ_BASE_DIRECTORY };

jarmuz({
  ...baseDirectoryOption,
  once: true,
  pipeline,
  watch,
}).decide(function ({ initial, schedule }) {
  if (initial) {
    schedule(pipeline[0]);
  }
});
