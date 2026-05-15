import { writeFile } from "node:fs/promises";
import { createServer } from "node:net";

const server = createServer();
server.listen(0);

process.on("SIGTERM", function () {
  setTimeout(function () {
    server.close();
    process.exit(0);
  }, 100);
});

await writeFile(process.argv[2], String(process.pid));
