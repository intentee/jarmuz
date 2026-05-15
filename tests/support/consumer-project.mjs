import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export async function makeConsumerProject({ workers }) {
  const baseDirectory = await mkdtemp(join(tmpdir(), "jarmuz-project-"));
  const watchedDirectory = join(baseDirectory, "watched");

  await mkdir(join(baseDirectory, "jarmuz"));
  await mkdir(join(baseDirectory, "node_modules"));
  await mkdir(watchedDirectory);
  await symlink(repositoryRoot, join(baseDirectory, "node_modules", "jarmuz"));

  for (const { name, source } of workers) {
    await writeFile(
      join(baseDirectory, "jarmuz", `worker-${name}.mjs`),
      source,
    );
  }

  return {
    baseDirectory,
    watchedDirectory,
    async cleanup() {
      await rm(baseDirectory, { force: true, recursive: true });
    },
  };
}
