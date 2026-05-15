export function waitForMessage(emitter) {
  return new Promise(function (resolve) {
    emitter.once("message", resolve);
  });
}
