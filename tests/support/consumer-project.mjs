import { cp, mkdir, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export async function copyConsumerProject(projectName) {
  const sourceDirectory = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "fixtures",
    "projects",
    projectName,
  );

  const baseDirectory = await mkdtemp(join(tmpdir(), "jarmuz-project-"));
  const watchedDirectory = join(baseDirectory, "watched");

  await cp(sourceDirectory, baseDirectory, { recursive: true });
  await mkdir(join(baseDirectory, "node_modules"));
  await symlink(repositoryRoot, join(baseDirectory, "node_modules", "jarmuz"));
  await mkdir(watchedDirectory, { recursive: true });

  return {
    baseDirectory,
    watchedDirectory,
    async cleanup() {
      await rm(baseDirectory, { force: true, recursive: true });
    },
  };
}
