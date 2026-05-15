/**
 * @param {{ delay: number }} options
 * @returns {Promise<void>}
 */
export async function sleep({ delay }) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, delay);
  });
}
