import { appendFile } from "node:fs/promises";

try {
  await appendFile(process.argv[2], "run\n");
} catch (error) {
  // The result directory is removed during test teardown; a still-running
  // restart chain may outlive it for a moment. A missing directory means the
  // test is over and there is nothing left to record.
  if (error.code !== "ENOENT") {
    throw error;
  }

  process.exit(0);
}

process.kill(process.pid, "SIGKILL");
