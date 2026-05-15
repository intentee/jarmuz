import { writeFile } from "node:fs/promises";
import { createServer } from "node:net";

await writeFile(process.argv[2], String(process.pid));

createServer().listen(0);
