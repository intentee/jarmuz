import { spawnSync } from "node:child_process";

const DEFAULT_TEST_GLOB = "tests/**/*.test.mjs";

export function checkCoverage(testGlob = DEFAULT_TEST_GLOB) {
  const result = spawnSync(
    "npx",
    ["c8", "node", "--test", "--test-timeout=1000", testGlob],
    {
      shell: false,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (null !== result.signal) {
    throw new Error(`Coverage check terminated by signal ${result.signal}`);
  }

  return result.status;
}

process.exit(checkCoverage(process.argv[2]));
