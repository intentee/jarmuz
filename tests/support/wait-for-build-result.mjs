export function waitForBuildResult(emitter) {
  return new Promise(function (resolve) {
    function handleMessage(message) {
      if (
        message !== null &&
        typeof message === "object" &&
        message.type === "build-result"
      ) {
        emitter.off("message", handleMessage);
        resolve({
          baseDirectory: message.baseDirectory,
          buildId: message.buildId,
          success: message.success,
        });
      }
    }

    emitter.on("message", handleMessage);
  });
}
