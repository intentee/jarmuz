import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function makeTempDirectory() {
  const path = await mkdtemp(join(tmpdir(), "jarmuz-test-"));

  return {
    path,
    async cleanup() {
      await rm(path, { force: true, recursive: true });
    },
  };
}
