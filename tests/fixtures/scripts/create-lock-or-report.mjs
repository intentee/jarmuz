import { appendFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";

const [, , lockFile, resultFile, pidFile] = process.argv;

try {
  await writeFile(lockFile, "", { flag: "wx" });
  await writeFile(pidFile, String(process.pid));
  await appendFile(resultFile, "ok");

  createServer().listen(0);
} catch (error) {
  await appendFile(resultFile, error.code === "EEXIST" ? "conflict" : "error");
}
