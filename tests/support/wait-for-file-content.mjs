import { watch } from "node:fs";
import { readFile } from "node:fs/promises";

export function waitForFileContent(filePath, predicate) {
  return new Promise(function (resolve, reject) {
    const watcher = watch(filePath, function () {
      check();
    });

    function check() {
      readFile(filePath, "utf8").then(
        function (content) {
          if (predicate(content)) {
            watcher.close();
            resolve(content);
          }
        },
        function (error) {
          watcher.close();
          reject(error);
        },
      );
    }

    check();
  });
}
