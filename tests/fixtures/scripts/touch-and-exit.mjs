import { writeFile } from "node:fs/promises";

await writeFile(process.argv[2], "started");
