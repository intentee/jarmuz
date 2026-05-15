/** @param {number} pid */
export function killProcess(pid) {
  try {
    process.kill(pid, "SIGTERM");
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code !== "ESRCH") {
      throw error;
    }
  }
}
